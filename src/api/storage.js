// src/api/storage.js
// Blob 存储管理：列出 covers/ 下的图片、删除未被引用的文件。
// 接口在 cloud-functions/api/storage.js，需要 ADMIN_TOKEN。

const BASE = '/api/storage';

async function request(path, options, token) {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...((options && options.headers) || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json().catch(() => ({ ret: 1, msg: '响应解析失败' }));
  if (!res.ok || data.ret !== 0) {
    const err = new Error(data.msg || `请求失败 (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data.data;
}

/**
 * 列出存储中的文件
 * @param {string} token 管理 token
 * @param {{withSize?: boolean}} [options]
 * @returns {Promise<{blobs: Array<{key: string, size: number|null}>, total: number, truncated: boolean}>}
 */
export function listBlobs(token, options = {}) {
  const withSize = options.withSize === false ? '0' : '1';
  return request(`${BASE}?withSize=${withSize}`, {}, token);
}

/**
 * 删除文件
 * @param {string} token 管理 token
 * @param {string} key 形如 covers/xxx.jpg
 */
export function deleteBlob(token, key) {
  return request(`${BASE}?key=${encodeURIComponent(key)}`, { method: 'DELETE' }, token);
}
