<template>
  <Dialog :open="open" @update:open="(val: boolean) => emit('update:open', val)">
    <DialogContent class="w-[calc(100%-1.5rem)] sm:max-w-[480px] p-0 rounded-3xl bg-popover border border-border flex flex-col overflow-hidden shadow-none">
      <!-- Modal Header -->
      <DialogHeader class="p-5 pb-3 border-b border-border/50 shrink-0 text-left">
        <DialogTitle class="text-lg font-bold text-foreground">
          Set recurrence
        </DialogTitle>
      </DialogHeader>

      <!-- Modal Body -->
      <div class="p-5 sm:p-6 space-y-5 text-sm">
        <!-- 1. Start Date -->
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium text-foreground w-28 shrink-0">Start</Label>
          <div class="flex-1">
            <DatePicker
              :model-value="tempStartDate"
              placeholder="Select start date"
              @update:model-value="(val: string) => onStartDateChange(val)"
            />
          </div>
        </div>

        <!-- 2. Repeat Every -->
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium text-foreground w-28 shrink-0">Repeat every</Label>
          <div class="flex items-center gap-2 flex-1">
            <Input
              type="number"
              v-model.number="tempConfig.interval"
              min="1"
              max="99"
              class="w-16 h-10 rounded-2xl text-center font-semibold border-border bg-background"
            />
            <Select v-model="tempConfig.unit">
              <SelectTrigger class="flex-1 h-10 rounded-2xl border-border bg-background text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="rounded-2xl">
                <SelectItem value="DAY">Day</SelectItem>
                <SelectItem value="WEEK">Week</SelectItem>
                <SelectItem value="MONTH">Month</SelectItem>
                <SelectItem value="YEAR">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 3. Day of Week Circles (Teams Style S M T W T F S) -->
        <div v-if="tempConfig.unit === 'WEEK'" class="pt-1">
          <div class="flex items-center justify-between gap-1 max-w-[340px] mx-auto sm:ml-28">
            <button
              v-for="d in daysOfWeekList"
              :key="d.value"
              type="button"
              @click="toggleDayOfWeek(d.value)"
              :class="[
                'w-9 h-9 rounded-full text-xs font-semibold transition-all flex items-center justify-center cursor-pointer select-none',
                isDaySelected(d.value)
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              ]"
              :title="d.fullName"
            >
              {{ d.letter }}
            </button>
          </div>
        </div>

        <!-- 3B. Specific Day of Month (when unit is Month) -->
        <div v-if="tempConfig.unit === 'MONTH'" class="space-y-2 pt-1 sm:ml-28">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="tempConfig.monthlyMode = 'SAME_DAY'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors',
                tempConfig.monthlyMode !== 'SPECIFIC_DATES'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              ]"
            >
              Tiap tgl {{ currentStartDayNumber }}
            </button>
            <button
              type="button"
              @click="tempConfig.monthlyMode = 'SPECIFIC_DATES'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors',
                tempConfig.monthlyMode === 'SPECIFIC_DATES'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              ]"
            >
              Tiap tgl tertentu
            </button>
          </div>

          <div v-if="tempConfig.monthlyMode === 'SPECIFIC_DATES'" class="grid grid-cols-7 gap-1 pt-1">
            <button
              v-for="day in 31"
              :key="day"
              type="button"
              @click="toggleDayOfMonth(day)"
              :class="[
                'h-7 rounded-lg text-xs font-medium border transition-all flex items-center justify-center',
                (tempConfig.daysOfMonth || []).includes(day)
                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                  : 'bg-background hover:bg-muted text-foreground border-border/50'
              ]"
            >
              {{ day }}
            </button>
          </div>
        </div>

        <!-- 4. End Date Condition -->
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium text-foreground w-28 shrink-0">End</Label>
          <div class="flex items-center gap-2 flex-1">
            <div class="flex-1">
              <DatePicker
                :model-value="tempConfig.endDate || ''"
                placeholder="Select date"
                @update:model-value="(val: string) => {
                  tempConfig.endDate = val
                  tempConfig.endType = val ? 'ON_DATE' : 'NEVER'
                }"
              />
            </div>
            <Button
              v-if="tempConfig.endDate"
              type="button"
              variant="ghost"
              size="xs"
              label="Reset"
              class="text-xs text-muted-foreground hover:text-foreground"
              @click="tempConfig.endDate = ''; tempConfig.endType = 'NEVER'"
            />
          </div>
        </div>

        <!-- 5. Live Summary Sentence (Teams Style) -->
        <div class="pt-2 text-xs text-muted-foreground font-medium sm:ml-28">
          {{ liveSummaryText }}
        </div>
      </div>

      <!-- Modal Footer -->
      <DialogFooter class="p-4 sm:p-5 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          label="Cancel"
          @click="handleCancel"
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          label="Save"
          @click="handleSave"
        />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import { Button } from '@kreavoks/kreaui'
