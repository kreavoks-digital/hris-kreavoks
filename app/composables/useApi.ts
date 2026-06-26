export const useApi = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth()
  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

  const customFetch = async (request: string, opts: any = {}) => {
    const buildFetcher = (token: string | null) => $fetch.create({
      baseURL: apiUrl,
      credentials: 'include', // selalu kirim cookie ke BE
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    try {
      return await buildFetcher(accessToken.value)(request, opts)
    } catch (error: any) {
      const status = error?.response?.status

      // Jika 401 — coba refresh token via cookie lalu retry sekali
      if (status === 401) {
        // Jangan retry jika request itu sendiri adalah refresh/login
        if (request.includes('/auth/refresh-token') || request.includes('/auth/login')) {
          logout()
          throw error
        }

        try {
          const newToken = await refreshAccessToken()

          // Retry dengan token baru
          const retryOpts = { ...opts }
          retryOpts.headers = {
            ...(retryOpts.headers || {}),
            Authorization: `Bearer ${newToken}`
          }
          return await buildFetcher(newToken)(request, retryOpts)
        } catch {
          logout()
          await navigateTo('/auth/login')
          throw error
        }
      }

      throw error
    }
  }

  return customFetch as any
}
