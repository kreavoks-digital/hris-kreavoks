<template>
  <div class="space-y-4">
    <Card class="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-none">
      <div class="flex items-center justify-between pb-3 border-b border-border">
        <div class="flex items-center gap-2">
          <List class="w-5 h-5 text-kv-primary" />
          <h3 class="text-base sm:text-lg font-bold text-foreground">
            Daftar Agenda ({{ currentMonthLabel }})
          </h3>
        </div>
        <span class="text-xs text-muted-foreground font-medium">
          {{ agendaGroupedEvents.length }} hari kegiatan &bull; {{ totalEventsCount }} acara
        </span>
      </div>

      <div v-if="agendaGroupedEvents.length > 0" class="divide-y divide-border/60 mt-2">
        <div
          v-for="group in agendaGroupedEvents"
          :key="group.dateStr"
          class="py-4 first:pt-2 last:pb-1 space-y-3"
        >
          <!-- Date Group Header -->
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0',
                isTodayDate(group.date) ? 'bg-kv-primary text-white' : 'bg-muted text-foreground'
              ]"
            >
              {{ group.date.getDate() }}
            </div>
            <div>
              <h4 class="text-sm font-bold text-foreground">
                {{ formatGroupDate(group.date) }}
              </h4>
              <p class="text-[11px] text-muted-foreground">
                {{ group.events.length }} agenda
              </p>
            </div>
          </div>

          <!-- Event Cards for this date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-1 sm:pl-12">
            <div
              v-for="ev in group.events"
              :key="ev.id"
              @click="emit('eventClick', ev, group.events)"
              class="p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col justify-between gap-2.5 cursor-pointer shadow-xs border-l-4 group"
              :style="{ borderLeftColor: ev.color || '#4082E6' }"
            >
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h5 class="text-sm font-bold text-foreground group-hover:text-kv-primary transition-colors">
                    {{ ev.title }}
                  </h5>
                  <Badge variant="secondary" size="sm" class="shrink-0 font-medium text-[10px]">
                    {{ ev.type }}
                  </Badge>
                </div>

                <p v-if="ev.description" class="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {{ ev.description }}
                </p>
              </div>

              <div class="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                <span class="flex items-center gap-1.5 font-medium">
                  <Clock class="w-3.5 h-3.5 text-kv-primary shrink-0" />
                  {{ formatEventTime(ev) }}
                </span>

                <span v-if="ev.location" class="flex items-center gap-1 truncate max-w-[150px]">
                  <MapPin class="w-3.5 h-3.5 shrink-0" />
                  <span class="truncate">{{ ev.location }}</span>
                </span>
                <span v-else class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Video class="w-3.5 h-3.5 shrink-0" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Agenda -->
      <div v-else class="text-center py-12 space-y-3">
        <div class="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <CalendarIcon class="w-7 h-7 opacity-50" />
        </div>
        <h4 class="text-sm font-semibold text-foreground">Belum Ada Agenda di Periode Ini</h4>
        <p class="text-xs text-muted-foreground max-w-sm mx-auto">
          Tidak ada kegiatan atau acara kerja yang ditemukan pada bulan atau rentang tanggal yang dipilih.
        </p>
        <Button
          variant="primary"
          size="sm"
          :icon-left="Plus"
          label="Buat Jadwal Baru"
          class="mt-2"
          @click="navigateTo('/calendar/create')"
        />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  List,
  Clock,
  MapPin,
  Video,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Button, Badge } from '@kreavoks/kreaui'
import type { CalendarEventItem } from '../types/calendar.types'

defineProps<{
  currentMonthLabel: string
  totalEventsCount: number
  agendaGroupedEvents: Array<{
    dateStr: string
    date: Date
    events: CalendarEventItem[]
  }>
  isTodayDate: (d: Date) => boolean
  formatGroupDate: (d: Date) => string
  formatEventTime: (ev: CalendarEventItem) => string
}>()

const emit = defineEmits<{
  eventClick: [event: CalendarEventItem, groupEvents: CalendarEventItem[]]
}>()
</script>
