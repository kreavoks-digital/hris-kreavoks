<template>
  <div class="leave-page">
    <div class="page-header">
      <h1>Manajemen Cuti</h1>
      <button @click="navigateTo('/cuti/ajukan')" class="btn-primary">+ Ajukan Cuti</button>
    </div>

    <div class="leave-balance">
      <div class="balance-card">
        <h3>Sisa Cuti Tahunan</h3>
        <p class="balance-number">{{ leaveBalance.annual }}</p>
        <span class="balance-label">hari</span>
      </div>
      <div class="balance-card">
        <h3>Cuti Terpakai</h3>
        <p class="balance-number">{{ leaveBalance.used }}</p>
        <span class="balance-label">hari</span>
      </div>
    </div>

    <div class="filters">
      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Disetujui</option>
        <option value="rejected">Ditolak</option>
      </select>
      <select v-model="filterType" class="filter-select">
        <option value="">Semua Jenis</option>
        <option value="annual">Cuti Tahunan</option>
        <option value="sick">Cuti Sakit</option>
        <option value="emergency">Cuti Darurat</option>
      </select>
    </div>

    <div class="table-container">
      <table class="leave-table">
        <thead>
          <tr>
            <th>Tanggal Pengajuan</th>
            <th>Jenis Cuti</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th>Durasi</th>
            <th>Alasan</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in filteredLeaves" :key="leave.id">
            <td>{{ formatDate(leave.createdAt) }}</td>
            <td>{{ getLeaveTypeLabel(leave.type) }}</td>
            <td>{{ formatDate(leave.startDate) }}</td>
            <td>{{ formatDate(leave.endDate) }}</td>
            <td>{{ leave.duration }} hari</td>
            <td>{{ leave.reason }}</td>
            <td>
              <span :class="['status-badge', leave.status]">
                {{ getStatusLabel(leave.status) }}
              </span>
            </td>
            <td>
              <button v-if="leave.status === 'pending'" @click="cancelLeave(leave.id)" class="btn-cancel">Batalkan</button>
              <button @click="viewDetail(leave.id)" class="btn-detail">Detail</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

const filterStatus = ref("");
const filterType = ref("");
const leaves = ref([]);

const leaveBalance = ref({
  annual: 12,
  used: 3,
});

const filteredLeaves = computed(() => {
  let result = leaves.value;

  if (filterStatus.value) {
    result = result.filter((leave) => leave.status === filterStatus.value);
  }

  if (filterType.value) {
    result = result.filter((leave) => leave.type === filterType.value);
  }

  return result;
});

const getLeaveTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    annual: "Cuti Tahunan",
    sick: "Cuti Sakit",
    emergency: "Cuti Darurat",
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return labels[status] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID");
};

const fetchLeaves = async () => {
  try {
    const { data } = await useFetch("/api/leaves");
    if (data.value) {
      leaves.value = data.value.leaves;
      leaveBalance.value = data.value.balance;
    }
  } catch (error) {
    console.error("Error fetching leaves:", error);
  }
};

const cancelLeave = async (leaveId: string) => {
  if (confirm("Yakin ingin membatalkan pengajuan cuti?")) {
    try {
      await $fetch(`/api/leaves/${leaveId}`, { method: "DELETE" });
      fetchLeaves();
    } catch (error) {
      console.error("Error canceling leave:", error);
    }
  }
};

const viewDetail = (leaveId: string) => {
  navigateTo(`/cuti/${leaveId}`);
};

onMounted(() => {
  fetchLeaves();
});
</script>

<style scoped>
.leave-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.leave-balance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.balance-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.balance-card h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.balance-number {
  font-size: 3rem;
  font-weight: bold;
  color: #3b82f6;
  margin: 0;
}

.balance-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
}

.leave-table th,
.leave-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.leave-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel,
.btn-detail {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.btn-cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn-detail {
  background: #dbeafe;
  color: #1e40af;
}
</style>
