<template>
  <div id="app">
    <!-- 网页导航栏 -->
    <nav
      class="navbar navbar-expand-lg navbar-light bg-white navbar-transparent-light navbar-sticky"
    >
      <div class="container">
        <a class="navbar-brand" href="/">
          <img src="./assets/logo-cic.png" alt height="35" />
          <!-- <img src="./assets/logo-cn.png" alt class="logo-scroll" height="35" /> -->
          <!-- <img src="./assets/logo-cic.png" alt class="logo-trans" height="35" /> -->
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" exact>
                <i class="fa fa-home fa-fw"></i>
                首页
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/tech">
                <i class="fa fa-flag fa-fw" aria-hidden="true"></i>
                指南
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/service">
                <i class="fas fa-users fa-fw" aria-hidden="true"></i>
                服务
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/publicity">
                <i class="fa fa-share-alt fa-fw" aria-hidden="true"></i>
                组宣
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/e-sports">
                <i class="fa fa-gamepad fa-fw" aria-hidden="true"></i>
                电竞
              </router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="https://wiki.ecustvr.top/" target="_blank">
                <i class="fa fa-book fa-fw" aria-hidden="true"></i>
                Wiki
              </a>
            </li>
            <li class="nav-item" id="nav-about">
              <router-link class="nav-link" to="/about">
                <i class="fa fa-info-circle fa-fw" aria-hidden="true"></i>
                关于
              </router-link>
            </li>
          </ul>

          <div class="my-2 my-lg-0">
            <ul class="navbar-nav mr-auto">
              <!-- <template v-if="token">
                <li class="nav-item dropdown" id="dropmenu">
                  <a
                    role="button"
                    id="navbarDropdown"
                    class="nav-link dropdown-toggle"
                    href="javascript:void(0);"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    data-dropdown-hover
                  >
                    <img :src="head" />
                    {{ name }}
                  </a>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                    <a class="dropdown-item" href="/user/password">
                      <i class="fa fa-key fa-fw mr-2"></i>修改密码
                    </a>
                    <a class="dropdown-item" href="/user/info">
                      <i class="fa fa-info-circle fa-fw mr-2"></i>个人信息
                    </a>
                    <template v-if="admin">
                      <a class="dropdown-item" href="/admin" target="_blank">
                        <i class="fa fa-gear fa-fw mr-2"></i>后台管理
                      </a>
                    </template>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" @click="logout" href="javascript:void(0);">
                      <i class="fa fa-sign-out fa-fw mr-2" aria-hidden="true"></i>退出登录
                    </a>
                  </div>
                </li>
              </template> -->
              <!-- <template v-else>
                <li class="nav-item">
                  <router-link class="user-link" to="/user/login">
                    <i class="fa fa-sign-in fa-fw" aria-hidden="true"></i>登录
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="user-link" to="/user/register">
                    <i class="fa fa-edit fa-fw" aria-hidden="true"></i>注册
                  </router-link>
                </li>
              </template> -->
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <!-- router页面 -->
    <router-view />

    <!-- 页尾 -->
    <footer class="footer bg-light">
      <div class="container">
        <div class="text-muted text-center text-small" id="footercontext">
          <hr />
          <ul class="list-inline my-0">
            <li class="list-inline-item">
              <a href="//github.com/ecustcic" target="_blank">
                <i class="fab fa-github fa-fw"></i>
              </a>
            </li>
            <li class="list-inline-item" id="wechat">
              <a
                href="javascript:void(0);"
                data-toggle="popover"
                data-animation="true"
                data-container="#wechat"
                data-placement="top"
                data-trigger="manual"
                data-html="true"
                data-content="<img src='/img/cic_qrcode.jpg' width='100%'>"
              >
                <i class="fab fa-weixin fa-fw"></i>
              </a>
            </li>
            <li class="list-inline-item" id="qq">
              <a
                href="https://qm.qq.com/q/E35YnehMqY"
                data-toggle="popover"
                data-animation="true"
                data-container="#qq"
                data-placement="top"
                data-trigger="manual"
                data-html="true"
                data-content="<img src='/img/cic_qq_new.jpg' width='100%'>"
              >
                <i class="fab fa-qq fa-fw"></i>
              </a>
            </li>
          </ul>
          <p class="mb-1">CopyRight &copy; 1998-{{ new Date().getFullYear() }} ECUST-CIC. All Rights Reserved</p>
          <ul class="list-inline my-0">
            <!-- <li class="list-inline-item">
              <a href="javascript:void(0);" target="_blank">Privacy</a>
            </li>
            <li class="list-inline-item">
              <a href="javascript:void(0);" target="_blank">Terms</a>
            </li>
            <li class="list-inline-item">
              <a href="javascript:void(0);" target="_blank">Support</a>
            </li> -->
            <li class="list-inline-item">
              <a href="https://beian.miit.gov.cn/" target="_blank">
                浙ICP备2025169668号-1
              </a>
            </li>
            <!-- <li class="list-inline-item">
              <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=" id="policeLink">
                <img src="https://beian.mps.gov.cn/img/ghs.png">沪公网安备号
              </a>
            </li> -->
          </ul>
          <span id="ipv4"></span><span id="ipv6"></span>
        </div>
      </div>
    </footer>
    <back-to-top bottom="100px" right="50px">
      <button type="button" class="btn btn-light">
        <i class="fa fa-chevron-up"></i>
      </button>
    </back-to-top>
  </div>
