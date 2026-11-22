// cloud-functions/api/auth.js — Blessing Skin OAuth2 登录
//
// 流程：
//   GET  /api/auth/login     → 302 跳转到皮肤站授权页
//   GET  /api/auth/callback  → 用 code 换 token，拉取用户信息，写入会话 Cookie
//   GET  /api/auth/me        → 返回当前登录用户（基于会话 Cookie）
//   GET  /api/auth/logout    → 清除会话 Cookie
//
// 所需环境变量（在 EdgeOne 控制台配置）：
//   BS_CLIENT_ID      Blessing Skin OAuth 客户端 ID
//   BS_CLIENT_SECRET  Blessing Skin OAuth 客户端 Secret
//   BS_BASE_URL       皮肤站地址（如 https://mcskin.ecustvr.top）
//   ADMIN_TOKEN       活动管理令牌（复用）
//   OAUTH_STATE_SECRET 会话签名密钥（随机字符串）

const COOKIE_NAME = 'cic_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

function base64url(input) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(input)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(input) {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

// HMAC-SHA256 签名（Web Crypto）
async function sign(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64url(String.fromCharCode(...new Uint8Array(sig)));
}

async function createSession(userData, env) {
  const payload = base64url(JSON.stringify({
    uid: userData.uid,
    nickname: userData.nickname,
    email: userData.email,
    avatar: userData.avatar,
    isAdmin: !!userData.isAdmin,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }));
  const sig = await sign(payload, env.OAUTH_STATE_SECRET);
  return `${payload}.${sig}`;
}

async function verifySession(token, env) {
  if (!token || !env.OAUTH_STATE_SECRET) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = await sign(payload, env.OAUTH_STATE_SECRET);
  // 防时序攻击的常数时间比较
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  try {
    const data = JSON.parse(fromBase64url(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function setCookieHeader(value, maxAge) {
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();
  const baseUrl = (env.BS_BASE_URL || '').replace(/\/+$/, '');

  // ── 登录：跳转到皮肤站授权页 ──
  if (action === 'login') {
    if (!env.BS_CLIENT_ID || !baseUrl) {
      return new Response('OAuth 未配置', { status: 500 });
    }
    const state = base64url(JSON.stringify({
      t: Date.now(),
      n: Math.random().toString(36).slice(2),
    }));
    const redirectUri = `${url.origin}/api/auth/callback`;
    const authorizeUrl =
      `${baseUrl}/oauth/authorize?client_id=${encodeURIComponent(env.BS_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=&state=${state}`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizeUrl,
        // state 存入临时 Cookie 供回调校验
        'Set-Cookie': `cic_oauth_state=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax`,
      },
    });
  }

  // ── 回调：用 code 换 token，拉用户信息 ──
  if (action === 'callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieState = (request.headers.get('Cookie') || '')
      .split(';').map(s => s.trim())
      .find(s => s.startsWith('cic_oauth_state='));
    const expectedState = cookieState ? cookieState.split('=')[1] : null;

    if (!code || !state || !expectedState || state !== expectedState) {
      return new Response('授权状态校验失败', { status: 400 });
    }

    // code 换 access_token
    const tokenResp = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.BS_CLIENT_ID,
        client_secret: env.BS_CLIENT_SECRET,
        redirect_uri: `${url.origin}/api/auth/callback`,
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

    // Blessing Skin /api/user 返回 { data: { uid, nickname, email, ... } }
    const u = userData.data || userData;

    // 生成会话
    const session = await createSession({
      uid: u.uid,
      nickname: u.nickname,
      email: u.email,
      avatar: baseUrl + '/avatar/' + u.uid,
      isAdmin: false, // 默认非管理员；管理员通过 ADMIN 名单或皮肤站站点管理员标记另行判定
    }, env);

    // 跳回原页面
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/user/info',
        'Set-Cookie': `${COOKIE_NAME}=${session}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; SameSite=Lax`,
      },
    });
  }

  // ── 当前用户 ──
  if (action === 'me') {
    const cookie = (request.headers.get('Cookie') || '')
      .split(';').map(s => s.trim())
      .find(s => s.startsWith(`${COOKIE_NAME}=`));
    const token = cookie ? cookie.split('=').slice(1).join('=') : null;
    const user = await verifySession(token, env);
    if (!user) {
      return Response.json({ ret: 1, msg: 'not_logged_in' }, { status: 401 });
    }
    return Response.json({ ret: 0, data: user });
  }

  // ── 签发活动管理 token（已登录会话 → 短时 Bearer token）──
  // 用于前端调用 /api/activity/* 时携带的 Authorization header。
  // 直接复用 ADMIN_TOKEN（服务端间传递，不暴露给前端之外的第三方）。
  if (action === 'token') {
    const cookie = (request.headers.get('Cookie') || '')
      .split(';').map(s => s.trim())
      .find(s => s.startsWith(`${COOKIE_NAME}=`));
    const token = cookie ? cookie.split('=').slice(1).join('=') : null;
    const user = await verifySession(token, env);
    if (!user) {
      return Response.json({ ret: 1, msg: 'not_logged_in' }, { status: 401 });
    }
    if (!env.ADMIN_TOKEN) {
      return Response.json({ ret: 1, msg: 'server_not_configured' }, { status: 500 });
    }
    return Response.json({ ret: 0, data: { token: env.ADMIN_TOKEN } });
  }

  // ── 登出 ──
  if (action === 'logout') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
      },
    });
  }

  return new Response('Not found', { status: 404 });
}
