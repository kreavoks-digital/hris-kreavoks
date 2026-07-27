/**
 * Plugin: firebase.client.ts
 *
 * Dijalankan HANYA di browser (client-only karena suffix .client.ts di Nuxt).
 * Bertanggung jawab untuk:
 * 1. Menginisialisasi Firebase App saat accessToken tersedia
 * 2. Meminta izin notifikasi user (hanya sekali per sesi, via sessionStorage flag)
 * 3. Mengirim FCM token ke backend untuk disimpan
 *
 * Menggunakan `watch` (bukan watchEffect) agar async handler tidak dieksekusi
 * dua kali dan agar mudah di-stop setelah berhasil.
 */

const FCM_TOKEN_SENT_KEY = 'kvhris_fcm_token_sent'

import { defineNuxtPlugin, useAuth, useApi, watch } from '#imports'

export default defineNuxtPlugin(() => {
  const { accessToken } = useAuth()
  const api = useApi()

  let stopWatch: (() => void) | undefined

  const processToken = async (token: string | null) => {
    if (!token) return
    
    // Hentikan watcher jika sudah dapat token
    if (stopWatch) stopWatch()
    
    // Sudah pernah kirim token di sesi ini — skip
    if (sessionStorage.getItem(FCM_TOKEN_SENT_KEY)) {
      return
    }

    try {
      const { requestNotificationPermission } = await import('~/utils/firebase')
      const fcmToken = await requestNotificationPermission()

      if (fcmToken) {
        await api('/profile/fcm-token', {
          method: 'PUT',
          body: { token: fcmToken },
        })
        sessionStorage.setItem(FCM_TOKEN_SENT_KEY, '1')
      }
    } catch (err) {
      console.warn('[firebase.client] Failed to setup FCM token:', err)
    }
  }

  // Jika token sudah ada saat inisialisasi, langsung proses
  if (accessToken.value) {
    processToken(accessToken.value)
  } else {
    // Jika belum ada, tunggu sampai token tersedia
    stopWatch = watch(accessToken, processToken)
  }
})
