<script setup lang="ts">
import type { SelectTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronDownIcon } from '@radix-icons/vue'
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="cn(
      // Base layout & typography
      'flex h-11 w-full items-center justify-between whitespace-nowrap rounded-2xl border border-input bg-transparent px-3 py-2 text-sm text-start',
      // Focus & states
      'ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Placeholder & slot styling
      'data-[placeholder]:text-muted-foreground [&>span]:truncate',
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDownIcon class="w-4 h-4 opacity-50 shrink-0" />
    </SelectIcon>
  </SelectTrigger>
</template>
