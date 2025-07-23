<template>
  <full-page ref="fullpage" :options="options" id="fullpage">
    <div class="section bg-primary-dark" id="hero">
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
        style="height: 100%"
      ></vue-particles>
      <div class="content-table absolute">
        <div class="content-middle">
          <div class="container">
            <div class="row align-items-center">
              <div class="text-center mr-auto ml-auto">
                <img src="@/assets/logo-cn.png" class="py-4 wow fadeIn" alt width="90%" />
                <div>
                  <button
                    class="btn btn-outline-primary"
                    @click="$refs.fullpage.api.moveSectionDown()"
                  >
                    <i class="far fa-hand-point-right fa-fw"></i>
                    Learn About Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section bg-primary-grey" id="history">
      <div class="content-table absolute">
        <div class="content-middle">
          <div class="container">
            <div class="row">
              <div class="col-md-7 text-left">
                <div class="content-title wow fadeInDown">
                  <h3>History</h3>
                  <div class="line-left"></div>
                </div>
                <div class="content-text wow fadeInLeft">华东理工大学计算机信息交流协会成立于1998年3月，由计算机协会与网络协会合并而来。</div>
                <button
                  class="btn content-btn btn-md wow fadeIn"
                  @click="$refs.fullpage.api.moveSectionDown()"
                >Next</button>
                <img
                  class="content-photo wow fadeInUp"
                  src="../assets/img/About/history.png"
                  width="62%"
                  alt
                />
              </div>
              <div class="col-md-5">
                <div class="accordion wow fadeInRight" id="history-card" role="tablist">
                  <div class="card">
                    <div class="card-header" role="tab" id="headerOne">
                      <div class="card-title">
                        <a
                          class="card-title-text font-weight-bold text-decoration-none"
                          data-toggle="collapse"
                          href="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                        >
                          <i class="fa fa-star fa-fw"></i>
                          全国学生最具影响力科技创造社团
                        </a>
                      </div>
                    </div>
                    <div
                      class="card-collapse collapse show"
                      id="collapseOne"
                      role="tabpanel"
                      data-parent="#history-card"
                      aria-labelledby="headerOne"
                    >
                      <div class="card-body">
                        华东理工大学CIC计算机信息交流协会曾获
                        “燃青春 聚能量”全国学生社团影响力展示活动科技类50强
                      </div>
                    </div>
                  </div>
                  <div class="card">
                    <div class="card-header" role="tab" id="headerTwo">
                      <div class="card-title">
                        <a
                          class="card-title-text font-weight-bold text-decoration-none collapsed"
                          data-toggle="collapse"
                          href="#collapseTwo"
                          aria-expanded="false"
                          aria-controls="collapseTwo"
                        >
                          <i class="fa fa-star fa-fw"></i>
                          华东理工大学五星级社团、十佳社团
                        </a>
                      </div>
                    </div>
                    <div
                      class="card-collapse collapse"
                      id="collapseTwo"
                      role="tabpanel"
                      data-parent="#history-card"
                      aria-labelledby="headerTwo"
                    >
                      <div class="card-body">自1998年成立以来，多次获得五星级社团、十佳社团荣誉</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section" id="service">
      <div class="content-table absolute">
        <div class="content-middle">
          <div class="mt-5 wow fadeInDown">
            <h3 class="font-weight-bold">Services We Do</h3>
            <div class="line-center"></div>
          </div>
          <div class="row m-0 p-0 wow fadeInUp">
            <div class="col-md-6 p-0">
              <div class="overflow-hidden bg-primary-green">
                <div class="row">
                  <div class="col-sm-6 p-0">
                    <div class="content-table content-card">
                      <div class="content-middle">
                        <h3 class="content-card-title">技术部</h3>
                        <p class="content-card-text">技术讲座、项目开发、技术比赛</p>
                        <router-link class="btn btn-sm content-card-btn" to="/tech">More</router-link>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 p-0">
                    <div class="content-table content-arrow-left content-arrow-green overlay">
                      <div class="overlay-wrapper">
                        <div class="overlay-content">
                          <router-link to="/tech">
                            <i class="fa fa-link fa-fw"></i>
                          </router-link>
                          <a class="image-popup" :href="tech">
                            <i class="fa fa-search"></i>
                          </a>
                        </div>
                      </div>
                      <div
                        class="content-background-img"
                        data-height="height"
                        :style="{'background-image': 'url('+tech+')'}"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 p-0">
              <div class="overflow-hidden bg-primary-brown">
                <div class="row">
                  <div class="col-sm-6 p-0">
                    <div class="overflow-hidden content-table content-card">
                      <div class="content-middle">
                        <h3 class="content-card-title">服务部</h3>
                        <p class="content-card-text">电脑软硬件问题处理、疑难解答</p>
                        <router-link to="/service" class="btn btn-sm content-card-btn">More</router-link>
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6 p-0">
                    <div class="content-table content-arrow-left content-arrow-brown overlay">
                      <div class="overlay-wrapper">
                        <div class="overlay-content">
                          <router-link to="/service">
                            <i class="fa fa-link fa-fw"></i>
                          </router-link>
                          <a class="image-popup" :href="service">
                            <i class="fa fa-search"></i>
                          </a>
                        </div>
                      </div>
                      <div
                        class="content-background-img"
                        :style="{'background-image': 'url('+service+')'}"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 p-0">
              <div class="overflow-hidden bg-primary-red">
                <div class="row">
                  <div class="col-sm-6 p-0">
                    <div class="content-table content-arrow-right content-arrow-red overlay">
                      <div class="overlay-wrapper">
                        <div class="overlay-content">
                          <a href="javascript:void;">
                            <i class="fa fa-link fa-fw"></i>
                          </a>
                          <a class="image-popup" :href="publicity">
                            <i class="fa fa-search"></i>
                          </a>
                        </div>
                      </div>
                      <div
                        class="content-background-img"
                        :style="{'background-image': 'url('+publicity+')'}"
                      ></div>
                    </div>
                  </div>
                  <div class="col-sm-6 p-0">
                    <div class="overflow-hidden content-table content-card">
                      <div class="content-middle">
                        <h3 class="content-card-title">组宣部</h3>
                        <p class="content-card-text">微信公众号、QQ等平台的运营</p>
                        <a href="javascript:void;" class="btn btn-sm content-card-btn">More</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 p-0">
              <div class="overflow-hidden bg-primary-blue">
                <div class="row">
                  <div class="col-sm-6 p-0">
                    <div class="content-table content-arrow-right content-arrow-blue overlay">
                      <div class="overlay-wrapper">
                        <div class="overlay-content">
                          <router-link to="/e-sports">
                            <i class="fa fa-link fa-fw"></i>
                          </router-link>
                          <a class="image-popup" :href="eSports">
                            <i class="fa fa-search"></i>
                          </a>
                        </div>
                      </div>
                      <div
                        class="content-background-img"
                        :style="{'background-image': 'url('+eSports+')'}"
                      ></div>
                    </div>
                  </div>
                  <div class="col-sm-6 p-0">
                    <div class="overflow-hidden content-table content-card">
                      <div class="content-middle">
                        <h3 class="content-card-title">电竞部</h3>
                        <p class="content-card-text">校内外电竞比赛、游戏交流</p>
                        <router-link to="/e-sports" class="btn btn-sm content-card-btn">More</router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </full-page>
