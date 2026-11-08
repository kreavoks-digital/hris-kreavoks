import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useProjects } from '~/pages/projects/hooks/useProjects'
import type { KanbanTask, TaskStatus, TaskPriority, KanbanMember, KanbanColumnDef } from '../types'
import { kanbanApi } from '../api/kanban.api'

export const PRIORITY_CONFIGS: Record<TaskPriority, {
  value: TaskPriority
  label: string
  color: string
  fillClass: string
  textClass: string
  shortcut: string
  badgeVariant: 'error' | 'warning' | 'primary' | 'secondary'
}> = {
  URGENT: {
    value: 'URGENT',
    label: 'Urgent',
    color: '#e11d48',
    fillClass: 'fill-rose-600 text-rose-600',
    textClass: 'text-rose-600',
    shortcut: 'Ctrl 1',
    badgeVariant: 'error'
  },
  HIGH: {
    value: 'HIGH',
    label: 'High',
    color: '#f59e0b',
    fillClass: 'fill-amber-500 text-amber-500',
    textClass: 'text-amber-500',
    shortcut: 'Ctrl 2',
    badgeVariant: 'warning'
  },
  MEDIUM: {
    value: 'MEDIUM',
    label: 'Normal',
    color: '#3b82f6',
    fillClass: 'fill-blue-500 text-blue-500',
    textClass: 'text-blue-500',
    shortcut: 'Ctrl 3',
    badgeVariant: 'primary'
  },
  LOW: {
    value: 'LOW',
    label: 'Low',
    color: '#94a3b8',
    fillClass: 'fill-slate-400 text-slate-400',
    textClass: 'text-slate-400',
    shortcut: 'Ctrl 4',
    badgeVariant: 'secondary'
  }
}

export const PRIORITY_OPTIONS = [
  PRIORITY_CONFIGS.URGENT,
  PRIORITY_CONFIGS.HIGH,
  PRIORITY_CONFIGS.MEDIUM,
  PRIORITY_CONFIGS.LOW
]

