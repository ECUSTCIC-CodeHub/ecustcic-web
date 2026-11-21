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
            '/learning/ai/',
            '/learning/nic/'
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
    // 关闭 vuepress-plugin-smooth-scroll：它会覆盖 enhanceApp 里的 scrollBehavior，
    // 且返回值是 truthy 对象，导致 vue-router 额外滚回旧位置（点击侧边栏锚点后页面乱跳）
    smoothScroll: false
  },

  markdown: {
    lineNumbers: true
  },

  evergreen: true
}
