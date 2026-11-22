<template>
  <div
    class="image-uploader"
    :class="{ dragging }"
    tabindex="0"
    @click="focusSelf"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @paste="onPaste"
  >
    <!-- 已有图片：预览 + 操作 -->
    <div v-if="value" class="preview">
      <img :src="value" class="preview-img" alt="图片预览" />
      <div class="preview-actions">
        <button type="button" class="btn btn-sm btn-light" :disabled="uploading" @click.stop="pick">
          <i class="fas fa-sync-alt mr-1"></i>更换
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger" :disabled="uploading" @click.stop="remove">
          <i class="fas fa-trash-alt mr-1"></i>移除
        </button>
      </div>
    </div>

    <!-- 空态：点击 / 拖拽 / 粘贴 -->
    <div v-else class="placeholder" @click.stop="pick">
      <i class="fas fa-cloud-upload-alt"></i>
      <p class="mb-1">点击选择、拖拽图片到此处，或直接 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴</p>
      <span class="hint">支持 JPG / PNG / WebP / GIF，上传前自动压缩到 500KB 以内（原图 20MB 以内）</span>
    </div>

    <div v-if="uploading" class="uploading">
      <span class="spinner-border spinner-border-sm mr-2"></span>上传中…
    </div>

    <p v-if="error" class="error mb-0">{{ error }}</p>

    <input ref="file" type="file" accept="image/*" class="d-none" @change="onChange" />
  </div>
</template>

<script>
import { uploadImage } from '@/api/upload';

export default {
  name: 'ImageUploader',
  props: {
    // 已上传的图片 URL
    value: { type: String, default: '' },
    // 管理 token，由父组件保证非空
    token: { type: String, default: '' }
  },
  data() {
    return {
      uploading: false,
      dragging: false,
      error: ''
    };
  },
  methods: {
    focusSelf() {
      if (this.$el && this.$el.focus) this.$el.focus();
    },
    pick() {
      if (this.uploading) return;
      this.$refs.file && this.$refs.file.click();
    },
    onChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (file) this.upload(file);
    },
    onDrop(e) {
      this.dragging = false;
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) this.upload(files[0]);
    },
    // 粘贴图片（编辑器页面上 mavon-editor 会优先接管正文粘贴，
    // 封面区域需要先点一下让本组件获得焦点）
    onPaste(e) {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') === 0) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            this.upload(file);
            return;
          }
        }
      }
    },
    async upload(file) {
      if (this.uploading) return;
      this.error = '';
      if (!this.token) {
        this.error = '缺少管理凭证，请刷新页面重试';
        return;
      }
      this.uploading = true;
      try {
        const url = await uploadImage(file, this.token);
        this.$emit('input', url);
      } catch (err) {
        this.error = err.message || '上传失败';
      }
      this.uploading = false;
    },
    remove() {
      this.error = '';
      this.$emit('input', '');
    }
  }
};
</script>

<style scoped>
.image-uploader {
  border: 1px dashed #cbd5e1;
  border-radius: var(--radius-sm, 8px);
  background: #fff;
  padding: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.image-uploader:focus,
.image-uploader.dragging {
  border-color: var(--accent, #3498db);
  background: var(--accent-soft, rgba(52, 152, 219, 0.08));
}

.placeholder {
  text-align: center;
  color: var(--ink-muted, #6b7280);
  cursor: pointer;
  padding: 1.1rem 0.5rem;
}

.placeholder i {
  font-size: 1.6rem;
  color: var(--accent, #3498db);
  margin-bottom: 0.4rem;
  display: block;
}

.placeholder p {
  font-size: 0.9rem;
  margin: 0;
}

.placeholder .hint {
  font-size: 0.78rem;
  color: #9ca3af;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.preview-img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--line, #e5e7eb);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.uploading {
  margin-top: 0.6rem;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

.error {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #dc3545;
}
</style>
