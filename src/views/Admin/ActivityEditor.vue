<template>
  <div class="editor-page">
    <div class="editor-head">
      <div>
        <router-link :to="listPath" class="back-link">
          <i class="fas fa-arrow-left"></i> 返回{{ isNews ? '快讯' : '活动' }}列表
        </router-link>
        <h3 class="editor-title">
          {{ isEdit ? '编辑' : '新建' }}{{ isNews ? '快讯' : '活动' }}
          <span v-if="form.hidden" class="tag tag-hidden">隐藏</span>
        </h3>
      </div>
      <div class="head-actions">
        <button
          v-if="!isNews"
          type="button"
          class="btn btn-outline-secondary"
          @click="openPreview"
        >前台预览</button>
        <router-link :to="listPath" class="btn btn-outline-secondary">取消</router-link>
        <button class="btn btn-cic" :disabled="saving" @click="save">
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3 mb-0">正在加载内容…</p>
    </div>

    <div v-else-if="loadError" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>{{ loadError }}
      <router-link :to="listPath" class="btn btn-sm btn-outline-danger ml-3">返回列表</router-link>
    </div>

    <div v-else class="editor-grid">
      <!-- 左侧：标题 + 正文编辑器 -->
      <div class="editor-main cic-card">
        <input
          v-model.trim="form.title"
          type="text"
          class="title-input"
          placeholder="在这里输入标题…"
          maxlength="120"
        />

        <div v-if="draftTip" class="draft-tip">
          <i class="fas fa-history mr-2"></i>检测到未保存的本地草稿（{{ draftTime }}）
          <button type="button" class="btn btn-sm btn-light ml-2" @click="restoreDraft">恢复草稿</button>
          <button type="button" class="btn btn-sm btn-link text-muted" @click="discardDraft">丢弃</button>
        </div>

        <mavon-editor
          ref="md"
          v-model="form.content"
          :subfield="true"
          :defaultOpen="'edit'"
          :boxShadow="false"
          :toolbarsFlag="true"
          :shortCut="false"
          :ishljs="false"
          class="md-editor"
          @imgAdd="onImgAdd"
          @save="onEditorSave"
        ></mavon-editor>

        <div class="editor-foot">
          <span class="hint">
            <i class="fas fa-info-circle mr-1"></i>
            支持 Markdown；截图可直接 <kbd>Ctrl</kbd>+<kbd>V</kbd> 粘贴上传；<kbd>Ctrl</kbd>+<kbd>S</kbd> 保存
          </span>
          <span v-if="uploadingCount > 0" class="uploading-tip">
            <span class="spinner-border spinner-border-sm mr-1"></span>{{ uploadingCount }} 张图片上传中
          </span>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <aside class="editor-side">
        <div class="side-card cic-card">
          <h6 class="side-title">发布信息</h6>

          <div class="field">
            <label>日期 <span class="req">*</span></label>
            <input v-model="form.date" type="date" class="form-control" />
          </div>

          <div class="field">
            <label>作者</label>
            <input v-model.trim="form.author" type="text" class="form-control" placeholder="默认 CIC" />
          </div>

          <div class="field">
            <label>列表摘要（留空则取正文开头）</label>
            <textarea v-model="form.summary" class="form-control" rows="2" maxlength="120"></textarea>
          </div>

          <div class="field">
            <label>外链地址</label>
            <input
              v-model.trim="form.link"
              type="url"
              class="form-control"
              placeholder="https://…（填写后卡片直接外跳）"
            />
            <small class="field-hint">用于「MC服务器上线」这类指向外部页面的条目，不填则进入站内详情页。</small>
          </div>

          <div class="field switch-field">
            <label class="switch">
              <input v-model="form.hidden" type="checkbox" />
              <span>隐藏（不在前台展示）</span>
            </label>
          </div>
        </div>

        <div class="side-card cic-card">
          <h6 class="side-title">封面图</h6>
          <ImageUploader v-model="form.cover" />
          <small class="field-hint">可选。首页列表不使用封面，封面用于详情页与活动回顾卡片。</small>
        </div>

        <div v-if="isEdit" class="side-card cic-card">
          <button type="button" class="btn btn-outline-danger btn-block btn-sm" :disabled="deleting" @click="remove">
            {{ deleting ? '删除中…' : '删除这条内容' }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import ImageUploader from '@/components/ImageUploader.vue';
import { getActivityDetail, saveActivity, deleteActivity } from '@/api/edgeActivities';
import { getAdminToken, clearAdminToken } from '@/api/adminAuth';
import { uploadImage } from '@/api/upload';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(kind) {
  return {
    id: null,
    kind,
    title: '',
    date: today(),
    author: '',
    cover: '',
    summary: '',
    content: '',
    link: '',
    hidden: false
  };
}

export default {
  name: 'ActivityEditor',
  components: { ImageUploader },
  props: {
    kind: { type: String, default: 'activity' },
    id: { type: [String, Number], default: '' }
  },
  data() {
    return {
      form: emptyForm(this.kind),
      token: '',
      loading: true,
      loadError: '',
      saving: false,
      deleting: false,
      uploadingCount: 0,
      draft: null,
      draftTip: false,
      dirty: false,
      justSaved: false,
      draftTimer: null
    };
  },
  computed: {
    isNews() {
      return this.kind === 'news';
    },
    isEdit() {
      return !!this.id;
    },
    listPath() {
      return `/admin/${this.kind}`;
    },
    draftKey() {
      return `cic_admin_draft_${this.kind}_${this.id || 'new'}`;
    },
    draftTime() {
      if (!this.draft || !this.draft.savedAt) return '';
      return new Date(this.draft.savedAt).toLocaleString('zh-CN');
    }
  },
  watch: {
    'form.content'() {
      this.markDirty();
    },
    '$route.params.id'() {
      this.reload();
    },
    '$route.path'() {
      this.reload();
    }
  },
  async created() {
    await this.reload();
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    if (this.draftTimer) clearTimeout(this.draftTimer);
    window.removeEventListener('keydown', this.onKeydown);
  },
  beforeRouteLeave(to, from, next) {
    if (this.dirty && !this.justSaved && (this.form.title || this.form.content)) {
      if (!confirm('有未保存的修改，确定离开吗？')) return next(false);
    }
    next();
  },
  methods: {
    onKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') {
        e.preventDefault();
        this.save();
      }
    },
    async reload() {
      this.loading = true;
      this.loadError = '';
      this.dirty = false;
      this.justSaved = false;
      this.draftTip = false;
      this.form = emptyForm(this.kind);

      try {
        this.token = await getAdminToken();
      } catch (e) {
        this.loadError = e.message || '无法获取管理凭证';
        this.loading = false;
        return;
      }

      if (this.isEdit) {
        try {
          const data = await getActivityDetail(this.id, { token: this.token, includeHidden: true });
          this.form = {
            ...emptyForm(this.kind),
            ...data,
            kind: this.kind
          };
        } catch (e) {
          this.loadError = e.status === 404 ? '内容不存在或已被删除' : (e.message || '加载失败');
          this.loading = false;
          return;
        }
      }

      this.readDraft();
      this.loading = false;
    },
    readDraft() {
      let raw = null;
      try {
        raw = localStorage.getItem(this.draftKey);
      } catch (e) {
        raw = null;
      }
      if (!raw) return;
      try {
        const draft = JSON.parse(raw);
        if (!draft || !draft.form) return;
        // 与服务器内容完全一致就不提示
        if (draft.form.title === this.form.title && draft.form.content === this.form.content) {
          localStorage.removeItem(this.draftKey);
          return;
        }
        this.draft = draft;
        this.draftTip = true;
      } catch (e) {
        localStorage.removeItem(this.draftKey);
      }
    },
    restoreDraft() {
      if (this.draft && this.draft.form) {
        this.form = { ...this.form, ...this.draft.form, kind: this.kind };
        this.dirty = true;
      }
      this.draftTip = false;
    },
    discardDraft() {
      try {
        localStorage.removeItem(this.draftKey);
      } catch (e) {
        // 忽略
      }
      this.draft = null;
      this.draftTip = false;
    },
    markDirty() {
      this.dirty = true;
      if (this.draftTimer) clearTimeout(this.draftTimer);
      this.draftTimer = setTimeout(() => this.saveDraft(), 800);
    },
    saveDraft() {
      try {
        localStorage.setItem(this.draftKey, JSON.stringify({
          form: this.form,
          savedAt: Date.now()
        }));
      } catch (e) {
        // 忽略（隐私模式/超配额）
      }
    },
    clearDraft() {
      try {
        localStorage.removeItem(this.draftKey);
      } catch (e) {
        // 忽略
      }
      this.draft = null;
      this.draftTip = false;
    },
    onEditorSave() {
      this.save();
    },
    // 前台预览当前编辑内容（未保存的草稿）：写入 localStorage 后在新标签打开，
    // 详情页检测到 ?preview=1 时直接读取这份草稿，不请求接口
    openPreview() {
      if (this.uploadingCount > 0) {
        alert('图片还在上传，请稍候再预览');
        return;
      }
      if (!this.form.title) {
        alert('请先填写标题再预览');
        return;
      }
      try {
        localStorage.setItem('cic_preview_payload', JSON.stringify({
          form: this.form,
          savedAt: Date.now()
        }));
      } catch (e) {
        alert('预览失败：浏览器存储不可用');
        return;
      }
      const id = this.form.id || 'preview';
      const href = this.$router.resolve({
        path: `/activity/${id}`,
        query: { preview: '1' }
      }).href;
      window.open(href, '_blank');
    },
    async onImgAdd(pos, file) {
      this.uploadingCount += 1;
      try {
        const url = await uploadImage(file, await getAdminToken());
        this.$refs.md.$img2Url(pos, url);
        this.markDirty();
      } catch (e) {
        if (e.message && e.message.indexOf('凭证') >= 0) clearAdminToken();
        alert('图片上传失败: ' + (e.message || '未知错误'));
        // 移除插入的占位图片标记
        this.$refs.md.$img2Url(pos, '');
      }
      this.uploadingCount -= 1;
    },
    validate() {
      if (!this.form.title) {
        alert('请填写标题');
        return false;
      }
      if (!this.form.date) {
        alert('请选择日期');
        return false;
      }
      if (this.form.link && !/^https?:\/\//i.test(this.form.link)) {
        alert('外链地址需要以 http:// 或 https:// 开头');
        return false;
      }
      return true;
    },
    async save() {
      if (this.saving || !this.validate()) return;
      this.saving = true;
      try {
        const payload = {
          id: this.form.id || undefined,
          kind: this.kind,
          title: this.form.title,
          date: this.form.date,
          author: this.form.author,
          cover: this.form.cover,
          summary: this.form.summary,
          content: this.form.content,
          link: this.form.link,
          hidden: this.form.hidden
        };
        const saved = await saveActivity(payload, await getAdminToken());
        this.justSaved = true;
        this.dirty = false;
        this.clearDraft();
        this.form.id = saved.id;
        this.$router.push(this.listPath);
      } catch (e) {
        if (e.status === 401) {
          clearAdminToken();
          alert('保存失败: 管理凭证已失效，请刷新页面重新登录后再试');
        } else {
          alert('保存失败: ' + (e.message || '未知错误'));
        }
      }
      this.saving = false;
    },
    async remove() {
      if (!confirm(`确认删除「${this.form.title}」吗？删除后不可恢复。`)) return;
      this.deleting = true;
      try {
        await deleteActivity(this.form.id, await getAdminToken());
        this.justSaved = true;
        this.dirty = false;
        this.clearDraft();
        this.$router.push(this.listPath);
      } catch (e) {
        if (e.status === 401) clearAdminToken();
        alert('删除失败: ' + (e.message || '未知错误'));
      }
      this.deleting = false;
    }
  }
};
</script>

