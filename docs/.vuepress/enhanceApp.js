export default ({ Vue, router }) => {
  if (typeof window !== 'undefined') {
    router.options.scrollBehavior = function (to, from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) {
        try {
          const id = decodeURIComponent(to.hash.slice(1))
          const el = document.getElementById(id)
          if (el) return window.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
        } catch (e) {}
        return { x: 0, y: 0 }
      }
      return { x: 0, y: 0 }
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
