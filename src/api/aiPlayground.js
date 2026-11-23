/**
 * AI 操练场：纯前端直连 OpenAI 兼容接口的 API 封装。
 *
 * - 配置（Base URL / API Key / 模型 / 消息体模板等）仅保存在浏览器 localStorage，
 *   不经过任何服务器，不同用户之间互不可见。
 * - 支持通过 URL 参数导入配置：/service/ai-playground?api=xxx&key=xxx（详见 parseUrlConfig）。
 * - 请求使用浏览器原生 fetch（SSE 流式读取），绕过全局 axios 拦截器
 *   （全局拦截器会注入 Authorization 并把 body 序列化成表单，不适合直连第三方 API）。
 * - 支持多模态图片输入（http/https 链接或 data: Base64 URL，配置字段 imagesEnabled / images），
 *   图片会注入到最后一条 user 消息（OpenAI content 数组格式）。
 * - 支持调试视图：buildPreviewRequest（含完整上下文）、buildActualRequest（仅当前消息）、
 *   sendMessage 回调 onEvent 逐条捕获 SSE 事件（含 [DONE]）。
 */

const STORAGE_KEY = 'ecustcic-ai-playground-v1';

/**
 * 默认配置。baseUrl 填到「版本根」即可（如 https://api.xxx.com/v1），
 * 会自动拼出 /chat/completions 与 /models 端点。
 */
export function defaultConfig() {
  return {
    name: '',
    baseUrl: 'https://ai.ecustcic.com/api/v1',
    apiKey: '',
    model: '',
    systemPrompt: '',
    // 采样参数：Enabled 为 false 时该参数不进请求体
    temperature: 0.7,
    temperatureEnabled: true,
    topP: 1,
    topPEnabled: false,
    frequencyPenalty: 0,
    frequencyPenaltyEnabled: false,
    presencePenalty: 0,
    presencePenaltyEnabled: false,
    maxTokens: 4096,
    maxTokensEnabled: true,
    seed: '',
    seedEnabled: false,
    stream: true,
    // 多模态：URL / Base64 Data URL 图片列表，启用后随最后一条用户消息发送
    imagesEnabled: false,
    images: [],
    // 自定义请求体模式（useCustom）：
    //   customTemplate 以 { 开头 → 作为 JSON 请求体模板发送
    //   否则 → 作为纯文本 prompt 发送
    useCustom: false,
    customTemplate: ''
  };
}

/** 默认值是空串、但语义为数字的配置项 */
const NUMERIC_STRING_FIELDS = ['seed'];

/** 该键是否按数值处理（数值输入框可能落盘为 number 或 string） */
export function isNumericField(key, fallback) {
  return typeof fallback === 'number' || NUMERIC_STRING_FIELDS.indexOf(key) !== -1;
}

/**
 * 配置值的类型兼容判定。
 * - 空值一律不合并
 * - 数组只接受数组，避免对象冒充列表
 * - 数值字段接受 number 或 string（含空串，表示「不填」）
 * - 其余字段要求同类型
 */
export function isCompatibleValue(saved, fallback, key) {
  if (saved === null || saved === undefined) return false;
  if (Array.isArray(fallback)) return Array.isArray(saved);
  if (isNumericField(key, fallback)) {
    // 空串表示「不填」；其余必须能解析为有限数值，避免脏字符串落盘后静默丢参
    if (typeof saved === 'string') return saved.trim() === '' || Number.isFinite(Number(saved));
    return typeof saved === 'number' && Number.isFinite(saved);
  }
  return typeof saved === typeof fallback;
}

export function loadConfig() {
  const base = defaultConfig();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) || {};
    // 只合并基础类型字段，避免旧版本脏数据混入
    Object.keys(base).forEach(key => {
      const incoming = saved[key];
      if (!isCompatibleValue(incoming, base[key], key)) return;
      base[key] = incoming;
    });
    // 旧版本保存过空 baseUrl 的，回落到站点默认接入
    if (!String(base.baseUrl).trim()) {
      base.baseUrl = defaultConfig().baseUrl;
    }
    return base;
  } catch (e) {
    return base;
  }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      throw new Error('浏览器本地存储空间不足，保存失败。内联 Base64 图片占用较大，建议改用图片 URL 或减少图片数量。');
    }
    return false;
  }
}

