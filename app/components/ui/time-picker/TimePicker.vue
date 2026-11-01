<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  modelValue?: string | null
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<TimePickerProps>(), {
  modelValue: '',
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="relative flex items-center w-full">
    <Clock class="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
    <input
      type="time"
      :value="modelValue"
      :disabled="disabled"
      @input="onInput"
      :class="cn(
        'h-11 w-full pl-10 pr-3 rounded-2xl border border-border bg-background text-sm font-medium text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-kv-primary/30 focus:border-kv-primary disabled:opacity-50 disabled:cursor-not-allowed',
        props.class
      )"
    />
  </div>
</template>
