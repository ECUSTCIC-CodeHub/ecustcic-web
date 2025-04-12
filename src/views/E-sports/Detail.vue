<template>
  <div class="qq-groups-container">
    <!-- 顶部横幅 -->
    <div class="hero-banner">
      <img src="@/assets/img/Home/bg-th3.png" alt="交流群背景" class="hero-image">
      <div class="hero-overlay">
        <h1>交流群汇总</h1>
        <p>加入兴趣社群 · 结识同好伙伴 · 获取最新资讯</p>
      </div>
    </div>

    <div class="container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索群名称或描述..."
            class="form-control"
          >
          <i class="fas fa-search"></i>
        </div>
        <div class="filter-tags">
          <button 
            v-for="category in categories" 
            :key="category.id"
            @click="toggleCategory(category.id)"
            :class="{ active: selectedCategories.includes(category.id) }"
            class="btn btn-sm btn-outline-primary"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">正在加载群组信息...</p>
      </div>

      <!-- 群组列表 -->
      <div class="groups-section" v-else>
        <!-- 按分类分组 -->
        <div v-for="category in filteredCategories" :key="category.id" class="category-group">
          <h2 class="category-title">
            <i :class="category.icon"></i>
            {{ category.name }}
            <span class="badge bg-primary">{{ getGroupCount(category.id) }}</span>
          </h2>
          
          <div class="group-list">
            <div 
              v-for="group in getGroupsByCategory(category.id)" 
              :key="group.group_id"
              class="group-card"
            >
              <div class="group-avatar">
                <img :src="'https://p.qlogo.cn/gh/' + group.group_id + '/' + group.group_id + '/640'" :alt="group.group_name">
              </div>
              <div class="group-info">
                <h3>
                  {{ group.group_name }}
                  <span v-if="!group.api_success" class="badge bg-warning">API信息获取失败</span>
                </h3>
                <p class="group-id">{{ group.group_id }}</p>
                <p class="group-desc">{{ group.description }}</p>
                <div class="group-meta" v-if="group.api_success">
                  <span><i class="fas fa-users"></i> {{ group.member_count }}人/{{ group.max_member_count }}人</span>
                </div>
              </div>
              <div class="group-actions">
                <a 
                  v-if="group.url"
                  :href="group.url" 
                  target="_blank"
                  class="btn btn-primary btn-join"
                >
                  <i class="fab fa-qq"></i> 加入群聊
                </a>
                <button 
                  @click="copyGroupNumber(group.group_id)"
                  class="btn btn-outline-secondary btn-copy"
                >
                  <i class="far fa-copy"></i> 复制群号
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div v-if="filteredGroups.length === 0 && !loading" class="no-results">
          <i class="fas fa-search fa-3x"></i>
          <h3>未找到匹配的交流群</h3>
          <p>尝试调整搜索关键词或筛选条件</p>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-notification">
      已复制群号 {{ copiedGroupNumber }} 到剪贴板
    </div>
  </div>
</template>

