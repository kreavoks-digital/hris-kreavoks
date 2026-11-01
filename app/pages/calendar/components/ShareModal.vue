<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-md bg-card border-border rounded-3xl p-6 shadow-none">
      <DialogHeader class="space-y-1 pb-3 border-b border-border">
        <div class="flex items-center justify-between">
          <DialogTitle class="text-base font-bold text-foreground flex items-center gap-2">
            <Share2 class="w-4 h-4 text-kv-primary" />
            <span>Bagikan Agenda & Catatan</span>
          </DialogTitle>
        </div>
        <p class="text-xs text-muted-foreground">
          Undang anggota tim via email / nama, atau salin tautan agenda langsung.
        </p>
      </DialogHeader>

      <div class="space-y-4 py-3">
        <!-- Invite Input & Role Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Undang Anggota Tim</label>
          <div class="relative flex items-center gap-2">
            <div class="relative flex-1">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama atau ketik email..."
                class="w-full pl-9 pr-3 py-2 rounded-2xl bg-muted/40 border border-border text-xs focus:outline-none focus:border-kv-primary"
                @focus="showDropdown = true"
              />
            </div>
            <Button
              size="sm"
              variant="primary"
              :disabled="!selectedUser && !isEmailValid"
              @click="handleAddParticipant"
              class="rounded-2xl text-xs px-3 h-8 shrink-0 bg-kv-primary text-white"
            >
              Undang
            </Button>
          </div>

          <!-- User Suggestion Dropdown -->
          <div
            v-if="showDropdown && filteredCandidates.length > 0"
            class="max-h-48 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-sm space-y-0.5"
          >
            <button
              v-for="cand in filteredCandidates"
              :key="cand.id"
              type="button"
              @click="selectCandidate(cand)"
              class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-muted flex items-center justify-between group transition-colors"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-6 h-6 rounded-full bg-kv-primary/10 text-kv-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                  {{ (cand.fullName || cand.email).charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 truncate">
                  <p class="font-medium text-foreground truncate">{{ cand.fullName }}</p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ cand.email }}</p>
                </div>
              </div>
              <span class="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded-md group-hover:bg-background">
                {{ cand.division || cand.role }}
              </span>
            </button>
          </div>
        </div>

        <!-- General / Scope Access Settings (Figma Style) -->
        <div class="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Globe class="w-4 h-4 text-muted-foreground" />
              <div>
                <p class="text-xs font-semibold text-foreground">Akses Anggota Terdaftar</p>
                <p class="text-[11px] text-muted-foreground">
                  Izin catatan untuk semua peserta yang diundang
                </p>
              </div>
            </div>

            <!-- Permission Dropdown -->
            <select
              v-model="currentVisibility"
              @change="handleVisibilityChange"
              :disabled="!canManageSettings"
              class="text-xs rounded-xl bg-card border border-border px-2.5 py-1.5 font-medium text-foreground focus:outline-none focus:border-kv-primary"
            >
              <option value="ATTENDEES_VIEW">Hanya Lihat (Can view)</option>
              <option value="ATTENDEES_EDIT">Bisa Mengedit (Can edit)</option>
              <option value="ORGANIZER_ONLY">Terkunci (Hanya Penyelenggara)</option>
            </select>
          </div>
        </div>

        <!-- Existing People with Access List -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground">Orang yang Memiliki Akses</label>
          <div class="max-h-44 overflow-y-auto space-y-1.5 pr-1">
            <!-- Organizer (Owner) -->
            <div class="flex items-center justify-between p-2 rounded-2xl bg-muted/20 border border-border/50">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-full bg-kv-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {{ (event?.createdBy?.profile?.fullName || event?.createdBy?.email || 'O').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 truncate">
                  <p class="text-xs font-semibold text-foreground truncate">
                    {{ event?.createdBy?.profile?.fullName || 'Penyelenggara' }}
                  </p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ event?.createdBy?.email }}</p>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-lg bg-muted">
                Pemilik
              </span>
            </div>

            <!-- Attendees List -->
            <div
              v-for="att in event?.attendees || []"
              :key="att.id"
              class="flex items-center justify-between p-2 rounded-2xl hover:bg-muted/40 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                  {{ (att.user?.profile?.fullName || att.user?.email || 'U').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 truncate">
                  <p class="text-xs font-medium text-foreground truncate">
                    {{ att.user?.profile?.fullName || att.user?.email }}
                  </p>
                  <p class="text-[10px] text-muted-foreground truncate">{{ att.user?.email }}</p>
                </div>
              </div>
              <span class="text-[11px] text-muted-foreground">
                {{ currentVisibility === 'ATTENDEES_EDIT' ? 'Dapat mengedit' : (currentVisibility === 'ORGANIZER_ONLY' ? 'Tidak ada akses' : 'Hanya melihat') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Figma-like Bottom Bar: Copy Link & Done Button -->
      <DialogFooter class="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
        <button
          type="button"
          @click="copyShareLink"
          class="flex items-center gap-1.5 text-xs font-semibold text-kv-primary hover:text-kv-primary/80 transition-colors py-1.5 px-2 rounded-xl hover:bg-kv-primary/10"
        >
          <Link2 class="w-4 h-4" />
          <span>{{ copied ? 'Tautan Disalin!' : 'Salin tautan' }}</span>
        </button>

        <Button
          size="sm"
          variant="outline"
          @click="emit('update:open', false)"
          class="rounded-2xl text-xs px-4 h-8"
        >
          Selesai
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Share2, Link2, Globe, Search } from 'lucide-vue-next'
import { useCalendarApi } from '../api/calendar.api'
import type { CalendarEventItem, CandidateUser, NotesVisibility } from '../types/calendar.types'
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

const searchQuery = ref('')
const showDropdown = ref(false)
const selectedUser = ref<CandidateUser | null>(null)
const candidates = ref<CandidateUser[]>([])
const copied = ref(false)
const currentVisibility = ref<NotesVisibility>('ATTENDEES_VIEW')

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
    if (isOpen && candidates.value.length === 0) {
      try {
        candidates.value = await calendarApi.getCandidates()
      } catch (e) {
        console.error('Failed to load candidate list:', e)
      }
    }
  }
)

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.value.trim())
})

