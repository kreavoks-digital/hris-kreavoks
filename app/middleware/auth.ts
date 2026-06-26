export default defineNuxtRouteMiddleware(async (to) => {
  // Middleware hanya berjalan di client (ssr: false)
  if (process.server) return

  const { accessToken, loadAuth } = useAuth()

  // Jika belum ada accessToken di memory, coba restore dari cookie via refresh
  if (!accessToken.value) {
    await loadAuth()
  }

  const isAuthPage = to.path.startsWith('/auth/')
  const isLoggedIn = !!accessToken.value

  // Jika sudah login dan coba akses auth pages → redirect dashboard
  if (isLoggedIn && isAuthPage) {
    return navigateTo('/dashboard')
  }

  // Jika belum login dan bukan auth page → redirect login
  if (!isLoggedIn && !isAuthPage) {
    return navigateTo('/auth/login')
  }
})