import { ref, reactive, computed } from 'vue'
import { parseDate } from '@internationalized/date'
import { toast } from 'vue-sonner'
import { useRegister } from './useRegister'

export const useRegisterForm = () => {
  const step = ref(1)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const agreedToTerms = ref(false)

  const form = reactive({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    institution: '',
    department: '',
    position: '',
    startDate: '',
    endDate: '',
    agreementFile: '' as File | string,
    password: '',
    confirmPassword: '',
  })

  const startDateValue = computed({
    get: () => form.startDate ? parseDate(form.startDate) : undefined,
    set: (val) => {
      form.startDate = val ? val.toString() : ''
    },
  })

  const endDateValue = computed({
    get: () => form.endDate ? parseDate(form.endDate) : undefined,
    set: (val) => {
      form.endDate = val ? val.toString() : ''
    },
  })

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target?.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 1MB')
        target.value = ''
        return
      }
      form.agreementFile = file
    }
  }

  const agreementFileUrl = computed(() => {
    if (!form.agreementFile) return ''
    if (typeof form.agreementFile === 'string') return form.agreementFile
    return URL.createObjectURL(form.agreementFile)
  })

  const { loading, error, handleRegister: apiRegister } = useRegister()

  const goToStep2 = () => {
    if (!form.fullName.trim()) return
    if (!form.email.trim()) return
    step.value = 2
  }

  const goToStep3 = () => {
    // Basic validation if needed
    step.value = 3
  }

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) return
    if (form.password.length < 8) return
    if (!agreedToTerms.value) return
    if (!form.agreementFile) return // Wajib diisi

    const formData = new FormData()
    formData.append('fullName', form.fullName)
    formData.append('email', form.email)
    formData.append('password', form.password)

    if (form.phone) formData.append('phone', form.phone)
    if (form.address) formData.append('address', form.address)
    if (form.institution) formData.append('institution', form.institution)
    if (form.department) formData.append('department', form.department)
    if (form.position) formData.append('position', form.position)
    if (form.startDate) formData.append('startDate', form.startDate)
    if (form.endDate) formData.append('endDate', form.endDate)
    if (form.agreementFile) formData.append('agreementFile', form.agreementFile)

    await apiRegister(formData)
  }

  return {
    step,
    showPassword,
    showConfirmPassword,
    agreedToTerms,
    form,
    startDateValue,
    endDateValue,
    handleFileChange,
    agreementFileUrl,
    goToStep2,
    goToStep3,
    handleSubmit,
    loading,
    error
  }
}
