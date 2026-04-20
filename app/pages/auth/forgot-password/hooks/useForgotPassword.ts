import { forgotPasswordApi } from '../api/forgot-password.api'
import { toast } from 'vue-sonner'

export const useForgotPassword = () => {
  const loading = ref(false)

  const handleSubmit = async (email: string) => {
    loading.value = true
    
    try {
      const response = await forgotPasswordApi.submit(email)
      toast.success('Berhasil', {
        description: response.message || 'Link reset password berhasil dikirim. Cek kotak masuk emailmu.'
      })
    } catch (err: any) {
      console.error('Forgot password error:', err)
      toast.error('Gagal', {
        description: err.data?.message || 'Gagal mengirim link reset password.'
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    handleSubmit
  }
}
