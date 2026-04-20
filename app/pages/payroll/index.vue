<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Payroll Karyawan</h1>
        <p class="text-slate-500 mt-1 text-sm">Kelola penggajian, tunjangan, dan potongan bulanan.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <Select v-model="selectedMonth">
            <SelectTrigger class="w-[130px] border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <div class="h-4 w-px bg-slate-200"></div>
          <Select v-model="selectedYear">
            <SelectTrigger class="w-[100px] border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="year in years" :key="year" :value="year">
                {{ year }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button class="gap-2 shadow-sm" @click="processPayroll">
          <Coins class="h-4 w-4" />
          Proses Payroll
        </Button>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="grid gap-6 md:grid-cols-3">
      <Card class="border-none shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm border border-emerald-100">
              <Wallet class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Gaji Pokok</p>
              <h3 class="text-2xl font-bold text-slate-900 leading-tight">Rp {{ formatCurrency(summary.totalSalary) }}</h3>
            </div>
          </div>
        </CardContent>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20"></div>
      </Card>

      <Card class="border-none shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-sm border border-rose-100">
              <ArrowDownCircle class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Potongan</p>
              <h3 class="text-2xl font-bold text-slate-900 leading-tight">Rp {{ formatCurrency(summary.totalDeduction) }}</h3>
            </div>
          </div>
        </CardContent>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-rose-500/20"></div>
      </Card>

      <Card class="border-none shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm border border-blue-100">
              <Banknote class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Dibayarkan</p>
              <h3 class="text-2xl font-bold text-blue-600 leading-tight">Rp {{ formatCurrency(summary.totalPaid) }}</h3>
            </div>
          </div>
        </CardContent>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
      </Card>
    </div>

    <!-- Filters and Table -->
    <Card class="border-none shadow-md overflow-hidden">
      <CardHeader class="pb-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="relative w-full sm:max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input v-model="searchQuery" placeholder="Cari nama karyawan..." class="pl-10 bg-white" />
          </div>
          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select v-model="filterDepartment">
              <SelectTrigger class="w-[160px] bg-white">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Dep.</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filterStatus">
              <SelectTrigger class="w-[140px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Diproses</SelectItem>
                <SelectItem value="paid">Dibayar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <div class="relative overflow-x-auto">
        <Table>
          <TableHeader class="bg-slate-50/50">
            <TableRow>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider">Karyawan</TableHead>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider">Gaji Pokok</TableHead>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider text-emerald-600">Tunjangan</TableHead>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider text-rose-600">Potongan</TableHead>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider text-slate-900 border-l border-slate-100 pl-4">Thp (Take Home Pay)</TableHead>
              <TableHead class="text-xs font-semibold uppercase text-slate-500 tracking-wider">Status</TableHead>
              <TableHead class="text-right px-6 text-xs font-semibold uppercase text-slate-500 tracking-wider">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="payroll in filteredPayroll" :key="payroll.id" class="hover:bg-slate-50/30 transition-colors group">
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-semibold text-slate-900">{{ payroll.employeeName }}</span>
                  <span class="text-[10px] text-slate-400 uppercase font-mono tracking-tight">{{ payroll.nik }} • {{ payroll.department }}</span>
                </div>
              </TableCell>
              <TableCell class="text-sm font-medium">Rp {{ formatCurrency(payroll.basicSalary) }}</TableCell>
              <TableCell class="text-sm font-semibold text-emerald-600">+ Rp {{ formatCurrency(payroll.allowance) }}</TableCell>
              <TableCell class="text-sm font-semibold text-rose-600">- Rp {{ formatCurrency(payroll.deduction) }}</TableCell>
              <TableCell class="text-sm font-semibold text-blue-600 border-l border-slate-100 pl-4">Rp {{ formatCurrency(payroll.totalSalary) }}</TableCell>
              <TableCell>
                <Badge 
                  :variant="getStatusVariant(payroll.status)"
                  class="capitalize text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full"
                >
                  {{ getStatusLabel(payroll.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right px-6">
                <Button variant="outline" size="sm" class="h-8 gap-1.5 text-xs font-semibold hover:bg-slate-50 border-slate-200" @click="viewSlip(payroll.id)">
                  <FileText class="h-3.5 w-3.5" />
                  Slip
                </Button>
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredPayroll.length === 0">
              <TableCell colspan="7" class="h-48 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <BadgeCent class="h-10 w-10 opacity-20" />
                  <p class="text-sm font-medium">Tidak ada data payroll pada periode ini</p>
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
  Coins, 
  Wallet, 
  Banknote, 
  ArrowDownCircle, 
  Search, 
  FileText, 
  BadgeCent
} from 'lucide-vue-next'
import { usePayroll } from './hooks/usePayroll'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
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
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const {
  selectedMonth,
  selectedYear,
  searchQuery,
  filterStatus,
  filteredPayrolls: filteredPayroll,
  fetchPayroll,
  formatCurrency,
  getStatusLabel,
  loading
} = usePayroll()

const filterDepartment = ref("none");

const months = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const summary = ref({
  totalSalary: 0,
  totalDeduction: 0,
  totalPaid: 0,
});

const processPayroll = async () => {
  // Use a proper confirm or dialog ideally, but for now we'll stick to a simple flow
  // In a real premium app, we'd use a Dialog component from Shadcn
  const confirmed = confirm("Proses payroll untuk periode ini?");
  if (!confirmed) return;

  try {
    await $fetch("/api/payroll/process", {
      method: "POST",
      body: {
        month: selectedMonth.value,
        year: selectedYear.value,
      },
    });
    toast.success("Payroll berhasil diproses!");
    fetchPayroll();
  } catch (error) {
    console.error("Error processing payroll:", error);
    toast.error("Gagal memproses payroll");
  }
};

const viewSlip = (payrollId: string) => {
  navigateTo(`/payroll/slip/${payrollId}`);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary'
    case 'processed': return 'outline'
    case 'paid': return 'default'
    default: return 'outline'
  }
}

onMounted(() => {
  fetchPayroll();
});
</script>
