// cloud-functions/api/auth.js — Blessing Skin OAuth2 登录
//
// 流程：
//   GET  /api/auth/login     → 302 跳转到皮肤站授权页
//   GET  /api/auth/callback  → 用 code 换 token，拉取用户信息，写入会话 Cookie
//   GET  /api/auth/me        → 返回当前登录用户（基于会话 Cookie）
//   GET  /api/auth/token     → 回源皮肤站复验管理员身份，签发短时管理令牌
//   GET  /api/auth/logout    → 清除会话 Cookie
//
// 所需环境变量（在 EdgeOne 控制台配置，均为必填）：
//   BS_CLIENT_ID       Blessing Skin OAuth 客户端 ID
//   BS_CLIENT_SECRET   Blessing Skin OAuth 客户端 Secret
//   BS_BASE_URL        皮肤站地址（如 https://mcskin.ecustvr.top）
//   SITE_URL           本站对外地址（如 https://www.ecustcic.com）
//   OAUTH_STATE_SECRET 会话与短时管理令牌的签名密钥（随机长字符串）
//
// 安全约定：
//   - OAUTH_STATE_SECRET 缺失时一律 fail-closed（返回 500），不再使用仓库内置兜底密钥。
//   - 管理令牌是 2 小时有效的 HMAC 签名令牌，不再向前端下发长期静态凭证。
//   - 每次签发管理令牌都会用会话中的 access_token 回源皮肤站复验 permission，
//     管理员被撤权后最迟 2 小时内失效（会话内 isAdmin 只用于前端展示）。

const COOKIE_NAME = 'cic_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天
const ADMIN_TOKEN_TTL = 60 * 60 * 2; // 2 小时

// OAuth scope：Blessing Skin 注册的合法 scope 是 User.Read / Player.Read 等
// （见皮肤站 app/Providers/AuthServiceProvider.php 的 Passport::tokensCan），
// 并不存在 identify。传未知 scope 时授权端点会直接 302 回回调地址：
//   error=invalid_scope&hint=Check the `identify` scope
// /api/user 需要 User.Read，因此默认请求它；可用环境变量 BS_OAUTH_SCOPE 覆盖，
// 设为空字符串则不带 scope 参数（皮肤站会使用默认 scope User.Read）。
const DEFAULT_SCOPE = 'User.Read';

// 字节序列 → base64url（签名等二进制数据必须走这里，不能先转成字符串再 UTF-8 编码）
function toBase64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 文本 → base64url
function base64url(input) {
  return toBase64url(new TextEncoder().encode(input));
}

function fromBase64url(input) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