</template>

<style scoped>
#about {
  width: 100%;
  height: 100%;
}
.align-items-center {
  align-items: center !important;
  -webkit-box-align: center !important;
}
.bg-primary-dark {
  background: rgb(219, 219, 219) !important;
  border-color: rgb(181, 181, 181);
}
.bg-primary-grey {
  background: #f7f7f7 !important;
}
.bg-primary-brown {
  background-color: #7a6a61 !important;
}
.bg-primary-red {
  background-color: #e7505a !important;
}
.bg-primary-green {
  background-color: #32c5d2 !important;
}
.bg-primary-blue {
  background-color: #57bfe1 !important;
}
/* .text-alpha-white {
  color: rgba(255, 255, 255, 0.73);
} */
.section {
  position: relative;
}
.section .absolute {
  position: absolute;
}
.section .content-table {
  display: table;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
.content-table .content-middle {
  display: table-cell;
  vertical-align: middle;
  width: 100%;
}
.content-table .content-bottom {
  display: table-cell;
  vertical-align: bottom;
  width: 100%;
}
.content-title {
  margin-top: 25px;
}
.content-text {
  position: relative;
  background-color: rgba(181, 181, 181, 0.8);
  width: 40%;
  padding: 25px;
  z-index: 1;
}
.content-btn {
  color: #ffffff;
  background: #32c5d2;
  border-color: #32c5d2;

  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  border-radius: 0;
}
.content-photo {
  position: absolute;
  top: 0;
  right: 65px;
}
.content-card {
  padding: 10%;
  overflow: hidden;
}
.content-card-title {
  margin-top: 0;
  font-size: 20px;
  color: #fff;
  line-height: 34px;
  font-weight: 600 !important;
}
.content-card-text {
  font-size: 17px;
  color: #fff;
}
.content-card-btn {
  margin: 10px 0;
  color: #fff;
  background: none;
  border-color: #fff;
  border-width: 1px;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  border-radius: 0;
}
.content-arrow-right,
.content-arrow-left {
  position: relative;
}
.content-arrow-right:after,
.content-arrow-left:after {
  top: calc(50% - 13px);
  border: solid transparent;
  content: " ";
  position: absolute;
  pointer-events: none;
  border-width: 13px;
  z-index: 99;
}
.content-arrow-right:after {
  right: 0;
  border-right-color: #ffffff;
}
.content-arrow-left:after {
  left: 0;
  border-left-color: #ffffff;
}
.content-arrow-green.content-arrow-right:after {
  border-right-color: #32c5d2;
}
.content-arrow-green.content-arrow-left:after {
  border-left-color: #32c5d2;
}
.content-arrow-red.content-arrow-right:after {
  border-right-color: #e7505a;
}
.content-arrow-red.content-arrow-left:after {
  border-left-color: #e7505a;
}
.content-arrow-brown.content-arrow-right:after {
  border-right-color: #7a6a61;
}
.content-arrow-brown.content-arrow-left:after {
  border-left-color: #7a6a61;
}
.content-arrow-blue.content-arrow-right:after {
  border-right-color: #57bfe1;
}
.content-arrow-blue.content-arrow-left:after {
  border-left-color: #57bfe1;
}
.content-background-img {
  height: 100%;
  position: relative;
  z-index: 1;
  background-repeat: no-repeat;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-position: center;
}
@media (max-width: 1199px) {
  .content-text {
    position: static;
    width: 100%;
    z-index: auto;
  }
  .content-photo {
    position: static;
    margin: 20px 0;
  }
}
@media (max-width: 767px) {
  /* 767px */
  .content-arrow-left:after,
  .content-arrow-right:after {
    left: calc(50% - 13px);
  }
  .content-arrow-left:after {
    bottom: 0;
    border-bottom-color: #ffffff;
    right: auto;
    top: auto;
    border-right-color: transparent;
  }
  .content-arrow-right:after {
    top: 0;
    border-top-color: #ffffff;
    border-left-color: transparent;
  }
  .content-arrow-green.content-arrow-left:after {
    border-right-color: transparent;
    border-bottom-color: #32c5d2;
  }
  .content-arrow-green.content-arrow-right:after {
    border-left-color: transparent;
    border-top-color: #32c5d2;
  }
  .content-arrow-red-2.content-arrow-left:after {
    border-right-color: transparent;
    border-bottom-color: #e7505a;
  }
  .content-arrow-red-2.content-arrow-right:after {
    border-left-color: transparent;
    border-top-color: #e7505a;
  }
  .content-arrow-brown-2.content-arrow-left:after {
    border-right-color: transparent;
    border-bottom-color: #7a6a61;
  }
  .content-arrow-brown-2.content-arrow-right:after {
    border-left-color: transparent;
    border-top-color: #7a6a61;
  }
  .content-arrow-blue-3.content-arrow-left:after {
    border-right-color: transparent;
    border-bottom-color: #57bfe1;
  }
  .content-arrow-blue-3.content-arrow-right:after {
    border-left-color: transparent;
    border-top-color: #57bfe1;
  }
}

.btn:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 0%;
  height: 100%;
  z-index: -1;
  transition: all 0.3s;
  -webkit-transition: all 0.3s;
}
.btn:hover,
.btn:focus {
  box-shadow: none;
  outline: 0 !important;
}
.btn:hover:before,
.btn:focus:before {
  transition: all 0.3s;
  -webkit-transition: all 0.3s;
  z-index: -1;
}
.btn-white-outline {
  border: 2px solid #fff;
  background-color: transparent;
  color: #fff;
}
.btn-white-outline:hover,
.btn-white-outline:focus,
.btn-white-outline:active {
  color: #333;
  border-color: #fff;
  transform: translateY(-2px);
  -webkit-transform: translateY(-2px);
}
.btn-white-outline:hover:before,
.btn-white-outline:focus:before,
.btn-white-outline:active:before {
  width: 100%;
  background-color: #fff;
}
.btn-outline-primary {
  border: 2px solid #24e6df;
  background-color: transparent;
  color: #24e6df;
}
.btn-outline-primary:hover,
.btn-outline-primary:focus,
.btn-outline-primary:active {
  color: #fff;
  border-color: #7fafec;
  background-color: transparent;
  transform: translateY(-2px);
  -webkit-transform: translateY(-2px);
}
.btn-outline-primary:hover:before,
.btn-outline-primary:focus:before,
.btn-outline-primary:active:before {
  width: 100%;
  background-color: #7fafec;
}

