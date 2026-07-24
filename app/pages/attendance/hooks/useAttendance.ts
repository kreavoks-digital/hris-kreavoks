import { attendanceApi } from '../api/attendance.api'
import { useAuth } from '~/composables/useAuth'
import type { AttendanceRecord, AttendanceSummary } from '~/types'
import { toast } from 'vue-sonner'

export const useAttendance = () => {
  const selectedDate = ref("")
  const searchQuery = ref("")
  const filterStatus = ref("none")
  const attendance = ref<AttendanceRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const limit = ref(15)
  const totalItems = ref(0)
  const totalPages = ref(1)

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

  const isServerPaginated = ref(false)

  const allUserGroups = computed(() => {
    let result = attendance.value
    if (!isServerPaginated.value) {
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(r => r.employeeName.toLowerCase().includes(q) || r.npk.toLowerCase().includes(q))
      }
      if (filterStatus.value && filterStatus.value !== 'none') {
        result = result.filter(r => r.status === filterStatus.value)
      }
    }

    const groups: Record<string, AttendanceRecord[]> = {}
    result.forEach((record) => {
      const key = `${record.npk} - ${record.employeeName}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key]!.push(record)
    })
    return groups
  })

  const groupedAttendance = computed(() => {
    const keys = Object.keys(allUserGroups.value)
    if (isServerPaginated.value) {
      return allUserGroups.value
    }
    const start = (page.value - 1) * limit.value
    const end = start + limit.value
    const pageKeys = keys.slice(start, end)

    const paginatedGroups: Record<string, AttendanceRecord[]> = {}
    pageKeys.forEach((key) => {
      paginatedGroups[key] = allUserGroups.value[key]!
    })
    return paginatedGroups
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
      const response = await attendanceApi.getAttendance(
        selectedDate.value as string, 
        canViewAll.value, 
        1, 
        10000,
        searchQuery.value,
        filterStatus.value
      )
      if (response.success) {
        attendance.value = response.data.records
        summary.value = response.data.summary
        
        if (response.data.pagination) {
          isServerPaginated.value = true
          totalItems.value = response.data.pagination.totalItems
          totalPages.value = response.data.pagination.totalPages
        } else {
          isServerPaginated.value = false
          const totalUsers = Object.keys(allUserGroups.value).length
          totalItems.value = totalUsers
          totalPages.value = Math.max(1, Math.ceil(totalUsers / limit.value))
        }
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

  const forgiveAttendance = async (id: string) => {
    if (!canManageAttendance.value) return
    try {
      const defaultClockOut = new Date()
      defaultClockOut.setHours(17, 0, 0, 0)
      
      await attendanceApi.updateAttendance(id, {
        clockOut: defaultClockOut,
        notes: "Lupa clock out (Dikoreksi Admin)"
      })
      await fetchAttendance()
      toast.success("Data absensi berhasil dikoreksi", {
        description: "Jam keluar telah diisi otomatis dan catatan ditambahkan."
      })
    } catch (err: any) {
      toast.error("Gagal mengoreksi absensi", {
        description: err?.message || "Terjadi kesalahan.",
      })
    }
  }

  let debounceTimeout: any
  watch([selectedDate, filterStatus], () => {
    page.value = 1
    fetchAttendance()
  })

  watch(page, () => {
    if (isServerPaginated.value) {
      fetchAttendance()
    }
  })

  watch(searchQuery, () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      page.value = 1
      fetchAttendance()
    }, 300)
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
    groupedAttendance,
    expandedGroups,
    toggleGroup,
    expandedLogbooks,
    toggleLogbook,
    loading,
    error,
    page,
    limit,
    totalItems,
    totalPages,
    fetchAttendance,
    getStatusLabel,
    exportAttendance,
    deleteRecord,
    forgiveAttendance,
    updateLogbook,
    deleteLogbook,
    isAdmin,
    canViewAll,
    canManageAttendance
  }
}
