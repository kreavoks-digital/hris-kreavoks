import { attendanceApi } from '../api/attendance.api'
import { useAuth } from '~/composables/useAuth'
import type { AttendanceRecord, AttendanceSummary } from '~/types'
import { toast } from 'vue-sonner'

export const useAttendance = () => {
  const selectedDate = ref("")
  const searchQuery = ref("")
  const filterStatus = ref("")
  const attendance = ref<AttendanceRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const expandedGroups = ref<Record<string, boolean>>({})

  const auth = useAuth()
  const isAdmin = computed(() => auth.user.value?.role === 'ADMIN')
  const canViewAll = computed(() => auth.user.value?.permissions?.includes('view_all_users_attendance') || isAdmin.value)
  const canManageAttendance = computed(() => auth.user.value?.permissions?.includes('manage_attendance') || isAdmin.value)

  const summary = ref<AttendanceSummary>({
    present: 0,
    permission: 0,
    sick: 0,
    absent: 0,
  })

  const filteredAttendance = computed(() => {
    let result = attendance.value

    if (searchQuery.value) {
      result = result.filter((record) =>
        (record.employeeName || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (record.npk || "").toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    if (filterStatus.value && filterStatus.value !== "none") {
      result = result.filter((record) => record.status === filterStatus.value)
    }

    return result
  })

  const groupedAttendance = computed(() => {
    const groups: Record<string, AttendanceRecord[]> = {}
    filteredAttendance.value.forEach((record) => {
      const key = `${record.npk} - ${record.employeeName}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key]!.push(record)
    })
    return groups
  })

  const toggleGroup = (key: string) => {
    expandedGroups.value[key] = !expandedGroups.value[key]
  }

  const expandedLogbooks = ref<Record<string, boolean>>({})

  const toggleLogbook = (id: string) => {
    expandedLogbooks.value[id] = !expandedLogbooks.value[id]
  }

  const fetchAttendance = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await attendanceApi.getAttendance(selectedDate.value as string, canViewAll.value)
      if (response.success) {
        attendance.value = response.data.records
        summary.value = response.data.summary
      }
    } catch (err: any) {
      error.value = "Gagal mengambil data absensi"
      toast.error("Gagal memuat absensi", {
        description: err?.message || "Terjadi kesalahan saat mengambil data.",
      })
    } finally {
      loading.value = false
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      present: "Hadir",
      permission: "Izin",
      sick: "Sakit",
      absent: "Alfa",
    }
    return labels[status] || status
  }

  // FE-02 FIX: Gunakan toast, bukan alert()
  const exportAttendance = () => {
    toast.info("Fitur export sedang dalam pengembangan", {
      description: "Fitur ini akan segera tersedia.",
    })
  }

  const deleteRecord = async (id: string) => {
    if (!canManageAttendance.value) return
    try {
      await attendanceApi.deleteAttendance(id)
      await fetchAttendance()
      toast.success("Data absensi berhasil dihapus")
    } catch (err: any) {
      toast.error("Gagal menghapus absensi", {
        description: err?.message || "Terjadi kesalahan.",
      })
    }
  }

  watch(selectedDate, () => {
    fetchAttendance()
  })

  const updateLogbook = async (id: string, data: any) => {
    try {
      const api = useApi()
      await api(`/logbook/${id}`, {
        method: 'PUT',
        body: data
      })
      await fetchAttendance()
      toast.success("Logbook berhasil diperbarui")
    } catch (err: any) {
      toast.error("Gagal memperbarui logbook", {
        description: err?.message || "Terjadi kesalahan.",
      })
    }
  }

  const deleteLogbook = async (id: string) => {
    try {
      const api = useApi()
      await api(`/logbook/${id}`, { method: 'DELETE' })
      await fetchAttendance()
      toast.success("Logbook berhasil dihapus")
    } catch (err: any) {
      toast.error("Gagal menghapus logbook", {
        description: err?.message || "Terjadi kesalahan.",
      })
    }
  }

  return {
    selectedDate,
    searchQuery,
    filterStatus,
    attendance,
    summary,
    filteredAttendance,
    groupedAttendance,
    expandedGroups,
    toggleGroup,
    expandedLogbooks,
    toggleLogbook,
    loading,
    error,
    fetchAttendance,
    getStatusLabel,
    exportAttendance,
    deleteRecord,
    updateLogbook,
    deleteLogbook,
    isAdmin,
    canViewAll,
    canManageAttendance
  }
}
