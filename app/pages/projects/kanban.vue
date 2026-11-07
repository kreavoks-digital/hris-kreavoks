<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Kanban Board</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Visualisasikan alur kerja tugas tim dalam kolom To Do, In Progress, Review, dan Done.
        </p>
      </div>
    </div>

    <!-- Placeholder State -->
    <div class="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50 flex flex-col items-center justify-center min-h-[360px]">
      <div class="w-14 h-14 rounded-2xl bg-kv-primary/10 text-kv-primary flex items-center justify-center mb-4">
        <Kanban class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-1">Halaman Kanban Board</h3>
      <p class="text-sm text-muted-foreground max-w-md">
        Fitur ini sedang dalam tahap pengembangan. Di sini nantinya Anda dapat menggeser (drag & drop) tiket tugas dan memantau status pengerjaan sprint.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Kanban } from 'lucide-vue-next'

definePageMeta({
  title: 'Kanban Board'
})
</script>

