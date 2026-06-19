<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <!-- Total Hadir Card -->
    <Card class="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60 backdrop-blur-md shadow-none rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-400">Total Hadir</p>
        <h3 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats.totalHadir }}</h3>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-kv-primary">
          <TrendingUp class="w-3 h-3" />
          {{ stats.kehadiranRate }}
        </span>
      </div>
      <div class="h-8 w-16 md:h-10 md:w-20 opacity-80 shrink-0">
        <svg viewBox="0 0 100 30" class="h-full w-full overflow-visible">
          <path
            d="M 0 25 L 20 15 L 40 20 L 60 10 L 80 15 L 100 5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-kv-primary"
          />
        </svg>
      </div>
    </Card>

    <!-- Total Tidak Hadir Card -->
    <Card class="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60 backdrop-blur-md shadow-none rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-400">Total Tidak Hadir</p>
        <h3 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats.tidakHadir }}</h3>
        <!-- Fixed the error color: using emerald (green) or slate for neutral -->
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
          <TrendingUp class="w-3 h-3" />
          {{ stats.tidakHadirTrend }}
        </span>
      </div>
      <div class="h-8 w-16 md:h-10 md:w-20 opacity-80 shrink-0">
        <svg viewBox="0 0 100 30" class="h-full w-full overflow-visible">
          <path
            d="M 0 20 L 20 15 L 40 18 L 60 10 L 80 12 L 100 5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-emerald-500"
          />
        </svg>
      </div>
    </Card>

    <!-- Logbook Terisi Card -->
    <Card class="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60 backdrop-blur-md shadow-none rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-400">Logbook Terisi</p>
        <h3 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats.logbookTerisi }}</h3>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
          <TrendingUp class="w-3 h-3" />
          {{ stats.logbookTrend }}
        </span>
      </div>
      <div class="h-8 w-16 md:h-10 md:w-20 opacity-80 shrink-0">
        <svg viewBox="0 0 100 30" class="h-full w-full overflow-visible">
          <path
            d="M 0 25 L 20 18 L 40 20 L 60 12 L 80 15 L 100 5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-emerald-500"
          />
        </svg>
      </div>
    </Card>

    <!-- Evaluasi Bulan Ini Card -->
    <Card class="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/60 backdrop-blur-md shadow-none rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-400">Evaluasi Bulan Ini</p>
        <h3 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">{{ stats.evaluasi }}</h3>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-500">
          <TrendingDown class="w-3 h-3" />
          {{ stats.evaluasiTrend }}
        </span>
      </div>
      <div class="h-8 w-16 md:h-10 md:w-20 opacity-80 shrink-0">
        <svg viewBox="0 0 100 30" class="h-full w-full overflow-visible">
          <path
            d="M 0 5 L 20 10 L 40 8 L 60 18 L 80 15 L 100 25"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-rose-500"
          />
        </svg>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import type { DashboardStats } from '../types'
import { Card } from '~/components/ui/card'

defineProps<{
  stats: DashboardStats
}>()
</script>
