import { toast } from 'vue-sonner'

export const useDashboardLeaves = () => {
  const isIzinModalOpen = ref(false)
  const leaveForm = ref({
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    proofLink: '',
    isOneDay: false
  })

  const submitIzin = async () => {
    if (leaveForm.value.isOneDay) {
      leaveForm.value.endDate = leaveForm.value.startDate;
    }

    if (!leaveForm.value.type || !leaveForm.value.startDate || !leaveForm.value.endDate || !leaveForm.value.reason) {
      toast.error('Data Belum Lengkap', { description: 'Harap isi Tipe Pengajuan, Tanggal Mulai, Tanggal Selesai, dan Keterangan.' })
      return
    }

    let finalReason = leaveForm.value.reason
    if (leaveForm.value.proofLink) {
      finalReason += `\n\nLink Bukti: ${leaveForm.value.proofLink}`
    }

    const payload = {
      type: leaveForm.value.type,
      startDate: leaveForm.value.startDate,
      endDate: leaveForm.value.endDate,
      reason: finalReason
    };
    
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
    } catch (error) {
      console.error("Error submitting leave:", error)
      toast.error('Pengajuan Gagal', {
        description: 'Terjadi kesalahan saat mengirim pengajuan. Silakan coba lagi.'
      })
    }
  }

  const handleIzin = () => {
    isIzinModalOpen.value = true
  }

  return { isIzinModalOpen, leaveForm, submitIzin, handleIzin }
}