export const getAvataaarUrl = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`
}

export function hexToRgba(hex: string, alpha: number) {
  let c = (hex || '#64748b').replace('#', '')
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('')
  }
  const num = parseInt(c, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getActiveUserMember = (): KanbanMember => {
  try {
    const { user } = useAuth()
    const u = user.value
    const name = u?.fullName || u?.name || 'Super Admin'
    const roleName = typeof u?.role === 'string' ? u.role : (u?.role?.name || u?.position || 'Staff')
    return {
      id: String(u?.id || 'me'),
      name,
      avatar: u?.avatar || u?.photoProfile || getAvataaarUrl(name),
      position: roleName
    }
  } catch {
    return {
      id: 'me',
      name: 'Super Admin',
      avatar: getAvataaarUrl('Super Admin'),
      position: 'Staff'
    }
  }
}

export const COLUMN_COLOR_PRESETS = [
  { name: 'Slate', value: '#64748b' },
  { name: 'Blue', value: '#4082e6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' }
]

export const DEFAULT_COLUMNS: KanbanColumnDef[] = [
  { id: 'TODO', label: 'To Do', color: '#64748b' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#4082e6' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#f59e0b' },
  { id: 'DONE', label: 'Completed', color: '#10b981' }
]

const STORAGE_KEY = 'kv_kanban_tasks_v1'
const LAST_PROJECT_KEY = 'kv_last_active_project'

export function useKanban(initialProjectId?: string) {
  const route = useRoute()
  const router = useRouter()
  const { projects, fetchProjects } = useProjects()
  const activeUser = getActiveUserMember()

  // Inisialisasi instan untuk selectedProjectId:
  // 1. Dari query URL jika ada
  // 2. Dari top project jika projects sudah di-cache di memory Nuxt (projList[0])
  // 3. Default null (akan diisi oleh initializeKanban dari proyek paling atas)
  const getInitialProjectId = (): string | null => {
    if (initialProjectId) return initialProjectId
    if (typeof route?.query?.project === 'string' && route.query.project) {
      return route.query.project
    }
    if (projects.value && projects.value.length > 0) {
      return projects.value[0]?.id || null
    }
    return null
  }

  const selectedProjectId = ref<string | null>(getInitialProjectId())
  const isLoadingKanban = ref(false)

  // Inisialisasi tasks: murni dari persistent cache atau array kosong
  const getInitialTasks = (): KanbanTask[] => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            return parsed.map(t => {
              if (t.assignees && Array.isArray(t.assignees)) {
                const seen = new Set<string>()
                t.assignees = t.assignees.filter((a: any) => {
                  const id = String(a.id || a.name)
                  if (seen.has(id)) return false
                  seen.add(id)
                  return true
                })
              }
              return t
            })
          }
        }
      } catch {}
    }
    return []
  }

  const tasks = ref<KanbanTask[]>(getInitialTasks())
  const columns = ref<KanbanColumnDef[]>([...DEFAULT_COLUMNS])
  const members = ref<KanbanMember[]>([activeUser])
  const searchQuery = ref('')
  const selectedPriority = ref<string>('ALL')
  const activeTask = ref<KanbanTask | null>(null)
  const isCreateModalOpen = ref(false)
  const isDetailModalOpen = ref(false)

  function persistTasks() {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
      } catch {}
    }
  }

  // Sinkronisasi route query jika param project di URL berubah
  watch(
    () => route?.query?.project,
    (newProj) => {
      if (typeof newProj === 'string' && newProj && newProj !== selectedProjectId.value) {
        selectedProjectId.value = newProj
        fetchTasksFromBackend(newProj)
      }
    }
  )

  // Update URL query saat user mengganti project dari dropdown
  async function setProjectId(id: string) {
    if (selectedProjectId.value === id) return
    selectedProjectId.value = id
    if (process.client) {
      localStorage.setItem(LAST_PROJECT_KEY, id)
    }
    if (router && route) {
      router.replace({ query: { ...route.query, project: id } })
    }
    await fetchTasksFromBackend(id)
  }

  const selectedProject = computed(() => {
    if (!selectedProjectId.value) return null
    return projects.value.find(p => p.id === selectedProjectId.value) || null
  })

  function cleanTaskAssignees(task: KanbanTask): KanbanTask {
    if (task.assignees && Array.isArray(task.assignees)) {
      const seen = new Set<string>()
      task.assignees = task.assignees.filter(a => {
        const id = String(a.id || a.name)
        if (seen.has(id)) return false
        seen.add(id)
        return true
      })
    } else {
      task.assignees = []
    }
    return task
  }

  // Sinkronisasi data ke backend API jika endpoint /tasks tersedia
  async function fetchTasksFromBackend(targetId?: string) {
    const pId = targetId || selectedProjectId.value
    if (!pId) return
    try {
      const data = await kanbanApi.getTasks(pId)
      if (Array.isArray(data) && data.length > 0) {
        tasks.value = data.map(cleanTaskAssignees)
        persistTasks()
      }
    } catch {
      // Endpoint error / fallback anggun ke persistent storage
    }
  }

  async function fetchMembers() {
    try {
      const userList = await kanbanApi.getMembers()
      if (Array.isArray(userList) && userList.length > 0) {
        const currentActive = getActiveUserMember()
        const seenIds = new Set<string>([String(currentActive.id)])
        const mappedUsers: KanbanMember[] = []

        for (const u of userList) {
          const uid = String(u.id)
          if (!seenIds.has(uid)) {
            seenIds.add(uid)
            mappedUsers.push(u)
          }
        }

        members.value = [currentActive, ...mappedUsers]
      }
    } catch {
      // Gunakan default members jika endpoint tidak tersedia
    }
  }

  // Inisialisasi cepat & sekuensial: otomatis buka project paling atas tanpa jeda
  async function initializeKanban() {
    isLoadingKanban.value = true
    try {
      // 1. Ambil projects dari shared cache / deduplicated fetch
      const projList = await fetchProjects()

      // 2. Tentukan proyek target
      if (projList && projList.length > 0) {
        const urlProj = typeof route?.query?.project === 'string' ? route.query.project : null
        let target = urlProj ? projList.find(p => p.id === urlProj) : null
        
        // JIKA TIDAK ADA DI QUERY URL: WAJIB OTOMATIS BUKA PROYEK PERTAMA / PALING ATAS (projList[0])!
        if (!target) {
          target = projList[0]
        }

        const activeTarget = target || projList[0]

        if (activeTarget) {
          const targetId = activeTarget.id
          selectedProjectId.value = targetId

          if (process.client) {
            localStorage.setItem(LAST_PROJECT_KEY, targetId)
          }

          if (router && route && route.query.project !== targetId) {
            router.replace({ query: { ...route.query, project: targetId } })
          }

          // 3. Langsung fetch task untuk project tersebut & fetch members secara paralel
          await Promise.all([
            fetchTasksFromBackend(targetId),
            fetchMembers()
          ])
        }
      } else {
        // Belum ada project di database, tetap load members
        await fetchMembers()
      }
    } finally {
      isLoadingKanban.value = false
    }
  }

  if (process.client) {
    onMounted(() => {
      initializeKanban()
    })
  }

  const filteredTasks = computed(() => {
    if (!selectedProjectId.value) return []
    return tasks.value.filter(task => {
      const matchSearch = searchQuery.value
        ? task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          task.id.toLowerCase().includes(searchQuery.value.toLowerCase())
        : true

      const matchPriority = selectedPriority.value === 'ALL'
        ? true
        : task.priority === selectedPriority.value

      const matchProject = task.projectId === selectedProjectId.value

      return matchSearch && matchPriority && matchProject
    })
  })

  function getTasksByStatus(status: TaskStatus) {
    return filteredTasks.value.filter(task => task.status === status)
  }

  function moveTask(taskId: string, targetStatus: TaskStatus) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = targetStatus
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTaskStatus(taskId, targetStatus)
    }
  }

  function toggleChecklist(taskId: string, checklistId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      const item = task.checklist.find(c => c.id === checklistId)
      if (item) {
        item.isCompleted = !item.isCompleted
        persistTasks()
        kanbanApi.toggleChecklist(taskId, checklistId)
      }
    }
  }

  function openCreateModal(defaultStatus: TaskStatus = 'TODO') {
    isCreateModalOpen.value = true
  }

  function openDetailModal(task: KanbanTask) {
    activeTask.value = task
    isDetailModalOpen.value = true
  }

  function closeDetailModal() {
    isDetailModalOpen.value = false
    activeTask.value = null
  }

  function addTask(newTask: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const assignedProjectId = newTask.projectId || selectedProjectId.value || projects.value[0]?.id
    if (!assignedProjectId) {
      isCreateProjectModalOpen.value = true
      return
    }
    const id = `TSK-${Math.floor(100 + Math.random() * 900)}`
    const now = new Date().toISOString().slice(0, 10)
    const task: KanbanTask = {
      ...newTask,
      projectId: assignedProjectId,
      id,
      createdAt: now,
      updatedAt: now
    }
    tasks.value.unshift(task)
    persistTasks()
    isCreateModalOpen.value = false

    // Optimistic sync ke backend via kanbanApi
    kanbanApi.createTask({
      projectId: assignedProjectId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      startDate: newTask.startDate,
      dueDate: newTask.dueDate,
      assigneeUserIds: newTask.assignees.map(a => Number(a.id)).filter(id => !isNaN(id)),
      tags: newTask.tags,
      checklist: newTask.checklist
    })
  }

  function toggleTaskComplete(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      const isDone = task.status === 'DONE'
      const newStatus: TaskStatus = isDone ? 'TODO' : 'DONE'
      task.status = newStatus
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTaskStatus(taskId, newStatus)
    }
  }

  function toggleTaskFavorite(taskId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.isFavorite = !task.isFavorite
      persistTasks()
      kanbanApi.updateTask(taskId, { isFavorite: task.isFavorite })
    }
  }

  function renameTask(taskId: string, newTitle: string) {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.title = trimmed
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTask(taskId, { title: trimmed })
    }
  }

  function addSubtask(taskId: string, subtaskTitle: string) {
    const trimmed = subtaskTitle.trim()
    if (!trimmed) return
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      const newItem = {
        id: `chk-${Date.now()}`,
        title: trimmed,
        isCompleted: false
      }
      if (!task.checklist) task.checklist = []
      task.checklist.push(newItem)
      persistTasks()
      kanbanApi.addSubtask(taskId, trimmed)
    }
  }

  function updateTaskAssignees(taskId: string, assignees: KanbanMember[]) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.assignees = assignees
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTaskAssignees(taskId, assignees.map(a => Number(a.id)).filter(id => !isNaN(id)))
    }
  }

  function updateTaskPriority(taskId: string, priority: TaskPriority) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.priority = priority
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTask(taskId, { priority })
    }
  }

  function updateTaskDates(taskId: string, startDate?: string, dueDate?: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      if (startDate !== undefined) task.startDate = startDate
      if (dueDate !== undefined) task.dueDate = dueDate
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTask(taskId, {
        startDate: task.startDate || null,
        dueDate: task.dueDate || null
      })
    }
  }

  function updateTaskTags(taskId: string, tags: string[]) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.tags = tags
      task.updatedAt = new Date().toISOString().slice(0, 10)
      persistTasks()
      kanbanApi.updateTask(taskId, { tags })
    }
  }

  function deleteTask(taskId: string) {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    persistTasks()
    kanbanApi.deleteTask(taskId)
    if (activeTask.value?.id === taskId) {
      closeDetailModal()
    }
  }

  function renameColumn(columnId: TaskStatus, newLabel: string) {
    const col = columns.value.find(c => c.id === columnId)
    if (col && newLabel.trim()) {
      col.label = newLabel.trim()
    }
  }

  function updateColumnColor(columnId: TaskStatus, newColor: string) {
    const col = columns.value.find(c => c.id === columnId)
    if (col && newColor) {
      col.color = newColor
    }
  }

  function clearColumnTasks(columnId: TaskStatus) {
    tasks.value = tasks.value.filter(t => t.status !== columnId)
    persistTasks()
  }

  function addStatusColumn(label: string, color?: string): KanbanColumnDef {
    const trimmed = label.trim()
    const id = trimmed.toUpperCase().replace(/\s+/g, '_')
    const existing = columns.value.find(c => c.id === id || c.label.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      return existing
    }

    const defaultColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#eab308']
    const assignedColor = color || defaultColors[columns.value.length % defaultColors.length]
    const newCol: KanbanColumnDef = {
      id: id as TaskStatus,
      label: trimmed,
      color: assignedColor
    }
    columns.value.push(newCol)
    return newCol
  }

  return {
    activeUser,
    isLoadingKanban,
    initializeKanban,
    tasks,
    projects,
    selectedProjectId,
    selectedProject,
    setProjectId,
    members,
    fetchMembers,
    fetchTasksFromBackend,
    searchQuery,
    selectedPriority,
    activeTask,
    isCreateModalOpen,
    isDetailModalOpen,
    filteredTasks,
    columns,
    colorPresets: COLUMN_COLOR_PRESETS,
    getTasksByStatus,
    moveTask,
    toggleChecklist,
    toggleTaskComplete,
    toggleTaskFavorite,
    renameTask,
    addSubtask,
    updateTaskAssignees,
    updateTaskPriority,
    updateTaskDates,
    updateTaskTags,
    openCreateModal,
    openDetailModal,
    closeDetailModal,
    addTask,
    deleteTask,
    renameColumn,
    updateColumnColor,
    clearColumnTasks,
    addStatusColumn
  }
}

