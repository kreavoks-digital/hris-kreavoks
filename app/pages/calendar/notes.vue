<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-xl sm:text-2xl font-semibold text-foreground">Catatan Agenda</h1>
      <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
        Semua catatan rapat dan agenda tim dalam satu tempat.
      </p>
    </div>

    <!-- Filter: pencarian + rentang tanggal -->
    <Card class="bg-card border border-border rounded-3xl p-4 shadow-none">
      <div class="flex flex-col md:flex-row gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            v-model="searchQuery"
            placeholder="Cari judul agenda atau isi catatan..."
            class="pl-11 h-11 text-sm rounded-3xl border-border bg-background"
          />
        </div>
        <DateRangePicker
          v-model="dateRange"
          placeholder="Filter tanggal"
          :min-days="1"
          :max-days="365"
          class="md:w-[280px]"
        />
        <Button
          v-if="hasActiveFilter"
          variant="outline"
          size="sm"
          :icon-left="X"
          label="Reset filter"
          class="h-11 shrink-0"
          @click="resetFilters"
        />
      </div>
    </Card>

    <!-- Skeleton loading: meniru bentuk list sebenarnya -->
    <Card
      v-if="isLoading"
      class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none"
    >
      <div class="divide-y divide-border/60">
        <div v-for="i in 5" :key="i" class="py-4 first:pt-1 last:pb-1 flex items-start gap-4">
          <Skeleton class="h-12 w-12 rounded-2xl shrink-0" />
          <div class="flex-1 space-y-2.5 py-0.5">
            <Skeleton class="h-4 w-2/5" />
            <Skeleton class="h-3 w-1/4" />
            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-3/4" />
          </div>
          <Skeleton class="h-8 w-8 rounded-xl shrink-0 hidden sm:block" />
        </div>
      </div>
    </Card>

    <!-- Empty state -->
    <Card
      v-else-if="filteredNotes.length === 0"
      class="bg-card border border-border rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-none"
    >
      <div class="flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <FileText class="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 class="text-base font-semibold text-foreground mt-4">
          {{ hasActiveFilter ? 'Tidak ada catatan yang cocok' : 'Belum ada catatan' }}
        </h3>
        <p class="text-sm text-muted-foreground mt-1 max-w-sm">
          {{ hasActiveFilter
            ? 'Coba ubah kata kunci atau rentang tanggalnya.'
            : 'Catatan yang ditulis di agenda akan muncul di sini.' }}
        </p>
        <Button
          v-if="hasActiveFilter"
          variant="outline"
          size="sm"
          :icon-left="X"
          label="Reset filter"
          class="mt-5"
          @click="resetFilters"
        />
      </div>
    </Card>

    <!-- Daftar catatan -->
    <template v-else>
      <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none">
        <div class="divide-y divide-border/60">
          <button
            v-for="note in pagedNotes"
            :key="`${note.eventId}-${note.occurrenceDate ?? 'event'}`"
            type="button"
            class="w-full py-4 first:pt-1 last:pb-1 flex items-start gap-4 text-left cursor-pointer group"
            @click="openNote(note)"
          >
            <!-- Kotak tanggal -->
            <div
              class="w-12 h-12 rounded-2xl bg-muted flex flex-col items-center justify-center shrink-0"
            >
              <span class="text-base font-bold text-foreground leading-none">
                {{ noteDay(note) }}
              </span>
              <span class="text-[10px] font-semibold text-muted-foreground mt-0.5">
                {{ noteMonthShort(note) }}
              </span>
            </div>

            <!-- Isi -->
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-kv-primary transition-colors">
                  {{ note.eventTitle }}
                </h3>
                <Badge variant="outline" size="sm" class="text-[11px] shrink-0">
                  {{ visibilityLabel(note.notesVisibility) }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground font-medium">
                {{ noteDateLabel(note) }} &bull; Diperbarui {{ formatRelative(note.updatedAt) }}
              </p>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ plainText(note.notesContent) }}
              </p>
            </div>

            <ChevronRight class="w-5 h-5 text-muted-foreground/50 group-hover:text-kv-primary shrink-0 mt-3 transition-colors" />
          </button>
        </div>
      </Card>

      <!-- Pagination -->
      <EmployeePagination
        :page="page"
        :total-pages="totalPages"
        :total-items="filteredNotes.length"
        :limit="PAGE_SIZE"
        @update:page="(p) => page = p"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronRight, FileText, Search, X } from 'lucide-vue-next'
