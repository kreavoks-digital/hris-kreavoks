export interface AppNotification {
  id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string | Date
  actionUrl?: string | null
}
