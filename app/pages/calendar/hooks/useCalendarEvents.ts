import { useCalendarApi } from '../api/calendar.api'
import type { CalendarEventItem, CandidateUser, CreateEventPayload, AttendeeStatus } from '../types/calendar.types'
import { toast } from 'vue-sonner'

export const useCalendarEvents = () => {
  const api = useCalendarApi()

  const events = useState<CalendarEventItem[]>('calendar_events_list', () => [])
  const candidates = useState<CandidateUser[]>('calendar_candidates_list', () => [])
  const isLoading = ref(false)
  const isActionLoading = ref(false)

  // Current view navigation
  const currentDate = ref(new Date())
  const selectedEvent = ref<CalendarEventItem | null>(null)

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
      const data = await api.getEvents({
        year: currentYear.value,
        month: currentMonth.value,
        type: filterType.value === 'ALL' ? undefined : filterType.value,
        view: filterView.value
      })
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
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() - 1)
    currentDate.value = d
    loadEvents()
  }

  const nextMonth = () => {
    const d = new Date(currentDate.value)
    d.setMonth(d.getMonth() + 1)
    currentDate.value = d
    loadEvents()
  }

  const goToToday = () => {
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

  const openDetailModal = async (event: CalendarEventItem) => {
    selectedEvent.value = event
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

  watch([filterType, filterView], () => {
    loadEvents()
  })

  onMounted(() => {
    loadEvents()
    loadCandidates()
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
    submitEvent,
    cancelEvent,
    submitRsvp
  }
}
