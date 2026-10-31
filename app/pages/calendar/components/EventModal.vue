<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-2xl bg-card border border-border rounded-3xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
      <DialogHeader class="pb-3 border-b border-border shrink-0">
        <DialogTitle class="text-lg font-semibold text-foreground">
          {{ isEditing ? 'Edit Jadwal Acara' : 'Buat Jadwal Baru' }}
        </DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Jadwalkan meeting, workshop, atau agenda tim dengan notifikasi otomatis & email undangan.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-3 overflow-y-auto pr-1 flex-1">
        <!-- Title -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Judul Agenda <span class="text-destructive">*</span></label>
          <Input
            v-model="form.title"
            placeholder="Contoh: Weekly Sync Kreavoks / Onboarding KreaGen Batch 1"
            class="rounded-3xl border-border bg-background text-sm"
            required
          />
        </div>

        <!-- Event Type & Color -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Tipe Agenda</label>
            <select
              v-model="form.type"
              class="w-full h-10 px-3.5 rounded-3xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-kv-primary"
            >
              <option value="MEETING">Meeting / Rapat Tim</option>
              <option value="WORKSHOP">Workshop & Mentoring</option>
              <option value="PROJECT_DEADLINE">Batas Waktu Proyek</option>
              <option value="TASK">Penugasan Khusus</option>
              <option value="COMPANY_EVENT">Agenda Kantor / All-Hands</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Aksen Warna</label>
            <div class="flex items-center gap-2 pt-1">
              <button
                v-for="color in presetColors"
                :key="color.value"
                type="button"
                @click="form.color = color.value"
                :style="{ backgroundColor: color.value }"
                :class="[
                  'w-7 h-7 rounded-full transition-transform border',
                  form.color === color.value ? 'ring-2 ring-kv-primary ring-offset-2 border-transparent scale-110' : 'border-black/10'
                ]"
                :title="color.label"
              />
            </div>
          </div>
        </div>

        <!-- Date & Times -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Waktu Mulai <span class="text-destructive">*</span></label>
            <Input
              v-model="form.startDate"
              type="datetime-local"
              class="rounded-3xl border-border bg-background text-sm"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Waktu Selesai</label>
            <Input
              v-model="form.endDate"
              type="datetime-local"
              class="rounded-3xl border-border bg-background text-sm"
            />
          </div>
        </div>

        <!-- Location & Meet Link -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Lokasi</label>
            <Input
              v-model="form.location"
              placeholder="Ruang Rapat Kreavoks / Online"
              class="rounded-3xl border-border bg-background text-sm"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Tautan Acara / Google Meet</label>
            <Input
              v-model="form.eventUrl"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              class="rounded-3xl border-border bg-background text-sm"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-foreground">Deskripsi & Catatan Agenda</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Tuliskan pokok bahasan atau instruksi persiapan untuk peserta..."
            class="w-full px-4 py-2.5 rounded-3xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-kv-primary resize-none"
          />
        </div>

        <!-- Assignees Section -->
        <div class="space-y-2 pt-2 border-t border-border">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label class="text-sm font-medium text-foreground">
              Tugaskan / Undang Peserta ({{ selectedAttendeeIds.length }} terpilih)
            </label>
            
            <!-- Quick Preset Roles -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs text-muted-foreground mr-1">Cepat:</span>
              <button
                type="button"
                @click="assignRoleUsers('KREAGEN')"
                class="px-2.5 py-1 text-xs rounded-2xl bg-muted hover:bg-kv-primary hover:text-white transition-colors border border-border"
              >
                + KreaGen
              </button>
              <button
                type="button"
                @click="assignRoleUsers('INTERN')"
                class="px-2.5 py-1 text-xs rounded-2xl bg-muted hover:bg-kv-primary hover:text-white transition-colors border border-border"
              >
                + Intern
              </button>
              <button
                type="button"
                @click="assignRoleUsers('MENTOR')"
                class="px-2.5 py-1 text-xs rounded-2xl bg-muted hover:bg-kv-primary hover:text-white transition-colors border border-border"
              >
                + Mentor
              </button>
              <button
                type="button"
                @click="assignRoleUsers('ALL')"
                class="px-2.5 py-1 text-xs rounded-2xl bg-muted hover:bg-kv-primary hover:text-white transition-colors border border-border"
              >
                + Semua
              </button>
            </div>
          </div>

          <!-- Search input -->
          <Input
            v-model="attendeeSearch"
            placeholder="Cari nama atau email rekan kerja..."
            class="rounded-3xl border-border bg-background text-sm"
          />

          <!-- Selected chips -->
          <div v-if="selectedAttendeeIds.length > 0" class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto py-1">
            <span
              v-for="user in selectedUsersList"
              :key="user.id"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-accent text-accent-foreground text-xs border border-border"
            >
              <span>{{ user.fullName }}</span>
              <button
                type="button"
                @click="removeAttendee(user.id)"
                class="text-muted-foreground hover:text-destructive"
              >
                &times;
              </button>
            </span>
          </div>

          <!-- Candidates list -->
          <div class="border border-border rounded-3xl max-h-40 overflow-y-auto divide-y divide-border/60 bg-muted/20">
            <div
              v-for="user in filteredCandidates"
              :key="user.id"
              @click="toggleAttendee(user.id)"
              class="px-3 py-2 flex items-center justify-between hover:bg-accent/50 cursor-pointer transition-colors text-sm"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-full bg-kv-primary/10 text-kv-primary flex items-center justify-center font-semibold text-xs shrink-0">
                  {{ user.fullName.substring(0, 2) }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-foreground text-xs truncate">{{ user.fullName }}</p>
                  <p class="text-[11px] text-muted-foreground truncate">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="user.customRole" class="text-[10px] font-semibold px-2 py-0.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {{ user.customRole }}
                </span>
                <span v-else class="text-[10px] px-2 py-0.5 rounded-xl bg-muted text-muted-foreground">
                  {{ user.role }}
                </span>
                <div
                  :class="[
                    'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                    selectedAttendeeIds.includes(user.id) ? 'bg-kv-primary border-kv-primary text-white' : 'border-border bg-background'
                  ]"
                >
                  <svg v-if="selectedAttendeeIds.includes(user.id)" class="w-3 h-3 fill-current" viewBox="0 0 12 12">
                    <path d="M3.5 6.5L5 8l3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
            <div v-if="filteredCandidates.length === 0" class="p-4 text-center text-xs text-muted-foreground">
              Tidak ada rekan kerja yang cocok dengan pencarian.
            </div>
          </div>
        </div>

        <DialogFooter class="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            @click="emit('update:open', false)"
            class="rounded-3xl text-sm"
          >
            Batal
          </Button>
          <Button
            type="submit"
            :disabled="isLoading"
            class="rounded-3xl bg-kv-primary hover:bg-kv-primary/90 text-white text-sm"
          >
            {{ isLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui Jadwal' : 'Jadwalkan & Kirim Undangan') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import type { CalendarEventItem, CandidateUser, CreateEventPayload, EventType } from '../types/calendar.types'

const props = defineProps<{
  open: boolean
  event?: CalendarEventItem | null
  candidates: CandidateUser[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [payload: CreateEventPayload, eventId?: number]
}>()

const presetColors = [
  { label: 'Biru Kreavoks', value: '#4082E6' },
  { label: 'Kuning Amber', value: '#F59E0B' },
  { label: 'Hijau Emerald', value: '#10B981' },
  { label: 'Ungu Violet', value: '#8B5CF6' },
  { label: 'Merah Rose', value: '#F43F5E' }
]

const isEditing = computed(() => Boolean(props.event && props.event.id))

const form = ref({
  title: '',
  description: '',
  type: 'MEETING' as EventType,
  location: '',
  eventUrl: '',
  startDate: '',
  endDate: '',
  color: '#4082E6'
})

const selectedAttendeeIds = ref<number[]>([])
const attendeeSearch = ref('')

const formatForInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const resetForm = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  const end = new Date(now)
  end.setHours(end.getHours() + 1)

  if (props.event) {
    form.value = {
      title: props.event.title,
      description: props.event.description || '',
      type: props.event.type,
      location: props.event.location || '',
      eventUrl: props.event.eventUrl || '',
      startDate: formatForInput(new Date(props.event.startDate)),
      endDate: props.event.endDate ? formatForInput(new Date(props.event.endDate)) : '',
      color: props.event.color || '#4082E6'
    }
    selectedAttendeeIds.value = props.event.attendees.map(a => a.userId)
  } else {
    form.value = {
      title: '',
      description: '',
      type: 'MEETING',
      location: '',
      eventUrl: '',
      startDate: formatForInput(now),
      endDate: formatForInput(end),
      color: '#4082E6'
    }
    selectedAttendeeIds.value = []
  }
  attendeeSearch.value = ''
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

const filteredCandidates = computed(() => {
  const q = attendeeSearch.value.toLowerCase().trim()
  if (!q) return props.candidates
  return props.candidates.filter(c =>
    c.fullName.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    (c.customRole && c.customRole.toLowerCase().includes(q))
  )
})

const selectedUsersList = computed(() => {
  const idSet = new Set(selectedAttendeeIds.value)
  return props.candidates.filter(c => idSet.has(c.id))
})

const toggleAttendee = (userId: number) => {
  const idx = selectedAttendeeIds.value.indexOf(userId)
  if (idx >= 0) {
    selectedAttendeeIds.value.splice(idx, 1)
  } else {
    selectedAttendeeIds.value.push(userId)
  }
}

const removeAttendee = (userId: number) => {
  selectedAttendeeIds.value = selectedAttendeeIds.value.filter(id => id !== userId)
}

const assignRoleUsers = (roleType: 'KREAGEN' | 'INTERN' | 'MENTOR' | 'ALL') => {
  const targetIds = new Set<number>(selectedAttendeeIds.value)

  props.candidates.forEach(c => {
    if (roleType === 'ALL') {
      targetIds.add(c.id)
    } else if (roleType === 'KREAGEN') {
      if (c.customRole && c.customRole.toLowerCase().includes('kreagen')) {
        targetIds.add(c.id)
      }
    } else if (roleType === 'INTERN') {
      if (c.role === 'INTERN') {
        targetIds.add(c.id)
      }
    } else if (roleType === 'MENTOR') {
      if (c.role === 'MENTOR') {
        targetIds.add(c.id)
      }
    }
  })

  selectedAttendeeIds.value = Array.from(targetIds)
}

const handleSubmit = () => {
  const payload: CreateEventPayload = {
    title: form.value.title,
    description: form.value.description,
    type: form.value.type,
    location: form.value.location,
    eventUrl: form.value.eventUrl,
    startDate: new Date(form.value.startDate).toISOString(),
    endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
    color: form.value.color,
    attendeeIds: selectedAttendeeIds.value
  }

  emit('submit', payload, props.event?.id)
}
</script>