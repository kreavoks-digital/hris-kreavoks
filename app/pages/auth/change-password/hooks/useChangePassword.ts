import { changePasswordApi } from '../api/change-password.api'
import { toast } from 'vue-sonner'

export const useChangePassword = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const handleChange = async (data: any) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await changePasswordApi.change(data)
      
      if (response.success) {
        toast.success('Berhasil', {
          description: error.value || 'Password berhasil diubah'
        })
        return true
      } else {
        error.value = response.message || 'Gagal mengubah password'
        toast.error('Gagal', {
          description: error.value || ''
        })
        return false
      }
    } catch (err: any) {
      console.error('Change password error:', err)
      error.value = err.data?.message || err.message || 'Terjadi kesalahan sistem'
      toast.error('Error', {
        description: error.value || ''
      })
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    handleChange
  }
}
