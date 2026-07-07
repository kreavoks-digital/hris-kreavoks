<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
    <RegisterForm />
    <RegisterSidebar />
  </div>
</template>

<script setup lang="ts">
import RegisterForm from './components/RegisterForm.vue'
import RegisterSidebar from './components/RegisterSidebar.vue'

definePageMeta({
  layout: false,
});
</script>
