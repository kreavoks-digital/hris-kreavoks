/**
 * useViewerMode — Composable untuk permission "view_all_features".
 *
 * Permission ini bersifat GRANULAR PER-INDIVIDU, bukan per-role.
 * Tidak ada auto-assign ke semua INTERN — harus di-set manual via RBAC.
 *
 * Logika:
 * - isViewerMode = true  → user punya permission 'view_all_features' TAPI bukan ADMIN/manage_*
 * - canPerformActions    → user bisa melakukan aksi mutasi (tambah/edit/hapus/approve)
 */
export const useViewerMode = () => {
  const { user } = useAuth()

  /**
   * Apakah user adalah "documentation viewer" (view-only mode)?
   * True jika user memiliki 'view_all_features' tapi bukan ADMIN
   * dan tidak punya permission manage_*.
   */
  const isViewerMode = computed(() => {
    if (!user.value) return false
    if (user.value.role === 'ADMIN') return false

    const rawPermissions = user.value.permissions ?? []
    const permissions: string[] = rawPermissions.map((p: any) => typeof p === 'string' ? p : p?.name).filter(Boolean)

    // Jika punya hak kelola spesifik → bukan viewer murni
    const hasManagePermission = permissions.some((p) =>
      ['manage_users', 'manage_letters', 'manage_roles'].includes(p)
    )
    if (hasManagePermission) return false

    // Viewer mode aktif hanya jika eksplisit punya permission ini
    return permissions.includes('view_all_features')
  })

  /**
   * Apakah user boleh melakukan aksi sensitif (mutasi data)?
   * - ADMIN → selalu bisa
   * - Punya manage_* → bisa
   * - Hanya view_all_features → TIDAK bisa
   */
  const canPerformActions = computed(() => !isViewerMode.value)

  /**
   * Apakah user boleh mengakses halaman admin-only?
   * Membuka akses untuk viewer mode (tapi read-only).
   */
  const canAccessAdminPages = computed(() => {
    if (!user.value) return false
    if (user.value.role === 'ADMIN') return true

    const rawPermissions = user.value.permissions ?? []
    const permissions: string[] = rawPermissions.map((p: any) => typeof p === 'string' ? p : p?.name).filter(Boolean)
    return permissions.some((p) =>
      ['manage_users', 'manage_letters', 'manage_roles', 'view_all_features'].includes(p)
    )
  })

  return {
    isViewerMode,
    canPerformActions,
    canAccessAdminPages,
  }
}
