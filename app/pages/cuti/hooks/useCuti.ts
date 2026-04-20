import { cutiApi } from '../api/cuti.api'
import type { LeaveRecord } from '~/types'

export const useCuti = () => {
  const filterStatus = ref("")
  const filterType = ref("")
  const leaves = ref<LeaveRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const leaveBalance = ref({
    annual: 12,
    used: 3,
  })

  const filteredLeaves = computed(() => {
    let result = leaves.value

    if (filterStatus.value) {
      result = result.filter((leave) => leave.status === filterStatus.value)
    }

    if (filterType.value) {
      result = result.filter((leave) => leave.type === filterType.value)
    }

    return result
  })

  const fetchLeaves = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await cutiApi.getLeaves()
      if (response.success) {
        leaves.value = response.data.leaves
        leaveBalance.value = response.data.balance
      }
    } catch (err: any) {
      console.error("Error fetching leaves:", err)
      error.value = "Gagal mengambil data cuti"
    } finally {
      loading.value = false
    }
  }

  const cancelLeave = async (leaveId: string) => {
    if (confirm("Yakin ingin membatalkan pengajuan cuti?")) {
      try {
        const response = await cutiApi.cancelLeave(leaveId)
        if (response.success) {
          await fetchLeaves()
        } else {
          alert(response.message || "Gagal membatalkan cuti")
        }
      } catch (err: any) {
        console.error("Error canceling leave:", err)
        alert("Terjadi kesalahan sistem")
      }
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      annual: "Cuti Tahunan",
      sick: "Cuti Sakit",
      emergency: "Cuti Darurat",
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      approved: "Disetujui",
      rejected: "Ditolak",
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID")
  }

  return {
    filterStatus,
    filterType,
    leaveBalance,
    filteredLeaves,
    loading,
    error,
    fetchLeaves,
    cancelLeave,
    getLeaveTypeLabel,
    getStatusLabel,
    formatDate,
  }
}
