<template>
  <div class="publicity-container">
    <!-- 顶部区域：hero banner -->
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
        <span class="cic-hero-tag">CIC · PUBLICITY</span>
        <h1>组宣部</h1>
        <p>社团运营以及宣传的大脑</p>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- 左侧内容区域 -->
        <div class="col-md-8">
            <!-- 快讯区域 -->
            <section class="news-section">
                <div class="section-head">
                    <h2 class="section-title">快讯</h2>
                    <router-link class="more-link" to="/news">查看全部 <i class="fas fa-angle-right"></i></router-link>
                </div>
                <div class="news-container">
                <div v-if="newsList.length === 0 && aiDone" class="feed-empty">暂无快讯</div>
                <div v-else-if="newsList.length > 0" class="news-links">
                    <div class="news-item" v-for="news in newsList" :key="news.id">
                    <a
                        :href="news.link"
                        class="news-link"
                        :target="isExternal(news.link) ? '_blank' : null"
                        :rel="isExternal(news.link) ? 'noopener' : null"
                    >
                        <span class="news-date">{{ news.date }}</span>
                        <span class="news-title">
                            <span v-if="news.source === 'ai'" class="news-prefix">【大模型网关】</span>{{ news.title }}
                        </span>
                    </a>
                    </div>
                </div>
                </div>
            </section>

            <!-- 活动回顾 -->
            <section class="activities-section">
                <div class="section-head">
                    <h2 class="section-title">活动回顾</h2>
                    <router-link class="more-link" to="/activities">查看全部 <i class="fas fa-angle-right"></i></router-link>
                </div>
                <div v-if="activityList.length === 0" class="feed-empty">暂无活动记录</div>
                <div v-else class="activities-container">
                    <component
                        :is="isExternal(item.link) ? 'a' : 'router-link'"
                        v-for="item in activityList"
                        :key="item.id"
                        v-bind="linkProps(item)"
                        class="activity-card"
                    >
                        <img v-if="item.cover" :src="item.cover" :alt="item.title" class="activity-image">
                        <div v-else class="activity-image activity-image-empty">
                            <span>{{ (item.title || '活').slice(0, 1) }}</span>
                        </div>
                        <div class="activity-overlay">
                            <h4>{{ item.title }}</h4>
                            <p>{{ item.date }}</p>
                        </div>
                    </component>
                </div>
            </section>
        </div>
        
        <!-- 右侧边栏 -->
        <div class="col-md-4">
          <!-- 传播矩阵 -->
          <section class="sidebar-section">
            <div class="qr-card">
              <img src="/img/cic_qqcode_new.png" alt="QQ群二维码" class="qr-image">
              <h4>QQ交流群</h4>
              <p>扫码加入，与我们交流互动</p>
            </div>
            <div class="qr-card">
              <img src="/img/cic_qrcode.jpg" alt="微信公众号二维码" class="qr-image">
              <h4>微信公众号</h4>
              <p>扫码关注，获取最新资讯</p>
            </div>
          </section>
        </div>
      </div>

      <!-- 加入我们 -->
      <section class="join-section">
        <h2 class="section-title">加入我们</h2>
        <div class="join-container">
          <p class="join-text">欢迎加入QQ群，与我们一起交流、学习、成长！</p>
          <a href="https://qm.qq.com/q/E35YnehMqY" class="btn btn-primary btn-join" target="_blank">
            <i class="fab fa-qq fa-fw"></i> 加入QQ群
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { newsData, activities } from '@/data/publicityData';
import { getActivities } from '@/api/edgeActivities';
import { getAiNotices, mergeByDate } from '@/api/externalFeed';

