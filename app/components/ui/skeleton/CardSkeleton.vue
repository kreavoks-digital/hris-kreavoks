<template>
  <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
    <Card v-for="i in cards" :key="i" class="border border-border bg-card overflow-hidden rounded-3xl">
      <CardContent class="p-6 flex items-center gap-4">
        <Skeleton class="h-11 w-11 rounded-2xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-6 w-12" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'

defineProps({
  cards: {
    type: Number,
    default: 4
  }
})
</script>
