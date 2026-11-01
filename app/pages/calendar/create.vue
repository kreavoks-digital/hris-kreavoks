<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Buat Jadwal Baru</h1>
        <p class="text-muted-foreground text-sm mt-0.5">Atur agenda rapat atau kegiatan kerja tim.</p>
      </div>
    </div>

    <!-- Main Content: 2-Column Scheduling Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- LEFT COLUMN: Event Details (7 Cols - Teams Style) -->
      <div class="lg:col-span-7">
        <Card class="border border-border overflow-hidden bg-card/60 backdrop-blur-sm rounded-3xl">
          <CardHeader class="bg-muted/30 border-b border-border pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <Calendar class="h-5 w-5 text-kv-primary" />
                <div>
                  <CardTitle class="text-base font-semibold text-foreground">Detail Agenda</CardTitle>
                  <CardDescription class="text-muted-foreground text-sm">Zona waktu: (UTC+07:00) WIB - Jakarta</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" size="sm">
                {{ form.isAllDay ? 'Sepanjang Hari' : (activeDurationMinutes ? `${activeDurationMinutes} menit` : 'Kustom') }}
              </Badge>
            </div>
          </CardHeader>

          <CardContent class="p-6 space-y-6">
            <!-- 1. Title Row -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <PenLine class="w-4 h-4 text-muted-foreground shrink-0" />
                <Label for="title" class="text-sm font-medium text-foreground">
                  Judul Agenda <span class="text-rose-500">*</span>
                </Label>
              </div>
              <Input
                id="title"
                v-model="form.title"
                placeholder="Tambahkan judul agenda..."
                class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
                required
              />
            </div>

            <!-- 2. Date & Time Studio Row -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
                  <Label class="text-sm font-medium text-foreground">
                    Waktu Pelaksanaan <span class="text-rose-500">*</span>
                  </Label>
                </div>
                <!-- All Day Toggle -->
                <div class="flex items-center gap-2">
                  <Checkbox
                    id="isAllDay"
                    :checked="form.isAllDay"
                    @update:checked="(val) => form.isAllDay = val === true"
                    class="rounded-md"
                  />
                  <Label for="isAllDay" class="text-sm text-muted-foreground font-medium cursor-pointer select-none">
                    Sepanjang hari
                  </Label>
                </div>
              </div>

              <!-- Start & End Date-Time Separated Studio -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Mulai -->
                <div class="space-y-2">
                  <Label class="text-sm text-muted-foreground font-medium">Mulai</Label>
                  <div class="grid" :class="form.isAllDay ? 'grid-cols-1' : 'grid-cols-12 gap-2.5'">
                    <div :class="form.isAllDay ? 'col-span-1' : 'col-span-7'">
                      <DatePicker
                        v-model="startDateOnly"
                        placeholder="Pilih tanggal mulai"
                      />
                    </div>
                    <div v-if="!form.isAllDay" class="col-span-5">
                      <TimePicker
                        v-model="startTimeOnly"
                      />
                    </div>
                  </div>
                </div>

                <!-- Selesai -->
                <div class="space-y-2">
                  <Label class="text-sm text-muted-foreground font-medium">Selesai</Label>
                  <div class="grid" :class="form.isAllDay ? 'grid-cols-1' : 'grid-cols-12 gap-2.5'">
                    <div :class="form.isAllDay ? 'col-span-1' : 'col-span-7'">
                      <DatePicker
                        v-model="endDateOnly"
                        placeholder="Pilih tanggal selesai"
                      />
                    </div>
                    <div v-if="!form.isAllDay" class="col-span-5">
                      <TimePicker
                        v-model="endTimeOnly"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Duration Presets (Teams-like chips) -->
              <div v-if="!form.isAllDay" class="flex items-center gap-2 flex-wrap pt-1">
                <span class="text-sm text-muted-foreground font-medium mr-1">Durasi Cepat:</span>
                <Badge
                  v-for="preset in durationPresets"
                  :key="preset.minutes"
                  :variant="activeDurationMinutes === preset.minutes ? 'primary' : 'secondary'"
                  class="cursor-pointer transition-colors"
                  @click="applyDurationPreset(preset.minutes)"
                >
                  {{ preset.label }}
                </Badge>
              </div>
            </div>

            <!-- 3. Category & Label Color Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Tag class="w-4 h-4 text-muted-foreground shrink-0" />
                  <Label for="category" class="text-sm font-medium text-foreground">Kategori</Label>
                </div>
                <Select v-model="form.type">
                  <SelectTrigger class="rounded-2xl h-11 border-border focus:ring-kv-primary bg-background text-sm">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent class="rounded-2xl">
                    <SelectItem v-for="item in eventTypeOptions" :key="item.value" :value="item.value" class="text-sm">
                      {{ item.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Palette class="w-4 h-4 text-muted-foreground shrink-0" />
                  <Label class="text-sm font-medium text-foreground">Warna Label</Label>
                </div>
                <div class="flex items-center gap-2 pt-0.5 flex-wrap">
                  <button
                    v-for="color in presetColors"
                    :key="color.value"
                    type="button"
                    @click="form.color = color.value"
                    :style="{ backgroundColor: color.value }"
                    :class="[
                      'w-7 h-7 rounded-full transition-all border',
                      form.color === color.value ? 'ring-2 ring-kv-primary ring-offset-2 ring-offset-background scale-110 border-white' : 'border-black/10 hover:scale-105'
                    ]"
                    :title="color.label"
                  />
                </div>
              </div>
            </div>

            <!-- 4. Location & Online Link Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
                  <Label for="location" class="text-sm font-medium text-foreground">Lokasi Ruangan</Label>
                </div>
                <Input
                  id="location"
                  v-model="form.location"
                  placeholder="Contoh: Ruang Meeting A / Kantor"
                  class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
                />
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <Globe class="w-4 h-4 text-muted-foreground shrink-0" />
                  <Label for="eventUrl" class="text-sm font-medium text-foreground">Tautan Daring</Label>
                </div>
                <Input
                  id="eventUrl"
                  v-model="form.eventUrl"
                  placeholder="https://teams.microsoft.com/..."
                  class="h-11 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
                />
              </div>
            </div>

            <!-- 5. Notes & Details Row -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-muted-foreground shrink-0" />
                <Label for="description" class="text-sm font-medium text-foreground">Catatan</Label>
              </div>
              <Textarea
                id="description"
                v-model="form.description"
                rows="4"
                placeholder="Ketik poin pembahasan atau catatan penting untuk peserta..."
                class="border-border focus:ring-kv-primary rounded-2xl text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- RIGHT COLUMN: Assignees & Attendees (5 Cols) -->
      <div class="lg:col-span-5 space-y-6">
        <Card class="border border-border overflow-hidden bg-card/60 backdrop-blur-sm rounded-3xl">
          <CardHeader class="bg-muted/30 border-b border-border pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Users class="h-5 w-5 text-kv-primary" />
                <CardTitle class="text-base font-semibold text-foreground">Peserta Acara</CardTitle>
              </div>
              <Badge variant="secondary" size="sm">
                {{ selectedAttendeeIds.length }} Terpilih
              </Badge>
            </div>
            <CardDescription class="text-muted-foreground text-sm">Tugaskan karyawan yang perlu hadir.</CardDescription>
          </CardHeader>
          <CardContent class="p-6 space-y-4">
            
            <!-- Quick Preset Assign Buttons -->
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground font-medium">Pilih Cepat:</p>
              <div class="flex items-center gap-1.5 flex-wrap">
                <Badge
                  :variant="activeRolePreset === 'ALL' ? 'primary' : 'secondary'"
                  class="cursor-pointer transition-colors"
                  @click="assignRoleUsers('ALL')"
                >
                  Semua
                </Badge>
                <Badge
                  :variant="activeRolePreset === 'INTERN' ? 'primary' : 'secondary'"
                  class="cursor-pointer transition-colors"
                  @click="assignRoleUsers('INTERN')"
                >
                  Intern
                </Badge>
                <Badge
                  :variant="activeRolePreset === 'MENTOR' ? 'primary' : 'secondary'"
                  class="cursor-pointer transition-colors"
                  @click="assignRoleUsers('MENTOR')"
                >
                  Mentor
                </Badge>
                <Badge
                  :variant="activeRolePreset === 'ADMIN' ? 'primary' : 'secondary'"
                  class="cursor-pointer transition-colors"
                  @click="assignRoleUsers('ADMIN')"
                >
                  Admin
                </Badge>
                <button
                  v-if="selectedAttendeeIds.length > 0"
                  type="button"
                  @click="resetAttendees"
                  class="px-2 py-1 text-sm text-rose-500 hover:underline ml-auto font-medium"
                >
                  Reset
                </button>
              </div>
            </div>

            <!-- Live Search Input -->
            <div class="relative">
              <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Cari nama, posisi, divisi, atau email..."
                class="h-11 pl-9 pr-8 rounded-2xl border-border focus:ring-kv-primary text-sm font-medium"
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Selected Attendees Chips -->
            <div v-if="selectedUsersList.length > 0" class="space-y-2 pt-1">
              <p class="text-sm font-semibold text-muted-foreground">
                Peserta Terpilih ({{ selectedUsersList.length }}):
              </p>
              <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-border rounded-2xl bg-muted/20">
                <span
                  v-for="u in selectedUsersList"
                  :key="u.id"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card text-foreground text-sm border border-border font-medium"
                >
                  <Avatar class="h-5 w-5 rounded-full">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName || u.email)}`" />
                    <AvatarFallback class="text-xs">{{ (u.fullName || u.email).charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <span class="truncate max-w-[130px]">{{ u.fullName }}</span>
                  <button
                    type="button"
                    @click="removeAttendee(u.id)"
                    class="text-muted-foreground hover:text-rose-500 transition-colors ml-0.5"
                    title="Hapus"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            </div>

            <!-- Candidate Users List -->
            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-sm text-muted-foreground">
                <div class="flex items-center gap-2">
                  <span>Daftar Karyawan:</span>
                  <span class="font-medium text-foreground">
                    ({{ filteredCandidates.length }})
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    v-if="filteredCandidates.length > 0"
                    type="button"
                    @click="toggleSelectAllFiltered"
                    class="text-xs text-kv-primary hover:underline font-medium"
                  >
                    {{ allFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua yang Tampil' }}
                  </button>
                  <span v-if="isLoadingCandidates" class="text-xs text-muted-foreground">
                    Memuat data...
                  </span>
                </div>
              </div>

              <div
                class="border border-border rounded-2xl max-h-[380px] overflow-y-auto divide-y divide-border bg-card"
                @scroll="onCandidatesScroll"
              >
                <div
                  v-for="u in displayedCandidates"
                  :key="u.id"
                  @click="!isUserDisabled(u) && toggleAttendee(u.id)"
                  :class="[
                    'px-3.5 py-3 flex items-center justify-between text-sm transition-colors',
                    isUserDisabled(u)
                      ? 'opacity-40 grayscale bg-muted/40 cursor-not-allowed select-none'
                      : selectedAttendeeIds.includes(u.id)
                        ? 'bg-muted/60 cursor-pointer hover:bg-muted/70'
                        : 'hover:bg-muted/30 cursor-pointer'
                  ]"
                  :title="isUserDisabled(u) ? `Akun ${getUserStatusLabel(u)} - Tidak dapat ditambahkan ke agenda` : ''"
                >
                  <!-- Left: Avatar & Details -->
                  <div class="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar class="h-10 w-10 rounded-full border border-border shrink-0" :class="{ 'opacity-60': isUserDisabled(u) }">
                      <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.fullName || u.email)}`" />
                      <AvatarFallback class="bg-muted text-muted-foreground font-bold text-sm">
                        {{ (u.fullName || u.email).charAt(0).toUpperCase() }}
                      </AvatarFallback>
                    </Avatar>

                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p
                          class="font-medium text-foreground text-sm truncate leading-tight"
                          :class="{ 'line-through text-muted-foreground': isUserDisabled(u) }"
                        >
                          {{ u.fullName }}
                        </p>
                        <Badge
                          v-if="isUserDisabled(u)"
                          variant="secondary"
                          size="sm"
                          class="font-medium text-[10px] py-0 px-1.5 bg-muted text-muted-foreground border border-border/80"
                        >
                          {{ getUserStatusLabel(u) }}
                        </Badge>
                        <Badge
                          v-else-if="u.position"
                          variant="secondary"
                          size="sm"
                          class="font-normal text-xs"
                        >
                          {{ u.position }}
                        </Badge>
                      </div>
                      <p class="text-sm text-muted-foreground truncate leading-tight mt-0.5">
                        {{ u.email }}
                      </p>
                      <div class="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground font-medium">
                        <span>{{ u.division || u.department || 'Umum' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right: Checkbox -->
                  <div class="flex items-center shrink-0">
                    <Checkbox
                      :checked="selectedAttendeeIds.includes(u.id)"
                      :disabled="isUserDisabled(u)"
                      class="rounded-md pointer-events-none"
                    />
                  </div>
                </div>

                <div v-if="filteredCandidates.length === 0 && !isLoadingCandidates" class="p-6 text-center text-sm text-muted-foreground">
                  Karyawan tidak ditemukan.
                </div>

                <!-- Load More / Pagination indicator -->
                <div
                  v-if="filteredCandidates.length > displayedCandidates.length"
                  class="p-3 text-center bg-muted/20 border-t border-border"
                >
                  <button
                    type="button"
                    @click="loadMoreCandidates"
                    class="text-sm text-kv-primary hover:underline font-medium"
                  >
                    Muat lebih banyak ({{ displayedCandidates.length }} dari {{ filteredCandidates.length }})
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>

    <!-- Fixed Bottom Action Bar -->
    <div
      :class="[
        'fixed bottom-0 right-0 z-30 transition-all duration-300 ease-in-out border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-3.5 shadow-lg',
        isSidebarCollapsed ? 'left-0 lg:left-[76px]' : 'left-0 lg:left-[240px]'
      ]"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          :disabled="isSubmitting"
          @click="navigateTo('/calendar')"
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Simpan Jadwal
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, navigateTo } from '#imports'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Search,
  FileText,
  PenLine,
  Tag,
  Palette,
  Globe
} from 'lucide-vue-next'
import { Button, Badge } from '@kreavoks/kreaui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Checkbox } from '~/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { DatePicker } from '~/components/ui/date-picker'
import { TimePicker } from '~/components/ui/time-picker'
import { useCalendarApi } from './api/calendar.api'
import type { CandidateUser, CreateEventPayload, EventType } from './types/calendar.types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const router = useRouter()
const route = useRoute()
const calendarApi = useCalendarApi()

