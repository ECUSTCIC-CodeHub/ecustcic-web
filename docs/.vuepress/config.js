module.exports = {
  base: '/tech/',
  title: 'CIC 指南',
  description: '华理计算机信息交流协会资料库',
  dest: 'dist/tech/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo-cic.png',
    nav: [
      { text: '返回主站', link: '/' }
    ],

    sidebar: {
      '/': [
        {
          title: '学习资源',
          path: '/learning/',
          collapsable: false,
          children: [
            '/learning/ecust-CourseShare/',
            '/learning/library/',
            '/learning/ai'
          ]
        },
        {
          title: '网络信息服务FAQ',
          path: '/faq/',
          collapsable: false,
          children: [
            '/faq/xuhuinetwork',
            '/faq/campus_network_connection'
          ]
        },
        {
          title: '开发教程',
          path: '/dev/',
          collapsable: false,
          children: [
            '/dev/EcustMakerTurtorial/'
          ]
        },
        {
          title: '站点维护指南',
          path: '/maintenance/',
          collapsable: false,
          children: [
            '/maintenance/quickstart/'
          ]
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
