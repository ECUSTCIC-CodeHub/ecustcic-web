<template>
  <div class="particles-wrapper">
    <vue-particles
      class="particles"
      color="#8000ff"
      :particleOpacity="0.7"
      :particlesNumber="80"
      shapeType="polygon"
      :particleSize="4"
      linesColor="#8000ff"
      :linesWidth="1"
      :lineLinked="true"
      :lineOpacity="0.4"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    ></vue-particles>
    <div id="user">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.particles-wrapper {
  position: relative;
  -ms-flex-align: center;
  -webkit-box-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  /* 拉伸到至少视口高度，避免页面内容超过 .particles(绝对定位100%高)后
     下方露出无背景的空白 */
  min-height: calc(100vh - 120px);
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
}
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#user {
  width: 100%;
  /* 顶部与导航拉开距离，避免标题紧贴菜单 */
  padding: 3.5rem 1rem 1rem;
  margin: 0 0 0 0;
  /* 相对定位抬高内容层级，避免被绝对定位的粒子背景层遮挡点击 */
  position: relative;
  z-index: 1;
  /* 关键：让鼠标事件落在内容空白区域时穿透到粒子层触发特效 */
  pointer-events: none;
}
/* 内容中的可交互元素恢复鼠标事件 */
#user a,
#user button,
#user input,
#user textarea,
#user select,
#user label,
#user .form-control,
#user .btn {
  pointer-events: auto;
}
</style>

<script>
import $ from "jquery";
export default {
  name: "User",
  methods: {
    windowResize: function() {
      this.$nextTick(function() {
        $(".footer").attr("style", "");
        $(".footer").removeAttr("style");
        if (
          $("#user").outerHeight() +
            $(".navbar").outerHeight() +
            $(".footer").outerHeight() <
          $(window).innerHeight()
        ) {
          $(".footer").css("position", "fixed");
          $(".footer").css("bottom", "0");
        }
      });
    }
  },
  mounted: function() {
    this.windowResize();
    window.onresize = this.windowResize;
  },
  destroyed: function() {
    $(".footer").attr("style", "");
    $(".footer").removeAttr("style");
  }
};
</script>
