<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  modelValue?: string | null
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: '',
  placeholder: 'Pilih tanggal',
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
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

const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

// Parse current modelValue to Date object
const parseModelValue = (val?: string | null): Date => {
  if (!val) return new Date()
  const [y, m, d] = val.split('-').map(Number)
  if (y && m && d) {
    return new Date(y, m - 1, d)
  }
  const parsed = new Date(val)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

const viewDate = ref<Date>(parseModelValue(props.modelValue))

// Keep viewDate in sync when modelValue changes externally
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      viewDate.value = parseModelValue(newVal)
    }
  }
)

const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday start
}

const daysInMonth = computed(() => getDaysInMonth(viewYear.value, viewMonth.value))
const firstDay = computed(() => getFirstDayOfMonth(viewYear.value, viewMonth.value))

const prevMonthDays = computed(() => {
  const res: number[] = []
  const lastDayPrevMonth = new Date(viewYear.value, viewMonth.value, 0).getDate()
  for (let i = firstDay.value - 1; i >= 0; i--) {
    res.push(lastDayPrevMonth - i)
  }
  return res
})

const currentMonthDays = computed(() => {
  const res: number[] = []
  for (let i = 1; i <= daysInMonth.value; i++) {
    res.push(i)
  }
  return res
})

const nextMonthDays = computed(() => {
  const res: number[] = []
  const totalSlots = 42
  const remaining = totalSlots - prevMonthDays.value.length - currentMonthDays.value.length
  for (let i = 1; i <= remaining; i++) {
    res.push(i)
  }
  return res
})

const handlePrevMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

const handleNextMonth = () => {
  viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1)
}

const isSelected = (day: number) => {
  if (!props.modelValue) return false
  const selected = parseModelValue(props.modelValue)
  return (
    selected.getDate() === day &&
    selected.getMonth() === viewMonth.value &&
    selected.getFullYear() === viewYear.value
  )
}

const isToday = (day: number) => {
  const today = new Date()
  return (
    today.getDate() === day &&
    today.getMonth() === viewMonth.value &&
    today.getFullYear() === viewYear.value
  )
}

const formatDateToIso = (year: number, month: number, day: number) => {
  const yStr = String(year)
  const mStr = String(month + 1).padStart(2, '0')
  const dStr = String(day).padStart(2, '0')
  return `${yStr}-${mStr}-${dStr}`
}

const handleSelect = (day: number) => {
  const iso = formatDateToIso(viewYear.value, viewMonth.value, day)
  emit('update:modelValue', iso)
  isOpen.value = false
}

const handleSelectToday = () => {
  const today = new Date()
  viewDate.value = today
  const iso = formatDateToIso(today.getFullYear(), today.getMonth(), today.getDate())
  emit('update:modelValue', iso)
  isOpen.value = false
}

const handleClear = () => {
  emit('update:modelValue', '')
  isOpen.value = false
}

const formattedDisplayDate = computed(() => {
  if (!props.modelValue) return ''
  const [y, m, d] = props.modelValue.split('-').map(Number)
  if (!y || !m || !d) return props.modelValue
  const dayStr = String(d).padStart(2, '0')
  const monthStr = monthShortNames[m - 1] || ''
  return `${dayStr} ${monthStr} ${y}`
})
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        type="button"
        :disabled="disabled"
        :class="cn(
          'h-11 w-full px-3.5 rounded-2xl border border-border bg-background text-sm font-medium transition-colors flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-kv-primary/30 focus:border-kv-primary',
          !modelValue && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          props.class
        )"
      >
        <span class="truncate">
          {{ formattedDisplayDate || placeholder }}
        </span>
        <CalendarIcon class="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
      </button>
    </PopoverTrigger>

    <PopoverContent
      class="w-auto p-0 border border-border rounded-2xl shadow-xl bg-card overflow-hidden"
      align="start"
      :side-offset="6"
    >
      <div class="w-[260px] p-3.5 select-none">
        <!-- Header -->
        <div class="flex items-center justify-between mb-2.5 px-0.5">
          <button
            type="button"
            @click="handlePrevMonth"
            class="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-lg transition-colors"
            title="Bulan sebelumnya"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-sm font-semibold text-foreground">
            {{ monthNames[viewMonth] }} {{ viewYear }}
          </span>
          <button
            type="button"
            @click="handleNextMonth"
            class="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-lg transition-colors"
            title="Bulan berikutnya"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Separator -->
        <div class="h-[1px] bg-border w-full mb-2.5" />

        <!-- Week Days -->
        <div class="grid grid-cols-7 mb-1.5">
          <div
            v-for="(day, i) in days"
            :key="i"
            class="text-center text-xs font-semibold text-muted-foreground py-0.5"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-y-1">
          <!-- Previous Month Days -->
          <div
            v-for="(day, i) in prevMonthDays"
            :key="`prev-${i}`"
            class="text-center text-xs text-muted-foreground/30 py-1.5 cursor-default"
          >
            {{ day }}
          </div>

          <!-- Current Month Days -->
          <div
            v-for="day in currentMonthDays"
            :key="day"
            @click="handleSelect(day)"
            class="text-center text-xs py-1.5 cursor-pointer relative flex items-center justify-center transition group"
          >
            <div
              v-if="isSelected(day)"
              class="absolute inset-0 m-auto w-7 h-7 bg-kv-primary rounded-full z-0"
            />
            <div
              v-else-if="isToday(day)"
              class="absolute inset-0 m-auto w-7 h-7 border border-kv-primary/50 rounded-full z-0"
            />
            <span
              :class="[
                'relative z-10 font-semibold transition-colors',
                isSelected(day) ? 'text-white' : 'text-foreground group-hover:text-kv-primary'
              ]"
            >
              {{ day }}
            </span>
          </div>

          <!-- Next Month Days -->
          <div
            v-for="(day, i) in nextMonthDays"
            :key="`next-${i}`"
            class="text-center text-xs text-muted-foreground/30 py-1.5 cursor-default"
          >
            {{ day }}
          </div>
        </div>

        <!-- Footer Quick Actions -->
        <div class="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
          <button
            type="button"
            @click="handleSelectToday"
            class="text-kv-primary hover:underline font-semibold"
          >
            Hari Ini
          </button>
          <button
            v-if="modelValue"
            type="button"
            @click="handleClear"
            class="text-muted-foreground hover:text-rose-500 font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
