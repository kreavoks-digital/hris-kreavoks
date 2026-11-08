<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
    <Card
      v-for="stat in statCards"
      :key="stat.title"
      class="border border-border bg-card rounded-2xl sm:rounded-3xl shadow-none overflow-hidden transition-all hover:border-primary/30"
    >
      <CardContent class="p-3 sm:p-5 flex items-center gap-2.5 sm:gap-3.5">
        <div :class="['h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0', stat.iconBg, stat.iconColor]">
          <component :is="stat.icon" class="h-4 w-4 sm:h-5 sm:w-5" stroke-width="2.2" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{{ stat.title }}</p>
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 mt-0.5">
            <span class="text-base sm:text-2xl font-bold text-foreground leading-tight">{{ stat.value }}</span>
            <span class="text-[10px] sm:text-xs text-muted-foreground truncate">{{ stat.subtitle }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '~/components/ui/card'
import { FolderKanban, CheckCircle2, AlertTriangle, Trophy } from 'lucide-vue-next'

const props = defineProps<{
  metrics: {
    total: number
    onTrack: number
    atRiskOrDelayed: number
    completed: number
  }
}>()

const statCards = computed(() => [
  {
    title: 'Total Proyek',
    value: props.metrics.total,
    subtitle: 'proyek aktif',
    icon: FolderKanban,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary'
  },
  {
    title: 'On Track',
    value: props.metrics.onTrack,
    subtitle: 'sesuai jadwal',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600'
  },
  {
    title: 'Perlu Perhatian',
    value: props.metrics.atRiskOrDelayed,
    subtitle: 'at risk / delayed',
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600'
  },
  {
    title: 'Selesai',
    value: props.metrics.completed,
    subtitle: 'tuntas',
    icon: Trophy,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600'
  }
])
</script>
