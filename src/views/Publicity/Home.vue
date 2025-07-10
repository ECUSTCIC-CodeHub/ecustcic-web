<template>
  <div class="publicity-container">
    <!-- 顶部区域：背景图和logo -->
    <div class="top-banner">
      <img src="@/assets/img/About/publicity.png" alt="组宣部背景" class="banner-image">
      <div class="banner-overlay">
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
            <h2 class="section-title">快讯</h2>
            <div class="news-links">
              <div class="news-item" v-for="(news, index) in newsData" :key="index">
                <a href="#" class="news-link">
                  <span class="news-date">{{ news.date }}</span>
                  <span class="news-title">{{ news.title }}</span>
                </a>
              </div>
            </div>
          </section>

          <!-- 活动回顾 -->
          <section class="activities-section">
            <h2 class="section-title">活动回顾</h2>
            <div class="activities-container">
              <div class="activity-card" v-for="(activity, index) in activities" :key="index">
                <img :src="activity.image" :alt="activity.title" class="activity-image">
                <div class="activity-overlay">
                  <h4>{{activity.title}}</h4>
                  <p>{{activity.date}}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <!-- 右侧边栏 -->
        <div class="col-md-4">
          <!-- 传播矩阵 -->
          <section class="sidebar-section">
            <h2 class="section-title">传播矩阵</h2>
            <div class="qr-card">
              <img src="/img/cic_qqcode.png" alt="QQ群二维码" class="qr-image">
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
          <p class="join-text">欢迎加入组宣部QQ群，与我们一起交流、学习、成长！</p>
          <a href="#" class="btn btn-primary btn-join">
            <i class="fab fa-qq fa-fw"></i> 加入QQ群
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "publicity-home",
  data() {
    return {
      newsData: [
        {
          title: "组宣部招新公告",
          content: "组宣部现正招募新成员，欢迎对宣传、设计、文案感兴趣的同学加入我们！",
          date: "2023-09-01"
        },
        {
          title: "社团宣传片制作中",
          content: "组宣部正在筹备新一期的社团宣传片，敬请期待！",
          date: "2023-08-15"
        },
        {
          title: "海报设计大赛",
          content: "组宣部将举办海报设计大赛，欢迎各位同学踊跃参与！",
          date: "2023-07-20"
        }
      ],
      activities: [
        {
          title: "迎新晚会",
          date: "2023-09-20",
          image: "https://via.placeholder.com/400x300?text=迎新晚会"
        },
        {
          title: "社团文化节",
          date: "2023-06-15",
          image: "https://via.placeholder.com/400x300?text=社团文化节"
        },
        {
          title: "宣传技能培训",
          date: "2023-04-10",
          image: "https://via.placeholder.com/400x300?text=宣传技能培训"
        }
      ]
    }
  },
  methods: {
    getDay(dateStr) {
      return new Date(dateStr).getDate()
    },
    getMonth(dateStr) {
      return new Date(dateStr).toLocaleString('zh-CN', { month: 'long' })
    }
  }
}
</script>

<style scoped>
.publicity-container {
  background-color: #f8f9fa;
  color: #333;
}

/* 顶部区域 */
.top-banner {
  position: relative;
  height: 400px;
  overflow: hidden;
  margin-bottom: 30px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.banner-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 100%;
  padding: 0 15px;
}

.banner-overlay h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.banner-overlay p {
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

/* 快讯区域 - 文字链接形式 */
.news-section {
  padding: 30px 0;
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

.news-link {
  display: flex;
  justify-content: space-between;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
}

.news-link:hover {
  color: #3498db;
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

/* 活动回顾 */
.activities-section {
  padding: 50px 0;
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
  background: linear-gradient(to right, #3498db, #9b59b6);
  border: none;
  padding: 12px 30px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.btn-join:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-overlay h1 {
    font-size: 2.5rem;
  }
  
  .banner-overlay p {
    font-size: 1.2rem;
  }
  
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
    max-width: 300px;
  }
}
</style>