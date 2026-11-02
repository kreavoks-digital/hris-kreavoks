import { useCalendarApi } from '../api/calendar.api'
import type { CalendarEventItem, CandidateUser, CreateEventPayload, AttendeeStatus } from '../types/calendar.types'
import { toast } from 'vue-sonner'

import type { DateRangeValue } from '~/components/ui/date-picker'

export const useCalendarEvents = () => {
  const api = useCalendarApi()

  const events = useState<CalendarEventItem[]>('calendar_events_list', () => [])
  const candidates = useState<CandidateUser[]>('calendar_candidates_list', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)

  // Current view navigation
  const currentDate = ref(new Date())
  const selectedEvent = ref<CalendarEventItem | null>(null)
  const selectedDayEvents = ref<CalendarEventItem[]>([])
  const selectedDateRange = ref<DateRangeValue | null>(null)

  // Modals state
  const isCreateModalOpen = ref(false)
  const isDetailModalOpen = ref(false)
  const eventToEdit = ref<CalendarEventItem | null>(null)

  // Filters
  const filterType = ref<string>('ALL')
  const filterView = ref<'all' | 'my'>('all')

  const currentYear = computed(() => currentDate.value.getFullYear())
  const currentMonth = computed(() => currentDate.value.getMonth() + 1)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const currentMonthLabel = computed(() => {
    return `${monthNames[currentDate.value.getMonth()]} ${currentYear.value}`
  })

  const loadEvents = async () => {
    isLoading.value = true
    try {
      const queryParams: any = {
        type: filterType.value === 'ALL' ? undefined : filterType.value,
        view: filterView.value
      }

      if (selectedDateRange.value?.start && selectedDateRange.value?.end) {
        queryParams.startDate = `${selectedDateRange.value.start}T00:00:00.000Z`
        queryParams.endDate = `${selectedDateRange.value.end}T23:59:59.999Z`
      } else {
        queryParams.year = currentYear.value
        queryParams.month = currentMonth.value
      }

      const data = await api.getEvents(queryParams)
      events.value = data
    } catch (err: any) {
      toast.error('Gagal memuat jadwal acara: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isLoading.value = false
    }
  }

  const loadCandidates = async () => {
    try {
      candidates.value = await api.getCandidates()
    } catch (err: any) {
      console.error('Failed to load candidate attendees:', err)
    }
  }

  const prevMonth = () => {
    selectedDateRange.value = null
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() - 1)
    currentDate.value = d
    loadEvents()
  }

  const nextMonth = () => {
    selectedDateRange.value = null
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() + 1)
    currentDate.value = d
    loadEvents()
  }

  const goToToday = () => {
    selectedDateRange.value = null
    currentDate.value = new Date()
    loadEvents()
  }

  const openCreateModal = (datePrefill?: Date) => {
    eventToEdit.value = null
    isCreateModalOpen.value = true
  }

  const openEditModal = (event: CalendarEventItem) => {
    eventToEdit.value = event
    isDetailModalOpen.value = false
    isCreateModalOpen.value = true
  }

  const openDetailModal = async (event: CalendarEventItem, dayEvents?: CalendarEventItem[]) => {
    selectedEvent.value = event
    selectedDayEvents.value = dayEvents || [event]
    isDetailModalOpen.value = true
    // Refresh detail in background for latest RSVPs
    try {
      const full = await api.getEventById(event.id)
      selectedEvent.value = full
    } catch {}
  }

  const submitEvent = async (payload: CreateEventPayload, eventId?: number) => {
    isActionLoading.value = true
    try {
      if (eventId) {
        await api.updateEvent(eventId, payload)
        toast.success('Jadwal acara berhasil diperbarui')
      } else {
        await api.createEvent(payload)
        toast.success('Jadwal acara berhasil dibuat dan undangan terkirim')
      }
      isCreateModalOpen.value = false
      await loadEvents()
    } catch (err: any) {
      toast.error('Gagal menyimpan acara: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isActionLoading.value = false
    }
  }

  const cancelEvent = async (eventId: number) => {
    if (!confirm('Apakah kamu yakin ingin membatalkan dan menghapus agenda ini?')) return

    isActionLoading.value = true
    try {
      await api.deleteEvent(eventId)
      toast.success('Acara berhasil dibatalkan')
      isDetailModalOpen.value = false
      await loadEvents()
    } catch (err: any) {
      toast.error('Gagal membatalkan acara: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isActionLoading.value = false
    }
  }

  const submitRsvp = async (eventId: number, status: AttendeeStatus) => {
    isActionLoading.value = true
    try {
      await api.updateRsvp(eventId, status)
      const label = status === 'ACCEPTED' ? 'Hadir' : status === 'DECLINED' ? 'Tidak Hadir' : 'Ragu-ragu'
      toast.success(`Konfirmasi kehadiran berhasil: ${label}`)
      
      // Update local state
      if (selectedEvent.value && selectedEvent.value.id === eventId) {
        selectedEvent.value.myRsvpStatus = status
        const full = await api.getEventById(eventId)
        selectedEvent.value = full
      }
      await loadEvents()
    } catch (err: any) {
      toast.error('Gagal mengubah status kehadiran: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isActionLoading.value = false
    }
  }

  const openDetailById = async (id: number) => {
    const existing = events.value.find(e => e.id === id)
    if (existing) {
      openDetailModal(existing)
      return
    }

    try {
      const full = await api.getEventById(id)
      if (full) {
        selectedEvent.value = full
        selectedDayEvents.value = [full]
        isDetailModalOpen.value = true

        if (full.startDate) {
          const d = new Date(full.startDate)
          if (
            d.getFullYear() !== currentDate.value.getFullYear() ||
            d.getMonth() !== currentDate.value.getMonth()
          ) {
            currentDate.value = d
            loadEvents()
          }
        }
      }
    } catch (err: any) {
      console.warn('[Calendar] Event with id ' + id + ' not found or inaccessible:', err.message)
    }
  }

  const route = useRoute()

  const checkRouteQueryEvent = async () => {
    const eventIdParam = route.query.eventId || route.query.event
    if (eventIdParam) {
      const id = Number(eventIdParam)
      if (!isNaN(id)) {
        if (route.query.tab === 'notes') {
          navigateTo(`/calendar/edit/${id}?tab=notes`)
          return
        }
        await openDetailById(id)
      }
    }
  }

  watch([filterType, filterView, selectedDateRange], () => {
    loadEvents()
  })

  watch(
    () => route.query.eventId || route.query.event,
    (newVal) => {
      if (newVal) {
        const id = Number(newVal)
        if (!isNaN(id)) {
          openDetailById(id)
        }
      }
    }
  )

  onMounted(async () => {
    await Promise.all([loadEvents(), loadCandidates()])
    await checkRouteQueryEvent()
  })

  return {
    events,
    candidates,
    isLoading,
    isActionLoading,
    currentDate,
    currentYear,
    currentMonth,
    currentMonthLabel,
    selectedEvent,
    selectedDayEvents,
    selectedDateRange,
    isCreateModalOpen,
    isDetailModalOpen,
    eventToEdit,
    filterType,
    filterView,
    loadEvents,
    prevMonth,
    nextMonth,
    goToToday,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDetailById,
    submitEvent,
    cancelEvent,
    submitRsvp
  }
}
