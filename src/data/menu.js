export const menuItems = [
  { 
    title: '首页', 
    path: '/docs/home.md',
    icon: 'fa-home'
  },
  { 
    title: '本网站项目', 
    path: '/docs/quickstart.md',
    icon: 'fa-rocket'
  },
  {
    title: '网络和信息系统常见问题',
    icon: 'fa-book',
    children: [
      {
        title: 'FAQ总览',
        path: '/docs/faq/index.md',
        icon: 'fa-list'
      },
      // {
      //   title: '基本问题',
      //   path: '/docs/faq/basic/index.md',
      //   icon: 'fa-question-circle'
      // },
      {
        title: '浏览器/网络问题',
        path: '/docs/faq/network.md',
        icon: 'fa-wifi'
      }
    ]
  },
  {
    title: '图书数据库的使用',
    path: '',
    icon: 'fa-database'
  },
  {
    title: 'ecust-CourseShare', 
    path: 'https://cnb.ecustvr.top/ecustcic/ecust-CourseShare/-/git/raw/master/Readme.md',
    icon: 'fa-book'
  },
  {
    title: 'EcustMakerTurtorial（游戏开发）', 
    path: '/docs/EcustMakerTurtorial.md',
    icon: 'fa-book'
  }
  // { 
  //   title: '组件文档', 
  //   icon: 'fa-puzzle-piece',
  //   children: [
  //     {
  //       title: '基础组件',
  //       path: '/docs/components/basic.md',
  //       icon: 'fa-cube'
  //     },
  //     {
  //       title: '表单组件',
  //       path: '/docs/components/form.md',
  //       icon: 'fa-list-alt'
  //     },
  //     {
  //       title: '数据展示',
  //       path: '/docs/components/data.md',
  //       icon: 'fa-table'
  //     }
  //   ]
  // },
  // { 
  //   title: 'API 文档', 
  //   icon: 'fa-code',
  //   children: [
  //     {
  //       title: '基础 API',
  //       path: '/docs/api/basic.md',
  //       icon: 'fa-cogs'
  //     },
  //     {
  //       title: '高级 API',
  //       path: '/docs/api/advanced.md',
  //       icon: 'fa-magic'
  //     }
  //   ]
  // }
] 