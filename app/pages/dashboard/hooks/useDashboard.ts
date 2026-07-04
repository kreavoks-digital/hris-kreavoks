import { CalendarDate } from '@internationalized/date'
import type { DashboardStats, AttendanceLog, CalendarEvent, LogbookEntry } from '../types'

export const useDashboard = () => {
  // Stats matching the design reference
  const stats = ref<DashboardStats>({
    totalHadir: '20 Hari',
    kehadiranRate: '95%',
    tidakHadir: '3 Hari',
    tidakHadirTrend: '+1',
    logbookTerisi: '76%',
    logbookTrend: '+10%',
    sisaMasaKerja: 'Lifetime',
    sisaMasaKerjaLabel: 'Tetap'
  })

  // Attendance Logs
  const attendanceLogs = ref<AttendanceLog[]>([])

  // Calendar State using CalendarDate
  const selectedDateVal = ref<CalendarDate>(new CalendarDate(2024, 11, 29))
  const selectedDate = computed(() => selectedDateVal.value.day)

  const currentMonthYear = computed(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${months[selectedDateVal.value.month - 1]} ${selectedDateVal.value.year}`
  })

  // Logbook entries
  const logbooks = ref<LogbookEntry[]>([])

  // Helper to get dots indicators for calendar date
  const getCustomIndicators = (date: any) => {
    const list: Array<'blue' | 'yellow' | 'green'> = []
    if (!date) return list
    const d = date.day
    const m = date.month
    const y = date.year

    if (m === 11 && y === 2024) {
      // 1. Holidays (Yellow)
      if (d === 10 || d === 24 || d === 3 || d === 17) {
        list.push('yellow')
      }
      // 2. Agendas (Blue)
      if (d === 29 || d === 12 || d === 19 || d === 26) {
        list.push('blue')
      }
    }
    
    // Logbooks indicator for any month based on real data
    const matchLogbook = logbooks.value.find((lb: any) => {
      const parts = lb.tanggal.split(' ')
      return parseInt(parts[0]) === d && parts[1] === currentMonthYear.value.split(' ')[0] && parseInt(parts[2]) === y
    })
    
    if (matchLogbook) {
      list.push('green')
    }

    return list
  }

  // Computed events based on selectedDate
  const selectedDateEvents = computed(() => {
    const d = selectedDateVal.value.day
    const m = selectedDateVal.value.month
    const y = selectedDateVal.value.year
    const list: Array<CalendarEvent> = []

    if (m === 11 && y === 2024) {
      // 1. Holidays (Yellow)
      if (d === 10) {
        list.push({ title: 'Hari Pahlawan', date: '10 Nov 2024', time: 'Hari Libur Nasional', type: 'yellow' })
      } else if (d === 24) {
        list.push({ title: 'Cuti Bersama', date: '24 Nov 2024', time: 'Hari Libur', type: 'yellow' })
      } else if (d === 3 || d === 17) {
        list.push({ title: 'Hari Libur Akhir Pekan', date: `${d} Nov 2024`, time: '', type: 'yellow' })
      }

      // 2. Admin Agendas (Blue)
      if (d === 29) {
        list.push({ title: 'Meeting Tim Develop', date: '29 Nov 2024', time: '19.00 WIB', type: 'blue' })
      } else if (d === 12 || d === 19 || d === 26) {
        list.push({ title: 'Weekly Meeting', date: `${d} Nov 2024`, time: '10.00 WIB', type: 'blue' })
      }
    }

    // 3. User Logbooks (Green)
    const matchingLogbooks = logbooks.value.filter((lb: any) => {
      const parts = lb.tanggal.split(' ')
      return parseInt(parts[0]) === d && parts[1] === currentMonthYear.value.split(' ')[0] && parseInt(parts[2]) === y
    })
    
    matchingLogbooks.forEach((lb: any) => {
      list.push({
        title: `Logbook: ${lb.deskripsi}`,
        date: lb.tanggal,
        time: lb.kendala !== 'Tidak Ada' ? `Kendala: ${lb.kendala}` : 'Tanpa Kendala',
        type: 'green'
      })
    })

    return list
  })

  // Search query for dashboard
  const searchQuery = useState('dashboard_search_query', () => '')

  const updateLogbook = async (id: string, data: { activity?: string; planTomorrow?: string; obstacle?: string; documentLink?: string }) => {
    try {
      const api = useApi()
      await api(`/logbook/${id}`, {
        method: 'PUT',
        body: data
      })
      await fetchLogbooks()
    } catch (err) {
      console.error('Failed to update logbook', err)
      throw err
    }
  }


  // Attendance Clock-in/out State Machine
  // 'not_clocked_in' | 'clocked_in' | 'clocked_out'
  const attendanceState = ref<'not_clocked_in' | 'clocked_in' | 'clocked_out'>('not_clocked_in')
  const attendanceStatus = ref('Silakan melakukan Clock In hari ini')
  const clockInTime = ref('')
  const clockOutTime = ref('')

  // Real-time clock
  const currentTime = ref('')
  let timerInterval: any = null

  const updateRealTimeClock = () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${hh}:${mm}:${ss}`
  }

  const fetchTodayAttendance = async () => {
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
            if (timerInterval) {
              clearInterval(timerInterval)
              timerInterval = null
            }
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

  // Filters for Logbook
  const logbookFilterMonth = ref(0) // Default ke Semua Bulan (0)
  const logbookFilterYear = ref(new Date().getFullYear())

  const fetchLogbooks = async () => {
    try {
      const api = useApi()
      const res: any = await api(`/logbook?month=${logbookFilterMonth.value}&year=${logbookFilterYear.value}`)
      if (res.data) {
        logbooks.value = res.data.map((item: any) => {
          const profile = item.user?.profile;
          const roleText = profile?.position || profile?.department || '-';
          
          return {
            id: item.id.toString(),
            divisi: roleText,
            tanggal: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            deskripsi: item.activity,
            kendala: item.obstacle || 'Tidak Ada'
          }
        })
      }
    } catch (err) {
      console.error('Failed to fetch logbooks', err)
    }
  }

  const fetchStats = async () => {
    try {
      const api = useApi()
      const res: any = await api('/dashboard/stats')
      if (res.data) {
        stats.value = res.data
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  onMounted(() => {
    updateRealTimeClock()
    timerInterval = setInterval(updateRealTimeClock, 1000)

    // Fetch initial data
    fetchTodayAttendance()
    fetchAttendanceHistory()
    fetchLogbooks()
    fetchStats()
  })

  // Watch filter changes
  watch([logbookFilterMonth, logbookFilterYear], () => {
    fetchLogbooks()
  })

  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
  })

  const handleClockIn = async () => {
    try {
      const api = useApi()
      await api('/attendance/clock-in', { method: 'POST' })
      await fetchTodayAttendance()
      await fetchAttendanceHistory()
    } catch (err) {
      console.error('Clock in failed', err)
    }
  }

  const clockOutLogbook = ref({
    activity: '',
    planTomorrow: '',
    obstacle: '',
    documentLink: ''
  })

  const handleClockOut = async (logbookData: any) => {
    try {
      const api = useApi()
      
      // 1. Submit Logbook Data
      await api('/logbook', { 
        method: 'POST',
        body: logbookData
      })

      // 2. Perform Clock Out
      await api('/attendance/clock-out', { method: 'POST' })
      
      await fetchTodayAttendance()
      await fetchAttendanceHistory()
      await fetchLogbooks()

    } catch (err) {
      console.error('Clock out failed', err)
      throw err // Let UI handle error toast if needed
    }
  }

  const clockRangeText = computed(() => {
    return `${clockInTime.value} – ${clockOutTime.value}`
  })

  return {
    stats,
    attendanceLogs,
    selectedDate,
    selectedDateVal,
    currentMonthYear,
    events: selectedDateEvents,
    logbooks,
    logbookFilterMonth,
    logbookFilterYear,
    searchQuery,
    updateLogbook,
    attendanceState,
    attendanceStatus,
    clockInTime,
    clockOutTime,
    clockRangeText,
    currentTime,
    handleClockIn,
    handleClockOut,
    getCustomIndicators
  }
}