import type { RecurrenceConfig } from '../types/calendar.types'

const props = defineProps<{
  open: boolean
  modelValue: RecurrenceConfig
  startDate: string
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  'update:modelValue': [val: RecurrenceConfig]
  'update:startDate': [val: string]
  'cancel': []
}>()

const handleCancel = () => {
  emit('cancel')
  emit('update:open', false)
}

// Teams single-letter days: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
const daysOfWeekList = [
  { value: 0, letter: 'S', fullName: 'Sunday' },
  { value: 1, letter: 'M', fullName: 'Monday' },
  { value: 2, letter: 'T', fullName: 'Tuesday' },
  { value: 3, letter: 'W', fullName: 'Wednesday' },
  { value: 4, letter: 'T', fullName: 'Thursday' },
  { value: 5, letter: 'F', fullName: 'Friday' },
  { value: 6, letter: 'S', fullName: 'Saturday' }
]

const tempStartDate = ref(props.startDate || '')
const tempConfig = ref<RecurrenceConfig>({
  type: 'CUSTOM',
  interval: 1,
  unit: 'WEEK',
  daysOfWeek: [],
  daysOfMonth: [],
  monthlyMode: 'SAME_DAY',
  endType: 'NEVER',
  endDate: ''
})

const getDayOfWeekFromDate = (dateStr: string): number => {
  if (!dateStr) return new Date().getDay()
  const parts = dateStr.split('-').map(Number)
  const [year, month, day] = parts
  if (year !== undefined && month !== undefined && day !== undefined && !isNaN(year) && !isNaN(month) && !isNaN(day)) {
    return new Date(year, month - 1, day).getDay()
  }
  return new Date(dateStr).getDay()
}

const currentStartDayNumber = computed(() => {
  if (tempStartDate.value) {
    const parts = tempStartDate.value.split('-').map(Number)
    const day = parts[2]
    if (day !== undefined && !isNaN(day)) return day
  }
  return new Date().getDate()
})

const initFromProps = () => {
  tempStartDate.value = props.startDate || ''
  const cfg = props.modelValue || {}
  const startDay = getDayOfWeekFromDate(props.startDate)

  tempConfig.value = {
    type: cfg.type && cfg.type !== 'DOES_NOT_REPEAT' ? cfg.type : 'CUSTOM',
    interval: cfg.interval && cfg.interval > 0 ? cfg.interval : 1,
    unit: cfg.unit || (cfg.type === 'DAILY' ? 'DAY' : cfg.type === 'MONTHLY' ? 'MONTH' : cfg.type === 'YEARLY' ? 'YEAR' : 'WEEK'),
    daysOfWeek: cfg.daysOfWeek && cfg.daysOfWeek.length > 0 ? [...cfg.daysOfWeek] : [startDay],
    daysOfMonth: cfg.daysOfMonth && cfg.daysOfMonth.length > 0 ? [...cfg.daysOfMonth] : [currentStartDayNumber.value],
    monthlyMode: cfg.monthlyMode || 'SAME_DAY',
    endType: cfg.endType || (cfg.endDate ? 'ON_DATE' : 'NEVER'),
    endDate: cfg.endDate || ''
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    initFromProps()
  }
})

const onStartDateChange = (val: string) => {
  tempStartDate.value = val
  emit('update:startDate', val)

  // Update default selected day if currently weekly and only 1 day selected
  if (val && tempConfig.value.unit === 'WEEK') {
    const newDay = getDayOfWeekFromDate(val)
    if (!tempConfig.value.daysOfWeek || tempConfig.value.daysOfWeek.length <= 1) {
      tempConfig.value.daysOfWeek = [newDay]
    }
  }
}

const isDaySelected = (day: number) => {
  return (tempConfig.value.daysOfWeek || []).includes(day)
}

