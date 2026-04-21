export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl || API_BASE_URL
  
  const accessToken = useState<string | null>('auth_access_token', () => null)
  const refreshToken = useState<string | null>('auth_refresh_token', () => null)
  const user = useState<any | null>('auth_user', () => null)

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  const setUser = (u: any) => {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  const loadAuth = () => {
    if (process.server) return

    const at = localStorage.getItem('access_token')
    const rt = localStorage.getItem('refresh_token')
    const u = localStorage.getItem('user')

    if (at) accessToken.value = at
    if (rt) refreshToken.value = rt
    if (u) user.value = JSON.parse(u)
  }

  const fetchUser = async () => {
    if (!accessToken.value) return

    try {
      const res = await $fetch<{ data: any }>(`${apiUrl}/profile/me`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
      user.value = res.data
      localStorage.setItem('user', JSON.stringify(res.data))
    } catch (e) {
      console.error('Fetch user failed', e)
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) throw new Error('No refresh token available')

    try {
      const res = await $fetch<any>(`${apiUrl}/auth/refresh-token`, {
        method: 'POST',
        body: { refreshToken: refreshToken.value }
      })

      if (res.success) {
        setTokens(res.data.accessToken, res.data.refreshToken)
        return res.data.accessToken
      }
    } catch (err) {
      console.error('Token refresh failed', err)
      logout()
      throw err
    }
    
    throw new Error('Refresh token failed')
  }

  const setAuth = (u: any, access: string, refresh: string) => {
    setUser(u)
    setTokens(access, refresh)
  }

  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  return {
    accessToken,
    refreshToken,
    user,
    setTokens,
    setUser,
    setAuth,
    loadAuth,
    fetchUser,
    refreshAccessToken,
    logout,
  }
}