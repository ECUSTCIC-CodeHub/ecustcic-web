<template>
  <div class="tech-redirect">
    <p>正在跳转到技术文档...</p>
  </div>
</template>

<script>
export default {
  name: 'Tech',
  mounted() {
    window.location.href = '/tech/'
  }
}
</script>

<style scoped>
.tech-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  font-size: 18px;
  color: #666;
}
</style>
