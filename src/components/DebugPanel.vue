<template>
  <div
    ref="root"
    class="debug-panel"
    :class="{ maximized }"
    tabindex="-1"
    :role="maximized ? 'dialog' : null"
    :aria-modal="maximized ? 'true' : null"
    :aria-label="maximized ? '调试信息' : null"
  >
    <!-- Tab 切换 -->
    <div class="dbg-head-row">
      <div class="dbg-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="dbg-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon" class="dbg-tab-icon"></i>{{ tab.label }}
          <span v-if="tab.key === 'response' && events.length" class="dbg-tab-badge">{{ events.length }}</span>
        </button>
      </div>
      <button
        ref="toggleBtn"
        type="button"
        class="dbg-icon-btn"
        :title="maximized ? '退出放大' : '放大面板'"
        :aria-label="maximized ? '退出放大' : '放大面板'"
        :aria-pressed="maximized ? 'true' : 'false'"
        @click="toggleMaximize"
      >
        <i :class="maximized ? 'fas fa-compress' : 'fas fa-expand'"></i>
      </button>
    </div>

    <!-- Tab 内容区 -->
    <div class="dbg-body">
      <!-- 预览请求体 -->
      <div v-if="activeTab === 'preview'" class="dbg-pane">
        <p v-if="!previewPayload" class="dbg-empty">暂无对话内容，发送消息后可预览下一轮请求体</p>
        <code-block v-else :code="prettyPreview"></code-block>
      </div>

      <!-- 实际请求体 -->
      <div v-if="activeTab === 'actual'" class="dbg-pane">
        <p v-if="!actualPayload" class="dbg-empty">发送消息后可查看仅含当前问题的请求体</p>
        <code-block v-else :code="prettyActual"></code-block>
      </div>

      <!-- SSE 响应流 -->
      <div v-if="activeTab === 'response'" class="dbg-pane dbg-pane-response">
        <div class="dbg-response-head">
          <span class="dbg-stream-title">SSE数据流</span>
          <span class="dbg-badge dbg-badge-lg">{{ events.length }}</span>
          <span class="dbg-spacer"></span>
          <button type="button" class="dbg-mini-btn" :disabled="!events.length" @click="copyAll">
            <i class="fas fa-copy"></i> 复制全部
          </button>
          <button type="button" class="dbg-mini-btn" :disabled="!events.length" @click="toggleAll">
            <i :class="allExpanded ? 'fas fa-compress-alt' : 'fas fa-expand-alt'"></i>
            {{ allExpanded ? '收起全部' : '展开全部' }}
          </button>
        </div>

        <p v-if="!events.length" class="dbg-empty">暂无响应数据，开启流式输出后发送消息即可查看事件流</p>
        <div v-else class="dbg-events">
          <div v-for="ev in events" :key="ev.seq" class="dbg-event" :class="{ open: expandedSet[ev.seq] }">
            <div class="dbg-event-head" @click="toggleEvent(ev.seq)">
              <span class="dbg-event-seq">#{{ ev.seq }}</span>
              <span v-if="ev.id" class="dbg-event-id">{{ ev.id }}</span>
              <span class="dbg-tag" :class="'dbg-tag-' + ev.type">{{ typeLabel(ev.type) }}</span>
              <i :class="expandedSet[ev.seq] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="dbg-chev"></i>
            </div>
            <code-block v-if="expandedSet[ev.seq]" :code="eventBody(ev)"></code-block>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部时间戳 -->
    <div class="dbg-foot">
      <i class="fas fa-clock"></i>
      <span>最后请求：{{ lastRequestAt || '暂无' }}</span>
    </div>
  </div>
</template>

<script>
import CodeBlock from './CodeBlock.vue';

export default {
  name: 'debug-panel',
  components: { CodeBlock },
  props: {
    previewPayload: { type: Object, default: null },
    actualPayload: { type: Object, default: null },
    events: { type: Array, default: () => [] },
    lastRequestAt: { type: String, default: '' },
    // 每次新请求自增，用于重置事件展开状态
    streamEpoch: { type: Number, default: 0 }
  },
  data() {
    return {
      activeTab: 'preview',
      expandedSet: {},
      maximized: false,
      bodyOverflow: null,
      tabs: [
        { key: 'preview', label: '预览请求体', icon: 'fas fa-eye' },
        { key: 'actual', label: '仅当前消息', icon: 'fas fa-paper-plane' },
        { key: 'response', label: '响应', icon: 'fas fa-bolt' }
      ]
    };
  },
  computed: {
    allExpanded() {
      return this.events.length > 0 && this.events.every(ev => this.expandedSet[ev.seq]);
    },
    // 请求体含 Base64 图片时可能很大，避免模板内每次渲染都重新序列化
    prettyPreview() {
      return this.previewPayload ? this.pretty(this.previewPayload) : '';
    },
    prettyActual() {
      return this.actualPayload ? this.pretty(this.actualPayload) : '';
    }
  },
  watch: {
    // 新请求产生的新事件流默认全部收起
    streamEpoch() {
      this.expandedSet = {};
    },
    maximized(on) {
      if (on) document.addEventListener('keydown', this.onKeydown);
      else document.removeEventListener('keydown', this.onKeydown);
      this.lockPageScroll(on);
      // 放大态会脱离 sticky 祖先，父级需要解除该层叠上下文
      this.$emit('maximize', on);
      this.$nextTick(() => {
        const target = on ? this.$refs.root : this.$refs.toggleBtn;
        if (target && target.focus) target.focus();
      });
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown);
    this.lockPageScroll(false);
  },
  methods: {
    lockPageScroll(on) {
      if (on) {
        if (this.bodyOverflow === null) this.bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else if (this.bodyOverflow !== null) {
        document.body.style.overflow = this.bodyOverflow;
        this.bodyOverflow = null;
      }
    },
    onKeydown(event) {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      this.maximized = false;
    },
    toggleMaximize() {
      this.maximized = !this.maximized;
    },
    pretty(value) {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    },
    typeLabel(type) {
      const map = {
        role: 'role',
        reasoning: 'reasoning_content',
        content: 'content',
        empty: '空',
        other: '其他',
        done: '[DONE]',
        error: '中断'
      };
      return map[type] || type;
    },
    eventBody(ev) {
      if (ev.type === 'done') return '[DONE]';
      return ev.raw || this.pretty(ev.parsed);
    },
    toggleEvent(seq) {
      this.expandedSet = Object.assign({}, this.expandedSet, { [seq]: !this.expandedSet[seq] });
    },
    toggleAll() {
      const expanded = !this.allExpanded;
      const next = {};
      if (expanded) {
        this.events.forEach(ev => { next[ev.seq] = true; });
      }
      this.expandedSet = next;
    },
    copyAll() {
      if (!this.events.length) return;
      const text = this.events.map(ev => `#${ev.seq} [${this.typeLabel(ev.type)}] ${this.eventBody(ev)}`).join('\n\n');
      this.$emit('copy', text);
    }
  }
};
</script>

<style scoped>
.debug-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.debug-panel:focus {
  outline: none;
}

/* 放大：脱离右侧栏，铺满视口留出边距，给展开的事件流足够空间 */
.debug-panel.maximized {
  position: fixed;
  top: 12px;
  right: clamp(10px, 3vw, 56px);
  bottom: 12px;
  left: clamp(10px, 3vw, 56px);
  z-index: 1080;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.28);
}

