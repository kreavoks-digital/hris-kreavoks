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

    <div class="overflow-x-auto flex-1 flex flex-col min-h-[200px]">
      <Table v-if="logs && logs.length > 0">
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
      
      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500 h-full">
        <div class="w-20 h-20 mb-3 text-muted-foreground/30 dark:text-muted-foreground/20">
          <CalendarX class="w-full h-full stroke-[1.5]" />
        </div>
        <p class="text-foreground font-medium">Belum ada riwayat kehadiran</p>
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table'

defineProps<{
  logs: AttendanceLog[]
}>()
</script>
