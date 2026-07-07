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
import { useDark } from '@vueuse/core'

// Initialize dark mode globally so it syncs on all pages (including login)
const isDark = useDark()
</script>
