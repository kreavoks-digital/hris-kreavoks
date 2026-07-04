// ─── Session flag ────────────────────────────────────────────────────────────
// Kita tidak bisa baca HttpOnly cookie dari JS.
// Gunakan flag di sessionStorage sebagai sinyal "pernah login".
// Flag ini hanya ada jika user benar-benar sudah login di tab ini atau sebelumnya.
const SESSION_KEY = 'kvhris_session_active'

// ─── Mutex: satu request refresh sekaligus ──────────────────────────────────
let refreshPromise: Promise<string> | null = null

export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:3001/api/v1'

  // accessToken disimpan di memory (hilang saat refresh page, di-restore via cookie)
  const accessToken = useState<string | null>('auth_access_token', () => null)
  const user = useState<any | null>('auth_user', () => null)

  const setTokens = (access: string) => {
    accessToken.value = access
  }

  const setUser = (u: any) => {
    user.value = u
    if (process.client) {
      sessionStorage.setItem('user', JSON.stringify(u))
      // Tandai bahwa session aktif → izinkan refresh pada page load berikutnya
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }

  const setAuth = (u: any, access: string) => {
    setUser(u)
    setTokens(access)
  }

  const refreshAccessToken = async (): Promise<string> => {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const res = await $fetch<any>(`${apiUrl}/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          body: {}
        })

        if (res.success && res.data?.accessToken) {
          accessToken.value = res.data.accessToken
          return res.data.accessToken
        }
        throw new Error('Refresh token gagal')
      } catch (err) {
        // Bersihkan state tapi jangan redirect di sini
        accessToken.value = null
        user.value = null
        if (process.client) {
          sessionStorage.removeItem('user')
          sessionStorage.removeItem(SESSION_KEY)
        }
        throw err
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  /**
   * Inisialisasi auth saat pertama kali app di-load.
   * Hanya mencoba refresh token jika ada flag session aktif.
   * Ini mencegah error 401 di console bagi user yang belum pernah login.
   */
  const loadAuth = async () => {
    if (!process.client) return

    // FE-05 FIX: Restore user dari sessionStorage sebagai data optimistic (tampilan awal cepat)
    // tapi selalu verifikasi ke server setelah token di-refresh
    const savedUser = sessionStorage.getItem('user')
    if (savedUser && !user.value) {
      try { user.value = JSON.parse(savedUser) } catch {}
    }

    // Jika sudah ada token di memory, tidak perlu refresh
    if (accessToken.value) return

    // Hanya coba refresh jika user PERNAH login (flag aktif)
    const hasSession = sessionStorage.getItem(SESSION_KEY)
    if (!hasSession) return

    try {
      await refreshAccessToken()
      // FE-05 FIX: Selalu fetch ulang data user dari server setelah refresh berhasil
      // untuk memastikan data di state adalah data yang valid dan terkini
      await fetchUser()
    } catch {
      // Cookie expired — user perlu login ulang
    }
  }

  const fetchUser = async () => {
    if (!accessToken.value) return

    try {
      const res = await $fetch<{ data: any }>(`${apiUrl}/profile/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      setUser(res.data)
    } catch (e) {
      console.error('Fetch user failed', e)
    }
  }

  const logout = () => {
    accessToken.value = null
    user.value = null
    if (process.client) {
      sessionStorage.removeItem('user')
      sessionStorage.removeItem(SESSION_KEY)
    }
  }

  const logoutAndRedirect = async () => {
    try {
      if (accessToken.value) {
        await $fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { Authorization: `Bearer ${accessToken.value}` }
        })
      }
    } catch {}
    logout()
    await navigateTo('/auth/login')
  }

  return {
    accessToken,
    user,
    setAuth,
    setUser,
    setTokens,
    loadAuth,
    fetchUser,
    refreshAccessToken,
    logout,
    logoutAndRedirect,
  }
}