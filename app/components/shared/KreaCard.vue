<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <Card class="rounded-3xl border-slate-200 bg-white shadow-none">
    <CardHeader v-if="title || description || $slots.header">
      <slot name="header">
        <CardTitle v-if="title" class="text-[#131313]">{{ title }}</CardTitle>
        <CardDescription v-if="description">{{ description }}</CardDescription>
      </slot>
    </CardHeader>
    
    <CardContent v-if="$slots.default">
      <slot />
    </CardContent>
    
    <CardFooter v-if="$slots.footer">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>
