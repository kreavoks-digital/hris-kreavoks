<template>
  <div class="add-employee-page">
    <div class="page-header">
      <h1>Tambah Karyawan Baru</h1>
      <button @click="navigateTo('/karyawan')" class="btn-secondary">← Kembali</button>
    </div>

    <form @submit.prevent="submitForm" class="employee-form">
      <div class="form-section">
        <h2>Data Pribadi</h2>
        <div class="form-grid">
          <FormInput v-model="formData.nik" label="NIK" required placeholder="Nomor Induk Karyawan" />
          <FormInput v-model="formData.name" label="Nama Lengkap" required placeholder="Nama lengkap karyawan" />
          <FormInput v-model="formData.email" label="Email" type="email" required placeholder="email@example.com" />
          <FormInput v-model="formData.phone" label="No. Telepon" required placeholder="08xxxxxxxxxx" />
          <FormInput v-model="formData.birthDate" label="Tanggal Lahir" type="date" required />
          <FormInput v-model="formData.address" label="Alamat" type="textarea" required />
        </div>
      </div>

      <div class="form-section">
        <h2>Data Pekerjaan</h2>
        <div class="form-grid">
          <FormSelect v-model="formData.department" label="Departemen" :options="departments" required />
          <FormInput v-model="formData.position" label="Posisi" required placeholder="Jabatan" />
          <FormInput v-model="formData.joinDate" label="Tanggal Bergabung" type="date" required />
          <FormSelect v-model="formData.employmentType" label="Jenis Kontrak" :options="employmentTypes" required />
          <FormInput v-model="formData.salary" label="Gaji Pokok" type="number" required placeholder="0" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="navigateTo('/karyawan')" class="btn-secondary">Batal</button>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Menyimpan..." : "Simpan Data" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

const loading = ref(false);

const formData = ref({
  nik: "",
  name: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  department: "",
  position: "",
  joinDate: "",
  employmentType: "",
  salary: 0,
});

const departments = [
  { value: "IT", label: "IT" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Operations", label: "Operations" },
];

const employmentTypes = [
  { value: "permanent", label: "Tetap" },
  { value: "contract", label: "Kontrak" },
  { value: "intern", label: "Magang" },
];

const submitForm = async () => {
  loading.value = true;
  try {
    await $fetch("/api/employees", {
      method: "POST",
      body: formData.value,
    });
    alert("Karyawan berhasil ditambahkan!");
    navigateTo("/karyawan");
  } catch (error) {
    console.error("Error adding employee:", error);
    alert("Gagal menambahkan karyawan");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.add-employee-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.employee-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}
</style>
