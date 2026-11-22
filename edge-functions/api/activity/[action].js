// activity-data.js — Edge Function：读取/写入内容条目（活动 / 快讯）
// 使用 EdgeOne Pages KV Storage（必须在控制台启用 KV 并绑定命名为 activities_kv 的全局变量）
//
// 路由:
//   GET  /api/activity/all                       → 列表（默认只返回未隐藏的条目）
//        ?kind=activity|news                     → 按类型过滤
//        ?limit=N                                → 限制条数，按日期倒序
//        ?includeHidden=1                        → 含隐藏条目（需管理员 token）
//   GET  /api/activity/detail?id=x               → 单条详情
//   POST /api/activity/all                       → 新增/更新（管理员 token 校验）
//   DELETE /api/activity/detail?id=x             → 删除（管理员 token 校验）
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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

const KINDS = ['activity', 'news'];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
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

// 简单的管理员校验：Header 带 Authorization: Bearer <ADMIN_TOKEN>
// ADMIN_TOKEN 在 EdgeOne Pages 控制台的环境变量中设置
function isAdmin(request, context) {
  const expected = context.env.ADMIN_TOKEN;
  if (!expected) return false; // 未配置则拒绝所有写入
  const auth = request.headers.get('Authorization') || '';
  return auth === `Bearer ${expected}`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/+$/, '');
  const action = path.split('/').pop(); // "all" | "detail"

  // 只有管理员能看到隐藏条目
  const includeHidden =
    url.searchParams.get('includeHidden') === '1' && isAdmin(context.request, context);

  const all = (await getActivities()).map(normalize);
  const visible = includeHidden ? all : all.filter(a => !a.hidden);
  sortByDate(visible);

  if (action === 'detail') {
    const id = url.searchParams.get('id');
    const item = visible.find(a => String(a.id) === String(id));
    if (!item) {
      return json({ ret: 1, msg: '内容不存在' }, 404);
    }
    return json({ ret: 0, data: item });
  }

  // 默认 / all：按类型过滤 + 限制条数
  let list = visible;
  const kind = url.searchParams.get('kind');
  if (kind) list = list.filter(a => a.kind === kind);

  const total = list.length;
  const limitParam = url.searchParams.get('limit');
  const activities = limitParam ? list.slice(0, Number(limitParam)) : list;

  return json({
    ret: 0,
    data: { activities, total },
  });
}

export async function onRequestPost(context) {
  // 鉴权（all 与 detail 均走此入口创建/更新）
  if (!isAdmin(context.request, context)) {
    return json({ ret: 1, msg: 'unauthorized' }, 401);
  }

  let body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ ret: 1, msg: 'invalid json' }, 400);
  }

  const { id, kind, title, cover, date, author, content, summary, link, hidden } = body;
  if (!title || !date) {
    return json({ ret: 1, msg: 'title 和 date 必填' }, 400);
  }

  const list = (await getActivities()).map(normalize);

  // 更新 or 新增
  const idx = id ? list.findIndex(a => String(a.id) === String(id)) : -1;
  const now = new Date().toISOString();
  const record = {
    id: idx >= 0 ? list[idx].id : Date.now(),
    kind: KINDS.indexOf(kind) >= 0 ? kind : (idx >= 0 ? list[idx].kind : 'activity'),
    title,
    cover: cover || '',
    date: date || now.slice(0, 10),
    author: author || 'CIC',
    summary: summary || '',
    content: content || '',
    link: link || '',
    hidden: !!hidden,
    createdAt: idx >= 0 ? (list[idx].createdAt || list[idx].updatedAt || now) : now,
    updatedAt: now,
  };

  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.unshift(record);
  }

  await saveActivities(list);
  return json({ ret: 0, data: record });
}

export async function onRequestDelete(context) {
  if (!isAdmin(context.request, context)) {
    return json({ ret: 1, msg: 'unauthorized' }, 401);
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return json({ ret: 1, msg: '缺少 id 参数' }, 400);
  }

  const list = await getActivities();
  const next = list.filter(a => String(a.id) !== String(id));

  if (next.length === list.length) {
    return json({ ret: 1, msg: '未找到该内容' }, 404);
  }

  await saveActivities(next);
  return json({ ret: 0, msg: 'deleted' });
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
