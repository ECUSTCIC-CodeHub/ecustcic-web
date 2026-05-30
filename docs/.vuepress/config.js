module.exports = {
  base: '/tech/',
  title: 'CIC 指南',
  description: '华理计算机信息交流协会资料库',
  dest: 'dist/tech/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: null,
    nav: [
      { text: '首页', link: '/' },
      {
        text: '学习资源',
        link: '/learning/',
        items: [
          { text: '课程攻略', link: '/learning/ecust-CourseShare/' },
          { text: '图书数据库', link: '/learning/library/' }
        ]
      },
      {
        text: '网络信息服务FAQ',
        link: '/faq/',
        items: [
          { text: '常见问题总览', link: '/faq/' },
          { text: '搬迁徐汇校区网络问题', link: '/faq/xuhuinetwork' },
          { text: '校园网连接问题解决方案', link: '/faq/campus_network_connection' }
        ]
      },
      {
        text: '开发教程',
        link: '/dev/',
        items: [
          { text: '游戏开发路径指南', link: '/dev/EcustMakerTurtorial/' }
        ]
      },
      {
        text: '站点维护指南',
        link: '/maintenance/',
        items: [
          { text: '维护快速入门', link: '/maintenance/quickstart/' }
        ]
      },
      { text: '返回主站', link: 'https://www.ecustcic.com/' }
    ],

    sidebar: {
      '/learning/ecust-CourseShare/': [
        {
          title: '课程攻略共享计划',
          path: '/learning/ecust-CourseShare/',
          collapsable: false
        }
      ],
      '/learning/library/': [
        {
          title: '图书数据库使用方法',
          path: '/learning/library/',
          collapsable: false
        }
      ],
      '/faq/': [
        {
          title: '网络和信息系统常见问题',
          path: '/faq/',
          collapsable: false,
          children: [
            '/faq/xuhuinetwork',
            '/faq/campus_network_connection'
          ]
        }
      ],
      '/dev/': [
        {
          title: '游戏开发路径指南',
          path: '/dev/',
          collapsable: false
        }
      ],
      '/maintenance/': [
        {
          title: '本站维护快速入门指南',
          path: '/maintenance/quickstart/',
          collapsable: false
        }
      ]
    },

    lastUpdated: '最后更新',
    smoothScroll: true
  },

  markdown: {
    lineNumbers: true
  },

  evergreen: true
}
