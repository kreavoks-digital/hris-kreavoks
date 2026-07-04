import { absensiApi } from '../api/absensi.api'
import { useAuth } from '~/composables/useAuth'
import type { AttendanceRecord, AttendanceSummary } from '~/types'
import { toast } from 'vue-sonner'

export const useAbsensi = () => {
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

  const fetchAttendance = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await absensiApi.getAttendance(selectedDate.value as string, canViewAll.value)
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
    if (!isAdmin.value) return
    try {
      await absensiApi.deleteAttendance(id)
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
    loading,
    error,
    fetchAttendance,
    getStatusLabel,
    exportAttendance,
    deleteRecord,
    isAdmin,
    canViewAll,
  }
}
