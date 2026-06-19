<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
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
  <input v-model="modelValue" :class="cn('flex h-11 w-full rounded-2xl border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground outline-none transition-all duration-200 focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] disabled:cursor-not-allowed disabled:opacity-50 border-border hover:border-primary/50', props.class)">
</template>
