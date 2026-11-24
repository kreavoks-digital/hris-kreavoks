<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-semibold text-foreground">Catatan Agenda</h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Semua catatan rapat dan agenda tim dalam satu tempat.
        </p>
      </div>
      <span class="text-xs text-muted-foreground font-medium shrink-0">
        {{ filteredNotes.length }} catatan
      </span>
    </div>

    <!-- Search -->
    <Card class="bg-card border border-border rounded-3xl p-4 shadow-none">
      <div class="relative flex-1 min-w-[200px]">
        <Search class="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          v-model="searchQuery"
          placeholder="Cari judul agenda atau isi catatan..."
          class="pl-11 h-11 text-sm rounded-3xl border-border bg-background"
        />
      </div>
    </Card>

    <!-- Loading -->
    <Card v-if="isLoading" class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse space-y-2">
          <div class="h-4 w-1/3 rounded bg-muted" />
          <div class="h-3 w-1/4 rounded bg-muted" />
          <div class="h-3 w-full rounded bg-muted" />
        </div>
      </div>
    </Card>

    <!-- Empty state -->
    <Card
      v-else-if="filteredNotes.length === 0"
      class="bg-card border border-border rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-none text-center"
    >
      <FileText class="w-10 h-10 text-muted-foreground mx-auto" />
      <h3 class="text-base font-semibold text-foreground mt-4">
        {{ searchQuery ? 'Tidak ada catatan yang cocok' : 'Belum ada catatan' }}
      </h3>
      <p class="text-sm text-muted-foreground mt-1">
        {{ searchQuery
          ? 'Coba kata kunci lain.'
          : 'Catatan yang ditulis di agenda akan muncul di sini.' }}
      </p>
    </Card>

    <!-- Notes list -->
    <Card
      v-else
      class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none"
    >
      <div class="divide-y divide-border/60">
        <div
          v-for="note in filteredNotes"
          :key="`${note.eventId}-${note.occurrenceDate ?? 'event'}`"
          class="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start gap-3"
        >
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm sm:text-base font-semibold text-foreground truncate">
                {{ note.eventTitle }}
              </h3>
              <Badge variant="outline" size="sm" class="text-[11px] shrink-0">
                {{ visibilityLabel(note.notesVisibility) }}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 shrink-0" />
              {{ noteDateLabel(note) }}
              <span class="text-muted-foreground/60">&bull;</span>
              Diperbarui {{ formatRelative(note.updatedAt) }}
            </p>
            <p class="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
              {{ plainText(note.notesContent) }}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            :icon-left="FileText"
            label="Buka catatan"
            class="shrink-0"
            @click="openNote(note)"
          />
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar, FileText, Search } from 'lucide-vue-next'
import { Badge, Button } from '@kreavoks/kreaui'
import { Input } from '~/components/ui/input'
import { Card } from '~/components/ui/card'
import { useCalendarApi } from './api/calendar.api'
import type { CalendarNoteItem } from './types/calendar.types'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const calendarApi = useCalendarApi()

const notes = ref<CalendarNoteItem[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

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

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${dateStr}T00:00:00`))
}

// Untuk catatan per tanggal pertemuan tampilkan tanggal pertemuannya;
// untuk catatan level event tampilkan tanggal mulai event.
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

const filteredNotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return notes.value
  return notes.value.filter(n =>
    n.eventTitle.toLowerCase().includes(q) ||
    plainText(n.notesContent).toLowerCase().includes(q)
  )
})

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