const isSidebarCollapsed = useState<boolean>('sidebar_is_collapsed', () => false)
const isSubmitting = ref(false)
const isLoadingCandidates = ref(false)
const candidates = ref<CandidateUser[]>([])
const searchQuery = ref('')
const selectedAttendeeIds = ref<number[]>([])
const activeRolePreset = ref<'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN' | null>(null)

// Separated date & time picker states
const startDateOnly = ref('')
const startTimeOnly = ref('09:00')
const endDateOnly = ref('')
const endTimeOnly = ref('10:00')

const form = ref({
  title: '',
  description: '',
  type: 'MEETING' as EventType,
  location: '',
  eventUrl: '',
  startDate: '',
  endDate: '',
  isAllDay: false,
  color: '#4082E6'
})

// Sync separated dates into form payload
const syncFormDates = () => {
  if (!startDateOnly.value) {
    form.value.startDate = ''
  } else if (form.value.isAllDay) {
    form.value.startDate = `${startDateOnly.value}T00:00:00`
  } else {
    form.value.startDate = `${startDateOnly.value}T${startTimeOnly.value || '09:00'}:00`
  }

  if (!endDateOnly.value) {
    form.value.endDate = ''
  } else if (form.value.isAllDay) {
    form.value.endDate = `${endDateOnly.value}T23:59:59`
  } else {
    form.value.endDate = `${endDateOnly.value}T${endTimeOnly.value || '10:00'}:00`
  }
}

