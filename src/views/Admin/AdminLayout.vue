<template>
  <div class="admin-container">
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
        <span class="cic-hero-tag">CIC · ADMIN</span>
        <h1>内容管理</h1>
        <p>活动 · 快讯 · 封面与正文统一维护</p>
      </div>
    </div>

    <div class="container admin-body">
      <!-- 登录态检查中 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-3 mb-0">正在校验登录状态…</p>
      </div>

      <!-- 未登录 -->
      <div v-else-if="!user" class="gate cic-card text-center">
        <i class="fas fa-user-lock"></i>
        <h4>需要登录</h4>
        <p class="text-muted">内容管理使用 ECUSTMC 账号登录，仅皮肤站管理员可编辑。</p>
        <a href="/api/auth/login" class="btn btn-cic">
          <i class="fas fa-sign-in-alt mr-2"></i>使用 ECUSTMC 登录
        </a>
      </div>

      <!-- 非管理员 -->
      <div v-else-if="!user.isAdmin" class="gate cic-card text-center">
        <i class="fas fa-lock"></i>
        <h4>无编辑权限</h4>
        <p class="text-muted">
          当前账号（{{ user.nickname }}）不是 ECUSTMC 管理员，如需权限请在皮肤站获取管理员身份。
        </p>
        <a href="/api/auth/logout" class="btn btn-cic-outline">退出登录</a>
      </div>

      <!-- 管理员：导航 + 子页面 -->
      <template v-else>
        <div class="admin-bar">
          <div class="user-pill">
            <img :src="user.avatar" class="user-avatar" alt="" />
            <span>{{ user.nickname }}</span>
          </div>
          <nav class="admin-tabs">
            <router-link to="/admin/activity" class="admin-tab">活动管理</router-link>
            <router-link to="/admin/news" class="admin-tab">快讯管理</router-link>
          </nav>
          <a href="/api/auth/logout" class="logout-link">退出登录</a>
        </div>

        <router-view />
      </template>
    </div>
  </div>
</template>

<script>
import { fetchCurrentUser } from '@/api/adminAuth';

export default {
  name: 'AdminLayout',
  data() {
    return {
      user: null,
      loading: true
    };
  },
  async created() {
    this.user = await fetchCurrentUser();
    this.loading = false;
  }
};
</script>

<style scoped>
.admin-container {
  background-color: var(--surface-alt, #f8fafc);
  min-height: 100vh;
  padding-bottom: 3rem;
}

.admin-body {
  max-width: 1180px;
}

.gate {
  padding: 3rem 2rem;
  max-width: 620px;
  margin: 0 auto;
}

.gate i {
  font-size: 2.2rem;
  color: var(--accent, #3498db);
  margin-bottom: 1rem;
}

.gate h4 {
  font-weight: 700;
  margin-bottom: 0.6rem;
}

.admin-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0.35rem 1.1rem 0.35rem 0.4rem;
  font-size: 0.9rem;
  color: var(--ink-soft, #4b5563);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-tabs {
  display: inline-flex;
  background: #eef2f7;
  border-radius: 999px;
  padding: 0.25rem;
}

.admin-tab {
  padding: 0.4rem 1.2rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink-muted, #6b7280);
  text-decoration: none;
  transition: all 0.2s ease;
}

.admin-tab:hover {
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
}

.admin-tab.router-link-active {
  background: #fff;
  color: var(--accent-dark, #2980b9);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
}

.logout-link {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--ink-muted, #6b7280);
}

.logout-link:hover {
  color: #dc3545;
  text-decoration: none;
}
</style>
