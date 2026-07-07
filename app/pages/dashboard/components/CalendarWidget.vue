<template>
  <Card class="bg-card p-6 rounded-3xl border border-border grid grid-cols-1 md:grid-cols-12 gap-4 shadow-none">

    <!-- Calendar Area (span 7) -->
    <CustomCalendar
      class="md:col-span-7"
      :model-value="modelValue"
      :holidays="holidays"
      :get-custom-indicators="getCustomIndicators"
      @update:model-value="(val) => emit('update:modelValue', val)"
    />

    <!-- Events Area (span 5) -->
    <div class="md:col-span-5 flex flex-col border-l border-border pl-0 md:pl-6">
      <h4 class="text-sm font-bold text-kv-primary">
        {{ modelValue?.day }} {{ monthName }} {{ modelValue?.year }}
      </h4>

      <div class="mt-4 space-y-3 flex-1 max-h-[240px] overflow-y-auto pr-2">
        <div v-if="events.length === 0" class="text-xs text-muted-foreground py-4 italic">
          Tidak ada agenda, hari libur, atau logbook pada tanggal ini.
        </div>
        <div
          v-else
          v-for="(event, idx) in events"
          :key="idx"
          class="pl-3 border-l-4 py-1 animate-in fade-in slide-in-from-left-1 duration-200"
          :class="{
            'border-blue-500': event.type === 'blue',
            'border-amber-400': event.type === 'yellow',
            'border-emerald-500': event.type === 'green'
          }"
        >
          <p class="text-xs font-semibold text-foreground">{{ event.title }}</p>
          <p class="text-[10px] text-muted-foreground mt-0.5">
            {{ event.date }}<span v-if="event.time">, {{ event.time }}</span>
          </p>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 pt-3 border-t border-border space-y-1.5">
        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Keterangan</p>
        <div class="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> Hari libur nasional
        </div>
        <div class="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Entri logbook
        </div>
      </div>
    </div>

  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from '../types'
import { Card } from '~/components/ui/card'
import CustomCalendar from '~/components/ui/calendar/CustomCalendar.vue'

interface SimpleDate {
  year: number
  month: number
  day: number
  iso: string
}

const props = defineProps<{
  modelValue?: SimpleDate | null
  events: CalendarEvent[]
  getCustomIndicators?: (date: any) => Array<'blue' | 'yellow' | 'green'>
  holidays?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SimpleDate]
}>()

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const monthName = computed(() => {
  if (!props.modelValue) return ''
  return MONTHS_ID[props.modelValue.month - 1]
})
</script>
