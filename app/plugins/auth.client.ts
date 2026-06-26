export default defineNuxtPlugin(async (nuxtApp) => {
  const { loadAuth } = useAuth()
  
  // Ini akan berjalan sebelum aplikasi Vue di-mount dan sebelum page onMounted
  await loadAuth()
})
