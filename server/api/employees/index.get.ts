import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Get employees list with pagination
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const limit = 10

  // TODO: Replace with actual database queries using Prisma
  // Example:
  // const prisma = event.context.prisma
  // const employees = await prisma.employee.findMany({
  //   skip: (page - 1) * limit,
  //   take: limit
  // })

  const mockEmployees = [
    {
      id: '1',
      nik: 'EMP001',
      name: 'John Doe',
      department: 'IT',
      position: 'Software Engineer',
      email: 'john@kreavoks.com',
      phone: '08123456789',
      status: 'active'
    },
    // Add more mock data as needed
  ]

  return {
    employees: mockEmployees,
    totalPages: 10,
    currentPage: page
  }
})
