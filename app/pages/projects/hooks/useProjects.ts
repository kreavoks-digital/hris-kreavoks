import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'
import type {
  Project,
  ProjectMember,
  CreateProjectPayload,
  ProjectHealth,
  ProjectCategory
} from '../types'

export const getAvataaarUrl = (name: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`
}

// Generator Project Code 1 kata acak aman tanpa pemisah (misal: 4637kvpenbe47343885)
export const generateSecureProjectCode = (length = 18): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  return result
}

// Singleton In-Flight Promises untuk mencegah duplicate requests
let inFlightProjectsPromise: Promise<Project[]> | null = null
let inFlightMembersPromise: Promise<ProjectMember[]> | null = null

export const useProjects = () => {
  const api = useApi()
  const { user } = useAuth()

  // Shared state antar halaman (Projects, Kanban, Timeline)
  const projects = useState<Project[]>('kv_shared_projects', () => [])
  const members = useState<ProjectMember[]>('kv_shared_project_members', () => [])
  const isLoading = ref(false)

  const searchQuery = ref('')
  const healthFilter = ref<string>('ALL')
  const categoryFilter = ref<string>('ALL')
  const viewMode = ref<'table' | 'grid'>('table')
  const isCreateModalOpen = ref(false)

  // Fetch daftar proyek dari API backend dengan deduplikasi request
  async function fetchProjects(force = false): Promise<Project[]> {
    // 1. Jika data sudah ada di memory dan tidak force refresh, langsung return
    if (!force && projects.value && projects.value.length > 0) {
      return projects.value
    }

    // 2. Jika ada request yang sedang terbang (in-flight), reuse promise yang sama
    if (inFlightProjectsPromise) {
      return inFlightProjectsPromise
    }

    isLoading.value = true
    inFlightProjectsPromise = (async () => {
      try {
        const res: any = await api('/projects')
        const projectList = res?.data || []
        if (Array.isArray(projectList)) {
          projects.value = projectList
          return projectList
        }
        return []
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        return projects.value || []
      } finally {
        isLoading.value = false
        inFlightProjectsPromise = null
      }
    })()

    return inFlightProjectsPromise
  }

  // Fetch daftar anggota tim untuk lead dan member picker dengan deduplikasi request
  async function fetchMembers(force = false): Promise<ProjectMember[]> {
    if (!force && members.value && members.value.length > 0) {
      return members.value
    }

    if (inFlightMembersPromise) {
      return inFlightMembersPromise
    }

    inFlightMembersPromise = (async () => {
      try {
        const res: any = await api('/users?limit=50')
        const userList = res?.data?.users || res?.data || []
        if (Array.isArray(userList) && userList.length > 0) {
          const mapped = userList.map((u: any) => ({
            id: String(u.id),
            name: u.fullName || u.name || 'User',
            avatar: u.avatar || u.photoProfile || getAvataaarUrl(u.fullName || u.name || 'User'),
            role: 'MEMBER' as const,
            position: u.position || (typeof u.role === 'string' ? u.role : u.role?.name) || 'Staff',
            email: u.email || ''
          }))
          members.value = mapped
          return mapped
        }
        return members.value || []
      } catch (err) {
        console.error('Failed to fetch members:', err)
        return members.value || []
      } finally {
        inFlightMembersPromise = null
      }
    })()

    return inFlightMembersPromise
  }

  // Helper instan untuk mendapatkan project paling atas
  const topProject = computed(() => {
    return projects.value.length > 0 ? projects.value[0] : null
  })

  // Auto-fetch data jika state memory masih kosong saat di-mount
  if (process.client) {
    onMounted(() => {
      if (projects.value.length === 0) {
        fetchProjects()
      }
      if (members.value.length === 0) {
        fetchMembers()
      }
    })
  }

  const filteredProjects = computed(() => {
    return projects.value.filter(project => {
      const query = searchQuery.value.toLowerCase().trim()
      const matchesSearch = !query || 
        project.name.toLowerCase().includes(query) ||
        project.clientName.toLowerCase().includes(query)

      const matchesHealth = healthFilter.value === 'ALL' || project.health === healthFilter.value
      const matchesCategory = categoryFilter.value === 'ALL' || project.category === categoryFilter.value

      return matchesSearch && matchesHealth && matchesCategory
    })
  })

  const metrics = computed(() => {
    const total = projects.value.length
    const onTrack = projects.value.filter(p => p.health === 'ON_TRACK').length
    const atRiskOrDelayed = projects.value.filter(p => p.health === 'AT_RISK' || p.health === 'DELAYED').length
    const completed = projects.value.filter(p => p.health === 'COMPLETED').length

    return {
      total,
      onTrack,
      atRiskOrDelayed,
      completed
    }
  })

  const createProject = async (payload: CreateProjectPayload): Promise<Project | null> => {
    try {
      // Generate unpredictable slug 1 kata (misal 4637kvpenbe47343885)
      const code = generateSecureProjectCode(18)

      const leadIdNum = payload.leadId ? parseInt(String(payload.leadId), 10) : undefined
      const memberIdsNum = payload.memberIds ? payload.memberIds.map(id => parseInt(String(id), 10)).filter(n => !isNaN(n)) : []

      const res: any = await api('/projects', {
        method: 'POST',
        body: {
          code,
          name: payload.name,
          clientName: payload.clientName,
          description: payload.description || '',
          category: payload.category || 'WEB',
          health: payload.health || 'ON_TRACK',
          startDate: payload.startDate || undefined,
          dueDate: payload.dueDate || undefined,
          leadId: leadIdNum,
          memberUserIds: memberIdsNum
        }
      })

      toast.success(`Proyek "${payload.name}" berhasil dibuat!`)
      await fetchProjects()
      return res?.data || null
    } catch (err: any) {
      toast.error(err?.data?.message || 'Gagal membuat proyek.')
      return null
    }
  }

  const updateProjectHealth = async (id: string, health: ProjectHealth) => {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      project.health = health
      project.updatedAt = new Date().toISOString().split('T')[0]
    }

    try {
      const rawId = id.replace(/^prj-/, '')
      await api(`/projects/${rawId}`, {
        method: 'PUT',
        body: { health }
      })
      toast.success('Status kesehatan proyek diperbarui!')
    } catch {
      toast.error('Gagal memperbarui status kesehatan proyek di server.')
    }
  }

  const deleteProject = async (id: string) => {
    const previous = [...projects.value]
    projects.value = projects.value.filter(p => p.id !== id)

    try {
      const rawId = id.replace(/^prj-/, '')
      await api(`/projects/${rawId}`, {
        method: 'DELETE'
      })
      toast.success('Proyek berhasil dihapus.')
    } catch {
      projects.value = previous
      toast.error('Gagal menghapus proyek di server.')
    }
  }

  const resetFilters = () => {
    searchQuery.value = ''
    healthFilter.value = 'ALL'
    categoryFilter.value = 'ALL'
  }

  return {
    projects,
    members,
    isLoading,
    fetchProjects,
    fetchMembers,
    searchQuery,
    healthFilter,
    categoryFilter,
    viewMode,
    isCreateModalOpen,
    filteredProjects,
    metrics,
    createProject,
    updateProjectHealth,
    deleteProject,
    resetFilters,
    topProject
  }
}
