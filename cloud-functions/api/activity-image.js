// cloud-functions/api/activity-image.js — 封面图片上传（Node.js + Blob SDK）
//
// POST /api/activity-image
//   Content-Type: multipart/form-data 或 JSON { dataUrl }
//   Header: Authorization: Bearer <短时管理令牌>
//   返回: { ret: 0, url: "/api/activity-image?key=<key>", key }
//
// GET /api/activity-image?key=covers/xxx.jpg —— 读取已上传图片（公开）
import { getStore } from '@edgeone/pages-blob';

const STORE = 'activity-covers';
const KEY_PREFIX = 'covers/';
const MAX_BYTES = 500 * 1024; // 图片上限 500KB
// 请求体上限：500KB 图片经 base64 后约 700KB，留出 JSON/表单开销余量
const MAX_BODY_BYTES = 2 * 1024 * 1024;

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(context, data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...corsHeaders(context),
    },
  });
}

// 按文件头判断真实格式：客户端上报的 type 与扩展名都不可信
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

async function verifyAdmin(context) {
  const auth = context.request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  // 机器凭证（运维脚本/CI），不再下发给浏览器。
  // 变量名与旧 ADMIN_TOKEN 分离：旧值历史上随 /api/auth/token 外泄过，不再接受。
  const machineToken = context.env.MACHINE_TOKEN;
  if (machineToken && timingSafeEqual(token, machineToken)) return { uid: 'machine' };

  const secret = context.env.OAUTH_STATE_SECRET;
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'adm') return null;
  const [, payload, sig] = parts;
  const expected = await hmac(payload, secret);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(fromBase64url(payload));
    if (data.r !== 'admin') return null;
    if (!(Number(data.exp) > Math.floor(Date.now() / 1000))) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function isValidKey(key) {
  return !!key && !key.includes('..') && key.startsWith(KEY_PREFIX);
}

// GET /api/activity-image?key=covers/xxx.jpg —— 读取已上传的图片
// 上传接口返回的 URL 就是这种 query 形式，必须在这里处理，
// 否则请求会落到本文件的 POST 入口而返回 404。
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get('key');
  if (!isValidKey(key)) {
    return new Response('Missing key', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const store = getStore(STORE);
  // 注意：不能用 getWithHeaders —— 它内部用 TextDecoder('utf-8') 解码 body，
  // 二进制图片会被损坏。读图片必须用 type: 'arrayBuffer'。
  // 用 strong 一致性，保证上传后立刻访问不会因 CDN 缓存而 404。
  const buffer = await store.get(key, { type: 'arrayBuffer', consistency: 'strong' });
  if (!buffer) {
    // 不缓存错误响应，否则 CDN/浏览器会把 404 记住很久
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const ext = String(key).split('.').pop().toLowerCase();
  // 以字节为准，内容与扩展名不符时仍按真实类型返回
  const mime = detectMime(new Uint8Array(buffer)) || EXT_MIME[ext] || 'application/octet-stream';

  return new Response(buffer, {
    headers: {
      'Content-Type': mime,
      // 防止浏览器把伪装成图片的文件当 HTML 解析
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...corsHeaders(context),
    },
  });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context) });
}

export async function onRequestPost(context) {
  // 鉴权
  const admin = await verifyAdmin(context);
  if (!admin) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
  }

  // 先按 Content-Length 早拒，避免超大 multipart 一次性读进内存
  const declared = Number(context.request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json(context, { ret: 1, msg: '请求体过大' }, 413);
  }

  const contentType = context.request.headers.get('Content-Type') || '';
  let bytes = null;

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await context.request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return json(context, { ret: 1, msg: '缺少 file 字段' }, 400);
      }
      if (typeof file.size === 'number' && file.size > MAX_BYTES) {
        return json(context, { ret: 1, msg: '图片不能超过 500KB' }, 400);
      }
      bytes = new Uint8Array(await file.arrayBuffer());
    } else {
      const body = await context.request.json();
      const dataUrl = body.dataUrl || '';
      const match = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
      if (!match) {
        return json(context, { ret: 1, msg: 'dataUrl 格式错误' }, 400);
      }
      bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0));
    }
  } catch (e) {
    console.error('[activity-image] 解析请求失败:', e && e.message);
    return json(context, { ret: 1, msg: '请求解析失败' }, 400);
  }

  // 大小限制 500KB：EdgeOne 带宽受限，图片越小加载越稳
  if (bytes.byteLength > MAX_BYTES) {
    return json(context, { ret: 1, msg: '图片不能超过 500KB' }, 400);
  }

  // 只接受魔数能识别出的真实图片，避免把 HTML/脚本伪装成图片写入存储
  const mime = detectMime(bytes);
  if (!MIME_EXT[mime]) {
    return json(context, { ret: 1, msg: '仅支持 JPG/PNG/WebP/GIF 图片' }, 400);
  }

  // 写入 Blob。用 Blob 包装以便把 Content-Type 一起写入，
  // 同时固定长缓存（key 含时间戳+随机串，内容不会变）。
  const store = getStore(STORE);
  const key = `${KEY_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${MIME_EXT[mime]}`;
  try {
    await store.set(key, new Blob([bytes], { type: mime }), {
      cacheControl: 'public, max-age=31536000, immutable',
    });
  } catch (e) {
    console.error('[activity-image] 写入存储失败:', e && e.message);
    return json(context, { ret: 1, msg: '写入存储失败' }, 500);
  }

  return json(context, {
    ret: 0,
    url: `/api/activity-image?key=${encodeURIComponent(key)}`,
    key,
  });
}
