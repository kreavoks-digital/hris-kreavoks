# 📊 Dokumentasi Struktur Project - Kreavoks HRIS

## 🌳 Struktur Lengkap

```
kreavoks-hris/
│
├─ 📁 app/                              # Frontend Application
│  ├─ 📁 components/                    # Vue Components (Reusable)
│  │  ├─ 📄 ActivityList.vue            # → Komponen daftar aktivitas
│  │  ├─ 📄 AttendanceCard.vue          # → Card statistik absensi
│  │  ├─ 📄 DashboardCard.vue           # → Card statistik dashboard
│  │  ├─ 📄 DataTable.vue               # → Tabel data dengan CRUD actions
│  │  ├─ 📄 FormInput.vue               # → Input form dengan validasi
│  │  ├─ 📄 FormSelect.vue              # → Dropdown select form
│  │  └─ 📄 Pagination.vue              # → Komponen pagination
│  │
│  ├─ 📁 composables/                   # Composable Functions (Logic Reusable)
│  │  └─ (Bisa ditambahkan: useAuth, useFetch, dll)
│  │
│  ├─ 📁 layouts/                       # Layout Templates
│  │  └─ 📄 default.vue                 # → Layout utama dengan sidebar & header
│  │
│  ├─ 📁 middleware/                    # Route Middleware
│  │  └─ 📄 auth.ts                     # → Authentication middleware
│  │
│  ├─ 📁 pages/                         # Pages (Auto-routing)
│  │  ├─ 📄 index.vue                   # → Dashboard (//)
│  │  │
│  │  ├─ 📁 karyawan/                   # Karyawan Module
│  │  │  ├─ 📄 index.vue                # → List karyawan (/karyawan)
│  │  │  └─ 📄 tambah.vue               # → Form tambah (/karyawan/tambah)
│  │  │
│  │  ├─ 📁 absensi/                    # Absensi Module
│  │  │  └─ 📄 index.vue                # → Halaman absensi (/absensi)
│  │  │
│  │  ├─ 📁 cuti/                       # Cuti Module
│  │  │  └─ 📄 index.vue                # → Halaman cuti (/cuti)
│  │  │
│  │  └─ 📁 payroll/                    # Payroll Module
│  │     └─ 📄 index.vue                # → Halaman payroll (/payroll)
│  │
│  └─ 📄 app.vue                        # Root Component
│
├─ 📁 server/                           # Backend (Nuxt Server)
│  ├─ 📁 api/                           # REST API Endpoints
│  │  │
│  │  ├─ 📁 dashboard/
│  │  │  └─ 📄 stats.get.ts             # → GET /api/dashboard/stats
│  │  │
│  │  ├─ 📁 employees/                  # Employees API
│  │  │  ├─ 📄 index.get.ts             # → GET /api/employees
│  │  │  ├─ 📄 index.post.ts            # → POST /api/employees
│  │  │  └─ 📄 [id].delete.ts           # → DELETE /api/employees/:id
│  │  │
│  │  ├─ 📁 attendance/                 # Attendance API
│  │  │  └─ 📄 index.get.ts             # → GET /api/attendance
│  │  │
│  │  ├─ 📁 leaves/                     # Leaves API
│  │  │  └─ 📄 index.get.ts             # → GET /api/leaves
│  │  │
│  │  └─ 📁 payroll/                    # Payroll API
│  │     ├─ 📄 index.get.ts             # → GET /api/payroll
│  │     └─ 📄 process.post.ts          # → POST /api/payroll/process
│  │
│  ├─ 📁 middleware/                    # Server Middleware
│  │  └─ (Untuk CORS, Auth, Logging, dll)
│  │
│  └─ 📁 utils/                         # Server Utilities
│     └─ 📄 prisma.ts                   # → Prisma client instance
│
├─ 📁 prisma/                           # Database (Prisma ORM)
│  ├─ 📄 schema.prisma                  # → Database schema definition
│  ├─ 📄 seed.ts                        # → Database seeder
│  └─ 📁 migrations/                    # → Database migrations
│     └─ (Auto-generated)
│
├─ 📁 public/                           # Static Assets
│  └─ 📄 robots.txt
│
├─ 📄 .env                              # Environment Variables (local)
├─ 📄 .env.example                      # Environment Template
├─ 📄 .gitignore                        # Git ignore rules
├─ 📄 nuxt.config.ts                    # Nuxt Configuration
├─ 📄 package.json                      # Dependencies & Scripts
├─ 📄 prisma.config.ts                  # Prisma Configuration
├─ 📄 tsconfig.json                     # TypeScript Configuration
│
├─ 📄 README.md                         # Main Documentation
├─ 📄 SETUP_GUIDE.md                    # Step-by-step Setup Guide
└─ 📄 FRONTEND_GUIDE.md                 # Frontend Development Guide
```

---

## 🗂️ Penjelasan Folder

### 📁 app/ - Frontend Application

**Folder utama untuk semua kode frontend.**

#### app/components/

Komponen Vue yang bisa digunakan berulang di berbagai halaman.

- Auto-imported (tidak perlu import manual)
- Gunakan PascalCase untuk nama file
- Setiap komponen fokus pada satu fungsi

#### app/composables/

Fungsi-fungsi JavaScript/TypeScript yang reusable.

- Untuk logic yang dipakai di banyak tempat
- Naming convention: `use` prefix (e.g., `useAuth`, `useFetch`)
- Auto-imported

#### app/layouts/

Template layout untuk halaman.

- `default.vue` - Layout dengan sidebar & header
- Bisa buat layout lain (e.g., `auth.vue` untuk login page)

#### app/middleware/

Middleware untuk proteksi route.

- `auth.ts` - Cek apakah user sudah login
- Bisa buat middleware lain (e.g., `admin.ts` untuk admin only)

