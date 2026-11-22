// src/api/edgeActivities.js
// EdgeOne Pages Edge Function API 封装 —— 活动 / 快讯内容条目
// 响应结构与原 /api/activity/* 保持一致

const BASE = '/api/activity';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({ ret: 1, msg: '响应解析失败' }));
  if (!res.ok || data.ret !== 0) {
    const err = new Error(data.msg || `请求失败 (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * 获取内容列表（活动 / 快讯）
 * @param {number|Object} [options] 数字时等价于 { limit }
 * @param {string} [options.kind] 'activity' | 'news'
 * @param {number} [options.limit] 限制条数
 * @param {boolean} [options.includeHidden] 含隐藏条目（需 token）
 * @param {string} [options.token] 管理 token
 * @returns {Promise<Array>} 按日期倒序
 */
export function getActivities(options) {
  const opts = typeof options === 'number' ? { limit: options } : (options || {});
  const query = buildQuery({
    kind: opts.kind,
    limit: opts.limit,
    includeHidden: opts.includeHidden ? '1' : '',
  });
  return request(`/all${query}`, { headers: authHeaders(opts.token) })
    .then(res => res.data.activities);
}

/**
 * 获取活动详情
 * @param {string|number} id
 * @param {{token?: string, includeHidden?: boolean}} [options]
 */
export function getActivityDetail(id, options = {}) {
  const query = buildQuery({
    id,
    includeHidden: options.includeHidden ? '1' : '',
  });
  return request(`/detail${query}`, { headers: authHeaders(options.token) })
    .then(res => res.data);
}

/**
 * 新增/更新内容条目（需管理员）
 * @param {Object} activity { id?, kind?, title, cover?, date, author?, summary?, content?, link?, hidden? }
 * @param {string} adminToken
 */
export function saveActivity(activity, adminToken) {
  // 防御：把 Promise 误当 token 传入时（忘记 await）会拼成 [object Promise]，
  // 服务端只会返回 401，排查困难，这里直接给出明确错误。
  if (typeof adminToken !== 'string' || !adminToken) {
    return Promise.reject(new Error('管理员凭证无效，请重新登录后再试'));
  }
  return request('/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(adminToken),
    },
    body: JSON.stringify(activity),
  }).then(res => res.data);
}

/**
 * 删除内容条目（需管理员）
 * @param {string|number} id
 * @param {string} adminToken
 */
export function deleteActivity(id, adminToken) {
  if (typeof adminToken !== 'string' || !adminToken) {
    return Promise.reject(new Error('管理员凭证无效，请重新登录后再试'));
  }
  return request(`/detail${buildQuery({ id })}`, {
    method: 'DELETE',
    headers: authHeaders(adminToken),
  });
}
