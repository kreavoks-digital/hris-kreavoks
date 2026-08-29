import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'
import { employeeApi } from '~/pages/employee/api/employee.api'
import type { Employee } from '~/types'
import type { CertificateFormData } from '../types'
import { generateCertificatePdf, generateCertificateImage } from '~/lib/pdf/generateCertificate'

export const useCertificateGenerator = () => {
  const interns = ref<Employee[]>([])
  const selectedInternId = ref<string>('')
  const isGenerating = ref(false)
  const previewScale = ref(0.85)

  const generateSerialString = () => {
    const dateStr = format(new Date(), 'ddMMyy')
    const randomNum = Math.floor(100 + Math.random() * 900)
    return `KWS-INTRN-${dateStr}-${randomNum}`
  }

  const form = ref<CertificateFormData>({
    serialNumber: 'KWS-INTRN-011125-004',
    dateOfCompletion: '26 November 2025',
    recipientName: 'Wisnu Adi Pratama',
    position: 'UI/UX Designer',
    durationMonths: '3',
    statementText: '',
    signatoryName: 'Setiady Ibrahim Anwar',
    signatoryRole: 'Founder of Kreavoks digital agency',
    scores: {
      attendance: 95,
      workPerformance: 80,
      teamWork: 85,
      communication: 92
    },
    customGrade: ''
  })

  const selectedIntern = computed(() => {
    return interns.value.find(i => i.id === selectedInternId.value)
  })

  const autoFinalGrade = computed(() => {
    const avg = (form.value.scores.attendance + form.value.scores.workPerformance + form.value.scores.teamWork + form.value.scores.communication) / 4
    if (avg >= 85) return 'A'
    if (avg >= 78) return 'AB'
    if (avg >= 70) return 'B'
    if (avg >= 63) return 'BC'
    if (avg >= 55) return 'C'
    return 'D'
  })

  const resetStatement = () => {
    form.value.statementText = `Successfully completed a ${form.value.durationMonths || 3}-month internship as a ${form.value.position || 'UI/UX Designer'} at Kreavoks Digital Agency & Edutech. With following work and skill scores:`
  }

  const regenerateSerial = () => {
    form.value.serialNumber = generateSerialString()
    toast.success('Nomor Seri Baru Dibuat', { description: form.value.serialNumber })
  }

  const resetFormToSample = () => {
    selectedInternId.value = ''
    form.value = {
      serialNumber: generateSerialString(),
      dateOfCompletion: format(new Date(), 'dd MMMM yyyy', { locale: idLocale }),
      recipientName: 'Wisnu Adi Pratama',
      position: 'UI/UX Designer',
      durationMonths: '3',
      statementText: '',
      signatoryName: 'Setiady Ibrahim Anwar',
      signatoryRole: 'Founder of Kreavoks digital agency',
      scores: {
        attendance: 95,
        workPerformance: 80,
        teamWork: 85,
        communication: 92
      },
      customGrade: ''
    }
    resetStatement()
  }

  const onSelectIntern = (val: any) => {
    if (!val) return
    const id = String(val)
    const intern = interns.value.find(i => String(i.id) === id)
    if (!intern) return

    form.value.recipientName = intern.name
    form.value.position = intern.position || intern.department || 'UI/UX Designer'

    if (intern.endDate) {
      try {
        form.value.dateOfCompletion = format(new Date(intern.endDate), 'dd MMMM yyyy', { locale: idLocale })
      } catch {
        form.value.dateOfCompletion = format(new Date(), 'dd MMMM yyyy', { locale: idLocale })
      }
    }

    if (intern.startDate && intern.endDate) {
      try {
        const start = new Date(intern.startDate)
        const end = new Date(intern.endDate)
        const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)))
        form.value.durationMonths = String(months)
      } catch {
        form.value.durationMonths = '3'
      }
    }

    if (intern.totalWorkingDays && intern.presentCount !== undefined) {
      const attendancePct = Math.min(100, Math.round((intern.presentCount / intern.totalWorkingDays) * 100))
      form.value.scores.attendance = attendancePct > 0 ? attendancePct : 90
    }

    form.value.serialNumber = generateSerialString()
    resetStatement()
    toast.success('Data Intern Berhasil Dimuat', { description: `Form telah diisi untuk ${intern.name}` })
  }

  // Auto-sync when selectedInternId changes
  watch(selectedInternId, (newId) => {
    if (newId) onSelectIntern(newId)
  })

  const fetchInterns = async () => {
    try {
      const response = await employeeApi.getEmployees(1, 100)
      if (response.success && response.data?.employees) {
        interns.value = response.data.employees.filter(
          e => e.role === 'INTERN' || e.status === 'GRADUATE' || e.department?.includes('KDT') || e.department?.includes('KCT')
        )
      }
    } catch (error) {
      console.error('Error fetching interns:', error)
    }
  }

  const handleDownloadPdf = async () => {
    isGenerating.value = true
    const toastId = toast.loading('Memproses dokumen PDF sertifikat...')
    try {
      const safeName = form.value.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `Sertifikat_${safeName}_${form.value.serialNumber}.pdf`
      const result = await generateCertificatePdf('live-intern-certificate', fileName)

      if (result.success) {
        toast.success('Sertifikat Berhasil Diunduh!', { id: toastId, description: fileName })
      } else {
        toast.error('Gagal Mengunduh Sertifikat', { id: toastId, description: result.error })
      }
    } catch {
      toast.error('Terjadi kesalahan saat generate PDF', { id: toastId })
    } finally {
      isGenerating.value = false
    }
  }

  const handleDownloadImage = async () => {
    isGenerating.value = true
    const toastId = toast.loading('Menyiapkan gambar sertifikat...')
    try {
      const safeName = form.value.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `Sertifikat_${safeName}_${form.value.serialNumber}.png`
      const result = await generateCertificateImage('live-intern-certificate', fileName)

      if (result.success) {
        toast.success('Gambar Sertifikat Berhasil Diunduh!', { id: toastId, description: fileName })
      } else {
        toast.error('Gagal Menyimpan Gambar', { id: toastId, description: result.error })
      }
    } catch {
      toast.error('Terjadi kesalahan saat generate gambar', { id: toastId })
    } finally {
      isGenerating.value = false
    }
  }

  return {
    interns,
    selectedInternId,
    selectedIntern,
    isGenerating,
    previewScale,
    form,
    autoFinalGrade,
    resetStatement,
    regenerateSerial,
    resetFormToSample,
    onSelectIntern,
    fetchInterns,
    handleDownloadPdf,
    handleDownloadImage
  }
}
