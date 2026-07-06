<template>
  <div class="grid gap-4 lg:grid-cols-12">
    <!-- Column 1: Attendance Log Table (span 4) -->
    <AttendanceHistoryTable 
      class="lg:col-span-4"
      :logs="filteredLogs"
    />

    <!-- Column 2: Clock-in/Clock-out (span 3) -->
    <ClockWidget class="lg:col-span-3" />

    <!-- Column 3: Calendar & Upcoming Events (span 5) -->
    <CalendarWidget
      class="lg:col-span-5"
      :model-value="selectedDateVal"
      @update:model-value="(val) => { context.selectedDateVal.value = val }"
      :events="events"
      :selected-date="selectedDate"
      :current-month-year="currentMonthYear"
      :get-custom-indicators="getCustomIndicators"
      :holidays="holidays"
    />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { DashboardContextKey } from '../context/dashboardContext'
import AttendanceHistoryTable from './AttendanceHistoryTable.vue'
import ClockWidget from './ClockWidget.vue'
import CalendarWidget from './CalendarWidget.vue'

const context = inject(DashboardContextKey)
if (!context) throw new Error('Dashboard context not provided')

const {
  filteredLogs,
  events,
  attendanceStatus,
  selectedDate,
  selectedDateVal,
  currentMonthYear,
  getCustomIndicators,
  attendanceState,
  currentTime,
  clockRangeText,
  handleClockIn,
  handleClockOut,
  submitIzin,
  clockOutLogbook,
  showClockOutModal,
  isIzinModalOpen,
  leaveForm,
  isClockOutFormValid,
  formErrors,
  holidays
} = context
</script>
