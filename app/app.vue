<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { loadAuth } = useAuth()

onMounted(() => {
  loadAuth()
})
</script>
