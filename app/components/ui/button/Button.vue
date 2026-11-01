<script setup lang="ts">
import { Button as KreaButton } from "@kreavoks/kreaui"
import type { ButtonProps } from "@kreavoks/kreaui"
import { cn } from "@/lib/utils"

defineOptions({
  inheritAttrs: false
})

const props = defineProps<ButtonProps & { variant?: any; size?: any }>()
</script>

<template>
  <KreaButton
    v-bind="$attrs"
    :variant="props.variant === 'destructive' ? 'danger' : props.variant === 'default' ? 'primary' : (props.variant || 'primary')"
    :size="props.size === 'default' ? 'md' : (props.size || 'md')"
    :disabled="props.disabled"
    :loading="props.loading"
    :icon="props.icon || props.size === 'icon'"
    :label="props.label"
    :icon-left="props.iconLeft"
    :icon-right="props.iconRight"
    :class="cn(
      props.variant === 'link' && 'bg-transparent text-[#4082E6] underline hover:underline underline-offset-4 cursor-pointer font-medium shadow-none',
      props.class
    )"
  >
    <slot />
  </KreaButton>
</template>
