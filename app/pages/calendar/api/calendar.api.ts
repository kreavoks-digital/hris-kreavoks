import type { CalendarEventItem, CandidateUser, CreateEventPayload, AttendeeStatus } from '../types/calendar.types'
import { encodeEventMetadata, decodeEventMetadata } from '../types/calendar.types'

export const useCalendarApi = () => {
  const api = useApi()

  const parseEventItem = (item: any): CalendarEventItem => {
    if (!item) return item
    const decoded = decodeEventMetadata(item.description)
    return {
      ...item,
      description: decoded.cleanDescription,
      recurrence: decoded.recurrence,
      notifications: decoded.notifications
    }
  }

  const getEvents = async (query: { year?: number; month?: number; startDate?: string; endDate?: string; type?: string; view?: string }) => {
    const params = new URLSearchParams()
    if (query.year) params.append('year', String(query.year))
    if (query.month) params.append('month', String(query.month))
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)
    if (query.type) params.append('type', query.type)
    if (query.view) params.append('view', query.view)

    const res = await api(`/events?${params.toString()}`)
    const list = (res.data || []) as any[]
    return list.map(parseEventItem)
  }

  const getEventById = async (id: number) => {
    const res = await api(`/events/${id}`)
    return parseEventItem(res.data)
  }

  const createEvent = async (payload: CreateEventPayload) => {
    const descriptionWithMeta = encodeEventMetadata(payload.description, {
      recurrence: payload.recurrence,
      notifications: payload.notifications
    })

    const body: any = {
      ...payload,
      description: descriptionWithMeta
    }

    const res = await api('/events', {
      method: 'POST',
      body
    })
    return parseEventItem(res.data)
  }

  const updateEvent = async (id: number, payload: Partial<CreateEventPayload>) => {
    const descriptionWithMeta = encodeEventMetadata(payload.description, {
      recurrence: payload.recurrence,
      notifications: payload.notifications
    })

    const body: any = {
      ...payload,
      description: descriptionWithMeta
    }

    const res = await api(`/events/${id}`, {
      method: 'PUT',
      body
    })
    return parseEventItem(res.data)
  }

  const deleteEvent = async (id: number) => {
    return await api(`/events/${id}`, {
      method: 'DELETE'
    })
  }

  const updateRsvp = async (eventId: number, status: AttendeeStatus, notes?: string) => {
    const res = await api(`/events/${eventId}/rsvp`, {
      method: 'PATCH',
      body: { status, notes }
    })
    return res.data
  }

  const getCandidates = async () => {
    try {
      const res = await api('/events/candidates')
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data as CandidateUser[]
      }
    } catch {
      // Fallback ke /users jika /events/candidates gagal
    }

    try {
      const res: any = await api('/users?limit=100')
      const userList = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.users) ? res.data.users : [])
      if (userList.length > 0) {
        return userList.map((u: any) => ({
          id: u.id,
          email: u.email,
          role: typeof u.role === 'object' ? u.role?.name : u.role,
          customRole: typeof u.role === 'object' ? (u.role?.displayName || u.role?.name) : (u.customRole?.displayName || u.customRole?.name || null),
          fullName: u.fullName || u.profile?.fullName || u.email.split('@')[0],
          profilePicture: null,
          division: u.department || u.profile?.department || u.position || u.profile?.position || '-',
          status: u.status || (u.isActive === false ? 'SUSPENDED' : 'ACTIVE'),
          isActive: u.isActive !== undefined ? u.isActive : true
        })) as CandidateUser[]
      }
    } catch (err) {
      console.error('Gagal mengambil daftar kandidat peserta:', err)
      return [] as CandidateUser[]
    }
    return [] as CandidateUser[]
  }

  const updateNotes = async (
    eventId: number,
    payload: { notesContent?: string | null; notesVisibility?: string }
  ) => {
    const res = await api(`/events/${eventId}/notes`, {
      method: "PATCH",
      body: payload
    })
    return res.data
  }

  return {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRsvp,
    getCandidates,
    updateNotes
  }
}
