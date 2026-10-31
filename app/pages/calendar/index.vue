<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Jadwal & Agenda Organisasi</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Kelola rapat, workshop, dan agenda tim ala Teams & Google Calendar.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          @click="openCreateModal()"
          class="rounded-3xl bg-kv-primary hover:bg-kv-primary/90 text-white text-sm px-5"
        >
          <Plus class="w-4 h-4 mr-1.5" />
          Buat Jadwal Baru
        </Button>
      </div>
    </div>

    <!-- Controls & Filters Toolbar -->
    <Card class="bg-card border border-border rounded-3xl p-4 shadow-none">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Month Navigation -->
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="prevMonth"
            class="rounded-2xl border-border h-9 w-9 p-0"
            title="Bulan sebelumnya"
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            @click="goToToday"
            class="rounded-2xl border-border text-xs px-3 h-9 font-medium"
          >
            Hari Ini
          </Button>

          <Button
            variant="outline"
            size="sm"
            @click="nextMonth"
            class="rounded-2xl border-border h-9 w-9 p-0"
            title="Bulan selanjutnya"
          >
            <ChevronRight class="w-4 h-4" />
          </Button>

          <span class="text-base font-bold text-foreground ml-2">
            {{ currentMonthLabel }}
          </span>
        </div>

        <!-- Filter View & Types -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- View Toggle: Semua vs Saya -->
          <div class="flex items-center bg-muted/50 p-1 rounded-2xl border border-border">
            <button
              type="button"
              @click="filterView = 'all'"
              :class="[
                'px-3 py-1 text-xs rounded-xl transition-colors font-medium',
                filterView === 'all' ? 'bg-background text-foreground shadow-none' : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              Semua Agenda
            </button>
            <button
              type="button"
              @click="filterView = 'my'"
              :class="[
                'px-3 py-1 text-xs rounded-xl transition-colors font-medium',
                filterView === 'my' ? 'bg-background text-foreground shadow-none' : 'text-muted-foreground hover:text-foreground'
              ]"
            >
              Agenda Saya
            </button>
          </div>

          <!-- Type filter dropdown -->
          <select
            v-model="filterType"
            class="h-9 px-3 rounded-2xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-kv-primary"
          >
            <option value="ALL">Semua Tipe Acara</option>
            <option value="MEETING">Meeting / Rapat</option>
            <option value="WORKSHOP">Workshop & Mentoring</option>
            <option value="PROJECT_DEADLINE">Batas Waktu Proyek</option>
            <option value="TASK">Penugasan</option>
            <option value="COMPANY_EVENT">Agenda Seluruh Kantor</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>
      </div>
    </Card>

    <!-- Main Calendar Grid -->
    <Card class="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-none overflow-hidden">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-px border-b border-border pb-3 mb-2 text-center text-xs font-semibold text-muted-foreground">
        <div>Sen</div>
        <div>Sel</div>
        <div>Rab</div>
        <div>Kam</div>
        <div>Jum</div>
        <div class="text-rose-500">Sab</div>
        <div class="text-rose-500">Min</div>
      </div>

      <!-- Days Cells Grid -->
      <div class="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr min-h-[560px]">
        <div
          v-for="(day, idx) in calendarGridDays"
          :key="idx"
          @click="handleDayClick(day)"
          :class="[
            'border rounded-2xl p-1.5 sm:p-2 min-h-[85px] sm:min-h-[105px] flex flex-col transition-colors cursor-pointer',
            day.isCurrentMonth ? 'bg-background hover:bg-muted/30 border-border' : 'bg-muted/10 opacity-40 border-transparent',
            day.isToday ? 'ring-2 ring-kv-primary border-transparent' : ''
          ]"
        >
          <!-- Date number header -->
          <div class="flex items-center justify-between mb-1">
            <span
              :class="[
                'text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full',
                day.isToday ? 'bg-kv-primary text-white font-bold' : (day.isWeekend ? 'text-rose-500' : 'text-foreground')
              ]"
            >
              {{ day.date.getDate() }}
            </span>

            <span v-if="day.events.length > 0" class="text-[10px] text-muted-foreground hidden sm:inline">
              {{ day.events.length }} acara
            </span>
          </div>

          <!-- Events on this day -->
          <div class="space-y-1 flex-1 overflow-hidden">
            <div
              v-for="ev in day.events.slice(0, 3)"
              :key="ev.id"
              @click.stop="openDetailModal(ev)"
              class="px-2 py-0.5 rounded-lg text-[11px] truncate font-medium border flex items-center gap-1.5 transition-transform hover:opacity-90"
              :style="{
                backgroundColor: `${ev.color || '#4082E6'}15`,
                borderColor: `${ev.color || '#4082E6'}40`,
                color: ev.color || '#4082E6'
              }"
              :title="ev.title"
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :style="{ backgroundColor: ev.color || '#4082E6' }"
              />
              <span class="truncate">{{ ev.title }}</span>
            </div>

            <!-- More indicator -->
            <div
              v-if="day.events.length > 3"
              class="text-[10px] text-muted-foreground font-medium pl-1"
            >
              +{{ day.events.length - 3 }} lainnya
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modals -->
    <EventModal
      :open="isCreateModalOpen"
      :event="eventToEdit"
      :candidates="candidates"
      :is-loading="isActionLoading"
      @update:open="(val) => isCreateModalOpen = val"
      @submit="submitEvent"
    />

    <EventDetailModal
      :open="isDetailModalOpen"
      :event="selectedEvent"
      :is-loading="isActionLoading"
      @update:open="(val) => isDetailModalOpen = val"
      @edit="openEditModal"
      @cancel="cancelEvent"
      @rsvp="submitRsvp"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import EventModal from './components/EventModal.vue'
import EventDetailModal from './components/EventDetailModal.vue'
import { useCalendarEvents } from './hooks/useCalendarEvents'
import type { CalendarEventItem } from './types/calendar.types'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const {
  events,
  candidates,
  isActionLoading,
  currentDate,
  currentYear,
  currentMonth,
  currentMonthLabel,
  selectedEvent,
  isCreateModalOpen,
  isDetailModalOpen,
  eventToEdit,
  filterType,
  filterView,
  prevMonth,
  nextMonth,
  goToToday,
  openCreateModal,
  openEditModal,
  openDetailModal,
  submitEvent,
  cancelEvent,
  submitRsvp
} = useCalendarEvents()

interface CalendarGridDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  events: CalendarEventItem[]
}

const calendarGridDays = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value - 1
  const firstDayOfMonth = new Date(y, m, 1)
  const lastDayOfMonth = new Date(y, m + 1, 0)

  // Start from Monday (1)
  let dayOfWeek = firstDayOfMonth.getDay()
  // Adjust so Monday is 0, Sunday is 6
  let offset = (dayOfWeek + 6) % 7

  const days: CalendarGridDay[] = []
  const today = new Date()
  const todayDateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  // Days from previous month
  const prevMonthLastDate = new Date(y, m, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthLastDate - i)
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  // Days of current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(y, m, i)
    const isToday = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayDateStr
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  // Days from next month to fill complete weeks (up to 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(y, m + 1, i)
    days.push({
      date: d,
      isCurrentMonth: false,
      isToday: false,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      events: getEventsForDate(d)
    })
  }

  return days
})

const getEventsForDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return events.value.filter(e => {
    const evDate = new Date(e.startDate)
    const evDateStr = `${evDate.getFullYear()}-${pad(evDate.getMonth() + 1)}-${pad(evDate.getDate())}`
    return evDateStr === dateStr
  })
}

const handleDayClick = (day: CalendarGridDay) => {
  openCreateModal(day.date)
}
</script>