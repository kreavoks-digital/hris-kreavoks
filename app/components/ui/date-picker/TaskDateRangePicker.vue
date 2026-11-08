<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  X,
  ChevronRight,
  Repeat
} from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '@/lib/utils'

export interface TaskDateRangeValue {
  startDate?: string | null // YYYY-MM-DD
  dueDate?: string | null   // YYYY-MM-DD
}

interface Props {
  startDate?: string | null
  dueDate?: string | null
  modelValue?: TaskDateRangeValue
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  startDate: '',
  dueDate: '',
  modelValue: undefined,
  placeholder: 'Add dates',
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:dueDate': [value: string]
  'update:modelValue': [value: TaskDateRangeValue]
  'change': [value: TaskDateRangeValue]
}>()

const isOpen = ref(false)
const activeTab = ref<'start' | 'due'>('due')

// Local state for dates
const internalStart = ref<string>(props.modelValue?.startDate || props.startDate || '')
const internalDue = ref<string>(props.modelValue?.dueDate || props.dueDate || '')

watch(
  () => [props.startDate, props.dueDate, props.modelValue],
  () => {
    internalStart.value = props.modelValue?.startDate ?? props.startDate ?? ''
    internalDue.value = props.modelValue?.dueDate ?? props.dueDate ?? ''
  },
  { deep: true }
)

// Calendar navigation view
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth()) // 0 - 11

// Helper date parsing
function parseIso(iso?: string | null): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toIsoString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(iso?: string | null, withYear = false): string {
  const d = parseIso(iso)
  if (!d) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate()
  const month = months[d.getMonth()]
  if (withYear) {
    return `${day} ${month} ${d.getFullYear()}`
  }
  return `${day} ${month}`
}

// Sync view to selected date when popover opens
watch(isOpen, (open) => {
  if (open) {
    const targetIso = activeTab.value === 'start' ? internalStart.value : (internalDue.value || internalStart.value)
    const targetDate = parseIso(targetIso) || new Date()
    viewYear.value = targetDate.getFullYear()
    viewMonth.value = targetDate.getMonth()
  }
})

// Header month / year text
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const weekDayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const currentMonthLabel = computed(() => {
  return `${monthNames[viewMonth.value]} ${viewYear.value}`
})

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

function jumpToToday() {
  const today = new Date()
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
  applyDateToActiveTab(toIsoString(today))
}

// Calendar grid generation
interface DayCell {
  day: number
  iso: string
  isCurrentMonth: boolean
  isToday: boolean
}

const calendarGrid = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstDayOfWeek = new Date(y, m, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrevMonth = new Date(y, m, 0).getDate()

  const todayIso = toIsoString(new Date())
  const cells: DayCell[] = []

  // Trailing days from prev month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const prevDate = new Date(y, m - 1, d)
    const iso = toIsoString(prevDate)
    cells.push({
      day: d,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso
    })
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(y, m, d)
    const iso = toIsoString(currDate)
    cells.push({
      day: d,
      iso,
      isCurrentMonth: true,
      isToday: iso === todayIso
    })
  }

  // Leading days of next month to complete standard grid (up to 35 or 42 cells)
  const remaining = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(y, m + 1, d)
    const iso = toIsoString(nextDate)
    cells.push({
      day: d,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso
    })
  }

  return cells
})

// Quick Presets calculation
interface PresetItem {
  label: string
  subLabel: string
  iso: string
}

const quickPresets = computed<PresetItem[]>(() => {
  const base = new Date()
  base.setHours(0, 0, 0, 0)

  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const addDays = (d: Date, count: number) => {
    const res = new Date(d)
    res.setDate(res.getDate() + count)
    return res
  }

  const today = base
  const tomorrow = addDays(base, 1)

  // Next week (upcoming Monday)
  const dayOfWeek = base.getDay() // 0 = Sun, 1 = Mon ... 6 = Sat
  const daysToNextMonday = ((8 - dayOfWeek) % 7) || 7
  const nextMonday = addDays(base, daysToNextMonday)

  // Next weekend (upcoming Saturday)
  const daysToNextSaturday = ((6 - dayOfWeek + 7) % 7) || 7
  const nextSaturday = addDays(base, daysToNextSaturday)

  const twoWeeks = addDays(base, 14)
  const fourWeeks = addDays(base, 28)
  const eightWeeks = addDays(base, 56)

  return [
    {
      label: 'Today',
      subLabel: dayOfWeekNames[today.getDay()],
      iso: toIsoString(today)
    },
    {
      label: 'Later',
      subLabel: 'This evening',
      iso: toIsoString(today)
    },
    {
      label: 'Tomorrow',
      subLabel: dayOfWeekNames[tomorrow.getDay()],
      iso: toIsoString(tomorrow)
    },
    {
      label: 'Next week',
      subLabel: dayOfWeekNames[nextMonday.getDay()],
      iso: toIsoString(nextMonday)
    },
    {
      label: 'Next weekend',
      subLabel: `${nextSaturday.getDate()} ${monthsShort[nextSaturday.getMonth()]}`,
      iso: toIsoString(nextSaturday)
    },
    {
      label: '2 weeks',
      subLabel: `${twoWeeks.getDate()} ${monthsShort[twoWeeks.getMonth()]}`,
      iso: toIsoString(twoWeeks)
    },
    {
      label: '4 weeks',
      subLabel: `${fourWeeks.getDate()} ${monthsShort[fourWeeks.getMonth()]}`,
      iso: toIsoString(fourWeeks)
    },
    {
      label: '8 weeks',
      subLabel: `${eightWeeks.getDate()} ${monthsShort[eightWeeks.getMonth()]}`,
      iso: toIsoString(eightWeeks)
    }
  ]
})

