<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  class?: HTMLAttributes["class"]
  defaultValue?: string | number
  modelValue?: string | number
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
    <textarea 
      v-bind="$attrs"
      v-model="modelValue" 
      :class="cn(
        'flex min-h-[100px] w-full rounded-xl border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground outline-none transition-all duration-200 focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        props.error ? 'border-rose-500 focus-visible:border-rose-500 focus-visible:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]' : 'border-border hover:border-primary/50',
        props.class
      )" 
    />
    <p v-if="props.error" class="text-[11px] font-medium text-rose-500 mt-1.5">{{ props.error }}</p>
  </div>
</template>
