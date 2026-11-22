<template>
  <div class="home">
    <Carousel :slides="this.slides"></Carousel>
    <div class="container home-intro">
      <div class="tlt h3">
        <ul class="texts">
          <li data-in-effect="fadeInLeft" data-out-effect="fadeOut">华东理工大学计算机信息交流协会</li>
          <li data-in-effect="fadeInLeft" data-out-effect="fadeOut">成立于1998年3月</li>
          <li data-in-effect="fadeInLeft" data-out-effect="fadeOut">ECUST-CIC</li>
        </ul>
      </div>
      <div class="text-muted lead">宗旨：服务华理，振兴IT！</div>
      <div class="text-muted">
        更多请看：
        <router-link class="link-arrow" to="/about">社团介绍 <i class="fas fa-arrow-right fa-xs"></i></router-link>
      </div>
    </div>

    <!-- 部门导航 -->
    <div class="dept-section">
      <div class="container">
        <div class="row">
          <div class="col-md-6 mb-3">
            <a class="tdn" href="/tech/">
              <div class="hover media wow fadeInLeft">
                <img src="@/assets/img/Home/tech.png" class="mr-3" alt="技术" width="100" height="100" />
                <div class="media-body">
                  <br />
                  <h5 class="mt-0 font-weight-bold">技术部</h5>这里有大佬有萌新，但他们都热爱计算机。
                </div>
              </div>
            </a>
          </div>
          <div class="col-md-6 mb-3">
            <router-link class="tdn" to="/service">
              <div class="hover media wow fadeInDown">
                <img src="@/assets/img/Home/serve.png" class="mr-3" alt="服务" width="100" height="100" />
                <div class="media-body">
                  <br />
                  <h5 class="mt-0 font-weight-bold">服务部</h5>这里有一群无私奉献、为他人服务的人。
                </div>
              </div>
            </router-link>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <router-link class="tdn" to="/publicity">
              <div class="hover media wow fadeInUp">
                <img src="@/assets/img/Home/media.png" class="mr-3" alt="组宣" width="100" height="100" />
                <div class="media-body">
                  <br />
                  <h5 class="mt-0 font-weight-bold">组宣部</h5>这里是社团运营以及宣传的大脑。
                </div>
              </div>
            </router-link>
          </div>
          <div class="col-md-6 mb-3">
            <router-link class="tdn" to="/e-sports">
              <div class="hover media wow fadeInRight">
                <img src="@/assets/img/Home/game.png" class="mr-3" alt="电竞" width="100" height="100" />
                <div class="media-body">
                  <br />
                  <h5 class="mt-0 font-weight-bold">电竞部</h5>这里是游戏爱好者的圣地。
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 活动更新 + 快讯（均不放封面，用紧凑列表呈现更多信息） -->
    <div class="activity-section">
      <div class="container">
        <div class="row">
          <!-- 快讯在左、占 7 列：快讯标题普遍更长，给更宽的行 -->
          <div class="col-lg-7 mb-4 mb-lg-0">
            <div class="feed-head">
              <h3 class="feed-title">快讯</h3>
              <router-link class="link-arrow" to="/news">
                查看全部 <i class="fas fa-arrow-right fa-xs"></i>
              </router-link>
            </div>
            <p class="feed-sub text-muted">社团近期通知与动态</p>

            <div v-if="news.length === 0 && aiDone" class="feed-empty">
              暂无快讯。
            </div>
            <div v-else-if="news.length > 0" class="feed-list">
              <component
                :is="isExternal(item.link) ? 'a' : 'router-link'"
                v-for="item in news"
                :key="item.id"
                v-bind="linkProps(item, 'news')"
                class="feed-row"
              >
                <span class="feed-date">{{ item.date }}</span>
                <span class="feed-main">
                  <span class="feed-name">
                    <span v-if="item.source === 'ai'" class="news-prefix">【大模型网关】</span>{{ item.title }}
                  </span>
                </span>
                <i
                  class="feed-icon"
                  :class="isExternal(item.link) ? 'fas fa-external-link-alt' : 'fas fa-angle-right'"
                ></i>
              </component>
            </div>
          </div>

          <!-- 活动在右、占 5 列 -->
          <div class="col-lg-5">
            <div class="feed-head">
              <h3 class="feed-title">活动更新</h3>
              <router-link class="link-arrow" to="/activities">
                查看全部 <i class="fas fa-arrow-right fa-xs"></i>
              </router-link>
            </div>
            <p class="feed-sub text-muted">更新时间：{{ buildTime }}</p>

            <div v-if="activities.length === 0" class="feed-empty">
              暂无活动，敬请期待。
            </div>
            <div v-else class="feed-list">
              <component
                :is="isExternal(item.link) ? 'a' : 'router-link'"
                v-for="item in activities"
                :key="item.id"
                v-bind="linkProps(item, 'activity')"
                class="feed-row"
              >
                <span class="feed-date">{{ item.date }}</span>
                <span class="feed-main">
                  <span class="feed-name">{{ item.title }}</span>
                  <span v-if="item.summary" class="feed-summary">{{ item.summary }}</span>
                </span>
                <i
                  class="feed-icon"
                  :class="isExternal(item.link) ? 'fas fa-external-link-alt' : 'fas fa-angle-right'"
                ></i>
              </component>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 校园通知：来源为校内站点聚合（每天 20:30 更新），浏览器直连 news.bestzyq.cn -->
    <div class="notice-section">
      <div class="container">
        <div class="feed-head">
          <h3 class="feed-title">校园通知</h3>
          <span class="feed-update">每日 20:30 更新</span>
        </div>
        <p class="feed-sub text-muted">来源：教务处通知 · 学校新闻网 · 学生处通知 · 研究生院通知</p>

        <div v-if="campusNotices.length === 0" class="feed-empty">
          暂无校园通知。
        </div>
        <div v-else class="feed-list">
          <a
            v-for="item in campusNotices"
            :key="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="feed-row"
          >
            <span class="feed-date">{{ item.date }}</span>
            <span class="feed-main">
              <span class="feed-name">{{ item.title }}</span>
              <span v-if="item.source" class="feed-summary">{{ item.source }}</span>
            </span>
            <i class="feed-icon fas fa-external-link-alt"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-intro {
  padding-top: 2.5rem;
  padding-bottom: 2rem;
}

