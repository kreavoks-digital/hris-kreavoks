<template>
  <div class="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center max-w-lg mx-auto my-12 flex flex-col items-center">
    <div class="w-24 h-24 sm:w-28 sm:h-28 mb-5 flex items-center justify-center">
      <img
        :src="mascotSettle"
        alt="Maskot Kreavoks"
        class="w-full h-full object-contain pointer-events-none"
      />
    </div>

    <h2 class="text-lg sm:text-xl font-semibold text-foreground">
      Tautan Catatan Tidak Valid
    </h2>

    <p class="text-sm text-muted-foreground mt-2 mb-6 max-w-sm leading-relaxed">
      Catatan ini khusus untuk yang memiliki hak akses. Anda tidak memiliki izin untuk melihat atau mengedit notulensi ini.
    </p>

    <Button
      variant="primary"
      size="sm"
      :icon-left="ArrowLeft"
      label="Kembali ke Kalender"
      class="w-full sm:w-auto"
      @click="navigateTo('/calendar')"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import mascotSettle from '~/assets/maskot/settle.svg'
import { navigateTo } from '#imports'
</script>
