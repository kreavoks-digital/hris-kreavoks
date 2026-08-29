import { toast } from 'vue-sonner'
import { leaveSchema } from '~/schemas/leave.schema'

/** Ambil tanggal hari ini dalam format YYYY-MM-DD sesuai WIB (UTC+7) */
const getTodayWib = (): string => {
  const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000)
  return nowWib.toISOString().split('T')[0]!
}

export const useDashboardLeaves = () => {
  const isIzinModalOpen = ref(false)
  const isSubmitting = ref(false)
  const leaveForm = ref({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    proofLink: '',
    isOneDay: false
  })

  /**
   * Watch perubahan isOneDay di dalam composable (best practice: behaviour dekat dengan state).
   * Saat dicentang → auto-isi startDate & endDate = hari ini.
   * Saat dilepas  → reset kedua tanggal agar user memilih ulang.
   */
  watch(
    () => leaveForm.value.isOneDay,
    (isOneDay) => {
      if (isOneDay) {
        const today = getTodayWib()
        leaveForm.value.startDate = today
        leaveForm.value.endDate = today
      } else {
        leaveForm.value.startDate = ''
        leaveForm.value.endDate = ''
      }
    }
  )

  const submitIzin = async () => {
    // Pastikan endDate sinkron saat 1 hari
    if (leaveForm.value.isOneDay && leaveForm.value.startDate) {
      leaveForm.value.endDate = leaveForm.value.startDate
    }

    const validation = leaveSchema.safeParse(leaveForm.value)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Data belum lengkap'
      toast.error('Validasi Gagal', { description: firstError })
      return
    }

    const todayStr = getTodayWib()
    if (String(leaveForm.value.startDate) < todayStr) {
      toast.error('Tanggal Tidak Valid', { description: 'Tanggal mulai izin tidak boleh tanggal yang sudah lewat. Minimal mulai hari ini.' })
      return
    }

    let finalReason = leaveForm.value.reason.trim()
    if (leaveForm.value.proofLink?.trim()) {
      finalReason += `\n\nLink Bukti: ${leaveForm.value.proofLink.trim()}`
    }

    const payload = {
      type: leaveForm.value.type,
      startDate: leaveForm.value.startDate,
      endDate: leaveForm.value.endDate,
      reason: finalReason
    };
    
    isSubmitting.value = true
    try {
      const api = useApi();
      await api('/leaves', {
        method: 'POST',
        body: payload
      });
      toast.success('Pengajuan Berhasil', {
        description: 'Pengajuan izin/cuti Anda telah terkirim dan menunggu persetujuan HRD.'
      })
      leaveForm.value = { type: '', startDate: '', endDate: '', reason: '', proofLink: '', isOneDay: false }
      isIzinModalOpen.value = false
    } catch (error: any) {
      console.error("Error submitting leave:", error)
      toast.error('Pengajuan Gagal', {
        description: error?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.'
      })
    } finally {
      isSubmitting.value = false
    }
  }

  const handleIzin = () => {
    isIzinModalOpen.value = true
  }

  return { isIzinModalOpen, isLeaveSubmitting: isSubmitting, leaveForm, submitIzin, handleIzin }
}