/**
 * 解析 URL 中的导入参数。示例：
 *   ?api=https://api.siliconflow.cn/v1&key=sk-xxx
 *   ?api=https://api.xxx.com/v1&key=sk-xxx&model=Qwen/Qwen2.5-7B-Instruct&name=我的配置
 * 解析结果只暂存在页面里，用户点击「导入」后才会写入 localStorage，避免随手点开链接覆盖配置。
 */
export function parseUrlConfig(query) {
  if (!query) return null;
  const api = query.api || query.endpoint || query.base || '';
  const key = query.key || query.apikey || query.k || '';
  if (!api && !key) return null;

  const config = defaultConfig();
  const model = query.model || '';
  const name = query.name || query.title || '';

  if (api) {
    const trimmed = String(api).trim();
    // 自定义模板模式约定：?api={...}&key=xxx，整段模板放在 api 参数里
    if (trimmed.indexOf('{') === 0) {
      const tpl = decodeURIComponentSafe(trimmed);
      let parsed = null;
      try {
        parsed = JSON.parse(tpl);
      } catch (e) {
        // 允许裸模板（如 {{messages}}）不严格是 JSON
        parsed = null;
      }
      config.useCustom = true;
      config.customTemplate = tpl;
      // 若是完整请求体模板，可以顺带带出 baseUrl / model 字段
      if (parsed) {
        if (typeof parsed.baseUrl === 'string' && parsed.baseUrl) {
          config.baseUrl = parsed.baseUrl;
        }
        if (typeof parsed.model === 'string' && parsed.model) {
          config.model = parsed.model;
        }
      }
    } else {
      config.baseUrl = normalizeBaseUrl(trimmed);
    }
  }
  if (key) config.apiKey = String(key).trim();
  if (model) config.model = String(model).trim();
  if (name) config.name = String(name).trim();

  return config;
}

function decodeURIComponentSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

/**
 * 规整 Base URL：
 *   https://api.xxx.com/v1/chat/completions → https://api.xxx.com/v1
 *   https://api.xxx.com/v1/                → https://api.xxx.com/v1
 * 兼容用户直接粘贴完整对话端点的习惯。
 */
export function normalizeBaseUrl(url) {
  let base = String(url || '').trim();
  if (base.indexOf('http://') !== 0 && base.indexOf('https://') !== 0) {
    base = 'https://' + base;
  }
  while (base.charAt(base.length - 1) === '/') {
    base = base.slice(0, -1);
  }
  if (base.slice(-17) === '/chat/completions') {
    base = base.slice(0, -17);
  }
  return base;
}

function authHeaders(apiKey) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers.Authorization = 'Bearer ' + apiKey;
    // 部分网关接受两种关键字，双保险
    headers['x-api-key'] = apiKey;
  }
  return headers;
}

/** 构造非流式响应 / 流式 SSE 中的文本提取函数 */
function extractChoiceText(obj) {
  if (!obj) return null;
  const choice = (obj.choices && obj.choices[0]) || null;
  if (!choice) return null;
  if (choice.message) return choice.message;
  if (choice.delta) return choice.delta;
  return choice.text ? { content: choice.text, reasoningContent: '' } : null;
}

/** 根据消息片段归类 SSE 事件类型 */
function detectEventType(message) {
  if (!message) return 'other';
  if (message.content) return 'content';
  if (message.reasoning_content || message.reasoningContent) return 'reasoning';
  if (typeof message.role === 'string' && message.role) return 'role';
  return 'empty';
}

/** 校验图片地址：允许 http(s) 链接或 data: Base64 URL */
function validImageUrl(value) {
  const v = String(value || '').trim();
  return /^https?:\/\//i.test(v) || /^data:image\/[a-z0-9.+-]+;base64,/i.test(v);
}

/** 清洗图片列表：去空白、去重复，只保留合法地址 */
export function sanitizeImages(images) {
  if (!Array.isArray(images)) return [];
  const seen = {};
  const list = [];
  images.forEach(item => {
    const url = String(item || '').trim();
    if (!url || seen[url] || !validImageUrl(url)) return;
    seen[url] = true;
    list.push(url);
  });
  return list;
}

/**
 * 构造预览请求体：完整上下文（历史消息 + system）。
 * 预览反映"下一轮真实发送"的内容，因此不包含当前正在输入、尚未发送的文本。
 * 调用方若已在 messages 首条放入 system，这里不再重复注入。
 */
