<template>
  <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-none overflow-hidden">
    <!-- Days of Week Header -->
    <div class="grid grid-cols-7 gap-px border-b border-border pb-2.5 mb-2 text-center text-[11px] sm:text-xs font-semibold text-muted-foreground">
      <div>Sen</div>
      <div>Sel</div>
      <div>Rab</div>
      <div>Kam</div>
      <div>Jum</div>
      <div class="text-rose-500">Sab</div>
      <div class="text-rose-500">Min</div>
    </div>

    <!-- Days Cells Grid: proportional on mobile, min-h-[560px] only on desktop -->
    <div class="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr sm:min-h-[560px]">
      <div
        v-for="(day, idx) in calendarGridDays"
        :key="idx"
        @click="emit('dayClick', day)"
        :class="[
          'border rounded-xl sm:rounded-2xl p-1 sm:p-2 min-h-[52px] sm:min-h-[105px] flex flex-col transition-colors cursor-pointer',
          day.isCurrentMonth ? 'bg-background hover:bg-muted/30 border-border' : 'bg-muted/10 opacity-30 border-transparent',
          day.isToday ? 'ring-2 ring-kv-primary border-transparent' : '',
          isInSelectedRange(day.date) ? 'ring-2 ring-kv-primary/50 bg-kv-primary/5' : '',
          activeMobileDateStr === getIsoDateStr(day.date) ? 'border-kv-primary/70 bg-muted/40' : ''
        ]"
      >
        <!-- Date number header -->
        <div class="flex items-center justify-between sm:mb-1">
          <span
            :class="[
              'text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full',
              day.isToday ? 'bg-kv-primary text-white font-bold' : (day.isWeekend ? 'text-rose-500' : 'text-foreground')
            ]"
          >
            {{ day.date.getDate() }}
          </span>

          <span v-if="day.events.length > 0" class="text-[10px] text-muted-foreground hidden sm:inline">
            {{ day.events.length }} acara
          </span>
        </div>

        <!-- Mobile view: Event indicator dots -->
        <div v-if="day.events.length > 0" class="flex items-center justify-center gap-1 mt-1 flex-wrap sm:hidden">
          <span
            v-for="ev in day.events.slice(0, 3)"
            :key="ev.id"
            class="w-1.5 h-1.5 rounded-full shrink-0"
            :style="{ backgroundColor: ev.color || '#4082E6' }"
          />
          <span v-if="day.events.length > 3" class="text-[9px] font-bold text-muted-foreground leading-none">
            +
          </span>
        </div>

        <!-- Desktop view: Full Event badges with title -->
        <div class="hidden sm:block space-y-1 flex-1 overflow-hidden mt-1">
          <div
            v-for="ev in day.events.slice(0, 3)"
            :key="ev.id"
            @click.stop="emit('eventClick', ev, day.events)"
            class="px-2 py-0.5 rounded-lg text-[11px] truncate font-medium border flex items-center gap-1.5 transition-transform hover:opacity-90 text-foreground"
            :style="{
              backgroundColor: `${ev.color || '#4082E6'}20`,
              borderColor: `${ev.color || '#4082E6'}50`
            }"
            :title="ev.title"
          >
            <span
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: ev.color || '#4082E6' }"
            />
            <span class="truncate">{{ ev.title }}</span>
          </div>

          <!-- More indicator -->
          <div
            v-if="day.events.length > 3"
            class="text-[10px] text-muted-foreground font-medium pl-1"
          >
            +{{ day.events.length - 3 }} lainnya
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Selected Date Agenda Section in Month View -->
    <div class="sm:hidden mt-3 pt-3 border-t border-border space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <CalendarDays class="w-4 h-4 text-kv-primary" />
          <h4 class="text-xs font-bold text-foreground">
            {{ activeMobileDateLabel }}
          </h4>
        </div>
        <Button
          variant="link"
          size="xs"
          label="+ Buat Jadwal"
          @click="navigateTo(`/calendar/create?date=${activeMobileDateStr}`)"
        />
      </div>

      <div v-if="activeMobileEvents.length > 0" class="space-y-1.5">
        <div
          v-for="ev in activeMobileEvents"
          :key="ev.id"
          @click="emit('eventClick', ev, activeMobileEvents)"
          class="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-xs"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: ev.color || '#4082E6' }"
            />
            <div class="min-w-0">
              <p class="text-xs font-bold text-foreground truncate">{{ ev.title }}</p>
              <p class="text-[11px] text-muted-foreground truncate">
                {{ formatEventTime(ev) }} &bull; {{ ev.location || 'Online' }}
              </p>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
        </div>
      </div>
      <div v-else class="text-center py-3 bg-muted/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
        Tidak ada agenda pada tanggal ini.
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { CalendarDays, ChevronRight } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button } from '@kreavoks/kreaui'
import type { CalendarEventItem } from '../types/calendar.types'

export interface CalendarGridDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  events: CalendarEventItem[]
}

defineProps<{
  calendarGridDays: CalendarGridDay[]
  activeMobileDateStr: string
  activeMobileDateLabel: string
  activeMobileEvents: CalendarEventItem[]
  isInSelectedRange: (date: Date) => boolean
  getIsoDateStr: (date: Date) => string
  formatEventTime: (ev: CalendarEventItem) => string
}>()

const emit = defineEmits<{
  dayClick: [day: CalendarGridDay]
  eventClick: [event: CalendarEventItem, dayEvents: CalendarEventItem[]]
}>()
</script>
