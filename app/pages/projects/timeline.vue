<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Timeline & Gantt</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Pantau jadwal, estimasi durasi, dan deadline proyek dalam bentuk timeline visual.
        </p>
      </div>
    </div>

    <!-- Placeholder State -->
    <div class="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50 flex flex-col items-center justify-center min-h-[360px]">
      <div class="w-14 h-14 rounded-2xl bg-kv-primary/10 text-kv-primary flex items-center justify-center mb-4">
        <ChartNoAxesGantt class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-1">Halaman Timeline</h3>
      <p class="text-sm text-muted-foreground max-w-md">
        Fitur ini sedang dalam tahap pengembangan. Di sini nantinya Anda dapat mengelola jadwal milestone, deadline, dan dependensi antar tugas.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartNoAxesGantt } from 'lucide-vue-next'

definePageMeta({
  title: 'Timeline'
})
</script>