export function buildPreviewRequest(config, messages) {
  const history = [];
  const list = Array.isArray(messages) ? messages : [];
  // 调用方已带有效 system 时不再注入，避免重复（含历史中间出现 system 的情况）
  const hasSystem = list.some(msg => msg && msg.role === 'system' && String(msg.content || '').trim());
  const sys = String(config.systemPrompt || '').trim();
  if (sys && !hasSystem) history.push({ role: 'system', content: sys });
  list.forEach(msg => {
    const content = String(msg.content || '').trim();
    if (!content) return;
    history.push({ role: msg.role, content });
  });
  return buildRequestPayload(config, scopeImages(config), history);
}

/**
 * 构造实际请求体：只含本轮 user 消息（无历史上下文）。
 * 模板占位符渲染时看到的 history 仅这一条消息。
 */
export function buildActualRequest(config, question) {
  const text = String(question || '').trim() || '（空消息）';
  return buildRequestPayload(config, scopeImages(config), [
    { role: 'user', content: text }
  ]);
}

/** 采样参数：配置字段 → OpenAI 请求字段，附合法区间与是否取整 */
export const SAMPLING_PARAMS = [
  { key: 'temperature', wire: 'temperature', min: 0, max: 2 },
  { key: 'topP', wire: 'top_p', min: 0, max: 1 },
  { key: 'frequencyPenalty', wire: 'frequency_penalty', min: -2, max: 2 },
  { key: 'presencePenalty', wire: 'presence_penalty', min: -2, max: 2 },
  { key: 'maxTokens', wire: 'max_tokens', min: 1, max: 1048576, integer: true }
];

export const SEED_RANGE = [0, 2147483647];

/** 收敛到合法区间；整数字段取整 */
function clampNumber(value, min, max, integer) {
  let num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (integer) num = Math.round(num);
  if (num < min) num = min;
  if (num > max) num = max;
  return num;
}

/** 空值 / 非数值返回 null，避免 Number('') === 0 把「不填」误发成 0 */
function toOptionalNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/** 开关未启用时不携带图片 */
function scopeImages(config) {
  return config.imagesEnabled ? sanitizeImages(config.images) : [];
}

function buildRequestPayload(config, images, history) {
  const scopedConfig = Object.assign({}, config, { images });
  if (!scopedConfig.useCustom) {
    const payload = {
      model: scopedConfig.model,
      messages: history.slice()
    };
    SAMPLING_PARAMS.forEach(param => {
      if (!scopedConfig[param.key + 'Enabled']) return;
      const raw = toOptionalNumber(scopedConfig[param.key]);
      if (raw === null) return;
      const num = clampNumber(raw, param.min, param.max, param.integer);
      if (num === null) return;
      payload[param.wire] = num;
    });
    if (scopedConfig.seedEnabled) {
      const rawSeed = toOptionalNumber(scopedConfig.seed);
      if (rawSeed !== null) {
        const seed = clampNumber(rawSeed, SEED_RANGE[0], SEED_RANGE[1], true);
        if (seed !== null) payload.seed = seed;
      }
    }
    if (scopedConfig.stream) {
      payload.stream = true;
    }
    if (scopedConfig.customTemplate && String(scopedConfig.customTemplate).trim()) {
      // 允许在常规模式下追加额外字段（如 top_p）：每行一个 "key: value"
      mergeExtraLines(payload, scopedConfig.customTemplate);
    }
    if (scopedConfig.images.length) {
      appendImagesToPayload(payload, scopedConfig.images);
    }
    return { payload, outputPath: '' };
  }

  const template = String(scopedConfig.customTemplate || '').trim();

  // 完整请求体模板模式：模板里的 outputPath 字段声明响应提取路径，发送前移除
  if (template.indexOf('{') === 0) {
    const hasImagePlaceholder = template.indexOf('{{images}}') !== -1;
    const scopedImages = hasImagePlaceholder ? [] : images;
    const rendered = renderJsonTemplate(template, scopedConfig, history, scopedImages);
    let body;
    try {
      body = JSON.parse(rendered);
    } catch (e) {
      throw new Error('自定义请求体模板渲染后不是合法 JSON，请检查占位符/引号转义：' + e.message);
    }
    const outputPath = typeof body.outputPath === 'string' ? body.outputPath : '';
    delete body.outputPath;
    if (scopedImages.length) {
      appendImagesToPayload(body, scopedImages);
    }
    return { payload: body, outputPath };
  }

  // 纯文本 prompt 模式：占位符原样替换，不做 JSON 转义
  return {
    payload: {
      prompt: renderTextTemplate(template, scopedConfig, history, images),
      stream: !!scopedConfig.stream
    },
    outputPath: ''
  };
}

