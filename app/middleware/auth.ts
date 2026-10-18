export default defineNuxtRouteMiddleware(async (to) => {
  // Middleware hanya berjalan di client (ssr: false)
  if (process.server) return

  const { accessToken, user, loadAuth } = useAuth()

  // Jika belum ada accessToken di memory, coba restore dari cookie via refresh
  if (!accessToken.value) {
    await loadAuth()
  }

  const isAuthPage = to.path.startsWith('/auth/')
  const isLoggedIn = !!accessToken.value

  // Jika belum login dan bukan auth page → redirect login
  if (!isLoggedIn && !isAuthPage) {
    return navigateTo('/auth/login')
  }

  // Jika sudah login:
  if (isLoggedIn) {
    const isMentorNeedingDocs = user.value?.role === 'MENTOR' && !user.value?.hasDocuments && !user.value?.agreementLink

    // Khusus mentor yang belum melengkapi dokumen, wajib diarahkan ke /onboarding
    if (isMentorNeedingDocs) {
      if (to.path !== '/onboarding') {
        return navigateTo('/onboarding')
      }
      return
    }

    // Jika sudah lengkap dokumen atau bukan mentor, tapi coba akses /onboarding
    if (to.path === '/onboarding') {
      return navigateTo('/dashboard')
    }

    // Jika sudah login dan coba akses auth pages → redirect dashboard
    if (isAuthPage) {
      return navigateTo('/dashboard')
    }
  }
})