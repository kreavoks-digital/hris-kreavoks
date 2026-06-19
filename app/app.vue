<template>
  <div>
    <Toaster />
    <NuxtLayout>
      <NuxtPage :key="$route.fullPath" />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
const { loadAuth } = useAuth()

onMounted(() => {
  loadAuth()
})
</script>
