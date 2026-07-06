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

    <!-- Tabs: Semua Karyawan / Pending Verifikasi -->
    <div class="flex gap-1 p-1 bg-muted rounded-xl w-fit">
      <button
        @click="switchTab('all')"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          activeTab === 'all'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        Semua Karyawan
      </button>
      <button
        @click="switchTab('pending')"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
          activeTab === 'pending'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        Pending Verifikasi
        <span
          v-if="pendingVerification && employees.length > 0"
          class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold"
        >
          {{ employees.length }}
        </span>
      </button>
    </div>

    <!-- Filters Section (only show for 'all' tab) -->
    <div v-if="activeTab === 'all'" class="flex flex-col sm:flex-row gap-4">
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
            <SelectItem value="Kreavoks Development Team (KDT)">Kreavoks Development Team (KDT)</SelectItem>
            <SelectItem value="Kreavoks Creative Team (KCT)">Kreavoks Creative Team (KCT)</SelectItem>
            <SelectItem value="Kreavoks Management Team (KMT)">Kreavoks Management Team (KMT)</SelectItem>
            <SelectItem value="Kreavoks Collaboration Mentor (KCM)">Kreavoks Collaboration Mentor (KCM)</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" class="gap-2 border-border bg-background shadow-sm text-foreground hover:bg-accent px-6" @click="resetFilters">
        <RefreshCw class="h-4 w-4 text-kv-primary" :class="{ 'animate-spin': loading }" />
        Reset
      </Button>
    </div>

    <!-- Info banner for pending tab -->
    <div v-if="activeTab === 'pending'" class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
      <Info class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
      <div>
        <p class="text-sm font-medium text-amber-800 dark:text-amber-300">Pendaftar Menunggu Verifikasi</p>
        <p class="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
          Karyawan berikut mendaftar mandiri dan membutuhkan verifikasi Admin sebelum dapat login. Klik "Verifikasi" untuk mengaktifkan akun mereka.
        </p>
      </div>
    </div>

    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[120px] whitespace-nowrap">NPK</TableHead>
            <TableHead>Karyawan</TableHead>
            <TableHead>Institusi</TableHead>
            <TableHead>Departemen</TableHead>
            <TableHead>Posisi</TableHead>
            <template v-if="activeTab === 'all'">
              <TableHead>Masa Kerja</TableHead>
              <TableHead>Sisa Hari Kerja</TableHead>
              <TableHead>Status</TableHead>
            </template>
            <template v-else>
              <TableHead>No. Telepon</TableHead>
              <TableHead>Status</TableHead>
            </template>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableSkeleton v-if="loading" :rows="5" :columns="activeTab === 'all' ? 8 : 7" />
          <template v-else>
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
              <TableCell class="text-sm text-muted-foreground">{{ (emp as any).institution || '-' }}</TableCell>
              <TableCell>
                <Badge variant="outline" class="font-medium bg-accent text-accent-foreground border-border">
                  {{ emp.department }}
                </Badge>
              </TableCell>
              <TableCell class="text-foreground text-sm">{{ emp.position }}</TableCell>

              <!-- All tab columns -->
              <template v-if="activeTab === 'all'">
                <TableCell>
                  <div v-if="emp.startDate && emp.endDate && !emp.startDate.startsWith('9999')" class="flex flex-col text-xs space-y-1">
                    <span class="text-foreground whitespace-nowrap">{{ format(new Date(emp.startDate), 'dd MMM yyyy', { locale: idLocale }) }} -</span>
                    <span class="text-foreground whitespace-nowrap">{{ format(new Date(emp.endDate), 'dd MMM yyyy', { locale: idLocale }) }}</span>
                  </div>
                  <span v-else class="text-sm text-muted-foreground italic">Lifetime</span>
                </TableCell>
                <TableCell>
                  <div v-if="emp.endDate && !emp.endDate.startsWith('9999') && emp.startDate">
                    <span class="font-medium text-sm" :class="getRemainingDaysClass(emp)">
                      {{ getRemainingDays(emp) }} Hari
                    </span>
                  </div>
                  <span v-else class="text-sm text-muted-foreground italic">-</span>
                </TableCell>
              </template>

              <!-- Pending tab columns -->
              <template v-else>
                <TableCell class="text-sm text-muted-foreground">{{ emp.phone || '-' }}</TableCell>
              </template>

              <!-- Status -->
              <TableCell>
                <Badge
                  class="px-3 py-1 rounded-3xl text-sm font-medium border-transparent"
                  :class="{
                    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20': emp.status === 'ACTIVE',
                    'bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20': emp.status === 'TERMINATED',
                    'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20': emp.status === 'SUSPENDED',
                    'bg-slate-500/15 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20': emp.status === 'RESIGNED',
                    'bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20': emp.status === 'GRADUATE',
                  }"
                >
                  {{
                    emp.status === 'ACTIVE' ? 'Aktif' :
                    emp.status === 'TERMINATED' ? 'Terminated' :
                    emp.status === 'SUSPENDED' ? (activeTab === 'pending' ? 'Menunggu Verifikasi' : 'Suspended') :
                    emp.status === 'RESIGNED' ? 'Resigned' :
                    emp.status === 'GRADUATE' ? 'Lulus' : emp.status
                  }}
                </Badge>
              </TableCell>

              <!-- Actions -->
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <!-- Verifikasi button (pending tab only) -->
                  <Button
                    v-if="activeTab === 'pending'"
                    variant="outline"
                    size="sm"
                    @click="verifyEmployee(emp)"
                    :disabled="verifyingId === emp.id"
                    class="h-8 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:border-emerald-800"
                  >
                    <Loader2 v-if="verifyingId === emp.id" class="h-3.5 w-3.5 animate-spin" />
                    <CheckCircle2 v-else class="h-3.5 w-3.5" />
                    Verifikasi
                  </Button>
                  <!-- Tolak button (pending tab only) -->
                  <Button
                    v-if="activeTab === 'pending'"
                    variant="ghost"
                    size="icon"
                    @click="confirmDelete(emp)"
                    class="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title="Tolak & Hapus"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                  <!-- Normal actions (all tab) -->
                  <template v-else>
                    <Button variant="ghost" size="icon" @click="editEmployee(emp)" class="h-8 w-8 text-kv-primary hover:bg-kv-primary/10">
                      <Edit2 class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" @click="confirmDelete(emp)" class="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </template>
                </div>
              </TableCell>
            </TableRow>

            <TableRow v-if="filteredEmployees.length === 0 && !loading">
              <TableCell colspan="9" class="h-64 text-center">
                <div class="flex flex-col items-center justify-center text-muted-foreground">
                  <template v-if="activeTab === 'pending'">
                    <CheckCircle2 class="h-12 w-12 mb-2 opacity-20 text-emerald-500" />
                    <p class="font-medium">Tidak ada pendaftar yang menunggu verifikasi</p>
                    <p class="text-sm mt-1">Semua akun sudah terverifikasi</p>
                  </template>
                  <template v-else>
                    <Users class="h-12 w-12 mb-2 opacity-20" />
                    <p>Tidak ada data karyawan ditemukan</p>
                    <Button variant="link" @click="searchQuery = ''; filterDepartment = ''" class="mt-2">Hapus Filter</Button>
                  </template>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </Card>

    <!-- Pagination Section -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-3xl mt-4 shadow-sm">
      <div class="flex flex-1 justify-between sm:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="page === 1" 
          @click="page--"
          class="border-border bg-background"
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          :disabled="page === totalPages" 
          @click="page++"
          class="border-border bg-background"
        >
          Next
        </Button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-muted-foreground">
            Menampilkan
            <span class="font-medium text-foreground">{{ (page - 1) * limit + 1 }}</span>
            sampai
            <span class="font-medium text-foreground">{{ Math.min(page * limit, totalItems) }}</span>
            dari
            <span class="font-medium text-foreground">{{ totalItems }}</span>
            karyawan
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              :disabled="page === 1"
              @click="page--"
              class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            
            <template v-for="p in totalPages" :key="p">
              <Button
                v-if="p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)"
                variant="outline"
                size="sm"
                @click="page = p"
                class="h-9 w-9 rounded-xl border-border"
                :class="page === p ? 'bg-kv-primary text-white border-transparent hover:bg-kv-primary/95' : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground'"
              >
                {{ p }}
              </Button>
              <span 
                v-else-if="(p === 2 && page > 4) || (p === totalPages - 1 && page < totalPages - 3)" 
                class="inline-flex items-center px-2 text-sm font-semibold text-muted-foreground"
              >
                ...
              </span>
            </template>

            <Button
              variant="outline"
              size="icon"
              :disabled="page === totalPages"
              @click="page++"
              class="h-9 w-9 rounded-xl border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TableSkeleton from '~/components/ui/skeleton/TableSkeleton.vue'
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Loader2,
  Info,
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
import { format, differenceInBusinessDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

const {
  searchQuery,
  filterDepartment,
  filteredEmployees,
  employees,
  fetchEmployees,
  loading,
  page,
  limit,
  totalItems,
  totalPages,
  pendingVerification,
  resetFilters
} = useEmployee()

const activeTab = ref<'all' | 'pending'>('all')
const verifyingId = ref<string | null>(null)

const switchTab = (tab: 'all' | 'pending') => {
  activeTab.value = tab
  pendingVerification.value = tab === 'pending'
  searchQuery.value = ''
  filterDepartment.value = ''
  page.value = 1
  fetchEmployees()
}

const getRemainingDays = (emp: any) => {
  if (!emp.startDate || !emp.endDate) return 0;
  const totalBusinessDays = differenceInBusinessDays(new Date(emp.endDate), new Date(emp.startDate));
  const attendedDays = emp.presentCount || 0;
  const remaining = totalBusinessDays - attendedDays;
  return remaining > 0 ? remaining : 0;
};

const getRemainingDaysClass = (emp: any) => {
  const days = getRemainingDays(emp);
  if (days <= 0) return 'text-rose-600 dark:text-rose-400';
  if (days <= 30) return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
};

const editEmployee = (employee: any) => {
  navigateTo(`/employee/edit/${employee.id}`);
};

// Verifikasi akun pendaftar (set isActive = true, status = ACTIVE)
const verifyEmployee = async (employee: any) => {
  verifyingId.value = employee.id
  try {
    const api = useApi()
    await api(`/users/${employee.id}` as any, {
      method: 'PUT',
      body: { status: 'ACTIVE' }
    })
    toast.success('Verifikasi Berhasil', {
      description: `Akun ${employee.name} telah diverifikasi dan dapat digunakan untuk login.`
    })
    fetchEmployees()
  } catch (error: any) {
    toast.error('Gagal Verifikasi', {
      description: error?.data?.message || 'Terjadi kesalahan saat memverifikasi akun.'
    })
  } finally {
    verifyingId.value = null
  }
}

const confirmDelete = async (employee: any) => {
  const label = activeTab.value === 'pending' ? 'menolak dan menghapus pendaftar' : 'menghapus karyawan'
  if (confirm(`Apakah Anda yakin ingin ${label} ${employee.name}?`)) {
    try {
      const api = useApi();
      await api(`/users/${employee.id}` as any, { method: "DELETE" });
      if (activeTab.value === 'pending') {
        toast.success('Pendaftar Ditolak', { description: `Akun ${employee.name} telah dihapus.` })
      }
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
