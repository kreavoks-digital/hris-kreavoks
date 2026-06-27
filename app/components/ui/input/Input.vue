<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
  error?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <div class="w-full">
    <input 
      v-bind="$attrs"
      v-model="modelValue" 
      :class="cn(
          // Base layout & typography
          'flex h-11 w-full rounded-2xl border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground outline-none',
          // Transitions
          'transition-all duration-200',
          // Focus state
          'focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Error state handling
          props.error ? 'border-rose-500 focus-visible:border-rose-500 focus-visible:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]' : 'border-border hover:border-primary/50',
          props.class
        )"
    >
    <p v-if="props.error" class="text-[11px] font-medium text-rose-500 mt-1.5">{{ props.error }}</p>
  </div>
</template>
