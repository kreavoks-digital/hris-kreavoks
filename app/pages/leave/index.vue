<template>
  <div class="h-[70vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
    <div class="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
      <CalendarDays class="h-10 w-10" />
    </div>
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-semibold text-foreground">Manajemen Cuti</h1>
      <p class="text-muted-foreground text-sm max-w-sm">
        Fitur ini sedang dalam tahap pengembangan dan akan segera hadir di pembaruan berikutnya.
      </p>
    </div>
    <Badge variant="secondary" class="rounded-full px-4 py-1.5 font-medium mt-2">
      Coming Soon
    </Badge>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  layout: "default",
  middleware: "auth",
});
</script>
