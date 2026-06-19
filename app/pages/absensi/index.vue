<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-kv-black dark:text-slate-50">Absensi Karyawan</h1>
        <p class="text-slate-400 mt-1 text-sm">Monitor kehadiran dan logs harian seluruh karyawan.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Input v-model="selectedDate" type="date" class="w-48 bg-white px-4 border-slate-200" />
        <Button variant="outline" class="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50" @click="exportAttendance">
          <Download class="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Summary Grid -->
    <div class="grid gap-6 md:grid-cols-4">
      <Card v-for="(val, key) in summaryItems" :key="key" class="border border-slate-100 overflow-hidden group rounded-3xl transition-all duration-300 hover:bg-slate-50/50">
        <CardContent class="p-6 flex items-center gap-4">
          <div :class="[val.color, 'h-11 w-11 rounded-2xl flex items-center justify-center transition-all']">
             <component :is="val.icon" class="h-5 w-5" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-400">{{ val.label }}</p>
            <p class="text-2xl font-semibold text-kv-black">{{ val.count }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input v-model="searchQuery" placeholder="Cari nama karyawan..." class="pl-11 bg-white border-slate-100 shadow-sm shadow-slate-100/50" />
      </div>
      <div class="w-full sm:w-64">
        <Select v-model="filterStatus">
          <SelectTrigger class="bg-white rounded-3xl h-12 border-slate-100 px-5 shadow-sm shadow-slate-100/50">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-slate-100">
            <SelectItem value="none">Semua Status</SelectItem>
            <SelectItem value="present">Hadir</SelectItem>
            <SelectItem value="permission">Izin</SelectItem>
            <SelectItem value="sick">Sakit</SelectItem>
            <SelectItem value="absent">Alfa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table Card -->
    <Card class="border border-slate-100 overflow-hidden rounded-3xl">

      
      <div class="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent border-slate-100">
              <TableHead>NIK</TableHead>
              <TableHead>Karyawan</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Jam Masuk</TableHead>
              <TableHead>Jam Keluar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="record in filteredAttendance" :key="record.id" class="hover:bg-slate-50/30 transition-colors border-slate-50">
              <TableCell class="text-sm font-mono text-slate-400">{{ record.nik }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-sm font-semibold text-kv-primary border border-slate-200/50">
                    {{ record.employeeName.charAt(0) }}
                  </div>
                  <span class="font-medium text-kv-black">{{ record.employeeName }}</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-slate-500">{{ record.department }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <Clock class="h-3.5 w-3.5 text-kv-primary" />
                  {{ record.checkIn || "--:--" }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <LogOutIcon class="h-3.5 w-3.5 text-slate-400" />
                  {{ record.checkOut || "--:--" }}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  class="text-sm font-semibold px-2.5 py-0.5 rounded-3xl border-none"
                  :class="{
                    'bg-emerald-500/10 text-emerald-600': record.status === 'present',
                    'bg-amber-500/10 text-amber-600': record.status === 'permission',
                    'bg-blue-500/10 text-blue-600': record.status === 'sick',
                    'bg-rose-500/10 text-rose-600': record.status === 'absent'
                  }"
                >
                  {{ getStatusLabel(record.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-slate-400 max-w-[150px] truncate">
                {{ record.notes || "-" }}
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredAttendance.length === 0 && !loading">
              <TableCell colspan="7" class="h-64 text-center">
                <div class="flex flex-col items-center justify-center text-slate-300">
                  <ClipboardList class="h-12 w-12 mb-3 opacity-20" />
                  <p class="text-sm font-medium">Data absensi tidak ditemukan</p>
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
  Download, 
  Search, 
  Clock, 
  LogOut as LogOutIcon, 
  CheckCircle2, 
  UserMinus, 
  AlertCircle, 
  XCircle,
  ClipboardList
} from 'lucide-vue-next'
import { useAbsensi } from './hooks/useAbsensi'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
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
  selectedDate,
  searchQuery,
  filterStatus,
  summary,
  filteredAttendance,
  fetchAttendance,
  getStatusLabel,
  exportAttendance,
  loading
} = useAbsensi()

const summaryItems = computed(() => ({
  present: { 
    label: 'Hadir', 
    count: summary.value.present, 
    icon: CheckCircle2, 
    color: 'bg-kv-primary/10 text-kv-primary'
  },
  permission: { 
    label: 'Izin', 
    count: summary.value.permission, 
    icon: AlertCircle, 
    color: 'bg-amber-500/10 text-amber-600'
  },
  sick: { 
    label: 'Sakit', 
    count: summary.value.sick, 
    icon: UserMinus, 
    color: 'bg-blue-500/10 text-blue-600'
  },
  absent: { 
    label: 'Alfa', 
    count: summary.value.absent, 
    icon: XCircle, 
    color: 'bg-slate-100 text-slate-500'
  }
}))

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'present': return 'default'
    case 'permission': return 'secondary'
    case 'sick': return 'outline'
    case 'absent': return 'destructive'
    default: return 'outline'
  }
}

onMounted(() => {
  fetchAttendance();
});
</script>
