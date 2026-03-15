// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],

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
}
})