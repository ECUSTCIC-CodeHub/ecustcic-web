<template>
  <div class="admin-container">
    <div class="cic-hero">
      <div class="cic-hero-overlay">
        <span class="cic-hero-tag">CIC · ADMIN</span>
        <h1>活动管理</h1>
        <p>发布 · 编辑 · 删除站点活动</p>
      </div>
    </div>

    <div class="container">
      <!-- 未登录提示 -->
      <div v-if="!user" class="alert alert-info text-center">
        <i class="fas fa-info-circle"></i>
        发布活动需要先使用 ECUSTMC 账号登录。
        <a href="/api/auth/login" class="btn btn-cic btn-sm ml-2">使用 ECUSTMC 登录</a>
      </div>

      <div v-else class="user-pill mb-4">
        <img :src="user.avatar" class="user-avatar" alt="" />
        <span>{{ user.nickname }}</span>
        <a href="/api/auth/logout" class="ml-auto text-muted small">退出登录</a>
      </div>

      <!-- 表单 -->
      <section v-if="user" class="admin-form-section mb-5">
        <h3 class="mb-3">{{ editingId ? '编辑活动' : '发布新活动' }}</h3>
        <form @submit.prevent="submitActivity">
          <div class="form-row">
            <div class="form-group col-md-8">
              <label>活动标题 <span class="text-danger">*</span></label>
              <input v-model.trim="form.title" type="text" class="form-control" required placeholder="活动标题" />
            </div>
            <div class="form-group col-md-4">
              <label>日期 <span class="text-danger">*</span></label>
              <input v-model="form.date" type="date" class="form-control" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col-md-8">
              <label>封面图（可选，5MB 以内）</label>
              <input type="file" class="form-control-file" accept="image/*" @change="onCoverChange" />
              <div v-if="coverPreview" class="cover-preview mt-2">
                <img :src="coverPreview" alt="封面预览" />
              </div>
            </div>
            <div class="form-group col-md-4">
              <label>作者</label>
              <input v-model.trim="form.author" type="text" class="form-control" placeholder="默认 CIC" />
            </div>
          </div>
          <div class="form-group">
            <label>活动正文（Markdown）</label>
            <textarea v-model="form.content" class="form-control" rows="6" placeholder="支持 Markdown 格式"></textarea>
          </div>
          <button type="submit" class="btn btn-cic" :disabled="submitting">
            {{ submitting ? '提交中...' : (editingId ? '保存修改' : '发布活动') }}
          </button>
          <button v-if="editingId" type="button" class="btn btn-outline-secondary ml-2" @click="resetForm">取消编辑</button>
        </form>
      </section>

      <!-- 活动列表 -->
      <section class="admin-list-section mb-5">
        <h3 class="mb-3">现有活动（{{ activities.length }}）</h3>
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="activities.length === 0" class="text-muted text-center py-4">
          暂无活动，快去发布第一条吧！
        </div>
        <div v-else class="activity-rows">
          <div v-for="act in activities" :key="act.id" class="activity-row">
            <div class="row align-items-center">
              <div class="col-sm-2">
                <img v-if="act.cover" :src="act.cover" class="row-cover" alt="" />
                <div v-else class="row-cover row-cover-empty"><i class="far fa-image"></i></div>
              </div>
              <div class="col-sm-6">
                <div class="row-title">{{ act.title }}</div>
                <div class="text-muted small">{{ act.date }} · {{ act.author }}</div>
              </div>
              <div class="col-sm-4 text-right">
                <button class="btn btn-sm btn-outline-primary mr-2" @click="editActivity(act)">编辑</button>
                <button class="btn btn-sm btn-outline-danger" @click="removeActivity(act)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  background-color: var(--surface-alt, #f8fafc);
  min-height: 100vh;
  padding-bottom: 3rem;
}

.alert {
  border-radius: var(--radius, 12px);
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.35rem 1.1rem 0.35rem 0.4rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-form-section,
.admin-list-section {
  background: #fff;
  border-radius: var(--radius, 12px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(15, 23, 42, .06));
  border: 1px solid #e5e7eb;
  padding: 1.6rem 1.8rem;
}

.cover-preview img {
  max-width: 240px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.activity-rows {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.activity-row {
  background: var(--surface-alt, #f8fafc);
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-sm, 8px);
  padding: 0.8rem 1rem;
}

.row-cover {
  width: 100%;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
}

.row-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background: #eef2f7;
}

.row-title {
  font-weight: 600;
  color: var(--ink, #1f2937);
}
</style>

<script>
// 管理面板：活动管理
// 使用 Blessing Skin OAuth 登录（/api/auth/*）
// 活动数据通过 /api/activity/*（Edge Functions + KV）
// 封面上传通过 /api/activity-image（Cloud Functions + Blob）
import { getActivities, saveActivity, deleteActivity } from '@/api/edgeActivities';

export default {
  name: 'ActivityAdmin',
  data() {
    return {
      user: null,
      activities: [],
      loading: true,
      submitting: false,
      editingId: null,
      coverPreview: null,
      coverDataUrl: null,
      form: {
        title: '',
        date: '',
        author: '',
        content: ''
      }
    };
  },
  mounted() {
    this.fetchMe();
    this.fetchActivities();
  },
  methods: {
    async fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.ret === 0) {
          this.user = data.data;
        }
      } catch (e) {
        this.user = null;
      }
    },
    async fetchActivities() {
      this.loading = true;
      try {
        this.activities = await getActivities();
      } catch (e) {
        this.activities = [];
      }
      this.loading = false;
    },
    onCoverChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('图片不能超过 5MB');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.coverDataUrl = reader.result;
        this.coverPreview = reader.result;
      };
      reader.readAsDataURL(file);
    },
    async submitActivity() {
      if (!this.form.title || !this.form.date) {
        alert('请填写标题和日期');
        return;
      }
      this.submitting = true;
      try {
        const payload = {
          id: this.editingId || undefined,
          ...this.form,
          cover: this.coverPreview || '',
        };
        await saveActivity(payload, this.getAdminToken());
        await this.fetchActivities();
        this.resetForm();
      } catch (e) {
        alert('保存失败: ' + e.message);
      }
      this.submitting = false;
    },
    // 后台面板以会话 Cookie 鉴权；POST/DELETE 到 /api/activity/*
    // 由 Edge Function 校验 Authorization header。此函数从会话派生。
    async getAdminToken() {
      const res = await fetch('/api/auth/token');
      if (!res.ok) throw new Error('无权限发布');
      const data = await res.json();
      return data.data.token;
    },
    editActivity(act) {
      this.editingId = act.id;
      this.form = {
        title: act.title,
        date: act.date,
        author: act.author,
        content: act.content || ''
      };
      this.coverPreview = act.cover || null;
      this.coverDataUrl = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async removeActivity(act) {
      if (!confirm(`确认删除活动「${act.title}」吗？`)) return;
      try {
        await deleteActivity(act.id, await this.getAdminToken());
        await this.fetchActivities();
        if (this.editingId === act.id) this.resetForm();
      } catch (e) {
        alert('删除失败: ' + e.message);
      }
    },
    resetForm() {
      this.editingId = null;
      this.form = { title: '', date: '', author: '', content: '' };
      this.coverPreview = null;
      this.coverDataUrl = null;
    }
  }
};
</script>