<script>
import { baseGroups, categories } from '@/data/qqGroups';
export default {
  name: 'e-sports-detail',
  data() {
    return {
      searchQuery: '',
      selectedCategories: [],
      showCopySuccess: false,
      copiedGroupNumber: '',
      loading: true,
      // defaultAvatar: 'https://qzonestyle.gtimg.cn/qzone/qzact/act/external/tiqq/logo.png',
      categories: categories, // 使用导入的分类数据
      groups: [],
      baseGroups: baseGroups // 使用导入的基础群组数据
    }
  },
  computed: {
    filteredCategories() {
      return this.categories.filter(cat => 
        this.getGroupsByCategory(cat.id).length > 0
      )
    },
    filteredGroups() {
      return this.groups.filter(group => {
        const searchMatch = 
          group.group_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          group.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        const categoryMatch = 
          this.selectedCategories.length === 0 || 
          this.selectedCategories.includes(group.category)
        
        return searchMatch && categoryMatch
      })
    }
  },
  methods: {
    getGroupsByCategory(categoryId) {
      return this.filteredGroups.filter(group => group.category === categoryId)
    },
    getGroupCount(categoryId) {
      return this.getGroupsByCategory(categoryId).length
    },
    toggleCategory(categoryId) {
      const index = this.selectedCategories.indexOf(categoryId)
      if (index === -1) {
        this.selectedCategories.push(categoryId)
      } else {
        this.selectedCategories.splice(index, 1)
      }
    },
    copyGroupNumber(number) {
      navigator.clipboard.writeText(number)
      this.copiedGroupNumber = number
      this.showCopySuccess = true
      setTimeout(() => {
        this.showCopySuccess = false
      }, 3000)
    },
    async fetchGroupInfo(groupId) {
      try {
        const response = await fetch(`https://qqapi.ecustvr.top/api/get.info.group?group=${groupId}&token=p26JQ7j0woje0JnYLGti7Q`)
        const data = await response.json()
        if (data.code === 200) {
          return data.data
        }
        return null
      } catch (error) {
        console.error('获取群信息失败:', error)
        return null
      }
    },
    async fetchAllGroupsInfo() {
      this.loading = true
      const promises = this.baseGroups.map(async baseGroup => {
        const info = await this.fetchGroupInfo(baseGroup.group_id)
        // 即使API失败也返回基础信息
        return info ? {
          ...baseGroup,
          group_name: info.group_name,
          // avatar: info.avatar,
          member_count: info.member_count,
          max_member_count: info.max_member_count,
          api_success: true  // 标记API是否成功
        } : {
          ...baseGroup,
          group_name: `群组(${baseGroup.group_id})`,
          api_success: false  // 标记API失败
        }
      })
      
      this.groups = await Promise.all(promises)
      this.loading = false
    }
  },
  created() {
    this.fetchAllGroupsInfo()
  }
}
</script>

<style scoped>
/* 保持原有的样式不变 */
.qq-groups-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 50px;
}

.hero-banner {
  position: relative;
  height: 300px;
  overflow: hidden;
  margin-bottom: 30px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.hero-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 100%;
  padding: 0 15px;
}

.hero-overlay h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.hero-overlay p {
  font-size: 1.2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.search-filter {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  right: 15px;
  top: 12px;
  color: #7f8c8d;
}

.search-box input {
  padding-right: 40px;
  border-radius: 50px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-tags button {
  border-radius: 50px;
  padding: 5px 15px;
}

.filter-tags button.active {
  background-color: #3498db;
  color: white;
}

.category-title {
  font-size: 1.5rem;
  margin: 30px 0 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.category-title i {
  margin-right: 10px;
  color: #3498db;
}

.category-title .badge {
  margin-left: 10px;
  font-size: 0.8rem;
  padding: 5px 10px;
  color: #fff;
}

.group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.group-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.group-avatar {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  flex-shrink: 0;
}

.group-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.group-info {
  flex: 1;
}

.group-info h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #2c3e50;
}

.group-id {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0px;
}

.group-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 10px;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.group-meta {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.group-meta span {
  margin-right: 15px;
}

.group-meta i {
  margin-right: 5px;
  color: #3498db;
}

.group-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15px;
}

.btn-join {
  margin-bottom: 10px;
  padding: 5px 15px;
  font-size: 0.9rem;
  border-radius: 5px;
}

.btn-copy {
  padding: 5px 15px;
  font-size: 0.9rem;
  border-radius: 5px;
}

.no-results {
  text-align: center;
  padding: 50px 0;
  color: #7f8c8d;
}

.no-results i {
  color: #3498db;
  margin-bottom: 20px;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.copy-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2ecc71;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@media (max-width: 768px) {
  .hero-overlay h1 {
    font-size: 2rem;
  }
  
  .hero-overlay p {
    font-size: 1rem;
  }
  
  .group-list {
    grid-template-columns: 1fr;
  }
  
  .group-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .group-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .group-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 15px;
  }
  
  .btn-join, .btn-copy {
    margin-right: 10px;
    margin-bottom: 0;
  }
}
</style>