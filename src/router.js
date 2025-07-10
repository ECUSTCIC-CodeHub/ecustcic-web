import Vue from "vue";
import Router from "vue-router";

// 主页
import Home from "@/views/Home.vue";

// 活动
import Activity from "@/views/Activity.vue";

// 技术
import Tech from '@/views/Tech.vue'

// 电竞
import E_sports from '@/views/E-sports/E-sports.vue'
import E_sports_Home from '@/views/E-sports/Home.vue'
import E_sports_detail from '@/views/E-sports/Detail.vue'

// 服务
import Service from "@/views/Service/Service.vue";
import ServiceHome from "@/views/Service/Home.vue";
import Repair from "@/views/Service/Repair.vue";

// 组织宣传
import Publicity from "@/views/Publicity/Publicity.vue";
import PublicityHome from "@/views/Publicity/Home.vue";

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
    // 技术
    {
      path: '/tech',
      name: 'tech',
      meta: {
        title: 'CIC-技术'
      },
      component: Tech
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
            title: "CIC-电竞交流群"
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
          path: "",
          name: "service",
          component: ServiceHome,
          meta: {
            title: "CIC-服务"
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
            title: "个人信息",
            requireAuth: true
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