import { Badge, Button } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { DateRangePicker, type DateRangeValue } from '~/components/ui/date-picker'
import EmployeePagination from '../employee/components/EmployeePagination.vue'
import { useCalendarApi } from './api/calendar.api'
import type { CalendarNoteItem } from './types/calendar.types'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const PAGE_SIZE = 10

const calendarApi = useCalendarApi()

const notes = ref<CalendarNoteItem[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const dateRange = ref<DateRangeValue | null>(null)
const page = ref(1)

const visibilityLabel = (visibility: string) => {
  if (visibility === 'ORGANIZER_ONLY') return 'Penyelenggara saja'
  if (visibility === 'ATTENDEES_EDIT') return 'Peserta bisa edit'
  return 'Peserta bisa lihat'
}

// Catatan disimpan sebagai HTML (rich text editor); tampilkan sebagai teks biasa.
const plainText = (html: string) => {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des']

// Tanggal yang dipakai catatan: tanggal pertemuan untuk catatan per
// occurrence, tanggal mulai event untuk catatan level event.
const noteDateStr = (note: CalendarNoteItem) => {
  return note.occurrenceDate ?? note.eventStartDate.slice(0, 10)
}

const noteDay = (note: CalendarNoteItem) => {
  return Number(noteDateStr(note).slice(8, 10))
}

const noteMonthShort = (note: CalendarNoteItem) => {
  return monthShortNames[Number(noteDateStr(note).slice(5, 7)) - 1] ?? ''
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${dateStr}T00:00:00`))
}

const noteDateLabel = (note: CalendarNoteItem) => {
  if (note.occurrenceDate) {
    return `Pertemuan ${formatDate(note.occurrenceDate)}`
  }
  return formatDate(note.eventStartDate.slice(0, 10))
}

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`
  return formatDate(iso.slice(0, 10))
}

const hasActiveFilter = computed(() => {
  return searchQuery.value.trim() !== '' || dateRange.value !== null
})

const filteredNotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const range = dateRange.value
  return notes.value.filter(n => {
    if (q && !n.eventTitle.toLowerCase().includes(q) && !plainText(n.notesContent).toLowerCase().includes(q)) {
      return false
    }
    if (range) {
      const d = noteDateStr(n)
      if (d < range.start || d > range.end) return false
    }
    return true
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredNotes.value.length / PAGE_SIZE))
})

const pagedNotes = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredNotes.value.slice(start, start + PAGE_SIZE)
})

// Kembali ke halaman 1 setiap filter berubah.
watch([searchQuery, dateRange], () => {
  page.value = 1
})

const resetFilters = () => {
  searchQuery.value = ''
  dateRange.value = null
  page.value = 1
}

// Buka halaman edit di tab catatan; untuk catatan per tanggal pertemuan
// sertakan tanggalnya supaya catatan yang dibuka adalah tanggal itu.
const openNote = (note: CalendarNoteItem) => {
  const params = new URLSearchParams({ tab: 'notes' })
  if (note.occurrenceDate) {
    params.set('occurrence', note.occurrenceDate)
  }
  navigateTo(`/calendar/edit/${note.eventId}?${params.toString()}`)
}

onMounted(async () => {
  try {
    notes.value = await calendarApi.getAllNotes()
  } catch (err) {
    console.error('Failed to load notes:', err)
  } finally {
    isLoading.value = false
  }
})
</script>
