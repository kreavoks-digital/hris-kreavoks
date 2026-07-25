/**
 * useSsoWhitelist
 *
 * Centralized SSO redirect_uri validation composable.
 * Semua whitelist domain dikontrol dari sini — BUKAN dari user input.
 *
 * Security notes:
 * - App name HANYA boleh berasal dari URI yang sudah divalidasi whitelist.
 * - Query param ?app_name dari user TIDAK BOLEH dipercaya untuk menentukan nama app.
 */
export const useSsoWhitelist = () => {
  const config = useRuntimeConfig()

  /**
   * Daftar domain yang diizinkan sebagai redirect_uri tujuan SSO.
   * Wajib dikonfigurasi via env NUXT_PUBLIC_SSO_ALLOWED_DOMAINS (pisahkan dengan koma).
   * Contoh: NUXT_PUBLIC_SSO_ALLOWED_DOMAINS=kreavoks.com,careers.kreavoks.com
   *
   * SECURITY: Tidak ada fallback hardcoded — jika env kosong, semua redirect ditolak (fail-secure).
   */
  const getAllowedDomains = (): string[] => {
    const fromEnv = (config.public.ssoAllowedDomains as string) || ''
    return fromEnv.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  }

  /**
   * Validasi apakah redirect_uri berasal dari domain yang diizinkan.
   * Hanya mengizinkan protokol http/https.
   */
  const isValidRedirectUri = (uri: string): boolean => {
    if (!uri || typeof uri !== 'string') return false
    try {
      const url = new URL(uri)
      // Hanya izinkan http dan https — tidak boleh javascript:, data:, dll
      if (!['http:', 'https:'].includes(url.protocol)) return false

      const hostname = url.hostname.toLowerCase()
      const allowed = getAllowedDomains()

      return allowed.some(
        (domain) => hostname === domain || hostname.endsWith('.' + domain)
      )
    } catch {
      return false
    }
  }

  /**
   * Dapatkan nama aplikasi dari redirect_uri yang SUDAH TERVALIDASI.
   * Tidak pernah mengambil dari user input (query param app_name).
   */
  const getAppName = (redirectUri: string): string => {
    if (!redirectUri || !isValidRedirectUri(redirectUri)) return 'Kreavoks'

    try {
      const url = new URL(redirectUri)
      const hostname = url.hostname.toLowerCase()

      if (hostname.includes('hris')) return 'HRIS'
      if (hostname.includes('careers')) return 'Careers'

      // Gunakan subdomain pertama dengan kapitalisasi — tapi hanya dari URI yang valid
      const parts = hostname.split('.')
      if (parts.length > 2) {
        const sub = parts[0] ?? ''
        if (!sub) return 'Kreavoks'
        return sub.charAt(0).toUpperCase() + sub.slice(1)
      }

      // Gunakan nama domain utama
      const domainName = parts[0] ?? ''
      if (!domainName) return 'Kreavoks'
      return domainName.charAt(0).toUpperCase() + domainName.slice(1)
    } catch {
      return 'Kreavoks'
    }
  }

  /**
   * Validasi redirect internal (relative path) — mencegah open redirect.
   * Hanya mengizinkan path relatif yang dimulai dengan /.
   */
  const isValidInternalRedirect = (path: string): boolean => {
    if (!path || typeof path !== 'string') return false
    // Harus dimulai dengan / dan tidak boleh mengandung //
    // (double slash bisa jadi protocol-relative URL: //evil.com)
    return path.startsWith('/') && !path.startsWith('//')
  }

  return {
    isValidRedirectUri,
    getAppName,
    isValidInternalRedirect,
  }
}
