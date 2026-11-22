<template>
  <div class="activities-page">
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
        <span class="cic-hero-tag">CIC · ACTIVITIES</span>
        <h1>活动回顾</h1>
        <p>社团活动与对外分享页面</p>
      </div>
    </div>

    <div class="container page-body">
      <div class="page-toolbar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model.trim="keyword" type="search" placeholder="搜索活动标题 / 作者 / 年份" />
        </div>
        <span class="count">共 {{ items.length }} 个活动</span>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3 mb-0">正在加载活动…</p>
      </div>

      <div v-else-if="error" class="alert alert-warning">
        <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
        <button class="btn btn-sm btn-outline-secondary ml-3" @click="load">重试</button>
      </div>

      <div v-else-if="items.length === 0" class="empty cic-card">
        <i class="far fa-calendar-times"></i>
        <h5>还没有活动记录</h5>
        <p class="text-muted mb-0">活动发布后会出现在这里。</p>
      </div>

      <div v-else-if="filtered.length === 0" class="empty cic-card">
        <i class="fas fa-search"></i>
        <h5>没有匹配的活动</h5>
        <p class="text-muted mb-0">试试其它关键词。</p>
      </div>

      <div v-else class="activity-grid">
        <component
          :is="isExternal(item.link) ? 'a' : 'router-link'"
          v-for="item in filtered"
          :key="item.id"
          v-bind="linkProps(item)"
          class="activity-card cic-card"
        >
          <div class="cover" :class="{ 'cover-empty': !item.cover }">
            <img v-if="item.cover" :src="item.cover" :alt="item.title" loading="lazy" />
            <span v-else class="cover-initial">{{ (item.title || '活').slice(0, 1) }}</span>
            <span v-if="isExternal(item.link)" class="cover-link">
              <i class="fas fa-external-link-alt"></i>
            </span>
          </div>
          <div class="card-body">
            <h4 class="card-name">{{ item.title }}</h4>
            <p class="card-date mb-0">
              {{ item.date }}<span v-if="item.author"> · {{ item.author }}</span>
            </p>
            <p v-if="item.summary" class="card-summary mb-0">{{ item.summary }}</p>
          </div>
        </component>
      </div>
    </div>
  </div>
</template>

<script>
import { getActivities } from '@/api/edgeActivities';

export default {
  name: 'activities',
  data() {
    return {
      items: [],
      loading: true,
      error: '',
      keyword: ''
    };
  },
  computed: {
    filtered() {
      const kw = this.keyword.toLowerCase();
      if (!kw) return this.items;
      return this.items.filter(item =>
        [item.title, item.author, item.date, item.summary]
          .filter(Boolean)
          .some(text => String(text).toLowerCase().indexOf(kw) >= 0)
      );
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
        this.items = await getActivities({ kind: 'activity' });
      } catch (e) {
        this.error = e.message || '活动加载失败';
      }
      this.loading = false;
    },
    isExternal(link) {
      return /^https?:\/\//i.test(link || '');
    },
    linkProps(item) {
      if (this.isExternal(item.link)) {
        return { href: item.link, target: '_blank', rel: 'noopener' };
      }
      if (item.link) return { to: item.link };
      return { to: `/activity/${item.id}` };
    }
  }
};
</script>

<style scoped>
.page-body {
  padding-bottom: 3.5rem;
  max-width: 1140px;
}

.page-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.search-box {
  flex: 1;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: 999px;
  padding: 0.4rem 0.95rem;
}

.search-box i {
  color: #9ca3af;
  font-size: 0.85rem;
}

.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.9rem;
  background: transparent;
}

.count {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}

.activity-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  color: var(--ink, #1f2937);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.activity-card:hover {
  text-decoration: none;
  color: var(--ink, #1f2937);
  transform: translateY(-4px);
  box-shadow: var(--shadow, 0 4px 20px rgba(15, 23, 42, 0.08));
}

.cover {
  position: relative;
  height: 150px;
  overflow: hidden;
  flex: none;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 无封面：渐变底 + 标题首字，避免大面积空白占位 */
.cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eaf4fe 0%, #dbeafe 55%, #cfe6fc 100%);
}

.cover-initial {
  font-size: 2.4rem;
  font-weight: 700;
  color: #5b9bd5;
  opacity: 0.75;
}

.cover-link {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--accent-dark, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.card-body {
  padding: 0.9rem 1rem 1.1rem;
  text-align: left;
}

.card-name {
  font-size: 1.02rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-date {
  font-size: 0.8rem;
  color: var(--ink-muted, #6b7280);
}

.card-summary {
  margin-top: 0.4rem;
  font-size: 0.82rem;
  color: var(--ink-soft, #4b5563);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
