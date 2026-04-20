import { registerApi } from '../api/register.api'
import { toast } from 'vue-sonner'

export const useRegister = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const handleRegister = async (data: any) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await registerApi.register(data)
      
      if (response.success) {
        toast.success('Berhasil', {
          description: 'Registrasi berhasil! Silakan login.'
        })
        router.push('/auth/login')
      } else {
        error.value = response.message || 'Registrasi gagal'
        toast.error('Gagal', {
          description: error.value || ''
        })
      }
    } catch (err: any) {
      console.error('Register error:', err)
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
    handleRegister
  }
}
