<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Manajemen Cuti</h1>
        <p class="text-slate-500 mt-1 text-sm">Kelola pengajuan, riwayat, dan sisa jatah cuti Anda.</p>
      </div>
      <Button @click="navigateTo('/cuti/ajukan')" class="gap-2 shadow-sm">
        <PlusCircle class="h-4 w-4" />
        Ajukan Cuti
      </Button>
    </div>

    <!-- Balance Overview -->
    <div class="grid gap-6 md:grid-cols-2">
      <Card class="border-none shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
        <CardContent class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-slate-500 uppercase tracking-widest pb-1">Sisa Cuti Tahunan</p>
              <h2 class="text-5xl font-black text-blue-600 tracking-tighter">{{ leaveBalance.annual }}</h2>
              <p class="text-xs font-semibold text-slate-400 mt-1">Hari Tersedia</p>
            </div>
            <div class="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <CalendarDays class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20"></div>
      </Card>

      <Card class="border-none shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
        <CardContent class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-slate-500 uppercase tracking-widest pb-1">Cuti Terpakai</p>
              <h2 class="text-5xl font-black text-slate-900 tracking-tighter">{{ leaveBalance.used }}</h2>
              <p class="text-xs font-semibold text-slate-400 mt-1">Hari Tahun Ini</p>
            </div>
            <div class="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
              <History class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-slate-200"></div>
      </Card>
    </div>

    <!-- History and Filters -->
    <Card class="border-none shadow-md overflow-hidden">
      <CardHeader class="pb-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <CardTitle class="text-lg font-bold">Riwayat Pengajuan</CardTitle>
          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select v-model="filterStatus">
              <SelectTrigger class="w-[140px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filterType">
              <SelectTrigger class="w-[160px] bg-white">
                <SelectValue placeholder="Jenis Cuti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Jenis</SelectItem>
                <SelectItem value="annual">Cuti Tahunan</SelectItem>
                <SelectItem value="sick">Cuti Sakit</SelectItem>
                <SelectItem value="emergency">Cuti Darurat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <div class="relative overflow-x-auto">
        <Table>
          <TableHeader class="bg-slate-50/50">
            <TableRow>
              <TableHead class="text-xs font-bold uppercase text-slate-500 tracking-wider">Tgl Pengajuan</TableHead>
              <TableHead class="text-xs font-bold uppercase text-slate-500 tracking-wider">Jenis</TableHead>
              <TableHead class="text-xs font-bold uppercase text-slate-500 tracking-wider">Periode</TableHead>
              <TableHead class="text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Durasi</TableHead>
              <TableHead class="text-xs font-bold uppercase text-slate-500 tracking-wider">Status</TableHead>
              <TableHead class="text-right text-xs font-bold uppercase text-slate-500 tracking-wider px-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="leave in filteredLeaves" :key="leave.id" class="hover:bg-slate-50/30 transition-colors group">
              <TableCell class="text-sm text-slate-600">{{ formatDate(leave.createdAt) }}</TableCell>
              <TableCell>
                <div class="font-medium text-slate-900 leading-none">{{ getLeaveTypeLabel(leave.type) }}</div>
                <div class="text-[10px] text-slate-400 mt-1 uppercase font-bold">{{ leave.reason || '-' }}</div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span>{{ formatDate(leave.startDate) }}</span>
                  <ArrowRight class="h-3 w-3 text-slate-300" />
                  <span>{{ formatDate(leave.endDate) }}</span>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <Badge variant="outline" class="text-[10px] font-bold border-slate-200">{{ leave.duration }} Hari</Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="getStatusVariant(leave.status)"
                  class="capitalize text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                >
                  <span class="mr-1 h-1.5 w-1.5 rounded-full bg-current"></span>
                  {{ getStatusLabel(leave.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right px-6">
                <div class="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button v-if="leave.status === 'pending'" variant="ghost" size="sm" class="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2" @click="cancelLeave(leave.id)">
                    <XCircle class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" class="h-8 text-slate-600 px-2" @click="viewDetail(leave.id)">
                    <Info class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredLeaves.length === 0">
              <TableCell colspan="6" class="h-48 text-center">
                <div class="flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <PackageOpen class="h-10 w-10 opacity-20" />
                  <p class="text-sm font-medium">Belum ada riwayat pengajuan cuti</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  PlusCircle, 
  CalendarDays, 
  History, 
  ArrowRight, 
  XCircle, 
  Info,
  PackageOpen
} from 'lucide-vue-next'
import { useCuti } from './hooks/useCuti'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '~/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  filterStatus,
  filterType,
  leaveBalance,
  filteredLeaves,
  fetchLeaves,
  cancelLeave,
  getLeaveTypeLabel,
  getStatusLabel,
  formatDate,
  loading
} = useCuti()

const viewDetail = (leaveId: string) => {
  navigateTo(`/cuti/${leaveId}`);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary'
    case 'approved': return 'default'
    case 'rejected': return 'destructive'
    default: return 'outline'
  }
}

onMounted(() => {
  fetchLeaves();
});
</script>
