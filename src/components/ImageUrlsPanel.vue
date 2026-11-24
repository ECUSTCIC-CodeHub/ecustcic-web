<template>
  <div class="images-panel" :class="{ disabled: !enabled }">
    <!-- 标题栏 -->
    <div class="img-head">
      <div class="img-title"><i class="fas fa-image"></i>图片地址</div>
      <div class="img-head-actions">
        <button
          type="button"
          class="img-switch"
          :class="{ on: enabled }"
          role="switch"
          :aria-checked="enabled ? 'true' : 'false'"
          aria-label="启用图片多模态输入"
          :title="enabled ? '点击关闭' : '点击开启'"
          @click="$emit('toggle')"
        ><span class="img-switch-dot"></span></button>
        <button
          type="button"
          class="img-add-btn"
          :disabled="!enabled"
          aria-label="新增图片地址"
          @click="addItem"
        ><i class="fas fa-plus"></i></button>
      </div>
    </div>

    <p class="img-help">启用后可添加图片 URL 进行多模态对话；在对话输入框直接粘贴图片会自动开启并转为 Base64</p>

    <!-- 图片列表 -->
    <div v-if="rows.length" class="img-list" :class="{ dim: !enabled }">
      <div v-for="(row, idx) in rows" :key="row.key" class="img-row">
        <div class="img-input-wrap">
          <i class="fas fa-file-image img-input-icon"></i>
          <input
            v-model.trim="row.value"
            type="text"
            class="img-input"
            :class="{ invalid: !isValid(row.value) }"
            :placeholder="'https://example.com/image' + (idx + 1) + '.jpg 或 data:image/…;base64,…'"
            :title="isValid(row.value) ? '' : '地址需为 http(s) 链接或 data:image Base64'"
            :aria-invalid="isValid(row.value) ? 'false' : 'true'"
            :disabled="!enabled"
            @change="onChange"
          />
        </div>
        <button
          type="button"
          class="img-remove-btn"
          :disabled="!enabled"
          :aria-label="'删除第' + (idx + 1) + '条图片地址'"
          @click="removeItem(idx)"
        ><i class="fas fa-times"></i></button>
      </div>
    </div>
    <p v-else class="img-none" :class="{ dim: !enabled }">暂无图片地址</p>
  </div>
</template>

<script>
import { validImageUrl } from '@/api/aiPlayground';

let rowSeq = 0;

export default {
  name: 'image-urls-panel',
  props: {
    enabled: { type: Boolean, default: false },
    images: { type: Array, default: () => [] }
  },
  data() {
    return {
      rows: []
    };
  },
  watch: {
    images: {
      immediate: true,
      handler(list) {
        // 外部列表与内部编辑行保持同步，尾部保留一条空行便于继续输入
        const external = (list || []).map(item => String(item || ''));
        const internal = this.rows.map(r => String(r.value || ''));
        if (external.join('\u0000') === internal.join('\u0000')) return;
        const rows = external.map(value => this.makeRow(value));
        if (!external.length || external[external.length - 1] !== '') {
          rows.push(this.makeRow(''));
        }
        this.rows = rows;
      }
    }
  },
  created() {
    // 空配置时预置一条空行，方便开关打开后直接输入
    if (!this.rows.length) this.rows = [this.makeRow('')];
  },
  methods: {
    makeRow(value) {
      rowSeq += 1;
      return { key: 'img-row-' + rowSeq, value: value || '' };
    },
    isValid(value) {
      const text = String(value || '').trim();
      return !text || validImageUrl(text);
    },
    notify() {
      const values = this.rows.map(r => String(r.value || '').trim()).filter(Boolean);
      this.$emit('change', values);
    },
    onChange() {
      this.notify();
    },
    addItem() {
      if (!this.enabled) return;
      this.rows.push(this.makeRow(''));
      this.$nextTick(() => {
        const inputs = this.$el.querySelectorAll('.img-input');
        const last = inputs[inputs.length - 1];
        if (last) last.focus();
      });
    },
    removeItem(idx) {
      if (!this.enabled) return;
      this.rows.splice(idx, 1);
      if (!this.rows.length) this.rows = [this.makeRow('')];
      this.notify();
    }
  }
};
</script>

<style scoped>
.images-panel {
  padding: 0.35rem 0 0.45rem;
}

.disabled .img-title,
.disabled .img-help,
.disabled .img-input,
.disabled .img-switch {
  opacity: 0.55;
}

/* ---------- 标题栏 ---------- */
.img-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.img-title {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ink);
}

.img-title i {
  font-size: 0.68rem;
  color: var(--ink-muted);
}

.img-head-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

/* ---------- 开关 ---------- */
.img-switch {
  position: relative;
  width: 30px;
  height: 17px;
  border: 0;
  border-radius: 999px;
  background: #cbd5e1;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s ease;
}

.img-switch.on {
  background: var(--brand);
}

.img-switch-dot {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.img-switch.on .img-switch-dot {
  transform: translateX(13px);
}

/* ---------- 新增按钮 ---------- */
.img-add-btn {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.img-add-btn:hover:not(:disabled) {
  transform: scale(1.08);
}

.img-add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---------- 说明 ---------- */
.img-help {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.66rem;
  color: var(--ink-muted);
  line-height: 1.55;
}

/* ---------- 列表 ---------- */
.img-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 128px;
  overflow-y: auto;
}

.img-list.dim,
.img-none.dim {
  opacity: 0.5;
}

.img-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.img-input-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.img-input-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.62rem;
  color: var(--ink-muted);
  pointer-events: none;
}

.img-input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  padding: 0.34rem 0.5rem 0.34rem 1.55rem;
  font-size: 0.7rem;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.img-input:focus:not(:disabled) {
  border-color: var(--brand);
  background: var(--surface);
  box-shadow: 0 0 0 3px var(--brand-soft);
}

.img-input:disabled {
  cursor: not-allowed;
}

.img-input.invalid,
.img-input.invalid:focus:not(:disabled) {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.14);
}

/* ---------- 删除按钮 ---------- */
.img-remove-btn {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ink-muted);
  font-size: 0.62rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.img-remove-btn:hover:not(:disabled) {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
}

.img-remove-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.img-none {
  margin: 0;
  font-size: 0.68rem;
  color: var(--ink-muted);
  text-align: center;
  padding: 0.4rem 0;
}
</style>
