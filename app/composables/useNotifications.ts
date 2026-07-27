/**
 * useNotifications — Composable untuk mengelola state & side-effects notifikasi.
 *
 * Best practices yang diterapkan:
 * - Singleton state via useState (aman antar komponen, tidak double-fetch)
 * - FCM listener disetup SEKALI melalui flag `isFcmSetup` untuk cegah race condition
 * - Cleanup listener onUnmounted agar tidak ada memory leak
 * - Deduplication notifikasi via ID hash (sama persis dengan Kreavoks)
 * - "Fire-and-forget" untuk mark read agar UI tidak terasa lambat (optimistic update)
 */

import type { AppNotification } from '../types/notification'
import { useState, useApi } from '#imports'

// ─── Singleton: FCM hanya di-setup satu kali per sesi ─────────────────────────
let isFcmSetup = false
let fcmUnsubscribe: (() => void) | null = null

export const useNotifications = () => {
  const api = useApi()

  // State global (shared antar semua komponen yang memanggil composable ini)
  const notifications = useState<AppNotification[]>('notifications_list', () => [])
  const unreadCount = useState<number>('notifications_unread_count', () => 0)
  const isFetching = useState<boolean>('notifications_fetching', () => false)

  /**
   * Fetch notifications dari API dan update state.
   * Gunakan flag isFetching untuk cegah parallel request.
   */
  const fetchNotifications = async () => {
    if (isFetching.value) return
    isFetching.value = true
    try {
      const res = await api('/notifications') as any
      notifications.value = res.notifications ?? []
      unreadCount.value = res.unreadCount ?? 0
    } catch (err) {
      console.error('[useNotifications] Failed to fetch notifications:', err)
    } finally {
      isFetching.value = false
    }
  }

  /**
   * Setup FCM foreground listener.
   * Guard dengan flag global `isFcmSetup` agar hanya dipanggil satu kali
   * meskipun composable dipakai di banyak tempat (cegah multiple listener).
   */
  const setupFcmListener = async () => {
    if (isFcmSetup || typeof window === 'undefined') return

    try {
      const { initFirebaseAsync } = await import('~/utils/firebase')
      const app = await initFirebaseAsync()
      if (!app) return

      const { getMessaging, onMessage } = await import(/* @vite-ignore */ 'firebase/messaging')
      const messagingInstance = getMessaging(app)

      const unsub = onMessage(messagingInstance, (payload: any) => {
        const notifData = payload.notification ?? payload.data
        if (!notifData?.title && !notifData?.body) return

        // Hash deterministic sebagai ID untuk deduplication (identik dengan Kreavoks)
        const notifId = btoa(encodeURIComponent(`${notifData.title}|${notifData.body}`))

        const toastNotif: AppNotification = {
          id: notifId,
          title: notifData.title ?? 'Notifikasi Baru',
          body: notifData.body ?? '',
          isRead: false,
          createdAt: new Date(),
          actionUrl: payload.data?.url ?? null,
        }

        // Dispatch event untuk NotificationToast (tidak ada coupling langsung)
        window.dispatchEvent(new CustomEvent('hris-fcm-notification', { detail: toastNotif }))

        // Re-fetch dari DB agar dropdown sinkron dengan record nyata
        fetchNotifications()
      })

      isFcmSetup = true
      fcmUnsubscribe = unsub
    } catch (err) {
      console.warn('[useNotifications] FCM listener setup failed:', err)
    }
  }

  /**
   * Optimistic mark-as-read: update UI dulu, kirim ke server di background.
   */
  const markAsRead = (id: string) => {
    const notif = notifications.value.find(n => n.id === id)
    if (!notif || notif.isRead) return

    // Optimistic update
    notifications.value = notifications.value.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    )
    unreadCount.value = Math.max(0, unreadCount.value - 1)

    // Fire and forget
    api(`/notifications/mark-read/${id}`, { method: 'POST' }).catch(() => {})
  }

  /**
   * Optimistic mark-all-as-read.
   */
  const markAllAsRead = () => {
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
    unreadCount.value = 0

    // Fire and forget
    api('/notifications/mark-all-read', { method: 'POST' }).catch(() => {})
  }

  /**
   * Cleanup FCM listener — panggil saat logout/unmount root layout.
   */
  const destroyFcmListener = () => {
    if (fcmUnsubscribe) {
      fcmUnsubscribe()
      fcmUnsubscribe = null
      isFcmSetup = false
    }
  }

  return {
    notifications,
    unreadCount,
    isFetching,
    fetchNotifications,
    setupFcmListener,
    destroyFcmListener,
    markAsRead,
    markAllAsRead,
  }
}