#### app/pages/

Halaman aplikasi (auto-routing).

- File structure = URL structure
- `index.vue` = root route
- Folder = nested routes

#### app/app.vue

Root component, wrapper untuk semua halaman.

---

### 📁 server/ - Backend API

**Folder untuk semua kode backend/API.**

#### server/api/

REST API endpoints.

- Naming convention:
  - `[name].get.ts` → GET request
  - `[name].post.ts` → POST request
  - `[name].put.ts` → PUT request
  - `[name].delete.ts` → DELETE request
  - `[id].get.ts` → Dynamic route dengan parameter

#### server/middleware/

Middleware untuk semua request.

- Contoh: CORS, logging, rate limiting

#### server/utils/

Helper functions untuk server.

- `prisma.ts` - Prisma client instance

---

### 📁 prisma/ - Database

**Folder untuk database schema dan migrations.**

#### prisma/schema.prisma

Definisi struktur database (models, relations, enums).

#### prisma/seed.ts

Script untuk isi database dengan data awal.

#### prisma/migrations/

Folder auto-generated berisi history perubahan database.

---

### 📁 public/ - Static Files

**Folder untuk file static yang langsung accessible.**

- Images, fonts, icons, dll
- Accessible via URL: `http://localhost:3000/filename.ext`

---

## 🔄 Request Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │  1. Request: GET /karyawan
       ▼
┌─────────────────────────────┐
│  Nuxt Server (Nitro)        │
│  ├─ Middleware (auth)       │  2. Check authentication
│  └─ Route Handler           │  3. Match route to page
└──────────┬──────────────────┘
           │
           │  4. Fetch data dari API
           ▼
┌─────────────────────────────┐
│  API Handler                │
│  server/api/employees/*.ts  │
└──────────┬──────────────────┘
           │
           │  5. Query database
           ▼
┌─────────────────────────────┐
│  Prisma ORM                 │
│  ├─ Execute SQL Query       │
│  └─ Return data             │
└──────────┬──────────────────┘
           │
           │  6. MySQL Database
           ▼
┌─────────────────────────────┐
│  MySQL                      │
│  Database: kreavoks_hris    │
└──────────┬──────────────────┘
           │
           │  7. Return data
           ▼
┌─────────────────────────────┐
│  Vue Page Component         │
│  app/pages/karyawan/        │
│  ├─ Render data             │
│  └─ Use components          │
└──────────┬──────────────────┘
           │
           │  8. Rendered HTML
           ▼
┌─────────────┐
│   Browser   │  Display page
└─────────────┘
```

---

## 📦 Dependencies

### Frontend (Vue/Nuxt)

```json
{
  "nuxt": "^4.2.1", // Framework utama
  "vue": "^3.5.25", // Vue.js
  "vue-router": "^4.6.3" // Routing
}
```

### Backend (Database)

```json
{
  "@prisma/client": "^7.0.1", // Prisma client
  "prisma": "^7.0.1" // Prisma CLI (dev)
}
```

### Development

```json
{
  "tsx": "^4.7.0", // TypeScript executor
  "@types/node": "^20.11.0" // Node.js types
}
```

---

## 🔐 Environment Variables

File `.env` berisi konfigurasi sensitif:

```env
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/kreavoks_hris"

# App
NODE_ENV=development

# Auth (Optional)
JWT_SECRET=your-secret-key
```

**PENTING:** File `.env` tidak boleh di-commit ke Git!

---

## 🚀 npm Scripts

```json
{
  "dev": "nuxt dev", // ⚡ Dev server
  "build": "nuxt build", // 📦 Build production
  "preview": "nuxt preview", // 👀 Preview production

  "prisma:generate": "prisma generate", // 🔧 Generate Prisma client
  "prisma:migrate": "prisma migrate dev", // 🗄️ Run migrations
  "prisma:seed": "prisma db seed", // 🌱 Seed database
  "prisma:studio": "prisma studio", // 🎨 Open Prisma Studio

  "db:reset": "prisma migrate reset" // ⚠️ Reset database
}
```

---

## 📊 Database Schema (Prisma)

### Models:

1. **User** - Authentication
2. **Employee** - Data karyawan
3. **Attendance** - Absensi
4. **Leave** - Cuti
5. **Payroll** - Gaji
6. **Department** - Departemen

### Relations:

```
User ──1:1── Employee
Employee ──1:N── Attendance
Employee ──1:N── Leave
Employee ──1:N── Payroll
```

---

## 🎯 Module Fitur

### ✅ Sudah Dibuat:

- ✅ Dashboard
- ✅ Manajemen Karyawan (List, Add)
- ✅ Absensi
- ✅ Cuti
- ✅ Payroll

### 🚧 Bisa Dikembangkan:

- 🔲 Authentication (Login/Register)
- 🔲 Profile Karyawan (Detail)
- 🔲 Edit Karyawan
- 🔲 Approval Cuti (Manager)
- 🔲 Laporan/Export Excel
- 🔲 Notifikasi
- 🔲 Role-based Access Control

---

## 💡 Tips Pengembangan

### Untuk Frontend Developer:

1. Fokus di folder `app/`
2. Buat komponen reusable di `app/components/`
3. Tambah halaman di `app/pages/`
4. Gunakan komponen yang sudah ada

### Untuk Backend Developer:

1. Fokus di folder `server/`
2. Buat API endpoint di `server/api/`
3. Edit schema di `prisma/schema.prisma`
4. Jalankan migration setelah edit schema

### Kolaborasi:

- Frontend dev: Konsumsi API dari backend
- Backend dev: Buat API sesuai kebutuhan frontend
- Komunikasi: Dokumentasi API yang jelas

---

**Semoga membantu! 🚀**
