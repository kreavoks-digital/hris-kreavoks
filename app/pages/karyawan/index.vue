<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Data Karyawan</h1>
        <p class="text-slate-500 mt-1 text-sm">Kelola informasi seluruh karyawan dalam satu tempat.</p>
      </div>
      <Button @click="navigateTo('/karyawan/tambah')" class="gap-2 shadow-lg shadow-primary/20">
        <UserPlus class="h-4 w-4" />
        Tambah Karyawan
      </Button>
    </div>

    <!-- Filters Card -->
    <Card class="border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardContent class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input v-model="searchQuery" placeholder="Cari nama atau NIK..." class="pl-10 bg-white border-slate-200" />
          </div>
          <div class="w-full sm:w-64">
            <Select v-model="filterDepartment">
              <SelectTrigger class="bg-white border-slate-200">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Semua Departemen</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" class="gap-2" @click="fetchEmployees">
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Table Section -->
    <Card class="border-none shadow-md overflow-hidden">
      <Table>
        <TableHeader class="bg-slate-50/50">
          <TableRow>
            <TableHead class="w-[100px] font-bold">NIK</TableHead>
            <TableHead class="font-bold">Karyawan</TableHead>
            <TableHead class="font-bold">Departemen</TableHead>
            <TableHead class="font-bold">Posisi</TableHead>
            <TableHead class="font-bold">Status</TableHead>
            <TableHead class="text-right font-bold">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-slate-50/50 transition-colors">
            <TableCell class="font-medium text-slate-500">{{ emp.nik }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`" />
                  <AvatarFallback>{{ emp.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div class="flex flex-col">
                  <span class="font-semibold text-slate-900 leading-tight">{{ emp.name }}</span>
                  <span class="text-xs text-slate-400">{{ emp.email }}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" class="font-medium bg-slate-50 text-slate-600 border-slate-200">
                {{ emp.department }}
              </Badge>
            </TableCell>
            <TableCell class="text-slate-600 text-sm italic">{{ emp.position }}</TableCell>
            <TableCell>
              <Badge 
                :variant="emp.status === 'Aktif' ? 'default' : 'secondary'"
                class="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="emp.status === 'Aktif' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-200 text-slate-600'"
              >
                {{ emp.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="icon" @click="editEmployee(emp)" class="h-8 w-8 text-blue-600 hover:bg-blue-50">
                  <Edit2 class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="confirmDelete(emp)" class="h-8 w-8 text-rose-600 hover:bg-rose-50">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="filteredEmployees.length === 0 && !loading">
            <TableCell colspan="6" class="h-64 text-center">
              <div class="flex flex-col items-center justify-center text-slate-400">
                <Users class="h-12 w-12 mb-2 opacity-20" />
                <p>Tidak ada data karyawan ditemukan</p>
                <Button variant="link" @click="searchQuery = ''; filterDepartment = ''" class="mt-2">Hapus Filter</Button>
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
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Users,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-vue-next'
import { useKaryawan } from './hooks/useKaryawan'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
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
  searchQuery,
  filterDepartment,
  filteredEmployees,
  fetchEmployees,
  loading
} = useKaryawan()

const editEmployee = (employee: any) => {
  navigateTo(`/karyawan/edit/${employee.id}`);
};

const confirmDelete = async (employee: any) => {
  // In a real premium app, we'd use the Shadcn Dialog
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${employee.name}?`)) {
    try {
      await $fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }
};

onMounted(() => {
  fetchEmployees();
});
</script>
