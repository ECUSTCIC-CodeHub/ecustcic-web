export const menuItems = [
  { 
    title: '首页', 
    path: '/docs/home.md',
    icon: 'fa-home'
  },
  { 
    title: '快速开始', 
    path: '/docs/quickstart.md',
    icon: 'fa-rocket'
  },
  {
    title: 'ecust-CourseShare', 
    path: 'https://cnb.ecustvr.top/ecustcic/ecust-CourseShare/-/git/raw/master/Readme.md',
    icon: 'fa-book'
  },
  { 
    title: '组件文档', 
    icon: 'fa-puzzle-piece',
    children: [
      {
        title: '基础组件',
        path: '/docs/components/basic.md',
        icon: 'fa-cube'
      },
      {
        title: '表单组件',
        path: '/docs/components/form.md',
        icon: 'fa-list-alt'
      },
      {
        title: '数据展示',
        path: '/docs/components/data.md',
        icon: 'fa-table'
      }
    ]
  },
  { 
    title: 'API 文档', 
    icon: 'fa-code',
    children: [
      {
        title: '基础 API',
        path: '/docs/api/basic.md',
        icon: 'fa-cogs'
      },
      {
        title: '高级 API',
        path: '/docs/api/advanced.md',
        icon: 'fa-magic'
      }
    ]
  }
] 