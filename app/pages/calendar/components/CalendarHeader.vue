<template>
  <div class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-xl sm:text-2xl font-semibold text-foreground">Kalender Kerja</h1>
      <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
        Pantau jadwal rapat dan agenda kegiatan tim.
      </p>
    </div>

    <!-- Desktop Buat Jadwal Button (Hidden on mobile, replaced with FAB) -->
    <div class="hidden sm:flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        :icon-left="Plus"
        label="Buat Jadwal"
        @click="navigateTo('/calendar/create')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'
</script>