const filteredCandidates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return candidates.value.slice(0, 5)

  // Saring yang belum terdaftar di event attendees
  const existingUserIds = new Set(props.event?.attendees?.map((a) => a.user.id) || [])
  if (props.event?.createdById) existingUserIds.add(props.event.createdById)

  return candidates.value
    .filter(
      (c) =>
        !existingUserIds.has(c.id) &&
        (c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    )
    .slice(0, 6)
})

const selectCandidate = (cand: CandidateUser) => {
  selectedUser.value = cand
  searchQuery.value = cand.fullName || cand.email
  showDropdown.value = false
}

const handleAddParticipant = async () => {
  if (!props.event) return

  const targetId = selectedUser.value?.id
  const targetEmail = searchQuery.value.trim()

  try {
    const existingIds = (props.event.attendees || []).map((a) => a.userId)
    const newAttendeeIds = targetId ? [...new Set([...existingIds, targetId])] : existingIds

    await calendarApi.updateEvent(props.event.id, {
      attendeeIds: newAttendeeIds
    } as any)

    toast.success(`Berhasil mengundang ${selectedUser.value?.fullName || targetEmail}`)
    searchQuery.value = ''
    selectedUser.value = null
    showDropdown.value = false
    emit('updated')
  } catch (err: any) {
    toast.error('Gagal menambahkan anggota: ' + (err.message || 'Error'))
  }
}

const handleVisibilityChange = async () => {
  if (!props.event) return
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

const copyShareLink = async () => {
  if (typeof window === 'undefined' || !props.event) return

  const url = `${window.location.origin}/calendar?event=${props.event.id}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    toast.success('Tautan agenda berhasil disalin ke clipboard.')
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch {
    toast.error('Gagal menyalin tautan.')
  }
}
</script>
