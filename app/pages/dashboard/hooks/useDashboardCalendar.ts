import type { CalendarEvent, LogbookEntry } from '../types'

interface SimpleDate {
  year: number
  month: number
  day: number
  iso: string
}

function makeDateObj(year: number, month: number, day: number): SimpleDate {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return { year, month, day, iso: `${year}-${mm}-${dd}` }
}

export const useDashboardCalendar = (logbooks: Ref<LogbookEntry[]>) => {
  const now = new Date()
  const selectedDateVal = ref<SimpleDate>(makeDateObj(now.getFullYear(), now.getMonth() + 1, now.getDate()))

  const selectedDate = computed(() => selectedDateVal.value.day)

  const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const currentMonthYear = computed(() => {
    return `${MONTHS_ID[selectedDateVal.value.month - 1]} ${selectedDateVal.value.year}`
  })

  const holidays = ref<Record<string, string>>({})
  const fetchedYears = ref<Set<number>>(new Set())

  const fetchHolidaysForYear = async (year: number) => {
    if (fetchedYears.value.has(year)) return
    try {
      const currentSystemYear = new Date().getFullYear()
      const endpoint = year === currentSystemYear
        ? 'https://libur.deno.dev/api'
        : `https://libur.deno.dev/api?year=${year}`

      const response = await $fetch<any[]>(endpoint)

      if (response && Array.isArray(response)) {
        const updated = { ...holidays.value }
        response.forEach((h: any) => {
          updated[h.date] = h.name
        })
        holidays.value = updated
        fetchedYears.value = new Set([...fetchedYears.value, year])
      }
    } catch (e) {
      console.error(`Failed to fetch holidays for ${year}:`, e)
    }
  }

  onMounted(() => {
    fetchHolidaysForYear(selectedDateVal.value.year)
  })

  // When selected year changes, fetch holidays for that year
  watch(() => selectedDateVal.value.year, (newYear) => {
    fetchHolidaysForYear(newYear)
  })

  const getCustomIndicators = (date: SimpleDate) => {
    const list: Array<'blue' | 'yellow' | 'green'> = []
    if (!date) return list

    if (holidays.value[date.iso]) {
      list.push('yellow')
    }

    const monthName = MONTHS_ID[date.month - 1]
    const matchLogbook = logbooks.value.find((lb: any) => {
      const parts = lb.tanggal.split(' ')
      return parseInt(parts[0]) === date.day && parts[1] === monthName && parseInt(parts[2]) === date.year
    })

    if (matchLogbook) {
      list.push('green')
    }

    return list
  }

  const selectedDateEvents = computed(() => {
    const { day: d, month: m, year: y, iso } = selectedDateVal.value
    const list: Array<CalendarEvent> = []

    const holidayTitle = holidays.value[iso]
    if (holidayTitle) {
      list.push({
        title: holidayTitle,
        date: `${d} ${MONTHS_ID[m - 1]} ${y}`,
        time: 'Hari Libur Nasional / Cuti Bersama',
        type: 'yellow'
      })
    }

    const monthName = MONTHS_ID[m - 1]
    const matchingLogbooks = logbooks.value.filter((lb: any) => {
      const parts = lb.tanggal.split(' ')
      return parseInt(parts[0]) === d && parts[1] === monthName && parseInt(parts[2]) === y
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

  return {
    selectedDate,
    selectedDateVal,
    currentMonthYear,
    events: selectedDateEvents,
    getCustomIndicators,
    holidays
  }
}
