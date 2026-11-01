<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent v-if="event" class="max-w-2xl bg-card border border-border rounded-3xl p-6 overflow-hidden max-h-[92vh] flex flex-col">
      <DialogHeader class="pb-3 border-b border-border shrink-0">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span
            class="text-xs font-semibold px-3 py-1 rounded-2xl"
            :class="typeStyle.badge"
          >
            {{ typeStyle.label }}
          </span>

          <div v-if="isOrganizerOrAdmin" class="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              @click="emit('edit', event)"
              class="h-8 px-3 rounded-2xl text-xs border-border hover:bg-muted"
            >
              Edit Jadwal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              @click="emit('cancel', event.id)"
              class="h-8 px-3 rounded-2xl text-xs"
            >
              Batalkan
            </Button>
          </div>
        </div>

        <DialogTitle class="text-xl font-bold text-foreground leading-snug">
          {{ event.title }}
        </DialogTitle>
      </DialogHeader>

      <!-- Tabs Navigation (Detail vs Notes) -->
      <Tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden pt-2">
        <TabsList class="w-full max-w-xs grid grid-cols-2 rounded-2xl p-1 bg-muted/60 mb-3 shrink-0">
          <TabsTrigger value="detail" class="rounded-xl text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none">
            Detail Agenda
          </TabsTrigger>
          <TabsTrigger value="notes" class="rounded-xl text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground shadow-none">
            Catatan / Notes
          </TabsTrigger>
        </TabsList>

        <!-- TAB 1: DETAIL AGENDA -->
        <TabsContent value="detail" class="space-y-4 py-2 overflow-y-auto pr-1 flex-1 focus:outline-none">
          <!-- Date, Time & Location Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="p-3.5 rounded-2xl bg-muted/30 border border-border">
              <p class="text-xs text-muted-foreground mb-1">Waktu Pelaksanaan</p>
              <p class="font-semibold text-foreground">{{ formattedDate }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ formattedTime }}</p>
            </div>

            <div class="p-3.5 rounded-2xl bg-muted/30 border border-border">
              <p class="text-xs text-muted-foreground mb-1">Lokasi Agenda</p>
              <p class="font-semibold text-foreground">{{ event.location || 'Online / Remote' }}</p>
              <p v-if="event.eventUrl" class="text-xs text-kv-primary truncate mt-0.5">
                Tautan Tersedia
              </p>
            </div>
          </div>

          <!-- Meeting Link Button -->
          <div v-if="event.eventUrl" class="pt-1">
            <a
              :href="event.eventUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-3xl bg-kv-primary hover:bg-kv-primary/90 text-white font-medium text-sm transition-colors text-center"
            >
              <span>Buka Link Meeting / Tautan Acara</span>
              <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </div>

          <!-- Description -->
          <div v-if="event.description" class="space-y-1.5">
            <p class="text-xs font-semibold text-muted-foreground">Catatan / Detail Agenda</p>
            <div class="p-3.5 rounded-2xl bg-muted/20 border border-border text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {{ event.description }}
            </div>
          </div>

          <!-- Organizer -->
          <div class="p-3.5 rounded-2xl bg-muted/20 border border-border flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-kv-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
              {{ (event.createdBy.profile?.fullName || event.createdBy.email).substring(0, 2) }}
            </div>
            <div class="min-w-0 flex-1 text-sm">
              <p class="text-xs text-muted-foreground">Penyelenggara</p>
              <p class="font-semibold text-foreground truncate">
                {{ event.createdBy.profile?.fullName || event.createdBy.email.split('@')[0] }}
              </p>
            </div>
          </div>

          <!-- RSVP Status & Actions (for attendee) -->
          <div v-if="myAttendance" class="p-4 rounded-3xl bg-accent/40 border border-border space-y-2.5">
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-foreground">Status Kehadiran Kamu</p>
              <span
                class="text-xs font-semibold px-2.5 py-0.5 rounded-xl"
                :class="rsvpBadge(myAttendance.status)"
              >
                {{ rsvpLabel(myAttendance.status) }}
              </span>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                :variant="myAttendance.status === 'ACCEPTED' ? 'default' : 'outline'"
                @click="emit('rsvp', event.id, 'ACCEPTED')"
                :disabled="isLoading"
                class="flex-1 rounded-2xl text-xs h-9"
                :class="myAttendance.status === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''"
              >
                Hadir
              </Button>
              <Button
                size="sm"
                :variant="myAttendance.status === 'TENTATIVE' ? 'default' : 'outline'"
                @click="emit('rsvp', event.id, 'TENTATIVE')"
                :disabled="isLoading"
                class="flex-1 rounded-2xl text-xs h-9"
                :class="myAttendance.status === 'TENTATIVE' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''"
              >
                Ragu-ragu
              </Button>
              <Button
                size="sm"
                :variant="myAttendance.status === 'DECLINED' ? 'default' : 'outline'"
                @click="emit('rsvp', event.id, 'DECLINED')"
                :disabled="isLoading"
                class="flex-1 rounded-2xl text-xs h-9"
                :class="myAttendance.status === 'DECLINED' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''"
              >
                Tidak Hadir
              </Button>
            </div>
          </div>

          <!-- Attendees List -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-muted-foreground">
                Daftar Peserta ({{ event.attendees.length }})
              </span>
              <div class="flex items-center gap-2 text-muted-foreground">
                <span class="text-emerald-600 font-medium">{{ acceptedCount }} Hadir</span>
                <span>&bull;</span>
                <span class="text-rose-600 font-medium">{{ declinedCount }} Menolak</span>
              </div>
            </div>

            <div class="border border-border rounded-3xl divide-y divide-border/60 max-h-48 overflow-y-auto bg-muted/10">
              <div
                v-for="att in event.attendees"
                :key="att.id"
                class="px-3.5 py-2.5 flex items-center justify-between text-sm hover:bg-accent/30 transition-colors"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-semibold text-xs text-foreground shrink-0 border border-border">
                    {{ (att.user.profile?.fullName || att.user.email).substring(0, 2) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-foreground text-xs truncate">
                      {{ att.user.profile?.fullName || att.user.email.split('@')[0] }}
                    </p>
                    <p class="text-[11px] text-muted-foreground truncate">{{ att.user.email }}</p>
                  </div>
                </div>

                <span
                  class="text-[11px] font-medium px-2 py-0.5 rounded-xl shrink-0"
                  :class="rsvpBadge(att.status)"
                >
                  {{ rsvpLabel(att.status) }}
                </span>
              </div>

              <div v-if="event.attendees.length === 0" class="p-4 text-center text-xs text-muted-foreground">
                Tidak ada peserta spesifik yang ditugaskan (Acara terbuka untuk umum).
              </div>
            </div>
          </div>
        </TabsContent>

        <!-- TAB 2: NOTES (WYSIWYG TIPTAP) -->
        <TabsContent value="notes" class="space-y-3 py-2 overflow-y-auto pr-1 flex-1 focus:outline-none">
          <!-- Visibility Setting (Hanya Penyelenggara/Admin) -->
          <div class="p-3.5 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="text-xs">
              <p class="font-semibold text-foreground">Pengaturan Visibilitas Catatan</p>
              <p class="text-muted-foreground mt-0.5">
                {{ visibilityDescription }}
              </p>
            </div>

            <select
              v-if="isOrganizerOrAdmin"
              v-model="localNotesVisibility"
              class="h-9 px-3 rounded-2xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-kv-primary shrink-0"
            >
              <option value="ORGANIZER_ONLY">Hanya Penyelenggara</option>
              <option value="ATTENDEES_VIEW">Peserta Hanya Lihat (View-Only)</option>
              <option value="ATTENDEES_EDIT">Peserta Boleh Mengedit (Kolaboratif)</option>
            </select>

            <span
              v-else
              class="text-xs font-semibold px-2.5 py-1 rounded-xl bg-accent text-accent-foreground border border-border shrink-0 self-start sm:self-auto"
            >
              {{ visibilityBadgeLabel }}
            </span>
          </div>

          <!-- Rich Text Editor -->
          <TiptapEditor
            v-model="localNotesContent"
            :editable="canEditNotes"
            placeholder="Tuliskan poin hasil meeting, keputusan, atau daftar tugas tim di sini..."
            min-height="280px"
          />

          <!-- Action Save Notes Button -->
          <div v-if="canEditNotes" class="flex items-center justify-between pt-1">
            <p class="text-xs text-muted-foreground">
              Perubahan disimpan sebagai catatan resmi acara ini.
            </p>
            <Button
              size="sm"
              @click="saveNotes"
              :disabled="isSavingNotes"
              class="rounded-2xl bg-kv-primary hover:bg-kv-primary/90 text-white text-xs px-4 h-9"
            >
              {{ isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan' }}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter class="pt-3 border-t border-border flex items-center justify-end shrink-0">
        <Button
          variant="outline"
          @click="emit('update:open', false)"
          class="rounded-3xl text-sm"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import TiptapEditor from './TiptapEditor.vue'
import { useCalendarApi } from '../api/calendar.api'
import type { CalendarEventItem, AttendeeStatus, NotesVisibility } from '../types/calendar.types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  event?: CalendarEventItem | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'edit': [event: CalendarEventItem]
  'cancel': [eventId: number]
  'rsvp': [eventId: number, status: AttendeeStatus]
  'notes-updated': [event: CalendarEventItem]
}>()

const { user } = useAuth()
const api = useCalendarApi()

const activeTab = ref('detail')
const localNotesContent = ref('')
const localNotesVisibility = ref<NotesVisibility>('ATTENDEES_VIEW')
const isSavingNotes = ref(false)

watch(() => props.event, (ev) => {
  if (ev) {
    localNotesContent.value = ev.notesContent || ''
    localNotesVisibility.value = ev.notesVisibility || 'ATTENDEES_VIEW'
  }
}, { immediate: true })

const isOrganizerOrAdmin = computed(() => {
  if (!props.event || !user.value) return false
  return user.value.role === 'ADMIN' || props.event.createdById === user.value.id
})

const canEditNotes = computed(() => {
  if (!props.event) return false
  if (isOrganizerOrAdmin.value) return true
  return props.event.notesVisibility === 'ATTENDEES_EDIT'
})

const visibilityBadgeLabel = computed(() => {
  if (props.event?.notesVisibility === 'ATTENDEES_EDIT') return 'Kolaboratif (Bisa Edit)'
  if (props.event?.notesVisibility === 'ORGANIZER_ONLY') return 'Hanya Penyelenggara'
  return 'Hanya Baca (View-Only)'
})

const visibilityDescription = computed(() => {
  if (localNotesVisibility.value === 'ATTENDEES_EDIT') {
    return 'Semua peserta yang terdaftar dapat membaca dan menulis catatan bersama.'
  }
  if (localNotesVisibility.value === 'ORGANIZER_ONLY') {
    return 'Catatan terkunci dan hanya dapat dibaca oleh Anda sebagai penyelenggara.'
  }
  return 'Peserta hanya dapat membaca catatan tanpa izin mengedit isi dokumen.'
})

const saveNotes = async () => {
  if (!props.event) return
  isSavingNotes.value = true
  try {
    await api.updateNotes(props.event.id, {
      notesContent: localNotesContent.value,
      notesVisibility: isOrganizerOrAdmin.value ? localNotesVisibility.value : undefined
    })
    toast.success('Catatan agenda berhasil disimpan')
    if (props.event) {
      props.event.notesContent = localNotesContent.value
      props.event.notesVisibility = localNotesVisibility.value
    }
  } catch (err: any) {
    toast.error('Gagal menyimpan catatan: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    isSavingNotes.value = false
  }
}

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

const typeLabels: Record<string, { label: string; badge: string }> = {
  MEETING: { label: 'Meeting / Rapat', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  WORKSHOP: { label: 'Workshop & Mentoring', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  PROJECT_DEADLINE: { label: 'Batas Waktu Proyek', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  TASK: { label: 'Penugasan', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  COMPANY_EVENT: { label: 'Agenda Seluruh Kantor', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  OTHER: { label: 'Agenda Lainnya', badge: 'bg-muted text-muted-foreground' }
}

const typeStyle = computed(() => {
  if (!props.event) return { label: 'Acara', badge: 'bg-muted text-muted-foreground' }
  return typeLabels[props.event.type] || typeLabels.OTHER
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
  const end = props.event.endDate ? formatTime(props.event.endDate) : ''
  return end ? (start + ' - ' + end + ' WIB') : (start + ' WIB')
})

const rsvpLabel = (status: AttendeeStatus) => {
  switch (status) {
    case 'ACCEPTED': return 'Hadir'
    case 'DECLINED': return 'Tidak Hadir'
    case 'TENTATIVE': return 'Ragu-ragu'
    case 'ORGANIZER': return 'Penyelenggara'
    default: return 'Belum Konfirmasi'
  }
}

const rsvpBadge = (status: AttendeeStatus) => {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'DECLINED': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    case 'TENTATIVE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    case 'ORGANIZER': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    default: return 'bg-muted text-muted-foreground'
  }
}
</script>
