<template>
  <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
    <!-- Total Hadir Card -->
    <Card class="p-3 md:p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-muted-foreground">Total Hadir</p>
        <h3 class="text-xl md:text-2xl font-bold text-foreground">{{ stats.totalHadir }}</h3>
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
    <Card class="p-3 md:p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-muted-foreground">Total Tidak Hadir</p>
        <h3 class="text-xl md:text-2xl font-bold text-foreground">{{ stats.tidakHadir }}</h3>
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
    <Card class="p-3 md:p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-muted-foreground">Logbook Terisi</p>
        <h3 class="text-xl md:text-2xl font-bold text-foreground">{{ stats.logbookTerisi }}</h3>
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

    <!-- Sisa Masa Kerja Card -->
    <Card class="p-3 md:p-4 flex flex-col justify-center bg-kv-primary/5 dark:bg-kv-primary/10 border-kv-primary/20 shadow-sm rounded-2xl md:rounded-3xl relative">
      <!-- Background elements bounded to card -->
      <div class="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl pointer-events-none">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-kv-primary/20 rounded-full blur-2xl"></div>
      </div>
      
      <div class="relative z-10 flex items-center justify-between gap-3">
        <div class="space-y-0.5">
          <p class="text-xs font-semibold text-kv-primary/80">Sisa Masa Kerja</p>
          <div class="flex items-baseline flex-wrap">
            <h3 class="text-xl md:text-2xl font-bold text-kv-primary leading-none">{{ stats.sisaMasaKerja }}</h3>
            <span v-if="stats.sisaMasaKerjaLabel" class="text-xs md:text-sm font-semibold text-kv-primary/50 ml-1">
              {{ stats.sisaMasaKerjaLabel }}
            </span>
          </div>
        </div>
        
        <!-- Doughnut Chart (Hadir vs Izin) -->
        <div class="relative w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center group cursor-pointer">
          <!-- Tooltip on hover -->
          <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur text-popover-foreground text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all duration-300 whitespace-nowrap pointer-events-none z-20 border border-border/50">
            <span class="text-kv-primary">Hadir: {{ stats.totalHadirCount || 0 }}</span> &nbsp;|&nbsp; <span class="text-orange-500">Izin: {{ stats.totalIzinCount || 0 }}</span>
          </div>
          
          <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
            <!-- Izin (Background) -->
            <path
              class="text-orange-400/40 group-hover:text-orange-500/60 transition-colors duration-300"
              stroke-dasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            />
            <!-- Hadir (Foreground) -->
            <path
              class="text-kv-primary drop-shadow-sm transition-all duration-700 ease-out group-hover:stroke-[4]"
              :stroke-dasharray="`${Math.max(0, Math.min(100, ((stats.totalHadirCount || 0) / Math.max(1, (stats.totalHadirCount || 0) + (stats.totalIzinCount || 0))) * 100))}, 100`"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>
          <!-- Center Text -->
          <div class="absolute flex flex-col items-center justify-center text-center">
            <span class="text-xs md:text-sm font-bold text-kv-primary leading-none">
              {{ Math.round(((stats.totalHadirCount || 0) / Math.max(1, (stats.totalHadirCount || 0) + (stats.totalIzinCount || 0))) * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { TrendingUp, Clock } from 'lucide-vue-next'
import type { DashboardStats } from '../types'
import { Card } from '~/components/ui/card'

defineProps<{
  stats: DashboardStats
}>()
</script>
