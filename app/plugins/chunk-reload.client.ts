export default defineNuxtPlugin((nuxtApp) => {
  const isChunkError = (err: any) => {
    const msg = err?.message || err?.toString() || ''
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    )
  }

  const triggerReload = () => {
    if (typeof window === 'undefined') return
    const now = Date.now()
    const lastReload = Number(sessionStorage.getItem('last_chunk_reload') || '0')
    if (now - lastReload > 10000) {
      sessionStorage.setItem('last_chunk_reload', String(now))
      window.location.reload()
    }
  }

  if (typeof window !== 'undefined') {
    // 1. Resmi Vite: Tangani perubahan hash chunk saat deployment baru
    window.addEventListener('vite:preloadError', (event) => {
      event.preventDefault()
      triggerReload()
    })

    // 2. Tangani Unhandled Promise Rejection
    window.addEventListener('unhandledrejection', (event) => {
      if (isChunkError(event.reason)) {
        event.preventDefault()
        triggerReload()
      }
    })

    // 3. Tangani Global Window Error
    window.addEventListener('error', (event) => {
      if (isChunkError(event.error || event.message)) {
        event.preventDefault()
        triggerReload()
      }
    })
  }

  nuxtApp.hook('app:error', (error) => {
    if (isChunkError(error)) {
      triggerReload()
    }
  })

  const router = useRouter()
  router.onError((error) => {
    if (isChunkError(error)) {
      triggerReload()
    }
  })
})
