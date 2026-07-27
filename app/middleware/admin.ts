export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return;
  
  const { user } = useAuth();
  
  // Periksa apakah user memiliki role ADMIN atau setidaknya memiliki permission 'manage_users' atau 'manage_letters'
  if (user.value?.role !== 'ADMIN' && !user.value?.permissions?.includes('manage_users') && !user.value?.permissions?.includes('manage_letters')) {
    return navigateTo('/dashboard');
  }
});
