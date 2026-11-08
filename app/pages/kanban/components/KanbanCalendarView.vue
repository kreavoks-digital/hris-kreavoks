<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card } from '~/components/ui/card'
import { Button } from '@kreavoks/kreaui'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Check, CheckSquare } from 'lucide-vue-next'
import type { KanbanTask, KanbanColumnDef, TaskStatus } from '../types'

const props = defineProps<{
  tasks: KanbanTask[]
  columns: KanbanColumnDef[]
}>()

const emit = defineEmits<{
  (e: 'taskClick', task: KanbanTask): void
  (e: 'createTask', status: TaskStatus, dateStr?: string): void
  (e: 'toggleComplete', taskId: string): void
}>()

// Current View Month: Default November 2026 atau tanggal hari ini
const currentDate = ref(new Date('2026-11-01T00:00:00'))

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
})

function prevMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

function nextMonth() {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

function goToToday() {
  currentDate.value = new Date()
}

// Map task status to color
const statusColorMap = computed(() => {
  const map: Record<string, string> = {}
  props.columns.forEach(c => {
    map[c.id] = c.color
  })
  return map
})

// Build calendar month grid (Senin - Minggu)
interface CalendarDay {
  date: Date
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  tasks: KanbanTask[]
}

const calendarGridDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Senin as first day of week (0: Sen, ..., 6: Min)
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startingDayOfWeek === -1) startingDayOfWeek = 6

  const days: CalendarDay[] = []

  // Helper date matching (YYYY-MM-DD)
  const toIsoDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const todayStr = toIsoDate(new Date())

  // Previous month padding days
  const prevMonthLastDate = new Date(year, month, 0).getDate()
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDate - i)
    const dateStr = toIsoDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      tasks: props.tasks.filter(t => t.dueDate === dateStr)
    })
  }

  // Current month days
  for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
    const d = new Date(year, month, dayNum)
    const dateStr = toIsoDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      tasks: props.tasks.filter(t => t.dueDate === dateStr)
    })
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i)
    const dateStr = toIsoDate(d)
    const dayOfWeek = d.getDay()
    days.push({
      date: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      tasks: props.tasks.filter(t => t.dueDate === dateStr)
    })
  }

  return days
})
</script>

<template>
  <Card class="bg-card border border-border/40 rounded-3xl p-4 sm:p-5 shadow-none overflow-hidden space-y-3">
    <!-- Calendar Sub-header: Month Controls & Quick Action -->
    <div class="flex items-center justify-between pb-2 border-b border-border/30">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 border border-border/40 bg-muted/20 px-2 py-1 rounded-xl text-xs font-semibold text-foreground">
          <button
            type="button"
            class="p-0.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
            @click="prevMonth"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <span class="px-2 min-w-[130px] text-center capitalize text-xs font-bold text-foreground">
            {{ currentMonthLabel }}
          </span>

          <button
            type="button"
            class="p-0.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Bulan Berikutnya"
            @click="nextMonth"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          class="text-xs px-2.5 py-1 rounded-xl font-medium border border-border/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          @click="goToToday"
        >
          Hari Ini
        </button>
      </div>

      <div class="text-xs text-muted-foreground flex items-center gap-2">
        <span>Total {{ tasks.filter(t => !!t.dueDate).length }} tugas terjadwal</span>
      </div>
    </div>

    <!-- Days of Week Header -->
    <div class="grid grid-cols-7 gap-px border-b border-border/30 pb-2 text-center text-xs font-semibold text-muted-foreground select-none">
      <div>Sen</div>
      <div>Sel</div>
      <div>Rab</div>
      <div>Kam</div>
      <div>Jum</div>
      <div class="text-rose-500">Sab</div>
      <div class="text-rose-500">Min</div>
    </div>

    <!-- Monthly Calendar 7-Column Grid -->
    <div class="grid grid-cols-7 gap-1.5 sm:gap-2 auto-rows-fr min-h-[500px]">
      <div
        v-for="(day, idx) in calendarGridDays"
        :key="idx"
        class="border rounded-2xl p-1.5 sm:p-2 min-h-[85px] sm:min-h-[105px] flex flex-col transition-colors group/cell"
        :class="[
          day.isCurrentMonth ? 'bg-background hover:bg-muted/20 border-border/50' : 'bg-muted/10 opacity-30 border-transparent',
          day.isToday ? 'ring-2 ring-primary border-transparent' : ''
        ]"
      >
        <!-- Date Header Row -->
        <div class="flex items-center justify-between mb-1">
          <span
            class="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full"
            :class="[
              day.isToday ? 'bg-primary text-primary-foreground font-bold' : (day.isWeekend ? 'text-rose-500 font-semibold' : 'text-foreground')
            ]"
          >
            {{ day.date.getDate() }}
          </span>

          <!-- Quick Add on hover -->
          <button
            v-if="day.isCurrentMonth"
            type="button"
            class="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded text-muted-foreground hover:text-primary transition-opacity cursor-pointer"
            title="Tambah tugas di tanggal ini"
            @click.stop="emit('createTask', 'TODO', day.dateStr)"
          >
            <Plus class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Task Badges on this Day -->
        <div class="space-y-1 flex-1 overflow-y-auto max-h-[85px] pr-0.5">
          <div
            v-for="task in day.tasks.slice(0, 3)"
            :key="task.id"
            class="px-1.5 py-1 rounded-lg text-[10px] truncate font-medium border flex items-center justify-between gap-1.5 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs group/item"
            :style="{
              backgroundColor: `${statusColorMap[task.status] || '#4082e6'}18`,
              borderColor: `${statusColorMap[task.status] || '#4082e6'}40`,
              color: 'inherit'
            }"
            :title="`${task.title} (${task.status})`"
            @click.stop="emit('taskClick', task)"
          >
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              <!-- Checkmark Toggle on Hover or When Done -->
              <button
                type="button"
                class="w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                :class="[
                  task.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-border/70 hover:border-emerald-500 text-transparent hover:text-emerald-500'
                ]"
                :title="task.status === 'DONE' ? 'Tandai belum selesai' : 'Tandai selesai'"
                @click.stop="emit('toggleComplete', task.id)"
              >
                <Check class="w-2.5 h-2.5 stroke-[3]" />
              </button>

              <span
                class="truncate font-medium text-foreground"
                :class="{ 'line-through text-muted-foreground/60': task.status === 'DONE' }"
              >
                {{ task.title }}
              </span>
            </div>

            <!-- Mini Checklist Count or Mini Assignee Avatar -->
            <div class="flex items-center gap-1 shrink-0">
              <span
                v-if="task.checklist && task.checklist.length > 0"
                class="text-[9px] text-muted-foreground flex items-center gap-0.5"
                :title="`Subtasks: ${task.checklist.filter(c => c.isCompleted).length}/${task.checklist.length}`"
              >
                <CheckSquare class="w-2.5 h-2.5 opacity-70" />
                <span>{{ task.checklist.filter(c => c.isCompleted).length }}</span>
              </span>

              <!-- Mini Assignee Avatar (if present) -->
              <template v-for="assignee in (task.assignees || []).slice(0, 1)" :key="assignee.id">
                <img
                  :src="assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(assignee.name || 'User')}`"
                  :alt="assignee.name"
                  :title="assignee.name"
                  class="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                />
              </template>
            </div>
          </div>

          <!-- More indicator if tasks > 3 -->
          <div
            v-if="day.tasks.length > 3"
            class="text-[9px] text-muted-foreground font-semibold pl-1"
          >
            +{{ day.tasks.length - 3 }} lainnya
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

