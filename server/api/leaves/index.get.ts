import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Get leaves for current user
  // TODO: Replace with actual database queries using Prisma

  const mockData = {
    leaves: [
      {
        id: '1',
        type: 'annual',
        startDate: '2025-12-01',
        endDate: '2025-12-03',
        duration: 3,
        reason: 'Family vacation',
        status: 'approved',
        createdAt: '2025-11-15'
      }
    ],
    balance: {
      annual: 12,
      used: 3
    }
  }

  return mockData
})