watch([startDateOnly, startTimeOnly, endDateOnly, endTimeOnly, () => form.value.isAllDay], () => {
  syncFormDates()
})

const eventTypeOptions = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'PROJECT_DEADLINE', label: 'Batas Waktu Proyek' },
  { value: 'TASK', label: 'Tugas' },
  { value: 'COMPANY_EVENT', label: 'Acara Kantor' },
  { value: 'OTHER', label: 'Lainnya' }
]

const presetColors = [
  { value: '#4082E6', label: 'Biru' },
  { value: '#10B981', label: 'Hijau' },
  { value: '#8B5CF6', label: 'Ungu' },
  { value: '#F59E0B', label: 'Kuning' },
  { value: '#EF4444', label: 'Merah' },
  { value: '#6366F1', label: 'Indigo' }
]

const durationPresets = [
  { label: '30 menit', minutes: 30 },
  { label: '45 menit', minutes: 45 },
  { label: '1 jam', minutes: 60 },
  { label: '2 jam', minutes: 120 }
]

onMounted(async () => {
  const queryDate = route.query.date as string
  const baseDate = queryDate ? new Date(queryDate + 'T09:00:00') : new Date()

  const pad = (n: number) => String(n).padStart(2, '0')
  const yStr = String(baseDate.getFullYear())
  const mStr = pad(baseDate.getMonth() + 1)
  const dStr = pad(baseDate.getDate())
  const hStr = pad(baseDate.getHours())
  const minStr = pad(baseDate.getMinutes())

  startDateOnly.value = `${yStr}-${mStr}-${dStr}`
  startTimeOnly.value = `${hStr}:${minStr}`

  const endDate = new Date(baseDate.getTime() + 60 * 60 * 1000)
  endDateOnly.value = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`
  endTimeOnly.value = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`

  syncFormDates()
  await loadCandidateUsers()
})

