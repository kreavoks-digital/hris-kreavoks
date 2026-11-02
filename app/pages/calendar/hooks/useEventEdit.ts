import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute, navigateTo, useState } from '#imports'
import { useDebounceFn } from '@vueuse/core'
import { Calendar, FileText } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useCalendarApi } from '../api/calendar.api'
import type { TabItem } from '@kreavoks/kreaui'
import type {
  CandidateUser,
  CreateEventPayload,
  EventType,
  CalendarEventItem,
  NotesVisibility
} from '../types/calendar.types'
import type { ActiveViewer } from '../components/EventHeaderViewers.vue'

export const useEventEdit = () => {
  const router = useRouter()
  const route = useRoute()
  const calendarApi = useCalendarApi()
  const { user } = useAuth()

  const eventId = computed(() => Number(route.params.id))
  const isSidebarCollapsed = useState<boolean>('sidebar_is_collapsed', () => false)

  // Modals & Action Loaders
  const showDeleteConfirm = ref(false)
  const showShareModal = ref(false)
  const isDeleting = ref(false)
  const isSubmitting = ref(false)
  const isLoadingData = ref(true)
  const isInitialLoaded = ref(false)

  // Active Tab
  const currentTab = ref(route.query.tab === 'notes' ? 'notes' : 'detail')
  const rawEventData = ref<CalendarEventItem | null>(null)

  // Candidate Users & Selection
  const candidates = ref<CandidateUser[]>([])
  const isLoadingCandidates = ref(false)
  const searchQuery = ref('')
  const selectedAttendeeIds = ref<number[]>([])
  const activeRolePreset = ref<'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN' | null>(null)
  const displayLimit = ref(30)

  // Notes state
  const notesContent = ref('')
  const notesVisibility = ref<NotesVisibility>('ATTENDEES_VIEW')
  const isSavingNotes = ref(false)
  const autoSaveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Date & Time pickers
  const startDateOnly = ref('')
  const startTimeOnly = ref('09:00')
  const endDateOnly = ref('')
  const endTimeOnly = ref('10:00')

  // Form State
  const form = ref<CreateEventPayload>({
    title: '',
    description: '',
    type: 'MEETING' as EventType,
    location: '',
    eventUrl: '',
    startDate: '',
    endDate: undefined,
    isAllDay: false,
    color: '#4082E6'
  })

  // Constants
  const eventTypeOptions: Array<{ value: EventType; label: string }> = [
    { value: 'MEETING', label: 'Meeting' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'PROJECT_DEADLINE', label: 'Batas Waktu Proyek' },
    { value: 'TASK', label: 'Tugas' },
    { value: 'COMPANY_EVENT', label: 'Acara Kantor' },
    { value: 'OTHER', label: 'Lainnya' }
  ]

  const presetColors = [
    { value: '#4082E6', label: 'Biru' },
    { value: '#10B981', label: 'Hijau' },
    { value: '#8B5CF6', label: 'Ungu' },
    { value: '#F59E0B', label: 'Kuning' },
    { value: '#EF4444', label: 'Merah' },
    { value: '#6366F1', label: 'Indigo' }
  ]

  const durationPresets = [
    { label: '30 menit', minutes: 30 },
    { label: '45 menit', minutes: 45 },
    { label: '1 jam', minutes: 60 },
    { label: '2 jam', minutes: 120 }
  ]

  // Permissions
  const isOrganizerOrAdmin = computed(() => {
    if (!rawEventData.value || !user.value) return false
    const roleName = user.value.role?.name || user.value.role
    return roleName === 'ADMIN' || roleName === 'SUPERADMIN' || rawEventData.value.createdById === user.value.id
  })

  const isAccessDenied = computed(() => {
    if (isLoadingData.value || !rawEventData.value) return false
    return !isOrganizerOrAdmin.value && notesVisibility.value === 'ORGANIZER_ONLY'
  })

  const tabsList = computed<TabItem[]>(() => {
    const tabs: TabItem[] = []
    if (isOrganizerOrAdmin.value) {
      tabs.push({ id: 'detail', label: 'Detail Agenda', icon: Calendar })
    }
    if (isOrganizerOrAdmin.value || notesVisibility.value !== 'ORGANIZER_ONLY') {
      tabs.push({ id: 'notes', label: 'Notes', icon: FileText })
    }
    return tabs
  })

  const canEditNotes = computed(() => {
    if (isOrganizerOrAdmin.value) return true
    return notesVisibility.value === 'ATTENDEES_EDIT'
  })

  // Viewers stack in header
  const activeViewers = computed<ActiveViewer[]>(() => {
    const list: ActiveViewer[] = []
    const seenIds = new Set<number>()

    // 1. Organizer
    if (rawEventData.value?.createdBy) {
      const creator = rawEventData.value.createdBy
      seenIds.add(creator.id)
      const cand = candidates.value.find(c => c.id === creator.id)
      const name = creator.profile?.fullName || cand?.fullName || creator.email || 'Penyelenggara'
      const position = cand?.position || creator.profile?.division || cand?.division || 'Penyelenggara Agenda'
      list.push({
        id: creator.id,
        name,
        position,
        profilePicture:
          creator.profile?.profilePicture ||
          cand?.profilePicture ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      })
    }

    // 2. Attendees from database
    if (rawEventData.value?.attendees && rawEventData.value.attendees.length > 0) {
      for (const a of rawEventData.value.attendees) {
        if (seenIds.has(a.userId)) continue
        seenIds.add(a.userId)
        const cand = candidates.value.find(c => c.id === a.userId)
        const name = a.user?.profile?.fullName || cand?.fullName || a.user?.email || 'Peserta'
        const position =
          cand?.position ||
          a.user?.profile?.division ||
          cand?.division ||
          a.user?.customRole?.displayName ||
          cand?.customRole ||
          a.user?.role ||
          'Peserta'
        list.push({
          id: a.userId,
          name,
          position,
          profilePicture:
            a.user?.profile?.profilePicture ||
            cand?.profilePicture ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        })
      }
    } else if (selectedAttendeeIds.value.length > 0) {
      for (const id of selectedAttendeeIds.value) {
        if (seenIds.has(id)) continue
        seenIds.add(id)
        const c = candidates.value.find(cand => cand.id === id)
        if (c) {
          const name = c.fullName || c.email || 'Peserta'
          const position = c.position || c.division || c.customRole || c.role || 'Peserta'
          list.push({
            id: c.id,
            name,
            position,
            profilePicture:
              c.profilePicture ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
          })
        }
      }
    }

    return list
  })

  // Date Synchronization
  const syncFormDates = () => {
    if (!startDateOnly.value) {
      form.value.startDate = ''
    } else if (form.value.isAllDay) {
      form.value.startDate = `${startDateOnly.value}T00:00:00`
    } else {
      form.value.startDate = `${startDateOnly.value}T${startTimeOnly.value || '09:00'}:00`
    }

    if (!endDateOnly.value) {
      form.value.endDate = undefined
    } else if (form.value.isAllDay) {
      form.value.endDate = `${endDateOnly.value}T23:59:59`
    } else {
      form.value.endDate = `${endDateOnly.value}T${endTimeOnly.value || '10:00'}:00`
    }
  }

  watch([startDateOnly, startTimeOnly, endDateOnly, endTimeOnly, () => form.value.isAllDay], () => {
    syncFormDates()
  })

  const activeDurationMinutes = computed(() => {
    if (!startDateOnly.value || !endDateOnly.value || form.value.isAllDay) return null
    const [sy, sm, sd] = startDateOnly.value.split('-').map(Number)
    const [sh, smin] = (startTimeOnly.value || '00:00').split(':').map(Number)
    const [ey, em, ed] = endDateOnly.value.split('-').map(Number)
    const [eh, emin] = (endTimeOnly.value || '00:00').split(':').map(Number)

    if (!sy || !sm || !sd || !ey || !em || !ed) return null
    const start = new Date(sy, sm - 1, sd, sh || 0, smin || 0).getTime()
    const end = new Date(ey, em - 1, ed, eh || 0, emin || 0).getTime()
    const diffMinutes = Math.round((end - start) / (60 * 1000))
    return diffMinutes > 0 ? diffMinutes : null
  })

  const applyDurationPreset = (minutes: number) => {
    if (!startDateOnly.value) return
    const [y, m, d] = startDateOnly.value.split('-').map(Number)
    const [h, min] = (startTimeOnly.value || '09:00').split(':').map(Number)
    if (!y || !m || !d) return

    const start = new Date(y, m - 1, d, h || 0, min || 0)
    const end = new Date(start.getTime() + minutes * 60 * 1000)

    const pad = (n: number) => String(n).padStart(2, '0')
    endDateOnly.value = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
    endTimeOnly.value = `${pad(end.getHours())}:${pad(end.getMinutes())}`
  }

  // Candidates & Attendees Management
  watch(searchQuery, () => {
    displayLimit.value = 30
  })

  const filteredCandidates = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return candidates.value

    return candidates.value.filter(u => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.position && u.position.toLowerCase().includes(q)) ||
        (u.division && u.division.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.customRole && u.customRole.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      )
    })
  })

  const displayedCandidates = computed(() => {
    return filteredCandidates.value.slice(0, displayLimit.value)
  })

  const onCandidatesScroll = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 60) {
      if (displayLimit.value < filteredCandidates.value.length) {
        displayLimit.value += 30
      }
    }
  }

  const isUserDisabled = (u: CandidateUser) => {
    if (u.isActive === false) return true
    const st = (u.status || '').toUpperCase()
    return ['TERMINATED', 'SUSPENDED', 'RESIGNED'].includes(st)
  }

  const allFilteredSelected = computed(() => {
    const selectable = filteredCandidates.value.filter(u => !isUserDisabled(u))
    if (selectable.length === 0) return false
    return selectable.every(u => selectedAttendeeIds.value.includes(u.id))
  })

  const toggleSelectAllFiltered = () => {
    const selectable = filteredCandidates.value.filter(u => !isUserDisabled(u))
    if (selectable.length === 0) return

    if (allFilteredSelected.value) {
      const idsToRemove = new Set(selectable.map(u => u.id))
      selectedAttendeeIds.value = selectedAttendeeIds.value.filter(id => !idsToRemove.has(id))
    } else {
      const current = new Set(selectedAttendeeIds.value)
      selectable.forEach(u => current.add(u.id))
      selectedAttendeeIds.value = Array.from(current)
    }
    checkActiveRolePreset()
  }

  const selectedUsersList = computed(() => {
    return candidates.value.filter(u => selectedAttendeeIds.value.includes(u.id))
  })

  const checkActiveRolePreset = () => {
    const activeCandidates = candidates.value.filter(u => !isUserDisabled(u))
    if (activeCandidates.length === 0 || selectedAttendeeIds.value.length === 0) {
      activeRolePreset.value = null
      return
    }

    const allIds = activeCandidates.map(u => u.id)
    if (allIds.length > 0 && selectedAttendeeIds.value.length === allIds.length && allIds.every(id => selectedAttendeeIds.value.includes(id))) {
      activeRolePreset.value = 'ALL'
      return
    }

    const roles = ['INTERN', 'MENTOR', 'ADMIN'] as const
    for (const r of roles) {
      const roleIds = activeCandidates.filter(u => u.role?.toUpperCase() === r).map(u => u.id)
      if (roleIds.length > 0 && roleIds.length === selectedAttendeeIds.value.length && roleIds.every(id => selectedAttendeeIds.value.includes(id))) {
        activeRolePreset.value = r
        return
      }
    }

    activeRolePreset.value = null
  }

  const toggleAttendee = (userId: number) => {
    const user = candidates.value.find(u => u.id === userId)
    if (user && isUserDisabled(user)) return

    const idx = selectedAttendeeIds.value.indexOf(userId)
    if (idx > -1) {
      selectedAttendeeIds.value.splice(idx, 1)
    } else {
      selectedAttendeeIds.value.push(userId)
    }
    checkActiveRolePreset()
  }

  const removeAttendee = (userId: number) => {
    const idx = selectedAttendeeIds.value.indexOf(userId)
    if (idx > -1) {
      selectedAttendeeIds.value.splice(idx, 1)
    }
    checkActiveRolePreset()
  }

  const resetAttendees = () => {
    selectedAttendeeIds.value = []
    activeRolePreset.value = null
  }

  const assignRoleUsers = (roleType: 'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN') => {
    if (activeRolePreset.value === roleType) {
      selectedAttendeeIds.value = []
      activeRolePreset.value = null
      return
    }

    activeRolePreset.value = roleType
    const activeCandidates = candidates.value.filter(u => !isUserDisabled(u))
    if (roleType === 'ALL') {
      selectedAttendeeIds.value = activeCandidates.map(u => u.id)
    } else {
      selectedAttendeeIds.value = activeCandidates
        .filter(u => u.role?.toUpperCase() === roleType)
        .map(u => u.id)
    }
  }

  // Notes Auto-Save
  const debouncedAutoSave = useDebounceFn(async () => {
    if (!eventId.value || !isInitialLoaded.value || !canEditNotes.value) return
    autoSaveStatus.value = 'saving'
    try {
      const payload: any = {
        notesContent: notesContent.value
      }
      if (isOrganizerOrAdmin.value) {
        payload.notesVisibility = notesVisibility.value
      }

      await calendarApi.updateNotes(eventId.value, payload)
      autoSaveStatus.value = 'saved'
      setTimeout(() => {
        if (autoSaveStatus.value === 'saved') {
          autoSaveStatus.value = 'idle'
        }
      }, 2500)
    } catch (err: any) {
      autoSaveStatus.value = 'error'
      console.error('Auto-save error:', err)
    }
  }, 1200)

  watch([notesContent, notesVisibility], () => {
    if (isInitialLoaded.value && canEditNotes.value) {
      autoSaveStatus.value = 'saving'
      debouncedAutoSave()
    }
  })

  const handleSaveNotes = async () => {
    if (!eventId.value || !canEditNotes.value) return
    isSavingNotes.value = true
    autoSaveStatus.value = 'saving'
    try {
      const payload: any = {
        notesContent: notesContent.value
      }
      if (isOrganizerOrAdmin.value) {
        payload.notesVisibility = notesVisibility.value
      }

      await calendarApi.updateNotes(eventId.value, payload)
      autoSaveStatus.value = 'saved'
      toast.success('Catatan agenda berhasil disimpan.')
      setTimeout(() => {
        if (autoSaveStatus.value === 'saved') {
          autoSaveStatus.value = 'idle'
        }
      }, 2500)
    } catch (err: any) {
      autoSaveStatus.value = 'error'
      toast.error('Gagal menyimpan catatan: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isSavingNotes.value = false
    }
  }

  // Data Loading & API Calls
  const loadCandidateUsers = async () => {
    isLoadingCandidates.value = true
    try {
      candidates.value = await calendarApi.getCandidates()
    } catch (err: any) {
      console.error('Failed to load candidate users:', err)
    } finally {
      isLoadingCandidates.value = false
      checkActiveRolePreset()
    }
  }

  const loadEventDetail = async () => {
    if (!eventId.value) {
      navigateTo('/calendar')
      return
    }

    isLoadingData.value = true
    try {
      const ev: CalendarEventItem = await calendarApi.getEventById(eventId.value)
      rawEventData.value = ev
      form.value.title = ev.title
      form.value.description = ev.description || ''
      form.value.type = ev.type
      form.value.location = ev.location || ''
      form.value.eventUrl = ev.eventUrl || ''
      form.value.color = ev.color || '#4082E6'
      form.value.isAllDay = ev.isAllDay
      notesContent.value = ev.notesContent || ''
      notesVisibility.value = ev.notesVisibility || 'ATTENDEES_VIEW'
      setTimeout(() => {
        isInitialLoaded.value = true
      }, 400)

      const pad = (n: number) => String(n).padStart(2, '0')

      if (ev.startDate) {
        const s = new Date(ev.startDate)
        startDateOnly.value = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`
        startTimeOnly.value = `${pad(s.getHours())}:${pad(s.getMinutes())}`
      }

      if (ev.endDate) {
        const e = new Date(ev.endDate)
        endDateOnly.value = `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`
        endTimeOnly.value = `${pad(e.getHours())}:${pad(e.getMinutes())}`
      } else {
        endDateOnly.value = startDateOnly.value
        endTimeOnly.value = startTimeOnly.value
      }

      syncFormDates()

      selectedAttendeeIds.value = ev.attendees ? ev.attendees.map(a => a.userId) : []
      checkActiveRolePreset()

      if (!isOrganizerOrAdmin.value) {
        if (ev.notesVisibility === 'ORGANIZER_ONLY') {
          return
        }
        currentTab.value = 'notes'
      } else if (route.query.tab === 'notes') {
        currentTab.value = 'notes'
      }
    } catch (err: any) {
      toast.error('Gagal memuat data agenda: ' + (err.message || 'Terjadi kesalahan'))
      navigateTo('/calendar')
    } finally {
      isLoadingData.value = false
    }
  }

  const handleSubmit = async () => {
    if (!form.value.title.trim()) {
      toast.error('Judul agenda wajib diisi.')
      return
    }

    if (!form.value.startDate) {
      toast.error('Waktu mulai agenda wajib diisi.')
      return
    }

    isSubmitting.value = true
    try {
      const payload: Partial<CreateEventPayload> = {
        title: form.value.title.trim(),
        description: form.value.description?.trim() || undefined,
        type: form.value.type,
        location: form.value.location?.trim() || undefined,
        eventUrl: form.value.eventUrl?.trim() || undefined,
        startDate: new Date(form.value.startDate).toISOString(),
        endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
        isAllDay: form.value.isAllDay,
        color: form.value.color,
        attendeeIds: selectedAttendeeIds.value
      }

      await calendarApi.updateEvent(eventId.value, payload)
      toast.success('Jadwal berhasil diperbarui.')
      navigateTo('/calendar')
    } catch (err: any) {
      toast.error('Gagal memperbarui jadwal: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isSubmitting.value = false
    }
  }

  const handleDelete = async () => {
    if (!eventId.value) return

    isDeleting.value = true
    try {
      await calendarApi.deleteEvent(eventId.value)
      toast.success('Jadwal berhasil dihapus.')
      showDeleteConfirm.value = false
      navigateTo('/calendar')
    } catch (err: any) {
      toast.error('Gagal menghapus jadwal: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isDeleting.value = false
    }
  }

  watch(
    () => route.query.tab,
    (newTab) => {
      if (newTab === 'notes') {
        if (isAccessDenied.value) return
        currentTab.value = 'notes'
      } else if (newTab === 'detail') {
        if (isOrganizerOrAdmin.value) {
          currentTab.value = 'detail'
        }
      }
    }
  )

  onMounted(async () => {
    await Promise.all([loadCandidateUsers(), loadEventDetail()])
  })

  return {
    eventId,
    isSidebarCollapsed,
    showDeleteConfirm,
    showShareModal,
    isDeleting,
    isSubmitting,
    isLoadingData,
    currentTab,
    rawEventData,
    // Permissions
    isOrganizerOrAdmin,
    isAccessDenied,
    tabsList,
    canEditNotes,
    // Header viewers
    activeViewers,
    // Form & Dates
    form,
    startDateOnly,
    startTimeOnly,
    endDateOnly,
    endTimeOnly,
    activeDurationMinutes,
    durationPresets,
    presetColors,
    eventTypeOptions,
    applyDurationPreset,
    // Candidates & Attendees
    candidates,
    isLoadingCandidates,
    searchQuery,
    selectedAttendeeIds,
    activeRolePreset,
    filteredCandidates,
    displayedCandidates,
    selectedUsersList,
    allFilteredSelected,
    toggleAttendee,
    removeAttendee,
    resetAttendees,
    assignRoleUsers,
    toggleSelectAllFiltered,
    onCandidatesScroll,
    // Notes
    notesContent,
    notesVisibility,
    isSavingNotes,
    autoSaveStatus,
    handleSaveNotes,
    // Actions
    loadEventDetail,
    handleSubmit,
    handleDelete
  }
}
