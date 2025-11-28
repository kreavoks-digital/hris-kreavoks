import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  const month = Number(query.month) || new Date().getMonth() + 1
  const year = Number(query.year) || new Date().getFullYear()

  // TODO: Replace with actual database queries using Prisma

  const mockData = {
    payroll: [
      {
        id: '1',
        nik: 'EMP001',
        employeeName: 'John Doe',
        department: 'IT',
        basicSalary: 8000000,
        allowance: 2000000,
        deduction: 500000,
        totalSalary: 9500000,
        status: 'paid'
      }
    ],
    summary: {
      totalSalary: 1200000000,
      totalDeduction: 50000000,
      totalPaid: 1150000000
    }
  }

  return mockData
})
