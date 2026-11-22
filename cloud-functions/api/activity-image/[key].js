// cloud-functions/api/activity-image/[key].js — 读取封面图片
//
// GET /api/activity-image?key=covers/xxx.jpg
// 从 Blob 读取图片并以正确的 Content-Type 输出。
import { getStore } from '@edgeone/pages-blob';

const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  if (!key || key.includes('..')) {
    return new Response('Missing key', { status: 400 });
  }

  const store = getStore('activity-covers');
  const result = await store.getWithHeaders(key);
  if (!result) {
    return new Response('Not found', { status: 404 });
  }

  // 依据扩展名推断 Content-Type（Blob 之外的自有规则）
  const ext = key.split('.').pop().toLowerCase();
  const mime = EXT_MIME[ext] || result.headers['content-type'] || 'application/octet-stream';

  return new Response(result.body, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
