import { useDashboardStats } from './useDashboardStats'
import { useDashboardLogbook } from './useDashboardLogbook'
import { useDashboardAttendance } from './useDashboardAttendance'
import { useDashboardCalendar } from './useDashboardCalendar'
import { useDashboardLeaves } from './useDashboardLeaves'
import { useDashboardClock } from './useDashboardClock'

export const useDashboard = () => {
  const { stats, fetchStats } = useDashboardStats()
  const { logbooks, logbookFilterMonth, logbookFilterYear, fetchLogbooks, updateLogbook } = useDashboardLogbook()
  const { currentTime, stopClockTimer } = useDashboardClock()
  const { 
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
    formErrors,
    isSubmitting
  } = useDashboardAttendance(fetchStats, fetchLogbooks)
  
  const { selectedDate, selectedDateVal, currentMonthYear, events, getCustomIndicators, holidays } = useDashboardCalendar(logbooks)
  const { isIzinModalOpen, leaveForm, submitIzin, handleIzin } = useDashboardLeaves()

  const searchQuery = useState('dashboard_search_query', () => '')
  const isLoading = ref(true)

  onMounted(async () => {
    isLoading.value = true
    await Promise.allSettled([
      fetchTodayAttendance(stopClockTimer),
      fetchAttendanceHistory(),
      fetchLogbooks(),
      fetchStats()
    ])
    isLoading.value = false
  })

  watch([logbookFilterMonth, logbookFilterYear], () => {
    fetchLogbooks()
  })

  // Wrappers to pass stopClockTimer dependency 
  const _handleClockIn = () => handleClockIn(stopClockTimer)
  const _handleClockOut = () => handleClockOut(stopClockTimer)

  return {
    isLoading,
    stats,
    attendanceLogs,
    selectedDate,
    selectedDateVal,
    currentMonthYear,
    events,
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
    handleClockIn: _handleClockIn,
    handleClockOut: _handleClockOut,
    handleIzin,
    submitIzin,
    getCustomIndicators,
    showClockOutModal,
    clockOutLogbook,
    isClockOutFormValid,
    formErrors,
    isIzinModalOpen,
    leaveForm,
    holidays,
    isSubmitting
  }
}
