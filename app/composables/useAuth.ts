// ─── Session flag ────────────────────────────────────────────────────────────
// Kita tidak bisa baca HttpOnly cookie dari JS.
// Gunakan flag di localStorage sebagai sinyal "pernah login".
// localStorage berbagi antar semua tab di origin yang sama, sehingga jika user
// login di tab SSO, tab HRIS lain langsung bisa deteksi sesi aktif.
// user_display tetap di sessionStorage (hanya untuk tampilan optimistic, tidak kritis).
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
      // SECURITY FIX: Simpan HANYA data display yang tidak sensitif di sessionStorage.
      // Data seperti id, role, npk, permissions TIDAK disimpan di storage browser.
      // Data lengkap selalu di-fetch ulang dari server setelah token di-refresh.
      const safeDisplayData = {
        fullName: u?.fullName ?? u?.name ?? '',
        email: u?.email ?? '',
      }
      sessionStorage.setItem('user_display', JSON.stringify(safeDisplayData))
      // Tandai bahwa session aktif → izinkan refresh pada page load berikutnya.
      // Pakai localStorage agar flag ini dibaca oleh SEMUA tab di origin yang sama.
      localStorage.setItem(SESSION_KEY, '1')
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
          sessionStorage.removeItem('user_display')
          localStorage.removeItem(SESSION_KEY)
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

    // Restore data display minimal dari sessionStorage untuk optimistic UI (tampilan awal cepat)
    // Ini BUKAN data autoritatif — akan diganti oleh data server setelah refresh berhasil
    const savedDisplayUser = sessionStorage.getItem('user_display')
    if (savedDisplayUser && !user.value) {
      try {
        const displayData = JSON.parse(savedDisplayUser)
        // Hanya set untuk tampilan optimistic — tidak mengandung role/permissions
        user.value = displayData
      } catch {}
    }

    // Jika sudah ada token di memory, tetap sync user data terbaru dari server
    // agar permission yang baru di-assign langsung aktif tanpa perlu logout
    if (accessToken.value) {
      await fetchUser()
      return
    }

    // Hanya coba refresh jika user PERNAH login (flag aktif).
    // Pakai localStorage agar flag ini terbaca dari tab manapun.
    const hasSession = localStorage.getItem(SESSION_KEY)
    if (!hasSession) return

    try {
      await refreshAccessToken()
      // Selalu fetch ulang data user lengkap dari server setelah refresh berhasil
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
      sessionStorage.removeItem('user_display')
      localStorage.removeItem(SESSION_KEY)
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