<template>
  <DialogRoot :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogPortal>
      <!-- Subtle transparent overlay: Tidak ada overlay hitam pekat, kalender tetap terlihat jelas -->
      <DialogOverlay class="fixed inset-0 z-50 bg-black/10 transition-opacity" />

      <!-- Popover Card Event Details bergaya Microsoft Teams -->
      <DialogContent
        v-if="event"
        class="fixed z-50 top-16 sm:top-24 left-1/2 -translate-x-1/2 sm:left-[55%] w-[94vw] max-w-[420px] bg-card border border-border rounded-2xl shadow-2xl p-5 duration-150 outline-none max-h-[85vh] flex flex-col gap-3.5 animate-in fade-in-0 zoom-in-95"
      >
        <!-- Top Bar: Category, Share Link & Close Icon -->
        <div class="flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div class="flex items-center gap-2">
            <Badge :variant="typeStyle.variant" size="sm" class="text-[11px] font-medium">
              {{ typeStyle.label }}
            </Badge>

            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline font-medium cursor-pointer transition-colors"
              title="Bagikan Agenda & Catatan"
              @click="showShareModal = true"
            >
              <Share2 class="w-3.5 h-3.5 text-muted-foreground" />
              <span>Bagikan</span>
            </button>
          </div>

          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              :icon="true"
              :icon-left="X"
              title="Tutup"
            />
          </DialogClose>
        </div>

        <!-- Multiple Events on this Day Switcher -->
        <div v-if="dayEvents && dayEvents.length > 1" class="space-y-1.5 pb-1 border-b border-border shrink-0">
          <p class="text-[11px] font-medium text-muted-foreground">
            {{ dayEvents.length }} Acara pada tanggal ini:
          </p>
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              v-for="ev in dayEvents"
              :key="ev.id"
              type="button"
              @click="emit('select-event', ev)"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 border cursor-pointer',
                event?.id === ev.id
                  ? 'bg-kv-primary text-white border-kv-primary shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
              ]"
            >
              {{ ev.title }}
            </button>
          </div>
        </div>

        <!-- Title & Time -->
        <div class="space-y-1 shrink-0">
          <h3 class="text-lg font-bold text-foreground leading-snug">
            {{ event.title }}
          </h3>
          <p class="text-xs text-muted-foreground font-medium">
            {{ formattedDate }} &bull; {{ formattedTime }}
          </p>
        </div>

        <!-- Action Buttons: Join & Edit (Tanpa tombol Hapus) -->
        <div class="flex items-center gap-2 pt-0.5 shrink-0">
          <a
            v-if="event.eventUrl"
            :href="event.eventUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1"
          >
            <Button
              variant="primary"
              size="sm"
              :icon-left="Video"
              label="Join"
              class="w-full"
            />
          </a>

          <Button
            v-if="isOrganizerOrAdmin"
            variant="outline"
            size="sm"
            :icon-left="Pencil"
            label="Edit"
            @click="emit('edit', event)"
          />

          <Button
            v-if="isOrganizerOrAdmin || event.notesVisibility !== 'ORGANIZER_ONLY'"
            variant="outline"
            size="sm"
            :icon="true"
            :icon-left="FileText"
            title="Catatan Agenda"
            @click="navigateTo(`/calendar/edit/${event.id}?tab=notes`)"
          />
        </div>

        <!-- Detail Information Rows (Teams Style) -->
        <div class="space-y-3.5 pt-2 border-t border-border/70 overflow-y-auto pr-1 text-xs text-foreground">
          <!-- Lokasi -->
          <div class="flex items-center gap-3">
            <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="font-medium truncate">{{ event.location || 'Online' }}</span>
          </div>

          <!-- Tautan Meeting & Copy Button -->
          <div v-if="event.eventUrl" class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <Link2 class="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                :href="event.eventUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-kv-primary hover:underline truncate"
              >
                {{ event.eventUrl }}
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              :icon="true"
              title="Salin Tautan"
              class="shrink-0 text-muted-foreground hover:text-foreground [&_svg]:!w-3.5 [&_svg]:!h-3.5"
              @click="copyLink(event.eventUrl)"
            >
              <Copy class="w-3.5 h-3.5" />
            </Button>
          </div>

          <!-- Catatan / Deskripsi -->
          <div v-if="event.description" class="flex items-start gap-3">
            <AlignLeft class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p class="whitespace-pre-wrap text-muted-foreground flex-1">
              {{ event.description }}
            </p>
          </div>

          <!-- Penyelenggara -->
          <div class="flex items-center gap-3">
            <User class="w-4 h-4 text-muted-foreground shrink-0" />
            <div class="min-w-0">
              <p class="font-medium text-foreground truncate">
                {{ event.createdBy?.profile?.fullName || event.createdBy?.email }}
              </p>
              <p class="text-xs text-muted-foreground">Penyelenggara</p>
            </div>
          </div>

          <!-- Recurrence / Repeat Info (Teams style) -->
          <div v-if="event.recurrence && event.recurrence.type !== 'DOES_NOT_REPEAT'" class="flex items-center gap-3">
            <RotateCw class="w-4 h-4 text-muted-foreground shrink-0" />
            <div class="flex items-center gap-2 min-w-0">
              <span class="font-medium truncate">{{ recurrenceText }}</span>
              <Badge variant="outline" size="sm" class="text-[10px] shrink-0">Berulang</Badge>
            </div>
          </div>

          <!-- Notifications / Reminders Info (Google Calendar style) -->
          <div v-if="notificationsSummaryText" class="flex items-center gap-3">
            <Bell class="w-4 h-4 text-muted-foreground shrink-0" />
            <span class="text-muted-foreground truncate">{{ notificationsSummaryText }}</span>
          </div>

          <!-- Peserta & Status RSVP -->
          <div class="flex items-start gap-3 pt-0.5">
            <Users class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-medium text-foreground">Peserta ({{ event.attendees.length }})</span>
                <span class="text-xs text-muted-foreground">
                  <span class="text-emerald-600 font-medium">{{ acceptedCount }} Hadir</span> &bull; 
                  <span class="text-rose-600 font-medium">{{ declinedCount }} Menolak</span>
                </span>
              </div>

              <!-- Attendees List Scroll -->
              <div v-if="event.attendees.length > 0" class="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                <div
                  v-for="att in event.attendees"
                  :key="att.id"
                  class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-muted/20 border border-border/50"
                >
                  <span class="truncate font-medium text-foreground">
                    {{ att.user.profile?.fullName || att.user.email }}
                  </span>
                  <Badge :variant="rsvpBadgeVariant(att.status)" size="sm" class="text-xs py-0 px-1.5">
                    {{ rsvpLabel(att.status) }}
                  </Badge>
                </div>
              </div>
              <p v-else class="text-xs text-muted-foreground">
                Acara terbuka untuk semua rekan kerja.
              </p>
            </div>
          </div>

          <!-- RSVP Action (Khusus Peserta yang Diundang) -->
          <div v-if="myAttendance" class="pt-2.5 border-t border-border/70 flex items-center justify-between gap-2">
            <span class="text-xs text-muted-foreground font-medium">Status Kehadiran:</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="isLoading"
                @click="emit('rsvp', event.id, 'ACCEPTED')"
                class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="[
                  myAttendance.status === 'ACCEPTED'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-xs ring-1 ring-emerald-500/20 font-semibold'
                    : 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/30'
                ]"
              >
                <Check class="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Hadir</span>
              </button>
              <button
                type="button"
                :disabled="isLoading"
                @click="emit('rsvp', event.id, 'DECLINED')"
                class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                :class="[
                  myAttendance.status === 'DECLINED'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-xs ring-1 ring-rose-500/20 font-semibold'
                    : 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15 hover:border-rose-500/30'
                ]"
              >
                <X class="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>Tidak Hadir</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <!-- Share Modal -->
  <ShareModal
    v-if="event"
    v-model:open="showShareModal"
    :event="event"
    :can-manage-settings="isOrganizerOrAdmin"
    @updated="emit('refresh')"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose
} from 'reka-ui'
import {
  X,
  Check,
  Video,
  Pencil,
  Share2,
  FileText,
  MapPin,
  Link2,
  Copy,
  AlignLeft,
  User,
  Users,
  RotateCw,
  Bell
} from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'
import { Badge } from '~/components/ui/badge'
import { toast } from 'vue-sonner'
import ShareModal from './ShareModal.vue'
import type { CalendarEventItem, AttendeeStatus } from '../types/calendar.types'

