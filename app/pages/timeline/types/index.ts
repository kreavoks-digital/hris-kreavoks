export type TimelineItemStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED'
export type TimelineItemType = 'PHASE' | 'MILESTONE' | 'TASK'

export interface TimelineOwner {
  id: string
  name: string
  avatar?: string
}

export interface TimelineItem {
  id: string
  projectId: string
  title: string
  type: TimelineItemType
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  progress: number  // 0 - 100
  status: TimelineItemStatus
  owner: TimelineOwner
  assignees?: TimelineOwner[]
  tags?: string[]
  priority?: string
}

export interface TimelineProject {
  id: string
  name: string
  startDate: string
  endDate: string
}

