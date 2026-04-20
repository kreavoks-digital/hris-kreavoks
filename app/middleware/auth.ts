export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const { accessToken, user, loadAuth, fetchUser } = useAuth()

  // LOAD dari localStorage dulu
  loadAuth()

  // Jika ada token tapi user belum ada → fetch ulang
  if (accessToken.value && !user.value) {
    try {
      await fetchUser()
    } catch (e) {
      return navigateTo('/auth/login')
    }
  }

  // Jika tidak ada token dan bukan halaman auth -> ke login
  if (!accessToken.value && !to.path.startsWith('/auth/')) {
    return navigateTo('/auth/login')
  }

  // Jika sudah login tapi mau ke login -> ke dashboard
  if (accessToken.value && to.path === '/auth/login') {
    return navigateTo('/dashboard')
  }
})