<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card
      v-for="stat in statCards"
      :key="stat.title"
      class="border border-border bg-card rounded-3xl shadow-none"
    >
      <CardContent class="p-6 flex items-center gap-4">
        <div :class="['h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', stat.iconBg, stat.iconColor]">
          <component :is="stat.icon" class="h-6 w-6" stroke-width="2" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ stat.title }}</p>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-semibold text-foreground">{{ stat.value }}</span>
            <span class="text-sm text-slate-400">{{ stat.subtitle }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
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

