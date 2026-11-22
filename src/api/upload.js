// src/api/upload.js
// 图片上传：POST /api/activity-image（Cloud Function + Blob 存储）
// 兼容 File/Blob 与 dataURL，返回可长期访问的 URL。

const UPLOAD_URL = '/api/activity-image';
const MAX_SIZE = 5 * 1024 * 1024; // 与后端一致
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function checkFile(file) {
  const type = file.type || '';
  if (ALLOWED.indexOf(type) < 0) {
    throw new Error('仅支持 JPG/PNG/WebP/GIF 图片');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('图片不能超过 5MB');
  }
}

/**
 * 上传图片
 * @param {File|Blob|string} source File/Blob，或 dataURL 字符串
 * @param {string} token 管理 token
 * @returns {Promise<string>} 图片 URL
 */
export async function uploadImage(source, token) {
  if (!token) throw new Error('缺少管理凭证');

  let res;
  if (typeof source === 'string') {
    res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dataUrl: source }),
    });
  } else {
    checkFile(source);
    const form = new FormData();
    form.append('file', source, source.name || 'image.png');
    // 不要手动设置 Content-Type，交给浏览器补 boundary
    res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  }

  if (res.status === 401) {
    throw new Error('管理凭证已失效，请刷新页面重试');
  }

  const data = await res.json().catch(() => ({ ret: 1, msg: '上传响应解析失败' }));
  if (!res.ok || data.ret !== 0 || !data.url) {
    throw new Error(data.msg || '图片上传失败');
  }
  return data.url;
}

/** 把 dataURL 转成 Blob（表单式上传用，比 JSON 更省流量） */
export function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('图片格式错误');
  const mime = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
