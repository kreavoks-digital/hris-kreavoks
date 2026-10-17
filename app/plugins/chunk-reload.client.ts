export default defineNuxtPlugin((nuxtApp) => {
  const isChunkError = (err: any) => {
    const msg = err?.message || err?.toString() || ''
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    )
  }

  nuxtApp.hook('app:error', (error) => {
    if (isChunkError(error)) {
      // Auto-reload on deployment chunk mismatch
      window.location.reload()
    }
  })

  const router = useRouter()
  router.onError((error) => {
    if (isChunkError(error)) {
      // Auto-reload on navigation chunk mismatch
      window.location.reload()
    }
  })
})