/**
 * 图片注入：追加到最后一条 user 消息上（content 变为多模态数组）。
 * - 已经是多模态数组：直接补 image_url 分片
 * - 纯文本：转 [{'type':'text',...}, {'type':'image_url',...}]
 */
function appendImagesToPayload(payload, images) {
  if (!images.length || !Array.isArray(payload.messages)) return;
  for (let i = payload.messages.length - 1; i >= 0; i--) {
    if (payload.messages[i].role !== 'user') continue;
    const content = payload.messages[i].content;
    const parts = Array.isArray(content)
      ? content.filter(part => part && typeof part === 'object')
      : [{ type: 'text', text: String(content == null ? '' : content) }];
    images.forEach(url => {
      parts.push({ type: 'image_url', image_url: { url } });
    });
    payload.messages[i].content = parts;
    return;
  }
}

/**
 * 发送一条（一组）消息。
 * @param {object} config loadConfig 出来的配置
 * @param {Array}  messages [{role, content}] 本轮要发送的完整历史
 * @param {{ onDelta(text), onReasoning(text), onEvent(event), signal, outputPath }} handlers 流式回调
 * @returns {Promise<{content, reasoning, usage, raw, events}>}
 */
export async function sendMessage(config, messages, handlers) {
  const opts = handlers || {};
  const custom = config.useCustom;
  const url = custom
    ? normalizeRequestUrl(config.baseUrl)
    : normalizeBaseUrl(config.baseUrl) + '/chat/completions';

  const { payload, outputPath: templateOutputPath } = buildRequestPayload(config, scopeImages(config), messages);
  const outputPath = opts.outputPath || templateOutputPath;
  const headers = authHeaders(config.apiKey);
  const stream = config.stream;

  // fetch 不经过 axios，避免全局拦截器改写 body / 头部
  const aborter = new AbortController();
  if (opts.signal) {
    opts.signal.addEventListener('abort', () => aborter.abort(), { once: true });
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: opts.signal || aborter.signal
    });
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    const msg = (e && e.message) || '';
    if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
      throw new Error('网络请求失败：可能是 Base URL 写错、目标站点禁用了跨域（CORS），或需要校园网 / 代理环境');
    }
    throw new Error('网络请求失败：' + msg);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        detail = (data.error && data.error.message) || data.message || text;
      } catch (err) {
        detail = text;
      }
    } catch (e) {
      detail = '';
    }
    detail = String(detail || '').slice(0, 300);
    throw new Error('请求失败（HTTP ' + response.status + (response.statusText ? ' ' + response.statusText : '') + '）' + (detail ? '：' + detail : ''));
  }

  // ---------- 非流式 ----------
  if (!stream) {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('响应不是合法的 JSON，请确认 Base URL 指向的是 OpenAI 兼容接口');
    }
    const message = extractChoiceText(data) || {};
    return {
      content: message.content || '',
      reasoning: message.reasoning_content || message.reasoningContent || '',
      usage: data.usage || null,
      raw: data
    };
  }

  // ---------- 流式 SSE ----------
  if (!response.body || typeof response.body.getReader !== 'function') {
    // 极旧浏览器兜底：一次性读完整文本
    const text = await response.text();
    const deltaMatch = text.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    return { content: deltaMatch ? decodeJsonString(deltaMatch[1]) : text, reasoning: '', usage: null, raw: null };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let rawText = '';
  let content = '';
  let reasoning = '';
  let usage = null;
  const events = [];
  let readError = null;

  for (;;) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      readError = e;
      break;
    }
    if (chunk.done) break;
    const text = decoder.decode(chunk.value, { stream: true });
    rawText += text;
    buffer += text;

    // 仅支持 OpenAI 兼容的单行 data: 流（不聚合跨行 data，不解析 event:/id: 字段）
    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).replace(/\r$/, '');
      buffer = buffer.slice(idx + 1);
      if (!line || line.charAt(0) === ':') continue;
      if (line.indexOf('data:') !== 0) continue;
      const dataStr = line.slice(5).trim();

      // 结束标记事件
      if (dataStr === '[DONE]') {
        events.push({ seq: events.length + 1, type: 'done', id: '', parsed: null, raw: '[DONE]' });
        if (opts.onEvent) opts.onEvent(events[events.length - 1]);
        continue;
      }
      if (!dataStr) continue;

      let parsed;
      try {
        parsed = JSON.parse(dataStr);
      } catch (e) {
        events.push({ seq: events.length + 1, type: 'other', id: '', parsed: null, raw: dataStr });
        if (opts.onEvent) opts.onEvent(events[events.length - 1]);
        continue;
      }
      if (parsed.usage) usage = parsed.usage;

      const message = extractChoiceText(parsed);
      const event = {
        seq: events.length + 1,
        type: detectEventType(message),
        id: typeof parsed.id === 'string' ? parsed.id : '',
        parsed,
        raw: dataStr
      };
      events.push(event);
      if (opts.onEvent) opts.onEvent(event);

      if (!message) continue;
      const rc = message.reasoning_content || message.reasoningContent || '';
      const cc = message.content || '';
      if (rc) {
        reasoning += rc;
        if (opts.onReasoning) opts.onReasoning(rc);
      }
      if (cc) {
        content += cc;
        if (opts.onDelta) opts.onDelta(cc);
      }
    }
  }

  rawText += decoder.decode();
  if (buffer.trim()) {
    const line = buffer.replace(/\r$/, '');
    buffer = '';
    if (line && line.charAt(0) !== ':' && line.indexOf('data:') === 0) {
      const dataStr = line.slice(5).trim();
      if (dataStr === '[DONE]') {
        events.push({ seq: events.length + 1, type: 'done', id: '', parsed: null, raw: '[DONE]' });
        if (opts.onEvent) opts.onEvent(events[events.length - 1]);
      } else if (dataStr) {
        let parsed;
        try {
          parsed = JSON.parse(dataStr);
        } catch (e) {
          parsed = null;
        }
        const event = parsed
          ? {
              seq: events.length + 1,
              type: detectEventType(extractChoiceText(parsed)),
              id: typeof parsed.id === 'string' ? parsed.id : '',
              parsed,
              raw: dataStr
            }
          : { seq: events.length + 1, type: 'other', id: '', parsed: null, raw: dataStr };
        events.push(event);
        if (opts.onEvent) opts.onEvent(event);
        if (parsed && parsed.usage) usage = parsed.usage;
        const extraText = extractChoiceText(parsed);
        if (extraText && extraText.content) {
          content += extraText.content;
          if (opts.onDelta) opts.onDelta(extraText.content);
        }
        if (extraText) {
          const extraReasoning = extraText.reasoning_content || extraText.reasoningContent || '';
          if (extraReasoning) {
            reasoning += extraReasoning;
            if (opts.onReasoning) opts.onReasoning(extraReasoning);
          }
        }
      }
    }
  }

  // 自定义模式兜底：后端未按 SSE 返回（如普通 JSON）时，用整段响应再解析一次
  let rawBody = null;
  if (custom && !content && !reasoning && rawText.trim()) {
    let parsed = null;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch (e) {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object') {
      rawBody = parsed;
      content = extractCustomContent(parsed, opts.outputPath || outputPath);
    }
  }

  if (readError && !content && !reasoning) {
    throw new Error('流式响应读取失败：' + ((readError && readError.message) || '网络异常'));
  }

  if (readError) {
    const message = '响应流中断：' + ((readError && readError.message) || '网络异常');
    const event = {
      seq: events.length + 1,
      type: 'error',
      id: '',
      parsed: null,
      raw: message
    };
    events.push(event);
    if (opts.onEvent) opts.onEvent(event);
    return { content, reasoning, usage, raw: rawBody, events, interrupted: message };
  }

  return { content, reasoning, usage, raw: rawBody, events, interrupted: null };
}

