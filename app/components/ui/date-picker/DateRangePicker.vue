<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  X,
  Check,
  Info
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { Badge } from '@kreavoks/kreaui'
import { cn } from '@/lib/utils'

export interface DateRangeValue {
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD
}

interface DateRangePickerProps {
  modelValue?: DateRangeValue | null
  placeholder?: string
  minDays?: number
  maxDays?: number
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  modelValue: null,
  placeholder: 'Pilih rentang tanggal',
  minDays: 7,
  maxDays: 31,
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRangeValue | null]
  'change': [value: DateRangeValue | null]
}>()

const isOpen = ref(false)

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const monthShortNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
]

const daysHeader = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

// Parse 'YYYY-MM-DD' to local Date at 00:00:00
const parseIsoToDate = (isoStr?: string | null): Date | null => {
  if (!isoStr) return null
  const [y, m, d] = isoStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

const formatDateToIso = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dateNum = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dateNum}`
}

// Internal selection states
const tempStartDate = ref<Date | null>(parseIsoToDate(props.modelValue?.start))
const tempEndDate = ref<Date | null>(parseIsoToDate(props.modelValue?.end))
const hoveredDate = ref<Date | null>(null)

// Calendar View navigation
const initialViewDate = tempStartDate.value || new Date()
const viewDate = ref<Date>(new Date(initialViewDate.getFullYear(), initialViewDate.getMonth(), 1))

watch(
  () => props.modelValue,
  (val) => {
    tempStartDate.value = parseIsoToDate(val?.start)
    tempEndDate.value = parseIsoToDate(val?.end)
    if (tempStartDate.value) {
      viewDate.value = new Date(tempStartDate.value.getFullYear(), tempStartDate.value.getMonth(), 1)
    }
  },
  { deep: true }
)

const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const prevMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

const nextMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

// Days generation for current view
interface DayCell {
  date: Date
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  iso: string
}

const calendarDays = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value

  const firstDayOfMonth = new Date(y, m, 1)
  const lastDayOfMonth = new Date(y, m + 1, 0)

  // Monday = 0, Sunday = 6
  let dayOfWeek = firstDayOfMonth.getDay()
  let offset = (dayOfWeek + 6) % 7

  const list: DayCell[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // Previous month trailing days
  const prevMonthLastDate = new Date(y, m, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(y, m - 1, prevMonthLastDate - i, 0, 0, 0, 0)
    list.push({
      date: d,
      dayNum: d.getDate(),
      isCurrentMonth: false,
      isToday: d.getTime() === todayTime,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      iso: formatDateToIso(d)
    })
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(y, m, i, 0, 0, 0, 0)
    list.push({
      date: d,
      dayNum: i,
      isCurrentMonth: true,
      isToday: d.getTime() === todayTime,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      iso: formatDateToIso(d)
    })
  }

  // Next month leading days to complete 35 or 42 grid
  const remaining = (7 - (list.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(y, m + 1, i, 0, 0, 0, 0)
    list.push({
      date: d,
      dayNum: i,
      isCurrentMonth: false,
      isToday: d.getTime() === todayTime,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      iso: formatDateToIso(d)
    })
  }

  return list
})

// Calculate difference in days between two dates inclusive
const getDiffInDays = (d1: Date, d2: Date): number => {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  return Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24)) + 1
}

// Current effective range for styling (either tempEnd or hoveredDate)
const effectiveEndDate = computed(() => {
  if (tempEndDate.value) return tempEndDate.value
  if (
    tempStartDate.value &&
    hoveredDate.value &&
    hoveredDate.value.getTime() >= tempStartDate.value.getTime()
  ) {
    return hoveredDate.value
  }
  return null
})

// Current range length in days
const selectedDaysCount = computed(() => {
  if (!tempStartDate.value) return 0
  const end = effectiveEndDate.value || tempStartDate.value
  return getDiffInDays(tempStartDate.value, end)
})

// Validation for current selection
const isRangeValid = computed(() => {
  if (!tempStartDate.value || !tempEndDate.value) return false
  const count = getDiffInDays(tempStartDate.value, tempEndDate.value)
  return count >= props.minDays && count <= props.maxDays
})

// Check if a day is start, end, in-between, or disabled
const isStart = (d: Date) => {
  return !!(tempStartDate.value && d.getTime() === tempStartDate.value.getTime())
}

const isEnd = (d: Date) => {
  const end = effectiveEndDate.value
  return !!(end && d.getTime() === end.getTime())
}

const isStartWithEnd = (d: Date) => {
  const end = effectiveEndDate.value
  return !!(isStart(d) && end && end.getTime() > d.getTime())
}

const isEndWithStart = (d: Date) => {
  const start = tempStartDate.value
  return !!(isEnd(d) && start && start.getTime() < d.getTime())
}

const isInRange = (d: Date) => {
  if (!tempStartDate.value) return false
  const end = effectiveEndDate.value
  if (!end) return false
  const t = d.getTime()
  return t > tempStartDate.value.getTime() && t < end.getTime()
}

// Check if selecting this day as end would exceed maxDays
const isOutOfMaxRange = (d: Date) => {
  if (!tempStartDate.value || tempEndDate.value) return false
  if (d.getTime() < tempStartDate.value.getTime()) return false
  const days = getDiffInDays(tempStartDate.value, d)
  return days > props.maxDays
}

// Handle day click
const handleDayClick = (cell: DayCell) => {
  const clicked = cell.date

  // If no start date or both start and end are already selected, start fresh
  if (!tempStartDate.value || (tempStartDate.value && tempEndDate.value)) {
    tempStartDate.value = clicked
    tempEndDate.value = null
    hoveredDate.value = null
    return
  }

  // If user clicks a date before start date, treat clicked date as new start
  if (clicked < tempStartDate.value) {
    tempStartDate.value = clicked
    tempEndDate.value = null
    return
  }

  // User clicked date after start date
  const count = getDiffInDays(tempStartDate.value, clicked)

  if (count < props.minDays) {
    // If less than minDays, auto-clamp to minimum required days or pick as end with notice
    const clampedEnd = new Date(tempStartDate.value)
    clampedEnd.setDate(clampedEnd.getDate() + (props.minDays - 1))
    tempEndDate.value = clampedEnd
    return
  }

  if (count > props.maxDays) {
    // Exceeds maxDays: clamp to maxDays
    const clampedEnd = new Date(tempStartDate.value)
    clampedEnd.setDate(clampedEnd.getDate() + (props.maxDays - 1))
    tempEndDate.value = clampedEnd
    return
  }

  tempEndDate.value = clicked
}

// Presets
const applyPreset = (daysCount: number) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + (daysCount - 1))

  tempStartDate.value = start
  tempEndDate.value = end
  viewDate.value = new Date(start.getFullYear(), start.getMonth(), 1)
}

const applyCurrentMonthPreset = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 0, 0, 0, 0)

  tempStartDate.value = start
  tempEndDate.value = end
  viewDate.value = new Date(start.getFullYear(), start.getMonth(), 1)
}

// Apply selection and close
const applySelection = () => {
  if (tempStartDate.value && tempEndDate.value && isRangeValid.value) {
    const val: DateRangeValue = {
      start: formatDateToIso(tempStartDate.value),
      end: formatDateToIso(tempEndDate.value)
    }
    emit('update:modelValue', val)
    emit('change', val)
    isOpen.value = false
  }
}

// Clear selection
const clearSelection = () => {
  tempStartDate.value = null
  tempEndDate.value = null
  hoveredDate.value = null
  emit('update:modelValue', null)
  emit('change', null)
  isOpen.value = false
}

// Formatted display in trigger button
const formattedLabel = computed(() => {
  if (!props.modelValue?.start || !props.modelValue?.end) {
    return null
  }
  const s = parseIsoToDate(props.modelValue.start)
  const e = parseIsoToDate(props.modelValue.end)
  if (!s || !e) return null

  const sStr = `${s.getDate()} ${monthShortNames[s.getMonth()]}`
  const eStr = `${e.getDate()} ${monthShortNames[e.getMonth()]} ${e.getFullYear()}`
  const count = getDiffInDays(s, e)

  return {
    text: `${sStr} - ${eStr}`,
    days: count
  }
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        type="button"
        :disabled="disabled"
        :class="cn(
          'inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-muted/60 text-sm sm:text-base font-bold text-foreground transition-all cursor-pointer select-none focus:outline-none min-w-0 max-w-full truncate',
          disabled && 'opacity-50 cursor-not-allowed',
          props.class
        )"
      >
        <span class="truncate font-bold tracking-tight text-foreground">
          {{ formattedLabel ? formattedLabel.text : placeholder }}
        </span>

        <!-- Caret / Dropdown icon (Google Calendar & Teams style) -->
        <ChevronDown
          class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />

        <!-- Reset Button inside trigger if range selected -->
        <span
          v-if="formattedLabel"
          @click.stop="clearSelection"
          class="ml-0.5 p-0.5 rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0 text-muted-foreground hover:text-foreground"
          title="Reset rentang tanggal"
        >
          <X class="w-3.5 h-3.5" />
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent
      class="w-[94vw] max-w-[330px] p-0 border border-border rounded-3xl shadow-2xl bg-card overflow-hidden z-50 animate-in fade-in-0 zoom-in-95"
      align="start"
      :side-offset="8"
    >
      <div class="p-4 space-y-3 select-none">
        <!-- Quick Preset Badges -->
        <div class="space-y-1.5 pb-2.5 border-b border-border">
          <p class="text-[11px] font-medium text-muted-foreground">Pilih Cepat:</p>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              @click="applyPreset(7)"
              class="text-xs px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-kv-primary hover:text-white hover:border-kv-primary transition-all font-medium"
            >
              7 Hari
            </button>
            <button
              type="button"
              @click="applyPreset(14)"
              class="text-xs px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-kv-primary hover:text-white hover:border-kv-primary transition-all font-medium"
            >
              14 Hari
            </button>
            <button
              type="button"
              @click="applyCurrentMonthPreset"
              class="text-xs px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-kv-primary hover:text-white hover:border-kv-primary transition-all font-medium"
            >
              Bulan Ini
            </button>
            <button
              type="button"
              @click="applyPreset(30)"
              class="text-xs px-2.5 py-1 rounded-xl border border-border bg-muted/40 hover:bg-kv-primary hover:text-white hover:border-kv-primary transition-all font-medium"
            >
              30 Hari
            </button>
          </div>
        </div>

        <!-- Month Navigation Header -->
        <div class="flex items-center justify-between px-1">
          <button
            type="button"
            @click="prevMonth"
            class="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Bulan sebelumnya"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-sm font-bold text-foreground">
            {{ monthNames[viewMonth] }} {{ viewYear }}
          </span>
          <button
            type="button"
            @click="nextMonth"
            class="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Bulan berikutnya"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 text-center text-[11px] font-semibold text-muted-foreground pb-1">
          <div v-for="d in daysHeader" :key="d" :class="d === 'Sab' || d === 'Min' ? 'text-rose-500' : ''">
            {{ d }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-y-1">
          <div
            v-for="(cell, i) in calendarDays"
            :key="i"
            class="relative flex items-center justify-center p-0"
            @mouseenter="hoveredDate = cell.date"
            @mouseleave="hoveredDate = null"
          >
            <!-- In-Range Background Fill -->
            <div
              v-if="isInRange(cell.date)"
              class="absolute inset-y-0.5 inset-x-0 bg-kv-primary/15"
            />
            <div
              v-if="isStartWithEnd(cell.date)"
              class="absolute inset-y-0.5 right-0 left-1/2 bg-kv-primary/15"
            />
            <div
              v-if="isEndWithStart(cell.date)"
              class="absolute inset-y-0.5 left-0 right-1/2 bg-kv-primary/15"
            />

            <!-- Day Button -->
            <button
              type="button"
              :disabled="!cell.isCurrentMonth || isOutOfMaxRange(cell.date)"
              @click="handleDayClick(cell)"
              :class="[
                'relative z-10 h-8 w-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all',
                !cell.isCurrentMonth ? 'opacity-25 cursor-default' : 'cursor-pointer',
                isOutOfMaxRange(cell.date) ? 'opacity-20 cursor-not-allowed' : '',
                isStart(cell.date) || isEnd(cell.date)
                  ? 'bg-kv-primary text-white font-bold shadow-sm'
                  : isInRange(cell.date)
                    ? 'text-kv-primary font-bold'
                    : cell.isToday
                      ? 'border border-kv-primary text-kv-primary font-bold'
                      : cell.isWeekend
                        ? 'text-rose-500 hover:bg-muted/70'
                        : 'text-foreground hover:bg-muted/70'
              ]"
            >
              {{ cell.dayNum }}
            </button>
          </div>
        </div>

        <!-- Range Status & Information Helper -->
        <div class="pt-2 border-t border-border space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground flex items-center gap-1">
              <Info class="w-3.5 h-3.5 text-muted-foreground" />
              <span>Min. 7 hari - Maks. 31 hari</span>
            </span>

            <span
              v-if="selectedDaysCount > 0"
              :class="[
                'font-bold px-2 py-0.5 rounded-lg text-[11px]',
                selectedDaysCount >= minDays && selectedDaysCount <= maxDays
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
              ]"
            >
              {{ selectedDaysCount }} hari terpilih
            </span>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              @click="clearSelection"
            >
              Reset
            </Button>

            <div class="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="h-8 px-3 text-xs"
                @click="isOpen = false"
              >
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                class="h-8 px-3.5 text-xs"
                :disabled="!isRangeValid"
                @click="applySelection"
              >
                <Check class="w-3.5 h-3.5 mr-1" />
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
