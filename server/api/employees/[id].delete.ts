import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')

  // TODO: Delete employee from database using Prisma
  // Example:
  // const prisma = event.context.prisma
  // await prisma.employee.delete({
  //   where: { id }
  // })

  return {
    success: true,
    message: 'Employee deleted successfully'
  }
})