const toggleDayOfWeek = (day: number) => {
  const current = tempConfig.value.daysOfWeek || []
  if (current.includes(day)) {
    // Keep at least 1 day selected
    if (current.length > 1) {
      tempConfig.value.daysOfWeek = current.filter(d => d !== day)
    }
  } else {
    tempConfig.value.daysOfWeek = [...current, day].sort((a, b) => a - b)
  }
}

const toggleDayOfMonth = (day: number) => {
  const current = tempConfig.value.daysOfMonth || []
  if (current.includes(day)) {
    if (current.length > 1) {
      tempConfig.value.daysOfMonth = current.filter(d => d !== day)
    }
  } else {
    tempConfig.value.daysOfMonth = [...current, day].sort((a, b) => a - b)
  }
}

const formatDisplayDate = (dStr: string): string => {
  if (!dStr) return ''
  const parts = dStr.split('-')
  const [year, month, day] = parts
  if (year && month && day) {
    return `${day}/${month}/${year}`
  }
  return dStr
}

// Live Summary Text matching Microsoft Teams
const liveSummaryText = computed(() => {
  const interval = tempConfig.value.interval || 1
  const unit = tempConfig.value.unit || 'WEEK'
  const startDateStr = formatDisplayDate(tempStartDate.value) || 'start date'

  let text = ''

  if (unit === 'DAY') {
    text = interval === 1 ? 'Occurs every day' : `Occurs every ${interval} days`
  } else if (unit === 'WEEK') {
    const daysNames: Record<number, string> = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    }
    const selectedDays = (tempConfig.value.daysOfWeek || []).map(d => daysNames[d]).filter(Boolean)
    const isMonToFri = selectedDays.length === 5 &&
      [1, 2, 3, 4, 5].every(d => (tempConfig.value.daysOfWeek || []).includes(d))

    let daysStr = ''
    if (isMonToFri && interval === 1) {
      daysStr = 'Monday through Friday'
    } else {
      daysStr = selectedDays.length > 0 ? selectedDays.join(', ') : 'week'
    }
    text = interval === 1 ? `Occurs every ${daysStr}` : `Occurs every ${interval} weeks on ${daysStr}`
  } else if (unit === 'MONTH') {
    if (tempConfig.value.monthlyMode === 'SPECIFIC_DATES' && tempConfig.value.daysOfMonth?.length) {
      text = `Occurs every month on day ${tempConfig.value.daysOfMonth.join(', ')}`
    } else {
      text = interval === 1 ? `Occurs every month on day ${currentStartDayNumber.value}` : `Occurs every ${interval} months`
    }
  } else if (unit === 'YEAR') {
    text = interval === 1 ? 'Occurs every year' : `Occurs every ${interval} years`
  }

  text += ` starting ${startDateStr}`

  if (tempConfig.value.endDate) {
    text += ` until ${formatDisplayDate(tempConfig.value.endDate)}`
  }

  return text
})

const handleSave = () => {
  // Determine recurrence type based on unit
  let recType: any = 'CUSTOM'
  const isMonToFri = (tempConfig.value.daysOfWeek || []).length === 5 &&
    [1, 2, 3, 4, 5].every(d => (tempConfig.value.daysOfWeek || []).includes(d))

  if (tempConfig.value.unit === 'DAY' && tempConfig.value.interval === 1 && !tempConfig.value.endDate) {
    recType = 'DAILY'
  } else if (tempConfig.value.unit === 'WEEK' && tempConfig.value.interval === 1 && isMonToFri && !tempConfig.value.endDate) {
    recType = 'EVERY_WEEKDAY'
  } else if (tempConfig.value.unit === 'WEEK' && tempConfig.value.interval === 1 && (tempConfig.value.daysOfWeek?.length === 1) && !tempConfig.value.endDate) {
    recType = 'WEEKLY'
  } else if (tempConfig.value.unit === 'MONTH' && tempConfig.value.interval === 1 && tempConfig.value.monthlyMode !== 'SPECIFIC_DATES' && !tempConfig.value.endDate) {
    recType = 'MONTHLY'
  } else if (tempConfig.value.unit === 'YEAR' && tempConfig.value.interval === 1 && !tempConfig.value.endDate) {
    recType = 'YEARLY'
  }

  const finalConfig: RecurrenceConfig = {
    ...tempConfig.value,
    type: recType
  }

  emit('update:modelValue', finalConfig)
  emit('update:open', false)
}
</script>

