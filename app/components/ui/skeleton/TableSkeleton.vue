<template>
  <TableRow v-for="i in rows" :key="i" class="bg-muted/10 border-y border-border">
    <TableCell v-for="j in columns" :key="j" class="py-4">
      <div class="flex items-center gap-3" v-if="j === 1">
        <Skeleton class="h-9 w-9 rounded-full" />
        <div class="flex flex-col space-y-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
      <Skeleton v-else class="h-4 w-[80%] rounded" />
    </TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import { TableRow, TableCell } from '~/components/ui/table'
import { Skeleton } from '~/components/ui/skeleton'

defineProps({
  rows: {
    type: Number,
    default: 3
  },
  columns: {
    type: Number,
    default: 5
  }
})
</script>
