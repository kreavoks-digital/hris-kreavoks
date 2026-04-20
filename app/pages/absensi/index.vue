<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Absensi Karyawan</h1>
        <p class="text-slate-500 mt-1 text-sm">Monitor kehadiran dan logs harian seluruh karyawan.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Input v-model="selectedDate" type="date" class="w-48 bg-white" />
        <Button variant="outline" class="gap-2" @click="exportAttendance">
          <Download class="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>

    <!-- Summary Grid -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card v-for="(val, key) in summaryItems" :key="key" class="border-none shadow-sm overflow-hidden group">
        <CardContent class="p-5 flex items-center gap-4">
          <div :class="[val.color, 'h-10 w-10 rounded-xl flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform shadow-lg']">
             <component :is="val.icon" class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ val.label }}</p>
            <p class="text-2xl font-black text-slate-900">{{ val.count }}</p>
          </div>
        </CardContent>
        <div :class="['h-0.5 w-full', val.border]"></div>
      </Card>
    </div>

    <!-- Filters and Table -->
    <Card class="border-none shadow-md overflow-hidden">
      <CardHeader class="pb-2">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input v-model="searchQuery" placeholder="Cari nama karyawan..." class="pl-10 bg-white" />
          </div>
          <div class="w-full sm:w-64">
            <Select v-model="filterStatus">
              <SelectTrigger class="bg-white">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Status</SelectItem>
                <SelectItem value="present">Hadir</SelectItem>
                <SelectItem value="permission">Izin</SelectItem>
                <SelectItem value="sick">Sakit</SelectItem>
                <SelectItem value="absent">Alfa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <Table>
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="font-bold">NIK</TableHead>
            <TableHead class="font-bold">Karyawan</TableHead>
            <TableHead class="font-bold">Departemen</TableHead>
            <TableHead class="font-bold">Jam Masuk</TableHead>
            <TableHead class="font-bold">Jam Keluar</TableHead>
            <TableHead class="font-bold">Status</TableHead>
            <TableHead class="font-bold">Keterangan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="record in filteredAttendance" :key="record.id" class="hover:bg-slate-50/50 transition-colors">
            <TableCell class="text-xs font-mono text-slate-500 uppercase">{{ record.nik }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                  {{ record.employeeName.charAt(0) }}
                </div>
                <span class="font-semibold text-slate-900">{{ record.employeeName }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-sm font-medium text-slate-600">{{ record.department }}</span>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5 text-xs font-medium">
                <Clock class="h-3 w-3 text-emerald-500" />
                {{ record.checkIn || "--:--" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5 text-xs font-medium">
                <LogOutIcon class="h-3 w-3 text-rose-500" />
                {{ record.checkOut || "--:--" }}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                :variant="getStatusVariant(record.status)"
                class="capitalize text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              >
                {{ getStatusLabel(record.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-xs text-slate-500 max-w-[150px] truncate">
              {{ record.notes || "-" }}
            </TableCell>
          </TableRow>

          <TableRow v-if="filteredAttendance.length === 0 && !loading">
            <TableCell colspan="7" class="h-48 text-center">
              <div class="flex flex-col items-center justify-center text-slate-400">
                <ClipboardList class="h-10 w-10 mb-2 opacity-20" />
                <p class="text-sm">Data absensi tidak ditemukan</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
    color: 'bg-emerald-500', 
    border: 'bg-emerald-500' 
  },
  permission: { 
    label: 'Izin', 
    count: summary.value.permission, 
    icon: AlertCircle, 
    color: 'bg-amber-500', 
    border: 'bg-amber-500' 
  },
  sick: { 
    label: 'Sakit', 
    count: summary.value.sick, 
    icon: UserMinus, 
    color: 'bg-orange-500', 
    border: 'bg-orange-500' 
  },
  absent: { 
    label: 'Alfa', 
    count: summary.value.absent, 
    icon: XCircle, 
    color: 'bg-rose-500', 
    border: 'bg-rose-500' 
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
