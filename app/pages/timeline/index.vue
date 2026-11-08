<script setup lang="ts">
const route = useRoute()

// Redirect seamless ke Unified View di /kanban?view=gantt
const targetQuery: Record<string, any> = { view: 'gantt' }
if (route.query.project) {
  targetQuery.project = route.query.project
}

await navigateTo({ path: '/kanban', query: targetQuery }, { replace: true })
</script>

<template>
  <div class="flex items-center justify-center min-h-[300px] text-xs text-muted-foreground animate-pulse">
    Mengarahkan ke tampilan Gantt Timeline...
  </div>
</template>
