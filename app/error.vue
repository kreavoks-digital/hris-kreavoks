<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
    <!-- 1. Chunk / Deployment Update Error -->
    <div v-if="isChunkError" class="max-w-md w-full space-y-4 animate-in fade-in-0 duration-200">
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

    <!-- 2. Standard 404 Not Found -->
    <div v-else-if="props.error?.statusCode === 404" class="max-w-md w-full space-y-4 animate-in fade-in-0 duration-200">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-lg">
        404
      </div>
      <h1 class="text-xl font-bold">Halaman Tidak Ditemukan</h1>
      <p class="text-xs sm:text-sm text-muted-foreground">
        Halaman yang Anda tuju mungkin telah dipindahkan atau tautan tidak valid.
      </p>
      <div class="flex items-center gap-2 pt-2">
        <Button variant="outline" size="sm" class="flex-1" @click="handleClearError('/')">
          Kembali ke Beranda
        </Button>
      </div>
    </div>

    <!-- 3. General Application Error / Technical Issue -->
    <div v-else class="max-w-md w-full space-y-4 animate-in fade-in-0 duration-200">
      <div class="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <h1 class="text-xl font-bold">Terjadi Kendala Teknis</h1>
      <p class="text-xs sm:text-sm text-muted-foreground">
        {{ errorMessage || 'Terjadi kesalahan saat memproses data. Silakan muat ulang halaman.' }}
      </p>
      <div class="flex items-center gap-2 pt-2">
        <Button variant="outline" size="sm" class="flex-1" @click="handleClearError('/')">
          Ke Beranda
        </Button>
        <Button variant="primary" size="sm" class="flex-1" :loading="isReloading" @click="handleManualReload">
          Muat Ulang
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RefreshCw, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@kreavoks/kreaui'

const props = defineProps<{
  error?: any
}>()

const isReloading = ref(false)

const errorMessage = computed(() => {
  return props.error?.message || props.error?.statusMessage || ''
})

const isChunkError = computed(() => {
  const msg = errorMessage.value.toLowerCase()
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('chunk')
  )
})

const handleManualReload = () => {
  isReloading.value = true
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

const handleClearError = (redirectPath = '/') => {
  clearError({ redirect: redirectPath })
}

onMounted(() => {
  if (isChunkError.value) {
    handleManualReload()
  }
})
</script>
