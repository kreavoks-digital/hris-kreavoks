import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'
import { employeeApi } from '~/pages/employee/api/employee.api'
import { certificateApi } from '../api'
import type { Employee } from '~/types'
import type { CertificateFormData } from '../types'
import { generateCertificatePdf, generateCertificateImage } from '~/lib/pdf/generateCertificate'

export const useCertificateGenerator = () => {
  const interns = ref<Employee[]>([])
  const selectedInternId = ref<string>('')
  const isGenerating = ref(false)
  const isFetchingRecap = ref(false)
  const previewScale = ref(0.85)

  const form = ref<CertificateFormData>({
    serialNumber: '',
    dateOfCompletion: '',
    recipientName: '',
    position: '',
    durationMonths: '',
    statementText: '',
    signatoryName: 'Setiady Ibrahim Anwar',
    signatoryRole: 'Founder of Kreavoks digital agency',
    scores: {
      attendance: 0,
      workPerformance: 0,
      teamWork: 0,
      communication: 0
    },
    customGrade: ''
  })

  const selectedIntern = computed(() => {
    return interns.value.find(i => String(i.id) === selectedInternId.value)
  })

  const autoFinalGrade = computed(() => {
    const sum = form.value.scores.attendance + form.value.scores.workPerformance + form.value.scores.teamWork + form.value.scores.communication
    if (sum === 0) return '-'
    const avg = sum / 4
    if (avg >= 85) return 'A'
    if (avg >= 78) return 'AB'
    if (avg >= 70) return 'B'
    if (avg >= 63) return 'BC'
    if (avg >= 55) return 'C'
    return 'D'
  })

  const buildStatement = (pos?: string, dur?: string | number) => {
    const durStr = dur ? `${dur}-month ` : ''
    const posStr = pos ? ` as a ${pos}` : ''
    return `Successfully completed a ${durStr}internship${posStr} at Kreavoks Digital Agency & Edutech. With following work and skill scores:`
  }

  const updateScore = (field: 'attendance' | 'workPerformance' | 'teamWork' | 'communication', val: any) => {
    const cleanStr = String(val ?? '').replace(/[^0-9]/g, '')
    if (!cleanStr) {
      form.value.scores[field] = 0
      return
    }
    const num = parseInt(cleanStr, 10)
    form.value.scores[field] = Math.max(0, Math.min(100, num))
  }

  const resetStatement = () => {
    form.value.statementText = buildStatement(form.value.position, form.value.durationMonths)
  }

  // Auto-sinkron kalimat deskripsi saat Posisi/Role atau Durasi berubah
  watch(
    () => [form.value.position, form.value.durationMonths],
    ([newPos, newDur]) => {
      form.value.statementText = buildStatement(newPos, newDur)
    }
  )

  const regenerateSerial = async (userId?: number | string | any) => {
    try {
      const validUserId = (typeof userId === 'number' || (typeof userId === 'string' && !isNaN(Number(userId))))
        ? userId
        : (selectedIntern.value?.id ? selectedIntern.value.id : undefined)
      const nextSerial = await certificateApi.getNextSerial('INTERN', validUserId)
      if (nextSerial) {
        form.value.serialNumber = nextSerial
      }
    } catch {
      // Clean fallback format if server is unreachable
      const dateStr = format(new Date(), 'ddMMyy')
      form.value.serialNumber = `KWS-INTRN-${dateStr}-001`
    }
  }

  const resetFormToSample = async () => {
    selectedInternId.value = ''
    form.value = {
      serialNumber: '',
      dateOfCompletion: format(new Date(), 'dd MMMM yyyy', { locale: idLocale }),
      recipientName: '',
      position: '',
      durationMonths: '',
      statementText: '',
      signatoryName: 'Setiady Ibrahim Anwar',
      signatoryRole: 'Founder of Kreavoks digital agency',
      scores: {
        attendance: 0,
        workPerformance: 0,
        teamWork: 0,
        communication: 0
      },
      customGrade: ''
    }
    resetStatement()
    await regenerateSerial()
  }

  const onSelectIntern = async (val: any) => {
    if (!val) return
    const id = String(val)
    const intern = interns.value.find(i => String(i.id) === id)
    if (!intern) return

    form.value.recipientName = intern.name
    form.value.position = intern.position || intern.department || ''

    if (intern.endDate) {
      try {
        form.value.dateOfCompletion = format(new Date(intern.endDate), 'dd MMMM yyyy', { locale: idLocale })
      } catch {
        form.value.dateOfCompletion = format(new Date(), 'dd MMMM yyyy', { locale: idLocale })
      }
    } else {
      form.value.dateOfCompletion = format(new Date(), 'dd MMMM yyyy', { locale: idLocale })
    }

    if (intern.startDate && intern.endDate) {
      try {
        const start = new Date(intern.startDate)
        const end = new Date(intern.endDate)
        const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)))
        form.value.durationMonths = String(months)
      } catch {
        form.value.durationMonths = ''
      }
    }

    // ─── REKAP PRESENSI OTOMATIS DARI BACKEND DATABASE ───
    isFetchingRecap.value = true
    try {
      const recap = await certificateApi.getAttendanceRecap(intern.id)
      if (recap) {
        form.value.scores.attendance = recap.attendanceScore
        toast.success(`Data Intern Dimuat: ${intern.name}`, {
          description: `Nilai kehadiran terhitung ${recap.attendanceScore}% (${recap.presentCount}/${recap.totalWorkingDays} kehadiran)`
        })
      } else {
        toast.success(`Data Intern Dimuat: ${intern.name}`)
      }
    } catch {
      toast.success(`Data Intern Dimuat: ${intern.name}`)
    } finally {
      isFetchingRecap.value = false
    }

    resetStatement()
    await regenerateSerial()
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

  const saveCertificateRecord = async () => {
    try {
      await certificateApi.saveCertificate({
        serialNumber: form.value.serialNumber,
        type: 'INTERN',
        userId: selectedIntern.value?.id ? Number(selectedIntern.value.id) : undefined,
        recipientName: form.value.recipientName,
        position: form.value.position,
        durationMonths: form.value.durationMonths,
        dateOfCompletion: form.value.dateOfCompletion,
        statementText: form.value.statementText,
        signatoryName: form.value.signatoryName,
        signatoryRole: form.value.signatoryRole,
        attendanceScore: form.value.scores.attendance,
        workPerformanceScore: form.value.scores.workPerformance,
        teamWorkScore: form.value.scores.teamWork,
        communicationScore: form.value.scores.communication,
        finalGrade: form.value.customGrade || autoFinalGrade.value
      })
    } catch (err) {
      console.error('Error saving certificate record to database:', err)
    }
  }

  const handleDownloadPdf = async () => {
    isGenerating.value = true
    const toastId = toast.loading('Memproses & mencatat sertifikat ke sistem...')
    try {
      // Auto-record to database
      await saveCertificateRecord()

      const safeName = form.value.recipientName.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `Sertifikat_${safeName}_${form.value.serialNumber}.pdf`
      const result = await generateCertificatePdf('live-intern-certificate', fileName)

      if (result.success) {
        toast.success('Sertifikat Berhasil Diunduh & Dicatat!', { id: toastId, description: fileName })
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
      await saveCertificateRecord()

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

  onMounted(async () => {
    await fetchInterns()
    if (!form.value.serialNumber) {
      await regenerateSerial()
    }
    if (!form.value.dateOfCompletion) {
      form.value.dateOfCompletion = format(new Date(), 'dd MMMM yyyy', { locale: idLocale })
    }
    resetStatement()
  })

  return {
    interns,
    selectedInternId,
    selectedIntern,
    isGenerating,
    isFetchingRecap,
    previewScale,
    form,
    autoFinalGrade,
    resetStatement,
    regenerateSerial,
    resetFormToSample,
    onSelectIntern,
    fetchInterns,
    handleDownloadPdf,
    handleDownloadImage,
    saveCertificateRecord,
    updateScore
  }
}
