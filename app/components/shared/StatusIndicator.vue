<script setup lang="ts">
import { Check, Minus, Clock, X } from 'lucide-vue-next'
import { getStatusConfig } from '~/composables/usePresence'

const props = withDefaults(
  defineProps<{
    status?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
  }>(),
  {
    status: 'OFFLINE',
    size: 'sm',
    showLabel: false,
  }
)

const config = computed(() => {
  return getStatusConfig(props.status)
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xl':
      return 'w-6 h-6 border-2'
    case 'lg':
      return 'w-5 h-5 border-2'
    case 'md':
      return 'w-4 h-4 border-2'
    case 'xs':
      return 'w-2.5 h-2.5 border'
    case 'sm':
    default:
      return 'w-3.5 h-3.5 border-2'
  }
})

const iconClasses = computed(() => {
  switch (props.size) {
    case 'xl':
      return 'w-3 h-3'
    case 'lg':
      return 'w-2.5 h-2.5'
    case 'md':
      return 'w-2 h-2'
    case 'xs':
      return 'w-1 h-1'
    case 'sm':
    default:
      return 'w-1.5 h-1.5'
  }
})
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <div
      :class="[
        'rounded-full flex items-center justify-center shrink-0 border-background',
        config.color,
        sizeClasses,
      ]"
      :title="config.label"
    >
      <!-- Icons based on status -->
      <Check
        v-if="status === 'AVAILABLE'"
        :class="['text-white stroke-2', iconClasses]"
      />
      <Minus
        v-else-if="status === 'DND'"
        :class="['text-white stroke-2', iconClasses]"
      />
      <Clock
        v-else-if="status === 'AWAY' || status === 'BE_RIGHT_BACK'"
        :class="['text-white stroke-2', iconClasses]"
      />
      <X
        v-else-if="status === 'OFFLINE'"
        :class="['text-white stroke-2', iconClasses]"
      />
    </div>
    <span v-if="showLabel" :class="['text-sm font-medium', config.text]">
      {{ config.label }}
    </span>
  </div>
</template>
