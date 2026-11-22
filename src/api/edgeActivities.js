// src/api/edgeActivities.js
// EdgeOne Pages Edge Function API 封装 —— 活动数据
// 替代已下线的原后端接口，响应结构与原 /api/activity/* 保持一致

const BASE = '/api/activity';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({ ret: 1, msg: '响应解析失败' }));
  if (!res.ok) {
    throw new Error(data.msg || `请求失败 (${res.status})`);
  }
  return data;
}

/**
 * 获取活动列表
 * @param {number} [limit] 可选，限制条数
 * @returns {Promise<Array>} 活动数组，按日期倒序
 */
export function getActivities(limit) {
  const query = limit ? `?limit=${limit}` : '';
  return request(`/all${query}`).then(res => res.data.activities);
}

/**
 * 获取活动详情
 * @param {string|number} id
 * @returns {Promise<Object>} 含 title/cover/date/author/content
 */
export function getActivityDetail(id) {
  return request(`/detail?id=${id}`).then(res => res.data);
}

/**
 * 新增/更新活动（需管理员）
 * @param {Object} activity { id?, title, cover?, date, author?, content? }
 * @param {string} adminToken 控制台环境变量 ADMIN_TOKEN 的值
 */
export function saveActivity(activity, adminToken) {
  return request('/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(activity),
  });
}

/**
 * 删除活动（需管理员）
 * @param {string|number} id
 * @param {string} adminToken
 */
export function deleteActivity(id, adminToken) {
  return request(`/detail?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
}
