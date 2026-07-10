<template>
  <Card class="border border-border bg-card overflow-hidden rounded-3xl">
    <div class="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50 hover:bg-muted/50">
            <TableHead class="font-semibold" v-if="isAdmin">Karyawan</TableHead>
            <TableHead class="font-semibold">Tipe Pengajuan</TableHead>
            <TableHead class="font-semibold">Tanggal</TableHead>
            <TableHead class="font-semibold">Alasan</TableHead>
            <TableHead class="font-semibold">Status</TableHead>
            <TableHead class="text-right font-semibold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading" class="h-32">
            <TableCell :colspan="isAdmin ? 6 : 5" class="text-center">
              Mengambil data cuti...
            </TableCell>
          </TableRow>
          <template v-else-if="filteredLeaves.length > 0" v-for="leave in filteredLeaves" :key="leave.id">
            <TableRow class="hover:bg-accent/50 transition-colors border-border">
              <TableCell v-if="isAdmin">
                <div class="flex items-center gap-2">
                  <Avatar class="h-8 w-8">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.user?.fullName || 'Karyawan'}`" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div class="flex flex-col">
                    <span class="font-medium text-sm text-foreground">{{ leave.user?.fullName || 'Unknown' }}</span>
                    <span class="text-xs text-muted-foreground">{{ leave.user?.email }}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="capitalize">
                  {{ getLeaveTypeLabel(leave.type || 'Izin') }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 text-sm text-foreground/80">
                  <CalendarIcon class="h-3.5 w-3.5 text-slate-400" />
                  {{ formatDate(leave.createdAt || leave.startDate) }}
                </div>
              </TableCell>
              <TableCell class="max-w-xs truncate" :title="leave.reason">
                {{ leave.reason }}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  class="text-xs font-semibold px-2.5 py-0.5 rounded-3xl border-none capitalize"
                  :class="{
                    'bg-amber-500/10 text-amber-600': leave.status?.toLowerCase() === 'pending',
                    'bg-emerald-500/10 text-emerald-600': leave.status?.toLowerCase() === 'approved',
                    'bg-rose-500/10 text-rose-600': leave.status?.toLowerCase() === 'rejected'
                  }"
                >
                  {{ leave.status }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div v-if="isAdmin && leave.status?.toLowerCase() === 'pending'" class="flex justify-end gap-2">
                  <Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white h-8 rounded-xl px-3" @click="$emit('approve', leave.id)">
                    Setujui
                  </Button>
                  <Button size="sm" variant="destructive" class="h-8 rounded-xl px-3" @click="$emit('reject', leave.id)">
                    Tolak
                  </Button>
                </div>
                <div v-else-if="!isAdmin && leave.status?.toLowerCase() === 'pending'">
                  <Button size="sm" variant="outline" class="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 hover:border-rose-300 h-8 rounded-xl px-3" @click="$emit('cancel', leave.id)">
                    Batalkan
                  </Button>
                </div>
                <span v-else class="text-xs text-muted-foreground">-</span>
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="isAdmin ? 6 : 5" class="h-32 text-center text-muted-foreground">
              Tidak ada data pengajuan.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import type { LeaveRecord } from '~/types'

defineProps<{
  filteredLeaves: LeaveRecord[]
  isAdmin: boolean
  loading: boolean
  getLeaveTypeLabel: (type: string) => string
  formatDate: (date: string) => string
}>()

defineEmits<{
  (e: 'approve', id: string): void
  (e: 'reject', id: string): void
  (e: 'cancel', id: string): void
}>()
</script>
