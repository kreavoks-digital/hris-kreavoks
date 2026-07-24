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

    <!-- Tabs Component -->
    <EmployeeTabs
      :active-tab="activeTab"
      :pending-intern-count="pendingInternCount"
      :pending-mentor-count="pendingMentorCount"
      @switch-tab="switchTab"
    />

    <!-- Filters Section (only show for 'all' tab) -->
    <EmployeeFilters
      v-if="activeTab === 'all'"
      v-model:search-query="searchQuery"
      v-model:filter-department="filterDepartment"
      :loading="loading"
      @reset="resetFilters"
    />

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

    <!-- Info banner for mentor tab -->
    <div v-if="activeTab === 'mentor'" class="flex items-start gap-3 p-4 bg-kv-primary/10 border border-kv-primary/20 rounded-xl">
      <Info class="h-5 w-5 text-kv-primary mt-0.5 flex-shrink-0" />
      <div>
        <p class="text-sm font-medium text-kv-primary">Pendaftaran Mentor Lintas Aplikasi (Portal)</p>
        <p class="text-sm text-muted-foreground mt-0.5">
          Mentor di bawah ini mendaftar melalui Kreavoks Portal. Setujui untuk membuat akun di HRIS secara otomatis & memicu sinkronisasi provisioning akun ke Portal.
        </p>
      </div>
    </div>

    <!-- Table Section -->
    <Card class="border border-border bg-card overflow-hidden rounded-3xl">
      <EmployeeTable
        v-if="activeTab !== 'mentor'"
        :employees="filteredEmployees"
        :active-tab="activeTab"
        :verifying-id="verifyingId"
        :loading="loading"
        @verify="verifyEmployee"
        @edit="editEmployee"
        @delete="confirmDelete"
        @reset-filters="resetFilters"
      />
      <MentorApplicationTable
        v-else
        :applications="mentorApplications"
        :verifying-id="verifyingId"
        :loading="loading"
        @review="reviewMentor"
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
import { mentorApplicationApi, type MentorApplication } from '~/pages/employee/api/mentorApplication.api'
import { employeeApi } from '~/pages/employee/api/employee.api'

import EmployeeTabs from './components/EmployeeTabs.vue'
import EmployeeFilters from './components/EmployeeFilters.vue'
import EmployeeTable from './components/EmployeeTable.vue'
import MentorApplicationTable from './components/MentorApplicationTable.vue'
import EmployeePagination from './components/EmployeePagination.vue'

definePageMeta({
  layout: "default",
  middleware: ["auth", "admin"],
});

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

const activeTab = ref<'all' | 'pending' | 'mentor'>('all')
const verifyingId = ref<string | number | null>(null)
const mentorApplications = ref<MentorApplication[]>([])

const pendingInternCount = ref(0)
const pendingMentorCount = ref(0)

const fetchTabCounts = async () => {
  try {
    const [internRes, mentorRes] = await Promise.all([
      employeeApi.getEmployees(1, 1, '', '', true),
      mentorApplicationApi.getApplications(1, 1, '')
    ])
    
    if (internRes.success && internRes.data?.pagination) {
      pendingInternCount.value = internRes.data.pagination.totalItems
    }
    
    if (mentorRes.success && mentorRes.data?.pagination) {
      pendingMentorCount.value = mentorRes.data.pagination.totalItems
    }
  } catch (error) {
    console.error('Failed to fetch tab counts:', error)
  }
}

const fetchMentorApplications = async () => {
  loading.value = true
  try {
    const response = await mentorApplicationApi.getApplications(page.value, limit.value, searchQuery.value)
    if (response.success && response.data) {
      mentorApplications.value = response.data.applications
      if (response.data.pagination) {
        totalItems.value = response.data.pagination.totalItems
        totalPages.value = response.data.pagination.totalPages
      }
    }
  } catch (error) {
    console.error('Failed to load mentor applications', error)
  } finally {
    loading.value = false
  }
}

const switchTab = (tab: 'all' | 'pending' | 'mentor') => {
  activeTab.value = tab
  pendingVerification.value = tab === 'pending'
  searchQuery.value = ''
  filterDepartment.value = ''
  page.value = 1
  
  if (tab === 'mentor') {
    fetchMentorApplications()
  } else {
    fetchEmployees()
  }
}

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
    fetchTabCounts()
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
      fetchTabCounts();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }
};

const reviewMentor = async (id: string | number, status: 'APPROVED' | 'REJECTED') => {
  verifyingId.value = id
  const actionText = status === 'APPROVED' ? 'menyetujui' : 'menolak'
  
  try {
    const response = await mentorApplicationApi.reviewApplication(id, status)
    if (response.success) {
      toast.success(`Pendaftaran ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`, {
        description: `Mentor berhasil di-${actionText} dan provisioning data dijalankan.`
      })
      fetchMentorApplications()
      fetchTabCounts()
    }
  } catch (error: any) {
    toast.error('Gagal memproses keputusan', {
      description: error?.data?.message || 'Terjadi masalah koneksi dengan backend HRIS.'
    })
  } finally {
    verifyingId.value = null
  }
}

onMounted(() => {
  fetchEmployees();
  fetchTabCounts();
});
</script>
