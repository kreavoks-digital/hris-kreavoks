<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Employees</h1>
        <p class="text-muted-foreground mt-1 text-sm">Manage all employee information in one place.</p>
      </div>
      <Button @click="navigateTo('/employee/create')" class="gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white border-none">
        <UserPlus class="h-4 w-4" />
        Add Employee
      </Button>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Cari nama atau NPK..." class="pl-11 bg-background border-border shadow-sm" />
      </div>
      <div class="w-full sm:w-64">
        <Select v-model="filterDepartment">
          <SelectTrigger class="bg-background border-border shadow-sm rounded-3xl h-12 px-5">
            <SelectValue placeholder="Pilih Departemen" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-border">
            <SelectItem value="none">Semua Departemen</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" class="gap-2 border-border bg-background shadow-sm text-foreground hover:bg-accent px-6" @click="fetchEmployees">
        <RefreshCw class="h-4 w-4 text-kv-primary" :class="{ 'animate-spin': loading }" />
        Reset
      </Button>
    </div>


    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[120px] whitespace-nowrap">NPK</TableHead>
            <TableHead>Karyawan</TableHead>
            <TableHead>Departemen</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-accent/50 transition-colors">
            <TableCell class="font-medium text-muted-foreground whitespace-nowrap">{{ emp.npk || '-' }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 border-2 border-card">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`" />
                  <AvatarFallback>{{ emp.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div class="flex flex-col">
                  <span class="font-medium text-foreground leading-tight">{{ emp.name }}</span>
                  <span class="text-sm text-muted-foreground">{{ emp.email }}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" class="font-medium bg-accent text-accent-foreground border-border">
                {{ emp.department }}
              </Badge>
            </TableCell>
            <TableCell class="text-foreground text-sm">{{ emp.position }}</TableCell>
            <TableCell>
              <Badge 
                :variant="emp.status === 'Aktif' ? 'default' : 'secondary'"
                class="px-3 py-1 rounded-3xl text-sm font-medium"
                :class="emp.status === 'Aktif' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent' : 'bg-muted text-muted-foreground border-border'"
              >
                {{ emp.status }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="icon" @click="editEmployee(emp)" class="h-8 w-8 text-kv-primary hover:bg-kv-primary/10">
                  <Edit2 class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="confirmDelete(emp)" class="h-8 w-8 text-destructive hover:bg-destructive/10">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="filteredEmployees.length === 0 && !loading">
            <TableCell colspan="6" class="h-64 text-center">
              <div class="flex flex-col items-center justify-center text-muted-foreground">
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
import { useEmployee } from './hooks/useEmployee'
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
  middleware: ["auth", "admin"],
});

const {
  searchQuery,
  filterDepartment,
  filteredEmployees,
  fetchEmployees,
  loading
} = useEmployee()

const editEmployee = (employee: any) => {
  navigateTo(`/employee/edit/${employee.id}`);
};

const confirmDelete = async (employee: any) => {
  // In a real premium app, we'd use the Shadcn Dialog
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${employee.name}?`)) {
    try {
      const api = useApi();
      await api(`/users/${employee.id}`, { method: "DELETE" });
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
