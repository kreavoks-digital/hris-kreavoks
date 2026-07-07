<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    <template v-if="dashboard.isLoading.value">
      <!-- Skeleton Stats -->
      <CardSkeleton :cards="4" />

      <!-- Skeleton Attendance Section -->
      <div class="grid gap-4 grid-cols-1 lg:grid-cols-12 flex-col">
        <div class="lg:col-span-4 border border-border bg-card rounded-3xl p-6">
          <Skeleton class="h-6 w-32 mb-6" />
          <div class="space-y-4">
            <Skeleton class="h-16 w-full rounded-xl" v-for="i in 3" :key="i" />
          </div>
        </div>
        <div class="lg:col-span-3 border border-border bg-card rounded-3xl p-6">
          <Skeleton class="h-32 w-32 rounded-full mx-auto mb-6" />
          <div class="space-y-4">
            <Skeleton class="h-10 w-full rounded-xl" />
            <Skeleton class="h-10 w-full rounded-xl" />
          </div>
        </div>
        <div class="lg:col-span-5 border border-border bg-card rounded-3xl p-6">
          <div class="flex justify-between mb-6">
            <Skeleton class="h-6 w-32" />
            <Skeleton class="h-8 w-24 rounded-full" />
          </div>
          <Skeleton class="h-64 w-full rounded-2xl" />
        </div>
      </div>

      <!-- Skeleton Logbook Section -->
      <div class="border border-border bg-card rounded-3xl p-6 mt-4">
        <div class="flex justify-between mb-6">
          <Skeleton class="h-6 w-32" />
          <div class="flex gap-2">
            <Skeleton class="h-10 w-32 rounded-lg" />
            <Skeleton class="h-10 w-24 rounded-lg" />
          </div>
        </div>
        <div class="space-y-4">
          <Skeleton class="h-12 w-full rounded-lg" v-for="i in 5" :key="i" />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Stats Section -->
      <StatsSection :stats="stats" />

      <!-- Attendance logs, Clock Widget, Calendar -->
      <AttendanceSection />

      <LogbookSection />
    </template>
  </div>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import { useDashboard } from './hooks/useDashboard'
import { DashboardContextKey } from './context/dashboardContext'
import StatsSection from './components/StatsSection.vue'
import AttendanceSection from './components/AttendanceSection.vue'
import LogbookSection from './components/LogbookSection.vue'
import CardSkeleton from '~/components/ui/skeleton/CardSkeleton.vue'
import { Skeleton } from '~/components/ui/skeleton'

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