const loadCandidateUsers = async () => {
  isLoadingCandidates.value = true
  try {
    candidates.value = await calendarApi.getCandidates()
  } catch (err: any) {
    console.error('Failed to load candidate users:', err)
  } finally {
    isLoadingCandidates.value = false
  }
}

const activeDurationMinutes = computed(() => {
  if (!startDateOnly.value || !endDateOnly.value || form.value.isAllDay) return null
  const [sy, sm, sd] = startDateOnly.value.split('-').map(Number)
  const [sh, smin] = (startTimeOnly.value || '00:00').split(':').map(Number)
  const [ey, em, ed] = endDateOnly.value.split('-').map(Number)
  const [eh, emin] = (endTimeOnly.value || '00:00').split(':').map(Number)

  if (!sy || !sm || !sd || !ey || !em || !ed) return null
  const start = new Date(sy, sm - 1, sd, sh || 0, smin || 0).getTime()
  const end = new Date(ey, em - 1, ed, eh || 0, emin || 0).getTime()
  const diffMinutes = Math.round((end - start) / (60 * 1000))
  return diffMinutes > 0 ? diffMinutes : null
})

const applyDurationPreset = (minutes: number) => {
  if (!startDateOnly.value) return
  const [y, m, d] = startDateOnly.value.split('-').map(Number)
  const [h, min] = (startTimeOnly.value || '09:00').split(':').map(Number)
  if (!y || !m || !d) return

  const start = new Date(y, m - 1, d, h || 0, min || 0)
  const end = new Date(start.getTime() + minutes * 60 * 1000)

  const pad = (n: number) => String(n).padStart(2, '0')
  endDateOnly.value = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
  endTimeOnly.value = `${pad(end.getHours())}:${pad(end.getMinutes())}`
}

