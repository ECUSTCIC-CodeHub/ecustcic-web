<template>
  <div id="carousel">
    <div
      id="carouselCaptions"
      class="carousel slide"
      data-ride="carousel"
      data-interval="4500"
      data-pause="false"
    >
      <!-- 底部导航 -->
      <ol class="carousel-indicators">
        <template v-for="(item, index) in this.slideObjects">
          <li
            :class="{active: index == 0}"
            data-target="#carouselCaptions"
            :data-slide-to="index"
            :key="index"
          ></li>
        </template>
      </ol>
      <!-- 滚动图片 -->
      <div class="carousel-inner">
        <template v-for="(item, index) in this.slideObjects">
          <div class="carousel-item" :class="{active: index == 0}" :key="index">
            <img :src="item.img" class="d-block w-100" :alt="item.title" />
            <div class="carousel-caption d-none d-md-block">
              <h3>{{ item.title }}</h3>
              <p>{{ item.subTitle }}</p>
            </div>
          </div>
        </template>
      </div>
      <!-- 两侧切换箭头 -->
      <a class="carousel-control-prev" href="#carouselCaptions" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#carouselCaptions" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
/* 统一轮播高度，避免不同比例图片把页面撑高 */
.carousel-item img {
  width: 100%;
  height: 520px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .carousel-item img {
    height: 300px;
  }
}

/* caption 加深色渐变底，保证文字可读 */
.carousel-caption {
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2.5rem 1rem 1.4rem;
  background: linear-gradient(
    to top,
    rgba(10, 25, 35, 0.72) 0%,
    rgba(10, 25, 35, 0.35) 60%,
    transparent 100%
  );
  border-radius: 0;
}

.carousel-caption h3,
.carousel-caption p {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

@media (max-width: 768px) {
  .carousel-caption {
    padding: 1.6rem 0.75rem 1rem;
  }
  .carousel-caption h3 {
    font-size: 1.1rem;
  }
  .carousel-caption p {
    font-size: 0.9rem;
  }
}
</style>

<script>
import $ from "jquery";
export default {
  name: "Carousel",
  props: {
    slides: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  computed: {
    slideObjects: function() {
      var newSlides = [];
      for (let slide of this.slides) {
        const type = $.type(slide);
        if (type == "string") {
          var tempSlide = {
            img: slide,
            title: null,
            subTitle: null
          };
          newSlides.push(tempSlide);
        } else if (type == "object") {
          newSlides.push(slide);
        }
      }
      return newSlides;
    }
  }
};
</script>
