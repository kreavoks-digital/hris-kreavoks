<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="w-[95vw] sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-card border-border rounded-3xl p-4 sm:p-6 shadow-2xl">
      <!-- Header -->
      <DialogHeader class="space-y-1 pb-3.5 border-b border-border pr-8">
        <DialogTitle class="text-base font-bold text-foreground flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-kv-primary/10 text-kv-primary flex items-center justify-center shrink-0">
            <Share2 class="w-4 h-4" />
          </div>
          <span>Bagikan Agenda & Catatan</span>
        </DialogTitle>
        <p class="text-xs text-muted-foreground leading-normal">
          Undang anggota tim via nama / email, atur izin kolaborasi catatan, atau salin tautan agenda.
        </p>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <!-- Invite Input Section with Floating Autocomplete (Khusus Penyelenggara/Admin) -->
        <div v-if="canManageSettings" class="space-y-1.5" ref="searchContainerRef">
          <label class="text-xs font-semibold text-foreground">Undang Anggota Tim</label>
          <div class="relative flex items-center gap-2.5 min-w-0">
            <!-- Standard Input without overrides -->
            <div class="relative flex-1 min-w-0">
              <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama atau ketik email..."
                class="pl-10 pr-9"
                @focus="showDropdown = true"
                @keydown.enter.prevent="handleAddParticipant"
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 z-10"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Standard KreaButton without override -->
            <KreaButton
              type="button"
              variant="primary"
              size="sm"
              :loading="isInviting"
              :disabled="(!selectedUser && !isEmailValid) || isInviting"
              :icon-left="UserPlus"
              label="Undang"
              class="shrink-0"
              @click="handleAddParticipant"
            />

            <!-- Floating Suggestion Dropdown (Popover Positioned) -->
            <div
              v-if="showDropdown && filteredCandidates.length > 0"
              class="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95"
            >
              <button
                v-for="cand in filteredCandidates"
                :key="cand.id"
                type="button"
                @click="selectCandidate(cand)"
                class="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-muted/80 flex items-center justify-between gap-2.5 transition-colors group cursor-pointer"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <Avatar class="h-7 w-7 rounded-full border border-border shrink-0">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cand.fullName || cand.email)}`" />
                    <AvatarFallback class="bg-muted text-muted-foreground font-semibold text-[10px]">
                      {{ (cand.fullName || cand.email).charAt(0).toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <p class="font-medium text-foreground truncate text-xs">{{ cand.fullName }}</p>
                    <p class="text-[10px] text-muted-foreground truncate">{{ cand.email }}</p>
                  </div>
                </div>

                <span class="text-[10px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60 shrink-0">
                  {{ cand.division || '-' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Scope / General Notes Permission Settings -->
        <div class="p-3.5 rounded-2xl bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 text-kv-primary">
              <FileText class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-foreground">Akses Catatan & Notulensi</p>
              <p class="text-[11px] text-muted-foreground truncate">
                Hak akses catatan pertemuan untuk semua peserta
              </p>
            </div>
          </div>

          <div class="w-full sm:w-auto shrink-0">
            <Select
              v-model="currentVisibility"
              :disabled="!canManageSettings"
              @update:model-value="handleVisibilityChange"
            >
              <SelectTrigger class="h-8.5 w-full sm:w-[190px] rounded-xl border-border bg-card text-xs font-medium text-foreground focus:ring-kv-primary">
                <SelectValue placeholder="Pilih izin catatan" />
              </SelectTrigger>
              <SelectContent class="rounded-xl">
                <SelectItem value="ATTENDEES_VIEW" class="text-xs">
                  <div class="flex items-center gap-1.5">
                    <Eye class="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Hanya Lihat (Can view)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ATTENDEES_EDIT" class="text-xs">
                  <div class="flex items-center gap-1.5">
                    <Edit3 class="w-3.5 h-3.5 text-kv-primary" />
                    <span>Bisa Mengedit (Can edit)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ORGANIZER_ONLY" class="text-xs">
                  <div class="flex items-center gap-1.5">
                    <Lock class="w-3.5 h-3.5 text-amber-500" />
                    <span>Terkunci (Organizer only)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Existing People with Access List -->
        <div class="space-y-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label class="text-xs font-semibold text-muted-foreground">
              Orang yang memiliki akses ({{ totalPeopleWithAccess }})
            </label>
            <span class="text-[11px] text-muted-foreground">
              {{ currentVisibility === 'ATTENDEES_EDIT' ? 'Semua peserta bisa edit catatan' : (currentVisibility === 'ORGANIZER_ONLY' ? 'Catatan terkunci' : 'Peserta hanya melihat catatan') }}
            </span>
          </div>

          <div class="max-h-52 overflow-y-auto space-y-1.5 pr-1 -mr-1">
            <!-- Organizer (Owner) -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/50 gap-2">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar class="h-8 w-8 rounded-full border border-border shrink-0">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(event?.createdBy?.profile?.fullName || event?.createdBy?.email || 'Admin')}`" />
                  <AvatarFallback class="bg-kv-primary/10 text-kv-primary font-bold text-xs">
                    {{ (event?.createdBy?.profile?.fullName || event?.createdBy?.email || 'O').charAt(0).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold text-foreground truncate">
                    {{ event?.createdBy?.profile?.fullName || 'Penyelenggara' }}
                  </p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ event?.createdBy?.email }}</p>
                </div>
              </div>
              <Badge variant="primary" size="sm" class="text-[10px] font-semibold px-2 py-0.5 shrink-0">
                Pemilik
              </Badge>
            </div>

            <!-- Attendees List -->
            <div
              v-for="att in event?.attendees || []"
              :key="att.id"
              class="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors group gap-2"
            >
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <Avatar class="h-8 w-8 rounded-full border border-border shrink-0">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(att.user?.profile?.fullName || att.user?.email || 'User')}`" />
                  <AvatarFallback class="bg-muted text-muted-foreground font-semibold text-xs">
                    {{ (att.user?.profile?.fullName || att.user?.email || 'U').charAt(0).toUpperCase() }}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-foreground truncate">
                    {{ att.user?.profile?.fullName || att.user?.email }}
                  </p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ att.user?.email }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <!-- RSVP Status Badge -->
                <Badge
                  variant="outline"
                  size="sm"
                  :class="getRsvpBadgeClass(att.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="[
                    att.status === 'ACCEPTED' ? 'bg-emerald-500' :
                    att.status === 'DECLINED' ? 'bg-rose-500' :
                    att.status === 'TENTATIVE' ? 'bg-amber-500' : 'bg-muted-foreground/40'
                  ]"></span>
                  <span>{{ getRsvpLabel(att.status) }}</span>
                </Badge>

                <!-- Remove Attendee Action (for organizers) -->
                <KreaButton
                  v-if="canManageSettings"
                  type="button"
                  variant="ghost"
                  size="xs"
                  :icon="true"
                  :icon-left="X"
                  :disabled="isRemovingAttendee === att.userId"
                  class="opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Hapus peserta dari jadwal"
                  @click="handleRemoveAttendee(att.userId)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bar: Standard KreaButtons without override -->
      <DialogFooter class="pt-3.5 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
        <KreaButton
          type="button"
          variant="outline"
          size="sm"
          :icon-left="copied ? Check : Link2"
          :label="copied ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Jadwal'"
          class="w-full sm:w-auto justify-center"
          @click="copyShareLink"
        />

        <KreaButton
          type="button"
          variant="primary"
          size="sm"
          label="Selesai"
          class="w-full sm:w-auto justify-center"
          @click="emit('update:open', false)"
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Button as KreaButton } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import {
  Share2,
  Link2,
  Search,
  FileText,
  UserPlus,
  Check,
  X,
  Eye,
  Edit3,
  Lock
} from 'lucide-vue-next'
import { useCalendarApi } from '../api/calendar.api'
import type { CalendarEventItem, CandidateUser, NotesVisibility, AttendeeStatus } from '../types/calendar.types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  event: CalendarEventItem | null
  canManageSettings?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const calendarApi = useCalendarApi()

const searchContainerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedUser = ref<CandidateUser | null>(null)
const candidates = ref<CandidateUser[]>([])
const copied = ref(false)
const isInviting = ref(false)
const isRemovingAttendee = ref<number | null>(null)
const currentVisibility = ref<NotesVisibility>('ATTENDEES_VIEW')

// Tutup dropdown jika user klik di luar area search
onClickOutside(searchContainerRef, () => {
  showDropdown.value = false
})

watch(
  () => props.event,
  (ev) => {
    if (ev) {
      currentVisibility.value = ev.notesVisibility || 'ATTENDEES_VIEW'
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      searchQuery.value = ''
      selectedUser.value = null
      showDropdown.value = false
      if (candidates.value.length === 0) {
        try {
          candidates.value = await calendarApi.getCandidates()
        } catch (e) {
          console.error('Failed to load candidate list:', e)
        }
      }
    }
  }
)

const totalPeopleWithAccess = computed(() => {
  return (props.event?.attendees?.length || 0) + 1
})

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.value.trim())
})

const isUserDisabled = (u: CandidateUser) => {
  if (u.isActive === false) return true
  const st = (u.status || '').toUpperCase()
  return ['TERMINATED', 'SUSPENDED', 'RESIGNED'].includes(st)
}

const filteredCandidates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  // Hanya tampilkan jika user sudah mulai mengetik pencarian
  if (!q) return []

  // Saring yang sudah terdaftar di event attendees atau pemilik
  const existingUserIds = new Set(props.event?.attendees?.map((a) => a.user?.id || a.userId) || [])
  if (props.event?.createdById) existingUserIds.add(props.event.createdById)

  return candidates.value
    .filter(
      (c) =>
        !existingUserIds.has(c.id) &&
        !isUserDisabled(c) &&
        (c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    )
    .slice(0, 6)
})

const selectCandidate = (cand: CandidateUser) => {
  selectedUser.value = cand
  searchQuery.value = cand.fullName || cand.email
  showDropdown.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  selectedUser.value = null
  showDropdown.value = false
}

const handleAddParticipant = async () => {
  if (!props.event || isInviting.value) return

  const targetId = selectedUser.value?.id
  const targetEmail = searchQuery.value.trim()

  if (!targetId && !isEmailValid.value) return

  isInviting.value = true
  try {
    const existingIds = (props.event.attendees || []).map((a) => a.userId)
    const newAttendeeIds = targetId ? [...new Set([...existingIds, targetId])] : existingIds

    await calendarApi.updateEvent(props.event.id, {
      attendeeIds: newAttendeeIds
    } as any)

    toast.success(`Berhasil mengundang ${selectedUser.value?.fullName || targetEmail}`)
    clearSearch()
    emit('updated')
  } catch (err: any) {
    toast.error('Gagal menambahkan anggota: ' + (err.message || 'Error'))
  } finally {
    isInviting.value = false
  }
}

const handleRemoveAttendee = async (attendeeUserId: number) => {
  if (!props.event || isRemovingAttendee.value !== null) return

  isRemovingAttendee.value = attendeeUserId
  try {
    const existingIds = (props.event.attendees || []).map((a) => a.userId)
    const newAttendeeIds = existingIds.filter(id => id !== attendeeUserId)

    await calendarApi.updateEvent(props.event.id, {
      attendeeIds: newAttendeeIds
    } as any)

    toast.success('Peserta berhasil dihapus dari jadwal.')
    emit('updated')
  } catch (err: any) {
    toast.error('Gagal menghapus peserta: ' + (err.message || 'Error'))
  } finally {
    isRemovingAttendee.value = null
  }
}

const handleVisibilityChange = async (val?: any) => {
  if (!props.event) return
  if (val && typeof val === 'string') {
    currentVisibility.value = val as NotesVisibility
  }
  try {
    await calendarApi.updateNotes(props.event.id, {
      notesVisibility: currentVisibility.value
    })
    toast.success('Pengaturan izin akses berhasil diperbarui.')
    emit('updated')
  } catch (err: any) {
    toast.error('Gagal mengubah pengaturan izin: ' + (err.message || 'Error'))
  }
}

const getRsvpBadgeClass = (status: AttendeeStatus) => {
  const base = 'text-xs px-2 py-0 h-5 font-normal flex items-center gap-1 shrink-0 rounded-full'
  switch (status) {
    case 'ACCEPTED':
      return `${base} text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30`
    case 'DECLINED':
      return `${base} text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/30`
    case 'TENTATIVE':
      return `${base} text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30`
    default:
      return `${base} text-muted-foreground border-border bg-muted/30`
  }
}

const getRsvpLabel = (status: AttendeeStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return 'Hadir'
    case 'DECLINED':
      return 'Menolak'
    case 'TENTATIVE':
      return 'Tentatif'
    default:
      return 'Diundang'
  }
}

const copyShareLink = async () => {
  if (typeof window === 'undefined' || !props.event) return

  const url = `${window.location.origin}/calendar/edit/${props.event.id}?tab=notes`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    toast.success('Tautan catatan agenda berhasil disalin ke clipboard.')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    toast.error('Gagal menyalin tautan.')
  }
}
</script>
