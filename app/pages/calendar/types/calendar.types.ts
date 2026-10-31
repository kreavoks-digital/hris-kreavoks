export type EventType =
  | 'MEETING'
  | 'WORKSHOP'
  | 'PROJECT_DEADLINE'
  | 'TASK'
  | 'COMPANY_EVENT'
  | 'OTHER'

export type AttendeeStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'ORGANIZER'

export interface EventAttendeeItem {
  id: number
  userId: number
  status: AttendeeStatus
  notes?: string | null
  user: {
    id: number
    email: string
    role: string
    customRole?: {
      name: string
      displayName: string
    } | null
    profile?: {
      fullName: string
      profilePicture: string | null
      division?: string | null
    } | null
  }
}

export interface CalendarEventItem {
  id: number
  title: string
  description?: string | null
  type: EventType
  location?: string | null
  eventUrl?: string | null
  startDate: string
  endDate?: string | null
  isAllDay: boolean
  color: string
  createdById: number
  createdBy: {
    id: number
    email: string
    profile?: {
      fullName: string
      profilePicture?: string | null
      division?: string | null
    } | null
  }
  attendees: EventAttendeeItem[]
  myRsvpStatus?: AttendeeStatus | null
  totalAttendees?: number
  acceptedCount?: number
  declinedCount?: number
}

export interface CandidateUser {
  id: number
  email: string
  role: string
  customRole: string | null
  fullName: string
  profilePicture: string | null
  division: string
}

export interface CreateEventPayload {
  title: string
  description?: string
  type: EventType
  location?: string
  eventUrl?: string
  startDate: string
  endDate?: string
  isAllDay?: boolean
  color?: string
  attendeeIds?: number[]
  assignRole?: 'KREAGEN' | 'INTERN' | 'MENTOR' | 'ADMIN' | 'ALL'
}
