<template>
  <div class="activity-page">
    <div class="container py-4" id="activity">
      <div class="activity-layout">
        <!-- 左：正文 -->
        <article class="activity-main">
          <nav class="crumbs">
            <router-link to="/">首页</router-link>
            <span class="sep">/</span>
            <router-link to="/activities">活动</router-link>
          </nav>

          <div v-if="isPreview" class="preview-banner">
            <i class="fas fa-eye mr-2"></i>
            预览模式：这是编辑器中尚未保存的草稿，仅当前浏览器可见。
          </div>

          <h1 class="activity-title">{{ activity.title || '活动' }}</h1>

          <div class="meta-line">
            <span v-if="activity.date">
              <i class="far fa-calendar-alt mr-1"></i>{{ activity.date }}
            </span>
            <span v-if="activity.author">
              <i class="far fa-user mr-1"></i>{{ activity.author }}
            </span>
            <a v-if="activity.link" :href="activity.link" target="_blank" rel="noopener">
              <i class="fas fa-external-link-alt mr-1"></i>外部活动页面
            </a>
          </div>

          <hr />

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="text-muted mt-3 mb-0">正在加载活动…</p>
          </div>

          <div v-else-if="error" class="alert alert-warning">
            <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
            <router-link to="/activities" class="btn btn-sm btn-outline-secondary ml-3">返回活动列表</router-link>
          </div>

          <template v-else>
            <mavon-editor
              v-if="activity.content"
              v-model="activity.content"
              :boxShadow="config.boxShadow"
              :previewBackground="config.previewBackground"
              :subfield="config.subfield"
              :defaultOpen="config.defaultOpen"
              :editable="false"
              :toolbarsFlag="config.toolbarsFlag"
              :shortCut="config.shortCut"
            ></mavon-editor>
            <p v-else class="text-muted">这条活动还没有正文内容。</p>
          </template>
        </article>

        <!-- 右：封面与信息（sticky，不再 fixed，避免与页脚重叠） -->
        <aside class="activity-side">
          <div class="cic-card side-card">
            <img v-if="activity.cover" class="side-cover" :src="activity.cover" :alt="activity.title" />
            <div class="side-body">
              <h5 class="side-author">{{ activity.author || 'CIC' }}</h5>
              <p class="side-date mb-3">发布时间：{{ activity.date || '—' }}</p>

              <a
                v-if="activity.link"
                :href="activity.link"
                target="_blank"
                rel="noopener"
                class="btn btn-cic btn-block"
              >
                <i class="fas fa-external-link-alt mr-2"></i>前往活动页面
              </a>
              <router-link v-else to="/activities" class="btn btn-cic-outline btn-block">
                查看全部活动
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-page {
  min-height: 60vh;
}

/* 桌面端导航栏是全站 absolute 覆盖在页面顶部的（其它页面靠 hero 撑出空间，
   活动详情页没有 hero），这里显式留出导航栏高度，避免标题与菜单重叠 */
@media (min-width: 992px) {
  .activity-page {
    padding-top: 96px;
  }
}

.activity-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 2rem;
  align-items: start;
}

.activity-main {
  min-width: 0;
  text-align: left;
}

.crumbs {
  font-size: 0.82rem;
  color: var(--ink-muted, #6b7280);
  margin-bottom: 0.6rem;
}

.crumbs a {
  color: var(--ink-muted, #6b7280);
  text-decoration: none;
}

.crumbs a:hover {
  color: var(--accent-dark, #2980b9);
}

.crumbs .sep {
  margin: 0 0.35rem;
  color: #cbd5e1;
}

.preview-banner {
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.35);
  color: var(--accent-dark, #2980b9);
  border-radius: var(--radius-sm, 8px);
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: left;
}

.activity-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink, #1f2937);
  margin-bottom: 0.6rem;
  text-align: left;
}

.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  font-size: 0.88rem;
  color: var(--ink-muted, #6b7280);
}

.meta-line a {
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
}

/* sticky 右栏：随页面滚动，永远不会压住正文或页脚 */
.activity-side {
  position: sticky;
  top: 1rem;
}

.side-card {
  overflow: hidden;
}

.side-cover {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  display: block;
}

.side-body {
  padding: 1rem 1.1rem 1.2rem;
  text-align: left;
}

.side-author {
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--ink, #1f2937);
}

.side-date {
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

@media (max-width: 768px) {
  .activity-layout {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .activity-side {
    position: static;
  }

  .activity-title {
    font-size: 1.5rem;
  }
}
</style>

<!-- mavon-editor 内部元素不受 scoped 约束，需要全局样式覆盖 -->
<style>
.v-note-wrapper {
  border: none;
  z-index: auto !important;
}
.v-note-wrapper .v-note-panel .v-note-show .v-show-content,
.v-note-wrapper .v-note-panel .v-note-show .v-show-content-html {
  padding: 0;
  text-align: left;
}
</style>

<script>
import { getActivityDetail } from '@/api/edgeActivities';

export default {
  name: 'activity',
  data() {
    return {
      loading: true,
      error: '',
      activity: {
        id: '',
        date: '',
        cover: '',
        title: '',
        author: '',
        content: '',
        link: ''
      },
      config: {
        boxShadow: false,
        previewBackground: '#ffffff',
        subfield: false,
        defaultOpen: 'preview',
        editable: false,
        toolbarsFlag: false,
        shortCut: false
      }
    };
  },
  computed: {
    // ?preview=1 时渲染编辑器里的未保存草稿（数据来自 localStorage）
    isPreview() {
      return this.$route.query.preview === '1';
    }
  },
  created() {
    if (this.isPreview) {
      this.loadPreview();
    } else {
      this.loadDetail();
    }
  },
  methods: {
    async loadDetail() {
      this.loading = true;
      this.error = '';
      try {
        this.activity = await getActivityDetail(this.$route.params.id);
      } catch (e) {
        this.error = e.status === 404 ? '活动不存在或已被删除。' : (e.message || '加载失败');
      }
      this.loading = false;
    },
    loadPreview() {
      this.loading = false;
      this.error = '';
      try {
        const raw = localStorage.getItem('cic_preview_payload');
        if (!raw) throw new Error('empty');
        const payload = JSON.parse(raw);
        if (!payload || !payload.form) throw new Error('empty');
        this.activity = { ...this.activity, ...payload.form };
      } catch (e) {
        this.error = '没有找到可预览的草稿，请回到编辑器重新点击「前台预览」。';
      }
    }
  }
};
</script>
