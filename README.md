# KREAVOKS HRIS - Human Resource Information System & Workspace

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82.svg)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D.svg)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org)

> Sistem Informasi Sumber Daya Manusia dan Manajemen Proyek kolaboratif modern berbasis web menggunakan **Nuxt 4**, **Vue 3**, **TypeScript**, **Tailwind CSS**, dan **Express API + Prisma ORM (PostgreSQL)**.

---

## 📋 Daftar Isi

- [Overview](#-overview)
- [Fitur Utama](#-fitur-utama)
  - [1. Manajemen Proyek (`/projects`)](#1-manajemen-proyek-projects)
  - [2. Unified Workspace & Kanban (`/kanban`)](#2-unified-workspace--kanban-kanban)
  - [3. Fitur HRIS Inti](#3-fitur-hris-inti)
- [Struktur Project](#-struktur-project)
- [Teknologi Stack](#-teknologi-stack)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Changelog & Versi](#-changelog--versi)

---

## 🎯 Overview

Kreavoks HRIS v2.0.0 adalah platform terpadu yang memadukan kebutuhan operasional kepegawaian internal (HRIS) dengan sistem manajemen proyek dan eksekusi tugas bergaya **ClickUp**. Seluruh data disimpan dan disinkronkan secara langsung ke database relasional PostgreSQL tanpa menggunakan mock data.

---

## ✨ Fitur Utama

### 1. Manajemen Proyek (`/projects`)

- **Katalog & Registrasi Proyek:** Buat dan kelola proyek klien maupun inisiatif internal lengkap dengan kode identifikasi acak yang aman (*secure token*).
- **Project Lead & Assignment:** Penunjukan PIC / Project Lead dan anggota tim pelaksana secara fleksibel.
- **Health & Progress Monitoring:** Status kesehatan proyek (*On Track*, *At Risk*, *Delayed*, *Completed*).
- **Dual Presentation Mode:** Tampilan tabel terstruktur (*Project Table View*) dan kartu visual (*Project Card Grid*).
- **Executive Metric Cards:** Ringkasan statistik performa seluruh proyek secara *real-time*.

### 2. Unified Workspace & Kanban (`/kanban`)

Modul workspace berbasis ClickUp dengan navigasi multi-view yang terintegrasi penuh:

#### A. 4 Pilihan Tampilan Sinkron (*Multi-View Tabs*)
1. **Board View (Kanban):** Kolom status kustom yang dapat diubah nama dan warnanya, kartu tugas dengan *drag-and-drop*, inline rename, dan quick create.
2. **Gantt Timeline View:** Chart linimasa bulanan interaktif dengan visualisasi durasi tugas, navigasi bulan, indikator progres, dan badge tanggal ringkas (`🕒 Nov 16 - Nov 30`).
3. **Calendar View:** Distribusi jadwal tugas bulanan, indikator avatar mini assignee, penghitung checklist, dan klik tanggal untuk pembuatan tugas instan.
4. **List View:** Pengelompokan tugas berdasarkan status kolom dengan hirarki subtask yang dapat di-expand/collapse, checkbox penyelesaian tugas, dan aksi hover.

#### B. ClickUp-Style Subtask Creator
- Tombol `⊕ Add subtask` membuka kontainer pembuatan subtask berbingkai ungu khas ClickUp langsung pada kartu Kanban maupun baris List View.
- Dilengkapi input cepat: *Subtask Name*, tombol `Save ↵`, pemilih *Assignee*, *Date Range*, bendera *Priority*, dan *Tag*.

#### C. Mark as Completed & Format Tanggal Ringkas
- Checkbox penyelesaian tugas interaktif dengan ikon centang hijau dan efek *strikethrough* pada judul tugas yang berstatus selesai (`DONE` / `COMPLETED`).
- Penyajian tanggal ringkas yang konsisten menggunakan ikon `Clock` (`🕒 Nov 16 - Nov 30` atau `🕒 Nov 16`).

#### D. Diskusi Tim Real-Time (*Task Comments & Activity Feed*)
- Terintegrasi langsung dengan tabel `TaskComment` di database PostgreSQL.
- Menampilkan avatar anggota tim, nama lengkap, konten pesan, dan waktu relatif (*"Baru saja"*, *"X menit yang lalu"*, *"X jam yang lalu"*).
- Fitur kirim cepat via tombol atau shortcut keyboard `Ctrl + Enter`.
- Proteksi penghapusan komentar berbasis kepemilikan user (*author ownership*) dan hak akses Super Admin.

#### E. Task Detail Modal Interaktif
- Dialog rincian tugas komprehensif tanpa reload halaman.
- Pengaturan langsung untuk Status, Prioritas (*Urgent*, *High*, *Medium*, *Low*), Rentang Tanggal Kalender, Assignee Stack (maksimal 3-4 avatar + badge `+N`), Tag Chip (`#tag`), serta Checklist subtasks.
- Tab ekspansi masa depan (*Doc*, *Reminder*, *Whiteboard*, *Dashboard*) ditandai dengan badge status **"Soon"** (*disabled*) agar aman dan siap untuk roadmap berikutnya.

#### F. Mobile Responsive & Auto-Collapsing Sidebar
- Pada viewport perangkat mobile (`width < 768px`), panel navigasi proyek otomatis masuk mode *collapsed* (`w-14`) untuk memaksimalkan area kerja.
- Modal detail tugas menyesuaikan layout secara vertikal (*single column scrollable*) sehingga konten diskusi dan rincian tugas tetap nyaman diakses di smartphone.

### 3. Fitur HRIS Inti

- **Dashboard:** Monitoring absensi harian, tracking kuota cuti, dan notifikasi persetujuan.
- **Manajemen Karyawan:** Pencatatan profil karyawan, departemen, jabatan, dan riwayat.
- **Absensi & Kehadiran:** Presensi online, status Hadir/Sakit/Izin/Alfa, serta rekapitulasi kehadiran.
- **Pengajuan Cuti:** Workflow persetujuan cuti berjenjang.
- **Penggajian (Payroll):** Perhitungan gaji, tunjangan, potongan, dan slip gaji digital.

---

## 📁 Struktur Project

```text
KvHRIS/
├─ app/
│  ├─ components/                 # Komponen antarmuka reusable
│  │  ├─ ui/                      # Base primitives (Calendar, Dialog, Popover, DatePicker)
│  │  └─ ...
│  ├─ composables/                # Vue composables (useApi, useAuth, useBreakpoints)
│  ├─ layouts/
│  │  └─ default.vue              # Layout utama dengan sidebar & header terpadu
│  ├─ pages/                      # File-based routing
│  │  ├─ dashboard/               # Monitoring statistik
│  │  ├─ projects/                # Modul Manajemen Proyek
│  │  │  ├─ api/projects.api.ts
│  │  │  ├─ components/           # Table, Grid Cards, Stats, Modals
│  │  │  ├─ hooks/useProjects.ts
│  │  │  └─ index.vue
│  │  ├─ kanban/                  # Modul Workspace & Kanban Multi-View
│  │  │  ├─ api/kanban.api.ts
│  │  │  ├─ components/           # KanbanColumn, KanbanCard, ListView, CalendarView, Modals
│  │  │  ├─ hooks/useKanban.ts
│  │  │  └─ index.vue
│  │  ├─ timeline/                # Gantt Grid Components & Hooks
│  │  ├─ calendar/                # Modul Kalender Acara
│  │  └─ ...
│  └─ types/                      # TypeScript declarations (kreaui.d.ts, dll)
├─ public/                        # Aset publik statis
├─ nuxt.config.ts                 # Konfigurasi Nuxt 4
├─ package.json                   # Dependensi Frontend (v2.0.0)
└─ README.md
```

---

## 🛠 Teknologi Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [Nuxt 4](https://nuxt.com/) (Vue.js 3.5 Composition API) |
| **Bahasa** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + [KreaUI Design System](https://kreavoks.com) |
| **Iconography** | [Lucide Vue Next](https://lucide.dev/) |
| **Backend API** | [Express 5](https://expressjs.com/) + [Prisma ORM 5](https://www.prisma.io/) (`KvHRISBE`) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) |
| **Otentikasi** | JSON Web Tokens (JWT) & Refresh Tokens |

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- Node.js v18.0 atau lebih baru
- npm / pnpm / yarn
- Backend API (`KvHRISBE`) berjalan pada port 3001

### 1. Setup Frontend
```bash
# Masuk ke direktori frontend
cd KvHRIS

# Pasang dependensi
npm install
```

### 2. Konfigurasi Environment (`.env`)
Buat file `.env` pada root project:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban pada `http://localhost:3000`.

### 4. Pengecekan Type Safety
```bash
npm run typecheck
```

---

## 📦 Changelog & Riwayat Versi Lengkap

### **v2.0.0 (8 November 2026) — Unified Project & Kanban Ecosystem Release**
- **Unified Multi-View Workspace (`/kanban`):**
  - Implementasi 4 pilihan tampilan terpadu ala ClickUp: **Board (Kanban)**, **Gantt Timeline**, **Calendar**, dan **List View**.
  - State sinkron antar-view: perubahan status, deadline, assignees, dan progres langsung tercermin di semua tampilan secara instan.
- **ClickUp-Style Subtask Creator:**
  - Kontainer pembuatan subtask inline berbingkai ungu dengan shortcut terintegrasi: *Subtask Name*, `Save ↵`, *Add Assignee*, *Add Dates*, *Add Priority*, dan *Add Tag*.
- **Diskusi Tim & Komentar Real-Time (`TaskComment`):**
  - Integrasi penuh dengan database PostgreSQL: riwayat diskusi tugas persisten, avatar dan nama penulis, serta waktu relatif (*"Baru saja"*, *"X menit lalu"*).
  - Shortcut kirim `Ctrl + Enter` dan proteksi penghapusan komentar berbasis kepemilikan/Super Admin.
- **Format Tanggal Ringkas & Mark as Completed:**
  - Standarisasi tampilan tanggal dengan ikon `Clock` ringkas (`🕒 Nov 16 - Nov 30` atau `🕒 Nov 16`).
  - Tombol centang penyelesaian tugas cepat dengan efek coret teks (*strikethrough*) pada judul tugas berstatus `DONE`.
- **Manajemen Proyek Terpusat (`/projects`):**
  - Registrasi proyek dengan slug acak aman (*secure token*), penugasan Project Lead, pemilihan anggota tim, dan pemantauan status kesehatan (*On Track*, *At Risk*, *Delayed*, *Completed*).
  - Pilihan visualisasi ganda: *Project Table View* dan *Project Card Grid* beserta kartu analitik metrik eksekutif.
- **Pembersihan & Keamanan Sistem:**
  - Pembersihan total 100% mock data/dummy JSON hardcode menjadi koneksi aktif database PostgreSQL via Express REST API.
  - Penonaktifan terproteksi untuk tab masa depan (*Doc*, *Reminder*, *Whiteboard*, *Dashboard*) dengan badge status *"Soon"*.
  - Auto-collapsing sidebar pada layar mobile (`< 768px`) dan layout modal responsif.

---

### **v1.9.0 (1–3 November 2026) — Advanced Event Notes, Tiptap WYSIWYG & Sharing**
- **Tiptap WYSIWYG Editor untuk Event Notes:**
  - Implementasi rich-text editor Tiptap dengan *sticky toolbar*, tabel dinamis yang dapat di-*resize*, kontrol ukuran gambar langsung di GUI, dan avatar peserta acara.
  - Kontrol visibilitas catatan acara (*Organizer Only* vs *Attendee View/Edit*) dengan proteksi maskot visual jika hak akses dibatasi.
- **Figma-Like Share Modal:**
  - Dialog berbagi acara interaktif dengan pencarian pengguna, hak akses visibilitas, dan salin tautan undangan instan (*copy link*).
- **Pengelompokan Navigasi Sidebar:**
  - Reorganisasi menu sidebar ke dalam grup terstruktur: *Workspace & Projects*, *Operasional*, dan *HRIS Kepegawaian*.
- **Resilience:**
  - Penanganan otomatis *vite chunk mismatch* pasca-deployment baru dan fallback halaman error.

---

### **v1.8.0 (25–31 Oktober 2026) — Teams-Style Calendar & Public Verification Portal**
- **Kalender Jadwal Gaya Microsoft Teams:**
  - Tampilan jadwal terintegrasi dengan opsi multi-view: *Monthly Grid*, *Day Timeline*, dan *Agenda List*.
  - Dialog konfirmasi kehadiran (RSVP), penugasan role peserta cepat, dan undangan email otomatis.
- **Portal Verifikasi Sertifikat Publik (`/verify/[serialNumber]`):**
  - Halaman verifikasi keaslian sertifikat magang yang dapat diakses publik tanpa login (*auth bypass*).
- **Sistem Kehadiran Hybrid (Teams-Style Presence):**
  - Indikator status kehadiran rekan kerja (*Active*, *Away*, *Busy*, *Offline*), pencarian kolega, dan modal profil publik.
- **Revamp Role-Based Access Control (RBAC):**
  - Tampilan manajemen role dan matriks permission dinamis dengan identitas visual KreaUI tabs.

---

### **v1.7.0 (8–21 September 2026) — RBAC Viewer Mode & Dynamic Leave Analytics**
- **Manajemen Riwayat Sertifikat:**
  - Komponen `CertificateHistoryTable` untuk melacak status penerbitan sertifikat digital karyawan/magang.
- **Analitik Cuti Dinamis:**
  - Penggantian kuota cuti statis dengan statistik saldo cuti dinamis, visualisasi sisa hari, dan auto-fill formulir pengajuan.
- **Read-Only Viewer Mode:**
  - Hak akses peninjau (*viewer mode*) untuk dokumentasi internal dan audit kepegawaian tanpa risiko manipulasi data.
- **KreaHCIS Telegram Bot Integration:**
  - Integrasi bot asisten Telegram untuk notifikasi absensi masuk/pulang dan monitoring kontrak.
- **Keamanan:**
  - Penerapan proteksi *global rate limiting* dan proteksi pemindai IP langsung (*direct IP scanner protection*).

---

### **v1.6.0 (8–31 Agustus 2026) — Certificate Studio & Mentorship Onboarding**
- **Interactive Certificate Studio:**
  - Studio desain sertifikat magang interaktif dengan live-preview, kustomisasi nomor sertifikat, serta ekspor PDF dan HTML-to-Image resolusi tinggi.
- **Workflow Aplikasi Mentor:**
  - Manajemen aplikasi mentor, filter status, lencana dinamis, aksi peninjauan ulang (*re-review*), dan pengiriman email konfirmasi (penerimaan/penolakan).
  - Formulir unggah dokumen *onboarding* mentor lengkap dengan panduan terintegrasi.
- **Modul Administrasi Absensi:**
  - Pemantauan rekapitulasi absensi harian dan status izin/sakit/hadir dengan filter tanggal presisi.
- **Keamanan:**
  - Sanitasi ketat input terhadap serangan XSS pada widget dan formulir, serta pengetatan regex validasi email.

---

### **v1.5.0 (24–27 Juli 2026) — HRIS Core Foundation & SSO Architecture**
- **Autentikasi Single Sign-On (SSO):**
  - Implementasi login SSO lintas aplikasi ekosistem Kreavoks dengan verifikasi state anti-CSRF dan whitelist redirect URL yang aman.
  - Composable `useAuth` dengan dukungan token refresh otomatis, manajemen sesi terproteksi, dan optimistic UI.
- **Infrastruktur Push Notification:**
  - Setup integrasi Firebase Cloud Messaging (FCM) untuk pengiriman notifikasi instan di peramban.
- **Manajemen Surat Resmi (`/letters`):**
  - Pembuatan dan pengarsipan surat resmi digital dengan penomoran otomatis dan template terstandarisasi.
- **Modul Dasar Kepegawaian:**
  - Inisialisasi master data karyawan, rekap kehadiran, alur cuti, dan pemrosesan payroll.
