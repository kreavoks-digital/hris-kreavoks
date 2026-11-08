import { useApi } from '~/composables/useApi'
import type { Project, CreateProjectPayload, ProjectHealth } from '../types'

export const projectsApi = {
  async getProjects(): Promise<Project[]> {
    try {
      const api = useApi()
      const res: any = await api('/projects')
      return res?.data || []
    } catch {
      return []
    }
  },

  async createProject(payload: CreateProjectPayload): Promise<Project | null> {
    try {
      const api = useApi()
      const res: any = await api('/projects', {
        method: 'POST',
        body: payload
      })
      return res?.data || null
    } catch {
      return null
    }
  },

  async updateHealth(id: string, health: ProjectHealth): Promise<boolean> {
    try {
      const api = useApi()
      const rawId = id.replace(/^prj-/, '')
      await api(`/projects/${rawId}`, {
        method: 'PUT',
        body: { health }
      })
      return true
    } catch {
      return false
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const api = useApi()
      const rawId = id.replace(/^prj-/, '')
      await api(`/projects/${rawId}`, {
        method: 'DELETE'
      })
      return true
    } catch {
      return false
    }
  }
}

