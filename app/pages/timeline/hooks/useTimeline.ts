import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useProjects } from '~/pages/projects/hooks/useProjects'
import { useAuth } from '~/composables/useAuth'
import type { TimelineItem, TimelineItemStatus, TimelineOwner } from '../types'

export const getAvataaarUrl = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`
}

export function useTimeline(initialProjectId?: string) {
  const api = useApi()
  const route = useRoute()
  const router = useRouter()
  const { user } = useAuth()
  const { projects, fetchProjects } = useProjects()

  const queryProjectId = typeof route?.query?.project === 'string' ? route.query.project : undefined
  const selectedProjectId = ref<string | null>(initialProjectId || queryProjectId || null)

  const items = ref<TimelineItem[]>([])
  const isLoadingTimeline = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref<string>('ALL')

  // Dynamic Month Viewport: Default November 2026 (atau bulan berjalan)
  const currentMonthDate = ref(new Date('2026-11-01T00:00:00'))

  const currentMonthLabel = computed(() => {
    return currentMonthDate.value.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    })
  })

  const totalDays = computed(() => {
    const y = currentMonthDate.value.getFullYear()
    const m = currentMonthDate.value.getMonth()
    return new Date(y, m + 1, 0).getDate()
  })

  const rangeStart = computed(() => {
    const y = currentMonthDate.value.getFullYear()
    const m = currentMonthDate.value.getMonth()
    return new Date(y, m, 1, 0, 0, 0)
  })

  const daysHeader = computed(() => {
    const days = []
    const start = rangeStart.value
    const count = totalDays.value
    for (let i = 0; i < count; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push({
        dayNumber: d.getDate(),
        dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        dateStr: d.toISOString().slice(0, 10)
      })
    }
    return days
  })

  function prevMonth() {
    const d = new Date(currentMonthDate.value)
    d.setMonth(d.getMonth() - 1)
    currentMonthDate.value = d
  }

  function nextMonth() {
    const d = new Date(currentMonthDate.value)
    d.setMonth(d.getMonth() + 1)
    currentMonthDate.value = d
  }

  const selectedProject = computed(() => {
    if (!selectedProjectId.value) return null
    return projects.value.find(p => p.id === selectedProjectId.value) || null
  })

  // Watcher URL query jika param ?project= berubah
  watch(
    () => route?.query?.project,
    (newProj) => {
      if (typeof newProj === 'string' && newProj && newProj !== selectedProjectId.value) {
        selectedProjectId.value = newProj
        fetchTasksForTimeline(newProj)
      }
    }
  )

  async function setProjectId(id: string) {
    if (selectedProjectId.value === id) return
    selectedProjectId.value = id
    if (router && route) {
      router.replace({ query: { ...route.query, project: id } })
    }
    await fetchTasksForTimeline(id)
  }

  // Fetch data tugas nyata dari backend API untuk proyek aktif
  async function fetchTasksForTimeline(targetId?: string) {
    const pId = targetId || selectedProjectId.value
    if (!pId) {
      items.value = []
      return
    }

    isLoadingTimeline.value = true
    try {
      const res: any = await api('/tasks', { query: { projectId: pId } })
      const taskList = res?.data || []

      if (Array.isArray(taskList) && taskList.length > 0) {
        // Fallback user aktif jika task tidak memiliki assignee
        const fallbackOwner: TimelineOwner = {
          id: String(user.value?.id || 'me'),
          name: user.value?.fullName || user.value?.name || 'Project Staff',
          avatar: getAvataaarUrl(user.value?.fullName || 'Project Staff')
        }

        // Map setiap task nyata dari database ke format Timeline Gantt
        items.value = taskList.map((t: any) => {
          const startDate = t.startDate || t.createdAt || '2026-11-01'
          let endDate = t.dueDate || startDate

          // Hitung progres berbasis checklist atau status
          let progress = 0
          if (t.status === 'DONE') {
            progress = 100
          } else if (Array.isArray(t.checklist) && t.checklist.length > 0) {
            const completed = t.checklist.filter((c: any) => c.isCompleted).length
            progress = Math.round((completed / t.checklist.length) * 100)
          } else if (t.status === 'IN_PROGRESS') {
            progress = 40
          }

          // Tentukan status timeline
          let status: TimelineItemStatus = 'ON_TRACK'
          if (t.status === 'DONE') {
            status = 'COMPLETED'
          } else if (t.priority === 'URGENT') {
            status = 'AT_RISK'
          } else if (t.priority === 'HIGH') {
            status = 'AT_RISK'
          }

          const owner: TimelineOwner = (t.assignees && t.assignees.length > 0)
            ? {
                id: t.assignees[0].id,
                name: t.assignees[0].name,
                avatar: t.assignees[0].avatar
              }
            : fallbackOwner

          return {
            id: t.id,
            projectId: t.projectId,
            title: t.title,
            type: (t.checklist && t.checklist.length > 2) ? 'PHASE' : 'TASK',
            startDate,
            endDate,
            progress,
            status,
            owner
          }
        })
      } else {
        items.value = []
      }
    } catch (err) {
      console.error('Failed to fetch tasks for timeline:', err)
      items.value = []
    } finally {
      isLoadingTimeline.value = false
    }
  }

  // Inisialisasi sekuensial: otomatis buka project paling atas jika URL tidak ada parameter
  async function initializeTimeline() {
    isLoadingTimeline.value = true
    try {
      const projList = await fetchProjects()
      if (projList && projList.length > 0) {
        const urlProj = typeof route?.query?.project === 'string' ? route.query.project : null
        let target = urlProj ? projList.find(p => p.id === urlProj) : null

        // JIKA TIDAK ADA DI QUERY: OTOMATIS BUKA PROYEK PALING ATAS!
        if (!target) {
          target = projList[0]
        }

        if (target) {
          selectedProjectId.value = target.id
          if (router && route && route.query.project !== target.id) {
            router.replace({ query: { ...route.query, project: target.id } })
          }
          await fetchTasksForTimeline(target.id)
        }
      }
    } finally {
      isLoadingTimeline.value = false
    }
  }

  if (process.client) {
    onMounted(() => {
      initializeTimeline()
    })
  }

  const filteredItems = computed(() => {
    return items.value.filter(item => {
      const matchSearch = searchQuery.value
        ? item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        : true
      const matchStatus = filterStatus.value === 'ALL'
        ? true
        : item.status === filterStatus.value
      return matchSearch && matchStatus
    })
  })

  function calculateBarPosition(startDateStr: string, endDateStr: string) {
    const itemStart = new Date(`${startDateStr}T00:00:00`).getTime()
    const itemEnd = new Date(`${endDateStr}T23:59:59`).getTime()
    const timelineStart = rangeStart.value.getTime()
    const msPerDay = 1000 * 60 * 60 * 24

    const startOffsetDays = Math.max(0, (itemStart - timelineStart) / msPerDay)
    const durationDays = Math.max(1, (itemEnd - itemStart) / msPerDay)

    const leftPercent = Math.min(100, (startOffsetDays / totalDays.value) * 100)
    const widthPercent = Math.min(100 - leftPercent, (durationDays / totalDays.value) * 100)

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 3)}%`
    }
  }

  function getStatusVariant(status: TimelineItemStatus): 'success' | 'warning' | 'danger' | 'primary' | 'secondary' {
    switch (status) {
      case 'COMPLETED':
        return 'primary'
      case 'ON_TRACK':
        return 'success'
      case 'AT_RISK':
        return 'warning'
      case 'DELAYED':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  function getStatusLabel(status: TimelineItemStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'ON_TRACK':
        return 'On Track'
      case 'AT_RISK':
        return 'At Risk'
      case 'DELAYED':
        return 'Delayed'
      default:
        return status
    }
  }

  return {
    items,
    projects,
    selectedProjectId,
    selectedProject,
    setProjectId,
    isLoadingTimeline,
    searchQuery,
    filterStatus,
    currentMonthLabel,
    totalDays,
    daysHeader,
    prevMonth,
    nextMonth,
    filteredItems,
    calculateBarPosition,
    getStatusVariant,
    getStatusLabel,
    fetchTasksForTimeline
  }
}
