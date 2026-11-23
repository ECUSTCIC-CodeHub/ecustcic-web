<template>
  <div class="ai-detect">
    <div class="ai-head">
      <div class="container">
        <router-link :to="{ name: 'service' }" class="back-link">
          <i class="fas fa-arrow-left"></i> 返回工具箱
        </router-link>
        <span class="head-tag">CIC · SERVICE</span>
        <h1>AI 检测助手</h1>
        <p>基于腾讯朱雀模型，判断一段文字更像人工写作还是 AI 生成</p>
      </div>
    </div>

    <div class="container ai-body">
      <!-- 登录态检查中 -->
      <div v-if="authLoading" class="text-center py-5 auth-loading">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3 mb-0">正在校验登录状态…</p>
      </div>

      <!-- 未登录：必须登录后使用 -->
      <div v-else-if="!user" class="gate cic-card">
        <div class="gate-icon" aria-hidden="true">
          <i class="fas fa-user-lock"></i>
        </div>
        <h4>需要登录</h4>
        <p class="gate-desc">AI 检测助手仅对已登录用户开放，请使用 ECUSTMC 用户中心账号登录。</p>
        <a :href="loginHref" class="btn btn-cic gate-btn">
          <i class="fas fa-sign-in-alt"></i>
          <span>使用 ECUSTMC 登录</span>
        </a>
      </div>

      <template v-else>
        <div class="cic-card input-card">
          <div class="card-head">
            <h5>待检测文本</h5>
            <span class="hint">建议输入 100 字以上，结果更准确</span>
          </div>
          <textarea
            v-model="text"
            class="detect-input"
            rows="10"
            placeholder="粘贴或输入需要检测的文本…"
            aria-label="待检测文本"
            :disabled="loading"
          ></textarea>
          <div class="input-foot">
            <label class="merge-toggle">
              <input type="checkbox" v-model="isMerge" :disabled="loading" />
              <span>合并段落检测</span>
            </label>
            <span class="char-count" :class="{ over: textLength > MAX_TEXT }">
              {{ textLength }} / {{ MAX_TEXT }}
            </span>
            <button
              type="button"
              class="btn btn-cic detect-btn"
              :disabled="loading || !textLength || textLength > MAX_TEXT"
              @click="submit"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
              <i v-else class="fas fa-magnifying-glass mr-2"></i>
              {{ loading ? '检测中…' : '开始检测' }}
            </button>
          </div>
          <p v-if="error" class="error-text" role="alert">
            <i class="fas fa-circle-exclamation mr-1"></i>{{ error }}
          </p>
        </div>

        <div v-if="result" class="cic-card result-card">
          <div class="verdict" :class="'tone-' + verdict.tone">
            <div class="verdict-score">{{ percent(result.softmaxConfidence) }}</div>
            <div class="verdict-text">
              <div class="verdict-title">{{ verdict.title }}</div>
              <div class="verdict-sub">整体风险置信度，数值越高越可能由 AI 生成</div>
            </div>
          </div>

          <div v-if="result.labelsRatio" class="ratio-block">
            <div class="ratio-bar">
              <span class="bar-human" :style="{ width: width(result.labelsRatio.human) }"></span>
              <span class="bar-ai" :style="{ width: width(result.labelsRatio.ai) }"></span>
              <span class="bar-suspect" :style="{ width: width(result.labelsRatio.suspect) }"></span>
            </div>
            <div class="ratio-legend">
              <span><i class="dot dot-human"></i>人工创作 {{ percent(result.labelsRatio.human) }}</span>
              <span><i class="dot dot-suspect"></i>疑似 AI {{ percent(result.labelsRatio.suspect) }}</span>
              <span><i class="dot dot-ai"></i>AI 生成 {{ percent(result.labelsRatio.ai) }}</span>
            </div>
          </div>

          <div v-if="!resultIsMerge && result.segments && result.segments.length" class="segments">
            <h6 class="segments-title">分段结果</h6>
            <div class="segment-list">
              <div v-for="(seg, i) in result.segments" :key="i" class="segment">
                <div class="segment-head">
                  <span class="seg-badge" :class="labelClass(seg.label)">{{ labelText(seg.label) }}</span>
                  <span class="seg-conf">AI 风险 {{ percent(seg.conf) }}</span>
                </div>
                <p class="seg-text">{{ seg.text }}</p>
              </div>
            </div>
          </div>

          <p class="disclaimer">
            <i class="fas fa-circle-info mr-1"></i>
            检测结果由模型统计特征给出，仅供参考，不能作为抄袭或学术不端的判定依据。文本仅用于本次检测，本站不保存内容。
          </p>
        </div>

      </template>

      <p class="official-link">
        需要检测图片？可前往「腾讯朱雀 AI 检测」：
        <a
          href="https://matrix.tencent.com/ai-detect/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://matrix.tencent.com/ai-detect/
          <i class="fas fa-external-link-alt fa-xs" aria-hidden="true"></i>
          <span class="sr-only">（在新窗口打开）</span>
        </a>
      </p>
      <p class="official-note">本工具的文本检测 API 由腾讯朱雀提供支持。</p>
    </div>
  </div>
