import { resetPasswordApi } from '../api/reset-password.api'
import { toast } from 'vue-sonner'

export const useResetPassword = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const handleReset = async (data: any) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await resetPasswordApi.reset(data)
      
      if (response.success) {
        toast.success('Berhasil', {
          description: 'Password berhasil diubah! Silakan login.'
        })
        router.push('/auth/login')
      } else {
        error.value = response.message || 'Gagal mereset password'
        toast.error('Gagal', {
          description: error.value || ''
        })
      }
    } catch (err: any) {
      console.error('Reset password error:', err)
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
    handleReset
  }
}
