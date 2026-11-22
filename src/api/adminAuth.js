// src/api/adminAuth.js
// 后台鉴权：会话 Cookie → /api/auth/token → ADMIN_TOKEN（用于 Edge Function / 图片上传）
// 编辑器里每次插图、每次保存都要用，因此做内存 + sessionStorage 缓存。

const STORAGE_KEY = 'cic_admin_token';
const TTL = 10 * 60 * 1000; // 10 分钟

let memory = null; // { token, exp }

function readStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.token || data.exp < Date.now()) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function writeStorage(data) {
  try {
    if (data) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // 隐私模式下 sessionStorage 可能不可用，忽略即可（退化为纯内存缓存）
  }
}

/** 清除缓存的 token（401 后调用，下次重新兑换） */
export function clearAdminToken() {
  memory = null;
  writeStorage(null);
}

/**
 * 获取管理 token。
 * @param {boolean} force 忽略缓存强制重新兑换
 * @returns {Promise<string>}
 */
export async function getAdminToken(force = false) {
  if (!force) {
    const cached = memory || readStorage();
    if (cached && cached.exp > Date.now()) {
      memory = cached;
      return cached.token;
    }
  }

  let res;
  try {
    res = await fetch('/api/auth/token', {
      headers: { Authorization: 'Bearer COOKIE_EXCHANGE' },
      credentials: 'include',
    });
  } catch (e) {
    throw new Error('网络异常，无法校验管理权限');
  }

  if (res.status === 401) {
    throw new Error('未登录或会话已过期，请重新登录');
  }
  if (res.status === 403) {
    throw new Error('当前账号不是管理员，无权发布内容');
  }
  if (!res.ok) {
    throw new Error('获取管理凭证失败（' + res.status + '）');
  }

  const data = await res.json();
  if (data.ret !== 0 || !data.data || !data.data.token) {
    throw new Error(data.msg || '获取管理凭证失败');
  }

  memory = { token: data.data.token, exp: Date.now() + TTL };
  writeStorage(memory);
  return memory.token;
}

/** 获取当前登录用户（未登录返回 null） */
export async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ret === 0 ? data.data : null;
  } catch (e) {
    return null;
  }
}
