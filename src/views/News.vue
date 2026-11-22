<template>
  <div class="news-page">
    <div class="cic-hero">
      <vue-particles
        color="#7fafec"
        :particleOpacity="0.7"
        :particlesNumber="80"
        shapeType="circle"
        :particleSize="6"
        linesColor="#7fafec"
        :linesWidth="3"
        :lineLinked="true"
        :lineOpacity="0.4"
        :linesDistance="150"
        :moveSpeed="3"
        :hoverEffect="false"
        hoverMode="grab"
        :clickEffect="false"
        clickMode="push"
        class="cic-hero-particles"
      ></vue-particles>
      <div class="cic-hero-overlay">
        <span class="cic-hero-tag">CIC · NEWS</span>
        <h1>快讯</h1>
        <p>社团通知与近期动态</p>
      </div>
    </div>

    <div class="container page-body">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3 mb-0">正在加载快讯…</p>
      </div>

      <div v-else-if="error" class="alert alert-warning">
        <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
        <button class="btn btn-sm btn-outline-secondary ml-3" @click="load">重试</button>
      </div>

      <div v-else-if="items.length === 0 && aiDone" class="empty cic-card">
        <i class="far fa-newspaper"></i>
        <h5>暂无快讯</h5>
        <p class="text-muted mb-0">新的通知会第一时间出现在这里。</p>
      </div>

      <div v-else-if="items.length > 0" class="news-list cic-card">
        <div v-for="item in items" :key="item.id" class="news-item">
          <!-- 带链接的快讯：外链新窗口，站内路径走路由 -->
          <component
            v-if="item.link"
            :is="isExternal(item.link) ? 'a' : 'router-link'"
            v-bind="linkProps(item)"
            class="news-row"
          >
            <span class="news-date">{{ item.date }}</span>
            <span class="news-title">
              <span v-if="item.source === 'ai'" class="news-prefix">【大模型网关】</span>{{ item.title }}
            </span>
            <i
              class="fas news-icon"
              :class="isExternal(item.link) ? 'fa-external-link-alt' : 'fa-angle-right'"
            ></i>
          </component>

          <!-- 站内快讯：有正文时点击展开 -->
          <template v-else>
            <button
              type="button"
              class="news-row news-button"
              :class="{ expandable: !!item.content }"
              @click="toggle(item)"
            >
              <span class="news-date">{{ item.date }}</span>
              <span class="news-title">
                <span v-if="item.source === 'ai'" class="news-prefix">【大模型网关】</span>{{ item.title }}
              </span>
              <i
                v-if="item.content"
                class="fas news-icon"
                :class="expanded === item.id ? 'fa-angle-up' : 'fa-angle-down'"
              ></i>
            </button>
            <!-- 正文是 Markdown（后台用 mavon-editor 录入），这里用同款编辑器只读预览 -->
            <div v-if="item.content && expanded === item.id" class="news-content">
              <mavon-editor
                :value="item.content"
                :boxShadow="false"
                previewBackground="transparent"
                :subfield="false"
                defaultOpen="preview"
                :editable="false"
                :toolbarsFlag="false"
                :shortCut="false"
              ></mavon-editor>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getActivities } from '@/api/edgeActivities';
import { getAiNotices, mergeByDate } from '@/api/externalFeed';

export default {
  name: 'news',
  data() {
    return {
      localNews: [],
      aiNews: [],
      aiDone: false,
      loading: true,
      error: '',
      expanded: null
    };
  },
  computed: {
    // 本站快讯与 AI 站公告合并后总体按日期倒序
    items() {
      return mergeByDate(this.localNews.concat(this.aiNews));
    }
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = '';
      try {
        this.localNews = await getActivities({ kind: 'news' });
      } catch (e) {
        this.error = e.message || '快讯加载失败';
      }
      this.loading = false;

      // AI 站公告独立加载，失败返回空数组，不影响本站列表
      getAiNotices().then(notices => {
        this.aiNews = notices;
        this.aiDone = true;
      });
    },
    toggle(item) {
      if (!item.content) return;
      this.expanded = this.expanded === item.id ? null : item.id;
    },
    isExternal(link) {
      return /^https?:\/\//i.test(link || '');
    },
    linkProps(item) {
      if (this.isExternal(item.link)) {
        return { href: item.link, target: '_blank', rel: 'noopener' };
      }
      return { to: item.link };
    }
  }
};
</script>

<style scoped>
.page-body {
  padding-bottom: 3.5rem;
  max-width: 860px;
}

.news-list {
  padding: 0.5rem 1.2rem;
}

.news-item {
  border-bottom: 1px dashed var(--line, #e5e7eb);
}

.news-item:last-child {
  border-bottom: none;
}

.news-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 0.2rem;
  color: var(--ink, #1f2937);
  text-decoration: none;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.news-row:hover {
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
}

.news-button {
  cursor: default;
}

.news-button.expandable {
  cursor: pointer;
}

.news-date {
  flex: none;
  width: 96px;
  font-size: 0.82rem;
  color: var(--ink-muted, #6b7280);
}

.news-title {
  flex: 1;
  min-width: 0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-icon {
  flex: none;
  font-size: 0.8rem;
  color: #cbd5e1;
}

/* AI 站公告的来源前缀 */
.news-prefix {
  color: var(--accent-dark, #2980b9);
  font-weight: 700;
}

.news-content {
  margin: 0 0 1rem 96px;
  padding: 0.6rem 1rem;
  background: var(--surface-alt, #f8fafc);
  border-radius: var(--radius-sm, 8px);
  font-size: 0.88rem;
  color: var(--ink-soft, #4b5563);
  text-align: left;
  line-height: 1.7;
  overflow: hidden;
}

/* 只读预览：去掉 mavon-editor 自带的边框、阴影与大片留白 */
.news-content >>> .v-note-wrapper {
  min-height: 0;
  border: none;
  box-shadow: none;
  background: transparent;
  z-index: auto;
}

.news-content >>> .v-note-panel {
  border: none;
  box-shadow: none;
}

.news-content >>> .v-note-show,
.news-content >>> .v-note-show .v-show-content,
.news-content >>> .v-note-show .v-show-content-html {
  padding: 0;
  min-height: 0;
  background: transparent;
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--ink-soft, #4b5563);
}

/* Markdown 段落的默认外边距在窄容器里太松 */
.news-content >>> .v-show-content p {
  margin-bottom: 0.6rem;
}

.news-content >>> .v-show-content p:last-child {
  margin-bottom: 0;
}

/* 正文里的链接可点击，长链接允许换行 */
.news-content >>> .v-show-content a {
  color: var(--accent-dark, #2980b9);
  text-decoration: underline;
  word-break: break-all;
}

.empty {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty i {
  font-size: 2rem;
  color: #9ca3af;
  margin-bottom: 0.8rem;
}

@media (max-width: 576px) {
  .news-date {
    width: 74px;
    font-size: 0.75rem;
  }

  .news-content {
    margin-left: 0;
  }
}
</style>
