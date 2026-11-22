<template>
  <div class="container px-5 pt-3 pb-5" id="info">
    <AnimWords text="UserInfo" :animation="false" fontSize="3rem" />

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">正在获取用户信息...</p>
    </div>

    <!-- 未登录：引导去登录 -->
    <div v-else-if="!user" class="not-logged-in text-center py-5">
      <i class="fas fa-user-circle fa-5x mb-4"></i>
      <h4>登录后可查看个人信息</h4>
      <p class="text-muted">使用 ECUSTMC 用户中心账号登录本站</p>
      <a href="/api/auth/login" class="btn btn-cic mt-2">
        <i class="fas fa-sign-in-alt mr-2"></i>登录
      </a>
    </div>

    <!-- 已登录：展示用户信息 -->
    <div v-else class="profile-card mx-auto">
      <div class="profile-top">
        <img :src="user.avatar" class="profile-avatar" :alt="user.nickname" />
        <h3 class="profile-nickname mt-3">{{ user.nickname }}</h3>
        <span class="profile-badge" :class="user.isAdmin ? 'badge-admin' : 'badge-member'">
          <i class="fas" :class="user.isAdmin ? 'fa-user-shield' : 'fa-user'"></i>
          {{ user.isAdmin ? '管理员' : '成员' }}
        </span>
      </div>
      <div class="profile-fields">
        <div class="profile-field">
          <span class="field-label"><i class="fas fa-envelope fa-fw"></i> 邮箱</span>
          <span class="field-value">{{ user.email || '未绑定' }}</span>
        </div>
        <div class="profile-field">
          <span class="field-label"><i class="fas fa-id-badge fa-fw"></i> 皮肤站 UID</span>
          <span class="field-value">{{ user.uid }}</span>
        </div>
        <div class="profile-field">
          <span class="field-label"><i class="fas fa-cube fa-fw"></i> ECUSTMC 用户中心</span>
          <span class="field-value">
            <a :href="skinHome" target="_blank" rel="noopener">前往管理 <i class="fas fa-external-link-alt fa-xs"></i></a>
          </span>
        </div>
        <div v-if="user.isAdmin" class="profile-field">
          <span class="field-label"><i class="fas fa-gear fa-fw"></i> 管理面板</span>
          <span class="field-value">
            <router-link to="/admin/activity">前往活动管理</router-link>
          </span>
        </div>
      </div>
      <div class="profile-actions">
        <a href="/api/auth/logout" class="btn btn-outline-secondary btn-sm">
          <i class="fas fa-sign-out-alt mr-1"></i>退出登录
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
#info {
  min-height: 70vh;
}

.not-logged-in {
  color: var(--ink-muted, #6b7280);
}

.not-logged-in i {
  color: var(--line, #e5e7eb);
}

.profile-card {
  max-width: 480px;
  background: #fff;
  border: 1px solid var(--line, #e5e7eb);
  border-radius: var(--radius, 12px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(15, 23, 42, 0.06));
  padding: 2.2rem 2rem 1.5rem;
}

.profile-top {
  text-align: center;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-soft, rgba(52, 152, 219, 0.15));
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
}

.profile-nickname {
  font-weight: 700;
  color: var(--ink, #1f2937);
}

.profile-badge {
  display: inline-block;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.badge-member {
  background: var(--accent-soft, rgba(52, 152, 219, 0.1));
  border: 1px solid rgba(52, 152, 219, 0.3);
  color: var(--accent-dark, #2980b9);
}

.badge-admin {
  background: rgba(240, 173, 78, 0.12);
  border: 1px solid rgba(240, 173, 78, 0.45);
  color: #8a6d1d;
}

.profile-fields {
  margin: 1.8rem 0 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.profile-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px dashed var(--line, #e5e7eb);
}

.profile-field:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.field-label {
  color: var(--ink-muted, #6b7280);
  font-size: 0.9rem;
}

.field-label i {
  margin-right: 0.3rem;
  color: var(--accent-dark, #2980b9);
}

.field-value {
  color: var(--ink, #1f2937);
  font-weight: 500;
  text-align: right;
}

.profile-actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--line, #e5e7eb);
}
</style>

<script>
import AnimWords from '@/components/AnimWords.vue';

export default {
  name: 'UserInfo',
  components: { AnimWords },
  data() {
    return {
      user: null,
      loading: true,
      skinHome: 'https://mcskin.ecustvr.top'
    };
  },
  mounted() {
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && data.ret === 0) {
          this.user = data.data;
        }
      })
      .catch(() => {
        this.user = null;
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>
