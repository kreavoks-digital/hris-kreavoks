<template>
  <div class="grid gap-4 lg:grid-cols-12">
    <!-- Column 1: Attendance Log Table (span 4) -->
    <AttendanceHistoryTable 
      class="lg:col-span-4"
      :logs="logs"
    />

    <!-- Column 2: Clock-in/Clock-out (span 3) -->
    <ClockWidget 
      class="lg:col-span-3"
      :attendance-state="attendanceState"
      :current-time="currentTime"
      :clock-range-text="clockRangeText"
      :status-text="statusText"
      @clock-in="$emit('clock-in')"
      @clock-out="$emit('clock-out', $event)"
    />

    <!-- Column 3: Calendar & Upcoming Events (span 5) -->
    <CalendarWidget 
      class="lg:col-span-5"
      v-model="model"
      :events="events"
      :selected-date="selectedDate"
      :get-custom-indicators="getCustomIndicators"
    />
  </div>
</template>

<script setup lang="ts">
import type { AttendanceLog, CalendarEvent } from '../types'
import AttendanceHistoryTable from './AttendanceHistoryTable.vue'
import ClockWidget from './ClockWidget.vue'
import CalendarWidget from './CalendarWidget.vue'

defineProps<{
  logs: AttendanceLog[]
  events: CalendarEvent[]
  statusText: string
  selectedDate: number
  getCustomIndicators?: (date: any) => Array<'blue' | 'yellow' | 'green'>
  attendanceState: 'not_clocked_in' | 'clocked_in' | 'clocked_out'
  currentTime: string
  clockRangeText: string
}>()

const model = defineModel<any>()

defineEmits(['clock-in', 'clock-out'])
</script>
