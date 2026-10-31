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
    const res = await api('/events/candidates')
    return (res.data || []) as CandidateUser[]
  }

  return {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    updateRsvp,
    getCandidates
  }
}
