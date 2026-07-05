<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    <!-- Stats Section -->
    <StatsSection :stats="stats" />


    <!-- Attendance logs, Clock Widget, Calendar -->
    <AttendanceSection />

    <LogbookSection />
  </div>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import { useDashboard } from './hooks/useDashboard'
import { DashboardContextKey } from './context/dashboardContext'
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

const dashboard = useDashboard()

// Filtered data based on search bar
const filteredLogs = computed(() => {
  if (!dashboard.searchQuery.value) return dashboard.attendanceLogs.value
  const query = dashboard.searchQuery.value.toLowerCase()
  return dashboard.attendanceLogs.value.filter(log => 
    log.tanggal.toLowerCase().includes(query) ||
    log.datang.toLowerCase().includes(query) ||
    log.pulang.toLowerCase().includes(query)
  )
})

const filteredLogbooks = computed(() => {
  if (!dashboard.searchQuery.value) return dashboard.logbooks.value
  const query = dashboard.searchQuery.value.toLowerCase()
  return dashboard.logbooks.value.filter(lb => 
    lb.divisi.toLowerCase().includes(query) ||
    lb.tanggal.toLowerCase().includes(query) ||
    lb.deskripsi.toLowerCase().includes(query) ||
    lb.kendala.toLowerCase().includes(query)
  )
})

provide(DashboardContextKey, {
  ...dashboard,
  filteredLogs,
  filteredLogbooks
})

const stats = dashboard.stats
</script>