</template>

<style>
html,
body,
.fullscreen {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
.footer {
  width: 100%;
}

.navbar .container,
.navbar .container-fluid {
  position: relative;
}

/* .navbar .navbar-brand {
  margin-left: -30px;
} */

/* .navbar .navbar-nav {
  margin-left: 135px;
} */

@media (max-width: 992px) {
  .navbar .navbar-nav {
    margin: 0px;
  }
}

.navbar .navbar-nav .nav-link {
  text-transform: capitalize;
  font-weight: 400;
  font-size: 1rem;
  font-family: "Open Sans", sans-serif;
  border-top: 2px solid transparent;
  cursor: pointer;
}

.navbar-light.navbar .navbar-nav .nav-link {
  color: rgba(70, 73, 92, 0.6);
}

.navbar-light.navbar .navbar-nav .nav-link:hover,
.navbar-light.navbar .navbar-nav .nav-link:focus,
.navbar-light.navbar .navbar-nav .nav-link:active,
.navbar-light.navbar .navbar-nav .nav-link.active {
  color: #1ecfca;
  border-top-color: #1ecfca;
}

.navbar .navbar-nav .dropdown-menu {
  min-width: 0;
  text-align: center;
  font-size: 0.8rem;
}

/* .navbar .navbar-nav .user-link {
  color: #1ecfca;
} */

@media (min-width: 992px) {
  .navbar.navbar-sticky.navbar-transparent-light.bg-white {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 999;
    background-color: transparent !important;
  }
  /* .navbar.navbar-sticky.navbar-transparent-light.bg-white .navbar-brand > img {
    position: absolute;
    top: 25px;
  } */

  /* logo */
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-brand
    > img.logo-scroll {
    opacity: 0;
  }

  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav
    .nav-link {
    color: rgba(0, 0, 0, 0.73);
  }
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav.navbar-text-white
    .nav-link {
    color: rgba(255, 255, 255, 0.83);
  }
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav
    .nav-link:hover,
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav
    .nav-link.active,
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav
    .nav-link:active,
  .navbar.navbar-sticky.navbar-transparent-light.bg-white
    .navbar-nav
    .nav-link:focus {
    color: #1ecfca;
  }
  .navbar-expand-lg.navbar {
    padding-top: 0;
    padding-bottom: 0;
    z-index: 999;
  }
  .navbar-expand-lg.navbar .navbar-nav .nav-item {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .navbar-expand-lg.navbar .navbar-nav .nav-item:last-child {
    padding-right: 0px;
  }
  .navbar-expand-lg.navbar .navbar-nav .nav-link {
    padding-top: 1.3rem;
    padding-bottom: 1.3rem;
    padding-left: 0;
    padding-right: 0;
  }
  .navbar-nav .nav-item .nav-link.btn {
    padding-top: 12px !important;
    padding-bottom: 12px !important;
    padding-left: 30px !important;
    padding-right: 30px !important;
    border: 0px !important;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    position: relative;
    top: 13px;
    margin-left: 1rem;
  }
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 999;
    animation: fadeInDown 0.4s;
    -webkit-box-shadow: 0 0 15px rgba(0, 0, 0, 0.06);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.06);
    background-color: rgba(255, 255, 255, 0.98) !important;
  }
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-brand
    > img.logo-scroll {
    opacity: 1;
  }
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-brand
    > img.logo-trans {
    opacity: 0;
  }
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-nav
    .nav-link {
    color: rgba(0, 0, 0, 0.73);
  }
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-nav
    .nav-link:hover,
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-nav
    .nav-link.active,
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-nav
    .nav-link:active,
  .navbar.navbar-transparent-light.bg-white.navbar-sticky.fixed-top
    .navbar-nav
    .nav-link:focus {
    color: #1ecfca;
  }

  #navbarDropdown {
    outline: none;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/**mulit level dropdown**/
.dropdown-submenu {
  position: relative;
  cursor: pointer;
}

.dropdown-submenu > .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -1px;
  margin-left: -1px;
  border-radius: 0px;
}

.dropdown-submenu:hover > .dropdown-menu {
  display: block;
}

