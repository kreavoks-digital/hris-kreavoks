<template>
  <div class="fixed bottom-6 right-6 z-40 sm:hidden">
    <Button
      variant="primary"
      size="xl"
      :icon="true"
      :icon-left="Plus"
      title="Buat Jadwal Baru"
      @click="navigateTo('/calendar/create')"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'
</script>