const displayLimit = ref(30)

watch(searchQuery, () => {
  displayLimit.value = 30
})

const filteredCandidates = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return candidates.value

  return candidates.value.filter(u => {
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.position && u.position.toLowerCase().includes(q)) ||
      (u.division && u.division.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.customRole && u.customRole.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    )
  })
})

const displayedCandidates = computed(() => {
  return filteredCandidates.value.slice(0, displayLimit.value)
})

const loadMoreCandidates = () => {
  displayLimit.value += 30
}

const onCandidatesScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 60) {
    if (displayLimit.value < filteredCandidates.value.length) {
      displayLimit.value += 30
    }
  }
}

const isUserDisabled = (u: CandidateUser) => {
  if (u.isActive === false) return true
  const st = (u.status || '').toUpperCase()
  return ['TERMINATED', 'SUSPENDED', 'RESIGNED'].includes(st)
}

const getUserStatusLabel = (u: CandidateUser) => {
  const st = (u.status || '').toUpperCase()
  if (st === 'TERMINATED') return 'Terminated'
  if (st === 'SUSPENDED') return 'Suspended'
  if (st === 'RESIGNED') return 'Resigned'
  if (u.isActive === false) return 'Nonaktif'
  return null
}

const allFilteredSelected = computed(() => {
  const selectable = filteredCandidates.value.filter(u => !isUserDisabled(u))
  if (selectable.length === 0) return false
  return selectable.every(u => selectedAttendeeIds.value.includes(u.id))
})

