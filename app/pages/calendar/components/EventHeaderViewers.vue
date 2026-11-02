<template>
  <div v-if="viewers.length > 0" class="flex items-center gap-1.5 mr-1">
    <div class="flex items-center -space-x-2 py-0.5">
      <div
        v-for="viewer in displayedViewers"
        :key="viewer.id"
        class="relative group cursor-pointer transition-transform hover:z-30 hover:scale-105"
      >
        <!-- Avatar Circle -->
        <Avatar class="w-8 h-8 rounded-full border-2 border-background ring-1 ring-border/50 shadow-2xs overflow-hidden">
          <AvatarImage :src="viewer.profilePicture || ''" :alt="viewer.name" class="w-full h-full object-cover" />
          <AvatarFallback class="text-xs font-bold bg-kv-primary/10 text-kv-primary">
            {{ getInitials(viewer.name) }}
          </AvatarFallback>
        </Avatar>

        <!-- Tooltip on Hover (Terbuka ke Bawah agar Tidak Terpotong) -->
        <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none transition-all">
          <div class="w-2 h-2 bg-popover border-l border-t border-border rotate-45 -mb-1 z-10 shadow-xs" />
          <div class="bg-popover text-popover-foreground border border-border shadow-xl px-2.5 py-1.5 rounded-xl text-center whitespace-nowrap min-w-[120px] max-w-[200px]">
            <p class="font-semibold text-xs text-foreground truncate">{{ viewer.name }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ viewer.position }}</p>
          </div>
        </div>
      </div>

      <!-- Overlapping +N Counter jika lebih dari limit -->
      <div
        v-if="remainingCount > 0"
        class="relative group cursor-pointer transition-transform hover:z-30 hover:scale-105"
      >
        <div class="w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground font-semibold text-xs flex items-center justify-center shadow-2xs ring-1 ring-border/50">
          +{{ remainingCount }}
        </div>

        <!-- Tooltip on Hover for Remaining Viewers (Terbuka ke Bawah) -->
        <div class="absolute top-full mt-2 right-0 hidden group-hover:flex flex-col items-end z-50 pointer-events-none transition-all">
          <div class="w-2 h-2 bg-popover border-l border-t border-border rotate-45 -mb-1 mr-3 z-10 shadow-xs" />
          <div class="bg-popover text-popover-foreground border border-border shadow-xl p-2.5 rounded-xl text-left min-w-[160px] max-w-[230px] space-y-1.5">
            <p class="text-xs font-semibold text-muted-foreground pb-1 border-b border-border/50">
              +{{ remainingCount }} peserta lainnya
            </p>
            <div v-for="viewer in remainingList" :key="viewer.id" class="flex items-center gap-2 py-0.5">
              <Avatar class="w-5 h-5 rounded-full shrink-0 border border-border">
                <AvatarImage :src="viewer.profilePicture || ''" :alt="viewer.name" class="w-full h-full object-cover" />
                <AvatarFallback class="text-xs">{{ getInitials(viewer.name) }}</AvatarFallback>
              </Avatar>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-xs text-foreground truncate">{{ viewer.name }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ viewer.position }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

export interface ActiveViewer {
  id: number
  name: string
  position: string
  profilePicture?: string | null
}

const props = withDefaults(
  defineProps<{
    viewers: ActiveViewer[]
    limit?: number
  }>(),
  {
    limit: 4
  }
)

const displayedViewers = computed(() => props.viewers.slice(0, props.limit))
const remainingCount = computed(() => Math.max(0, props.viewers.length - props.limit))
const remainingList = computed(() => props.viewers.slice(props.limit))

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts[parts.length - 1] || ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return (first.charAt(0) + last.charAt(0)).toUpperCase() || '?'
}
</script>
