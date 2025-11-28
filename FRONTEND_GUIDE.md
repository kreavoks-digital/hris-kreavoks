# 🎨 Frontend Development Guide - Kreavoks HRIS

Dokumentasi lengkap untuk pengembangan front-end dengan Nuxt 3 + Vue.js

---

## 📁 Struktur Frontend

```
app/
├─ components/         # Komponen Vue reusable
├─ composables/        # Composable functions (logic reusable)
├─ layouts/            # Layout templates
├─ middleware/         # Route middleware
├─ pages/              # Halaman aplikasi (auto-routing)
└─ app.vue             # Root component
```

---

## 🧩 Components

Komponen-komponen UI yang sudah tersedia:

### 1. DashboardCard.vue

Kartu untuk menampilkan statistik di dashboard.

**Props:**

- `title` (string) - Judul kartu
- `value` (number/string) - Nilai statistik
- `icon` (string) - Emoji icon

**Contoh Penggunaan:**

```vue
<DashboardCard title="Total Karyawan" :value="150" icon="👥" />
```

---

### 2. DataTable.vue

Tabel data dengan fitur action (edit, delete).

**Props:**

- `columns` (Array) - Daftar kolom
- `data` (Array) - Data tabel

**Events:**

- `@edit` - Emitted saat tombol edit diklik
- `@delete` - Emitted saat tombol delete diklik

**Contoh Penggunaan:**

```vue
<template>
  <DataTable :columns="columns" :data="employees" @edit="handleEdit" @delete="handleDelete" />
</template>

<script setup>
const columns = [
  { key: 'nik', label: 'NIK' },
  { key: 'name', label: 'Nama' },
  { key: 'department', label: 'Departemen' },
  { key: 'actions', label: 'Aksi' }
]

const employees = ref([...])

const handleEdit = (row) => {
  console.log('Edit:', row)
}

const handleDelete = (row) => {
  console.log('Delete:', row)
}
</script>
```

---

### 3. FormInput.vue

Input form dengan label dan validasi.

**Props:**

- `modelValue` (string/number) - Nilai input (v-model)
- `label` (string) - Label input
- `type` (string) - Tipe input (text, email, password, date, textarea)
- `placeholder` (string) - Placeholder
- `required` (boolean) - Wajib diisi
- `error` (string) - Pesan error

**Contoh Penggunaan:**

```vue
<FormInput v-model="formData.name" label="Nama Lengkap" required placeholder="Masukkan nama" />

<FormInput v-model="formData.address" label="Alamat" type="textarea" required />
```

---

### 4. FormSelect.vue

Dropdown select dengan label.

**Props:**

- `modelValue` (string/number) - Nilai terpilih (v-model)
- `label` (string) - Label select
- `options` (Array) - Daftar options
- `required` (boolean) - Wajib dipilih
- `error` (string) - Pesan error

**Contoh Penggunaan:**

```vue
<FormSelect v-model="formData.department" label="Departemen" :options="departments" required />

<script setup>
const departments = [
  { value: "IT", label: "IT" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
];
</script>
```

---

### 5. Pagination.vue

Komponen pagination untuk tabel.

**Props:**

- `currentPage` (number) - Halaman aktif
- `totalPages` (number) - Total halaman

**Events:**

- `@change` - Emitted saat halaman berubah

**Contoh Penggunaan:**

```vue
<Pagination :current-page="currentPage" :total-pages="totalPages" @change="changePage" />

<script setup>
const currentPage = ref(1);
const totalPages = ref(10);

const changePage = (page) => {
  currentPage.value = page;
  // Fetch data untuk halaman baru
};
</script>
```

---

### 6. ActivityList.vue

Daftar aktivitas terbaru.

**Props:**

- `activities` (Array) - Daftar aktivitas

**Contoh Penggunaan:**

```vue
<ActivityList :activities="recentActivities" />

<script setup>
const recentActivities = ref([
  {
    id: "1",
    icon: "✅",
    title: "John Doe check-in",
    timestamp: "2025-11-28T08:00:00",
  },
]);
</script>
```

---

### 7. AttendanceCard.vue

Kartu untuk menampilkan statistik absensi.

**Props:**

- `title` (string) - Judul
- `count` (number) - Jumlah
- `color` ('green'|'yellow'|'orange'|'red') - Warna tema

**Contoh Penggunaan:**

```vue
<AttendanceCard title="Hadir" :count="142" color="green" />
```

---

## 📄 Pages

### Routing File-Based

Nuxt 3 menggunakan **file-based routing**. File di `app/pages/` otomatis menjadi route:

```
app/pages/
├─ index.vue              → /
├─ karyawan/
│  ├─ index.vue           → /karyawan
│  └─ tambah.vue          → /karyawan/tambah
├─ absensi/
│  └─ index.vue           → /absensi
├─ cuti/
│  └─ index.vue           → /cuti
└─ payroll/
   └─ index.vue           → /payroll
```

### Halaman yang Sudah Dibuat

#### 1. Dashboard (`/`)

- Statistik karyawan, absensi, cuti
- Aktivitas terbaru
- Layout: `default`
- Middleware: `auth`

#### 2. Data Karyawan (`/karyawan`)

