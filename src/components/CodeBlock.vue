<template>
  <div class="code-block">
    <button type="button" class="code-copy-btn" :title="copied ? '已复制' : '复制'" @click="copy">
      <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
    </button>
    <pre class="code-pre"><code>{{ code }}</code></pre>
  </div>
</template>

<script>
export default {
  name: 'code-block',
  props: {
    code: { type: String, default: '' }
  },
  data() {
    return {
      copied: false,
      timer: null
    };
  },
  beforeDestroy() {
    if (this.timer) clearTimeout(this.timer);
  },
  methods: {
    copy() {
      const done = () => {
        this.copied = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => { this.copied = false; }, 1500);
      };
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = this.code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.code).then(done).catch(fallback);
        return;
      }
      fallback();
    }
  }
};
</script>

<style scoped>
.code-block {
  position: relative;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #0f172a;
  overflow: hidden;
}

.code-copy-btn {
  position: absolute;
  top: 0.35rem;
  right: 0.4rem;
  z-index: 1;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(226, 232, 240, 0.75);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.66rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.code-block:hover .code-copy-btn,
.code-copy-btn:focus {
  opacity: 1;
}

.code-copy-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.code-pre {
  margin: 0;
  padding: 0.55rem 0.75rem;
  max-height: 240px;
  overflow: auto;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.68rem;
  line-height: 1.65;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-word;
}

.code-pre code {
  color: inherit;
  font-size: inherit;
}
</style>
