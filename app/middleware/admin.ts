export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;
  
  const { user } = useAuth();
  
  // Periksa apakah user memiliki role ADMIN atau setidaknya memiliki permission 'manage_users'
  if (user.value?.role !== 'ADMIN' && !user.value?.permissions?.includes('manage_users')) {
    return navigateTo('/dashboard');
  }
});