@media (min-width: 992px) {
  /* 桌面端导航栏悬浮在顶部（约 68px），放大后避开 */
  .debug-panel.maximized {
    top: 84px;
  }
}

.debug-panel.maximized .dbg-event ::v-deep .code-pre {
  max-height: none;
}

/* ---------- Tab 切换（分段饼样式） ---------- */
.dbg-head-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0.6rem 0.7rem 0;
  flex-shrink: 0;
}

.dbg-tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 0.15rem;
  padding: 0.15rem;
  border-radius: 9px;
  background: var(--surface-alt);
  border: 1px solid var(--line);
}

.dbg-icon-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--surface);
  color: var(--ink-muted);
  font-size: 0.66rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dbg-icon-btn:hover {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand-dark);
}

.dbg-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.32rem 0.3rem;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}

.dbg-tab:hover {
  color: var(--ink);
}

.dbg-tab.active {
  background: var(--surface);
  color: var(--brand-dark);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
}

.dbg-tab-icon {
  font-size: 0.62rem;
}

.dbg-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  font-size: 0.54rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ---------- 事件计数徽章 ---------- */
.dbg-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 15px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand-dark);
  font-size: 0.58rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.dbg-badge-lg {
  min-width: 20px;
  height: 17px;
  font-size: 0.62rem;
}

/* ---------- 内容区 ---------- */
.dbg-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.dbg-pane {
  flex: 1;
  min-height: 0;
  padding: 0.55rem 0.7rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
}

.dbg-pane-response {
  overflow: hidden;
}

.dbg-empty {
  color: var(--ink-muted);
  font-size: 0.72rem;
  text-align: center;
  margin: 1.2rem 0;
}

/* ---------- SSE 头部操作 ---------- */
.dbg-response-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.dbg-stream-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ink);
}

.dbg-spacer {
  flex: 1;
}

.dbg-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-soft);
  font-size: 0.64rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dbg-mini-btn:hover:not(:disabled) {
  border-color: var(--brand);
  background: var(--brand-soft);
  color: var(--brand-dark);
}

.dbg-mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ---------- 事件列表 ---------- */
.dbg-events {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  padding-right: 0.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.dbg-events::-webkit-scrollbar {
  width: 8px;
}

.dbg-events::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.22);
  border-radius: 999px;
}

.dbg-events::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.36);
}

.dbg-events::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.05);
  border-radius: 999px;
}

.dbg-event {
  /* 关键：展开后保持自身高度，由 .dbg-events 滚动，避免被 flex 压缩成一条 */
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.dbg-event.open {
  border-color: var(--brand);
  background: var(--surface-alt);
}

.dbg-event-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.32rem 0.55rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.68rem;
}

.dbg-event-head:hover {
  background: var(--surface-alt);
}

.dbg-event-seq {
  font-weight: 700;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}

.dbg-event-id {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.62rem;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dbg-chev {
  margin-left: auto;
  color: var(--ink-muted);
  font-size: 0.6rem;
}

.dbg-event .code-block {
  margin: 0 0.45rem 0.45rem;
}

/* ---------- 类型标签 ---------- */
.dbg-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.06rem 0.4rem;
  border-radius: 4px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.dbg-tag-role {
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.dbg-tag-reasoning {
  background: var(--brand-soft);
  color: var(--brand-dark);
}

.dbg-tag-content {
  background: #e0f2fe;
  color: #0369a1;
}

.dbg-tag-empty {
  background: var(--surface-alt);
  color: var(--ink-muted);
}

.dbg-tag-other {
  background: #f3f4f6;
  color: #6b7280;
}

.dbg-tag-done {
  background: #dcfce7;
  color: #15803d;
}

.dbg-tag-error {
  background: #fee2e2;
  color: #b91c1c;
}

/* ---------- 底部时间戳 ---------- */
.dbg-foot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border-top: 1px solid var(--line);
  font-size: 0.66rem;
  color: var(--ink-muted);
  flex-shrink: 0;
}
</style>
