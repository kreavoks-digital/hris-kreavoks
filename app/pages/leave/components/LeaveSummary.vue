<template>
  <div class="grid gap-6 md:grid-cols-2">
    <Card class="border border-border bg-card rounded-3xl">
      <CardContent class="p-6 flex items-center gap-4">
        <div class="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
          <CalendarIcon class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Jatah Cuti Tahunan</p>
          <p class="text-2xl font-semibold text-foreground">{{ balance.annual }} Hari</p>
        </div>
      </CardContent>
    </Card>
    <Card class="border border-border bg-card rounded-3xl">
      <CardContent class="p-6 flex items-center gap-4">
        <div class="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">Cuti Terpakai</p>
          <p class="text-2xl font-semibold text-foreground">{{ balance.used }} Hari</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent } from '~/components/ui/card'

defineProps<{
  balance: {
    annual: number
    used: number
  }
}>()
</script>
