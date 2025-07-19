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

    <!-- 返回链接 -->
    <div class="text-center mt-5">
      <router-link to="/e-sports" class="view-all-events">
        <i class="fas fa-chevron-left"></i> 返回 CIC-电竞
      </router-link>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-notification">
      已复制群号 {{ copiedGroupNumber }} 到剪贴板
    </div>
  </div>
</template>

<script>
import { categories } from '@/data/qqGroups';
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
      appId: 'cli_a8f1d48265fc500e',
      appSecret: 'u2NfRSgPlrI4KUhba3389eyj3LSa4aGR',
      accessToken: null
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
    async getTenantAccessToken() {
      try {
        const response = await fetch('https://feishuapi.bestzyq.cn/open-apis/auth/v3/tenant_access_token/internal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            app_id: this.appId,
            app_secret: this.appSecret
          })
        })
        const data = await response.json()
        if (data.code === 0) {
          this.accessToken = data.tenant_access_token
          return data.tenant_access_token
        } else {
          console.error('获取飞书访问令牌失败:', data)
          return null
        }
      } catch (error) {
        console.error('获取飞书访问令牌出错:', error)
        return null
      }
    },
    
    async fetchGroupsFromFeishu() {
      this.loading = true
      let allGroups = []
      let pageToken = null
      let hasMore = true
      
      try {
        // 获取访问令牌
        const token = await this.getTenantAccessToken()
        if (!token) {
          this.loading = false
          return
        }
        
        // 循环获取所有页的数据
        while (hasMore) {
          // 构建URL，将page_token作为查询参数添加（而不是放在请求体中）
          let url = 'https://feishuapi.bestzyq.cn/open-apis/bitable/v1/apps/Y9HBbtQoxawALxs3XK8cOY9pn8g/tables/tblVq51wR2ZPVax4/records/search?page_size=100'
          if (pageToken) {
            url += `&page_token=${pageToken}`
          }
          
          // 获取飞书表格数据 - 使用新的API端点和POST方法
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // 空请求体，page_token已经在URL中
          })
          
          const data = await response.json()
          if (data.code === 0) {
            // 处理数据，只保留"是否可信"为true的记录
            const pageGroups = data.data.items
              .filter(item => item.fields['是否可信'] === true)
              .map(item => {
                // 将飞书数据映射到我们需要的格式
                const groupId = item.fields['QQ群号']
                // 避免使用可选链操作符，改用传统方式检查属性
                const url = (item.fields['加群链接'] && item.fields['加群链接'].link) || null
                
                // 处理描述字段，现在是一个对象数组
                let description = '暂无描述'
                if (item.fields['描述'] && Array.isArray(item.fields['描述']) && item.fields['描述'].length > 0) {
                  // 将所有文本片段连接起来
                  description = item.fields['描述']
                    .filter(desc => desc.type === 'text')
                    .map(desc => desc.text)
                    .join('')
                }
                
                return {
                  group_id: String(groupId), // 确保群号是字符串
                  group_name: `群组(${groupId})`, // 默认名称
                  description: description,
                  category: this.mapCategoryFromFeishu(item.fields['类别']),
                  url: url,
                  api_success: false, // 默认API未成功
                  member_count: 0,
                  max_member_count: 0
                }
              })
            
            // 将当前页的群组添加到总列表中
            allGroups = [...allGroups, ...pageGroups]
            
            // 检查是否有更多页
            hasMore = data.data.has_more
            pageToken = data.data.page_token
            
            // 如果没有更多数据或没有返回页码令牌，则停止循环
            if (!hasMore || !pageToken) {
              break
            }
          } else {
            console.error('获取飞书数据失败:', data)
            hasMore = false
          }
        }
        
        // 获取群组详细信息
        const promises = allGroups.map(async group => {
          try {
            const response = await fetch(`https://qqapi.ecustvr.top/api/get.info.group?group=${group.group_id}`)
            const data = await response.json()
            if (data.code === 200) {
              return {
                ...group,
                group_name: data.data.group_name,
                member_count: data.data.member_count,
                max_member_count: data.data.max_member_count,
                api_success: true
              }
            }
            return group
          } catch (error) {
            console.error(`获取群 ${group.group_id} 信息失败:`, error)
            return group
          }
        })
        
        this.groups = await Promise.all(promises)
      } catch (error) {
        console.error('获取群组信息出错:', error)
      } finally {
        this.loading = false
      }
    },
    
    mapCategoryFromFeishu(feishuCategory) {
      // 将飞书中的类别映射到我们的类别ID
      const categoryMap = {
        '学习交流': 'study',
        '休闲娱乐': 'game',
        '技术讨论': 'tech',
        '友好社团': 'social',
        '区域性交流群': 'area'
      }
      
      return categoryMap[feishuCategory] || 'social' // 默认为social类别
    }
  },
  created() {
    this.fetchGroupsFromFeishu()
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

.view-all-events {
  color: #3498db;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
}

.view-all-events:hover {
  color: #2980b9;
  transform: translateX(-5px);
}

.view-all-events i {
  margin-right: 5px;
  transition: all 0.3s;
}

.view-all-events:hover i {
  transform: translateX(-5px);
}

</style>