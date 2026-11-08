<script setup lang="ts">
import { Badge } from '@kreavoks/kreaui'
import { Clock, Check } from 'lucide-vue-next'
import type { TimelineItem, TimelineItemStatus } from '../types'

defineProps<{
  items: TimelineItem[]
  daysHeader: { dayNumber: number; dayName: string; isWeekend: boolean; dateStr: string }[]
  calculateBarPosition: (startDate: string, endDate: string) => { left: string; width: string }
  getStatusVariant: (status: TimelineItemStatus) => 'success' | 'warning' | 'error' | 'primary' | 'secondary'
  getStatusLabel: (status: TimelineItemStatus) => string
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: TimelineItem): void
  (e: 'toggleComplete', itemId: string): void
}>()

function formatCompactDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function getDateDisplay(start?: string, end?: string): string {
  const s = start ? formatCompactDate(start) : null
  const e = end ? formatCompactDate(end) : null
  if (s && e) {
    return s === e ? e : `${s} - ${e}`
  }
  return e || s || ''
}
</script>

<template>
  <div class="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-none">
    <!-- Gantt Scroll Container -->
    <div class="overflow-x-auto">
      <div class="min-w-[950px]">
        <!-- Table Header -->
        <div class="grid grid-cols-[350px_1fr] border-b border-border/30 bg-muted/20">
          <div class="p-3.5 text-xs font-semibold text-muted-foreground border-r border-border/20">
            Aktivitas / Tugas Terjadwal
          </div>
          <div
            class="grid text-center select-none"
            :style="{ gridTemplateColumns: `repeat(${daysHeader.length}, minmax(0, 1fr))` }"
          >
            <div
              v-for="d in daysHeader"
              :key="d.dateStr"
              class="py-2 px-1 text-[11px] border-r border-border/10 flex flex-col items-center justify-center"
              :class="{ 'bg-muted/40 font-medium text-muted-foreground': d.isWeekend, 'text-foreground': !d.isWeekend }"
            >
              <span>{{ d.dayNumber }}</span>
              <span class="text-[9px] text-muted-foreground/70">{{ d.dayName }}</span>
            </div>
          </div>
        </div>

        <!-- Table Rows -->
        <div class="divide-y divide-border/20">
          <div
            v-for="item in items"
            :key="item.id"
            class="grid grid-cols-[350px_1fr] hover:bg-muted/10 transition-colors items-center cursor-pointer group"
            @click="emit('itemClick', item)"
          >
            <!-- Left Info Column: Checkbox, Title, Tags, Date, Assignees, Status Badge -->
            <div class="p-3.5 flex items-center justify-between gap-3 border-r border-border/20">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <!-- Checkbox Mark as Completed (Konsisten) -->
                <button
                  type="button"
                  class="w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  :class="[
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'border-border/70 hover:border-emerald-500 hover:bg-emerald-500/10 text-transparent hover:text-emerald-500'
                  ]"
                  :title="item.status === 'COMPLETED' ? 'Tandai belum selesai' : 'Tandai selesai'"
                  @click.stop="emit('toggleComplete', item.id)"
                >
                  <Check class="w-3 h-3 stroke-[3]" />
                </button>

                <!-- Avatar Stack: Max 3 + '+N' (Konsisten) -->
                <div class="flex items-center -space-x-1.5 shrink-0">
                  <template v-if="item.assignees && item.assignees.length > 0">
                    <template v-for="a in item.assignees.slice(0, 3)" :key="a.id">
                      <img
                        :src="a.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.name)}`"
                        :alt="a.name"
                        :title="a.name"
                        class="w-5 h-5 rounded-full border border-background object-cover bg-muted"
                      />
                    </template>
                    <div
                      v-if="item.assignees.length > 3"
                      class="w-5 h-5 rounded-full border border-background bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-semibold"
                    >
                      +{{ item.assignees.length - 3 }}
                    </div>
                  </template>
                  <img
                    v-else-if="item.owner.avatar"
                    :src="item.owner.avatar"
                    :alt="item.owner.name"
                    :title="item.owner.name"
                    class="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                </div>

                <!-- Title, Tags, & Compact Date -->
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span
                      class="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                      :class="{ 'line-through text-muted-foreground/60': item.status === 'COMPLETED' }"
                      :title="item.title"
                    >
                      {{ item.title }}
                    </span>

                    <!-- Tags Chips (#tag) -->
                    <div v-if="item.tags && item.tags.length > 0" class="flex items-center gap-1">
                      <span
                        v-for="tag in item.tags.slice(0, 2)"
                        :key="tag"
                        class="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-muted/60 text-muted-foreground border border-border/30"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                  </div>

                  <!-- Date Range Ringkas dengan Icon Clock (Konsisten) -->
                  <div class="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <Clock class="w-3 h-3 text-muted-foreground/70" />
                    <span>{{ getDateDisplay(item.startDate, item.endDate) }}</span>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="shrink-0">
                <Badge type="label" :variant="getStatusVariant(item.status)" size="sm">
                  {{ getStatusLabel(item.status) }}
                </Badge>
              </div>
            </div>

            <!-- Right Timeline Grid Bar Track -->
            <div class="relative h-12 w-full flex items-center px-1">
              <!-- Background Grid Columns -->
              <div
                class="absolute inset-0 grid pointer-events-none"
                :style="{ gridTemplateColumns: `repeat(${daysHeader.length}, minmax(0, 1fr))` }"
              >
                <div
                  v-for="d in daysHeader"
                  :key="d.dateStr"
                  class="border-r border-border/10 h-full"
                  :class="{ 'bg-muted/20': d.isWeekend }"
                ></div>
              </div>

              <!-- Bar Item -->
              <div
                class="absolute h-6 rounded-xl flex items-center px-2 text-[11px] font-medium transition-all z-10 overflow-hidden"
                :class="[
                  item.type === 'MILESTONE' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40' :
                  item.status === 'COMPLETED' ? 'bg-primary/20 text-primary border border-primary/30' :
                  item.status === 'ON_TRACK' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                  item.status === 'AT_RISK' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                ]"
                :style="calculateBarPosition(item.startDate, item.endDate)"
                :title="`${item.title} (${item.progress}%)`"
              >
                <span class="truncate">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
