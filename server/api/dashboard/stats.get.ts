import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Get dashboard statistics
  // TODO: Replace with actual database queries
  
  const stats = {
    totalEmployees: 150,
    presentToday: 142,
    leaveThisMonth: 8,
    pendingApproval: 5
  }

  return stats
})
