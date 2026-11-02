<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
    <div class="max-w-md w-full space-y-4">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-kv-primary/10 text-kv-primary flex items-center justify-center">
        <RefreshCw :class="['w-6 h-6', isReloading && 'animate-spin']" />
      </div>
      <h1 class="text-xl font-bold">Pembaruan Sistem Tersedia</h1>
      <p class="text-xs sm:text-sm text-muted-foreground">
        Versi terbaru aplikasi telah diperbarui. Memuat ulang halaman...
      </p>
      <Button variant="primary" size="sm" class="w-full" :loading="isReloading" @click="handleManualReload">
        Muat Ulang Halaman
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'

const props = defineProps<{
  error?: any
}>()

const isReloading = ref(false)

const handleManualReload = () => {
  isReloading.value = true
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

onMounted(() => {
  const msg = props.error?.message || props.error?.toString() || ''
  if (
    msg.includes('dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('chunk')
  ) {
    handleManualReload()
  }
})
</script>
