// src/api/aiDetect.js
// AI 检测助手：POST /api/ai-detect（Cloud Function，腾讯朱雀文本检测）
// 必须登录：请求带上 HttpOnly 会话 Cookie，由服务端校验。

const DETECT_URL = '/api/ai-detect';

/**
 * 检测文本是否由 AI 生成
 * @param {string} text 待检测文本
 * @param {boolean} isMerge 是否合并段落检测
 * @returns {Promise<{
 *   status: string,
 *   softmaxConfidence: number,
 *   ratioConfidence: number,
 *   labelsRatio: { human: number, ai: number, suspect: number },
 *   segments: Array<{ text: string, label: number, conf: number, order: number, position: number[] }>,
 *   usage: { totalTokens: number, makersTokens: number }
 * }>}
 */
export async function detectText(text, isMerge = true) {
  // 服务端上游超时 25s，这里留出余量；计时器覆盖到响应体读取完成
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 30000) : null;

  try {
    let res;
    try {
      res = await fetch(DETECT_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, isMerge }),
        signal: controller ? controller.signal : undefined,
      });
    } catch (e) {
      const timeout = controller && controller.signal.aborted;
      const err = new Error(timeout ? '检测超时，请缩短文本后重试' : '网络异常，请稍后重试');
      err.status = 0;
      throw err;
    }

    const data = await res.json().catch(() => {
      // 超时也可能发生在读取响应体阶段
      if (controller && controller.signal.aborted) {
        const err = new Error('检测超时，请缩短文本后重试');
        err.status = 0;
        throw err;
      }
      return { ret: 1, msg: '响应解析失败' };
    });
    if (!data || !res.ok || data.ret !== 0 || !data.data) {
      const err = new Error((data && data.msg) || `检测失败 (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data.data;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