/** 拉取模型列表：GET {baseUrl}/models */
export async function fetchModels(config) {
  const url = normalizeBaseUrl(config.baseUrl) + '/models';
  let response;
  try {
    response = await fetch(url, { method: 'GET', headers: authHeaders(config.apiKey) });
  } catch (e) {
    throw new Error('拉取模型列表失败：' + ((e && e.message) || '网络异常'));
  }
  if (!response.ok) {
    throw new Error('拉取模型列表失败（HTTP ' + response.status + '），可手动填写模型名');
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('模型列表响应不是合法 JSON');
  }
  const list = (data.data || data.models || data) || [];
  if (!Array.isArray(list)) return [];
  return list
    .map(item => {
      if (typeof item === 'string') return item;
      if (item) return item.id || item.name || item.model || '';
      return '';
    })
    .filter(Boolean)
    .sort();
}

/** 按 JSON Path 风格从响应里取文本（仅支持 a.b.c / a.0.b），供自定义模式渲染 */
function pickByPath(obj, path) {
  const parts = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (cur === null || cur === undefined) return '';
    if (Object.prototype.hasOwnProperty.call(cur, key)) {
      cur = cur[key];
    } else if (/^\d+$/.test(key)) {
      cur = cur[Number(key)];
    } else {
      return '';
    }
  }
  if (cur === null || cur === undefined) return '';
  return typeof cur === 'object' ? JSON.stringify(cur) : String(cur);
}

