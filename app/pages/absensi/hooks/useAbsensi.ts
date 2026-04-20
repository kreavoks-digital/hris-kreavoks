import { absensiApi } from '../api/absensi.api'
import type { AttendanceRecord, AttendanceSummary } from '~/types'

export const useAbsensi = () => {
  const selectedDate = ref(new Date().toISOString().split("T")[0])
  const searchQuery = ref("")
  const filterStatus = ref("")
  const attendance = ref<AttendanceRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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
        record.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        record.nik.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }

    if (filterStatus.value) {
      result = result.filter((record) => record.status === filterStatus.value)
    }

    return result
  })

  const fetchAttendance = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await absensiApi.getAttendance(selectedDate.value as string)
      if (response.success) {
        attendance.value = response.data.records
        summary.value = response.data.summary
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err)
      error.value = "Gagal mengambil data absensi"
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

  const exportAttendance = () => {
    alert("Fitur export akan segera tersedia")
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
    loading,
    error,
    fetchAttendance,
    getStatusLabel,
    exportAttendance,
  }
}
