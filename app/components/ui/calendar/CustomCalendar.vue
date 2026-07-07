<template>
  <div class="custom-calendar w-full select-none">
    <!-- Header: Month/Year Controls -->
    <div class="flex items-center justify-between mb-3">
      <button
        @click="prevMonth"
        class="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div class="flex items-center gap-1">
        <!-- Month Select -->
        <select
          :value="viewMonth"
          @change="onMonthChange"
          class="h-8 text-xs font-semibold bg-background text-foreground border border-border rounded-md px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-kv-primary"
        >
          <option v-for="(name, idx) in MONTHS" :key="idx" :value="idx + 1">{{ name }}</option>
        </select>

        <!-- Year Select -->
        <select
          :value="viewYear"
          @change="onYearChange"
          class="h-8 text-xs font-semibold bg-background text-foreground border border-border rounded-md px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-kv-primary"
        >
          <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <button
        @click="nextMonth"
        class="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <!-- Day Headers -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="d in DAY_NAMES"
        :key="d"
        class="text-center text-[10px] font-medium text-muted-foreground py-1"
      >
        {{ d }}
      </div>
    </div>

    <!-- Calendar Grid - always 6 rows (42 cells) for fixed height -->
    <div class="grid grid-cols-7" style="grid-auto-rows: 40px;">
      <div
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        class="flex flex-col items-center justify-start pt-1"
      >
        <template v-if="cell">
          <button
            @click="selectDate(cell)"
            class="relative h-8 w-8 rounded-full text-xs font-medium transition-all duration-150 flex items-center justify-center"
            :class="getCellClass(cell)"
            :title="getHolidayTitle(cell)"
          >
            {{ cell.day }}
          </button>
          <!-- Indicator dots -->
          <div class="flex gap-0.5 mt-0.5 h-1.5">
            <span
              v-if="isHoliday(cell)"
              class="h-1 w-1 rounded-full bg-amber-400"
            />
            <template v-if="getCustomIndicators">
              <span
                v-for="(color, ci) in getCustomIndicators(cell).filter(c => c !== 'yellow')"
                :key="ci"
                class="h-1 w-1 rounded-full"
                :class="{
                  'bg-blue-500': color === 'blue',
                  'bg-emerald-500': color === 'green'
                }"
              />
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface CalendarCell {
  year: number
  month: number
  day: number
  /** ISO string key: YYYY-MM-DD */
  iso: string
}

const props = defineProps<{
  modelValue?: CalendarCell | null
  holidays?: Record<string, string>
  getCustomIndicators?: (date: CalendarCell) => Array<'blue' | 'yellow' | 'green'>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CalendarCell]
}>()

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const now = new Date()
const viewYear = ref<number>(props.modelValue?.year ?? now.getFullYear())
const viewMonth = ref<number>(props.modelValue?.month ?? now.getMonth() + 1)


const yearRange: number[] = (() => {
  const base = now.getFullYear()
  const result: number[] = []
  for (let y = base - 10; y <= base + 10; y++) result.push(y)
  return result
})()

function onMonthChange(e: Event) {
  viewMonth.value = parseInt((e.target as HTMLSelectElement).value, 10)
}

function onYearChange(e: Event) {
  viewYear.value = parseInt((e.target as HTMLSelectElement).value, 10)
}

function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

const calendarCells = computed(() => {
  const cells: (CalendarCell | null)[] = []
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null)

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    cells.push({
      year,
      month,
      day: d,
      iso: `${year}-${mm}-${dd}`
    })
  }

  // Always pad to exactly 42 cells (6 rows of 7) to prevent height jump
  while (cells.length < 42) {
    cells.push(null)
  }

  return cells
})

const todayIso = (() => {
  const t = new Date()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${t.getFullYear()}-${m}-${d}`
})()

function isToday(cell: CalendarCell) { return cell.iso === todayIso }
function isSelected(cell: CalendarCell) { return props.modelValue?.iso === cell.iso }
function isHoliday(cell: CalendarCell) { return !!props.holidays?.[cell.iso] }
function getHolidayTitle(cell: CalendarCell) { return props.holidays?.[cell.iso] ?? '' }

function getCellClass(cell: CalendarCell) {
  if (isSelected(cell)) {
    return 'bg-kv-primary text-white font-bold hover:bg-kv-primary/90'
  }
  if (isToday(cell)) {
    return 'border-2 border-kv-primary text-kv-primary font-semibold hover:bg-kv-primary/10'
  }
  if (isHoliday(cell)) {
    return 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
  }
  return 'text-foreground hover:bg-accent'
}

function selectDate(cell: CalendarCell) {
  emit('update:modelValue', cell)
}
</script>
