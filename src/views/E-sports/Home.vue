<template>
  <div class="esports-container">
    <!-- 电竞部英雄背景图 -->
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
        <span class="cic-hero-tag">CIC · E-SPORTS</span>
        <h1>电竞部</h1>
        <p>丰富校园生活 · 培养竞技精神 · 创造精彩瞬间</p>
      </div>
    </div>

    <div class="container">
      <!-- 电竞部简介 -->
      <section class="intro-section">
        <div class="row">
          <div class="col-md-8">
            <h2 class="section-title">关于我们</h2>
            <p class="intro-text">
              电竞部致力于为校园内的游戏爱好者提供交流平台，组织各类电竞赛事活动，
              培养团队协作精神和竞技意识，同时倡导健康游戏理念。
              <br>
              查看全部交流群:  <a href="/e-sports/detail" target="_blank">点击查看</a>
            </p>
            <div class="achievements">
              <div class="achievement-item">
                <span class="achievement-number">25+</span>
                <span class="achievement-text">年</span>
              </div>
              <div class="achievement-item">
                <span class="achievement-number">1700+</span>
                <span class="achievement-text">活跃成员</span>
              </div>
              <div class="achievement-item">
                <span class="achievement-number">10+</span>
                <span class="achievement-text">项冠军荣誉</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card join-card">
              <div class="card-body">
                <h5 class="card-title">加入我们</h5>
                <p class="card-text">无论你是休闲玩家还是竞技高手，电竞部都欢迎你的加入！</p>
                <div class="d-flex flex-column" style="gap: 12px">
                  <a href="/e-sports/detail" target="_blank" class="btn btn-primary btn-join">
                    <i class="fab fa-qq fa-fw"></i> 查看全部交流群
                  </a>
                  <a href="https://open.weixin.qq.com/qr/code?username=gh_5814cf630585" target="_blank"
                    class="btn btn-primary btn-join" data-toggle="popover" data-animation="true"
                    data-container="#wechat" data-placement="top" data-trigger="manual" data-html="true"
                    data-content="<img src='https://open.weixin.qq.com/qr/code?username=gh_5814cf630585' width='100%'>">
                    <i class="fab fa-weixin fa-fw"></i> 微信公众号
                  </a>
                  <a href="https://qm.qq.com/q/1szFk3nMHC" target="_blank" class="btn btn-primary btn-join"
                    data-toggle="popover" data-animation="true" data-container="#qq" data-placement="top"
                    data-trigger="manual" data-html="true" data-content="<img src='/img/E-sports/qq.jpg' width='100%'>">
                    <i class="fab fa-qq fa-fw"></i> 立即加入
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门游戏介绍 -->
      <section class="games-section">
        <h2 class="section-title">热门游戏</h2>
        <div class="game-tabs">
          <ul class="nav nav-tabs" id="gameTabs" role="tablist">
            <li class="nav-item" v-for="(game, index) in games" :key="game.id">
              <a class="nav-link" :class="{active: index === 0}" :id="`game-${game.id}-tab`" data-toggle="tab"
                :href="`#game-${game.id}`" role="tab">
                <img :src="game.logo" :alt="game.name" class="game-logo">
                {{game.name}}
              </a>
            </li>
          </ul>
          <div class="tab-content" id="gameTabsContent">
            <div class="tab-pane fade" :class="{show: index === 0, active: index === 0}" v-for="(game, index) in games"
              :key="game.id" :id="`game-${game.id}`" role="tabpanel">
              <div class="game-detail">
                <div class="row">
                  <div class="col-md-4">
                    <img :src="game.banner" :alt="game.name" class="game-banner">
                  </div>
                  <div class="col-md-8">
                    <h3>{{game.name}}</h3>
                    <p>{{game.description}}</p>
                    <p class="game-category text-muted mb-3">
                      <span class="info-item">
                        <i class="fas fa-tags"></i> {{game.category}}
                      </span>
                    </p>
                    <div class="btn-container">
                      <a :href="game.qqGroup" target="_blank" class="btn btn-outline-primary btn-join-game">
                        加入{{game.name}}群
                      </a>
                      <a v-if="game.url" :href="game.url" target="_blank" class="btn btn-outline-primary btn-join-game">
                        查看网站
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <router-link to="/e-sports/detail" class="view-all-events">查看全部交流群 <i
          class="fas fa-chevron-right"></i></router-link>

      <!-- 交流活动 -->
      <section class="media-section">
        <h2 class="section-title">交流活动</h2>
        <p class="honor-intro text-muted">电竞真正的故事，往往发生在屏幕之外</p>
        <div class="row">
          <div v-for="(media, index) in sortedMedia" :key="index" class="col-md-6 mb-4">
            <div class="media-card">
              <div class="media-head">
                <span class="media-year">{{ media.year }}</span>
                <span class="media-tag">{{ media.tag }}</span>
              </div>
              <h4 class="media-title">{{ media.title }}</h4>
              <p class="media-source"><i class="far fa-newspaper"></i>
                <a :href="media.link" target="_blank" rel="noopener">{{ media.source }} <i class="fas fa-external-link-alt fa-xs"></i></a>
              </p>
              <p class="media-summary">{{ media.summary }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 荣誉殿堂 -->
      <section class="honor-section">
        <h2 class="section-title honor-toggle" @click="toggleHonors">
          荣誉殿堂
          <i class="fas fa-chevron-down" :class="{ collapsed: !showHonors }"></i>
        </h2>
        <transition name="toggle-fade">
          <div v-show="showHonors">
            <p class="honor-intro text-muted">华理电竞代表队在各大权威赛事中的代表性战绩（不完全统计）</p>
            <div class="honor-timeline">
              <div v-for="(item, index) in sortedAchievements" :key="index" class="honor-item" :class="{reverse: index % 2 === 1}">
                <div class="honor-card">
                  <div class="honor-head">
                    <span class="honor-date">{{ item.year }}</span>
                    <span class="trophy"><i class="fas fa-trophy"></i> {{ item.award }}</span>
                  </div>
                  <h4 class="honor-event">{{ item.event }}</h4>
                  <p class="honor-game"><i class="fas fa-gamepad"></i> {{ item.game }}</p>
                  <p class="honor-detail">{{ item.detail }}</p>
                  <a :href="item.link" target="_blank" rel="noopener" class="honor-source">来源：{{ item.source }} <i class="fas fa-external-link-alt fa-xs"></i></a>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>
    </div>
  </div>
</template>

<script>
import { esportsGames } from '@/data/esportsGames';
import { mediaCoverage, achievements } from '@/data/esportsHonors';

// 将 '2018' / '2024.6' / '2024.12' 等日期字符串解析为可比较的数值
// 解析为 [年, 月] 后再组合，避免浮点比较歧义（如 2024.6 vs 2024.12）
function toSortableDate(str) {
  const parts = String(str).split('.');
  const year = parseInt(parts[0], 10) || 0;
  const month = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  return year * 100 + month;
}

export default {
  name: "e-sports",
  data() {
    return {
      games: esportsGames,
      mediaCoverage,
      achievements,
      showHonors: true
    }
  },
  computed: {
    // 无论数据文件内条目顺序如何，展示时始终按年份、日期升序排列
    sortedAchievements() {
      return [...this.achievements].sort(
        (a, b) => toSortableDate(a.year) - toSortableDate(b.year)
      );
    },
    sortedMedia() {
      return [...this.mediaCoverage].sort(
        (a, b) => toSortableDate(a.year) - toSortableDate(b.year)
      );
    }
  },
  methods: {
    toggleHonors() {
      this.showHonors = !this.showHonors;
    }
  }
}
</script>

<style scoped>
.esports-container {
  background-color: #f8f9fa;
  color: #333;
  /* 阻止最后一个 section 的 margin-bottom 塌陷出容器，
     避免与页脚之间露出 body 白色背景（30px 灰色间隔与页脚同色，视觉无缝） */
  display: flow-root;
}

/* 英雄背景区域（使用全站统一 cic-hero 样式） */

/* 各部分标题样式 */
.section-title {
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
}

/* 关于我们部分 */
.intro-section {
  padding: 50px 0;
}

.intro-text {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 30px;
}

.achievements {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;
}

.achievement-item {
  text-align: center;
}

.achievement-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.achievement-text {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.join-card {
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.join-card .card-body {
  padding: 25px;
}

.join-card .card-title {
  color: #2c3e50;
  font-weight: 700;
}

.btn-container > a:not(:last-child) {
  margin-right: 8px;
}

.btn-join {
  background: linear-gradient(135deg, var(--accent) 0%, #21618c 100%);
  border: none;
  padding: 10px 25px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-join:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.35);
}

/* 游戏介绍部分 */
.games-section {
  padding: 50px 0;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  padding: 30px;
}

.game-tabs {
  margin-top: 30px;
}

.nav-tabs {
  border-bottom: 2px solid #dee2e6;
}

.nav-link {
  color: var(--ink-muted);
  font-weight: 600;
  border: none !important;
  padding: 12px 20px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: var(--accent-dark);
}

.nav-link.active {
  color: var(--accent-dark);
  background-color: transparent;
  border-bottom: 3px solid var(--accent) !important;
}

.game-logo {
  height: 24px;
  max-width: 72px;
  object-fit: contain;
  margin-right: 10px;
}

.game-detail {
  padding: 30px 0;
}

.game-banner {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.game-category {
  margin: 20px 0;
}

.info-item {
  display: inline-block;
  margin-right: 20px;
  color: #7f8c8d;
}

.info-item i {
  margin-right: 5px;
  color: var(--accent-dark);
}

.btn-join-game {
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-join-game:hover {
  background-color: var(--accent);
  color: #fff;
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

/* 公告部分 */
.news-section {
  padding: 50px 0 0 0;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.news-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.news-date {
  text-align: left;
  margin-bottom: 15px;
}

.news-date .date-day {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-dark);
  line-height: 1;
}

.news-date .date-month {
  font-size: 1rem;
  color: #7f8c8d;
  margin-left: 5px;
}

.news-content {
  flex: 1;
}

.news-content h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.news-content p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card .btn {
  align-self: flex-end;
  transition: all 0.3s ease;
}

.news-card .btn:hover {
  background-color: var(--accent);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 赛事部分 */
.events-section {
  padding: 50px 0 20px 0;
}

.event-list {
  margin-bottom: 30px;
}

.event-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.event-date {
  text-align: center;
  padding: 0 20px;
  border-right: 1px solid #eee;
  min-width: 80px;
}

.date-day {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.date-month {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.event-details {
  flex: 1;
  padding: 0 20px;
}

.event-details h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.event-game, .event-time, .event-location {
  margin-bottom: 5px;
  color: #7f8c8d;
}

.event-details i {
  margin-right: 8px;
  color: var(--accent-dark);
}

.event-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-actions .btn {
  margin-bottom: 10px;
  min-width: 80px;
}

.view-all-events {
  color: var(--accent-dark);
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.view-all-events:hover {
  color: var(--accent);
  transform: translateX(5px);
}

.view-all-events i {
  margin-left: 5px;
  transition: all 0.3s;
}

.view-all-events:hover i {
  transform: translateX(5px);
}

/* ---------- 荣誉殿堂 ---------- */
.honor-section,
.media-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin: 30px 0;
}

.honor-intro {
  margin-top: -10px;
}

.honor-timeline {
  position: relative;
  margin-top: 2rem;
}

.honor-timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: var(--line);
}

.honor-item {
  position: relative;
  width: 50%;
  padding: 0 2.4rem 1.8rem 0;
}

.honor-item.reverse {
  margin-left: 50%;
  padding: 0 0 1.8rem 2.4rem;
}

/* 时间线节点 */
.honor-item::before {
  content: '';
  position: absolute;
  top: 20px;
  right: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px #fff;
  z-index: 1;
}

.honor-item.reverse::before {
  right: auto;
  left: -6px;
}

.honor-card {
  background: var(--surface-alt);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.3rem 1.4rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
}

.honor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.honor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.6rem;
}

.honor-date {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.trophy {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #fdf3d8 0%, #fbe9b6 100%);
  border: 1px solid #f0d48a;
  color: #8a6d1d;
  font-size: 0.85rem;
  font-weight: 600;
}

.honor-event {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.3rem;
}

.honor-game {
  color: var(--accent-dark);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.honor-game i,
.honor-detail i {
  margin-right: 0.35rem;
}

.honor-detail {
  color: var(--ink-soft);
  font-size: 0.9rem;
  line-height: 1.75;
  margin-bottom: 0.7rem;
}

.honor-source {
  font-size: 0.8rem;
  color: var(--ink-muted);
}

.honor-source:hover {
  color: var(--accent-dark);
}

/* 可折叠的荣誉殿堂标题 */
.honor-toggle {
  cursor: pointer;
  user-select: none;
}

.honor-toggle:hover {
  color: var(--accent-dark);
}

.honor-toggle .fa-chevron-down {
  font-size: 0.9rem;
  color: var(--ink-muted);
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.honor-toggle:hover .fa-chevron-down {
  color: var(--accent-dark);
}

/* 折叠后箭头旋转180度 */
.honor-toggle .fa-chevron-down.collapsed {
  transform: rotate(-90deg);
}

.toggle-fade-enter-active,
.toggle-fade-leave-active {
  transition: all 0.3s ease;
}

.toggle-fade-enter,
.toggle-fade-leave-to {
  opacity: 0;
}

/* ---------- 媒体报道 ---------- */
.media-card {
  background: var(--surface-alt);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 1.4rem 1.5rem;
  box-shadow: var(--shadow-sm);
  height: 100%;
  transition: all 0.25s ease;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.media-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}

.media-year {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--accent-dark);
}

.media-tag {
  padding: 0.2rem 0.85rem;
  border-radius: 999px;
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.3);
  color: var(--accent-dark);
  font-size: 0.8rem;
  font-weight: 600;
}

.media-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.media-source {
  color: var(--ink-muted);
  font-size: 0.85rem;
  margin-bottom: 0.7rem;
}

.media-source i {
  margin-right: 0.35rem;
}

.media-summary {
  color: var(--ink-soft);
  font-size: 0.9rem;
  line-height: 1.8;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  /* 荣誉时间线移动端单列 */
  .honor-timeline::before {
    display: none;
  }

  .honor-item,
  .honor-item.reverse {
    width: 100%;
    margin-left: 0;
    padding: 0 0 1.2rem 0;
  }

  .honor-item::before {
    display: none;
  }

  /* 公告卡片移动端优化 */
  .news-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .news-card {
    padding: 15px;
  }

  .news-date {
    text-align: left;
    margin-bottom: 10px;
  }

  .news-date .date-day {
    font-size: 1.5rem;
  }

  .news-content h4 {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  .news-content p {
    font-size: 0.9rem;
    line-clamp: 3;
    -webkit-line-clamp: 3;
  }

  .game-detail .row {
    flex-direction: column;
  }
  
  .join-card {
    margin-top: 30px;
  }
  
  .game-detail .col-md-4 {
    margin-bottom: 20px;
  }
  
  .event-card {
    flex-direction: column;
  }
  
  .event-date {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }
  
  .event-actions {
    flex-direction: row;
    margin-top: 15px;
  }
  
  .event-actions .btn {
    margin-right: 10px;
    margin-bottom: 0;
  }
}
</style>