.tdn {
  color: var(--ink);
  text-decoration: none;
}

/* ---------- 部门卡片 ---------- */
.dept-section {
  padding: 2.5rem 0 3rem;
  background: var(--surface-alt);
}

.media {
  padding: 15px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
}

.hover:hover {
  -webkit-transform: translateY(-6px);
  -ms-transform: translateY(-6px);
  transform: translateY(-6px);
  -webkit-box-shadow: 0 0 6px #999;
  box-shadow: 0 0 6px #999;
  -webkit-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}

/* ---------- 活动 / 快讯：无封面紧凑列表 ---------- */
.activity-section {
  padding: 2.5rem 0 4rem;
}

.feed-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.3rem;
}

.feed-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  position: relative;
  padding-bottom: 0.5rem;
}

.feed-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
}

.feed-sub {
  font-size: 0.82rem;
  margin-bottom: 0.9rem;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feed-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.7rem 0.95rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--ink);
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.feed-row:hover {
  color: var(--accent-dark);
  text-decoration: none;
  border-color: rgba(52, 152, 219, 0.5);
  transform: translateX(3px);
  box-shadow: var(--shadow-sm);
}

.feed-date {
  flex: none;
  width: 84px;
  font-size: 0.8rem;
  color: var(--ink-muted);
}

.feed-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  text-align: left;
}

