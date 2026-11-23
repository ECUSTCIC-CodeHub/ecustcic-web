import Vue from "vue";
import Router from "vue-router";

// 主页
import Home from "@/views/Home.vue";

// 活动
import Activity from "@/views/Activity.vue";
// 活动回顾 / 快讯列表
import Activities from "@/views/Activities.vue";
import News from "@/views/News.vue";

// 技术 - 已迁移至 VuePress，无需路由

// 电竞
import E_sports from '@/views/E-sports/E-sports.vue'
import E_sports_Home from '@/views/E-sports/Home.vue'
import E_sports_detail from '@/views/E-sports/Detail.vue'

// 服务
import Service from "@/views/Service/Service.vue";
import ServiceTools from "@/views/Service/Tools.vue";
import ServiceAiDetect from "@/views/Service/AiDetect.vue";
import AiPlayground from "@/views/Service/AiPlayground.vue";
import ServiceSupport from "@/views/Service/Support.vue";
import Repair from "@/views/Service/Repair.vue";

// 组织宣传
import Publicity from "@/views/Publicity/Publicity.vue";
import PublicityHome from "@/views/Publicity/Home.vue";
import Certificate from "@/views/Publicity/Certificate.vue";

// 后台管理
import AdminLayout from "@/views/Admin/AdminLayout.vue";
import ActivityList from "@/views/Admin/ActivityList.vue";
import ActivityEditor from "@/views/Admin/ActivityEditor.vue";
import StorageList from "@/views/Admin/StorageList.vue";

// 其他
import Others from "@/views/Others/Others.vue";
// 签到
import Sign from "@/views/Others/Sign/Sign.vue";
import Scan from "@/views/Others/Sign/Scan.vue";
// OCR
import OCR from "@/views/Others/ocr/Ocr.vue";

// 用户相关
import User from "@/views/User/User.vue";
// 登录
import Login from "@/views/User/Login.vue";
// 注册
import Register from "@/views/User/Register.vue";
// 修改密码
import Password from "@/views/User/Password.vue";
// 用户信息
import Info from "@/views/User/Info.vue";

// test
// import Loading from '@/views/test.vue'

