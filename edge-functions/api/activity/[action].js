// activity-data.js — Edge Function：读取/写入内容条目（活动 / 快讯）
// 使用 EdgeOne Pages KV Storage（必须在控制台启用 KV 并绑定命名为 activities_kv 的全局变量）
//
// 路由:
//   GET  /api/activity/all                       → 列表（默认只返回未隐藏的条目）
//        ?kind=activity|news                     → 按类型过滤
//        ?limit=N                                → 限制条数，按日期倒序
//        ?includeHidden=1                        → 含隐藏条目（需管理员令牌）
//   GET  /api/activity/detail?id=x               → 单条详情
//   POST /api/activity/all                       → 新增/更新（管理员令牌校验）
//   DELETE /api/activity/detail?id=x             → 删除（管理员令牌校验）
//
// 鉴权：Authorization: Bearer <短时管理令牌>（/api/auth/token 签发）
//       或服务端配置的机器凭证 MACHINE_TOKEN（运维脚本用，不下发浏览器）
//
// 数据模型：
//   {
//     id, kind: 'activity' | 'news',
//     title, date, author,
//     cover,       // 封面 URL，可为空，前台无封面时用无图样式
//     summary,     // 列表摘要，可为空（前台从 content 截取）
//     content,     // Markdown 正文
//     link,        // 非空 = 外链型条目，前台卡片直接跳转该地址
//     hidden,      // true = 不在前台展示（草稿/下架）
//     createdAt, updatedAt
//   }
// 兼容旧数据：缺 kind 视为 activity，缺 link/hidden 视为空/false。

const KINDS = ['activity', 'news'];

// 字段长度上限，避免异常请求把 KV 值撑爆
const LIMITS = {
  title: 200,
  summary: 2000,
  content: 200000,
  link: 500,
  cover: 500,
  author: 60,
  date: 20,
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
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}

function json(context, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // 接口返回动态内容（含草稿），禁止任何中间层缓存
      'Cache-Control': 'no-store',
      ...corsHeaders(context),
    },
  });
}

// activities_kv 是在控制台绑定 KV 命名空间时设置的全局变量名
async function getActivities() {
  const raw = await activities_kv.get('activities:list', 'json');
  return Array.isArray(raw) ? raw : [];
}

async function saveActivities(list) {
  await activities_kv.put('activities:list', JSON.stringify(list));
}

// 补齐默认字段，保证老数据也能被前台正常渲染
function normalize(item) {
  return {
    id: item.id,
    kind: KINDS.indexOf(item.kind) >= 0 ? item.kind : 'activity',
    title: item.title || '',
    date: item.date || '',
    author: item.author || 'CIC',
    cover: item.cover || '',
    summary: item.summary || '',
    content: item.content || '',
    link: item.link || '',
    hidden: !!item.hidden,
    createdAt: item.createdAt || item.updatedAt || null,
    updatedAt: item.updatedAt || null,
  };
}

function sortByDate(list) {
  return list.sort((a, b) => {
    const diff = new Date(b.date) - new Date(a.date);
    if (diff !== 0) return diff;
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });
}

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

