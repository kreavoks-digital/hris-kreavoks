<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bell Button -->
    <button
      id="notification-bell-btn"
      @click="toggleOpen"
      class="relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all focus:outline-none"
      :aria-label="`Notifikasi ${unreadCount > 0 ? `(${unreadCount} belum dibaca)` : ''}`"
    >
      <Bell class="h-4 w-4" />
      <Transition name="badge-pop">
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-background shadow-sm"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full right-0 mt-2 w-[360px] bg-background/95 backdrop-blur-md border border-border shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden flex flex-col z-50"
        style="min-height: 350px"
        role="dialog"
        aria-label="Panel Notifikasi"
      >
        <!-- Detail View -->
        <template v-if="selectedNotif">
          <!-- Detail Header -->
          <div class="flex items-center px-4 py-3 border-b border-border bg-muted/30 shrink-0">
            <button
              @click="selectedNotif = null"
              class="p-1.5 -ml-1.5 mr-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              aria-label="Kembali ke daftar"
            >
              <ChevronLeft class="h-5 w-5" />
            </button>
            <span class="font-semibold text-base text-foreground flex-1 truncate">
              Detail Notifikasi
            </span>
          </div>

          <!-- Detail Body -->
          <div
            ref="detailScrollRef"
            class="p-6 flex-1 overflow-y-auto max-h-[420px] relative"
            @scroll="onDetailScroll"
          >
            <h4 class="font-bold text-foreground text-lg leading-snug mb-1">
              {{ selectedNotif.title }}
            </h4>
            <span class="text-xs font-semibold text-kv-primary block mb-5">
              {{ formatTime(selectedNotif.createdAt) }}
            </span>
            <div
              class="text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none break-words overflow-x-hidden [&_img]:w-full [&_img]:aspect-video [&_img]:object-cover [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-3"
              v-html="selectedNotif.body.replace(/&nbsp;/g, ' ')"
            />
            <div v-if="selectedNotif.actionUrl" class="mt-6 pt-4 border-t border-border">
              <button
                @click="handleActionUrl"
                class="w-full py-2.5 rounded-xl bg-kv-primary text-white font-semibold text-sm hover:bg-kv-primary/90 transition-colors"
              >
                Lihat Detail
              </button>
            </div>
          </div>

          <!-- Scroll to Top Button -->
          <Transition name="fade-scale">
            <button
              v-if="showScrollTop"
              @click="scrollDetailToTop"
              class="absolute bottom-6 right-6 p-2.5 bg-kv-primary/15 text-kv-primary border border-kv-primary/20 rounded-full shadow-lg hover:bg-kv-primary/25 hover:scale-105 active:scale-95 transition-all z-10"
              aria-label="Scroll ke atas"
            >
              <ArrowUp class="w-5 h-5" />
            </button>
          </Transition>
        </template>

        <!-- List View -->
        <template v-else>
          <!-- List Header -->
          <div class="px-5 pt-4 pb-3 border-b border-border bg-muted/30 shrink-0">
            <div class="flex items-center justify-between mb-3">
              <span class="font-bold text-lg text-foreground tracking-tight">Notifikasi</span>
              <button
                v-if="unreadCount > 0"
                @click="markAllAsRead"
                class="text-xs font-medium text-kv-primary hover:underline flex items-center gap-1 focus:outline-none"
              >
                <Check class="h-3 w-3" />
                Mark all read
              </button>
            </div>

            <!-- Tab Switcher -->
            <div class="flex gap-1 p-1 bg-muted rounded-xl w-full">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id as 'all' | 'unread'"
                :class="[
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
              >
                {{ tab.label }}
                <span
                  v-if="tab.id === 'unread' && unreadCount > 0"
                  :class="[
                    'px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold',
                    activeTab === 'unread' ? 'bg-kv-primary text-white' : 'bg-border text-muted-foreground'
                  ]"
                >
                  {{ unreadCount }}
                </span>
              </button>
            </div>
          </div>

          <!-- Notification List -->
          <div class="max-h-[400px] overflow-y-auto flex-1">
            <!-- Empty State -->
            <div
              v-if="filteredNotifications.length === 0"
              class="py-16 flex flex-col items-center gap-3 text-center"
            >
              <div class="w-14 h-14 bg-muted border border-border rounded-full flex items-center justify-center">
                <Bell class="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p class="text-sm font-medium text-muted-foreground">
                {{ activeTab === 'unread' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi.' }}
              </p>
            </div>

            <!-- Items -->
            <div v-else class="flex flex-col">
              <div
                v-for="notif in filteredNotifications"
                :key="notif.id"
                @click="handleNotifClick(notif)"
                :class="[
                  'flex flex-col p-4 cursor-pointer transition-all border-b border-border last:border-0',
                  notif.isRead
                    ? 'hover:bg-muted/50 border-l-[3px] border-l-transparent'
                    : 'bg-kv-primary/[0.04] hover:bg-kv-primary/10 border-l-[3px] border-l-kv-primary'
                ]"
              >
                <div class="flex justify-between items-start gap-3">
                  <span
                    :class="[
                      'text-sm leading-tight',
                      notif.isRead ? 'font-medium text-muted-foreground' : 'font-bold text-foreground'
                    ]"
                  >
                    {{ notif.title }}
                  </span>
                  <span
                    v-if="!notif.isRead"
                    class="h-2 w-2 rounded-full bg-kv-primary flex-shrink-0 mt-1 shadow-sm shadow-kv-primary/30"
                  />
                </div>
                <p
                  :class="[
                    'text-xs line-clamp-1 leading-normal mt-1',
                    notif.isRead ? 'text-muted-foreground/70' : 'text-muted-foreground font-medium'
                  ]"
                >
                  {{ stripHtml(notif.body) }}
                </p>
                <span
                  :class="[
                    'text-xs mt-1.5 font-medium',
                    notif.isRead ? 'text-muted-foreground/60' : 'text-kv-primary'
                  ]"
                >
                  {{ formatTime(notif.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Bell, ChevronLeft, Check, ArrowUp } from 'lucide-vue-next'
import { formatDistanceStrict } from 'date-fns'
import type { AppNotification } from '~/types/notification'

// ─── State ────────────────────────────────────────────────────────────────────
const isOpen = ref(false)
const activeTab = ref<'all' | 'unread'>('all')
const selectedNotif = ref<AppNotification | null>(null)
const showScrollTop = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const detailScrollRef = ref<HTMLElement | null>(null)

const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

const tabs = [
  { id: 'all', label: 'Semua' },
  { id: 'unread', label: 'Belum Dibaca' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredNotifications = computed(() =>
  activeTab.value === 'all'
    ? notifications.value
    : notifications.value.filter(n => !n.isRead)
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (date: string | Date) => {
  try {
    return formatDistanceStrict(new Date(date), new Date(), { addSuffix: true })
  } catch {
    return 'Baru saja'
  }
}

const stripHtml = (html: string) => {
  if (!html) return ''
  if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

// ─── Toggle & Close ──────────────────────────────────────────────────────────
const toggleOpen = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    setTimeout(() => (selectedNotif.value = null), 300)
  }
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
    setTimeout(() => (selectedNotif.value = null), 300)
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

// Listen for "open specific notif" from toast click
const handleOpenNotif = (e: Event) => {
  const notif = (e as CustomEvent<AppNotification>).detail
  isOpen.value = true
  selectedNotif.value = notif
}

onMounted(() => window.addEventListener('hris-open-notification', handleOpenNotif))
onUnmounted(() => window.removeEventListener('hris-open-notification', handleOpenNotif))

// ─── Actions ─────────────────────────────────────────────────────────────────
const handleNotifClick = (notif: AppNotification) => {
  markAsRead(notif.id)
  selectedNotif.value = notif
}

const handleActionUrl = () => {
  if (!selectedNotif.value?.actionUrl) return
  isOpen.value = false
  setTimeout(() => (selectedNotif.value = null), 300)
  navigateTo(selectedNotif.value.actionUrl)
}

// ─── Detail scroll ────────────────────────────────────────────────────────────
const onDetailScroll = (e: Event) => {
  showScrollTop.value = (e.target as HTMLElement).scrollTop > 100
}

const scrollDetailToTop = () => {
  detailScrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* Dropdown slide-in */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Badge pop */
.badge-pop-enter-active,
.badge-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* Scroll to top fade-scale */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
