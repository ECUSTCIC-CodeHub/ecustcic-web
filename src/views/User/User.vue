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
  height: 100%;
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
  padding: 1rem;
  margin: 0 0 0 0;
  /* 相对定位抬高内容层级，避免被绝对定位的粒子背景层遮挡点击 */
  position: relative;
  z-index: 1;
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