function applyDateToActiveTab(iso: string) {
  if (activeTab.value === 'start') {
    internalStart.value = iso
    // If due date exists and is before new start date, update due date to match start date
    if (internalDue.value && internalDue.value < iso) {
      internalDue.value = iso
    }
    // Auto switch to due date if due date is not yet set
    if (!internalDue.value) {
      activeTab.value = 'due'
    }
  } else {
    internalDue.value = iso
    // If start date exists and is after new due date, clamp start date
    if (internalStart.value && internalStart.value > iso) {
      internalStart.value = iso
    }
  }

  notifyUpdate()
}

function clearField(field: 'start' | 'due') {
  if (field === 'start') {
    internalStart.value = ''
  } else {
    internalDue.value = ''
  }
  notifyUpdate()
}

function clearAll() {
  internalStart.value = ''
  internalDue.value = ''
  notifyUpdate()
  isOpen.value = false
}

function notifyUpdate() {
  emit('update:startDate', internalStart.value)
  emit('update:dueDate', internalDue.value)
  const payload: TaskDateRangeValue = {
    startDate: internalStart.value || null,
    dueDate: internalDue.value || null
  }
  emit('update:modelValue', payload)
  emit('change', payload)
}

// Cell styling checks
function isStartSelected(iso: string) {
  return internalStart.value === iso
}

function isDueSelected(iso: string) {
  return internalDue.value === iso
}

function isInBetweenRange(iso: string) {
  if (!internalStart.value || !internalDue.value) return false
  return iso > internalStart.value && iso < internalDue.value
}

