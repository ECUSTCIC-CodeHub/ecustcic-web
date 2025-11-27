<template>
  <div 
    class="scroll-to-top"
    :class="{ 'show': isVisible }"
    @click="scrollToTop"
  >
    <i class="fa fa-arrow-up"></i>
  </div>
</template>

<script>
export default {
  name: 'ScrollToTop',
  data() {
    return {
      isVisible: false,
      scrollPosition: 0
    }
  },
  mounted() {
    // 监听滚动事件
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    // 移除滚动事件监听
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      // 当页面滚动超过300px时显示按钮
      this.isVisible = window.pageYOffset > 300
      this.scrollPosition = window.pageYOffset
    },
    scrollToTop() {
      // 使用jQuery实现平滑滚动效果
      if (window.$) {
        $('html, body').animate({ scrollTop: 0 }, 500)
      } else {
        // 降级方案：不使用动画
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }
}
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  color: black;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.scroll-to-top.show {
  opacity: 1;
  visibility: visible;
}

.scroll-to-top:hover {
  background-color: #f8f8f8;
  transform: translateY(-3px);
}

.scroll-to-top i {
  font-size: 18px;
}

@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 20px;
    right: 20px;
    width: 35px;
    height: 35px;
  }
  
  .scroll-to-top i {
    font-size: 16px;
  }
}
</style>