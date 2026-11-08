export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED'
export type ProjectCategory = 'WEB' | 'MOBILE' | 'BRANDING' | 'MARKETING' | 'INTERNAL'

export interface ProjectMember {
  id: string
  name: string
  avatar?: string
  role: 'LEAD' | 'MEMBER' | 'MENTOR' | 'INTERN'
  position: string
  email?: string
}

export interface Project {
  id: string
  code: string
  name: string
  clientName: string
  description?: string
  category: ProjectCategory
  health: ProjectHealth
  startDate: string
  dueDate: string
  lead: ProjectMember
  members: ProjectMember[]
  progressPercentage: number
  totalTasks: number
  completedTasks: number
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  name: string
  clientName: string
  description?: string
  category: ProjectCategory
  startDate: string
  dueDate: string
  leadId: string
  memberIds: string[]
  health?: ProjectHealth
}
