<template>
  <CardSkeleton v-if="loading" :cards="4" />
  <div v-else class="grid gap-6 md:grid-cols-4">
    <Card v-for="(val, key) in summaryItems" :key="key" class="border border-border bg-card overflow-hidden group rounded-3xl transition-all duration-300 hover:bg-accent/50">
      <CardContent class="p-6 flex items-center gap-4">
        <div :class="[val.color, 'h-11 w-11 rounded-2xl flex items-center justify-center transition-all']">
           <component :is="val.icon" class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ val.label }}</p>
          <p class="text-2xl font-semibold text-foreground">{{ val.count }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, AlertCircle, UserMinus, XCircle } from 'lucide-vue-next'
import { Card, CardContent } from '~/components/ui/card'
import CardSkeleton from '~/components/ui/skeleton/CardSkeleton.vue'

const props = defineProps<{
  loading: boolean
  summary: {
    present: number
    permission: number
    sick: number
    absent: number
  }
}>()

const summaryItems = computed(() => ({
  present: { 
    label: 'Hadir', 
    count: props.summary.present, 
    icon: CheckCircle2, 
    color: 'bg-kv-primary/10 text-kv-primary'
  },
  permission: { 
    label: 'Izin', 
    count: props.summary.permission, 
    icon: AlertCircle, 
    color: 'bg-amber-500/10 text-amber-600'
  },
  sick: { 
    label: 'Sakit', 
    count: props.summary.sick, 
    icon: UserMinus, 
    color: 'bg-blue-500/10 text-blue-600'
  },
  absent: { 
    label: 'Alfa', 
    count: props.summary.absent, 
    icon: XCircle, 
    color: 'bg-muted text-muted-foreground'
  }
}))
</script>
