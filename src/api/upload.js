// src/api/upload.js
// 图片上传：POST /api/activity-image（Cloud Function + Blob 存储）
// 兼容 File/Blob 与 dataURL，上传前统一压缩（最长边 1920、JPEG 0.82），
// 返回可长期访问的 URL。

const UPLOAD_URL = '/api/activity-image';
const MAX_UPLOAD = 20 * 1024 * 1024; // 压缩前原图上限（避免超大图吃内存）
// 压缩后硬上限。EdgeOne 回源/带宽限制明显，图片越小加载越稳
const MAX_BYTES = 500 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 逐级降尺寸 + 降质量，直到落进 MAX_BYTES（大多数截图第一档就过了）
const EDGE_STEPS = [1920, 1600, 1280, 1024, 800];
const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.55];
const SKIP_BELOW = 300 * 1024; // 尺寸达标且小于此体积时不重编码，避免二次损失

// 兼容浏览器/系统偶尔给出的非标准 MIME
function isAllowedType(type) {
  const t = (type || '').toLowerCase();
  return ALLOWED.indexOf(t) >= 0 || t === 'image/jpg' || t === 'image/pjpeg';
}

function checkFile(file) {
  if (!isAllowedType(file.type)) {
    throw new Error('仅支持 JPG/PNG/WebP/GIF 图片');
  }
  if (file.size > MAX_UPLOAD) {
    throw new Error('原图不能超过 20MB');
  }
}

/** 把 dataURL 转成 Blob */
export function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('图片格式错误');
  const mime = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片解码失败'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => {
    if (typeof canvas.toBlob !== 'function') return resolve(null);
    canvas.toBlob(resolve, type, quality);
  });
}

function toJpgName(name) {
  const base = String(name || 'image').replace(/\.[^./\\]+$/, '');
  return (base || 'image') + '.jpg';
}

/**
 * 压缩图片：逐级降低尺寸与质量，直到不超过 MAX_BYTES。
 * GIF 可能是动图，canvas 处理会丢帧，保持原样。
 * 任何异常/无收益的情况都退回原文件，不阻塞上传。
 * @returns {Promise<{blob: Blob, name: string}>}
 */
async function compressImage(file, name) {
  const type = (file.type || '').toLowerCase();

  // 动图不能走 canvas；也没有 document 时（SSR/测试）直接原样返回
  if (type === 'image/gif' || typeof document === 'undefined') {
    return { blob: file, name };
  }

  let img;
  try {
    img = await loadImage(file);
  } catch (e) {
    return { blob: file, name };
  }

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) return { blob: file, name };

  const longest = Math.max(width, height);
  // 本来就够小、体积也不大，没必要重新编码
  if (longest <= EDGE_STEPS[0] && file.size <= SKIP_BELOW) return { blob: file, name };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: file, name };

  let best = null;
  let prevW = 0;
  let prevH = 0;

  for (let i = 0; i < EDGE_STEPS.length; i++) {
    const scale = Math.min(1, EDGE_STEPS[i] / longest);
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));
    // 原图本身比该档还小，尺寸不会再变，跳过重复绘制
    if (targetW === prevW && targetH === prevH) continue;
    prevW = targetW;
    prevH = targetH;

    // 改 canvas 尺寸会重置 2d 上下文状态，必须重新设置
    canvas.width = targetW;
    canvas.height = targetH;
    // 透明 PNG 转 JPEG 会变黑底，先铺白底（站点背景也是白色）
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    for (let j = 0; j < QUALITY_STEPS.length; j++) {
      const blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY_STEPS[j]);
      if (!blob) continue;
      if (!best || blob.size < best.blob.size) {
        best = { blob, name: toJpgName(name) };
      }
      if (blob.size <= MAX_BYTES) {
        return { blob, name: toJpgName(name) };
      }
    }
  }

  // 压到最后仍超限：至少取最小的一版；比原图还大就退回原图
  if (best && best.blob.size < file.size) return best;
  return { blob: file, name };
}

/**
 * 上传图片（自动压缩）
 * @param {File|Blob|string} source File/Blob，或 dataURL 字符串
 * @param {string} token 管理 token
 * @returns {Promise<string>} 图片 URL
 */
export async function uploadImage(source, token) {
  if (!token) throw new Error('缺少管理凭证');

  let raw;
  let name;
  if (typeof source === 'string') {
    raw = dataUrlToBlob(source);
    name = 'image.png';
    if (!isAllowedType(raw.type)) {
      throw new Error('仅支持 JPG/PNG/WebP/GIF 图片');
    }
  } else {
    checkFile(source);
    raw = source;
    name = source.name || 'image.png';
  }

  const prepared = await compressImage(raw, name);
  if (prepared.blob.size > MAX_BYTES) {
    throw new Error(
      prepared.blob.type === 'image/gif'
        ? 'GIF 动图无法压缩，请改用 JPG/PNG，或先压到 500KB 以内'
        : '图片压缩后仍超过 500KB，请先裁剪后重试'
    );
  }

  const form = new FormData();
  form.append('file', prepared.blob, prepared.name);

  // 不要手动设置 Content-Type，交给浏览器补 boundary
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (res.status === 401) {
    throw new Error('管理凭证已失效，请刷新页面重试');
  }

  const data = await res.json().catch(() => ({ ret: 1, msg: '上传响应解析失败' }));
  if (!res.ok || data.ret !== 0 || !data.url) {
    throw new Error(data.msg || '图片上传失败');
  }
  return data.url;
}
