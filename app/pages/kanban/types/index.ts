export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | (string & {})

export interface KanbanMember {
  id: string
  name: string
  avatar?: string
  position: string
}

export interface TaskChecklistItem {
  id: string
  title: string
  isCompleted: boolean
}

export interface KanbanTask {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: string
  dueDate: string
  assignees: KanbanMember[]
  tags: string[]
  checklist: TaskChecklistItem[]
  isFavorite?: boolean
  createdAt: string
  updatedAt: string
}

export interface KanbanColumnDef {
  id: TaskStatus
  label: string
  color: string
}

export interface KanbanProjectOption {
  id: string
  code: string
  name: string
  clientName: string
  dueDate: string
}

