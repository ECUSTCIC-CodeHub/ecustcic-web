<template>
  <div class="service">
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
        <span class="cic-hero-tag">CIC · SERVICE</span>
        <h1>服务部</h1>
        <p>服务华理 · 免费维修 · 有问必答</p>
      </div>
    </div>
    <div class="container support-nav">
      <router-link to="/service" class="back-link">
        <i class="fas fa-arrow-left fa-xs mr-1"></i>返回工具箱
      </router-link>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-md-9">
          <div>
            <h4 class="section-title cic-section-title">我们的服务</h4>
            <div class="service-info-card">
              <div class="info-content">
                <div class="info-icon">
                  <i class="fas fa-info-circle"></i> 工作内容：{{ serviceInfo.workContent }}
                </div>
              </div>
              <div class="info-details">
                <div class="detail-item">
                  <i class="far fa-clock"></i> 时间：{{ serviceInfo.time }}
                </div>
                <div class="detail-item">
                  <i class="fas fa-map-marker-alt"></i> 地点：{{ serviceInfo.location }}
                </div>
              </div>
            </div>

            <div class="service-masonry">
              <div
                v-for="(scope, index) in serviceInfo.serviceScope"
                :key="index"
                class="service-tile"
                :class="index % 2 === 0 ? 'tile-even' : 'tile-odd'"
              >
                <div class="tile-icon">
                  <i :class="getServiceIcon(index)"></i>
                </div>
                <div class="tile-content">
                  <h5>{{ scope }}</h5>
                  <span class="tile-tag">{{ getServiceType(index) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card side-card">
            <div class="side-card-icon">
              <img
                src="../../assets/img/Home/serve.png"
                class="rounded-circle"
                alt="服务部"
                width="100"
                height="100"
              />
            </div>
            <div class="card-body">
              <h5 class="card-title">服务部</h5>
              <p class="card-text">服务部提供免费的电脑设备维修服务。</p>
              <a href="/service/repair" class="btn btn-cic">前往报修 <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container container-fluid"></div>
  </div>
</template>

<style scoped>
/* 返回工具箱 */
.support-nav {
  padding-top: 1.2rem;
  padding-bottom: 1.1rem;
  /* #app 全局是 text-align: center，这里需要左对齐 */
  text-align: left;
}

.back-link {
  font-size: 0.85rem;
  color: var(--ink-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent-dark);
  text-decoration: none;
}

/* 标题与下划线对齐（#app 全局 text-align: center 会把标题挤到中间） */
.section-title.cic-section-title {
  text-align: left;
}

/* ---------- 服务信息卡 ---------- */
.service-info-card {
  background: var(--accent-soft);
  border: 1px solid rgba(52, 152, 219, 0.25);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.service-info-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.info-content {
  padding: 1rem;
  margin-bottom: 1.2rem;
  background: var(--surface);
  border-radius: var(--radius-sm);
  transition: background 0.3s ease;
}

.info-content:hover {
  background: rgba(52, 152, 219, 0.06);
}

.info-icon {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--ink);
}

.info-icon i {
  color: var(--accent-dark);
  font-size: 1.2rem;
}

.info-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: var(--surface);
  border-radius: var(--radius-sm);
  color: var(--ink);
  transition: background 0.3s ease;
}

.detail-item:hover {
  background: rgba(52, 152, 219, 0.06);
}

.detail-item i {
  color: var(--accent-dark);
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

/* ---------- 服务内容网格 ---------- */
.section-subtitle {
  font-size: 1.1rem;
  color: var(--ink-muted);
  margin-bottom: 2rem;
}

.service-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  margin: 2rem 0;
}

/* 两色交替，收敛视觉 */
.service-tile {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 1.4rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--line);
  transition: all 0.3s ease;
}

.service-tile:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow);
}

.tile-odd {
  background: rgba(52, 152, 219, 0.06);
  border-color: rgba(52, 152, 219, 0.22);
}

.tile-icon {
  font-size: 1.8rem;
  color: var(--accent-dark);
  margin-bottom: 1rem;
}

.tile-content h5 {
  font-size: 1.05rem;
  margin-bottom: 0.8rem;
  color: var(--ink);
}

.tile-tag {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(52, 152, 219, 0.14);
  color: var(--accent-dark);
}

/* ---------- 侧栏卡片 ---------- */
.side-card {
  border: none;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.side-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.side-card-icon {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.5rem;
  background: var(--surface);
}

.side-card .card-body {
  background: var(--accent-soft);
  text-align: center;
}

.side-card .btn {
  width: 100%;
}

@media (max-width: 768px) {
  .info-details {
    grid-template-columns: 1fr;
  }

  .side-card {
    margin-top: 2rem;
  }
}
</style>
<script>
export default {
  name: "service",
  data() {
    return {
      serviceInfo: {
        workContent: "线下志愿电脑维护、修复工作，线上问诊等",
        serviceScope: [
          "系统错误定位",
          "寝室网络优化",
          "计算机散热模块维护",
          "硬件故障的初步定位",
          "操作系统深度清理与安全维护",
          "个人服务器技术支持",
          "个人数据迁移与修复（含冷备份）",
          "软件安装支持",
          "校园网网络问题上报"
        ],
        time: "双周周二中午12:30至下午18:30",
        location: "奉贤校区一食堂门口"
      }
    }
  },
  methods: {
    getServiceIcon(index) {
      const icons = [
        'fas fa-desktop',       // 系统错误
        'fas fa-network-wired', // 网络优化
        'fas fa-fan',           // 散热维护
        'fas fa-microchip',     // 硬件故障
        'fas fa-shield-alt',    // 系统安全
        'fas fa-server',        // 个人服务器
        'fas fa-database',      // 数据迁移
        'fas fa-download',      // 软件安装
        'fas fa-wifi'           // 网络问题
      ]
      return icons[index % icons.length]
    },
    getServiceType(index) {
      const types = ['系统', '网络', '硬件', '硬件', '系统', '服务器', '数据', '软件', '网络']
      return types[index % types.length]
    }
  }
};
</script>
