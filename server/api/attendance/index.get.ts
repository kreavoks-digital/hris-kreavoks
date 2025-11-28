import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const date = query.date as string || new Date().toISOString().split('T')[0]

  // TODO: Replace with actual database queries using Prisma
  const mockData = {
    records: [
      {
        id: '1',
        nik: 'EMP001',
        employeeName: 'John Doe',
        department: 'IT',
        checkIn: '08:00',
        checkOut: '17:00',
        status: 'present',
        notes: ''
      }
    ],
    summary: {
      present: 142,
      permission: 3,
      sick: 2,
      absent: 3
    }
  }

  return mockData
})