/* 标题不省略：窄屏下自动换行（原来 nowrap + ellipsis 会把长标题整段吃掉） */
.feed-name {
  font-weight: 600;
  font-size: 0.95rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.feed-summary {
  font-size: 0.78rem;
  color: var(--ink-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feed-icon {
  flex: none;
  font-size: 0.8rem;
  color: #cbd5e1;
}

/* AI 站公告的来源前缀 */
.news-prefix {
  color: var(--accent-dark, #2980b9);
  font-weight: 700;
}

.feed-empty {
  padding: 1.2rem;
  text-align: center;
  color: var(--ink-muted);
  background: var(--surface);
  border: 1px dashed var(--line);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

/* ---------- 校园通知（首页最下方） ---------- */
.notice-section {
  padding: 0 0 4rem;
}

.feed-update {
  font-size: 0.78rem;
  color: var(--ink-muted);
  white-space: nowrap;
}

@media (max-width: 576px) {
  .feed-date {
    width: 68px;
    font-size: 0.75rem;
  }
}
</style>

<script>
import $ from "jquery";
import { WOW } from "wowjs";
import { setTimeout } from "timers";
import Carousel from "@/components/Carousel.vue";
import { getActivities } from "@/api/edgeActivities";
import { getAiNotices, mergeByDate } from "@/api/externalFeed";
import { getCampusNotices } from "@/api/campusNotice";

export default {
  name: "home",
  components: {
    Carousel
  },
  data() {
    return {
      buildTime: process.env.BUILD_TIME,
      slides: [
        {
          img: require("@/assets/img/Home/bg-th1.png"),
          title: "",
          subTitle: "CIC Tech, More Than You Think"
        },
        {
          img: require("@/assets/img/Home/bg-th2.png"),
          title: "",
          subTitle: "CIC Service, Waiting For Serving Everyone"
        },
        {
          img: require("@/assets/img/Home/bg-th3.png"),
          title: "",
          subTitle: "ECUST E-Sports, Go Beyond the Game"
        }
      ],
      activities: [],
      localNews: [],
      aiNews: [],
      campusNotices: [],
      // AI 站公告是否已返回（避免"暂无快讯"在公告到达前闪一下）
      aiDone: false
    };
  },
  computed: {
    // 本站快讯 + AI 站公告合并后按日期总体倒序，首页取前 6 条（与右侧活动对齐）
    news() {
      return mergeByDate(this.localNews.concat(this.aiNews), 6);
    }
  },
  methods: {
    // 活动与快讯都从同一个 Edge Function 取，kind 区分类型
    loadFeeds: function() {
      getActivities({ kind: 'activity', limit: 6 })
        .then(activities => {
          this.activities = activities;
          // 有数据后用最新活动日期替代构建时间
          if (activities.length > 0) {
            this.buildTime = activities[0].date;
          }
        })
        .catch(error => {
          console.log('活动数据加载失败:', error);
        });

      getActivities({ kind: 'news', limit: 6 })
        .then(news => {
          this.localNews = news;
        })
        .catch(error => {
          console.log('快讯数据加载失败:', error);
        });

      // AI 站公告：独立请求、超时静默降级，本站内容先渲染，公告到达后自动并入。
      // 取全量再由前端统一排序截断，避免依赖接口返回顺序
      getAiNotices().then(notices => {
        this.aiNews = notices;
        this.aiDone = true;
      });
    },
    // 校园通知：独立请求，失败时该区块降级为"暂无"，不影响其他内容
    loadCampusNotices: function() {
      getCampusNotices(6).then(notices => {
        this.campusNotices = notices;
      });
    },
    isExternal(link) {
      return /^https?:\/\//i.test(link || '');
    },
    // 外链条目直接跳外链，站内路径走 router-link，其余进详情页
    linkProps(item, kind) {
      if (this.isExternal(item.link)) {
        return { href: item.link, target: '_blank', rel: 'noopener' };
      }
      if (item.link) return { to: item.link };
      return { to: kind === 'news' ? '/news' : `/activity/${item.id}` };
    }
  },
  mounted() {
    this.loadFeeds();
    this.loadCampusNotices();

    // 循环文字特效
    $(".tlt").textillate({
      loop: true,
      delay: 50
    });

    // 滚动进入特效
    new WOW({
      animateClass: "animated",
      offset: 100,
      live: true,
      mobile: false
    }).init();
    setTimeout(function() {
      $(".wow").css("opacity", "1");
    }, 100);
  }
};
</script>
