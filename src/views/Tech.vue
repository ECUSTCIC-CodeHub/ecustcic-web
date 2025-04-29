<template>
  <div class="tech-doc-container">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-btn" @click="toggleMenu">
      <i class="fa" :class="menuOpen ? 'fa-times' : 'fa-bars'"></i>
    </div>
    
    <div class="row">
      <!-- 左侧导航栏 -->
      <div class="col-md-3 sidebar" :class="{ 'menu-open': menuOpen }">
        <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
          <template v-for="(item, index) in menuItems">
            <!-- 没有子菜单的项 -->
            <a v-if="!item.children" 
               class="nav-link menu-item" 
               :key="'item-' + index"
               :class="{ active: currentPath === item.path }"
               @click="loadMarkdown(item.path)">
              <i class="fa" :class="item.icon"></i>
              {{ item.title }}
            </a>
            <!-- 有子菜单的项 -->
            <div v-else :key="'group-' + index" class="menu-group">
              <a class="nav-link menu-item menu-group-title" 
                 :class="{ 'menu-group-open': openGroups.includes(index) }"
                 @click="toggleGroup(index)">
                <i class="fa" :class="item.icon"></i>
                {{ item.title }}
                <i class="fa fa-chevron-down menu-arrow"></i>
              </a>
              <div class="menu-group-items" v-show="openGroups.includes(index)">
                <a v-for="(child, childIndex) in item.children"
                   :key="'child-' + index + '-' + childIndex"
                   class="nav-link menu-item menu-group-item"
                   :class="{ active: currentPath === child.path }"
                   @click="loadMarkdown(child.path)">
                  <i class="fa" :class="child.icon"></i>
                  {{ child.title }}
                </a>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="col-md-9 content">
        <mavon-editor
          v-model="content"
          :subfield="false"
          :defaultOpen="'preview'"
          :toolbarsFlag="false"
          :boxShadow="false"
          previewBackground="#ffffff"
          style="min-height: calc(100vh - 100px)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import axios from 'axios'
import { menuItems } from '@/data/menu'

export default {
  name: 'Tech',
  components: {
    mavonEditor
  },
  data() {
    return {
      content: '',
      currentPath: '',
      menuOpen: false,
      menuItems,
      openGroups: [] // 存储展开的菜单组索引
    }
  },
  mounted() {
    // 默认加载首页
    this.loadMarkdown(this.menuItems[0].path)
  },
  methods: {
    async loadMarkdown(path) {
      try {
        const response = await axios.get(path)
        this.content = response.data
        this.currentPath = path
        // 移动端点击菜单项后自动关闭菜单
        if (window.innerWidth <= 768) {
          this.menuOpen = false
        }
      } catch (error) {
        console.error('加载 Markdown 文件失败:', error)
        this.content = '# 加载失败\n\n文件不存在或无法访问。'
      }
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
    toggleGroup(index) {
      const groupIndex = this.openGroups.indexOf(index)
      if (groupIndex === -1) {
        this.openGroups.push(index)
      } else {
        this.openGroups.splice(groupIndex, 1)
      }
    }
  }
}
</script>

<style scoped>
.tech-doc-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
  margin-top: 60px;
  position: relative;
}

.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  z-index: 100;
  width: 25%;
  transition: transform 0.3s ease;
}

.content {
  margin-left: 25%;
  padding: 20px;
}

/* 统一菜单项样式 */
.menu-item {
  color: #495057;
  margin-bottom: 5px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.menu-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.menu-item:hover {
  background-color: #e9ecef;
}

.menu-item.active {
  background-color: #007bff;
  color: white;
}

/* 菜单组样式 */
.menu-group {
  margin-bottom: 5px;
}

.menu-group-title {
  display: flex;
  align-items: center;
}

.menu-group-title .menu-arrow {
  margin-left: auto;
  transition: transform 0.3s ease;
  font-size: 12px;
}

.menu-group-open .menu-arrow {
  transform: rotate(180deg);
}

.menu-group-items {
  padding-left: 20px;
}

.menu-group-item {
  padding-left: 24px;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  
  .sidebar {
    width: 80%;
    transform: translateX(-100%);
  }
  
  .sidebar.menu-open {
    transform: translateX(0);
  }
  
  .content {
    margin-left: 0;
    width: 100%;
  }
  
  .menu-item {
    padding: 12px 16px;
    font-size: 16px;
  }
}
</style>
