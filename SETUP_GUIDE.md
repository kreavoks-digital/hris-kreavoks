# 🚀 Step-by-Step Setup Guide - Kreavoks HRIS

Panduan lengkap untuk setup project dari awal.

## 📋 Prerequisites

Pastikan sudah terinstall:

- ✅ Node.js v18+ ([Download](https://nodejs.org/))
- ✅ MySQL v8.0+ ([Download](https://dev.mysql.com/downloads/))
- ✅ Git ([Download](https://git-scm.com/))
- ✅ Visual Studio Code (atau text editor lain)

---

## 🔧 Step 1: Clone & Install

### 1.1 Clone Repository

```bash
git clone <repository-url>
cd kreavoks-hris
```

### 1.2 Install Dependencies

```bash
npm install
```

Tunggu hingga semua package terinstall.

---

## 🗄️ Step 2: Setup Database

### 2.1 Buat Database MySQL

Buka MySQL client (MySQL Workbench, phpMyAdmin, atau command line):

```sql
CREATE DATABASE kreavoks_hris CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Cek Koneksi Database

Test koneksi dengan MySQL:

```bash
mysql -u root -p
```

Masukkan password MySQL Anda, kemudian:

```sql
SHOW DATABASES;
```

Pastikan `kreavoks_hris` ada dalam daftar.

---

## 🔐 Step 3: Konfigurasi Environment

### 3.1 Buat File .env

Copy file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

**Windows:**

```powershell
copy .env.example .env
```

### 3.2 Edit File .env

Buka `.env` dan sesuaikan dengan konfigurasi Anda:

```env
DATABASE_URL="mysql://username:password@localhost:3306/kreavoks_hris"
```

Ganti:

- `username` → username MySQL Anda (biasanya `root`)
- `password` → password MySQL Anda
- `localhost` → host database (biasanya `localhost`)
- `3306` → port MySQL (biasanya `3306`)

**Contoh:**

```env
DATABASE_URL="mysql://root:mypassword123@localhost:3306/kreavoks_hris"
```

---

## 🛠️ Step 4: Setup Prisma

### 4.1 Generate Prisma Client

```bash
npm run prisma:generate
```

Output yang diharapkan:

```
✔ Generated Prisma Client
```

### 4.2 Jalankan Migration

Buat tabel-tabel di database:

```bash
npm run prisma:migrate
```

Ketik nama migration (contoh: `init`) lalu tekan Enter.

Output yang diharapkan:

```
✔ Database migrated successfully
```

### 4.3 Seed Database (Optional)

Isi database dengan data contoh:

```bash
npm run prisma:seed
```

Output yang diharapkan:

```
🌱 Starting database seed...
✅ Departments seeded
✅ Admin user created
✅ Sample employees seeded
🎉 Database seeding completed!
```

### 4.4 Cek Database dengan Prisma Studio

Buka Prisma Studio untuk melihat data:

```bash
npm run prisma:studio
```

Browser akan otomatis membuka `http://localhost:5555`

---

## 🎨 Step 5: Jalankan Development Server

### 5.1 Start Server

```bash
npm run dev
```

Output yang diharapkan:

```
Nuxt 3.x.x with Nitro 2.x.x
  > Local:    http://localhost:3000/
  > Network:  use --host to expose
```

### 5.2 Buka Aplikasi

Buka browser dan akses:

```
http://localhost:3000
```

---

## ✅ Step 6: Verifikasi Instalasi

### 6.1 Cek Halaman Dashboard

- Buka `http://localhost:3000`
- Seharusnya tampil halaman Dashboard

### 6.2 Cek Halaman Karyawan

- Navigasi ke `/karyawan`
- Jika seed berhasil, seharusnya ada 3 karyawan contoh

### 6.3 Cek Database

- Buka Prisma Studio: `npm run prisma:studio`
- Cek tabel `employees`, `departments`, dll

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solusi:**

1. Pastikan MySQL server running
2. Cek username/password di `.env`
3. Cek port MySQL (default: 3306)

### Error: "P1001: Can't reach database"

**Solusi:**

1. Pastikan database `kreavoks_hris` sudah dibuat
2. Cek koneksi: `mysql -u root -p`

### Error: "Port 3000 already in use"

**Solusi:**

1. Gunakan port lain:
   ```bash
   PORT=3001 npm run dev
   ```
2. Atau kill process di port 3000

### Error: "Module not found"

**Solusi:**

```bash
rm -rf node_modules
npm install
```

---

## 📚 Next Steps

Setelah setup berhasil, Anda bisa:

1. **Customize UI** - Edit components di `app/components/`
2. **Tambah Fitur** - Buat halaman baru di `app/pages/`
3. **Edit Schema** - Modifikasi `prisma/schema.prisma`
4. **Tambah API** - Buat endpoint di `server/api/`

---

## 🔗 Useful Commands

```bash
# Development
npm run dev                  # Start dev server

# Prisma
npm run prisma:generate      # Generate Prisma Client
npm run prisma:migrate       # Run migrations
npm run prisma:seed          # Seed database
npm run prisma:studio        # Open Prisma Studio
npm run db:reset             # Reset database

# Production
npm run build                # Build for production
npm run preview              # Preview production build
```

---

## 📞 Need Help?

Jika mengalami kesulitan:

1. Cek dokumentasi di `README.md`
2. Baca error message dengan teliti
3. Cek konfigurasi di `.env`
4. Pastikan semua dependencies terinstall

---

**Happy Coding! 🎉**
