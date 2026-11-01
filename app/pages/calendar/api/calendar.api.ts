import type { CalendarEventItem, CandidateUser, CreateEventPayload, AttendeeStatus } from '../types/calendar.types'

export const useCalendarApi = () => {
  const api = useApi()

  const getEvents = async (query: { year?: number; month?: number; startDate?: string; endDate?: string; type?: string; view?: string }) => {
    const params = new URLSearchParams()
    if (query.year) params.append('year', String(query.year))
    if (query.month) params.append('month', String(query.month))
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)
    if (query.type) params.append('type', query.type)
    if (query.view) params.append('view', query.view)

    const res = await api(`/events?${params.toString()}`)
    return (res.data || []) as CalendarEventItem[]
  }

  const getEventById = async (id: number) => {
    const res = await api(`/events/${id}`)
    return res.data as CalendarEventItem
  }

  const createEvent = async (payload: CreateEventPayload) => {
    const res = await api('/events', {
      method: 'POST',
      body: payload
    })
    return res.data as CalendarEventItem
  }

  const updateEvent = async (id: number, payload: Partial<CreateEventPayload>) => {
    const res = await api(`/events/${id}`, {
      method: 'PUT',
      body: payload
    })
    return res.data as CalendarEventItem
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

  const shareEvent = async (
    eventId: number,
    payload: {
      attendeeIds?: number[]
      email?: string
      notesVisibility?: string
    }
  ) => {
    const res = await api(`/events/${eventId}/share`, {
      method: "POST",
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
    updateNotes,
    shareEvent,
    getCandidates
  }
}
