import { useCalendarApi } from '../api/calendar.api'
import type { CandidateUser, CreateEventPayload, EventType } from '../types/calendar.types'
import { toast } from 'vue-sonner'

export const useEventCreate = () => {
  const route = useRoute()
  const calendarApi = useCalendarApi()

  const isSidebarCollapsed = useState<boolean>('sidebar_is_collapsed', () => false)
  const isSubmitting = ref(false)
  const isLoadingCandidates = ref(false)
  const candidates = ref<CandidateUser[]>([])
  const searchQuery = ref('')
  const selectedAttendeeIds = ref<number[]>([])
  const activeRolePreset = ref<'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN' | null>(null)

  // Separated date & time picker states
  const startDateOnly = ref('')
  const startTimeOnly = ref('09:00')
  const endDateOnly = ref('')
  const endTimeOnly = ref('10:00')

  const form = ref<CreateEventPayload>({
    title: '',
    description: '',
    type: 'MEETING' as EventType,
    location: '',
    eventUrl: '',
    startDate: '',
    endDate: '',
    isAllDay: false,
    color: '#4082E6',
    recurrence: {
      type: 'DOES_NOT_REPEAT',
      interval: 1,
      unit: 'WEEK',
      daysOfWeek: [],
      daysOfMonth: [],
      monthlyMode: 'SAME_DAY',
      endType: 'NEVER',
      endDate: ''
    },
    notifications: [
      { id: 'notif-1', minutesBefore: 30 }
    ]
  })

  // Sync separated dates into form payload
  const syncFormDates = () => {
    if (!startDateOnly.value) {
      form.value.startDate = ''
    } else if (form.value.isAllDay) {
      form.value.startDate = `${startDateOnly.value}T00:00:00`
    } else {
      form.value.startDate = `${startDateOnly.value}T${startTimeOnly.value || '09:00'}:00`
    }

    if (!endDateOnly.value) {
      form.value.endDate = ''
    } else if (form.value.isAllDay) {
      form.value.endDate = `${endDateOnly.value}T23:59:59`
    } else {
      form.value.endDate = `${endDateOnly.value}T${endTimeOnly.value || '10:00'}:00`
    }
  }

  watch([startDateOnly, startTimeOnly, endDateOnly, endTimeOnly, () => form.value.isAllDay], () => {
    syncFormDates()
  })

  const eventTypeOptions: { label: string; value: EventType }[] = [
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

  const loadCandidateUsers = async () => {
    isLoadingCandidates.value = true
    try {
      candidates.value = await calendarApi.getCandidates()
    } catch (err: any) {
      console.error('Failed to load candidate users:', err)
    } finally {
      isLoadingCandidates.value = false
    }
  }

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

  const displayLimit = ref(30)

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
      const payload: CreateEventPayload = {
        title: form.value.title.trim(),
        description: form.value.description?.trim() || undefined,
        type: form.value.type,
        location: form.value.location?.trim() || undefined,
        eventUrl: form.value.eventUrl?.trim() || undefined,
        startDate: new Date(form.value.startDate).toISOString(),
        endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
        isAllDay: form.value.isAllDay,
        color: form.value.color,
        attendeeIds: selectedAttendeeIds.value,
        recurrence: form.value.recurrence,
        notifications: form.value.notifications
      }

      await calendarApi.createEvent(payload)
      toast.success('Jadwal berhasil disimpan.')
      navigateTo('/calendar')
    } catch (err: any) {
      toast.error('Gagal menyimpan jadwal: ' + (err.message || 'Terjadi kesalahan'))
    } finally {
      isSubmitting.value = false
    }
  }

  onMounted(async () => {
    const queryDate = route.query.date as string
    const queryTime = route.query.time as string
    const baseDate = queryDate ? new Date(`${queryDate}T${queryTime || '09:00'}:00`) : new Date()

    const pad = (n: number) => String(n).padStart(2, '0')
    const yStr = String(baseDate.getFullYear())
    const mStr = pad(baseDate.getMonth() + 1)
    const dStr = pad(baseDate.getDate())
    const hStr = pad(baseDate.getHours())
    const minStr = pad(baseDate.getMinutes())

    startDateOnly.value = `${yStr}-${mStr}-${dStr}`
    startTimeOnly.value = `${hStr}:${minStr}`

    const endDate = new Date(baseDate.getTime() + 60 * 60 * 1000)
    endDateOnly.value = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`
    endTimeOnly.value = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`

    syncFormDates()
    await loadCandidateUsers()
  })

  return {
    isSidebarCollapsed,
    isSubmitting,
    isLoadingCandidates,
    candidates,
    searchQuery,
    selectedAttendeeIds,
    activeRolePreset,
    startDateOnly,
    startTimeOnly,
    endDateOnly,
    endTimeOnly,
    form,
    eventTypeOptions,
    presetColors,
    durationPresets,
    activeDurationMinutes,
    filteredCandidates,
    displayedCandidates,
    selectedUsersList,
    allFilteredSelected,
    applyDurationPreset,
    onCandidatesScroll,
    toggleSelectAllFiltered,
    toggleAttendee,
    removeAttendee,
    resetAttendees,
    assignRoleUsers,
    handleSubmit
  }
}