</template>

<script>
import { fetchCurrentUser, loginUrl } from '@/api/adminAuth';
import { detectText } from '@/api/aiDetect';

const MAX_TEXT = 5000;

export default {
  name: 'ai-detect',
  data() {
    return {
      MAX_TEXT,
      user: null,
      authLoading: true,
      // 登录成功后跳回本页
      loginHref: loginUrl(),
      text: '',
      isMerge: true,
      loading: false,
      error: '',
      result: null,
      // 记录产生当前结果时的检测模式，避免切换开关后展示与实际请求不符
      resultIsMerge: true
    };
  },
  computed: {
    // 与后端一致：按 trim 后的长度计数，首尾空白不计入
    textLength() {
      return this.text.trim().length;
    },
    verdict() {
      if (!this.result) return null;
      const c = Number(this.result.softmaxConfidence) || 0;
      if (c >= 0.8) return { title: '高度疑似 AI 生成', tone: 'danger' };
      if (c >= 0.5) return { title: '疑似 AI 生成', tone: 'warn' };
      if (c >= 0.2) return { title: '存在 AI 生成可能', tone: 'warn' };
      return { title: '更像人工创作', tone: 'ok' };
    }
  },
  async created() {
    this.user = await fetchCurrentUser();
    this.authLoading = false;
  },
  methods: {
    percent(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return '0%';
      const p = Math.min(Math.max(n, 0), 1) * 100;
      return (p >= 10 ? p.toFixed(1) : p.toFixed(2)) + '%';
    },
    width(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return '0%';
      return Math.min(Math.max(n, 0), 1) * 100 + '%';
    },
    labelText(label) {
      if (label === 1) return 'AI 生成';
      if (label === 2) return '疑似 AI';
      return '人工';
    },
    labelClass(label) {
      if (label === 1) return 'seg-ai';
      if (label === 2) return 'seg-suspect';
      return 'seg-human';
    },
    async submit() {
      const content = this.text.trim();
      if (!content) {
        this.error = '请输入需要检测的文本';
        return;
      }
      if (content.length > MAX_TEXT) {
        this.error = `文本不能超过 ${MAX_TEXT} 字`;
        return;
      }

      this.loading = true;
      this.error = '';
      this.result = null;
      try {
        const data = await detectText(content, this.isMerge);
        this.result = data;
        this.resultIsMerge = this.isMerge;
      } catch (e) {
        if (e.status === 401) {
          // 会话过期：回到未登录态，引导重新登录
          this.user = null;
        } else {
          this.error = e.message || '检测失败，请稍后再试';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.ai-head {
  padding: 2.4rem 0 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #eef6fc 0%, #e5effa 100%);
  border-bottom: 1px solid var(--line);
  text-align: left;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
  color: var(--accent-dark);
  font-size: 0.85rem;
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
  text-decoration: none;
}

.head-tag {
  display: block;
  color: #2470a0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  margin-bottom: 0.5rem;
}

.ai-head h1 {
  font-size: 2.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.ai-head p {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.95rem;
}

@media (min-width: 992px) {
  /* 桌面端导航栏是 absolute 悬浮在顶部，留出高度避免遮住返回链接与标题 */
  .ai-head {
    padding-top: 5.5rem;
  }
}

.ai-body {
  max-width: 860px;
  padding-bottom: 4rem;
  text-align: left;
}

.auth-loading {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gate {
  max-width: 520px;
  margin: 0.5rem auto 2rem;
  padding: 2.6rem 2rem 2.4rem;
  text-align: center;
}

.gate:hover {
  cursor: default;
}

.gate-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.gate-icon i {
  font-size: 1.6rem;
  line-height: 1;
}

.gate h4 {
  font-weight: 700;
  margin-bottom: 0.55rem;
}

.gate-desc {
  max-width: 360px;
  margin: 0 auto 1.6rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
  line-height: 1.7;
}

.gate-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0.5rem 1.35rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.gate-btn i {
  font-size: 0.85rem;
  line-height: 1;
  /* 不在此处染 color，继承 .btn-cic 的白色，避免与按钮背景同色 */
  color: inherit;
}

.input-card {
  padding: 1.5rem 1.6rem;
  margin-bottom: 1.5rem;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.9rem;
}

.card-head h5 {
  margin: 0;
  font-weight: 700;
  color: var(--ink);
}

.card-head .hint {
  font-size: 0.78rem;
  color: var(--ink-muted);
}

.detect-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  color: var(--ink);
  font-size: 0.92rem;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.detect-input:focus {
  outline: none;
  border-color: rgba(52, 152, 219, 0.6);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.12);
  background: #fff;
}

.input-foot {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.merge-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
  cursor: pointer;
}

.merge-toggle input {
  cursor: pointer;
}

.char-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

.char-count.over {
  color: #dc2626;
  font-weight: 600;
}

.detect-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
}

.detect-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.error-text {
  margin: 0.9rem 0 0;
  color: #dc2626;
  font-size: 0.85rem;
}

.result-card {
  padding: 1.5rem 1.6rem;
}

.verdict {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.2rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.verdict-score {
  flex: none;
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.verdict-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.verdict-sub {
  margin-top: 0.2rem;
  font-size: 0.78rem;
  opacity: 0.8;
}

.tone-ok {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

.tone-warn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

.tone-danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.ratio-block {
  margin-top: 1.4rem;
}

.ratio-bar {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--line);
}

.ratio-bar span {
  display: block;
  height: 100%;
  transition: width 0.4s ease;
}

.bar-human {
  background: #34d399;
}

.bar-ai {
  background: #ef4444;
}

.bar-suspect {
  background: #f59e0b;
}

.ratio-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.7rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.35rem;
}

.dot-human {
  background: #34d399;
}

.dot-ai {
  background: #ef4444;
}

.dot-suspect {
  background: #f59e0b;
}

.segments {
  margin-top: 1.6rem;
}

.segments-title {
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.7rem;
}

.segment-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 0.3rem;
}

.segment {
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
}

.segment + .segment {
  margin-top: 0.6rem;
}

.segment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.4rem;
}

.seg-badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.seg-human {
  background: #ecfdf5;
  color: #047857;
}

.seg-ai {
  background: #fef2f2;
  color: #b91c1c;
}

.seg-suspect {
  background: #fffbeb;
  color: #b45309;
}

.seg-conf {
  font-size: 0.75rem;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
}

.seg-text {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--ink-soft);
  white-space: pre-wrap;
  word-break: break-word;
}

.disclaimer {
  margin: 1.4rem 0 0;
  font-size: 0.76rem;
  line-height: 1.6;
  color: var(--ink-muted);
}

.official-link {
  margin: 1.5rem 0 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--ink-muted);
  word-break: break-word;
}

.official-link a {
  color: var(--accent-dark);
  word-break: break-all;
}

.official-note {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: var(--ink-muted);
}
</style>

