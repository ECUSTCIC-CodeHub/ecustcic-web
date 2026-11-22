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

    <!-- 活动更新 -->
    <div class="activity-section">
      <div class="container">
        <div class="text-center mb-4">
          <div class="tlt h3">
            <ul class="texts">
              <li data-in-effect="fadeInLeft" data-out-effect="fadeOut">活动更新</li>
              <li data-in-effect="fadeInLeft" data-out-effect="fadeOut">ACTIVITIES</li>
            </ul>
          </div>
          <div class="text-muted">更新时间：{{ buildTime }}</div>
          <!-- 活动列表页上线后在此处加“查看全部”链接 -->
        </div>
        <div class="row justify-content-center">
          <template v-for="(item, index) in this.activities">
            <div class="col-md-4 mb-3" :key="index">
              <div class="newsItem">
                <a class="tdn" :href="`/activity/${item.id}`">
                  <img v-if="item.cover" class="newsImg" :src="item.cover" />
                  <div v-else class="newsImg newsImg-placeholder">
                    <canvas ref="placeholderCanvases" class="placeholder-canvas"></canvas>
                    <img class="plume" src="@/assets/img/plume.svg" alt="" />
                  </div>
                </a>
                <div class="newsText">
                  <a class="tdn" :href="`/activity/${item.id}`">{{item.title}}</a>
                  <br />
                </div>
                <div class="left">{{item.date}}</div>
                <div class="right">{{item.author}}</div>
              </div>
            </div>
          </template>
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

/* ---------- 活动区 ---------- */
.activity-section {
  padding: 2.5rem 0 4rem;
}

.newsItem {
  width: 100%;
  min-height: 250px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  background: var(--surface);
  border: 1px solid var(--line);
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.newsItem:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.newsImg {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

/* 无封面时的占位样式：淡蓝晴空风，轻松愉悦 */
.newsImg-placeholder {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #eaf4fe 0%, #dcedfd 55%, #cfe6fc 100%);
}

.placeholder-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.newsImg-placeholder .plume {
  position: relative;
  width: 74px;
  height: 74px;
  opacity: 0.95;
  filter: drop-shadow(0 3px 8px rgba(96, 165, 250, 0.5));
}

.newsText {
  font-size: 1em;
  padding: 0.6rem 0.9rem 1.8rem;
}

.newsText a {
  color: var(--ink);
  font-weight: 500;
}

.left,
.right {
  position: absolute;
  bottom: 0.4rem;
  color: var(--ink-muted);
  font-size: 0.85rem;
}

.left {
  left: 0.9rem;
}

.right {
  right: 0.9rem;
}
</style>

<script>
import $ from "jquery";
import { WOW } from "wowjs";
import { setTimeout } from "timers";
import Carousel from "@/components/Carousel.vue";
import { getActivities } from "@/api/edgeActivities";

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
      activities: []
    };
  },
  methods: {
    getActivities: function() {
      getActivities(6)
        .then(activities => {
          this.activities = activities;
          // 有数据后用最新活动日期替代构建时间
          if (activities.length > 0) {
            this.buildTime = activities[0].date;
          }
          this.$nextTick(() => this.drawPlaceholders());
        })
        .catch(error => {
          console.log("活动数据加载失败:", error);
        });
    },
    // 为无封面的活动卡片绘制静态球棍粒子连线（致敬关于页粒子背景）
    drawPlaceholders: function() {
      this.$nextTick(() => {
        const canvases = this.$refs.placeholderCanvases;
        if (!canvases || !Array.isArray(canvases)) return;
        canvases.forEach(canvas => {
          if (canvas.dataset.drawn) return;   // 避免重复绘制
          const w = canvas.offsetWidth || 300;
          const h = canvas.offsetHeight || 180;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // 布点
          const count = Math.floor((w * h) / 4200);
          const pts = [];
          for (let i = 0; i < count; i++) {
            pts.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: 1 + Math.random() * 1.6
            });
          }
          // 连线（距离阈值内）
          const maxDist = Math.min(w, h) * 0.35;
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.32)';
          ctx.lineWidth = 1;
          for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
              const dx = pts[i].x - pts[j].x;
              const dy = pts[i].y - pts[j].y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < maxDist) {
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                ctx.stroke();
              }
            }
          }
          // 节点
          ctx.fillStyle = 'rgba(59, 130, 246, 0.55)';
          for (const p of pts) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          canvas.dataset.drawn = '1';
        });
      });
    }
  },
  mounted() {
    this.getActivities();

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
