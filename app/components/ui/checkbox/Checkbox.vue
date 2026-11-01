<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "~/lib/utils"

interface Props extends /* @vue-ignore */ CheckboxRootProps {
  class?: HTMLAttributes["class"]
  checked?: boolean | 'indeterminate'
}

const props = defineProps<Props>()
const emits = defineEmits<CheckboxRootEmits & {
  'update:checked': [value: boolean | 'indeterminate']
}>()

const isControlled = computed(() => props.modelValue !== undefined || props.checked !== undefined)

const resolvedModelValue = computed(() => {
  if (props.modelValue !== undefined) return props.modelValue
  if (props.checked !== undefined) return props.checked
  return undefined
})

const rootProps = computed(() => {
  const { class: _, checked: __, modelValue: ___, ...rest } = props
  if (isControlled.value) {
    return {
      ...rest,
      modelValue: resolvedModelValue.value
    }
  }
  return rest
})

const forwarded = useForwardPropsEmits(rootProps, emits)

const handleUpdate = (val: boolean | 'indeterminate') => {
  emits('update:modelValue', val)
  emits('update:checked', val)
}
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :model-value="isControlled ? resolvedModelValue : undefined"
    @update:model-value="handleUpdate"
    :class="cn(
      'peer shrink-0 checkbox-custom border-2 border-muted-foreground/30 ring-offset-background cursor-pointer',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-kv-primary data-[state=checked]:border-kv-primary text-white',
      props.class
    )"
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-white">
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