const toggleSelectAllFiltered = () => {
  const selectable = filteredCandidates.value.filter(u => !isUserDisabled(u))
  if (selectable.length === 0) return

  if (allFilteredSelected.value) {
    const idsToRemove = new Set(selectable.map(u => u.id))
    selectedAttendeeIds.value = selectedAttendeeIds.value.filter(id => !idsToRemove.has(id))
  } else {
    const current = new Set(selectedAttendeeIds.value)
    selectable.forEach(u => current.add(u.id))
    selectedAttendeeIds.value = Array.from(current)
  }
  checkActiveRolePreset()
}

const selectedUsersList = computed(() => {
  return candidates.value.filter(u => selectedAttendeeIds.value.includes(u.id))
})

const checkActiveRolePreset = () => {
  const activeCandidates = candidates.value.filter(u => !isUserDisabled(u))
  if (activeCandidates.length === 0 || selectedAttendeeIds.value.length === 0) {
    activeRolePreset.value = null
    return
  }

  const allIds = activeCandidates.map(u => u.id)
  if (allIds.length > 0 && selectedAttendeeIds.value.length === allIds.length && allIds.every(id => selectedAttendeeIds.value.includes(id))) {
    activeRolePreset.value = 'ALL'
    return
  }

  const roles = ['INTERN', 'MENTOR', 'ADMIN'] as const
  for (const r of roles) {
    const roleIds = activeCandidates.filter(u => u.role?.toUpperCase() === r).map(u => u.id)
    if (roleIds.length > 0 && roleIds.length === selectedAttendeeIds.value.length && roleIds.every(id => selectedAttendeeIds.value.includes(id))) {
      activeRolePreset.value = r
      return
    }
  }

  activeRolePreset.value = null
}

const toggleAttendee = (userId: number) => {
  const user = candidates.value.find(u => u.id === userId)
  if (user && isUserDisabled(user)) return

  const idx = selectedAttendeeIds.value.indexOf(userId)
  if (idx > -1) {
    selectedAttendeeIds.value.splice(idx, 1)
  } else {
    selectedAttendeeIds.value.push(userId)
  }
  checkActiveRolePreset()
}

const removeAttendee = (userId: number) => {
  const idx = selectedAttendeeIds.value.indexOf(userId)
  if (idx > -1) {
    selectedAttendeeIds.value.splice(idx, 1)
  }
  checkActiveRolePreset()
}

const resetAttendees = () => {
  selectedAttendeeIds.value = []
  activeRolePreset.value = null
}

const assignRoleUsers = (roleType: 'ALL' | 'INTERN' | 'MENTOR' | 'ADMIN') => {
  if (activeRolePreset.value === roleType) {
    selectedAttendeeIds.value = []
    activeRolePreset.value = null
    return
  }

  activeRolePreset.value = roleType
  const activeCandidates = candidates.value.filter(u => !isUserDisabled(u))
  if (roleType === 'ALL') {
    selectedAttendeeIds.value = activeCandidates.map(u => u.id)
  } else {
    selectedAttendeeIds.value = activeCandidates
      .filter(u => u.role?.toUpperCase() === roleType)
      .map(u => u.id)
  }
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    toast.error('Judul agenda wajib diisi.')
    return
  }

  if (!form.value.startDate) {
    toast.error('Waktu mulai agenda wajib diisi.')
    return
  }

  isSubmitting.value = true
  try {
    const payload: CreateEventPayload = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      type: form.value.type,
      location: form.value.location.trim() || undefined,
      eventUrl: form.value.eventUrl.trim() || undefined,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
      isAllDay: form.value.isAllDay,
      color: form.value.color,
      attendeeIds: selectedAttendeeIds.value
    }

    await calendarApi.createEvent(payload)
    toast.success('Jadwal berhasil disimpan.')
    navigateTo('/calendar')
  } catch (err: any) {
    toast.error('Gagal menyimpan jadwal: ' + (err.message || 'Terjadi kesalahan'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
