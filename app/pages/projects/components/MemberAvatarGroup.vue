<template>
  <div class="flex items-center -space-x-2 overflow-hidden">
    <div
      v-for="member in visibleMembers"
      :key="member.id"
      class="relative shrink-0"
      :title="`${member.name} (${member.position})`"
    >
      <Avatar class="h-7 w-7 ring-2 ring-background border border-border">
        <AvatarImage :src="member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`" :alt="member.name" />
        <AvatarFallback class="bg-primary/10 text-primary text-xs font-medium">
          {{ getInitials(member.name) }}
        </AvatarFallback>
      </Avatar>
    </div>

    <div
      v-if="overflowCount > 0"
      class="h-7 w-7 rounded-full bg-muted text-muted-foreground ring-2 ring-background border border-border flex items-center justify-center text-xs font-medium shrink-0"
      :title="`+${overflowCount} anggota lainnya`"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import type { ProjectMember } from '../types'

const props = withDefaults(
  defineProps<{
    members: ProjectMember[]
    maxVisible?: number
  }>(),
  {
    maxVisible: 4
  }
)

const visibleMembers = computed(() => {
  return props.members.slice(0, props.maxVisible)
})

const overflowCount = computed(() => {
  return Math.max(0, props.members.length - props.maxVisible)
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
</script>

