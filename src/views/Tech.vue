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
    // 检查是否是从404.html重定向过来的
    console.log('Tech组件已挂载，检查URL参数')
    
    // 检查URL参数中是否有文档标题
    const urlParams = new URLSearchParams(window.location.search)
    const docTitle = urlParams.get('doc') // URLSearchParams.get()已经会自动解码
    
    if (docTitle) {
      console.log('从URL获取的文档标题:', docTitle)
      
      // 尝试根据标题找到对应的路径
      const docPath = this.getDocPath(docTitle)
      
      if (docPath) {
        // 如果找到了路径，加载该文档
        console.log('找到对应路径:', docPath)
        this.loadMarkdown(docPath, true)
      } else {
        // 如果标题不匹配任何菜单项，可能是直接使用的路径
        // 尝试直接使用作为路径
        console.log('未找到对应路径，尝试直接使用:', docTitle)
        this.loadMarkdown(docTitle, true)
      }
    } else {
      // 否则加载默认文档
      console.log('加载默认文档')
      this.loadMarkdown(this.menuItems[0].path, true)
    }
    
    // 添加事件监听器来处理浏览器的前进/后退按钮操作
    window.addEventListener('popstate', () => {
      const newUrlParams = new URLSearchParams(window.location.search)
      const newDocTitle = newUrlParams.get('doc') // URLSearchParams.get()已经会自动解码
      
      if (newDocTitle) {
        const newDocPath = this.getDocPath(newDocTitle)
        if (newDocPath) {
          this.loadMarkdown(newDocPath, true)
        } else {
          // 尝试直接使用作为路径
          this.loadMarkdown(newDocTitle, true)
        }
      } else {
        this.loadMarkdown(this.menuItems[0].path, true)
      }
    })
  },
  methods: {
    // 根据路径获取文档标题（包含父菜单信息）
    getDocTitle(path) {
      // 先检查顶层菜单项
      for (const item of this.menuItems) {
        if (item.path === path) {
          return item.title
        }
        
        // 检查子菜单项
        if (item.children) {
          for (const child of item.children) {
            if (child.path === path) {
              // 对于子菜单项，返回"父菜单/子菜单"格式
              return `${item.title}/${child.title}`
            }
          }
        }
      }
      
      // 如果找不到匹配的标题，返回路径的最后部分
      const pathParts = path.split('/')
      return pathParts[pathParts.length - 1].replace('.md', '')
    },
    
    // 根据标题获取文档路径
    getDocPath(titlePath) {
      // 检查是否包含斜杠，表示是"父菜单/子菜单"格式
      if (titlePath.includes('/')) {
        const [parentTitle, childTitle] = titlePath.split('/')
        
        // 查找匹配的父菜单
        for (const item of this.menuItems) {
          if (item.title === parentTitle && item.children) {
            // 在子菜单中查找匹配的项
            for (const child of item.children) {
              if (child.title === childTitle) {
                return child.path
              }
            }
          }
        }
      } else {
        // 如果没有斜杠，则是顶层菜单项
        for (const item of this.menuItems) {
          if (item.title === titlePath) {
            return item.path
          }
        }
      }
      
      // 如果找不到匹配的路径，返回null
      return null
    },
    
    async loadMarkdown(path, isInitialLoad = false) {
      try {
        const response = await axios.get(path)
        this.content = response.data
        this.currentPath = path
        
        // 获取文档标题（可能包含父菜单/子菜单格式）
        const docTitle = this.getDocTitle(path)
        
        // 检查是否是外部URL
        const isExternalUrl = path.startsWith('http://') || path.startsWith('https://')
        
        // 只有对内部路径更新URL查询参数
        if (!isExternalUrl) {
          // 更新URL查询参数，使用标题而不是路径
          const url = new URL(window.location)
          url.searchParams.set('doc', docTitle)
          
          // 只有在非初始加载时才更新历史记录
          // 这样可以避免刷新页面时重复添加历史记录
          if (!isInitialLoad) {
            window.history.pushState({}, '', url)
          } else {
            // 在初始加载时，只替换当前的历史记录
            window.history.replaceState({}, '', url)
          }
        }
        
        // 自动展开包含当前文档的菜单组
        this.expandMenuForPath(path)
        
        // 移动端点击菜单项后自动关闭菜单
        if (window.innerWidth <= 768) {
          this.menuOpen = false
        }
      } catch (error) {
        console.error('加载 Markdown 文件失败:', error)
        this.content = '# 加载失败\n\n文件不存在或无法访问。'
        
        // 如果路径无效且不是默认路径，尝试加载默认文档
        if (path !== this.menuItems[0].path) {
          console.log('尝试加载默认文档')
          this.loadMarkdown(this.menuItems[0].path, isInitialLoad)
        }
      }
    },
    
    // 查找并展开包含当前文档的菜单组
    expandMenuForPath(path) {
      // 重置已打开的菜单组
      // this.openGroups = []
      
      // 查找包含当前路径的菜单组
      this.menuItems.forEach((item, index) => {
        if (item.children) {
          const hasPath = item.children.some(child => child.path === path)
          if (hasPath && !this.openGroups.includes(index)) {
            this.openGroups.push(index)
          }
        }
      })
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
/* .menu-group {
  margin-bottom: 5px;
} */

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
  padding-left: 12px;
}

.menu-group-item {
  padding-left: 16px;
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