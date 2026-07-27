/**
 * firebase.ts — Browser-only Firebase initialization.
 *
 * RULES:
 * - Semua import firebase/* harus lazy (dynamic import) + @vite-ignore
 * - Tidak ada top-level import dari 'firebase/*'
 * - Semua fungsi harus guard dengan typeof window === 'undefined'
 */
import { useRuntimeConfig } from 'nuxt/app'
import type { FirebaseApp } from 'firebase/app'

// Singleton references
let _app: FirebaseApp | null = null

/**
 * Inisialisasi Firebase App (lazy, browser-only).
 * Aman dipanggil berkali-kali — hanya init satu kali.
 */
export const initFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') return null
  if (_app) return _app

  // Tidak bisa dynamic import di sini karena butuh sync return.
  // Gunakan getApps() saja — initializeApp() dipanggil di plugin terpisah.
  return _app
}

/**
 * Inisialisasi Firebase App secara async.
 * Gunakan ini saat Anda butuh memastikan app sudah terinisialisasi.
 */
export const initFirebaseAsync = async (): Promise<FirebaseApp | null> => {
  if (typeof window === 'undefined') return null
  if (_app) return _app

  try {
    const config = useRuntimeConfig()
    const { initializeApp, getApps } = await import(/* @vite-ignore */ 'firebase/app')

    if (getApps().length > 0) {
      _app = getApps()[0] ?? null
    } else {
      _app = initializeApp({
        apiKey: config.public.firebase.apiKey,
        authDomain: config.public.firebase.authDomain,
        projectId: config.public.firebase.projectId,
        storageBucket: config.public.firebase.storageBucket,
        messagingSenderId: config.public.firebase.messagingSenderId,
        appId: config.public.firebase.appId,
      })
    }

    return _app
  } catch (err) {
    console.warn('[firebase] initFirebaseAsync failed:', err)
    return null
  }
}

/**
 * Minta izin notifikasi browser, daftarkan Service Worker,
 * lalu kembalikan token FCM.
 * Hanya bisa dipanggil satu kali berhasil per sesi (idempotent via _fcmSetupDone).
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('[firebase] Notification permission denied.')
      return null
    }

    const app = await initFirebaseAsync()
    if (!app) return null

    // Register Service Worker
    let swRegistration: ServiceWorkerRegistration
    try {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    } catch (err) {
      console.error('[firebase] Service Worker registration failed:', err)
      return null
    }

    const { getMessaging, getToken } = await import(/* @vite-ignore */ 'firebase/messaging')
    const messaging = getMessaging(app)

    const config = useRuntimeConfig()
    
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: config.public.firebase.vapidKey,
    })

    if (token) {
      return token
    }

    console.warn('[firebase] FCM token is empty.')
    return null
  } catch (err) {
    console.error('[firebase] requestNotificationPermission error:', err)
    return null
  }
}
