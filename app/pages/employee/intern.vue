<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Pending Intern</h1>
        <p class="text-muted-foreground mt-1 text-sm">Kelola pendaftar intern yang membutuhkan verifikasi.</p>
      </div>
      <Button v-if="canPerformActions" @click="navigateTo('/employee/create')" class="gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white border-none">
        <UserPlus class="h-4 w-4" />
        Add Employee
      </Button>
    </div>

    <!-- Info banner for pending tab -->
    <div class="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
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
      <EmployeeTable
        :employees="filteredEmployees"
        active-tab="pending"
        :verifying-id="verifyingId"
        :loading="loading"
        :readonly="isViewerMode"
        @verify="verifyEmployee"
        @edit="editEmployee"
        @delete="confirmDelete"
        @reset-filters="resetFilters"
      />
    </Card>

    <!-- Pagination Section -->
    <EmployeePagination
      v-if="totalPages > 1"
      v-model:page="page"
      :total-pages="totalPages"
      :total-items="totalItems"
      :limit="limit"
    />
  </div>
</template>

<script setup lang="ts">
import { UserPlus, Info } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { toast } from 'vue-sonner'
import { useEmployee } from './hooks/useEmployee'
import { useViewerMode } from '~/composables/useViewerMode'

import EmployeeTable from './components/EmployeeTable.vue'
import EmployeePagination from './components/EmployeePagination.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
  title: "Pending Intern"
});

const { isViewerMode, canPerformActions } = useViewerMode()

const {
  searchQuery,
  filterDepartment,
  filteredEmployees,
  fetchEmployees,
  loading,
  page,
  limit,
  totalItems,
  totalPages,
  pendingVerification,
  resetFilters
} = useEmployee()

// Set to true so it fetches only pending interns
pendingVerification.value = true

const verifyingId = ref<string | number | null>(null)

const editEmployee = (employee: any) => {
  navigateTo(`/employee/edit/${employee.id}`);
};

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
  if (confirm(`Apakah Anda yakin ingin menolak dan menghapus pendaftar ${employee.name}?`)) {
    try {
      const api = useApi();
      await api(`/users/${employee.id}` as any, { method: "DELETE" });
      toast.success('Pendaftar Ditolak', { description: `Akun ${employee.name} telah dihapus.` })
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
