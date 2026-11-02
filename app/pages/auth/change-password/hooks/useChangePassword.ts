import { changePasswordApi, type ChangePasswordPayload } from '../api/change-password.api'
import { toast } from 'vue-sonner'

export const useChangePassword = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const showOldPassword = ref(false)
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  const isPasswordMismatch = computed(() => {
    return Boolean(form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword)
  })

  const isSubmitDisabled = computed(() => {
    return (
      loading.value ||
      !form.oldPassword ||
      !form.newPassword ||
      !form.confirmPassword ||
      form.newPassword.length < 8 ||
      isPasswordMismatch.value
    )
  })

  const resetForm = () => {
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  }

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Gagal', {
        description: 'Konfirmasi password baru tidak cocok.'
      })
      return false
    }

    if (form.newPassword.length < 8) {
      toast.error('Gagal', {
        description: 'Password baru minimal harus 8 karakter.'
      })
      return false
    }

    loading.value = true
    error.value = null

    try {
      const payload: ChangePasswordPayload = {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      }
      const response = await changePasswordApi.change(payload)

      if (response.success) {
        toast.success('Berhasil', {
          description: response.message || 'Password berhasil diperbarui.'
        })
        resetForm()
        return true
      } else {
        error.value = response.message || 'Gagal mengubah password.'
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
    form,
    loading,
    error,
    showOldPassword,
    showNewPassword,
    showConfirmPassword,
    isPasswordMismatch,
    isSubmitDisabled,
    handleSubmit,
    resetForm
  }
}
