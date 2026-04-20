<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-kv-black">Payroll Karyawan</h1>
        <p class="text-slate-500 mt-1 text-sm">Kelola penggajian, tunjangan, dan potongan bulanan.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-white p-1 rounded-3xl border border-slate-100">
          <Select v-model="selectedMonth">
            <SelectTrigger class="w-[130px] border-none shadow-none focus:ring-0 rounded-3xl">
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
            <SelectTrigger class="w-[100px] border-none shadow-none focus:ring-0 rounded-3xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="year in years" :key="year" :value="year">
                {{ year }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button class="gap-2 rounded-3xl font-semibold" @click="processPayroll">
          <Coins class="h-4 w-4" />
          Proses Payroll
        </Button>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="grid gap-6 md:grid-cols-3">
      <Card class="border border-slate-100 rounded-3xl overflow-hidden relative">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-kv-primary/10 flex items-center justify-center text-kv-primary border border-kv-primary/20">
              <Wallet class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-400">Total Gaji Pokok</p>
              <h3 class="text-2xl font-semibold text-kv-black leading-tight">Rp {{ formatCurrency(summary.totalSalary) }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border border-slate-100 rounded-3xl overflow-hidden relative">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-100">
              <ArrowDownCircle class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-400">Total Potongan</p>
              <h3 class="text-2xl font-semibold text-kv-black leading-tight">Rp {{ formatCurrency(summary.totalDeduction) }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border border-slate-100 rounded-3xl overflow-hidden relative">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-2xl bg-kv-primary/10 flex items-center justify-center text-kv-primary border border-kv-primary/20">
              <Banknote class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-400">Total Dibayarkan</p>
              <h3 class="text-2xl font-semibold text-kv-primary leading-tight">Rp {{ formatCurrency(summary.totalPaid) }}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-col md:flex-row gap-4 mb-2">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input v-model="searchQuery" placeholder="Cari nama karyawan..." class="pl-11 bg-white border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl h-12" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Select v-model="filterDepartment">
          <SelectTrigger class="w-[180px] bg-white border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl h-12 px-5">
            <SelectValue placeholder="Departemen" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-slate-100">
            <SelectItem value="none">Semua Dep.</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterStatus">
          <SelectTrigger class="w-[150px] bg-white border-slate-100 shadow-sm shadow-slate-100/50 rounded-3xl h-12 px-5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-slate-100">
            <SelectItem value="none">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Diproses</SelectItem>
            <SelectItem value="paid">Dibayar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table Card -->
    <Card class="border border-slate-100 overflow-hidden rounded-3xl mt-4">

      <div class="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Karyawan</TableHead>
              <TableHead>Gaji Pokok</TableHead>
              <TableHead>Tunjangan</TableHead>
              <TableHead>Potongan</TableHead>
              <TableHead class="border-l border-slate-100 pl-4">Thp (Take Home Pay)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="payroll in filteredPayroll" :key="payroll.id" class="hover:bg-slate-50/30 transition-colors">
              <TableCell>
                <div class="flex flex-col">
                  <span class="font-semibold text-kv-black">{{ payroll.employeeName }}</span>
                  <span class="text-sm text-slate-400">{{ payroll.nik }} • {{ payroll.department }}</span>
                </div>
              </TableCell>
              <TableCell class="text-sm font-medium">Rp {{ formatCurrency(payroll.basicSalary) }}</TableCell>
              <TableCell class="text-sm font-semibold text-emerald-600">+ Rp {{ formatCurrency(payroll.allowance) }}</TableCell>
              <TableCell class="text-sm font-semibold text-rose-600">- Rp {{ formatCurrency(payroll.deduction) }}</TableCell>
              <TableCell class="text-sm font-semibold text-blue-600 border-l border-slate-100 pl-4">Rp {{ formatCurrency(payroll.totalSalary) }}</TableCell>
              <TableCell>
                <Badge 
                  :variant="getStatusVariant(payroll.status)"
                  class="text-sm font-semibold px-3 py-1 rounded-3xl border-none"
                  :class="{
                    'bg-emerald-500/10 text-emerald-600': payroll.status === 'paid',
                    'bg-blue-500/10 text-blue-600': payroll.status === 'processed',
                    'bg-slate-100 text-slate-500': payroll.status === 'pending'
                  }"
                >
                  {{ getStatusLabel(payroll.status) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm" class="h-8 gap-1.5 text-sm font-semibold hover:bg-slate-50 border-slate-100 rounded-3xl" @click="viewSlip(payroll.id)">
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
  return 'secondary'
}

onMounted(() => {
  fetchPayroll();
});
</script>
