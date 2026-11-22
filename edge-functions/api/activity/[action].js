// activity-data.js — Edge Function：读取/写入活动数据
// 使用 EdgeOne Pages KV Storage（必须在控制台启用 KV 并绑定命名为 activities_kv 的全局变量）
//
// 路由:
//   GET  /api/activity/all          → 全部活动列表（?limit=N 限制条数，按日期倒序）
//   GET  /api/activity/detail?id=x  → 单条活动详情
//   POST /api/activity/all          → 新增/更新活动（管理员 token 校验）
//   DELETE /api/activity/detail?id=x → 删除活动（管理员 token 校验）

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

async function getActivities() {
  // activities_kv 是在控制台绑定 KV 命名空间时设置的全局变量名
  const raw = await activities_kv.get('activities:list', 'json');
  return Array.isArray(raw) ? raw : [];
}

async function saveActivities(list) {
  await activities_kv.put('activities:list', JSON.stringify(list));
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
  const list = await getActivities();

  // 统一按日期倒序
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (action === 'detail') {
    const id = url.searchParams.get('id');
    const item = list.find(a => String(a.id) === String(id));
    if (!item) {
      return json({ ret: 1, msg: '活动不存在' }, 404);
    }
    return json({ ret: 0, data: item });
  }

  // 默认 / all：返回列表
  const limitParam = url.searchParams.get('limit');
  return json({
    ret: 0,
    data: {
      activities: limitParam ? list.slice(0, Number(limitParam)) : list,
      total: list.length,
    },
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

  const { id, title, cover, date, author, content } = body;
  if (!title || !date) {
    return json({ ret: 1, msg: 'title 和 date 必填' }, 400);
  }

  const list = await getActivities();

  // 更新 or 新增
  const idx = id ? list.findIndex(a => String(a.id) === String(id)) : -1;
  const record = {
    id: idx >= 0 ? list[idx].id : Date.now(),
    title,
    cover: cover || '',
    date: date || new Date().toISOString().slice(0, 10),
    author: author || 'CIC',
    content: content || '',
    updatedAt: new Date().toISOString(),
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
    return json({ ret: 1, msg: '未找到该活动' }, 404);
  }

  await saveActivities(next);
  return json({ ret: 0, msg: 'deleted' });
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
