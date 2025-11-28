import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export default defineNitroPlugin(() => {
  prisma = new PrismaClient()

  // Add prisma to event context
  // This makes prisma available in all API routes via event.context.prisma
})
