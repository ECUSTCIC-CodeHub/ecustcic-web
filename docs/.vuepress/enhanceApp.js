export default ({ Vue, router }) => {
  if (typeof window !== 'undefined') {
    function scrollToY (top, smooth) {
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
    }

    function findAnchor (hash) {
      const id = hash.slice(1)
      try {
        return document.getElementById(decodeURIComponent(id)) || document.getElementById(id)
      } catch (e) {
        return document.getElementById(id)
      }
    }

    // 跨页跳转时标题可能还没渲染出来，先重试几帧再滚动
    function scrollToAnchor (hash, smooth, retries) {
      const el = findAnchor(hash)
      if (el) {
        // 标题自带 padding 补偿，滚动到它的顶部即可，无需再减导航栏高度
        scrollToY(el.getBoundingClientRect().top + window.pageYOffset, smooth)
      } else if (retries > 0) {
        window.requestAnimationFrame(() => scrollToAnchor(hash, smooth, retries - 1))
      }
    }

    // 侧边栏高亮会主动 replace hash，这种情况下不能跟着滚
    function isScrollDisabled () {
      return !!(Vue.$vuepress && Vue.$vuepress.$get('disableScrollBehavior'))
    }

    // 必须返回 false，不能返回位置对象：否则 vue-router 会用它记录的旧滚动位置再滚一次，
    // 表现为点击侧边栏锚点后页面先到位、又被“莫名”移走
    router.options.scrollBehavior = function (to, from, savedPosition) {
      // hash 优先于 savedPosition：点击页内锚点时浏览器会先跳一次并触发 popstate，
      // 此时 vue-router 传来的 savedPosition 是跳转前的旧位置，会把人拽回去
      if (to.hash) {
        if (!isScrollDisabled()) scrollToAnchor(to.hash, to.path === from.path, 20)
      } else if (savedPosition) {
        scrollToY(savedPosition.y, true)
      } else if (to.path !== from.path) {
        scrollToY(0, false)
      }
      return false
    }

    function fixHomeLinks() {
      Vue.nextTick(() => {
        document.querySelectorAll('a.home-link, a.nav-link').forEach(el => {
          if (el.dataset.fixed) return
          const isHomeLink = el.classList.contains('home-link')
          const isBackLink = el.textContent.trim() === '返回主站'
          const href = el.getAttribute('href') || ''

          if ((isHomeLink || isBackLink) && href.startsWith('/tech')) {
            const clone = el.cloneNode(true)
            clone.setAttribute('href', '/')
            clone.removeAttribute('aria-current')
            clone.className = clone.className
              .replace(/router-link-(exact-)?active/g, '')
              .trim()
            clone.dataset.fixed = '1'
            el.parentNode.replaceChild(clone, el)
          }
        })
      })
    }

    router.onReady(() => setTimeout(fixHomeLinks, 200))
    router.afterEach(() => setTimeout(fixHomeLinks, 100))
  }
}
