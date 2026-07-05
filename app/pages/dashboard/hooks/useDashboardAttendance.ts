import type { AttendanceLog } from '../types'
import { z } from 'zod'

export const useDashboardAttendance = (
  fetchStats: () => Promise<void>,
  fetchLogbooks: () => Promise<void>
) => {
  const attendanceLogs = ref<AttendanceLog[]>([])
  const attendanceState = ref<'not_clocked_in' | 'clocked_in' | 'clocked_out'>('not_clocked_in')
  const attendanceStatus = ref('Silakan melakukan Clock In hari ini')
  const clockInTime = ref('')
  const clockOutTime = ref('')

  const showClockOutModal = ref(false)
  const clockOutLogbook = ref({
    activity: '',
    planTomorrow: '',
    obstacle: '',
    documentLink: ''
  })

  const logbookSchema = z.object({
    activity: z.string().trim().min(5, "Aktivitas harus diisi minimal 5 karakter"),
    planTomorrow: z.string().trim().min(5, "Rencana harus diisi minimal 5 karakter"),
    obstacle: z.string().optional(),
    documentLink: z.string().url("Link dokumentasi harus berupa URL yang valid (misal: https://drive...)")
  })

  const isClockOutFormValid = computed(() => {
    return logbookSchema.safeParse(clockOutLogbook.value).success
  })

  const formErrors = computed(() => {
    const result = logbookSchema.safeParse(clockOutLogbook.value)
    if (result.success) return {}
    
    const errors: Record<string, string> = {}
    result.error.issues.forEach((issue: any) => {
      if (issue.path[0]) {
        errors[issue.path[0] as string] = issue.message
      }
    })
    return errors
  })

  const fetchTodayAttendance = async (stopClockTimer: () => void) => {
    try {
      const api = useApi()
      const res: any = await api('/attendance/today')
      const data = res.data
      if (data) {
        if (data.clockIn) {
          const inDate = new Date(data.clockIn)
          clockInTime.value = `${String(inDate.getHours()).padStart(2, '0')}:${String(inDate.getMinutes()).padStart(2, '0')}`
          if (data.clockOut) {
            const outDate = new Date(data.clockOut)
            clockOutTime.value = `${String(outDate.getHours()).padStart(2, '0')}:${String(outDate.getMinutes()).padStart(2, '0')}`
            attendanceState.value = 'clocked_out'
            attendanceStatus.value = `Anda sudah pulang <span class="font-semibold text-kv-primary">pukul ${clockOutTime.value} WIB</span>`
            stopClockTimer()
          } else {
            attendanceState.value = 'clocked_in'
            attendanceStatus.value = `Anda sudah masuk <span class="font-semibold text-kv-primary">pukul ${clockInTime.value} WIB</span>`
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch today attendance', err)
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const api = useApi()
      const res: any = await api('/attendance/history')
      if (res.data) {
        attendanceLogs.value = res.data.map((item: any) => ({
          tanggal: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          datang: item.clockIn ? `${String(new Date(item.clockIn).getHours()).padStart(2, '0')}:${String(new Date(item.clockIn).getMinutes()).padStart(2, '0')} WIB` : '-',
          pulang: item.clockOut ? `${String(new Date(item.clockOut).getHours()).padStart(2, '0')}:${String(new Date(item.clockOut).getMinutes()).padStart(2, '0')} WIB` : '-',
        }))
      }
    } catch (err) {
      console.error('Failed to fetch history', err)
    }
  }

  const handleClockIn = async (stopClockTimer: () => void) => {
    try {
      const api = useApi()
      await api('/attendance/clock-in', { method: 'POST' })
      await fetchTodayAttendance(stopClockTimer)
      await fetchAttendanceHistory()
      await fetchStats()
    } catch (err) {
      console.error('Clock in failed', err)
    }
  }

  const handleClockOut = async (stopClockTimer: () => void) => {
    try {
      const api = useApi()
      await api('/logbook', { 
        method: 'POST',
        body: clockOutLogbook.value
      })
      await api('/attendance/clock-out', { method: 'POST' })
      
      await fetchTodayAttendance(stopClockTimer)
      await fetchAttendanceHistory()
      await fetchLogbooks()
      await fetchStats()

      showClockOutModal.value = false
      clockOutLogbook.value = { activity: '', planTomorrow: '', obstacle: '', documentLink: '' }
    } catch (err) {
      console.error('Clock out failed', err)
      throw err 
    }
  }

  const clockRangeText = computed(() => {
    return `${clockInTime.value} – ${clockOutTime.value}`
  })

  return { 
    attendanceLogs, 
    attendanceState, 
    attendanceStatus, 
    clockInTime, 
    clockOutTime, 
    clockRangeText,
    fetchTodayAttendance, 
    fetchAttendanceHistory, 
    handleClockIn, 
    handleClockOut,
    showClockOutModal,
    clockOutLogbook,
    isClockOutFormValid,
    formErrors
  }
}
