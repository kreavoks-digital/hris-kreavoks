<template>
  <div class="attendance-page">
    <div class="page-header">
      <h1>Absensi Karyawan</h1>
      <div class="header-actions">
        <input v-model="selectedDate" type="date" class="date-input" />
        <button @click="exportAttendance" class="btn-secondary">📥 Export Data</button>
      </div>
    </div>

    <div class="attendance-summary">
      <AttendanceCard title="Hadir" :count="summary.present" color="green" />
      <AttendanceCard title="Izin" :count="summary.permission" color="yellow" />
      <AttendanceCard title="Sakit" :count="summary.sick" color="orange" />
      <AttendanceCard title="Alfa" :count="summary.absent" color="red" />
    </div>

    <div class="filters">
      <input v-model="searchQuery" type="text" placeholder="Cari nama karyawan..." class="search-input" />
      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option value="present">Hadir</option>
        <option value="permission">Izin</option>
        <option value="sick">Sakit</option>
        <option value="absent">Alfa</option>
      </select>
    </div>

    <div class="table-container">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Jam Masuk</th>
            <th>Jam Keluar</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredAttendance" :key="record.id">
            <td>{{ record.nik }}</td>
            <td>{{ record.employeeName }}</td>
            <td>{{ record.department }}</td>
            <td>{{ record.checkIn || "-" }}</td>
            <td>{{ record.checkOut || "-" }}</td>
            <td>
              <span :class="['status-badge', record.status]">
                {{ getStatusLabel(record.status) }}
              </span>
            </td>
            <td>{{ record.notes || "-" }}</td>
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

const selectedDate = ref(new Date().toISOString().split("T")[0]);
const searchQuery = ref("");
const filterStatus = ref("");
const attendance = ref([]);

const summary = ref({
  present: 0,
  permission: 0,
  sick: 0,
  absent: 0,
});

const filteredAttendance = computed(() => {
  let result = attendance.value;

  if (searchQuery.value) {
    result = result.filter((record) => record.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }

  if (filterStatus.value) {
    result = result.filter((record) => record.status === filterStatus.value);
  }

  return result;
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    present: "Hadir",
    permission: "Izin",
    sick: "Sakit",
    absent: "Alfa",
  };
  return labels[status] || status;
};

const fetchAttendance = async () => {
  try {
    const { data } = await useFetch("/api/attendance", {
      query: { date: selectedDate.value },
    });
    if (data.value) {
      attendance.value = data.value.records;
      summary.value = data.value.summary;
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
  }
};

const exportAttendance = () => {
  // TODO: Implement export functionality
  alert("Fitur export akan segera tersedia");
};

watch(selectedDate, () => {
  fetchAttendance();
});

onMounted(() => {
  fetchAttendance();
});
</script>

<style scoped>
.attendance-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.attendance-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th,
.attendance-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.attendance-table th {
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

.status-badge.present {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.permission {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.sick {
  background: #fed7aa;
  color: #9a3412;
}

.status-badge.absent {
  background: #fee2e2;
  color: #991b1b;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>
