import { leaveApi } from '../api/leave.api'
import type { LeaveRecord } from '~/types'

export const useLeave = () => {
  const filterStatus = ref("none")
  const filterType = ref("none")
  const leaves = ref<LeaveRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const leaveBalance = ref({
    annual: 12,
    used: 3,
  })

  const filteredLeaves = computed(() => {
    let result = leaves.value

    if (filterStatus.value && filterStatus.value !== "none") {
      result = result.filter((leave) => leave.status === filterStatus.value)
    }

    if (filterType.value) {
      result = result.filter((leave) => leave.type === filterType.value)
    }

    return result
  })

  const fetchLeaves = async () => {
    // Mencegah double fetch (deduplikasi request)
    if (loading.value) return

    loading.value = true
    error.value = null
    try {
      const response = await leaveApi.getLeaves()
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
        const response = await leaveApi.cancelLeave(leaveId)
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

  const updateLeaveStatus = async (leaveId: string, status: string) => {
    try {
      const response = await leaveApi.updateLeaveStatus(leaveId, status)
      if (response.success) {
        await fetchLeaves()
      } else {
        alert(response.message || "Gagal memperbarui status cuti")
      }
    } catch (err: any) {
      console.error("Error updating leave status:", err)
      alert("Terjadi kesalahan sistem")
    }
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
    updateLeaveStatus,
    getLeaveTypeLabel,
    getStatusLabel,
    formatDate,
  }
}
