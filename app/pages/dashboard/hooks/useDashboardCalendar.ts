import { CalendarDate } from '@internationalized/date'
import type { CalendarEvent, LogbookEntry } from '../types'

export const useDashboardCalendar = (logbooks: Ref<LogbookEntry[]>) => {
  const selectedDateVal = ref<CalendarDate>(new CalendarDate(2024, 11, 29))
  const selectedDate = computed(() => selectedDateVal.value.day)

  const currentMonthYear = computed(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${months[selectedDateVal.value.month - 1]} ${selectedDateVal.value.year}`
  })

  const getCustomIndicators = (date: any) => {
    const list: Array<'blue' | 'yellow' | 'green'> = []
    if (!date) return list
    const d = date.day
    const m = date.month
    const y = date.year

    if (m === 11 && y === 2024) {
      if (d === 10 || d === 24 || d === 3 || d === 17) {
        list.push('yellow')
      }
      if (d === 29 || d === 12 || d === 19 || d === 26) {
        list.push('blue')
      }
    }
    
    const matchLogbook = logbooks.value.find((lb: any) => {
      const parts = lb.tanggal.split(' ')
      return parseInt(parts[0]) === d && parts[1] === currentMonthYear.value.split(' ')[0] && parseInt(parts[2]) === y
    })
    
    if (matchLogbook) {
      list.push('green')
    }

    return list
  }

  const selectedDateEvents = computed(() => {
    const d = selectedDateVal.value.day
    const m = selectedDateVal.value.month
    const y = selectedDateVal.value.year
    const list: Array<CalendarEvent> = []

    if (m === 11 && y === 2024) {
      if (d === 10) {
        list.push({ title: 'Hari Pahlawan', date: '10 Nov 2024', time: 'Hari Libur Nasional', type: 'yellow' })
      } else if (d === 24) {
        list.push({ title: 'Cuti Bersama', date: '24 Nov 2024', time: 'Hari Libur', type: 'yellow' })
      } else if (d === 3 || d === 17) {
        list.push({ title: 'Hari Libur Akhir Pekan', date: `${d} Nov 2024`, time: '', type: 'yellow' })
      }
      if (d === 29) {
        list.push({ title: 'Meeting Tim Develop', date: '29 Nov 2024', time: '19.00 WIB', type: 'blue' })
      } else if (d === 12 || d === 19 || d === 26) {
        list.push({ title: 'Weekly Meeting', date: `${d} Nov 2024`, time: '10.00 WIB', type: 'blue' })
      }
    }

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

  return { selectedDate, selectedDateVal, currentMonthYear, events: selectedDateEvents, getCustomIndicators }
}
