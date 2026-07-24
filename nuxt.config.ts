// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  srcDir: 'app',
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  hooks: {
    'pages:extend'(pages) {
      const removePages = (pagesArr: any[]) => {
        for (let i = pagesArr.length - 1; i >= 0; i--) {
          const page = pagesArr[i]
          if (
            page.file && (
              page.file.includes('/components/') ||
              page.file.includes('/types/') ||
              page.file.includes('/hooks/') ||
              page.file.includes('/api/')
            )
          ) {
            pagesArr.splice(i, 1)
          } else if (page.children) {
            removePages(page.children)
          }
        }
      }
      removePages(pages)
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    'shadcn-nuxt'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },

  googleFonts: {
    families: {
      "Plus Jakarta Sans": [300, 400, 500, 600, 700]
    },
    display: 'swap'
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },

  spaLoadingTemplate: './spa-loading-template.html',

  experimental: {
    appManifest: false
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },


})