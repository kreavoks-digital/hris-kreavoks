<template>
  <div class="employees-page">
    <div class="page-header">
      <h1>Data Karyawan</h1>
      <button @click="navigateTo('/karyawan/tambah')" class="btn-primary">+ Tambah Karyawan</button>
    </div>

    <div class="filters">
      <input v-model="searchQuery" type="text" placeholder="Cari nama atau NIK..." class="search-input" />
      <select v-model="filterDepartment" class="filter-select">
        <option value="">Semua Departemen</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
      </select>
    </div>

    <div class="table-container">
      <DataTable :columns="columns" :data="filteredEmployees" @edit="editEmployee" @delete="deleteEmployee" />
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @change="changePage" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

const searchQuery = ref("");
const filterDepartment = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const employees = ref([]);

const columns = [
  { key: "nik", label: "NIK" },
  { key: "name", label: "Nama" },
  { key: "department", label: "Departemen" },
  { key: "position", label: "Posisi" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telepon" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

const filteredEmployees = computed(() => {
  let result = employees.value;

  if (searchQuery.value) {
    result = result.filter((emp) => emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || emp.nik.includes(searchQuery.value));
  }

  if (filterDepartment.value) {
    result = result.filter((emp) => emp.department === filterDepartment.value);
  }

  return result;
});

const fetchEmployees = async () => {
  try {
    const { data } = await useFetch("/api/employees", {
      query: { page: currentPage.value },
    });
    if (data.value) {
      employees.value = data.value.employees;
      totalPages.value = data.value.totalPages;
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

const editEmployee = (employee: any) => {
  navigateTo(`/karyawan/edit/${employee.id}`);
};

const deleteEmployee = async (employee: any) => {
  if (confirm(`Hapus karyawan ${employee.name}?`)) {
    try {
      await $fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }
};

const changePage = (page: number) => {
  currentPage.value = page;
  fetchEmployees();
};

onMounted(() => {
  fetchEmployees();
});
</script>

<style scoped>
.employees-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
