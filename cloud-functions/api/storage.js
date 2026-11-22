// cloud-functions/api/storage.js — Blob 存储管理（后台用）
//
// GET    /api/storage               列出 covers/ 下的所有文件
//        ?withSize=1                附带文件大小（最多取前 50 个，避免 HEAD 请求过多）
// DELETE /api/storage?key=covers/x  删除指定文件
//
// 鉴权：Authorization: Bearer <ADMIN_TOKEN>
// 安全：只允许操作 covers/ 前缀，避免误删存储中的其它对象。
import { getStore } from '@edgeone/pages-blob';

const STORE = 'activity-covers';
const PREFIX = 'covers/';
const LIST_LIMIT = 500; // 一次最多列这么多，超出的提示截断
const SIZE_LIMIT = 50; // 并发取文件大小的上限

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 管理数据不缓存，避免删除后仍显示旧列表
      'Cache-Control': 'no-store',
      ...CORS,
    },
  });
}

function isAdmin(context) {
  const expected = context.env.ADMIN_TOKEN;
  if (!expected) return false;
  return context.request.headers.get('Authorization') === `Bearer ${expected}`;
}

function isValidKey(key) {
  return !!key && !key.includes('..') && key.startsWith(PREFIX);
}

export async function onRequestGet(context) {
  if (!isAdmin(context)) {
    return json({ ret: 1, msg: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const withSize = url.searchParams.get('withSize') === '1';

  try {
    const store = getStore(STORE);
    const { blobs } = await store.list({ prefix: PREFIX, limit: LIST_LIMIT });
    const items = (blobs || []).map(b => ({ key: b.key, size: null }));

    if (withSize && items.length) {
      const targets = items.slice(0, SIZE_LIMIT);
      const metas = await Promise.allSettled(
        targets.map(item => store.getMetadata(item.key, { consistency: 'strong' }))
      );
      metas.forEach((result, i) => {
        if (result.status !== 'fulfilled' || !result.value) return;
        const headers = result.value.headers || {};
        const length = Number(headers['content-length']);
        targets[i].size = Number.isFinite(length) ? length : null;
      });
    }

    return json({
      ret: 0,
      data: {
        blobs: items,
        total: items.length,
        truncated: items.length >= LIST_LIMIT,
      },
    });
  } catch (e) {
    return json({ ret: 1, msg: '读取存储列表失败: ' + (e.message || e) }, 500);
  }
}

export async function onRequestDelete(context) {
  if (!isAdmin(context)) {
    return json({ ret: 1, msg: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!isValidKey(key)) {
    return json({ ret: 1, msg: '非法的 key（只能删除 covers/ 下的文件）' }, 400);
  }

  try {
    const store = getStore(STORE);
    await store.delete(key);
    return json({ ret: 0, msg: 'deleted', data: { key } });
  } catch (e) {
    return json({ ret: 1, msg: '删除失败: ' + (e.message || e) }, 500);
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