.dropdown-submenu > a:after {
  display: block;
  float: right;
  font-family: "FontAwesome";
  content: "\f0da";
  /* margin-top: 4px; */
  margin-right: -8px;
}

.dropdown-submenu:hover > a:after {
  border-left-color: #ccc;
}

.dropdown-submenu.pull-left {
  float: none;
}

.dropdown-submenu.pull-left > .dropdown-menu {
  left: -100%;
  margin-left: 10px;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
}

.mega-title {
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  margin-bottom: 10px;
  color: #444;
}

.mega-inner-nav li {
  vertical-align: middle;
}
.mega-inner-nav li a {
  display: block;
}
.mega-inner-nav li a:hover {
  color: #4782d3;
  background-color: transparent;
}
.mega-inner-nav li a i {
  margin-right: 6px;
  position: relative;
  top: 1px;
  font-size: 13px;
  width: 16px;
  display: inline-block;
}

.dropdown .dropdown-menu .dropdown-item,
.mega-inner-nav > li > a {
  padding: 4px 20px;
}
.dropdown .dropdown-menu .dropdown-item:hover,
.mega-inner-nav > li > a:hover {
  background-color: transparent;
  color: #4782d3;
}
.dropdown .dropdown-menu .dropdown-item:focus,
.mega-inner-nav > li > a:focus {
  background-color: transparent;
  color: #4782d3;
}

@media (min-width: 992px) {
  .dropdown-menu.dropdown-mega-fw {
    position: absolute;
    width: 100%;
    padding: 0px 20px;
    padding-bottom: 0px;
  }
  .mega-menu-content {
    padding: 30px 0;
    padding-bottom: 20px;
  }
  .dropdown-menu,
  .dropdown-submenu .dropdown-menu {
    display: block;
    opacity: 0;
    visibility: hidden;
    z-index: 1;
    -moz-transform: translateY(8px);
    -o-transform: translateY(8px);
    -ms-transform: translateY(8px);
    -webkit-transform: translateY(8px);
    transform: translateY(8px);
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
  }
  .show > .dropdown-menu,
  .dropdown-submenu:hover > .dropdown-menu {
    opacity: 1;
    visibility: visible;
    z-index: 1000;
    -moz-transform: none;
    -o-transform: none;
    -ms-transform: none;
    -webkit-transform: none;
    transform: none;
  }
  .mega-menu-content .row .col-lg-3:first-child {
    border-left: 0;
  }
  .mega-menu-content .row .col-lg-3 {
    border-left: 1px solid rgba(255, 255, 255, 0.09);
    padding: 0px 30px;
  }
  .mega-menu-content .mega-title {
    color: #fff;
  }
}

.wow {
  opacity: 0;
}
</style>

<script>
import $ from "jquery";
import Identicon from "identicon.js";
import { Hash } from "crypto";
export default {
  data() {
    return {
      head: null
    };
  },
  methods: {
    showHead: function() {
      if (this.token) {
        let hash = Hash("md5");
        hash.update(this.name);
        var imgData = new Identicon(hash.digest("hex"), 30).toString();
        this.head = "data:image/png+xml;base64," + imgData;
      }
    },
    logout: function() {
      this.$cookies.remove("ECUST-CIC");
      this.$store.commit("logout");
      this.$router.go(0);
    }
  },
  computed: {
    name: function() {
      return this.$store.state.name;
    },
    admin: function() {
      return this.$store.state.admin;
    },
    token: function() {
      return this.$store.state.token;
    }
  },
  beforeMount: function() {
    if (this.$cookies.isKey("ECUST-CIC")) {
      const token = this.$cookies.get("ECUST-CIC");
      this.$store.commit("login", token);
    }
  },
  mounted: function() {
    $('[data-toggle="popover"]').popover();
    $('[data-toggle="popover"]')
      .on("shown.bs.popover", function() {
        $(this).popover("update");
      })
      .on("mouseenter", function() {
        var that = this;
        $(this).popover("show");
        $(".popover").on("mouseleave", function() {
          $(that).popover("hide");
        });
      })
      .on("mouseleave", function() {
        var that = this;
        setTimeout(function() {
          if (!$(".popover:hover").length) {
            $(that).popover("hide");
          }
        }, 500);
      });

    // navbar
    $(document).on("scroll", function() {
      if ($(document).scrollTop() > 120) {
        $(".navbar-sticky").addClass("fixed-top");
      } else {
        $(".navbar-sticky").removeClass("fixed-top");
      }
    });
    $("[data-dropdown-hover]").bootstrapDropdownHover();
    $("[data-stop-propagation]").on("click", function(e) {
      e.stopPropagation();
    });
  },
  watch: {
    token: function() {
      this.showHead();
      this.$nextTick(function() {
        $('[data-toggle="dropdown"]').bootstrapDropdownHover();
      });
    }
  }
};
</script>