// 404 Not Found
import NotFound from "@/views/NotFound.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  // base: process.env.BASE_URL,
  base: "/",
  linkActiveClass: "active",
  linkExactActiveClass: "exact-active",
  scrollBehavior() {
    // 始终滚动到顶部
    return { x: 0, y: 0 }
  },
  routes: [
    // 主页
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        title: "华理计算机信息交流协会"
      }
    },
    // 活动
    {
      path: "/activity/:id",
      name: "activity",
      component: Activity,
      meta: {
        title: "CIC-活动"
      }
    },
    {
      path: "/activities",
      name: "activities",
      component: Activities,
      meta: {
        title: "CIC-活动回顾"
      }
    },
    {
      path: "/news",
      name: "news",
      component: News,
      meta: {
        title: "CIC-快讯"
      }
    },
    // 组宣
    {
      path: "/publicity",
      component: Publicity,
      children: [
        {
          path: "",
          name: "publicity",
          component: PublicityHome,
          meta: {
            title: "CIC-组宣"
          }
        },
        {
          path: "certificate",
          name: "certificate",
          component: Certificate,
          meta: {
            title: "CIC-荣誉证书领取"
          }
        }
      ]
    },
    // 电竞
    {
      path: "/e-sports",
      component: E_sports,
      children: [
        {
          path: "detail",
          name: "e-sports-detail",
          component: E_sports_detail,
          meta: {
            title: "CIC-交流群"
          }
        },
        {
          path: "",
          name: "e-sports",
          component: E_sports_Home,
          meta: {
            title: "CIC-电竞"
          }
        }
      ]
    },
    // 电竞历史遗留问题
    {
      path: '/e-sports-detail',
      redirect: '/e-sports/detail'
    },
    // 服务
    {
      path: "/service",
      component: Service,
      children: [
        {
          path: "repair",
          name: "repair",
          component: Repair,
          meta: {
            title: "CIC-维修"
            // requireAuth: true
          }
        },
        {
          path: "support",
          name: "service-support",
          component: ServiceSupport,
          meta: {
            title: "CIC-服务部介绍"
          }
        },
        {
          // 登录态由页面内 /api/auth/me 校验（会话是 HttpOnly Cookie，
          // 不能用 requireAuth 的 ECUST-CIC 判断）
          path: "ai-detect",
          name: "service-ai-detect",
          component: ServiceAiDetect,
          meta: {
            title: "CIC-AI 检测助手"
          }
        },
        {
          // 免登录：配置保存在浏览器 localStorage，由前端直连用户自己的 API
          path: "ai-playground",
          name: "service-ai-playground",
          component: AiPlayground,
          meta: {
            title: "CIC-AI 操练场"
          }
        },
        {
          path: "",
          name: "service",
          component: ServiceTools,
          meta: {
            title: "CIC-工具箱"
          }
        }
      ]
    },
    // 其他
    {
      path: "/others",
      name: "others",
      component: Others,
      children: [
        {
          path: "sign",
          name: "sign",
          component: Sign,
          meta: {
            title: "签到",
            requireAuth: true
          }
        },
        {
          path: "scan",
          name: "scan",
          component: Scan,
          meta: {
            title: "签到",
            requireAuth: true
          }
        },
        {
          path: "ocr",
          name: "ocr",
          component: OCR,
          meta: {
            title: "OCR",
            requireAuth: true
          }
        }
      ]
    },
    // 关于
    {
      path: "/about",
      name: "about",
      meta: {
        title: "CIC-关于"
      },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    // 后台管理：/admin/activity（列表） → /admin/activity/new · /admin/activity/:id/edit（编辑器）
    {
      path: "/admin",
      component: AdminLayout,
      children: [
        {
          path: "",
          redirect: "/admin/activity"
        },
        {
          path: "activity",
          name: "admin-activity-list",
          component: ActivityList,
          props: { kind: "activity" },
          meta: {
            title: "CIC-活动管理"
          }
        },
        {
          path: "activity/new",
          name: "admin-activity-new",
          component: ActivityEditor,
          props: { kind: "activity" },
          meta: {
            title: "CIC-新建活动"
          }
        },
        {
          path: "activity/:id/edit",
          name: "admin-activity-edit",
          component: ActivityEditor,
          props: route => ({ kind: "activity", id: route.params.id }),
          meta: {
            title: "CIC-编辑活动"
          }
        },
        {
          path: "news",
          name: "admin-news-list",
          component: ActivityList,
          props: { kind: "news" },
          meta: {
            title: "CIC-快讯管理"
          }
        },
        {
          path: "news/new",
          name: "admin-news-new",
          component: ActivityEditor,
          props: { kind: "news" },
          meta: {
            title: "CIC-新建快讯"
          }
        },
        {
          path: "news/:id/edit",
          name: "admin-news-edit",
          component: ActivityEditor,
          props: route => ({ kind: "news", id: route.params.id }),
          meta: {
            title: "CIC-编辑快讯"
          }
        },
        {
          path: "storage",
          name: "admin-storage",
          component: StorageList,
          meta: {
            title: "CIC-图片存储"
          }
        }
      ]
    },
    // 用户相关
    {
      path: "/user",
      name: "user",
      component: User,
      children: [
        {
          path: "login",
          name: "login",
          component: Login,
          meta: {
            title: "登录"
          }
        },
        {
          path: "register",
          name: "register",
          component: Register,
          meta: {
            title: "注册"
          }
        },
        {
          path: "password",
          name: "password",
          component: Password,
          meta: {
            title: "修改密码",
            requireAuth: true
          }
        },
        {
          path: "info",
          name: "info",
          component: Info,
          meta: {
            title: "个人信息"
            // OAuth 会话在组件内处理（未登录时页面内引导登录）
          }
        }
      ]
    },
    // test
    // {
    //   path: '/test',
    //   name: 'test',
    //   component: Loading
    // },
    // 404 not found
    {
      path: "*",
      name: "NotFound",
      component: NotFound,
      meta: {
        title: "404 Not Found"
      }
    }
  ]
});

// router登录控制
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.matched.some(record => record.meta.requireAuth)) {
    // 判断当前的token是否存在
    if (router.app.$cookies.isKey("ECUST-CIC")) {
      // 判断是否是管理员
      if (to.matched.some(record => record.meta.requireAdmin)) {
        const token = router.app.$cookies.get("ECUST-CIC");
        const admin = JSON.parse(window.atob(token.split(".")[1])).admin;
        if (admin === false) {
          next({
            name: "login",
            query: {
              redirect: to.fullPath
            }
          });
        }
      }
      next();
    } else {
      next({
        name: "login",
        query: {
          redirect: to.fullPath
        }
      });
    }
  } else {
    next();
  }
});

export default router;