<template>
  <Card class="bg-card p-6 rounded-3xl border border-border flex flex-col shadow-none">
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

    <div class="overflow-hidden flex-1 flex flex-col">
      <div v-if="logs && logs.length > 0" class="max-h-[250px] overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
        <div v-for="(log, idx) in logs" :key="idx" class="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-accent/10 hover:bg-accent/30 transition-colors">
          <div class="flex flex-col gap-1.5 w-full">
            <span class="text-xs font-medium text-foreground">{{ log.tanggal }}</span>
            <div class="flex items-center gap-4 text-xs">
              <span class="inline-flex items-center gap-1.5">
                <ArrowDown class="h-3.5 w-3.5 text-emerald-500" />
                <span :class="log.isIzin ? 'text-rose-500 font-medium' : 'text-muted-foreground'">{{ log.datang }}</span>
              </span>
              <span class="inline-flex items-center gap-1.5">
                <ArrowUp class="h-3.5 w-3.5 text-orange-500" />
                <span :class="log.isIzin ? 'text-rose-500 font-medium' : 'text-muted-foreground'">{{ log.pulang }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500 h-full">
        <div class="w-16 h-16 mb-3 text-muted-foreground/30 dark:text-muted-foreground/20">
          <CalendarX class="w-full h-full stroke-[1.5]" />
        </div>
        <p class="text-foreground font-medium text-sm">Belum ada riwayat kehadiran</p>
        <p class="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">Data absensi Anda di minggu ini akan muncul di sini.</p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Clock, ArrowDown, ArrowUp, CalendarX } from 'lucide-vue-next'
import type { AttendanceLog } from '../types'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

defineProps<{
  logs: AttendanceLog[]
}>()
</script>