// HMAC-SHA256 签名（Web Crypto）
async function sign(payload, secret) {
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

// 密钥缺失时返回空串，调用方据此 fail-closed
function getSecret(env) {
  return env.OAUTH_STATE_SECRET || '';
}

async function createSession(userData, accessToken, env) {
  const payload = base64url(JSON.stringify({
    uid: userData.uid,
    nickname: userData.nickname,
    email: userData.email,
    avatar: userData.avatar,
    isAdmin: !!userData.isAdmin,
    at: accessToken || '',
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }));
  const sig = await sign(payload, getSecret(env));
  return `${payload}.${sig}`;
}

async function verifySession(token, env) {
  const secret = getSecret(env);
  if (!secret || !token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = await sign(payload, secret);
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const data = JSON.parse(fromBase64url(payload));
    if (!(data.exp > Math.floor(Date.now() / 1000))) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// 短时管理令牌：adm.<payload>.<sig>，供 Edge / Cloud Functions 校验
async function createAdminToken(uid, env) {
  const payload = base64url(JSON.stringify({
    r: 'admin',
    uid,
    exp: Math.floor(Date.now() / 1000) + ADMIN_TOKEN_TTL,
  }));
  const sig = await sign(payload, getSecret(env));
  return `adm.${payload}.${sig}`;
}

function isHttps(request, env) {
  if (env.SITE_URL) return /^https:/i.test(env.SITE_URL);
  const proto = request.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch (e) {
    return true;
  }
}

function setCookieHeader(name, value, maxAge, request, env) {
  const secure = isHttps(request, env) ? '; Secure' : '';
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

// 站点对外地址：必须由 SITE_URL 显式配置，避免 redirect_uri 受 Host 头影响
function siteOrigin(env) {
  return (env.SITE_URL || '').replace(/\/+$/, '');
}

// 回源皮肤站读取 permission（-1 封禁 | 0 普通 | 1 管理员 | 2 超级管理员）
async function fetchPermission(baseUrl, accessToken) {
  if (!baseUrl || !accessToken) return null;
  try {
    const resp = await fetch(`${baseUrl}/api/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const u = data.data || data;
    const perms = Number(u.permission);
    return Number.isFinite(perms) ? perms : null;
  } catch (e) {
    return null;
  }
}

function jsonNoStore(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

// 登录成功后跳回的默认页面
const AFTER_LOGIN_PATH = '/user/info';

// 校验并归一化前端通过 ?redirect= 带入的回跳地址，防止开放重定向：
//   - 必须是本站相对路径（以单个 / 开头，拒绝 //、/\、绝对 URL）
//   - 不含空白字符与反斜杠，长度受限
//   - 非可见 ASCII 字符（如中文）做百分号编码，保证 Location 头合法
// 校验失败一律回退到 AFTER_LOGIN_PATH。
function sanitizeRedirect(input) {
  if (typeof input !== 'string') return AFTER_LOGIN_PATH;
  if (input.length === 0 || input.length > 512) return AFTER_LOGIN_PATH;
  if (/\s/.test(input) || input.includes('\\')) return AFTER_LOGIN_PATH;
  if (input[0] !== '/' || input[1] === '/') return AFTER_LOGIN_PATH;
  return input.replace(/[^\x21-\x7E]/g, ch => encodeURIComponent(ch));
}

function readCookie(request, name) {
  const cookie = (request.headers.get('Cookie') || '')
    .split(';').map(s => s.trim())
    .find(s => s.startsWith(`${name}=`));
  return cookie ? cookie.split('=').slice(1).join('=') : null;
}

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 登录入口：把「用户从哪个页面跳来登录」放进 OAuth state，
// 回调成功后原样带回，实现登录后跳回原页面。
// state = <随机数>.<base64url(redirect)>
function packState(redirect) {
  return `${randomState()}.${base64url(redirect)}`;
}

// 拆包：格式非法或校验失败时回退到默认页面
function unpackState(state) {
  if (typeof state !== 'string') return AFTER_LOGIN_PATH;
  const dot = state.indexOf('.');
  if (dot <= 0 || dot === state.length - 1) return AFTER_LOGIN_PATH;
  const rand = state.slice(0, dot);
  if (!/^[0-9a-f]{48}$/.test(rand)) return AFTER_LOGIN_PATH;
  try {
    return sanitizeRedirect(fromBase64url(state.slice(dot + 1)));
  } catch (e) {
    return AFTER_LOGIN_PATH;
  }
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  // [[action]] 动态路由：action 从 params 获取
  // CLI 会把多级路径打包成数组（如 /api/auth/login → params.action = ["login"]）
  const raw = params?.action ?? '';
  const action = Array.isArray(raw)
    ? (raw[raw.length - 1] || '')
    : (raw || '');
  const baseUrl = (env.BS_BASE_URL || '').replace(/\/+$/, '');
  const secret = getSecret(env);

  // ✱ 唯一路径：未配置签名密钥时一律拒绝服务，避免出现"可预测密钥"的会话
  if (!secret) {
    return new Response('server_not_configured: OAUTH_STATE_SECRET 未配置', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // ── 登录：跳转到皮肤站授权页 ──
  if (action === 'login') {
    const site = siteOrigin(env);
    if (!env.BS_CLIENT_ID || !baseUrl || !site) {
      return new Response('OAuth 未配置（缺少 BS_CLIENT_ID / BS_BASE_URL / SITE_URL）', { status: 500 });
    }
    const state = packState(sanitizeRedirect(new URL(request.url).searchParams.get('redirect')));
    const redirectUri = `${site}/api/auth/callback`;
    // 请求 User.Read，/api/user 才能返回用户信息（含 permission）
    const scope = env.BS_OAUTH_SCOPE === undefined ? DEFAULT_SCOPE : env.BS_OAUTH_SCOPE;
    const scopeParam = scope ? `&scope=${encodeURIComponent(scope)}` : '&scope=';
    const authorizeUrl =
      `${baseUrl}/oauth/authorize?client_id=${encodeURIComponent(env.BS_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code${scopeParam}&state=${encodeURIComponent(state)}`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizeUrl,
        // state 存入临时 Cookie 供回调校验
        'Set-Cookie': setCookieHeader('cic_oauth_state', state, 600, request, env),
        'Cache-Control': 'no-store',
      },
    });
  }

  // ── 回调：用 code 换 token，拉用户信息 ──
  if (action === 'callback') {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    // 皮肤站授权失败时会带着 error 直接跳回这里（如 invalid_scope），
    // 此时没有 code，把真实原因回显出来便于排查，而不是笼统报状态校验失败。
    // 截断长度并声明 nosniff，避免把超长/意外的外部内容原样回显。
    const oauthError = url.searchParams.get('error');
    if (oauthError) {
      const clip = s => String(s || '').slice(0, 200);
      const desc = clip(url.searchParams.get('error_description'));
      const hint = clip(url.searchParams.get('hint'));
      return new Response(
        `授权失败: ${clip(oauthError)}\n${desc}\n${hint}`.trim(),
        {
          status: 400,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const expectedState = readCookie(request, 'cic_oauth_state');
    if (!code || !state || !expectedState || state !== expectedState) {
      return new Response('授权状态校验失败', { status: 400 });
    }

    const site = siteOrigin(env);
    if (!site) {
      return new Response('OAuth 未配置（缺少 SITE_URL）', { status: 500 });
    }

    // code 换 access_token
    const tokenResp = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.BS_CLIENT_ID,
        client_secret: env.BS_CLIENT_SECRET,
        redirect_uri: `${site}/api/auth/callback`,
        code,
      }),
    });
    if (!tokenResp.ok) {
      return new Response('获取 access_token 失败', { status: 502 });
    }
    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return new Response('access_token 缺失', { status: 502 });
    }

    // 获取用户信息
    const userResp = await fetch(`${baseUrl}/api/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userResp.ok) {
      return new Response('获取用户信息失败', { status: 502 });
    }
    const userData = await userResp.json();

    // Blessing Skin /api/user 返回 { data: { uid, nickname, email, permission, ... } }
    // permission: -1 封禁 | 0 普通用户 | 1 管理员 | 2 超级管理员
    const u = userData.data || userData;

    // 生成会话：皮肤站 permission >= 1（管理员或超级管理员）视为本站管理员
    const perms = Number(u.permission);
    const isAdmin = Number.isFinite(perms) && perms >= 1;
    const session = await createSession({
      uid: u.uid,
      nickname: u.nickname,
      email: u.email,
      avatar: baseUrl + '/avatar/' + u.uid,
      isAdmin,
    }, accessToken, env);

    // 跳回登录前的页面（从 state 中解出）；state Cookie 本身 Max-Age 只有
    // 600 秒，不必在这里清除。
    // 注意：这里只能用对象形式下发单个 Set-Cookie。
    // 平台适配层可能用 headers.entries() 拼头部，写成数组/多条 Set-Cookie 会被合并成一条，
    // 导致会话 Cookie 被浏览器丢弃（表现为登录后 /api/auth/me 仍然 401）。
    return new Response(null, {
      status: 302,
      headers: {
        Location: unpackState(state),
        'Set-Cookie': setCookieHeader(COOKIE_NAME, session, SESSION_MAX_AGE, request, env),
        'Cache-Control': 'no-store',
      },
    });
  }

  // ── 当前用户 ──
  if (action === 'me') {
    const user = await verifySession(readCookie(request, COOKIE_NAME), env);
    if (!user) {
      return jsonNoStore({ ret: 1, msg: 'not_logged_in' }, 401);
    }
    // 只回传展示字段，access_token 等敏感内容留在服务端
    return jsonNoStore({
      ret: 0,
      data: {
        uid: user.uid,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        isAdmin: !!user.isAdmin,
      },
    });
  }

  // ── 签发短时管理令牌 ──
  // 仅会话有效 + 回源皮肤站确认 permission>=1 才签发，撤销权限后无法续签。
  if (action === 'token') {
    const user = await verifySession(readCookie(request, COOKIE_NAME), env);
    if (!user) {
      return jsonNoStore({ ret: 1, msg: 'not_logged_in' }, 401);
    }
    if (!user.at) {
      return jsonNoStore({ ret: 1, msg: 'session_expired' }, 401);
    }
    const perms = await fetchPermission(baseUrl, user.at);
    if (perms === null) {
      // access_token 失效或皮肤站不可用：要求重新登录，而不是沿用旧权限
      return jsonNoStore({ ret: 1, msg: 'session_expired' }, 401);
    }
    if (perms < 1) {
      return jsonNoStore({ ret: 1, msg: 'forbidden' }, 403);
    }
    const token = await createAdminToken(user.uid, env);
    return jsonNoStore({ ret: 0, data: { token, expiresIn: ADMIN_TOKEN_TTL } });
  }

  // ── 登出 ──
  if (action === 'logout') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': setCookieHeader(COOKIE_NAME, '', 0, request, env),
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response('Not found', { status: 404 });
}