const props = defineProps<{
  open: boolean
  event?: CalendarEventItem | null
  dayEvents?: CalendarEventItem[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'edit': [event: CalendarEventItem]
  'cancel': [eventId: number]
  'rsvp': [eventId: number, status: AttendeeStatus]
  'select-event': [event: CalendarEventItem]
  'refresh': []
}>()

const showShareModal = ref(false)

const { user } = useAuth()

const isOrganizerOrAdmin = computed(() => {
  if (!props.event || !user.value) return false
  const roleName = user.value.role?.name || user.value.role
  return roleName === 'ADMIN' || props.event.createdById === user.value.id
})

const myAttendance = computed(() => {
  if (!props.event || !user.value) return null
  return props.event.attendees.find(a => a.userId === user.value?.id)
})

const acceptedCount = computed(() => {
  return props.event?.attendees.filter(a => a.status === 'ACCEPTED').length || 0
})

const declinedCount = computed(() => {
  return props.event?.attendees.filter(a => a.status === 'DECLINED').length || 0
})

interface EventTypeStyle {
  label: string
  variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline'
}

const defaultTypeStyle: EventTypeStyle = {
  label: 'Acara',
  variant: 'secondary'
}

const typeLabels: Record<string, EventTypeStyle> = {
  MEETING: { label: 'Meeting', variant: 'primary' },
  WORKSHOP: { label: 'Workshop', variant: 'info' },
  PROJECT_DEADLINE: { label: 'Batas Waktu Proyek', variant: 'error' },
  TASK: { label: 'Tugas', variant: 'warning' },
  COMPANY_EVENT: { label: 'Acara Kantor', variant: 'success' },
  OTHER: { label: 'Lainnya', variant: 'secondary' }
}

const typeStyle = computed<EventTypeStyle>(() => {
  if (!props.event?.type) return defaultTypeStyle
  return typeLabels[props.event.type] ?? defaultTypeStyle
})

const formattedDate = computed(() => {
  if (!props.event?.startDate) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(props.event.startDate))
})

