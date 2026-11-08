export type EventType =
  | 'MEETING'
  | 'WORKSHOP'
  | 'PROJECT_DEADLINE'
  | 'TASK'
  | 'COMPANY_EVENT'
  | 'OTHER'

export type AttendeeStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'ORGANIZER'

export type NotesVisibility = 'ORGANIZER_ONLY' | 'ATTENDEES_VIEW' | 'ATTENDEES_EDIT'

export type RecurrenceType =
  | 'DOES_NOT_REPEAT'
  | 'EVERY_WEEKDAY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'
  | 'CUSTOM'

export interface RecurrenceConfig {
  type: RecurrenceType
  interval?: number // e.g. every 1, 2, 3
  unit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  daysOfWeek?: number[] // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  daysOfMonth?: number[] // [1, 15, 28] -> "tiap tanggal berapa aja"
  monthlyMode?: 'SAME_DAY' | 'SPECIFIC_DATES'
  endType?: 'NEVER' | 'ON_DATE' | 'AFTER_COUNT'
  endDate?: string
  endCount?: number
}

export interface EventNotificationItem {
  id: string
  minutesBefore: number // 5, 10, 15, 30, 60, 1440, etc.
  type?: 'NOTIFICATION' | 'EMAIL'
}

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
  notesContent?: string | null
  notesVisibility: NotesVisibility
  myRsvpStatus?: AttendeeStatus | null
  totalAttendees?: number
  acceptedCount?: number
  declinedCount?: number
  recurrence?: RecurrenceConfig
  notifications?: EventNotificationItem[]
}

export interface CandidateUser {
  id: number
  email: string
  role: string
  customRole: string | null
  fullName: string
  profilePicture: string | null
  division: string
  position?: string | null
  department?: string | null
  status?: string | null
  isActive?: boolean | null
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
  notesContent?: string | null
  notesVisibility?: NotesVisibility
  recurrence?: RecurrenceConfig
  notifications?: EventNotificationItem[]
}

// Metadata serializer for safe storage in existing description field without breaking database schema
export const encodeEventMetadata = (
  description?: string,
  meta?: { recurrence?: RecurrenceConfig; notifications?: EventNotificationItem[] }
): string => {
  const cleanDesc = (description || '').replace(/^\[KV_CALENDAR_META:.*?\]\n?/s, '').trim()
  const hasRecurrence = meta?.recurrence && meta.recurrence.type !== 'DOES_NOT_REPEAT'
  const hasNotifications = meta?.notifications && meta.notifications.length > 0

  if (!hasRecurrence && !hasNotifications) {
    return cleanDesc
  }

  const payload: any = {}
  if (hasRecurrence) payload.recurrence = meta.recurrence
  if (hasNotifications) payload.notifications = meta.notifications

  return `[KV_CALENDAR_META:${JSON.stringify(payload)}]\n${cleanDesc}`
}

export const decodeEventMetadata = (rawDescription?: string | null): {
  cleanDescription: string
  recurrence?: RecurrenceConfig
  notifications?: EventNotificationItem[]
} => {
  if (!rawDescription) {
    return {
      cleanDescription: '',
      recurrence: { type: 'DOES_NOT_REPEAT' },
      notifications: [{ id: 'notif-1', minutesBefore: 30 }]
    }
  }

  const match = rawDescription.match(/^\[KV_CALENDAR_META:(.*?)\]\n?(.*)$/s)
  if (match) {
    try {
      const parsed = JSON.parse(match[1])
      return {
        cleanDescription: (match[2] || '').trim(),
        recurrence: parsed.recurrence || { type: 'DOES_NOT_REPEAT' },
        notifications: parsed.notifications && parsed.notifications.length > 0
          ? parsed.notifications
          : [{ id: 'notif-1', minutesBefore: 30 }]
      }
    } catch {
      return {
        cleanDescription: rawDescription,
        recurrence: { type: 'DOES_NOT_REPEAT' },
        notifications: [{ id: 'notif-1', minutesBefore: 30 }]
      }
    }
  }

  return {
    cleanDescription: rawDescription,
    recurrence: { type: 'DOES_NOT_REPEAT' },
    notifications: [{ id: 'notif-1', minutesBefore: 30 }]
  }
}
