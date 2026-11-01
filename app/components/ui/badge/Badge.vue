<script setup lang="ts">
import { Badge as KreaBadge } from "@kreavoks/kreaui"
import type { BadgeProps } from "@kreavoks/kreaui"

defineOptions({
  inheritAttrs: false
})

const props = defineProps<BadgeProps & { variant?: any }>()
</script>

<template>
  <KreaBadge
    v-bind="$attrs"
    :type="props.type"
    :variant="props.variant === 'destructive' ? 'error' : (props.variant || 'primary')"
    :size="props.size"
    :rounded="props.rounded"
    :appearance="props.appearance"
    :icon-only="props.iconOnly"
    :class="props.class"
  >
    <slot />
  </KreaBadge>
</template>
