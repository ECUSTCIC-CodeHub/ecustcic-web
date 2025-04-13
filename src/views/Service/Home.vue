<template>
  <div class="service">
    <img src="../../assets/img/Service/bg.png" width="100%" />
    <div class="container">
      <br />
      <div class="row">
        <div class="col-md-9">
          <div>
            <h4 class="section-title">我们的服务</h4>
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
                :style="`--hue: ${index * 40 % 360}`"
              >
                <div class="tile-icon">
                  <i :class="getServiceIcon(index)"></i>
                </div>
                <div class="tile-content">
                  <h5>{{ scope }}</h5>
                  <span class="tile-tag" :style="getTagStyle(index)">{{ getServiceType(index) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card" style="width: 18rem;">
            <br />
            <img
              src="../../assets/img/Home/serve.png"
              class="rounded-circle img-center"
              alt="..."
              width="100"
            />
            <br />
            <div class="card-body" style="background:#e7f7fe;">
              <h5 class="card-title">服务部</h5>
              <p class="card-text">服务部提供免费的电脑设备维修服务。</p>
              <a href="/service/repair" class="btn btn-primary btn-lg">前往报修>></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container container-fluid"></div>
  </div>
</template>

<style scoped>
:root {
  --primary: #0066cc;
  --secondary: #e7f7fe;
}

.img-center {
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary);
}

.service-info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  border-left: 4px solid var(--primary);
}

.info-content {
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(0,102,204,0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-content:hover {
  background: rgba(0,102,204,0.1);
}

.info-icon {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-primary);
}

.info-icon i {
  color: var(--primary);
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
  background: rgba(0,102,204,0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(0,102,204,0.1);
}

.detail-item i {
  color: var(--primary);
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

.detail-item span {
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 576px) {
  .info-details {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.service-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.service-tile {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border-top: 4px solid hsl(var(--hue), 80%, 60%);
}

.service-tile:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.tile-icon {
  font-size: 1.8rem;
  color: hsl(var(--hue), 80%, 60%);
  margin-bottom: 1rem;
}

.tile-content h5 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
}

.tile-tag {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: hsl(var(--hue), 80%, 90%);
  color: hsl(var(--hue), 80%, 30%);
}

.service-meta {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0 2rem;
  padding: 1.2rem;
  background: var(--secondary);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.meta-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: white;
  border-radius: 8px;
  flex: 1;
  min-width: 200px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: default;
}

.meta-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .service-meta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .meta-item {
    width: 100%;
    min-width: auto;
  }

  .row {
    flex-direction: column;
  }
  
  .col-md-3, .col-md-9 {
    width: 100%;
    max-width: 100%;
    padding-right: 15px;
    padding-left: 15px;
  }
  
  .card {
    width: 100% !important;
    margin-bottom: 2rem;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .card-body .btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .rounded-circle {
    width: 80px !important;
    height: 80px !important;
  }
}

.meta-item i {
  font-size: 1.3rem;
  color: var(--primary);
  background: rgba(0,102,204,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-item h6 {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.2rem;
  font-weight: 500;
}

.meta-item p {
  font-size: 0.95rem;
  color: #333;
  margin: 0;
  font-weight: 600;
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
    },
    getTagStyle(index) {
      return `--hue: ${index * 40 % 360}`
    }
  }
};
</script>