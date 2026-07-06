<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="cn(
      // Base layout & styling
      'peer shrink-0 checkbox-custom border-2 border-muted-foreground/30 ring-offset-background',
      // Transitions
      'transition-all duration-200',
      // Focus state
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Checked state
      'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:shadow-[0_0_10px_rgba(var(--primary),0.3)]',
      props.class
    )"
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-primary-foreground">
      <slot>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3 animate-in zoom-in-50 duration-300"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
