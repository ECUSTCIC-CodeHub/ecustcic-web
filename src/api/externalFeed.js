// src/api/externalFeed.js
// 外部内容源：AI 站公告（https://ai.ecustcic.com/api/public/notices）
// 浏览器端直接跨域拉取，与本站快讯合并后按日期总体倒序展示。
// 约定：GET、CORS 允许 *、可带 Cache-Control 让浏览器缓存，无需任何服务端转发。

const DEFAULT_FEED = 'https://ai.ecustcic.com/api/public/notices';
const FEED_URL = process.env.VUE_APP_AI_FEED_URL || DEFAULT_FEED;
const TIMEOUT = 2500; // AI 站不可用时不能拖慢首页

export const AI_SOURCE = 'ai';
export const AI_SOURCE_LABEL = '大模型网关';

function normalizeDate(value) {
  const text = String(value || '').trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (matched) return `${matched[1]}-${matched[2]}-${matched[3]}`;
  const date = new Date(text);
  if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return '';
}

function isSafeUrl(url) {
  // 只允许 http(s)，避免数据被污染后注入 javascript:
  return /^https?:\/\//i.test(String(url || ''));
}

/**
 * 把 AI 站公告转成与本站内容同构的条目，便于统一排序与渲染
 * @returns {{id:string, source:string, title:string, date:string, summary:string, link:string}|null}
 */
export function toNewsItem(notice) {
  if (!notice) return null;
  const url = String(notice.url || '').trim();
  const item = {
    id: 'ai-' + String(notice.id === undefined ? notice.url : notice.id),
    source: AI_SOURCE,
    title: String(notice.title || '').trim(),
    date: normalizeDate(notice.date),
    summary: String(notice.summary || '').trim(),
    link: isSafeUrl(url) ? url : ''
  };
  // 缺标题/日期/链接的条目无法展示或跳转，直接丢弃
  if (!item.title || !item.date || !item.link) return null;
  return item;
}

/**
 * 合并多个来源的内容并按日期倒序
 * @param {Array} list
 * @param {number} [limit]
 */
export function mergeByDate(list, limit) {
  const sorted = list.slice().sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  );
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

/**
 * 拉取 AI 站公告。任何失败（超时/网络/CORS/格式异常）都返回空数组，不影响本站内容。
 * @param {number} [limit]
 * @returns {Promise<Array>}
 */
export function getAiNotices(limit) {
  if (typeof fetch !== 'function') return Promise.resolve([]);

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT) : null;

  return fetch(FEED_URL, {
    method: 'GET',
    mode: 'cors',
    // AI 站是 Access-Control-Allow-Origin: *，不能带凭证
    credentials: 'omit',
    cache: 'default',
    signal: controller ? controller.signal : undefined
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      const raw = data && Array.isArray(data.items) ? data.items : [];
      const items = raw.map(toNewsItem).filter(Boolean);
      return typeof limit === 'number' ? items.slice(0, limit) : items;
    })
    .catch(err => {
      // 静默降级：公告属于增强内容，失败不该在页面上报错
      console.warn('[AI Feed] 公告加载失败:', err && err.message ? err.message : err);
      return [];
    })
    .then(list => {
      if (timer) clearTimeout(timer);
      return list;
    });
}
