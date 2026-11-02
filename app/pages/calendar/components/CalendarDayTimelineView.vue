<template>
  <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-none overflow-hidden space-y-4">
    <!-- Top Collapsible Mini Calendar Week/Month Strip -->
    <div class="border-b border-border pb-3 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-muted-foreground">
          {{ currentMonthLabel }}
        </span>
        <button
          type="button"
          @click="isMiniMonthExpanded = !isMiniMonthExpanded"
          class="text-xs text-kv-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>{{ isMiniMonthExpanded ? 'Perkecil' : 'Kalender Bulan' }}</span>
          <ChevronUp v-if="isMiniMonthExpanded" class="w-3.5 h-3.5" />
          <ChevronDown v-else class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Expanded: Mini Month 30-Day Grid -->
      <div v-if="isMiniMonthExpanded" class="pt-1 select-none">
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-1">
          <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span class="text-rose-500">Sab</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(day, idx) in miniCalendarDays"
            :key="idx"
            type="button"
            @click="activeMobileDate = day.date"
            :class="[
              'h-8 rounded-full text-xs font-medium flex flex-col items-center justify-center transition-all cursor-pointer relative',
              day.isSelected ? 'bg-kv-primary text-white font-bold shadow-sm' : (day.isToday ? 'ring-1 ring-kv-primary text-kv-primary font-bold' : (day.isCurrentMonth ? 'text-foreground hover:bg-muted' : 'text-muted-foreground/40')),
            ]"
          >
            <span>{{ day.date.getDate() }}</span>
            <span v-if="day.hasEvents && !day.isSelected" class="w-1 h-1 rounded-full bg-kv-primary absolute bottom-1" />
          </button>
        </div>
      </div>

      <!-- Collapsed: 7-Day Current Week Strip -->
      <div v-else class="grid grid-cols-7 gap-1 sm:gap-2 text-center select-none">
        <button
          v-for="(day, idx) in currentWeekDays"
          :key="idx"
          type="button"
          @click="activeMobileDate = day.date"
          :class="[
            'py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer',
            day.isSelected ? 'bg-kv-primary text-white font-bold shadow-sm' : 'hover:bg-muted/40 text-muted-foreground'
          ]"
        >
          <span class="text-[10px] sm:text-xs font-medium">{{ day.dayName }}</span>
          <span
            :class="[
              'w-7 h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold',
              day.isSelected ? 'bg-white/20' : (day.isToday ? 'text-kv-primary ring-1 ring-kv-primary' : 'text-foreground')
            ]"
          >
            {{ day.dayNumber }}
          </span>
          <span v-if="day.hasEvents && !day.isSelected" class="w-1 h-1 rounded-full bg-kv-primary" />
        </button>
      </div>
    </div>

    <!-- Selected Day Header with Date Badge & All-Day Banner -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-kv-primary text-white flex flex-col items-center justify-center font-bold shrink-0">
            <span class="text-xs uppercase leading-none font-medium opacity-90">{{ getDayShortName(activeMobileDate) }}</span>
            <span class="text-base leading-tight font-extrabold">{{ activeMobileDate.getDate() }}</span>
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-foreground">
              {{ activeMobileDateLabel }}
            </h3>
            <p class="text-xs text-muted-foreground">
              {{ activeDayTimelineEvents.length }} acara terjadwal
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          :icon-left="Plus"
          label="Tambah di Tanggal Ini"
          class="hidden sm:inline-flex"
          @click="navigateTo(`/calendar/create?date=${activeMobileDateStr}`)"
        />
      </div>

      <!-- All-Day Events Pill Banner -->
      <div v-if="dayAllDayEvents.length > 0" class="space-y-1.5 pt-1">
        <div
          v-for="ev in dayAllDayEvents"
          :key="ev.id"
          @click="emit('eventClick', ev, dayAllDayEvents)"
          class="px-3 py-2 rounded-xl bg-kv-primary/10 border border-kv-primary/25 text-kv-primary flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-kv-primary/15 transition-colors"
        >
          <div class="flex items-center gap-2 min-w-0">
            <CheckCircle2 class="w-4 h-4 shrink-0 text-kv-primary" />
            <span class="truncate font-bold">{{ ev.title }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-md bg-kv-primary/20 shrink-0">Sepanjang Hari</span>
          </div>
          <ChevronRight class="w-3.5 h-3.5 shrink-0 opacity-60" />
        </div>
      </div>
    </div>

    <!-- Hourly Timeline Grid -->
    <div class="relative border-t border-border/60 pt-2 select-none">
      <div class="space-y-0">
        <div
          v-for="h in timelineHours"
          :key="h"
          class="flex items-start group min-h-[64px]"
        >
          <!-- Hour Label -->
          <div class="w-14 sm:w-20 text-right pr-3 -mt-2 text-[11px] sm:text-xs font-semibold text-muted-foreground shrink-0">
            {{ formatHourLabel(h) }}
          </div>

          <!-- Time Slot Cell with Top Line -->
          <div
            class="flex-1 border-t border-border/40 relative min-h-[64px] pl-2 pr-1 py-1 transition-colors hover:bg-muted/15 cursor-pointer rounded-r-xl"
            @click="emit('slotClick', h)"
            :title="`Klik untuk buat jadwal di jam ${formatHourLabel(h)}`"
          >
            <!-- Real-time Current Time Line Indicator -->
            <div
              v-if="isTodayDate(activeMobileDate) && currentHour === h"
              class="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              :style="{ top: `${(currentMinutes / 60) * 100}%` }"
            >
              <div class="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 ring-2 ring-background shrink-0 shadow-sm" />
              <div class="flex-1 h-[2px] bg-rose-500 shadow-sm" />
            </div>

            <!-- Events occurring in this hour -->
            <div v-if="getEventsForHour(activeMobileDate, h).length > 0" class="space-y-1.5 z-10 relative">
              <div
                v-for="ev in getEventsForHour(activeMobileDate, h)"
                :key="ev.id"
                @click.stop="emit('eventClick', ev, activeDayTimelineEvents)"
                class="p-2 sm:p-2.5 rounded-xl border transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs"
                :style="{
                  backgroundColor: `${ev.color || '#4082E6'}18`,
                  borderColor: `${ev.color || '#4082E6'}45`,
                  borderLeftWidth: '4px',
                  borderLeftColor: ev.color || '#4082E6'
                }"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs sm:text-sm font-bold text-foreground truncate">
                      {{ ev.title }}
                    </p>
                    <p class="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <Clock class="w-3 h-3 shrink-0" />
                      <span>{{ formatEventTime(ev) }}</span>
                      <span v-if="ev.location" class="flex items-center gap-1 truncate">
                        &bull; <MapPin class="w-3 h-3 shrink-0" /> {{ ev.location }}
                      </span>
                    </p>
                  </div>

                  <div v-if="ev.attendees?.length" class="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 bg-background/60 px-1.5 py-0.5 rounded-md border border-border/50">
                    <Users class="w-3 h-3" />
                    <span>{{ ev.attendees.length }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hover hint for empty slot -->
            <div v-else class="h-full flex items-center opacity-0 group-hover:opacity-60 transition-opacity text-[10px] text-muted-foreground italic pl-1">
              + Tambah acara jam {{ formatHourLabel(h) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button } from '@kreavoks/kreaui'
import type { CalendarEventItem } from '../types/calendar.types'

const activeMobileDate = defineModel<Date>('activeMobileDate', { required: true })
const isMiniMonthExpanded = defineModel<boolean>('isMiniMonthExpanded', { required: true })

defineProps<{
  currentMonthLabel: string
  activeMobileDateStr: string
  activeMobileDateLabel: string
  activeDayTimelineEvents: CalendarEventItem[]
  dayAllDayEvents: CalendarEventItem[]
  currentWeekDays: Array<{
    date: Date
    dayName: string
    dayNumber: number
    isToday: boolean
    isSelected: boolean
    hasEvents: boolean
  }>
  miniCalendarDays: Array<{
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    hasEvents: boolean
  }>
  timelineHours: number[]
  currentHour: number
  currentMinutes: number
  isTodayDate: (d: Date) => boolean
  getDayShortName: (d: Date) => string
  formatHourLabel: (h: number) => string
  formatEventTime: (ev: CalendarEventItem) => string
  getEventsForHour: (date: Date, hour: number) => CalendarEventItem[]
}>()

const emit = defineEmits<{
  eventClick: [event: CalendarEventItem, dayEvents: CalendarEventItem[]]
  slotClick: [hour: number]
}>()
</script>
