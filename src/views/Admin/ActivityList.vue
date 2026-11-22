<template>
  <div class="list-page">
    <div class="list-head">
      <div>
        <h3 class="list-title">{{ isNews ? '快讯' : '活动' }}管理</h3>
        <p class="list-desc mb-0">
          {{ isNews
            ? '快讯以文字列表形式出现在首页与组宣页，可附外链。'
            : '活动支持 Markdown 正文、封面上传与外链跳转。' }}
        </p>
      </div>
      <router-link :to="`/admin/${kind}/new`" class="btn btn-cic">
        <i class="fas fa-plus mr-2"></i>新建{{ isNews ? '快讯' : '活动' }}
      </router-link>
    </div>

    <div class="list-toolbar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input v-model.trim="keyword" type="search" placeholder="搜索标题 / 作者 / 日期" />
      </div>
      <span class="count">共 {{ items.length }} 条</span>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="text-muted mt-3 mb-0">正在加载…</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle mr-2"></i>{{ error }}
      <button class="btn btn-sm btn-outline-danger ml-3" @click="load">重试</button>
    </div>

    <div v-else-if="items.length === 0" class="empty cic-card">
      <i class="far fa-folder-open"></i>
      <h5>还没有内容</h5>
      <p class="text-muted mb-3">点击右上角「新建」发布第一条{{ isNews ? '快讯' : '活动' }}。</p>
      <router-link :to="`/admin/${kind}/new`" class="btn btn-cic-outline btn-sm">立即创建</router-link>
    </div>

    <div v-else-if="filtered.length === 0" class="empty cic-card">
      <i class="fas fa-search"></i>
      <h5>没有匹配的内容</h5>
      <p class="text-muted mb-0">试试其它关键词，或清空搜索框。</p>
    </div>

    <div v-else class="cic-card table-wrap">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th class="col-main">内容</th>
            <th class="col-date">日期</th>
            <th class="col-author">作者</th>
            <th class="col-status">状态</th>
            <th class="col-actions text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.id">
            <td>
              <div class="cell-main">
                <img v-if="item.cover" :src="item.cover" class="thumb" alt="" />
                <div v-else class="thumb thumb-empty"><i class="far fa-image"></i></div>
                <div class="meta">
                  <router-link :to="editPath(item)" class="item-title">{{ item.title }}</router-link>
                  <p class="item-summary mb-0">{{ summaryOf(item) }}</p>
                </div>
              </div>
            </td>
            <td class="nowrap">{{ item.date }}</td>
            <td class="nowrap">{{ item.author }}</td>
            <td>
              <span v-if="item.hidden" class="tag tag-hidden">已隐藏</span>
              <span v-else class="tag tag-live">已发布</span>
              <span v-if="item.link" class="tag tag-link">
                <i class="fas fa-external-link-alt"></i> 外链
              </span>
            </td>
            <td class="text-right nowrap">
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noopener"
                class="btn btn-sm btn-outline-secondary"
              >预览</a>
              <a
                v-else-if="!isNews"
                :href="`/activity/${item.id}`"
                target="_blank"
                rel="noopener"
                class="btn btn-sm btn-outline-secondary"
              >预览</a>
              <router-link :to="editPath(item)" class="btn btn-sm btn-outline-primary">编辑</router-link>
              <button
                class="btn btn-sm btn-outline-danger"
                :disabled="deletingId === item.id"
                @click="remove(item)"
              >{{ deletingId === item.id ? '删除中…' : '删除' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getActivities, deleteActivity } from '@/api/edgeActivities';
import { getAdminToken, clearAdminToken } from '@/api/adminAuth';

export default {
  name: 'ActivityList',
  props: {
    kind: { type: String, default: 'activity' }
  },
  data() {
    return {
      items: [],
      loading: true,
      error: '',
      keyword: '',
      deletingId: null
    };
  },
  computed: {
    isNews() {
      return this.kind === 'news';
    },
    filtered() {
      const kw = this.keyword.toLowerCase();
      if (!kw) return this.items;
      return this.items.filter(item =>
        [item.title, item.author, item.date]
          .filter(Boolean)
          .some(text => String(text).toLowerCase().indexOf(kw) >= 0)
      );
    }
  },
  watch: {
    kind() {
      this.load();
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
        const token = await getAdminToken();
        this.items = await getActivities({
          kind: this.kind,
          includeHidden: true,
          token
        });
      } catch (e) {
        if (e.status === 401) {
          clearAdminToken();
          this.error = '鉴权失败：管理凭证无效。请重新登录；若持续出现请检查后台 ADMIN_TOKEN 配置。';
        } else {
          this.error = e.message || '加载失败';
        }
      }
      this.loading = false;
    },
    editPath(item) {
      return `/admin/${this.kind}/${item.id}/edit`;
    },
    summaryOf(item) {
      if (item.summary) return item.summary;
      const text = String(item.content || '')
        .replace(/[#>*`_~!()[\]-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return text ? text.slice(0, 60) + (text.length > 60 ? '…' : '') : '暂无正文';
    },
    async remove(item) {
      if (!confirm(`确认删除「${item.title}」吗？删除后不可恢复。`)) return;
      this.deletingId = item.id;
      try {
        const token = await getAdminToken();
        await deleteActivity(item.id, token);
        this.items = this.items.filter(a => String(a.id) !== String(item.id));
      } catch (e) {
        if (e.status === 401) clearAdminToken();
        alert('删除失败: ' + (e.message || '未知错误'));
      }
      this.deletingId = null;
    }
  }
};
</script>

<style scoped>
.list-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.list-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--ink, #1f2937);
}

.list-desc {
  font-size: 0.88rem;
  color: var(--ink-muted, #6b7280);
}

.list-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
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
  padding: 0.35rem 0.9rem;
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

.table-wrap {
  overflow-x: auto;
  padding: 0.25rem 0.5rem;
}

.table {
  font-size: 0.9rem;
}

.table thead th {
  border-top: none;
  border-bottom: 1px solid var(--line, #e5e7eb);
  color: var(--ink-muted, #6b7280);
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
}

.col-main {
  min-width: 320px;
}

.cell-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.thumb {
  width: 64px;
  height: 44px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--line, #e5e7eb);
  flex: none;
}

.thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2f7;
  color: #9ca3af;
}

.meta {
  min-width: 0;
}

.item-title {
  font-weight: 600;
  color: var(--ink, #1f2937);
  text-decoration: none;
  display: block;
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-title:hover {
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
}

.item-summary {
  font-size: 0.8rem;
  color: var(--ink-muted, #6b7280);
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nowrap {
  white-space: nowrap;
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  margin-right: 0.3rem;
  white-space: nowrap;
}

.tag-live {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.tag-hidden {
  background: #eef2f7;
  color: #6b7280;
}

.tag-link {
  background: rgba(52, 152, 219, 0.1);
  color: var(--accent-dark, #2980b9);
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

.empty h5 {
  font-weight: 700;
}
</style>
