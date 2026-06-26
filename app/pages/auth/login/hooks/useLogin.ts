import { loginApi } from '../api/login.api'
import { useAuth } from '~/composables/useAuth'
import { toast } from 'vue-sonner'

export const useLogin = () => {
  const { setAuth } = useAuth()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const handleLogin = async (credentials: any) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await loginApi.login(credentials)
      
      if (response.success) {
        // setAuth hanya butuh user dan accessToken — refreshToken di HttpOnly cookie
        setAuth(response.data.user, response.data.accessToken)
        toast.success('Login Berhasil', {
          description: `Selamat datang, ${response.data.user.fullName || response.data.user.email}!`
        })
        // Gunakan navigateTo (Nuxt) bukan router.push agar middleware bisa berjalan ulang
        await navigateTo('/dashboard')
      } else {
        error.value = response.message || 'Login gagal'
        toast.error('Login Gagal', {
          description: error.value || ''
        })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.data?.message || err.message || 'Terjadi kesalahan sistem'
      toast.error('Error', {
        description: error.value || ''
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    handleLogin
  }
}
