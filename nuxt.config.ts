// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  srcDir: 'app',
  ssr: false,
  compatibilityDate: '2025-07-15',

  future: {
    compatibilityVersion: 4,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        module: "ESNext"
      }
    }
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 300
      }
    }
  },


  hooks: {
    'pages:extend'(pages) {
      const removePages = (pagesArr: any[]) => {
        for (let i = pagesArr.length - 1; i >= 0; i--) {
          const page = pagesArr[i]
          const normalizedPath = (page.file || '').replace(/\\/g, '/')
          if (
            normalizedPath && (
              normalizedPath.includes('/components/') ||
              normalizedPath.includes('/types/') ||
              normalizedPath.includes('/hooks/') ||
              normalizedPath.includes('/api/')
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
    '~/assets/css/main.css',
    '@kreavoks/kreaui/style.css'
  ],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },

  googleFonts: {
    families: {
      "Plus Jakarta Sans": [300, 400, 500, 600, 700, 800],
      "Alex Brush": [400],
      "Great Vibes": [400],
      "Montserrat": [400, 500, 600, 700, 800]
    },
    display: 'swap'
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      // Domains yang diizinkan sebagai redirect_uri SSO (pisahkan dengan koma)
      // Contoh: NUXT_PUBLIC_SSO_ALLOWED_DOMAINS=kreavoks.com,careers.kreavoks.com
      ssoAllowedDomains: process.env.NUXT_PUBLIC_SSO_ALLOWED_DOMAINS || '',
      
      // Firebase Config
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
        vapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY,
      }
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