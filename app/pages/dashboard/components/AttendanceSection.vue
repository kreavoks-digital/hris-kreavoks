<template>
  <div class="grid gap-4 lg:grid-cols-12">
    <!-- Column 1: Attendance Log Table (span 4) -->
    <Card class="lg:col-span-4 bg-card p-6 rounded-3xl border border-border flex flex-col shadow-none">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="flex items-start gap-2">
          <Clock class="h-5 w-5 text-kv-primary mt-0.5" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-foreground">Riwayat Kehadiran</span>
            <p class="text-xs text-muted-foreground mt-0.5">25 Nov – 28 Nov 2025</p>
          </div>
        </div>
        <Button variant="link" class="text-xs font-bold text-kv-primary p-0 h-auto hover:underline" @click="$router.push('/attendance')">
          See All
        </Button>
      </div>

      <div class="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow class="border-b border-border hover:bg-transparent">
              <TableHead class="text-sm font-semibold text-foreground">Tanggal</TableHead>
              <TableHead class="text-sm font-semibold text-foreground">
                <span class="inline-flex items-center gap-1">
                  <ArrowDown class="h-3.5 w-3.5 text-foreground/70" />
                  Mulai
                </span>
              </TableHead>
              <TableHead class="text-sm font-semibold text-foreground">
                <span class="inline-flex items-center gap-1">
                  <ArrowUp class="h-3.5 w-3.5 text-foreground/70" />
                  Selesai
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="divide-y divide-border/50">
            <TableRow v-for="(log, idx) in logs" :key="idx" class="hover:bg-accent/50 transition-colors border-none">
              <TableCell class="text-sm text-foreground py-2 whitespace-nowrap">{{ log.tanggal }}</TableCell>
              <TableCell class="text-sm py-2 whitespace-nowrap">
                <span :class="log.isIzin ? 'text-rose-500 font-medium' : 'text-foreground'">
                  {{ log.datang }}
                </span>
              </TableCell>
              <TableCell class="text-sm py-2 whitespace-nowrap">
                <span :class="log.isIzin ? 'text-rose-500 font-medium' : 'text-foreground'">
                  {{ log.pulang }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- Column 2: Clock-in/Clock-out (span 3) -->
    <Card class="lg:col-span-3 bg-card p-6 rounded-3xl border border-border flex flex-col justify-between text-center shadow-none">
      <div>
        <div class="text-sm font-semibold text-foreground">Absensi</div>
        <hr class="border-t border-border mt-3" />
      </div>
      <div class="space-y-4 my-auto">
        <!-- Big clock duration -->
        <div>
          <h2 class="text-2xl font-bold text-foreground tabular-nums">
            {{ attendanceState === 'clocked_out' ? clockRangeText : currentTime }}
          </h2>
          <p class="text-xs text-muted-foreground mt-2" v-html="statusText"></p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3 mt-6">
        <div class="grid grid-cols-2 gap-3">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button 
                :variant="attendanceState === 'clocked_in' ? 'default' : 'outline'"
                :disabled="attendanceState !== 'clocked_in'"
                class="px-4 text-sm font-semibold transition-all duration-300"
                :class="attendanceState === 'clocked_in' ? 'bg-kv-primary text-white hover:bg-kv-primary/95' : ''"
              >
                Clock Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Absen Pulang</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin melakukan Clock Out sekarang (pukul {{ currentTime }} WIB)? Anda tidak bisa mengubahnya setelah ini.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel as-child>
                  <Button variant="outline">Batal</Button>
                </AlertDialogCancel>
                <AlertDialogAction as-child>
                  <Button @click="$emit('clock-out')" class="bg-kv-primary text-white hover:bg-kv-primary/90">Ya, Clock Out</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button 
                :variant="attendanceState === 'not_clocked_in' ? 'default' : 'outline'"
                :disabled="attendanceState !== 'not_clocked_in'"
                class="px-4 text-sm font-semibold transition-all duration-300"
                :class="attendanceState === 'not_clocked_in' ? 'bg-kv-primary text-white hover:bg-kv-primary/95' : ''"
              >
                Clock In
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Absen Masuk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin melakukan Clock In pada pukul {{ currentTime }} WIB?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel as-child>
                  <Button variant="outline">Batal</Button>
                </AlertDialogCancel>
                <AlertDialogAction as-child>
                  <Button @click="$emit('clock-in')" class="bg-kv-primary text-white hover:bg-kv-primary/90">Ya, Clock In</Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button 
          variant="link" 
          class="text-xs font-bold text-kv-primary block mx-auto py-1 h-auto hover:underline"
          :disabled="attendanceState === 'clocked_out'"
        >
          Ajukan Izin
        </Button>
      </div>
    </Card>

    <!-- Column 3: Calendar & Upcoming Events (span 5) -->
    <Card class="lg:col-span-5 bg-card p-6 rounded-3xl border border-border grid grid-cols-1 md:grid-cols-12 gap-4 shadow-none">
      
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
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp, Clock } from 'lucide-vue-next'
import type { AttendanceLog, CalendarEvent } from '../types'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Calendar } from '~/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

defineProps<{
  logs: AttendanceLog[]
  events: CalendarEvent[]
  statusText: string
  selectedDate: number
  getCustomIndicators?: (date: any) => Array<'blue' | 'yellow' | 'green'>
  attendanceState: 'not_clocked_in' | 'clocked_in' | 'clocked_out'
  currentTime: string
  clockRangeText: string
}>()

const model = defineModel<any>()

defineEmits(['clock-in', 'clock-out'])
</script>
