# KREAVOKS HRIS - Human Resource Information System

> Sistem Informasi Sumber Daya Manusia berbasis web menggunakan **Nuxt 3**, **Vue.js 3**, **MySQL**, dan **Prisma ORM**

## 📋 Daftar Isi

- [Overview](#overview)
- [Fitur Utama](#fitur-utama)
- [Struktur Project](#struktur-project)
- [Teknologi Stack](#teknologi-stack)
- [Setup & Instalasi](#setup--instalasi)
- [Panduan Pengembangan](#panduan-pengembangan)
- [API Endpoints](#api-endpoints)

---

## 🎯 Overview

Kreavoks HRIS adalah aplikasi manajemen SDM yang mencakup fitur-fitur penting seperti:

- **Dashboard** - Monitoring statistik karyawan
- **Manajemen Karyawan** - CRUD data karyawan
- **Absensi** - Pencatatan kehadiran karyawan
- **Cuti** - Pengajuan dan persetujuan cuti
- **Payroll** - Perhitungan dan pengelolaan gaji

---

## ✨ Fitur Utama

### 1. Dashboard

- Statistik total karyawan
- Monitoring kehadiran harian
- Tracking cuti bulanan
- Pending approval notifications

### 2. Manajemen Karyawan

- Tambah/Edit/Hapus data karyawan
- Filter berdasarkan departemen
- Search by nama/NIK
- Export data karyawan

### 3. Absensi

- Rekap absensi harian
- Status: Hadir, Izin, Sakit, Alfa
- Filter by date & status
- Export laporan absensi

### 4. Manajemen Cuti

- Pengajuan cuti (tahunan, sakit, darurat)
- Approval workflow
- Sisa kuota cuti
- Riwayat pengajuan

### 5. Payroll

- Perhitungan gaji otomatis
- Tunjangan dan potongan
- Generate slip gaji
- Export laporan payroll

---

## 📁 Struktur Project

```
kreavoks-hris/
├─ app/
│  ├─ components/          # Komponen Vue reusable
│  │  ├─ ActivityList.vue
│  │  ├─ AttendanceCard.vue
│  │  ├─ DashboardCard.vue
│  │  ├─ DataTable.vue
│  │  ├─ FormInput.vue
│  │  ├─ FormSelect.vue
│  │  └─ Pagination.vue
│  ├─ composables/         # Composable functions
│  ├─ layouts/             # Layout templates
│  │  └─ default.vue       # Layout utama dengan sidebar
│  ├─ middleware/          # Route middleware
│  │  └─ auth.ts           # Authentication middleware
│  ├─ pages/               # Halaman aplikasi (auto-routing)
│  │  ├─ index.vue         # Dashboard
│  │  ├─ karyawan/
│  │  │  ├─ index.vue      # List karyawan
│  │  │  └─ tambah.vue     # Form tambah karyawan
│  │  ├─ absensi/
│  │  │  └─ index.vue      # Halaman absensi
│  │  ├─ cuti/
│  │  │  └─ index.vue      # Halaman cuti
│  │  └─ payroll/
│  │     └─ index.vue      # Halaman payroll
│  └─ app.vue              # Root component
├─ server/
│  ├─ api/                 # REST API endpoints
│  │  ├─ dashboard/
│  │  │  └─ stats.get.ts
│  │  ├─ employees/
│  │  │  ├─ index.get.ts   # GET all employees
│  │  │  ├─ index.post.ts  # CREATE employee
│  │  │  └─ [id].delete.ts # DELETE employee
│  │  ├─ attendance/
│  │  │  └─ index.get.ts
│  │  ├─ leaves/
│  │  │  └─ index.get.ts
│  │  └─ payroll/
│  │     ├─ index.get.ts
│  │     └─ process.post.ts
│  ├─ middleware/          # Server middleware
│  └─ utils/               # Server utilities
│     └─ prisma.ts         # Prisma client instance
├─ prisma/
│  ├─ schema.prisma        # Database schema
│  └─ migrations/          # Database migrations
├─ public/                 # Static assets
├─ .env                    # Environment variables
├─ nuxt.config.ts          # Nuxt configuration
├─ package.json            # Dependencies
└─ README.md
```

---

## 🛠 Teknologi Stack

### Frontend

- **Nuxt 3** - Full-stack Vue framework
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Composition API** - Modern Vue patterns

### Backend

- **Nitro** - Nuxt server engine
- **H3** - HTTP framework
- **Prisma ORM** - Database toolkit
- **MySQL** - Relational database

### Styling

- **CSS Scoped** - Component-scoped styling
- Responsive design
- Custom UI components

---

## 🚀 Setup & Instalasi

### Prerequisites

- Node.js (v18 atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- npm/yarn/pnpm/bun

### 1. Clone Repository

```bash
git clone <repository-url>
cd kreavoks-hris
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

#### Buat database MySQL:

```sql
CREATE DATABASE kreavoks_hris;
```

#### Konfigurasi `.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/kreavoks_hris"
```

### 4. Setup Prisma

#### Generate Prisma Client:

```bash
npx prisma generate
```

#### Buat migrations:

```bash
npx prisma migrate dev --name init
```

#### (Optional) Seed database:

```bash
npx prisma db seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 📚 Panduan Pengembangan

### Menambah Halaman Baru

Nuxt 3 menggunakan **file-based routing**. Buat file baru di folder `app/pages/`:

```vue
<!-- app/pages/nama-halaman.vue -->
<template>
  <div>
    <h1>Halaman Baru</h1>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});
</script>
```

### Membuat Komponen Baru

Buat file di `app/components/`:

```vue
<!-- app/components/MyComponent.vue -->
<template>
  <div class="my-component">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<style scoped>
.my-component {
  padding: 1rem;
}
</style>
```

### Membuat API Endpoint Baru

Buat file di `server/api/`:

```typescript
// server/api/my-endpoint.get.ts
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  // Your logic here
  return {
    message: "Success",
  };
});
```

### Menggunakan Prisma

```typescript
// Di dalam API handler
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const prisma = event.context.prisma;

  const employees = await prisma.employee.findMany();

  return { employees };
});
```

### Update Prisma Schema

1. Edit `prisma/schema.prisma`
2. Jalankan migration:

```bash
npx prisma migrate dev --name nama_perubahan
```

3. Generate ulang Prisma Client:

```bash
npx prisma generate
```

---

## 🔌 API Endpoints

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Employees

- `GET /api/employees` - Get all employees (with pagination)
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Record attendance

### Leaves

- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `PUT /api/leaves/:id` - Update leave status
- `DELETE /api/leaves/:id` - Cancel leave request

### Payroll

- `GET /api/payroll` - Get payroll data
- `POST /api/payroll/process` - Process payroll
- `GET /api/payroll/slip/:id` - Get salary slip

---

## 🔐 Environment Variables

Buat file `.env` di root project:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/kreavoks_hris"

# App
NODE_ENV=development

# (Optional) JWT Secret untuk authentication
JWT_SECRET=your-secret-key
```

---

# Nuxt 3 Documentation

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
