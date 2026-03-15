export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const { token, user, loadAuth, fetchUser } = useAuth()

  // LOAD dari localStorage dulu
  loadAuth()

  // Jika ada token tapi user belum ada → fetch ulang
  if (token.value && !user.value) {
    try {
      await fetchUser()
    } catch (e) {
      return navigateTo('/login')
    }
  }

  if (!token.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (token.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})