<template>
  <div class="tools">
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
        <h1>工具箱</h1>
        <p>校内常用工具与服务入口，一个页面全部直达</p>
      </div>
    </div>

    <div class="container tools-body">
      <div class="row">
        <div class="col-lg-9">
          <h4 class="cic-section-title">常用入口</h4>
          <div class="tool-grid">
            <a
              v-for="tool in tools"
              :key="tool.url"
              :href="tool.url"
              target="_blank"
              rel="noopener noreferrer"
              class="tool-card"
            >
              <div class="tool-icon">
                <i :class="tool.icon"></i>
              </div>
              <div class="tool-main">
                <div class="tool-name">
                  {{ tool.name }}
                  <span v-if="tool.campus" class="tool-badge">仅校内网</span>
                </div>
                <p class="tool-desc">{{ tool.desc }}</p>
              </div>
              <i class="fas fa-external-link-alt tool-arrow"></i>
            </a>
          </div>

          <p class="tools-note">
            <i class="fas fa-circle-info mr-1"></i>
            标注「仅校内网」的站点需要连接校园网（或校内 VPN）才能访问，其余站点校内外均可访问。
          </p>
        </div>

        <div class="col-lg-3">
          <!-- 白色按钮：进入服务部介绍（原九宫格页面） -->
          <router-link to="/service/support" class="side-tool-btn">
            <i class="fas fa-screwdriver-wrench mr-2"></i>服务部介绍
          </router-link>

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
              <router-link to="/service/repair" class="btn btn-cic">
                前往报修 <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "service-tools",
  data() {
    return {
      tools: [
        {
          name: "校内测速",
          desc: "信息办提供的校园网测速站点，测一下宿舍网速",
          url: "http://172.20.17.6/",
          icon: "fas fa-tachometer-alt",
          campus: true
        },
        {
          name: "课程与教室查询",
          desc: "查课表、空闲教室与开课信息",
          url: "https://class.ecust.icu/",
          icon: "fas fa-chalkboard-teacher"
        },
        {
          name: "域名分发",
          desc: "CIC 子域名申请与管理",
          url: "https://nic.ecustcic.com/",
          icon: "fas fa-globe"
        },
        {
          name: "AI 大模型网关",
          desc: "统一的模型调用入口，一个 Key 用全部模型",
          url: "https://ai.ecustcic.com/",
          icon: "fas fa-robot"
        },
        {
          name: "ECUSTMC 用户中心",
          desc: "Minecraft 服务器账号、白名单与皮肤",
          url: "https://mc.ecustvr.top/",
          icon: "fas fa-cube"
        },
        {
          name: "IP 查询 / 网络检测",
          desc: "查看公网 IP、归属地与本地网络状态",
          url: "https://geoip.bestzyq.cn/",
          icon: "fas fa-network-wired"
        },
        {
          name: "课程分享仓库",
          desc: "ECUST 课程资料与经验分享",
          url: "https://ecust-courseshare.bestzyq.cn/",
          icon: "fas fa-book-open"
        }
      ]
    };
  }
};
</script>

<style scoped>
.tools-body {
  /* 只设上下内边距，保留 .container 自带的左右 15px，否则窄屏内容会贴边溢出 */
  padding-top: 2.5rem;
  padding-bottom: 4rem;
  /* 兜底：避免子元素继承到居中样式造成文字错位 */
  text-align: left;
}

/* 标题与下划线统一左对齐（避免继承到居中对齐导致横线错位） */
.tools-body .cic-section-title {
  text-align: left;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.1rem 1.15rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: rgba(52, 152, 219, 0.45);
  color: var(--ink);
  text-decoration: none;
}

.tool-icon {
  flex: none;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-size: 1.05rem;
  transition: background 0.25s ease, color 0.25s ease;
}

.tool-card:hover .tool-icon {
  background: var(--accent);
  color: #fff;
}

.tool-main {
  flex: 1;
  min-width: 0;
}

.tool-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.98rem;
  margin-bottom: 0.25rem;
  color: var(--ink);
}

.tool-badge {
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: #fef3c7;
  color: #b45309;
  font-size: 0.68rem;
  font-weight: 600;
}

.tool-desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--ink-muted);
  text-align: left;
}

.tool-arrow {
  flex: none;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #cbd5e1;
  transition: color 0.25s ease;
}

.tool-card:hover .tool-arrow {
  color: var(--accent);
}

.tools-note {
  margin: 1.4rem 0 0;
  font-size: 0.8rem;
  color: var(--ink-muted);
  text-align: left;
}

/* 右侧栏的白色按钮（服务部介绍入口） */
.side-tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.72rem 1rem;
  margin-bottom: 1rem;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  color: var(--accent-dark);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.side-tool-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(52, 152, 219, 0.5);
  box-shadow: var(--shadow);
  color: var(--accent-dark);
  text-decoration: none;
}

/* 侧栏服务部卡片 */
.side-card {
  border: none;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
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

@media (max-width: 991.98px) {
  .side-tool-btn {
    margin-top: 2rem;
  }
}
</style>