// Display trigger label
const formattedTriggerLabel = computed(() => {
  if (internalStart.value && internalDue.value) {
    if (internalStart.value === internalDue.value) {
      return formatDisplayDate(internalDue.value, true)
    }
    return `${formatDisplayDate(internalStart.value)} – ${formatDisplayDate(internalDue.value, true)}`
  }
  if (internalDue.value) {
    return formatDisplayDate(internalDue.value, true)
  }
  if (internalStart.value) {
    return `Start: ${formatDisplayDate(internalStart.value, true)}`
  }
  return null
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" :formatted="formattedTriggerLabel" :has-date="!!(internalStart || internalDue)">
        <button
          type="button"
          :disabled="disabled"
          :class="cn(
            'flex items-center justify-between w-full py-1 px-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left cursor-pointer group text-xs',
            disabled && 'opacity-50 cursor-not-allowed',
            props.class
          )"
        >
          <div class="flex items-center gap-2 min-w-0">
            <CalendarIcon class="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" />
            <span v-if="formattedTriggerLabel" class="font-medium text-foreground truncate">
              {{ formattedTriggerLabel }}
            </span>
            <span v-else class="text-muted-foreground truncate">
              {{ placeholder }}
            </span>
          </div>

          <button
            v-if="internalStart || internalDue"
            type="button"
            class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 ml-1"
            title="Reset tanggal"
            @click.stop="clearAll"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </button>
      </slot>
    </PopoverTrigger>

    <PopoverContent
      align="start"
      class="w-[520px] max-w-[95vw] p-3 rounded-2xl border border-border bg-popover shadow-2xl z-[1050] select-none animate-in fade-in-0 zoom-in-95"
      :side-offset="6"
    >
      <!-- Top Row: Start Date & Due Date Inputs -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <!-- Start Date Box -->
        <div
          class="flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all"
          :class="[
            activeTab === 'start'
              ? 'border-kv-primary ring-2 ring-kv-primary/20 bg-background font-semibold text-foreground'
              : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
          ]"
          @click="activeTab = 'start'"
        >
          <div class="flex items-center gap-2 truncate">
            <CalendarIcon class="w-3.5 h-3.5 shrink-0" :class="activeTab === 'start' ? 'text-kv-primary' : 'text-muted-foreground'" />
            <span class="truncate">
              {{ internalStart ? formatDisplayDate(internalStart, true) : 'Start date' }}
            </span>
          </div>

          <button
            v-if="internalStart"
            type="button"
            class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground ml-1"
            title="Hapus Start Date"
            @click.stop="clearField('start')"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Due Date Box -->
        <div
          class="flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all"
          :class="[
            activeTab === 'due'
              ? 'border-kv-primary ring-2 ring-kv-primary/20 bg-background font-semibold text-foreground'
              : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60'
          ]"
          @click="activeTab = 'due'"
        >
          <div class="flex items-center gap-2 truncate">
            <CalendarIcon class="w-3.5 h-3.5 shrink-0" :class="activeTab === 'due' ? 'text-kv-primary' : 'text-muted-foreground'" />
            <span class="truncate">
              {{ internalDue ? formatDisplayDate(internalDue, true) : 'Due date' }}
            </span>
          </div>

          <button
            v-if="internalDue"
            type="button"
            class="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground ml-1"
            title="Hapus Due Date"
            @click.stop="clearField('due')"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Main Body: Two Columns (Left: Presets | Right: Calendar View) -->
      <div class="grid grid-cols-12 gap-3 pt-2 border-t border-border/40">
        <!-- Left Column: Shortcuts / Presets (Ala ClickUp) -->
        <div class="col-span-5 flex flex-col justify-between pr-2 border-r border-border/30 text-xs">
          <div class="space-y-0.5">
            <button
              v-for="preset in quickPresets"
              :key="preset.label"
              type="button"
              class="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-muted/60 text-left transition-colors cursor-pointer group"
              @click="applyDateToActiveTab(preset.iso)"
            >
              <span class="font-medium text-foreground group-hover:text-kv-primary transition-colors">
                {{ preset.label }}
              </span>
              <span class="text-[11px] text-muted-foreground font-normal">
                {{ preset.subLabel }}
              </span>
            </button>
          </div>

          <!-- Bottom Setting: Set Recurring -->
          <div class="pt-2 border-t border-border/30 mt-2">
            <button
              type="button"
              class="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground text-left transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <Repeat class="w-3.5 h-3.5 text-muted-foreground" />
                <span class="font-medium text-xs">Set Recurring</span>
              </div>
              <ChevronRight class="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <!-- Right Column: Interactive Mini Calendar Grid -->
        <div class="col-span-7 pl-1">
          <!-- Calendar Header (Month Year + Today + Chevron Up/Down ala ClickUp) -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-foreground">
              {{ currentMonthLabel }}
            </span>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="text-[11px] font-semibold text-muted-foreground hover:text-kv-primary px-1.5 py-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                @click="jumpToToday"
              >
                Today
              </button>

              <div class="flex items-center gap-0.5 border border-border/40 rounded-lg p-0.5 bg-muted/20">
                <button
                  type="button"
                  class="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Previous month"
                  @click="prevMonth"
                >
                  <ChevronUp class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Next month"
                  @click="nextMonth"
                >
                  <ChevronDown class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Weekday Labels -->
          <div class="grid grid-cols-7 text-center text-[10px] font-semibold text-muted-foreground mb-1">
            <div v-for="w in weekDayLabels" :key="w" class="py-0.5">
              {{ w }}
            </div>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-y-0.5">
            <div
              v-for="cell in calendarGrid"
              :key="cell.iso"
              class="relative flex items-center justify-center p-0.5"
            >
              <!-- In-Between Range Fill -->
              <div
                v-if="isInBetweenRange(cell.iso)"
                class="absolute inset-y-0.5 inset-x-0 bg-rose-500/10 dark:bg-rose-500/20"
              />

              <!-- Start boundary range half fill -->
              <div
                v-if="isStartSelected(cell.iso) && internalDue && internalDue > cell.iso"
                class="absolute inset-y-0.5 right-0 left-1/2 bg-rose-500/10 dark:bg-rose-500/20"
              />

              <!-- Due boundary range half fill -->
              <div
                v-if="isDueSelected(cell.iso) && internalStart && internalStart < cell.iso"
                class="absolute inset-y-0.5 left-0 right-1/2 bg-rose-500/10 dark:bg-rose-500/20"
              />

              <!-- Day Button -->
              <button
                type="button"
                class="relative z-10 w-7 h-7 text-xs rounded-full flex items-center justify-center transition-all cursor-pointer font-medium"
                :class="[
                  !cell.isCurrentMonth ? 'text-muted-foreground/30' : 'text-foreground',
                  isStartSelected(cell.iso) || isDueSelected(cell.iso)
                    ? 'bg-rose-500 text-white font-bold shadow-sm hover:bg-rose-600'
                    : cell.isToday
                      ? 'border border-rose-500 text-rose-500 font-bold hover:bg-rose-500/10'
                      : isInBetweenRange(cell.iso)
                        ? 'text-rose-600 font-semibold'
                        : 'hover:bg-muted/70'
                ]"
                @click="applyDateToActiveTab(cell.iso)"
              >
                {{ cell.day }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