// 管理员校验：短时 HMAC 令牌（含 exp），或服务端机器凭证
async function isAdmin(request, context) {
  const auth = request.headers.get('Authorization') || '';
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

// 外链校验：只允许 http(s) 绝对地址或站内相对路径，挡住 javascript:/data: 等协议
function safeUrl(value, maxLen) {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  if (raw.length > maxLen) return null;
  // 站内相对路径：拒绝 //evil.com（协议相对）和 /\evil.com（浏览器把 \ 当 /）
  if (raw.startsWith('/')) {
    if (raw.startsWith('//') || raw.indexOf('\\') >= 0) return null;
    return raw;
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (e) {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return raw;
}

// 正文不做服务端 HTML 重写：
// 没有真正的 HTML 解析器时，正则/手写扫描会改坏合法内容（如 "a < b"、CommonMark autolink、
// 代码块里的示例标签），且引入新的绕过面。正文的 XSS 防护落在渲染层——前台用
// mavon-editor 渲染，其内置 FilterXSS 会按白名单过滤 HTML。若将来更换渲染方式，
// 必须同样接入 DOMPurify / FilterXSS 之类的白名单清洗。
function clip(value, maxLen) {
  return String(value == null ? '' : value).slice(0, maxLen);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const action = path.split('/').pop(); // "all" | "detail"

  // 只有管理员能看到隐藏条目；明确要求草稿却没通过鉴权时直接报错，
  // 避免静默降级成公开列表导致后台误以为数据缺失
  const wantsHidden = url.searchParams.get('includeHidden') === '1';
  if (wantsHidden && !(await isAdmin(context.request, context))) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
  }
  const includeHidden = wantsHidden;

  const all = (await getActivities()).map(normalize);
  const visible = includeHidden ? all : all.filter(a => !a.hidden);
  sortByDate(visible);

  if (action === 'detail') {
    const id = url.searchParams.get('id');
    const item = visible.find(a => String(a.id) === String(id));
    if (!item) {
      return json(context, { ret: 1, msg: '内容不存在' }, 404);
    }
    return json(context, { ret: 0, data: item });
  }

  // 默认 / all：按类型过滤 + 限制条数
  let list = visible;
  const kind = url.searchParams.get('kind');
  if (kind) list = list.filter(a => a.kind === kind);

  const total = list.length;
  const limitParam = Number(url.searchParams.get('limit'));
  const activities = Number.isFinite(limitParam) && limitParam > 0
    ? list.slice(0, Math.min(Math.floor(limitParam), 200))
    : list;

  return json(context, {
    ret: 0,
    data: { activities, total, hiddenIncluded: includeHidden },
  });
}

export async function onRequestPost(context) {
  // 鉴权（all 与 detail 均走此入口创建/更新）
  if (!(await isAdmin(context.request, context))) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
  }

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json(context, { ret: 1, msg: 'invalid json' }, 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(context, { ret: 1, msg: 'invalid body' }, 400);
  }

  const { id, kind, title, cover, date, author, content, summary, link, hidden } = body;
  if (!title || !date) {
    return json(context, { ret: 1, msg: 'title 和 date 必填' }, 400);
  }
  if (String(title).length > LIMITS.title || String(summary || '').length > LIMITS.summary) {
    return json(context, { ret: 1, msg: '标题或摘要过长' }, 400);
  }
  if (String(content || '').length > LIMITS.content) {
    return json(context, { ret: 1, msg: '正文过长' }, 400);
  }

  // 链接协议白名单：服务端必须校验，前端正则只是体验层的提示
  const safeLink = safeUrl(link, LIMITS.link);
  if (safeLink === null) {
    return json(context, { ret: 1, msg: 'link 只支持 http(s) 地址或站内路径' }, 400);
  }
  const safeCover = safeUrl(cover, LIMITS.cover);
  if (safeCover === null) {
    return json(context, { ret: 1, msg: 'cover 只支持 http(s) 地址或站内路径' }, 400);
  }

  const list = (await getActivities()).map(normalize);

  // 更新 or 新增
  const idx = id ? list.findIndex(a => String(a.id) === String(id)) : -1;
  const now = new Date().toISOString();

  // 用时间戳作 id，同毫秒并发时递增避让，避免覆盖已有条目
  let newId = Date.now();
  while (idx < 0 && list.some(a => String(a.id) === String(newId))) newId += 1;

  const record = {
    id: idx >= 0 ? list[idx].id : newId,
    kind: KINDS.indexOf(kind) >= 0 ? kind : (idx >= 0 ? list[idx].kind : 'activity'),
    title: clip(title, LIMITS.title),
    cover: safeCover,
    date: clip(date, LIMITS.date) || now.slice(0, 10),
    author: clip(author, LIMITS.author) || 'CIC',
    summary: clip(summary, LIMITS.summary),
    content: clip(content, LIMITS.content),
    link: safeLink,
    hidden: hidden === true || hidden === 'true' || hidden === 1 || hidden === '1',
    createdAt: idx >= 0 ? (list[idx].createdAt || list[idx].updatedAt || now) : now,
    updatedAt: now,
  };

  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }

  await saveActivities(list);
  return json(context, { ret: 0, data: record });
}

export async function onRequestDelete(context) {
  if (!(await isAdmin(context.request, context))) {
    return json(context, { ret: 1, msg: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return json(context, { ret: 1, msg: '缺少 id 参数' }, 400);
  }

  const list = await getActivities();
  const next = list.filter(a => String(a.id) !== String(id));

  if (next.length === list.length) {
    return json(context, { ret: 1, msg: '未找到该内容' }, 404);
  }

  await saveActivities(next);
  return json(context, { ret: 0, msg: 'deleted' });
}

export function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context) });
}
