// src/api/adminAuth.js
// 后台鉴权：会话 Cookie → /api/auth/token → 短时管理令牌
// 令牌由服务端签发（默认 2 小时有效），只存在内存中：
//   - 不写 sessionStorage/localStorage，避免被 XSS 或浏览器插件长期读取
//   - 页面刷新后重新兑换一次，成本可接受

let memory = null; // { token, exp }

const FALLBACK_TTL = 5 * 60 * 1000; // 服务端未返回有效期时的保守值
const MAX_TTL = 30 * 60 * 1000; // 内存缓存上限，避免长时间持有旧令牌

/** 清除缓存的 token（401 后调用，下次重新兑换） */
export function clearAdminToken() {
  memory = null;
}

/**
 * 获取管理 token。
 * @param {boolean} force 忽略缓存强制重新兑换
 * @returns {Promise<string>}
 */
export async function getAdminToken(force = false) {
  if (!force && memory && memory.exp > Date.now()) {
    return memory.token;
  }

  let res;
  try {
    res = await fetch('/api/auth/token', { credentials: 'include' });
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

  const ttlSeconds = Number(data.data.expiresIn);
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0
    ? Math.min(ttlSeconds * 1000, MAX_TTL)
    : FALLBACK_TTL;
  // 提前 60 秒过期，避免卡在边界上
  memory = { token: data.data.token, exp: Date.now() + Math.max(ttl - 60 * 1000, 30 * 1000) };
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

/**
 * 构造登录入口地址。
 * 把当前页面路径作为 ?redirect= 传给 /api/auth/login，
 * 服务端会把它放进 OAuth state，登录成功后 302 跳回原页面。
 * @param {string} [redirect] 目标路径，缺省为当前页面地址
 * @returns {string} 登录链接
 */
export function loginUrl(redirect) {
  const target =
    typeof redirect === 'string' && redirect
      ? redirect
      : window.location.pathname + window.location.search + window.location.hash;
  return `/api/auth/login?redirect=${encodeURIComponent(target)}`;
}
