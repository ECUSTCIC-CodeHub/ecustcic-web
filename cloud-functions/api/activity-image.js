// cloud-functions/api/activity-image.js — 封面图片上传（Node.js + Blob SDK）
//
// POST /api/activity-image
//   Content-Type: multipart/form-data 或 JSON { dataUrl }
//   Header: Authorization: Bearer <ADMIN_TOKEN>
//   返回: { ret: 0, url: "/api/activity-image?key=<key>", key }
//
// 管理面板上传封面后，将返回的 url 存入活动的 cover 字段。
import { getStore } from '@edgeone/pages-blob';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: CORS,
  });
}

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

// 兼容浏览器偶尔上报的非标准 MIME
function normalize(type) {
  const t = (type || '').split(';')[0].trim().toLowerCase();
  if (t === 'image/jpg' || t === 'image/pjpeg') return 'image/jpeg';
  if (t === 'image/x-png') return 'image/png';
  return t;
}

// 按文件头猜真实格式：上传端给的 type 不一定可信（如截图工具给空 type），
// 扩展名也可能与内容不符，读图时以字节为准。
function detectMime(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }
  return '';
}

// GET /api/activity-image?key=covers/xxx.jpg —— 读取已上传的图片
// 上传接口返回的 URL 就是这种 query 形式，必须在这里处理，
// 否则请求会落到本文件的 POST 入口而返回 404。
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  if (!key || key.includes('..')) {
    return new Response('Missing key', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const store = getStore('activity-covers');
  // 注意：不能用 getWithHeaders —— 它内部用 TextDecoder('utf-8') 解码 body，
  // 二进制图片会被损坏。读图片必须用 type: 'arrayBuffer'。
  // 用 strong 一致性，保证上传后立刻访问不会因 CDN 缓存而 404。
  const buffer = await store.get(key, { type: 'arrayBuffer', consistency: 'strong' });
  if (!buffer) {
    // 不缓存错误响应，否则 CDN/浏览器会把 404 记住很久
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const ext = key.split('.').pop().toLowerCase();
  const mime = detectMime(new Uint8Array(buffer)) || EXT_MIME[ext] || 'application/octet-stream';

  return new Response(buffer, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  // 鉴权
  const expected = context.env.ADMIN_TOKEN;
  const auth = context.request.headers.get('Authorization') || '';
  if (!expected || auth !== `Bearer ${expected}`) {
    return json({ ret: 1, msg: 'unauthorized' }, 401);
  }

  const contentType = context.request.headers.get('Content-Type') || '';
  let bytes = null;
  let mime = '';

  try {
    if (contentType.includes('multipart/form-data')) {
      // multipart 上传
      const form = await context.request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return json({ ret: 1, msg: '缺少 file 字段' }, 400);
      }
      bytes = new Uint8Array(await file.arrayBuffer());
      mime = normalize(file.type);
    } else {
      // JSON dataURL 上传
      const body = await context.request.json();
      const dataUrl = body.dataUrl || '';
      const match = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(dataUrl);
      if (!match) {
        return json({ ret: 1, msg: 'dataUrl 格式错误' }, 400);
      }
      bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
      mime = normalize(match[1]);
    }
  } catch (e) {
    return json({ ret: 1, msg: '请求解析失败: ' + e.message }, 400);
  }

  // 以文件头为准：部分客户端给的 type 为空或与内容不符（例如 PNG 被当成 jpeg）
  mime = detectMime(bytes) || mime;
  if (!MIME_EXT[mime]) {
    return json({ ret: 1, msg: `不支持的图片类型: ${mime || '未知'}` }, 400);
  }

  // 大小限制 500KB：EdgeOne 带宽受限，图片越小加载越稳
  if (bytes.byteLength > 500 * 1024) {
    return json({ ret: 1, msg: '图片不能超过 500KB' }, 400);
  }

  // 写入 Blob。用 Blob 包装以便把 Content-Type 一起写入，
  // 同时固定长缓存（key 含时间戳+随机串，内容不会变）。
  const store = getStore('activity-covers');
  const key = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${MIME_EXT[mime]}`;
  try {
    await store.set(key, new Blob([bytes], { type: mime }), {
      cacheControl: 'public, max-age=31536000, immutable',
    });
  } catch (e) {
    return json({ ret: 1, msg: '写入存储失败: ' + (e.message || e) }, 500);
  }

  return json({
    ret: 0,
    url: `/api/activity-image?key=${encodeURIComponent(key)}`,
    key,
  });
}
