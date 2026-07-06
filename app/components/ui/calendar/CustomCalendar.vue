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
          class="h-8 text-xs font-semibold bg-transparent border border-border rounded-md px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-kv-primary appearance-none pr-5 relative"
          style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22%3E%3Cpolyline points=%226 9 12 15 18 9%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 4px center;"
        >
          <option v-for="(name, idx) in MONTHS" :key="idx" :value="idx + 1">{{ name }}</option>
        </select>

        <!-- Year Select -->
        <select
          :value="viewYear"
          @change="onYearChange"
          class="h-8 text-xs font-semibold bg-transparent border border-border rounded-md px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-kv-primary appearance-none pr-5"
          style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22%3E%3Cpolyline points=%226 9 12 15 18 9%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 4px center;"
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

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-y-0.5">
      <div
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        class="flex flex-col items-center"
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
import { computed, ref, watch } from 'vue'

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
const viewYear = ref(props.modelValue?.year ?? now.getFullYear())
const viewMonth = ref(props.modelValue?.month ?? now.getMonth() + 1)

watch(() => props.modelValue, (val) => {
  if (val) {
    viewYear.value = val.year
    viewMonth.value = val.month
  }
})

const yearRange = computed(() => {
  const base = viewYear.value
  const result: number[] = []
  for (let y = base - 10; y <= base + 10; y++) result.push(y)
  return result
})

const calendarCells = computed(() => {
  const cells: (CalendarCell | null)[] = []
  const firstDay = new Date(viewYear.value, viewMonth.value - 1, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null)

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(viewMonth.value).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    cells.push({
      year: viewYear.value,
      month: viewMonth.value,
      day: d,
      iso: `${viewYear.value}-${mm}-${dd}`
    })
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

function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function onMonthChange(e: Event) {
  viewMonth.value = parseInt((e.target as HTMLSelectElement).value)
}

function onYearChange(e: Event) {
  viewYear.value = parseInt((e.target as HTMLSelectElement).value)
}
</script>
