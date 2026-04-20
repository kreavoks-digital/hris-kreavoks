export const useApi = () => {
  const { accessToken, refreshAccessToken, logout } = useAuth()
  
  const customFetch = $fetch.create({
    baseURL: API_BASE_URL,
    async onRequest({ options }) {
      if (accessToken.value) {
        const headers = options.headers || {}
        
        if (headers instanceof Headers) {
          headers.set('Authorization', `Bearer ${accessToken.value}`)
        } else if (Array.isArray(headers)) {
          (headers as string[][]).push(['Authorization', `Bearer ${accessToken.value}`])
        } else {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken.value}`
        }

        options.headers = headers
      }
    },
    async onResponseError({ response, options }) {
      if (response.status === 401 && accessToken.value) {
        // Avoid infinite loop if refresh itself fails
        if (options.baseURL?.includes('/auth/refresh-token')) {
          logout()
          return
        }

        try {
          await refreshAccessToken()
          // Note: Transparent retry is complex with $fetch.create. 
          // Usually requires a higher-level wrapper or state change that triggers re-fetch.
        } catch (error) {
          logout()
          navigateTo('/auth/login')
        }
      }
    }
  })

  return customFetch as any
}
