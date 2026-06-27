<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <th :class="cn(
    // Base layout & typography
    'h-12 px-4 text-left align-middle font-semibold text-slate-500',
    // Padding adjustments
    'first:pl-6 last:pr-6',
    // Checkbox adjustments
    '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5',
    props.class
  )">
    <slot />
  </th>
</template>