.line-left {
  width: 60px;
  height: 3px;
  background-color: #32c5d2;
  margin: 0 0 30px 0;
}
.line-center {
  width: 60px;
  height: 3px;
  background-color: #32c5d2;
  margin: 0 auto 30px auto;
}

.card {
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  border: 0;
  margin-bottom: 10px;
}
.card:last-child {
  margin-bottom: 0;
}
.card > .card-header {
  padding: 0;
  color: #ffffff;
}
.card > .card-header > .card-title {
  padding: 0;
  margin: 0;
}
.card > .card-header > .card-title > a {
  transition: all 0.2s;
  color: #fff;
  background-color: #32c5d2;
  display: block;
  padding: 30px 20px 25px 20px;
  border-radius: 0;
  box-shadow: none;
}
.card > .card-header > .card-title > a > i {
  margin-right: 5px;
  font-size: 17px;
}
.card > .card-header > .card-title > a.collapsed {
  background-color: #fff;
  color: #3f444a;
}

.card > .card-header > .card-title > a.collapsed:hover,
.card > .card-header > .card-title > a.collapsed:focus {
  color: #fff;
  background-color: #32c5d2;
  transition: all 0.2s;
}
.card > .card-collapse > .card-body {
  border-top: none;
  padding: 0px 30px 35px 30px;
  color: #ffffff;
  background-color: #32c5d2;
}

