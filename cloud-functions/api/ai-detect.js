// cloud-functions/api/ai-detect.js — AI 检测助手（腾讯朱雀 AIGC 文本检测）
//
// POST /api/ai-detect
//   Cookie: cic_session=<登录会话>
//   Content-Type: application/json
//   { "text": "待检测文本", "isMerge": true }
//   返回: { ret: 0, data: { status, softmaxConfidence, ratioConfidence, labelsRatio, segments, usage } }
//
// 必须登录：校验 /api/auth 签发的 cic_session 会话（HttpOnly Cookie），
// 未登录或会话过期返回 401，不消耗模型额度。
//
// 所需环境变量（EdgeOne Pages 控制台）：
//   MAKERS_MODELS_KEY   EdgeOne Makers 内置模型密钥（Makers - Models - API Key），必填
//   OAUTH_STATE_SECRET  会话签名密钥，与 /api/auth 共用；缺失时 fail-closed
//
// 模型说明：https://cloud.tencent.com/document/product/1552/137539
//   labels_ratio / segment_labels 中 0=人工、1=AI、2=疑似 AI，
//   softmax_confidence、conf 越大表示越可能为 AI 生成。

const COOKIE_NAME = 'cic_session';
const UPSTREAM_URL = 'https://ai-gateway.edgeone.link/v1/providers/zhuque-text/classify';
const MAX_TEXT = 5000; // 单次检测字符上限，控制模型额度消耗
const MAX_BODY_BYTES = 64 * 1024; // 5000 字符的 JSON 远小于此值
const UPSTREAM_TIMEOUT = 25000; // 略小于平台函数执行上限，保证超时能返回 JSON

// ── CORS：只回显 SITE_URL 这一个来源（同源请求本来不需要 ACAO） ──
function corsHeaders(context) {
  const origin = context.request.headers.get('Origin');
  if (!origin) return {};
  const site = (context.env.SITE_URL || '').replace(/\/+$/, '');
  if (!site || origin.replace(/\/+$/, '') !== site) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(context, data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      // 检测结果不缓存，避免同一用户看到上一次的结果
      'Cache-Control': 'no-store',
      ...corsHeaders(context),
    },
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
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

async function hmac(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
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

function readCookie(request, name) {
  const cookie = (request.headers.get('Cookie') || '')
    .split(';').map(s => s.trim())
    .find(s => s.startsWith(`${name}=`));
  return cookie ? cookie.split('=').slice(1).join('=') : null;
}

// 校验 /api/auth 签发的会话：payload.signature
async function verifySession(token, env) {
  const secret = env.OAUTH_STATE_SECRET || '';
  if (!secret || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = await hmac(payload, secret);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(fromBase64url(payload));
    if (!(Number(data.exp) > Math.floor(Date.now() / 1000))) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// 只回传前端需要的字段，同时把 snake_case 转成 camelCase
function normalize(payload) {
  const labels = payload.labels_ratio || {};
  const usage = payload.usage || {};
  const makersUsage = payload.makers_models_usage || {};
  const list = Array.isArray(payload.segment_labels) ? payload.segment_labels : [];

  return {
    status: String(payload.status || ''),
    softmaxConfidence: toNumber(payload.softmax_confidence),
    ratioConfidence: toNumber(payload.ratio_confidence),
    labelsRatio: {
      human: toNumber(labels['0']),
      ai: toNumber(labels['1']),
      suspect: toNumber(labels['2']),
    },
    segments: list.map(seg => ({
      text: String(seg && seg.text != null ? seg.text : ''),
      label: toNumber(seg && seg.label),
      conf: toNumber(seg && seg.conf),
      order: toNumber(seg && seg.order),
      position: Array.isArray(seg && seg.position) ? seg.position : [],
    })),
    usage: {
      totalTokens: toNumber(usage.total_tokens),
      makersTokens: toNumber(makersUsage.total_tokens),
    },
  };
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context) });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. 配置缺失时 fail-closed，避免把配置问题误报成「未登录」
  if (!env.OAUTH_STATE_SECRET) {
    console.error('[ai-detect] OAUTH_STATE_SECRET 未配置');
    return json(context, { ret: 1, msg: '服务未配置，请联系管理员' }, 500);
  }
  const apiKey = env.MAKERS_MODELS_KEY || '';
  if (!apiKey) {
    console.error('[ai-detect] MAKERS_MODELS_KEY 未配置');
    return json(context, { ret: 1, msg: 'AI 检测服务未配置，请联系管理员' }, 500);
  }

  // 2. 必须登录：会话 Cookie 无效直接拒绝，不消耗模型额度
  const user = await verifySession(readCookie(request, COOKIE_NAME), env);
  if (!user) {
    return json(context, { ret: 1, msg: '请先登录后再使用 AI 检测助手' }, 401);
  }

  // 3. 请求体大小：先看 Content-Length 早拒，再按实际字节数兜底
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json(context, { ret: 1, msg: '请求体过大' }, 413);
  }

  let raw;
  try {
    raw = await request.text();
  } catch (e) {
    return json(context, { ret: 1, msg: '请求读取失败' }, 400);
  }
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(context, { ret: 1, msg: '请求体过大' }, 413);
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return json(context, { ret: 1, msg: '请求格式错误' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(context, { ret: 1, msg: '请求格式错误' }, 400);
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return json(context, { ret: 1, msg: '请输入需要检测的文本' }, 400);
  }
  if (text.length > MAX_TEXT) {
    return json(context, { ret: 1, msg: `文本不能超过 ${MAX_TEXT} 字` }, 400);
  }
  const isMerge = body.isMerge !== false;

  // 4. 调用 Makers 内置模型（密钥只留在服务端）
  // 手写 AbortController 超时，避免 AbortSignal.timeout 不可用时请求一直挂起
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
  try {
    let resp;
    try {
      resp = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, is_merge: isMerge }),
        signal: controller.signal,
      });
    } catch (e) {
      const timeout = controller.signal.aborted;
      console.error('[ai-detect] 上游请求失败:', e && e.message);
      return json(
        context,
        { ret: 1, msg: timeout ? '检测超时，请缩短文本后重试' : '检测服务暂时不可用' },
        timeout ? 504 : 502
      );
    }

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      // 读取错误体时也可能发生超时
      if (controller.signal.aborted) {
        return json(context, { ret: 1, msg: '检测超时，请缩短文本后重试' }, 504);
      }
      console.error(`[ai-detect] 上游返回 ${resp.status}:`, String(detail).slice(0, 300));
      const status = resp.status === 429 ? 429 : 502;
      return json(
        context,
        { ret: 1, msg: resp.status === 429 ? '检测请求过于频繁，请稍后再试' : '检测服务暂时不可用' },
        status
      );
    }

    let payload;
    try {
      payload = await resp.json();
    } catch (e) {
      // 超时可能发生在读取响应体阶段，需要与解析失败区分
      if (controller.signal.aborted) {
        return json(context, { ret: 1, msg: '检测超时，请缩短文本后重试' }, 504);
      }
      console.error('[ai-detect] 上游响应解析失败:', e && e.message);
      return json(context, { ret: 1, msg: '检测结果解析失败' }, 502);
    }

    if (!payload || payload.status !== 'success') {
      console.error('[ai-detect] 上游状态异常:', payload && payload.status, payload && payload.msg);
      return json(context, { ret: 1, msg: '检测失败，请稍后再试' }, 502);
    }

    return json(context, { ret: 0, data: normalize(payload) });
  } finally {
    clearTimeout(timer);
  }
}