const formattedTime = computed(() => {
  if (!props.event?.startDate) return '-'
  const formatTime = (d: string) =>
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(d))

  const start = formatTime(props.event.startDate)
  return props.event.endDate ? `${start} - ${formatTime(props.event.endDate)} WIB` : `${start} WIB`
})

const recurrenceLabels: Record<string, string> = {
  DOES_NOT_REPEAT: 'Does not repeat',
  EVERY_WEEKDAY: 'Every weekday (Mon - Fri)',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom'
}

const recurrenceText = computed(() => {
  if (!props.event?.recurrence) return ''
  const rec = props.event.recurrence
  if (rec.type === 'MONTHLY' && rec.monthlyMode === 'SPECIFIC_DATES' && rec.daysOfMonth?.length) {
    return `Monthly (Setiap tanggal ${rec.daysOfMonth.join(', ')})`
  }
  if (rec.type === 'CUSTOM') {
    const unitLabel = rec.unit === 'DAY' ? 'hari' : rec.unit === 'WEEK' ? 'minggu' : rec.unit === 'MONTH' ? 'bulan' : 'tahun'
    return `Setiap ${rec.interval || 1} ${unitLabel}`
  }
  return recurrenceLabels[rec.type] || rec.type
})

const notificationsSummaryText = computed(() => {
  if (!props.event?.notifications || props.event.notifications.length === 0) return ''
  const parts = props.event.notifications.map(n => {
    if (n.minutesBefore >= 1440) return `${Math.floor(n.minutesBefore / 1440)} hari sebelumnya`
    if (n.minutesBefore >= 60) return `${Math.floor(n.minutesBefore / 60)} jam sebelumnya`
    return `${n.minutesBefore} menit sebelumnya`
  })
  return `Pengingat: ${parts.join(', ')}`
})

const copyLink = async (url?: string | null) => {
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Tautan berhasil disalin')
  } catch {
    toast.error('Gagal menyalin tautan')
  }
}

const rsvpLabel = (status: AttendeeStatus) => {
  switch (status) {
    case 'ACCEPTED': return 'Hadir'
    case 'DECLINED': return 'Tidak Hadir'
    case 'TENTATIVE': return 'Ragu-ragu'
    case 'ORGANIZER': return 'Penyelenggara'
    default: return 'Belum Konfirmasi'
  }
}

const rsvpBadgeVariant = (status: AttendeeStatus): 'success' | 'error' | 'warning' | 'primary' | 'secondary' => {
  switch (status) {
    case 'ACCEPTED': return 'success'
    case 'DECLINED': return 'error'
    case 'TENTATIVE': return 'warning'
    case 'ORGANIZER': return 'primary'
    default: return 'secondary'
  }
}
</script>