.overlay {
  overflow: hidden;
  position: relative;
}
.overlay .overlay-object {
  position: relative;
  z-index: 1;
}
.overlay .overlay-wrapper {
  opacity: 0;
  filter: alpha(opacity=0);
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.4);
}
.overlay .overlay-wrapper:after {
  content: "";
  display: table;
  clear: both;
}
.overlay .overlay-wrapper:before {
  display: inline-block;
  content: "";
  vertical-align: middle;
  height: 100%;
}
.overlay .overlay-wrapper .overlay-content {
  text-align: center;
  display: inline-block;
  vertical-align: middle;
  padding: 0;
  height: auto;
  width: 95%;
}
.overlay .overlay-wrapper .overlay-content i {
  display: inline-block;
  width: 44px;
  height: 44px;
  border-radius: 40px;
  text-align: center;
  padding: 14px 6px 8px 6px;
  color: #fff;
  font-size: 16px;
  background: #000000;
  opacity: 0.7;
  filter: alpha(opacity=70);
  margin: 0 5px;
}
.overlay .overlay-wrapper .overlay-content i:hover {
  opacity: 1;
  filter: alpha(opacity=100);
}
.overlay .overlay-wrapper.overlay-padding {
  left: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
}
.overlay:hover {
  cursor: pointer;
}
.overlay:hover .overlay-wrapper {
  top: 0;
  opacity: 1;
  filter: alpha(opacity=100);
}
.overlay:hover .overlay-wrapper.overlay-padding {
  top: 10px;
}
.overlay .overlay-border {
  border: 1px solid rgba(255, 255, 255, 0.2);
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  position: absolute;
  z-index: 1;
}
</style>

<script>
import $ from "jquery";
import { WOW } from "wowjs";

import history from "../assets/img/About/history.png";
import tech from "../assets/img/About/tech.jpg";
import service from "../assets/img/About/service.jpg";
import eSports from "../assets/img/About/e-sports.jpg";
import publicity from "../assets/img/About/publicity.jpg";

export default {
  name: "About",
  data() {
    return {
      options: {
        licenseKey: null,
        scrollBar: true,
        fitToSection: false,
        loopBottom: true,
        responsiveWidth: 768
      },
      history: history,
      tech: tech,
      service: service,
      eSports: eSports,
      publicity: publicity
    };
  },
  mounted() {
    $(".footer").css("display", "none");

    $(".image-popup").magnificPopup({
      type: "image"
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
  },
  destroyed() {
    $(".footer").attr("style", "");
    $(".footer").removeAttr("style");
  }
};
</script>
