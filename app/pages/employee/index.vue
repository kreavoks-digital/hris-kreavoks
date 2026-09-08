<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-semibold text-foreground">Semua Karyawan</h1>
          <Badge variant="secondary" class="font-normal border-none bg-kv-primary/10 text-kv-primary">{{ totalItems }} Total</Badge>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">Kelola semua data karyawan di sini.</p>
      </div>
      <Button v-if="canPerformActions" @click="navigateTo('/employee/create')" class="gap-2 bg-kv-primary hover:bg-kv-primary/90 text-white border-none">
        <UserPlus class="h-4 w-4" />
        Add Employee
      </Button>
    </div>

    <!-- Filters Section -->
    <EmployeeFilters
      v-model:search-query="searchQuery"
      v-model:filter-department="filterDepartment"
      :loading="loading"
      @reset="resetFilters"
    />

    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <EmployeeTable
        :employees="filteredEmployees"
        active-tab="all"
        :verifying-id="null"
        :loading="loading"
        :readonly="isViewerMode"
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
import { UserPlus } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { toast } from 'vue-sonner'
import { useEmployee } from './hooks/useEmployee'
import { useViewerMode } from '~/composables/useViewerMode'

import EmployeeFilters from './components/EmployeeFilters.vue'
import EmployeeTable from './components/EmployeeTable.vue'
import EmployeePagination from './components/EmployeePagination.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
  title: "Semua Karyawan"
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

pendingVerification.value = false

const editEmployee = (employee: any) => {
  navigateTo(`/employee/edit/${employee.id}`);
};

const confirmDelete = async (employee: any) => {
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${employee.name}?`)) {
    try {
      const api = useApi();
      await api(`/users/${employee.id}` as any, { method: "DELETE" });
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
