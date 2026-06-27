<script setup lang="ts">
import type { DropdownMenuItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DropdownMenuItem, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="cn(
      // Base layout & typography
      'relative flex cursor-default select-none items-center rounded-3xl gap-2 px-2 py-1.5 text-sm outline-none transition-colors',
      // Focus state
      'focus:bg-accent focus:text-accent-foreground',
      // Disabled state
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      // SVG styling inside item
      '[&>svg]:size-4 [&>svg]:shrink-0',
      // Inset handling
      inset && 'pl-8',
      props.class,
    )"
  >
    <slot />
  </DropdownMenuItem>
</template>