- List semua karyawan
- Search & filter
- Pagination
- CRUD operations

#### 3. Tambah Karyawan (`/karyawan/tambah`)

- Form input data karyawan
- Data pribadi & pekerjaan
- Validasi form

#### 4. Absensi (`/absensi`)

- Rekap absensi harian
- Filter by date & status
- Summary cards

#### 5. Cuti (`/cuti`)

- Daftar pengajuan cuti
- Sisa kuota cuti
- Filter by status & type

#### 6. Payroll (`/payroll`)

- Daftar gaji karyawan
- Filter by month & year
- Summary total gaji

---

## 🎯 Membuat Halaman Baru

### Template Dasar

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Judul Halaman</h1>
      <!-- Actions -->
    </div>

    <div class="page-content">
      <!-- Konten halaman -->
    </div>
  </div>
</template>

<script setup lang="ts">
// Tentukan meta page
definePageMeta({
  layout: "default", // Layout yang digunakan
  middleware: "auth", // Middleware (optional)
});

// State & data
const data = ref([]);

// Fetch data
const fetchData = async () => {
  try {
    const response = await useFetch("/api/endpoint");
    data.value = response.data.value;
  } catch (error) {
    console.error("Error:", error);
  }
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}
</style>
```

---

## 🔧 Composables

Composables adalah fungsi reusable untuk logic bersama.

### Contoh: useAuth

```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const user = useState("user", () => null);
  const isAuthenticated = computed(() => !!user.value);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await useFetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      user.value = data.value.user;
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    user.value = null;
    navigateTo("/login");
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
};
```

**Penggunaan:**

```vue
<script setup>
const { user, isAuthenticated, logout } = useAuth();
</script>
```

---

## 🎨 Styling

### CSS Scoped

Semua style menggunakan `scoped` untuk menghindari konflik:

```vue
<style scoped>
/* Style hanya berlaku untuk component ini */
.my-class {
  color: blue;
}
</style>
```

### Color Palette

```css
/* Primary Colors */
--primary: #3b82f6; /* Blue */
--secondary: #10b981; /* Green */
--danger: #ef4444; /* Red */
--warning: #f59e0b; /* Yellow */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-900: #1f2937;

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f3f4f6;
```

---

## 📱 Responsive Design

Tips untuk membuat responsive:

```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

### Grid Responsive

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

---

## 🔌 API Integration

### useFetch (Recommended)

```vue
<script setup>
// GET request
const { data, pending, error, refresh } = await useFetch("/api/employees");

// POST request
const createEmployee = async (employee) => {
  const { data } = await useFetch("/api/employees", {
    method: "POST",
    body: employee,
  });
  return data.value;
};

// With query params
const { data } = await useFetch("/api/employees", {
  query: { page: 1, limit: 10 },
});
</script>
```

### $fetch (Alternative)

```vue
<script setup>
const fetchData = async () => {
  try {
    const data = await $fetch("/api/employees");
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
};
</script>
```

---

## 🚦 Navigation

### Programmatic Navigation

```vue
<script setup>
// Navigate to route
navigateTo("/karyawan");

// With params
navigateTo(`/karyawan/edit/${id}`);

// External link
navigateTo("https://example.com", { external: true });

// Go back
useRouter().back();
</script>
```

### NuxtLink Component

```vue
<template>
  <!-- Internal link -->
  <NuxtLink to="/karyawan">Data Karyawan</NuxtLink>

  <!-- Dynamic link -->
  <NuxtLink :to="`/karyawan/edit/${employee.id}`"> Edit </NuxtLink>

  <!-- External link -->
  <NuxtLink to="https://example.com" external> External Link </NuxtLink>
</template>
```

---

## 💡 Best Practices

### 1. Composition API

Gunakan `<script setup>` untuk sintaks yang lebih clean:

```vue
<script setup lang="ts">
// Langsung define state dan functions
const count = ref(0);
const increment = () => count.value++;
</script>
```

### 2. TypeScript

Gunakan TypeScript untuk type safety:

```typescript
interface Employee {
  id: string;
  nik: string;
  name: string;
  department: string;
}

const employees = ref<Employee[]>([]);
```

### 3. Computed Properties

Gunakan `computed` untuk derived state:

```vue
<script setup>
const employees = ref([...])
const searchQuery = ref('')

const filteredEmployees = computed(() => {
  return employees.value.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
```

### 4. Error Handling

Selalu handle error:

```vue
<script setup>
const fetchData = async () => {
  try {
    const { data } = await useFetch("/api/employees");
    employees.value = data.value;
  } catch (error) {
    console.error("Error fetching employees:", error);
    // Show error message to user
  }
};
</script>
```

---

## 🐛 Debugging Tips

### 1. Vue DevTools

Install Vue DevTools extension untuk debugging component.

### 2. Console Logging

```vue
<script setup>
const data = ref([]);

watch(data, (newVal) => {
  console.log("Data changed:", newVal);
});
</script>
```

### 3. Error Boundary

Wrap component dengan error boundary untuk catch errors.

---

## 📚 Resources

- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/guide/introduction.html)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript in Vue](https://vuejs.org/guide/typescript/overview.html)

---

**Happy Frontend Coding! 🎨**