<style scoped>
.editor-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.back-link {
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
}

.editor-title {
  font-size: 1.45rem;
  font-weight: 700;
  margin: 0.3rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.head-actions {
  display: flex;
  gap: 0.5rem;
}

.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.2rem;
  align-items: start;
}

.editor-main {
  padding: 1.2rem 1.4rem 1rem;
}

.title-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--line, #e5e7eb);
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.35rem 0;
  margin-bottom: 0.9rem;
  outline: none;
  color: var(--ink, #1f2937);
}

.title-input::placeholder {
  color: #cbd5e1;
  font-weight: 600;
}

.md-editor >>> .v-note-wrapper {
  z-index: 1;
  min-height: 520px;
}

.md-editor >>> .v-note-panel {
  box-shadow: none;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: var(--radius-sm, 8px);
}

.editor-foot {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.7rem;
  font-size: 0.8rem;
  color: var(--ink-muted, #6b7280);
}

.editor-foot kbd {
  font-size: 0.72rem;
}

.uploading-tip {
  color: var(--accent-dark, #2980b9);
}

.draft-tip {
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.4);
  border-radius: var(--radius-sm, 8px);
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  color: #8a6d3b;
  margin-bottom: 0.8rem;
}

.editor-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.side-card {
  padding: 1rem 1.1rem;
}

.side-title {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.8rem;
  color: var(--ink, #1f2937);
}

.field {
  margin-bottom: 0.85rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field > label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft, #4b5563);
  margin-bottom: 0.3rem;
}

.req {
  color: #dc3545;
}

.field .form-control {
  font-size: 0.88rem;
}

.field-hint {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #9ca3af;
}

.switch-field {
  margin-top: 0.4rem;
}

.switch {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: var(--ink-soft, #4b5563);
  margin: 0;
  cursor: pointer;
}

.tag {
  font-size: 0.72rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #eef2f7;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 992px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .editor-side {
    position: static;
  }
}
</style>
