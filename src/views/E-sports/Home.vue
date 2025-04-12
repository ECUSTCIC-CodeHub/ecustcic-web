<template>
  <div class="esports-container">
    <!-- 电竞部英雄背景图 -->
    <div class="hero-banner">
      <img src="@/assets/img/Home/bg-th3.png" alt="电竞部背景" class="hero-image">
      <div class="hero-overlay">
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
                <span class="achievement-number">100+</span>
                <span class="achievement-text">场活动</span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card join-card">
              <div class="card-body">
                <h5 class="card-title">加入我们</h5>
                <p class="card-text">无论你是休闲玩家还是竞技高手，电竞部都欢迎你的加入！</p>
                <div class="d-flex flex-column" style="gap: 12px">
                  <a
                    href="https://open.weixin.qq.com/qr/code?username=gh_5814cf630585"
                    target="_blank"
                    class="btn btn-primary btn-join"
                    data-toggle="popover"
                    data-animation="true"
                    data-container="#wechat"
                    data-placement="top"
                    data-trigger="manual"
                    data-html="true"
                    data-content="<img src='https://open.weixin.qq.com/qr/code?username=gh_5814cf630585' width='100%'>"
                  >
                    <i class="fab fa-weixin fa-fw"></i> 微信公众号
                  </a>
                  <a
                    href="https://qm.qq.com/q/meIj5H3Ov0"
                    target="_blank"
                    class="btn btn-primary btn-join"
                    data-toggle="popover"
                    data-animation="true"
                    data-container="#qq"
                    data-placement="top"
                    data-trigger="manual"
                    data-html="true"
                    data-content="<img src='/img/E-sports/qq.jpg' width='100%'>"
                  >
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
              <a class="nav-link" :class="{active: index === 0}" 
                 :id="`game-${game.id}-tab`" data-toggle="tab" 
                 :href="`#game-${game.id}`" role="tab">
                <img :src="game.logo" :alt="game.name" class="game-logo">
                {{game.name}}
              </a>
            </li>
          </ul>
          <div class="tab-content" id="gameTabsContent">
            <div class="tab-pane fade" :class="{show: index === 0, active: index === 0}" 
                 v-for="(game, index) in games" :key="game.id" 
                 :id="`game-${game.id}`" role="tabpanel">
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
                    <!-- <div class="game-info">
                      <span class="info-item"><i class="fas fa-users"></i> {{game.playerCount}} 名玩家</span>
                      <span class="info-item"><i class="fas fa-trophy"></i> {{game.tournaments}} 场活动</span>
                      <span class="info-item"><i class="fas fa-calendar-alt"></i> 每周 {{game.activityDays}}</span>
                    </div> -->
                    <div class="btn-container">
                      <a 
                        :href="game.qqGroup" 
                        target="_blank"
                        class="btn btn-outline-primary btn-join-game"
                      >
                        加入{{game.name}}群
                      </a>
                      <a 
                        v-if="game.url"
                        :href="game.url" 
                        target="_blank"
                        class="btn btn-outline-primary btn-join-game"
                      >
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
      <router-link to="/e-sports/detail" class="view-all-events">查看全部交流群 <i class="fas fa-chevron-right"></i></router-link>

      <!-- 最新赛事 -->
      <section class="events-section">
        <h2 class="section-title">最新活动/赛事</h2>
        <div class="event-list">
          <div class="event-card" v-for="event in events" :key="event.id">
            <div class="event-date">
              <span class="date-day">{{event.day}}</span>
              <span class="date-month">{{event.month}}</span>
            </div>
            <div class="event-details">
              <h4>{{event.title}}</h4>
              <p class="event-game"><i class="fas fa-gamepad"></i> {{event.game}}</p>
              <p class="event-time"><i class="far fa-clock"></i> {{event.time}}</p>
              <p class="event-location"><i class="fas fa-map-marker-alt"></i> {{event.location}}</p>
            </div>
            <div class="event-actions">
              <button class="btn btn-sm btn-outline-secondary">详情</button>
              <button class="btn btn-sm btn-primary">报名</button>
            </div>
          </div>
        </div>
        <a href="#" class="view-all-events">查看全部活动/赛事 <i class="fas fa-chevron-right"></i></a>
      </section>
    </div>
  </div>
</template>

<script>
import { esportsGames } from '@/data/esportsGames';
import { esportsEvents } from '@/data/esportsEvents';

export default {
  name: "e-sports",
  data() {
    return {
      games: esportsGames,
      events: esportsEvents
    }
  }
}
</script>

<style scoped>
.esports-container {
  background-color: #f8f9fa;
  color: #333;
}

/* 英雄背景区域 */
.hero-banner {
  position: relative;
  height: 400px;
  overflow: hidden;
  margin-bottom: 30px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.hero-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 100%;
  padding: 0 15px;
}

.hero-overlay h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.hero-overlay p {
  font-size: 1.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* 各部分标题样式 */
.section-title {
  font-weight: 700;
  color: #2c3e50;
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
  background: linear-gradient(to right, #3498db, #9b59b6);
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
}

.achievement-item {
  text-align: center;
}

.achievement-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #3498db;
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
  background: linear-gradient(to right, #3498db, #9b59b6);
  border: none;
  padding: 10px 25px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-join:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
  color: #7f8c8d;
  font-weight: 600;
  border: none !important;
  padding: 12px 20px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.active {
  color: #3498db;
  background-color: transparent;
  border-bottom: 3px solid #3498db !important;
}

.game-logo {
  height: 20px;
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
  color: #3498db;
}

.btn-join-game {
  padding: 8px 20px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-join-game:hover {
  background-color: #3498db;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 赛事部分 */
.events-section {
  padding: 50px 0;
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
  color: #3498db;
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
  color: #3498db;
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
  color: #3498db;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.view-all-events:hover {
  color: #2980b9;
  transform: translateX(5px);
}

.view-all-events i {
  margin-left: 5px;
  transition: all 0.3s;
}

.view-all-events:hover i {
  transform: translateX(5px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-overlay h1 {
    font-size: 2.5rem;
  }
  
  .hero-overlay p {
    font-size: 1.2rem;
  }
  
  .game-detail .row {
    flex-direction: column;
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
