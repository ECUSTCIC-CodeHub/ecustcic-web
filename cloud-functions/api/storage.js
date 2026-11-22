// cloud-functions/api/storage.js — Blob 存储管理（后台用）
//
// GET    /api/storage               列出 covers/ 下的所有文件
//        ?withSize=1                附带文件大小（最多取前 50 个，避免 HEAD 请求过多）
// DELETE /api/storage?key=covers/x  删除指定文件（被内容引用时拒绝）
//
// 鉴权：Authorization: Bearer <短时管理令牌>
// 安全：只允许操作 covers/ 前缀；删除前由服务端重新核对内容引用，
//       不依赖前端判断，避免直接调接口删掉正在使用的图片。
import { getStore } from '@edgeone/pages-blob';

const STORE = 'activity-covers';
const PREFIX = 'covers/';
const LIST_LIMIT = 500; // 一次最多列这么多，超出的提示截断
const SIZE_LIMIT = 50; // 并发取文件大小的上限

// ── CORS：只回显 SITE_URL 这一个来源（同源请求本来不需要 ACAO） ──
function corsHeaders(context) {
  const origin = context.request.headers.get('Origin');
  if (!origin) return {};
  const allowed = new Set();
  const site = (context.env.SITE_URL || '').replace(/\/+$/, '');
  if (site) allowed.add(site);
  if (!allowed.has(origin.replace(/\/+$/, ''))) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}

function json(context, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // 管理数据不缓存，避免删除后仍显示旧列表
      'Cache-Control': 'no-store',
      ...corsHeaders(context),
    },
  });
}

// ── 管理令牌校验：短时 HMAC 令牌，或服务端配置的机器凭证 MACHINE_TOKEN ──
// 字节序列 → base64url（签名等二进制数据必须走这里，不能先转成字符串再 UTF-8 编码）
function toBase64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(input) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isAdmin(context) {
  const auth = context.request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7).trim();
  if (!token) return false;

  // 机器凭证：与旧 ADMIN_TOKEN 分离（旧值历史上外泄过，不再接受）
  const machineToken = context.env.MACHINE_TOKEN;
  if (machineToken && timingSafeEqual(token, machineToken)) return true;

  const secret = context.env.OAUTH_STATE_SECRET;
  if (!secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'adm') return false;
  const [, payload, sig] = parts;
  const expected = await hmac(payload, secret);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const data = JSON.parse(fromBase64url(payload));
    return data.r === 'admin' && Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch (e) {
    return false;
  }
}

function isValidKey(key) {
  return !!key && !key.includes('..') && key.startsWith(PREFIX);
}

// 从文本中提取 /api/activity-image?key=... 里的 key，解码后精确比较，
// 避免百分号编码/大小写等价形式被漏判。
function collectKeys(text) {
  const keys = [];
  const re = /[?&]key=([^&"'\s)>#]+)/g;
  const src = String(text || '');
  let m;
  while ((m = re.exec(src))) {
    let value = m[1];
    for (let i = 0; i < 2; i++) {
      try {
        const decoded = decodeURIComponent(value);
        if (decoded === value) break;
        value = decoded;
      } catch (e) {
        break;
      }
    }
    keys.push(value);
  }
  return keys;
}

async function loadAllActivities(context) {
  // 同一 Pages 项目里 KV 已绑定为全局变量时直接读，避免回环 HTTP
  // （也避免 SITE_URL 配错时删除永久不可用）
  if (typeof activities_kv !== 'undefined' && activities_kv && typeof activities_kv.get === 'function') {
    try {
      const raw = await activities_kv.get('activities:list', 'json');
      // 只有读到非空数组才可信；空/异常值仍回退 HTTP 复核，避免 fail-open 误删
      if (Array.isArray(raw) && raw.length) return raw;
    } catch (e) {
      // KV 不可用，退回 HTTP
    }
  }
  const site = (context.env.SITE_URL || '').replace(/\/+$/, '');
  if (!site) throw new Error('SITE_URL 未配置');
  // 回源必须走 https，避免令牌明文出网
  if (!/^https:\/\//i.test(site)) throw new Error('SITE_URL 必须为 https');

  // 优先用服务端机器凭证（不转发调用者的管理令牌）；失败时再退回调用者令牌，
  // 避免两端 MACHINE_TOKEN 配置不一致导致删除功能整体不可用。
  const callerAuth = context.request.headers.get('Authorization') || '';
  const machine = context.env.MACHINE_TOKEN;
  const attempts = [];
  if (machine) attempts.push(`Bearer ${machine}`);
  if (callerAuth) attempts.push(callerAuth);

  let resp = null;
  let lastError = null;
  for (let i = 0; i < attempts.length; i++) {
    try {
      resp = await fetch(`${site}/api/activity/all?includeHidden=1&_t=${Date.now()}`, {
        headers: { Authorization: attempts[i] },
        cache: 'no-store',
        redirect: 'error',
        // 避免平台超时前长时间挂起（DELETE 走同步链路）
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
      });
    } catch (e) {
      lastError = e;
      resp = null;
      continue;
    }
    if (resp.ok) break;
  }
  if (!resp || !resp.ok) {
    throw new Error(`读取内容列表失败（${resp ? resp.status : (lastError ? lastError.message : '无可用凭证')}）`);
  }
  const body = await resp.json();
  // 必须确认隐藏条目真的返回了，否则草稿引用的图片会被误判为无人使用
  if (!body || !body.data || body.data.hiddenIncluded !== true) {
    throw new Error('内容列表未包含隐藏条目');
  }
  return body.data.activities || [];
}

// 从活动/快讯列表里找出引用了该 key 的条目（cover 或正文内嵌图片）。
// 任一环节失败都视为"无法确认引用"而拒绝删除。
async function findReferences(context, key) {
  const list = await loadAllActivities(context);
  return list
    .filter(item => {
      const keys = new Set([
        ...collectKeys(item.cover),
        ...collectKeys(item.content),
      ]);
      return keys.has(key);
    })
    .map(item => ({ id: item.id, title: item.title || '' }));
}

export async function onRequestGet(context) {
  if (!(await isAdmin(context))) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
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

    return json(context, {
      ret: 0,
      data: {
        blobs: items,
        total: items.length,
        truncated: items.length >= LIST_LIMIT,
      },
    });
  } catch (e) {
    console.error('[storage] 读取存储列表失败:', e && e.message);
    return json(context, { ret: 1, msg: '读取存储列表失败' }, 500);
  }
}

export async function onRequestDelete(context) {
  if (!(await isAdmin(context))) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const key = url.searchParams.get('key') || '';
  if (!isValidKey(key)) {
    return json(context, { ret: 1, msg: '非法的 key（只能删除 covers/ 下的文件）' }, 400);
  }

  // 服务端引用校验：被任何活动/快讯引用时禁止删除
  let refs;
  try {
    refs = await findReferences(context, key);
  } catch (e) {
    console.error('[storage] 引用校验失败:', e && e.message);
    return json(context, { ret: 1, msg: '引用校验失败，已取消删除' }, 502);
  }
  if (refs.length) {
    return json(context, {
      ret: 1,
      msg: `该文件被 ${refs.length} 条内容引用，禁止删除`,
      data: { refs },
    }, 409);
  }

  try {
    const store = getStore(STORE);
    await store.delete(key);
    return json(context, { ret: 0, msg: 'deleted', data: { key } });
  } catch (e) {
    console.error('[storage] 删除失败:', e && e.message);
    return json(context, { ret: 1, msg: '删除失败' }, 500);
  }
}

export function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context) });
}
