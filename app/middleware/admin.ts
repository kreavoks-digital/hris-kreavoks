export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;

  const { user } = useAuth();

  const isAdmin = user.value?.role === 'ADMIN'
  const permissions: string[] = user.value?.permissions ?? []

  // Izinkan ADMIN
  if (isAdmin) return

  // Izinkan user yang punya permission kelola spesifik
  const hasManagePermission = permissions.some((p) =>
    ['manage_users', 'manage_letters', 'manage_roles'].includes(p)
  )
  if (hasManagePermission) return

  // Izinkan user dengan permission 'view_all_features' (documentation viewer)
  // Permission ini diberikan MANUAL per-individu via RBAC — tidak auto ke semua INTERN
  if (permissions.includes('view_all_features')) return

  return navigateTo('/dashboard')
});
