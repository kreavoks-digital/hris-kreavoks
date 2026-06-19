<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    <!-- Stats Section -->
    <StatsSection :stats="stats" />


    <!-- Attendance logs, Clock Widget, Calendar -->
    <AttendanceSection 
      :logs="filteredLogs"
      :events="events"
      :status-text="attendanceStatus"
      :selected-date="selectedDate"
      v-model="selectedDateVal"
      :get-custom-indicators="getCustomIndicators"
      :attendance-state="attendanceState"
      :current-time="currentTime"
      :clock-range-text="clockRangeText"
      @clock-in="handleClockIn"
      @clock-out="handleClockOut"
    />

    <!-- Logbook Section -->
    <LogbookSection 
      :logbooks="filteredLogbooks" 
      @add-logbook="handleAddLogbook"
    />
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from './hooks/useDashboard'
import StatsSection from './components/StatsSection.vue'
import AttendanceSection from './components/AttendanceSection.vue'
import LogbookSection from './components/LogbookSection.vue'

definePageMeta({
  layout: "default",
  middleware: "auth"
})

useSeoMeta({
  title: 'Dashboard | HRIS Kreavoks',
  description: 'Ringkasan operasional dan monitoring absensi HRIS Kreavoks.',
  ogTitle: 'Dashboard | HRIS Kreavoks',
  ogDescription: 'Ringkasan operasional dan monitoring absensi HRIS Kreavoks.'
})

const {
  stats,
  attendanceLogs,
  events,
  logbooks,
  searchQuery,
  attendanceStatus,
  selectedDate,
  selectedDateVal,
  currentMonthYear,
  attendanceState,
  currentTime,
  clockRangeText,
  handleClockIn,
  handleClockOut,
  getCustomIndicators
} = useDashboard()

// Filtered data based on search bar
const filteredLogs = computed(() => {
  if (!searchQuery.value) return attendanceLogs.value
  const query = searchQuery.value.toLowerCase()
  return attendanceLogs.value.filter(log => 
    log.tanggal.toLowerCase().includes(query) ||
    log.datang.toLowerCase().includes(query) ||
    log.pulang.toLowerCase().includes(query)
  )
})

const filteredLogbooks = computed(() => {
  if (!searchQuery.value) return logbooks.value
  const query = searchQuery.value.toLowerCase()
  return logbooks.value.filter(lb => 
    lb.divisi.toLowerCase().includes(query) ||
    lb.tanggal.toLowerCase().includes(query) ||
    lb.deskripsi.toLowerCase().includes(query) ||
    lb.kendala.toLowerCase().includes(query)
  )
})

const handleAddLogbook = (newLb: { divisi: string; deskripsi: string; kendala: string }) => {
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  logbooks.value.push({
    id: Date.now().toString(),
    divisi: newLb.divisi,
    tanggal: today,
    deskripsi: newLb.deskripsi,
    kendala: newLb.kendala
  })
}
</script>
