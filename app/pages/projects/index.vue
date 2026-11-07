<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Project Tracker</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Pantau status, progres, dan beban kerja seluruh proyek aktif di tim Anda.
        </p>
      </div>
    </div>

    <!-- Placeholder State -->
    <div class="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50 flex flex-col items-center justify-center min-h-[360px]">
      <div class="w-14 h-14 rounded-2xl bg-kv-primary/10 text-kv-primary flex items-center justify-center mb-4">
        <FolderKanban class="w-7 h-7" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-1">Halaman Project Tracker</h3>
      <p class="text-sm text-muted-foreground max-w-md">
        Fitur ini sedang dalam tahap pengembangan. Di sini nantinya Anda dapat melacak progres proyek, milestone, alokasi tim, dan status pengerjaan secara real-time.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderKanban } from 'lucide-vue-next'

definePageMeta({
  title: 'Project Tracker'
})
</script>

