import type { TabItem, DropdownMenuItem } from '@kreavoks/kreaui'
import type { DateRangeValue } from '~/components/ui/date-picker'
import type { CalendarEventItem } from '../types/calendar.types'
import type { CalendarGridDay } from '../components/CalendarMonthView.vue'

export const useCalendarPage = (
  events: Ref<CalendarEventItem[]>,
  currentYear: ComputedRef<number>,
  currentMonth: ComputedRef<number>,
  currentDate: Ref<Date>,
  selectedDateRange: Ref<DateRangeValue | null>,
  openDetailModal: (event: CalendarEventItem, dayEvents?: CalendarEventItem[]) => Promise<void>
) => {
  const currentViewMode = ref<string>('month')

  const viewModeOptions: DropdownMenuItem[] = [
    { id: 'month', label: 'Bulan (Grid)' },
    { id: 'day', label: 'Hari (Timeline)' },
    { id: 'agenda', label: 'Jadwal (List)' }
  ]

  const currentViewModeLabel = computed(() => {
    if (currentViewMode.value === 'day') return 'Hari'
    if (currentViewMode.value === 'agenda') return 'Jadwal'
    return 'Bulan'
  })

  const viewTabs: TabItem[] = [
    { id: 'all', label: 'Semua Agenda' },
    { id: 'my', label: 'Agenda Saya' }
  ]

  const pad = (n: number) => String(n).padStart(2, '0')

  const getIsoDateStr = (date: Date) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  const isEventMatchingDate = (e: CalendarEventItem, targetDate: Date, targetDateStr: string): boolean => {
    const evDate = new Date(e.startDate)
    const evDateStr = `${evDate.getFullYear()}-${pad(evDate.getMonth() + 1)}-${pad(evDate.getDate())}`

    // Exact date match (single event or original start date)
    if (evDateStr === targetDateStr) return true

    // If target date is before the event start date, it cannot match
    if (targetDateStr < evDateStr) return false

    // Check if recurrence is configured
    if (!e.recurrence || e.recurrence.type === 'DOES_NOT_REPEAT') {
      // Check multi-day non-recurring event
      if (e.endDate) {
        const endD = new Date(e.endDate)
        const endDStr = `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}`
        return targetDateStr >= evDateStr && targetDateStr <= endDStr
      }
      return false
    }

    // Check end condition if specified
    const recEndDateStr = e.recurrence.endDate ? e.recurrence.endDate.slice(0, 10) : ''
    if (recEndDateStr && targetDateStr > recEndDateStr) {
      return false
    }

    const type = e.recurrence.type

    if (type === 'DAILY') {
      return true
    }

    if (type === 'EVERY_WEEKDAY') {
      const day = targetDate.getDay() // 0 = Sunday, 1 = Monday ... 5 = Friday, 6 = Saturday
      return day >= 1 && day <= 5
    }

    if (type === 'WEEKLY') {
      const targetDay = targetDate.getDay()
      if (e.recurrence.daysOfWeek && e.recurrence.daysOfWeek.length > 0) {
        return e.recurrence.daysOfWeek.includes(targetDay)
      }
      return targetDay === evDate.getDay()
    }

    if (type === 'MONTHLY') {
      // If specific dates in month are configured (e.g. [1, 15, 28] - "tiap tanggal berapa aja")
      if (e.recurrence.daysOfMonth && e.recurrence.daysOfMonth.length > 0) {
        return e.recurrence.daysOfMonth.includes(targetDate.getDate())
      }
      return targetDate.getDate() === evDate.getDate()
    }

    if (type === 'YEARLY') {
      return (
        targetDate.getMonth() === evDate.getMonth() &&
        targetDate.getDate() === evDate.getDate()
      )
    }

    if (type === 'CUSTOM') {
      if (e.recurrence.unit === 'DAY') {
        const interval = Math.max(1, e.recurrence.interval || 1)
        const diffTime = targetDate.getTime() - evDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays % interval === 0
      }
      if (e.recurrence.unit === 'WEEK') {
        const targetDay = targetDate.getDay()
        if (e.recurrence.daysOfWeek && e.recurrence.daysOfWeek.length > 0) {
          if (!e.recurrence.daysOfWeek.includes(targetDay)) return false
        } else if (targetDay !== evDate.getDay()) {
          return false
        }
        return true
      }
      if (e.recurrence.unit === 'MONTH') {
        if (e.recurrence.daysOfMonth && e.recurrence.daysOfMonth.length > 0) {
          return e.recurrence.daysOfMonth.includes(targetDate.getDate())
        }
        return targetDate.getDate() === evDate.getDate()
      }
      return true
    }

    return false
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    return events.value.filter(e => isEventMatchingDate(e, date, dateStr))
  }

  const isInSelectedRange = (d: Date) => {
    if (!selectedDateRange.value?.start || !selectedDateRange.value?.end) return false
    const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    return dStr >= selectedDateRange.value.start && dStr <= selectedDateRange.value.end
  }

  const onDateRangeChange = (val: DateRangeValue | null) => {
    if (val?.start) {
      const [y, m] = val.start.split('-').map(Number)
      if (y && m) {
        currentDate.value = new Date(y, m - 1, 1)
      }
    }
  }

  const calendarGridDays = computed<CalendarGridDay[]>(() => {
    const y = currentYear.value
    const m = currentMonth.value - 1
    const firstDayOfMonth = new Date(y, m, 1)
    const lastDayOfMonth = new Date(y, m + 1, 0)

    let dayOfWeek = firstDayOfMonth.getDay()
    let offset = (dayOfWeek + 6) % 7

    const days: CalendarGridDay[] = []
    const today = new Date()
    const todayDateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

    const prevMonthLastDate = new Date(y, m, 0).getDate()
    for (let i = offset - 1; i >= 0; i--) {
      const d = new Date(y, m - 1, prevMonthLastDate - i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        events: getEventsForDate(d)
      })
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(y, m, i)
      const isToday = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayDateStr
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        events: getEventsForDate(d)
      })
    }

    const remainingCells = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(y, m + 1, i)
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        events: getEventsForDate(d)
      })
    }

    return days
  })

  const activeMobileDate = ref(new Date())
  const isMiniMonthExpanded = ref(false)
  const timelineHours = Array.from({ length: 18 }, (_, i) => i + 6)

  const currentTime = ref(new Date())
  let timeInterval: any = null

  onMounted(() => {
    timeInterval = setInterval(() => {
      currentTime.value = new Date()
    }, 60000)
  })

  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval)
  })

  const currentHour = computed(() => currentTime.value.getHours())
  const currentMinutes = computed(() => currentTime.value.getMinutes())

  const isTodayDate = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getDayShortName = (date: Date): string => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    return days[date.getDay()] ?? 'Sen'
  }

  const formatHourLabel = (h: number) => {
    return `${pad(h)}.00`
  }

  const activeMobileDateStr = computed(() => {
    return getIsoDateStr(activeMobileDate.value)
  })

  const activeMobileDateLabel = computed(() => {
    const d = activeMobileDate.value
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
  })

  const activeMobileEvents = computed(() => {
    return getEventsForDate(activeMobileDate.value)
  })

  const activeDayTimelineEvents = computed(() => {
    return getEventsForDate(activeMobileDate.value)
  })

  const dayAllDayEvents = computed(() => {
    return activeDayTimelineEvents.value.filter(e => e.isAllDay)
  })

  const getEventsForHour = (date: Date, hour: number) => {
    const dEvents = getEventsForDate(date)
    return dEvents.filter(e => {
      if (e.isAllDay) return false
      const start = new Date(e.startDate)
      return start.getHours() === hour
    })
  }

  const handleSlotClick = (hour: number) => {
    const dateStr = getIsoDateStr(activeMobileDate.value)
    const timeStr = `${pad(hour)}:00`
    navigateTo(`/calendar/create?date=${dateStr}&time=${timeStr}`)
  }

  const currentWeekDays = computed(() => {
    const curr = new Date(activeMobileDate.value)
    const day = curr.getDay()
    const diff = (day + 6) % 7
    const monday = new Date(curr)
    monday.setDate(curr.getDate() - diff)

    const week = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      week.push({
        date: d,
        dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()] ?? 'Sen',
        dayNumber: d.getDate(),
        isToday: isTodayDate(d),
        isSelected: getIsoDateStr(d) === activeMobileDateStr.value,
        hasEvents: getEventsForDate(d).length > 0
      })
    }
    return week
  })

  const miniCalendarDays = computed(() => {
    const y = activeMobileDate.value.getFullYear()
    const m = activeMobileDate.value.getMonth()
    const lastDay = new Date(y, m + 1, 0).getDate()
    const days = []
    for (let i = 1; i <= lastDay; i++) {
      const d = new Date(y, m, i)
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isTodayDate(d),
        isSelected: getIsoDateStr(d) === activeMobileDateStr.value,
        hasEvents: getEventsForDate(d).length > 0
      })
    }
    return days
  })

  const agendaGroupedEvents = computed(() => {
    const y = currentYear.value
    const m = currentMonth.value - 1
    const lastDayOfMonth = new Date(y, m + 1, 0).getDate()
    const groups: { dateStr: string; date: Date; events: CalendarEventItem[] }[] = []

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const d = new Date(y, m, day)
      const dayEvs = getEventsForDate(d)
      if (dayEvs.length > 0) {
        groups.push({
          dateStr: getIsoDateStr(d),
          date: d,
          events: dayEvs
        })
      }
    }

    return groups
  })

  const formatGroupDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    if (isTodayDate(date)) {
      return `Hari Ini - ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
    }
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
  }

  const formatEventTime = (ev: CalendarEventItem) => {
    if (ev.isAllDay) return 'Sepanjang hari'
    const start = new Date(ev.startDate)
    const sStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`
    if (!ev.endDate) return `${sStr} WIB`
    const end = new Date(ev.endDate)
    return `${sStr} - ${pad(end.getHours())}:${pad(end.getMinutes())} WIB`
  }

  const handleDayClick = (day: CalendarGridDay) => {
    activeMobileDate.value = day.date

    if (day.events.length > 0 && day.events[0]) {
      openDetailModal(day.events[0], day.events)
      return
    }

    const dateStr = `${day.date.getFullYear()}-${pad(day.date.getMonth() + 1)}-${pad(day.date.getDate())}`
    navigateTo(`/calendar/create?date=${dateStr}`)
  }

  return {
    currentViewMode,
    viewModeOptions,
    currentViewModeLabel,
    viewTabs,
    calendarGridDays,
    activeMobileDate,
    isMiniMonthExpanded,
    timelineHours,
    currentHour,
    currentMinutes,
    activeMobileDateStr,
    activeMobileDateLabel,
    activeMobileEvents,
    activeDayTimelineEvents,
    dayAllDayEvents,
    currentWeekDays,
    miniCalendarDays,
    agendaGroupedEvents,
    isInSelectedRange,
    onDateRangeChange,
    getIsoDateStr,
    getEventsForHour,
    isTodayDate,
    getDayShortName,
    formatHourLabel,
    formatGroupDate,
    formatEventTime,
    handleDayClick,
    handleSlotClick
  }
}
