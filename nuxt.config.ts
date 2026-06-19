// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  srcDir: 'app',
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  future: {
    compatibilityVersion: 4,
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
      "Plus Jakarta Sans": [300,400,500,600,700]
    },
    display: 'swap'
  },
  
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
    },
  },

  experimental: {
    appManifest: false
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  }
})