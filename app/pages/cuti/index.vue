<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-kv-black dark:text-slate-50">Manajemen Cuti</h1>
        <p class="text-slate-500 mt-1 text-sm">Kelola pengajuan, riwayat, dan sisa jatah cuti Anda.</p>
      </div>
      <Button @click="navigateTo('/cuti/ajukan')" class="gap-2 rounded-3xl h-10">
        <PlusCircle class="h-4 w-4" />
        Ajukan Cuti
      </Button>
    </div>

    <!-- Balance Overview -->
    <div class="grid gap-6 md:grid-cols-2">
      <Card class="border border-slate-100 overflow-hidden relative group rounded-3xl">
        <CardContent class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-slate-400 pb-1">Sisa Cuti Tahunan</p>
              <h2 class="text-4xl font-semibold text-kv-primary">{{ leaveBalance.annual }}</h2>
              <p class="text-sm text-slate-400 mt-1">Hari Tersedia</p>
            </div>
            <div class="h-12 w-12 rounded-3xl bg-kv-primary/10 flex items-center justify-center text-kv-primary transition-colors group-hover:bg-kv-primary/20">
              <CalendarDays class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border border-slate-100 overflow-hidden relative group rounded-3xl">
        <CardContent class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-slate-400 pb-1">Cuti Terpakai</p>
              <h2 class="text-4xl font-semibold text-kv-black">{{ leaveBalance.used }}</h2>
              <p class="text-sm text-slate-400 mt-1">Hari Tahun Ini</p>
            </div>
            <div class="h-12 w-12 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-500/20">
              <History class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters and History Section -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
      <h2 class="text-xl font-semibold text-kv-black">Riwayat Pengajuan</h2>
      <div class="flex flex-wrap gap-3 w-full md:w-auto">
        <Select v-model="filterStatus">
          <SelectTrigger class="w-[150px] bg-white border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl h-12 px-5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-slate-100">
            <SelectItem value="none">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterType">
          <SelectTrigger class="w-[180px] bg-white border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl h-12 px-5">
            <SelectValue placeholder="Jenis Cuti" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-slate-100">
            <SelectItem value="none">Semua Jenis</SelectItem>
            <SelectItem value="annual">Cuti Tahunan</SelectItem>
            <SelectItem value="sick">Cuti Sakit</SelectItem>
            <SelectItem value="emergency">Cuti Darurat</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table Card -->
    <Card class="border border-slate-100 overflow-hidden rounded-3xl mt-4">


      <div class="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent border-slate-100">
              <TableHead>Tgl Pengajuan</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead class="text-center">Durasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="leave in filteredLeaves" :key="leave.id" class="hover:bg-slate-50/30 transition-colors group border-slate-50">
              <TableCell class="text-sm text-slate-400">{{ formatDate(leave.createdAt) }}</TableCell>
              <TableCell>
                <div class="font-medium text-kv-black leading-none">{{ getLeaveTypeLabel(leave.type) }}</div>
                <div class="text-sm text-slate-400 mt-1">{{ leave.reason || '-' }}</div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span>{{ formatDate(leave.startDate) }}</span>
                  <ArrowRight class="h-3 w-3 text-slate-300" />
                  <span>{{ formatDate(leave.endDate) }}</span>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <Badge variant="outline" class="text-sm font-semibold border-slate-200 rounded-3xl">
                  {{ leave.duration }} Hari
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  :variant="getStatusVariant(leave.status)"
                  class="text-sm font-semibold px-2.5 py-0.5 rounded-3xl border-none"
                >
                  <span class="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
                  {{ getStatusLabel(leave.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
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