/** 自定义模式下根据模板决定请求地址：模板主体里若带 __requestUrl 则优先 */
function normalizeRequestUrl(baseUrl) {
  const base = String(baseUrl || '').trim();
  if (!base) throw new Error('自定义模式下 baseUrl 不能为空');
  if (base.indexOf('http://') === 0 || base.indexOf('https://') === 0) return base;
  throw new Error('自定义请求体模式下 baseUrl 必须是完整的 http(s) 地址');
}

/** 最新一条用户消息的内容 */
function lastUserQuestion(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  const last = messages[messages.length - 1] || {};
  return typeof last.content === 'string' ? last.content : '';
}

/**
 * JSON 请求体模板渲染：按占位符所在位置适配 JSON 语法。
 *  - 位于引号内（如 "content": "{{question}}"）→ 插入转义后的文本，不额外加引号；
 *  - 裸位置（如 "history": {{messages}}）→ 内联完整 JSON 值（字符串/数组/对象）。
 */
function renderJsonTemplate(template, config, messages, images) {
  const values = {
    messages,
    question: lastUserQuestion(messages),
    model: config.model || '',
    images
  };
  return template.replace(/\{\{(messages|question|model|images)\}\}/g, (match, name, offset, full) => {
    const value = values[name];
    if (insideJsonString(full, offset)) {
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      return JSON.stringify(text).slice(1, -1);
    }
    return JSON.stringify(value);
  });
}

/** 判断模板中 offset 处的占位符是否位于未闭合的 JSON 字符串内 */
function insideJsonString(text, offset) {
  let inString = false;
  for (let i = 0; i < offset; i++) {
    if (text.charAt(i) === '"' && text.charAt(i - 1) !== '\\') inString = !inString;
  }
  return inString;
}

/**
 * 纯文本 prompt 模板渲染：占位符仅做原样替换。
 *  - {{question}} → 最新一条用户消息内容；
 *  - {{messages}} / {{model}} → 对话历史的 JSON 文本 / 模型名。
 *  - {{images}} → 图片地址数组的 JSON 文本。
 */
function renderTextTemplate(template, config, messages, images) {
  const question = lastUserQuestion(messages);
  return template
    .replace(/\{\{question\}\}/g, question)
    .replace(/\{\{messages\}\}/g, JSON.stringify(messages))
    .replace(/\{\{images\}\}/g, JSON.stringify(images || []))
    .replace(/\{\{model\}\}/g, config.model || '');
}

/** 常规模式下的附加参数：支持 "top_p: 0.9"、"max_tokens: 1024" 这样的行 */
function mergeExtraLines(payload, extra) {
  String(extra)
    .split('\n')
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const pos = trimmed.indexOf(':');
      if (pos === -1) return;
      const key = trimmed.slice(0, pos).trim();
      let value = trimmed.slice(pos + 1).trim();
      try {
        value = JSON.parse(value);
      } catch (err) {
        // 保留字符串原样
      }
      payload[key] = value;
    });
}

/** 把 JSON 字符串里的 \n \" 等还原（用于极简版非流式解析） */
function decodeJsonString(str) {
  try {
    return JSON.parse('"' + str + '"');
  } catch (e) {
    return str;
  }
}

/** 自定义模式：从响应 JSON 中按模板声明的路径提取文本 */
export function extractCustomContent(rawBody, outputPath) {
  if (!rawBody) return '';
  if (outputPath) {
    const picked = pickByPath(rawBody, outputPath);
    if (picked) return picked;
  }
  const message = extractChoiceText(rawBody);
  if (message && typeof message.content === 'string') return message.content;
  return typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
}
