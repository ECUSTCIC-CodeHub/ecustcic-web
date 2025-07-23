export const menuItems = [
  {
    title: '华东理工大学课程攻略共享计划', 
    path: 'https://cnb.ecustvr.top/ecustcic/ecust-CourseShare/-/git/raw/master/Readme.md',
    icon: 'fa-book'
  },
  { 
    title: '本站维护快速入门指南', 
    path: '/docs/quickstart.md',
    icon: 'fa-rocket'
  },
  {
    title: '网络和信息系统常见问题',
    icon: 'fa-book',
    children: [
      {
        title: '常见问题总览',
        path: '/docs/faq/index.md',
        icon: 'fa-list'
      },
      {
        title: '搬迁徐汇校区网络问题',
        path: '/docs/faq/xuhuinetwork.md',
        icon: 'fa-wifi'
      }
    ]
  },
  {
    title: '图书数据库使用方法',
    path: '/docs/library.md',
    icon: 'fa-database'
  },
  {
    title: '游戏开发路径指南', 
    path: '/docs/EcustMakerTurtorial.md',
    icon: 'fa-book'
  }
] 