export default {
  name: "publicity-home",
  data() {
    return {
      // 动态数据优先；接口不可用时回退到 publicityData.js 的静态条目
      localNews: [],
      aiNews: [],
      aiDone: false,
      activityList: []
    };
  },
  computed: {
    // 本站快讯 + AI 站公告合并后总体倒序，组宣页取前 5 条
    newsList() {
      return mergeByDate(this.localNews.concat(this.aiNews), 5);
    }
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      try {
        const acts = await getActivities({ kind: 'activity', limit: 9 });
        this.activityList = acts.length ? acts : this.fallbackActivities();
      } catch (e) {
        this.activityList = this.fallbackActivities();
      }

      try {
        const news = await getActivities({ kind: 'news', limit: 5 });
        this.localNews = news.length ? news : this.fallbackNews();
      } catch (e) {
        this.localNews = this.fallbackNews();
      }

      // AI 站公告：独立请求、失败静默降级；取全量后由前端统一排序截断
      getAiNotices().then(notices => {
        this.aiNews = notices;
        this.aiDone = true;
      });
    },
    fallbackNews() {
      return newsData.map((item, index) => ({
        id: 'fallback-news-' + index,
        title: item.title,
        date: item.date,
        link: item.link
      }));
    },
    fallbackActivities() {
      return activities.map((item, index) => ({
        id: 'fallback-act-' + index,
        title: item.title,
        date: item.date,
        cover: item.image,
        link: item.link
      }));
    },
    isExternal(link) {
      return /^https?:\/\//i.test(link || '');
    },
    linkProps(item) {
      if (!item.link) return { to: `/activity/${item.id}` };
      if (this.isExternal(item.link)) {
        return { href: item.link, target: '_blank', rel: 'noopener' };
      }
      return { to: item.link };
    }
  }
};
</script>

<style scoped>
.publicity-container {
  background-color: #f8f9fa;
  color: #333;
}

/* 顶部区域（使用全站统一 cic-hero 样式） */

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

/* 居中排版的 section 标题（如"加入我们"），装饰线跟随居中 */
.join-section .section-title::after {
  left: 50%;
  transform: translateX(-50%);
}

/* 快讯区域 - 文字链接形式 */
.news-section {
  padding: 30px 0;
}

.news-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  margin-bottom: 30px;
}

.news-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-item {
  border-bottom: 1px dashed #ddd;
  padding-bottom: 10px;
}

.news-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.news-link {
  display: flex;
  justify-content: space-between;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
}

.news-link:hover {
  color: var(--accent-dark);
  transform: translateX(5px);
}

.news-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  min-width: 100px;
}

.news-title {
  flex-grow: 1;
  font-weight: 500;
}

/* AI 站公告的来源前缀 */
.news-prefix {
  color: var(--accent-dark, #2980b9);
  font-weight: 700;
}

/* 右侧边栏 */
.sidebar-section {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.qr-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.qr-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.qr-image {
  width: 100%;
  max-width: 180px;
  height: auto;
  object-fit: cover;
  margin-bottom: 15px;
  border-radius: 8px;
}

.qr-card h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.qr-card p {
  color: #666;
  font-size: 0.9rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* section 头部：标题 + 查看全部 */
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.more-link {
  font-size: 0.85rem;
  color: var(--accent-dark, #2980b9);
  text-decoration: none;
  white-space: nowrap;
}

.more-link:hover {
  color: var(--accent, #3498db);
  text-decoration: none;
}

.feed-empty {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 1.4rem;
  text-align: center;
  color: var(--ink-muted, #6b7280);
  font-size: 0.9rem;
}

/* 活动回顾 */
.activities-section {
  padding: 30px 0;
}

.activities-wrapper {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  margin-bottom: 30px;
}

.activities-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.activity-card {
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.1);
}

/* 无封面的活动卡片：渐变底 + 标题首字 */
.activity-image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eaf4fe 0%, #dbeafe 55%, #cfe6fc 100%);
}

.activity-image-empty span {
  font-size: 2.6rem;
  font-weight: 700;
  color: #5b9bd5;
  opacity: 0.75;
}

.activity-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px;
  color: white;
}

.activity-overlay h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.activity-overlay p {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 加入我们 */
.join-section {
  padding: 50px 0;
  text-align: center;
}

.join-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.join-text {
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.btn-join {
  background: linear-gradient(135deg, var(--accent) 0%, #21618c 100%);
  border: none;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.btn-join:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.35);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .news-list, .activities-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .matrix-container {
    flex-direction: column;
    align-items: center;
  }
  
  .qr-card {
    width: 100%;
  }
}
</style>