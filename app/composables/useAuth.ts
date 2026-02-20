export const useAuth = () => {
  const token = useState<string | null>('auth_token', () => null)
  const user = useState<any | null>('auth_user', () => null)

  const setToken = (t: string) => {
    token.value = t
    localStorage.setItem('token', t)
  }

  const setUser = (u: any) => {
    user.value = u
    localStorage.setItem('user', JSON.stringify(u))
  }

  const loadAuth = () => {
    if (process.server) return

    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')

    if (t) token.value = t
    if (u) user.value = JSON.parse(u)
  }

  const fetchUser = async () => {
    if (!token.value) return

    const res = await $fetch<{ data: any }>('http://localhost:3001/api/v1/profile/me', {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    setToken,
    setUser,
    loadAuth,
    fetchUser,
    logout,
  }
}