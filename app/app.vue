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
// loadAuth sekarang dipindah ke plugin auth.client.ts agar lebih stabil
</script>
