<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-kv-black dark:text-slate-50">
          {{ isAdmin ? 'Leave & Permission Management' : 'My Leave History' }}
        </h1>
        <p class="text-slate-400 mt-1 text-sm">
          {{ isAdmin ? 'Manage and approve employee leave requests.' : 'Track your leave history and balances.' }}
        </p>
      </div>
    </div>

    <!-- Summary Grid (Non-Admin balance or Admin overview) -->
    <LeaveSummary v-if="!isAdmin" :balance="leaveBalance" />

    <!-- Filters Section -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="w-full sm:w-64">
        <Select v-model="filterStatus">
          <SelectTrigger class="bg-background rounded-3xl h-12 border-border px-5">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl border-border bg-popover">
            <SelectItem value="none">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Disetujui</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Table Card -->
    <LeaveTable
      :filtered-leaves="filteredLeaves"
      :is-admin="isAdmin"
      :loading="loading"
      :get-leave-type-label="getLeaveTypeLabel"
      :format-date="formatDate"
      @approve="handleApprove"
      @reject="handleReject"
      @cancel="cancelLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import LeaveSummary from './components/LeaveSummary.vue'
import LeaveTable from './components/LeaveTable.vue'
import { useLeave } from './hooks/useLeave'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()
const isAdmin = computed(() => auth.user.value?.role === 'ADMIN')

const {
  filterStatus,
  leaveBalance,
  filteredLeaves,
  loading,
  fetchLeaves,
  cancelLeave,
  updateLeaveStatus,
  getLeaveTypeLabel,
  formatDate
} = useLeave()

onMounted(async () => {
  await fetchLeaves()
})

const handleApprove = async (id: string) => {
  if (confirm("Setujui pengajuan izin ini?")) {
    await updateLeaveStatus(id, "APPROVED")
  }
}

const handleReject = async (id: string) => {
  if (confirm("Tolak pengajuan izin ini?")) {
    await updateLeaveStatus(id, "REJECTED")
  }
}
</script>
