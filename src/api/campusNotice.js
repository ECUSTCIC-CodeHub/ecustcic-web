// src/api/campusNotice.js
// 校园通知：浏览器直接跨域拉取 https://news.bestzyq.cn/news.json
// 上游由本站自行维护，已配置 CORS；该文件每天 20:30(UTC+8) 更新一次。
// 约定：GET、CORS 允许 *，无需服务端转发。

const DEFAULT_FEED = 'https://news.bestzyq.cn/news.json';
const FEED_URL = process.env.VUE_APP_CAMPUS_NOTICE_URL || DEFAULT_FEED;
const TIMEOUT = 4000; // 外部内容属于增强项，不能拖慢首页

function normalizeDate(value) {
  const text = String(value || '').trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (matched) return `${matched[1]}-${matched[2]}-${matched[3]}`;
  const date = new Date(text);
  if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return '';
}

function safeUrl(url) {
  const text = String(url || '').trim();
  return /^https?:\/\//i.test(text) ? text : '';
}

/**
 * 上游条目：{ title, link, date, source }
 * 缺标题或链接的条目无法展示/跳转，直接丢弃。
 */
function toNotice(raw) {
  if (!raw) return null;
  const title = String(raw.title || '').replace(/<[^>]*>/g, '').trim();
  const link = safeUrl(raw.link || raw.url);
  if (!title || !link) return null;
  return {
    title,
    link,
    date: normalizeDate(raw.date),
    source: String(raw.source || '').trim(),
  };
}

/**
 * 拉取校园通知。任何失败（超时/网络/CORS/格式异常）都返回空数组，由页面降级为"暂无"。
 * @param {number} [limit]
 * @returns {Promise<Array<{title:string, link:string, date:string, source:string}>>}
 */
export function getCampusNotices(limit) {
  if (typeof fetch !== 'function') return Promise.resolve([]);

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT) : null;

  return fetch(FEED_URL, {
    method: 'GET',
    mode: 'cors',
    // 上游是 Access-Control-Allow-Origin: *，不能带凭证
    credentials: 'omit',
    cache: 'default',
    signal: controller ? controller.signal : undefined,
  })
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      const raw = Array.isArray(data)
        ? data
        : data && Array.isArray(data.items)
          ? data.items
          : [];
      const items = raw
        .map(toNotice)
        .filter(Boolean)
        .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      return typeof limit === 'number' ? items.slice(0, limit) : items;
    })
    .catch(err => {
      console.warn('[校园通知] 加载失败:', err && err.message ? err.message : err);
      return [];
    })
    .then(list => {
      if (timer) clearTimeout(timer);
      return list;
    });
}
