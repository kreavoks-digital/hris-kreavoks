<template>
  <Card class="bg-card p-6 rounded-3xl border border-border grid grid-cols-1 md:grid-cols-12 gap-4 shadow-none">
    
    <!-- Calendar Area (span 7) -->
    <Calendar 
      class="md:col-span-7"
      v-model="model"
      locale="id-ID"
      :get-custom-indicators="getCustomIndicators"
    />

    <!-- Events Area (span 5) -->
    <div class="md:col-span-5 flex flex-col justify-between border-l border-border pl-0 md:pl-6">
      <div>
        <h4 class="text-sm font-bold text-kv-primary">{{ selectedDate }} November 2024</h4>
        
        <div class="mt-4 space-y-3">
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
      </div>
    </div>

  </Card>
</template>

<script setup lang="ts">
import type { CalendarEvent } from '../types'
import { Card } from '~/components/ui/card'
import { Calendar } from '~/components/ui/calendar'

defineProps<{
  events: CalendarEvent[]
  selectedDate: number
  getCustomIndicators?: (date: any) => Array<'blue' | 'yellow' | 'green'>
}>()

const model = defineModel<any>()
</script>
