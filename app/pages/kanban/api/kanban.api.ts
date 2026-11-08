import { useApi } from '~/composables/useApi'
import type { KanbanTask, TaskStatus, TaskPriority, KanbanMember, KanbanColumnDef } from '../types'

export interface CreateTaskPayload {
  projectId: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  startDate?: string
  dueDate?: string
  assigneeUserIds?: number[]
  tags?: string[]
  checklist?: { title: string; isCompleted?: boolean }[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  startDate?: string | null
  dueDate?: string | null
  tags?: string[]
  isFavorite?: boolean
}

export interface TaskCommentItem {
  id: number
  taskId: string
  userId: number
  user: {
    id: string
    name: string
    avatar: string
    role?: string
  }
  content: string
  createdAt: string
  updatedAt: string
}

export const kanbanApi = {
  /**
   * Mengambil daftar tugas berdasarkan proyek
   */
  async getTasks(projectId?: string): Promise<KanbanTask[]> {
    try {
      const api = useApi()
      const res: any = await api('/tasks', {
        query: projectId ? { projectId } : undefined
      })
      return res?.data || []
    } catch (error) {
      console.error('[kanbanApi.getTasks] Error:', error)
      return []
    }
  },

  /**
   * Membuat tugas baru
   */
  async createTask(payload: CreateTaskPayload): Promise<KanbanTask | null> {
    try {
      const api = useApi()
      const res: any = await api('/tasks', {
        method: 'POST',
        body: payload
      })
      return res?.data || null
    } catch (error) {
      console.error('[kanbanApi.createTask] Error:', error)
      return null
    }
  },

  /**
   * Memperbarui detail tugas (title, description, dates, priority, tags, dsb)
   */
  async updateTask(taskId: string, payload: UpdateTaskPayload): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: payload
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.updateTask] Error:', error)
      return false
    }
  },

  /**
   * Memperbarui status / kolom posisi tugas
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: { status }
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.updateTaskStatus] Error:', error)
      return false
    }
  },

  /**
   * Memperbarui anggota yang ditugaskan ke task
   */
  async updateTaskAssignees(taskId: string, userIds: number[]): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}/assignees`, {
        method: 'PUT',
        body: { userIds }
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.updateTaskAssignees] Error:', error)
      return false
    }
  },

  /**
   * Menambahkan subtask / checklist item baru ke task
   */
  async addSubtask(taskId: string, title: string): Promise<any> {
    try {
      const api = useApi()
      const res: any = await api(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: { title }
      })
      return res?.data || null
    } catch (error) {
      console.error('[kanbanApi.addSubtask] Error:', error)
      return null
    }
  },

  /**
   * Toggle checklist item (selesai / belum)
   */
  async toggleChecklist(taskId: string, checklistId: string): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}/checklist/${checklistId}`, {
        method: 'PATCH'
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.toggleChecklist] Error:', error)
      return false
    }
  },

  /**
   * Menghapus tugas (soft delete)
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.deleteTask] Error:', error)
      return false
    }
  },

  /**
   * Mengambil daftar anggota karyawan untuk penugasan
   */
  async getMembers(): Promise<KanbanMember[]> {
    try {
      const api = useApi()
      const res: any = await api('/users?limit=50')
      const userList = res?.data?.users || res?.users || res?.data || []
      if (!Array.isArray(userList)) return []

      const seenIds = new Set<string>()
      const members: KanbanMember[] = []

      for (const u of userList) {
        const uid = String(u.id)
        if (!seenIds.has(uid)) {
          seenIds.add(uid)
          const name = u.profile?.fullName || u.fullName || u.name || 'User'
          const rawPos = u.profile?.position || u.position
          const roleName = typeof u.role === 'string' ? u.role : (u.role?.displayName || u.role?.name)
          const position = (rawPos && rawPos !== name) ? rawPos : (roleName || 'Staff')
          members.push({
            id: uid,
            name,
            avatar: u.profile?.avatar || u.avatar || u.photoProfile || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            position
          })
        }
      }
      return members
    } catch (error) {
      console.error('[kanbanApi.getMembers] Error:', error)
      return []
    }
  },

  /**
   * Mengambil daftar kolom status kustom per proyek
   */
  async getColumns(projectId: string): Promise<KanbanColumnDef[]> {
    try {
      const api = useApi()
      const res: any = await api(`/tasks/columns/${projectId}`)
      return res?.data || []
    } catch (error) {
      console.error('[kanbanApi.getColumns] Error:', error)
      return []
    }
  },

  /**
   * Menambahkan kolom status kustom baru ke proyek
   */
  async addColumn(projectId: string, payload: { label: string; color?: string }): Promise<KanbanColumnDef | null> {
    try {
      const api = useApi()
      const res: any = await api(`/tasks/columns/${projectId}`, {
        method: 'POST',
        body: payload
      })
      return res?.data || null
    } catch (error) {
      console.error('[kanbanApi.addColumn] Error:', error)
      return null
    }
  },

  /**
   * Mengambil daftar komentar / diskusi pada tugas
   */
  async getComments(taskId: string): Promise<TaskCommentItem[]> {
    try {
      const api = useApi()
      const res: any = await api(`/tasks/${taskId}/comments`)
      return res?.data || []
    } catch (error) {
      console.error('[kanbanApi.getComments] Error:', error)
      return []
    }
  },

  /**
   * Menambahkan komentar / pesan diskusi baru ke tugas
   */
  async addComment(taskId: string, content: string): Promise<TaskCommentItem | null> {
    try {
      const api = useApi()
      const res: any = await api(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: { content }
      })
      return res?.data || null
    } catch (error) {
      console.error('[kanbanApi.addComment] Error:', error)
      return null
    }
  },

  /**
   * Menghapus komentar dari tugas
   */
  async deleteComment(taskId: string, commentId: number): Promise<boolean> {
    try {
      const api = useApi()
      await api(`/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('[kanbanApi.deleteComment] Error:', error)
      return false
    }
  }
}
