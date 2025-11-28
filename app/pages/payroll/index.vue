<template>
  <div class="payroll-page">
    <div class="page-header">
      <h1>Payroll</h1>
      <div class="header-actions">
        <select v-model="selectedMonth" class="month-select">
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
        <select v-model="selectedYear" class="year-select">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <button @click="processPayroll" class="btn-primary">💰 Proses Payroll</button>
      </div>
    </div>

    <div class="payroll-summary">
      <div class="summary-card">
        <h3>Total Gaji</h3>
        <p class="amount">Rp {{ formatCurrency(summary.totalSalary) }}</p>
      </div>
      <div class="summary-card">
        <h3>Total Potongan</h3>
        <p class="amount deduction">Rp {{ formatCurrency(summary.totalDeduction) }}</p>
      </div>
      <div class="summary-card">
        <h3>Total Dibayarkan</h3>
        <p class="amount paid">Rp {{ formatCurrency(summary.totalPaid) }}</p>
      </div>
    </div>

    <div class="filters">
      <input v-model="searchQuery" type="text" placeholder="Cari nama karyawan..." class="search-input" />
      <select v-model="filterDepartment" class="filter-select">
        <option value="">Semua Departemen</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="processed">Diproses</option>
        <option value="paid">Dibayar</option>
      </select>
    </div>

    <div class="table-container">
      <table class="payroll-table">
        <thead>
          <tr>
            <th>NIK</th>
            <th>Nama</th>
            <th>Departemen</th>
            <th>Gaji Pokok</th>
            <th>Tunjangan</th>
            <th>Potongan</th>
            <th>Total Gaji</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payroll in filteredPayroll" :key="payroll.id">
            <td>{{ payroll.nik }}</td>
            <td>{{ payroll.employeeName }}</td>
            <td>{{ payroll.department }}</td>
            <td>Rp {{ formatCurrency(payroll.basicSalary) }}</td>
            <td>Rp {{ formatCurrency(payroll.allowance) }}</td>
            <td class="deduction">Rp {{ formatCurrency(payroll.deduction) }}</td>
            <td class="total">Rp {{ formatCurrency(payroll.totalSalary) }}</td>
            <td>
              <span :class="['status-badge', payroll.status]">
                {{ getStatusLabel(payroll.status) }}
              </span>
            </td>
            <td>
              <button @click="viewSlip(payroll.id)" class="btn-detail">📄 Slip Gaji</button>
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

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const selectedMonth = ref(currentMonth);
const selectedYear = ref(currentYear);
const searchQuery = ref("");
const filterDepartment = ref("");
const filterStatus = ref("");
const payrollData = ref([]);

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

const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const summary = ref({
  totalSalary: 0,
  totalDeduction: 0,
  totalPaid: 0,
});

const filteredPayroll = computed(() => {
  let result = payrollData.value;

  if (searchQuery.value) {
    result = result.filter((p) => p.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()));
  }

  if (filterDepartment.value) {
    result = result.filter((p) => p.department === filterDepartment.value);
  }

  if (filterStatus.value) {
    result = result.filter((p) => p.status === filterStatus.value);
  }

  return result;
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID").format(amount);
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    processed: "Diproses",
    paid: "Dibayar",
  };
  return labels[status] || status;
};

const fetchPayroll = async () => {
  try {
    const { data } = await useFetch("/api/payroll", {
      query: {
        month: selectedMonth.value,
        year: selectedYear.value,
      },
    });
    if (data.value) {
      payrollData.value = data.value.payroll;
      summary.value = data.value.summary;
    }
  } catch (error) {
    console.error("Error fetching payroll:", error);
  }
};

const processPayroll = async () => {
  if (confirm("Proses payroll untuk periode ini?")) {
    try {
      await $fetch("/api/payroll/process", {
        method: "POST",
        body: {
          month: selectedMonth.value,
          year: selectedYear.value,
        },
      });
      alert("Payroll berhasil diproses!");
      fetchPayroll();
    } catch (error) {
      console.error("Error processing payroll:", error);
      alert("Gagal memproses payroll");
    }
  }
};

const viewSlip = (payrollId: string) => {
  navigateTo(`/payroll/slip/${payrollId}`);
};

watch([selectedMonth, selectedYear], () => {
  fetchPayroll();
});

onMounted(() => {
  fetchPayroll();
});
</script>

<style scoped>
.payroll-page {
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

.month-select,
.year-select,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
}

.payroll-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  margin: 0;
}

.amount.deduction {
  color: #ef4444;
}

.amount.paid {
  color: #3b82f6;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.payroll-table {
  width: 100%;
  border-collapse: collapse;
}

.payroll-table th,
.payroll-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.payroll-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.payroll-table td.deduction {
  color: #ef4444;
}

.payroll-table td.total {
  font-weight: 600;
  color: #3b82f6;
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

.status-badge.processed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
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

.btn-detail {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  background: #dbeafe;
  color: #1e40af;
}
</style>
