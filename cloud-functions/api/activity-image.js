// cloud-functions/api/activity-image.js — 封面图片上传（Node.js + Blob SDK）
//
// POST /api/activity-image
//   Content-Type: multipart/form-data 或 JSON { dataUrl }
//   Header: Authorization: Bearer <ADMIN_TOKEN>
//   返回: { ret: 0, url: "/api/activity-image/<key>" }
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
  let mime = 'image/jpeg';

  try {
    if (contentType.includes('multipart/form-data')) {
      // multipart 上传
      const form = await context.request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return json({ ret: 1, msg: '缺少 file 字段' }, 400);
      }
      mime = file.type || mime;
      bytes = await file.arrayBuffer();
    } else {
      // JSON dataURL 上传
      const body = await context.request.json();
      const dataUrl = body.dataUrl || '';
      const match = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(dataUrl);
      if (!match) {
        return json({ ret: 1, msg: 'dataUrl 格式错误' }, 400);
      }
      mime = match[1];
      if (!MIME_EXT[mime]) {
        return json({ ret: 1, msg: `不支持的图片类型: ${mime}` }, 400);
      }
      bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    }
  } catch (e) {
    return json({ ret: 1, msg: '请求解析失败: ' + e.message }, 400);
  }

  if (!MIME_EXT[mime]) {
    return json({ ret: 1, msg: `不支持的图片类型: ${mime}` }, 400);
  }

  // 大小限制 5MB
  if (bytes.byteLength > 5 * 1024 * 1024) {
    return json({ ret: 1, msg: '图片不能超过 5MB' }, 400);
  }

  // 写入 Blob
  const store = getStore('activity-covers');
  const key = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${MIME_EXT[mime]}`;
  await store.set(key, bytes);

  return json({
    ret: 0,
    url: `/api/activity-image?key=${encodeURIComponent(key)}`,
    key,
  });
}
