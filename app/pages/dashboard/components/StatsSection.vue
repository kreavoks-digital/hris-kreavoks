<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <!-- Total Hadir Card -->
    <Card class="p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
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
    <Card class="p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
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
    <Card class="p-4 flex items-center justify-between bg-card border-border shadow-sm rounded-2xl md:rounded-3xl">
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
    <Card class="p-4 flex flex-col justify-center bg-kv-primary/5 dark:bg-kv-primary/10 border-kv-primary/20 shadow-sm rounded-2xl md:rounded-3xl relative overflow-hidden">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-kv-primary/20 rounded-full blur-2xl"></div>
      <div class="relative z-10 flex items-center gap-3">
        <div class="p-2.5 bg-kv-primary/10 dark:bg-kv-primary/20 rounded-xl shrink-0">
          <Clock class="w-5 h-5 text-kv-primary" />
        </div>
        <div class="space-y-0.5">
          <p class="text-xs font-semibold text-kv-primary/80">Sisa Masa Kerja</p>
          <div class="flex items-baseline gap-2 flex-wrap">
            <h3 class="text-xl md:text-2xl font-bold text-kv-primary leading-none">{{ stats.sisaMasaKerja }}</h3>
            <span v-if="stats.sisaMasaKerja !== 'Lifetime'" class="text-[10px] md:text-xs font-medium text-kv-primary/70 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full whitespace-nowrap">
              {{ stats.sisaMasaKerjaLabel }}
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
