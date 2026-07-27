<template>
  <!-- Teleport to body to escape any stacking-context / backdrop-filter issues -->
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
      aria-live="polite"
      aria-label="Area notifikasi"
    >
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3 items-end">
        <div
          v-for="{ id, notif } in toasts"
          :key="id"
          class="pointer-events-auto w-[340px] flex items-start gap-3.5 p-4 rounded-3xl cursor-pointer
                 bg-background/60 backdrop-blur-xl
                 border border-border/60
                 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                 hover:bg-background/80 transition-colors"
          @click="handleToastClick(id, notif)"
        >
          <!-- Logo Icon -->
          <div class="w-10 h-10 shrink-0 bg-kv-primary rounded-xl flex items-center justify-center p-2 shadow-sm border border-kv-primary/20">
            <img src="/images/logo/kreavoks-hris-collapse-dark.svg" class="w-full h-auto" alt="KvHRIS" />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0 pt-0.5">
            <h4 class="font-bold text-[14px] text-kv-primary leading-tight truncate">{{ notif.title }}</h4>
            <p class="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">{{ stripHtml(notif.body) }}</p>
          </div>

          <!-- Dismiss -->
          <button
            @click.stop="dismiss(id)"
            class="shrink-0 p-1 mt-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { AppNotification } from '~/types/notification'

interface ToastItem {
  id: string
  notif: AppNotification
}

const toasts = ref<ToastItem[]>([])

const dismiss = (id: string) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const stripHtml = (html: string) => {
  if (!html) return ''
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

const handleToastClick = (id: string, notif: AppNotification) => {
  dismiss(id)
  if (notif.actionUrl) {
    navigateTo(notif.actionUrl)
  } else {
    // Buka detail di NotificationDropdown via custom event
    window.dispatchEvent(new CustomEvent('hris-open-notification', { detail: notif }))
  }
}

const handleFcmEvent = (e: Event) => {
  const notif = (e as CustomEvent<AppNotification>).detail
  const id = notif.id ?? Math.random().toString(36).slice(2)

  // Deduplication: jangan tambah jika ID sudah ada
  if (toasts.value.some(t => t.id === id)) return

  toasts.value = [...toasts.value, { id, notif }]

  // Auto-dismiss setelah 5 detik
  setTimeout(() => dismiss(id), 5000)
}

onMounted(() => {
  window.addEventListener('hris-fcm-notification', handleFcmEvent)
})

onUnmounted(() => {
  window.removeEventListener('hris-fcm-notification', handleFcmEvent)
})
</script>

<style scoped>
/* Toast slide-in dari kanan */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(110%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
