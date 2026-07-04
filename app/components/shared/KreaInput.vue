<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  modelValue?: string | number
  label?: string
  id: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
})
</script>

<template>
  <div class="flex w-full flex-col gap-y-1.5">
    <label v-if="label" :for="id" class="text-sm font-medium text-[#131313] ml-1">
      {{ label }}
    </label>
    
    <Input
      :id="id"
      v-model="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :error="error"
      :disabled="disabled"
      class="rounded-3xl"
    />
  </div>
</template>
