# 🏫 SISAPRAS - Sistem Informasi Sarana Prasarana Sekolah

![Status: Development](https://img.shields.io/badge/Status-Active_Development-green)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-blue)
![Tech: Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)
![Tech: NestJS](https://img.shields.io/badge/Backend-NestJS-red)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

Selamat datang di repositori **SISAPRAS**, sebuah solusi enterprise-grade untuk manajemen inventaris dan sarana prasarana di lingkungan pendidikan. Aplikasi ini dirancang untuk menggantikan pencatatan manual (Excel/Buku) dengan sistem digital yang terintegrasi, transparan, dan dapat diakses secara real-time.

---

## 📑 Daftar Isi

1.  [Tentang Proyek](#-tentang-proyek)
2.  [Arsitektur Sistem](#-arsitektur-sistem)
3.  [Fitur Unggulan](#-fitur-unggulan)
    -   [Manajemen Aset](#1-manajemen-aset-sarcab)
    -   [Pengadaan Barang](#2-pengadaan-barang-procurement)
    -   [Pemeliharaan & Service](#3-pemeliharaan--service)
    -   [Sistem Audit](#4-sistem-audit-stock-opname)
    -   [Keamanan & Email](#5-keamanan--notifikasi)
4.  [Teknologi (Tech Stack)](#-teknologi-tech-stack)
5.  [Struktur Direktori](#-struktur-direktori)
6.  [Panduan Instalasi & Setup](#-panduan-instalasi--setup)
7.  [Konfigurasi Environment](#-konfigurasi-environment-env)
8.  [Panduan Penggunaan (Workflow)](#-panduan-penggunaan-workflow)
9.  [Integrasi & Dokumentasi Tambahan](#-integrasi--dokumentasi-tambahan)
    -   [Setup Email (Gmail)](#setup-email)
    -   [Testing & QA](#testing--qa)
10. [Troubleshooting](#-troubleshooting)
11. [Roadmap Pengembangan](#-roadmap-pengembangan)
12. [Kontribusi & Lisensi](#-kontribusi--lisensi)

---

## 📖 Tentang Proyek

**SISAPRAS** lahir dari kebutuhan sekolah untuk mengelola ribuan aset (meja, kursi, komputer, proyektor, dll) yang seringkali luput dari pengawasan. Kehilangan aset, duplikasi pembelian, dan kesulitan melacak riwayat perbaikan adalah masalah utama yang diselesaikan oleh sistem ini.

**Visi:** Menciptakan ekosistem sarana prasarana yang akuntabel dan efisien.
**Misi:**
*   **Digitalisasi**: Mengubah data fisik menjadi data digital yang mudah dicari.
*   **Efisiensi**: Memangkas waktu birokrasi pengadaan barang.
*   **Transparansi**: Semua stakeholder bisa memantau status aset dan pengajuan.

---

## 🏗 Arsitektur Sistem

Sistem ini menggunakan arsitektur **Monorepo** (dipisah secara logis namun dalam satu repositori kerja) atau **Separated Frontend-Backend** pattern.

```mermaid
graph TD
    User[User / Browser] -->|HTTP/HTTPS| FE[Frontend: Next.js]
    FE -->|REST API| BE[Backend: NestJS]
    BE -->|Query| DB[(Database: PostgreSQL)]
    BE -->|SMTP| Mail[Email Server: Gmail]
    BE -->|Cron| Job[Scheduled Tasks: Auto Prune]
```

*   **Frontend**: Bertindak sebagai UI/UX layer, menangani interaksi user, validasi form, dan state management.
*   **Backend**: Bertindak sebagai Logic layer, menangani otentikasi, otorisasi, bisnis logic, cron jobs, dan komunikasi database.
*   **Database**: PostgreSQL dipilih karena kehandalan Relational Data Integrity dan dukungan enum/jsonb.

---

## 🌟 Fitur Unggulan

Berikut adalah breakdown mendalam mengenai kapabilitas SISAPRAS.

### 1. Manajemen Aset (Sarcab)
Inti dari aplikasi ini. Memungkinkan pencatatan detail setiap barang.
*   **CRUD Aset**: Create, Read, Update, Delete (Soft Delete) data barang.
*   **Detail Spesifikasi**: Mencatat Merk, Tahun Pembelian, Harga, Asal Usul (BOS/Hibah), dan Lokasi.
*   **Kodefikasi Otomatis**: Sistem men-generate kode unik aset (Contoh: `SMK/ELEC/2026/015`) untuk memudahkan pelabelan.
*   **Filtering Canggih**: Cari barang berdasarkan kondisi (`BAIK`, `RUSAK RINGAN`, `RUSAK BERAT`), tahun, atau ruangan.

### 2. Pengadaan Barang (Procurement)
Modul untuk mengajukan permintaan pembelian barang baru.
*   **Role-Based Approval**:
    *   **Guru/Staff**: Mengajukan usulan.
    *   **Kaprog (Kepala Program)**: Validasi teknis (apakah barang sesuai spesifikasi jurusan?).
    *   **Wakasek/Admin**: Persetujuan anggaran dan finalisasi.
*   **Real-time Status**: Pengaju bisa melihat status usulan (`PENDING`, `REVIEW`, `APPROVED`, `REJECTED`).
*   **Estimasi Anggaran**: Input harga satuan dan total otomatis terhitung.

### 3. Pemeliharaan & Service
Mencatat riwayat kesehatan barang.
*   **Tiket Service**: Pelaporan kerusakan oleh user, ditindaklanjuti oleh teknisi.
*   **Biaya Perbaikan**: Mencatat pengeluaran sekolah untuk maintenance.
*   **Riwayat**: Setiap aset memiliki "Kartu Riwayat" (kapan beli, kapan rusak, kapan diservice).

### 4. Sistem Audit (Stock Opname)
Fitur untuk verifikasi fisik berkala.
*   **Sesi Audit**: Admin membuka sesi audit tahunan/semesteran.
*   **Checklist**: Petugas mencentang barang yang *ada* dan memvalidasi kondisinya.
*   **Laporan Selisih**: Sistem otomatis menghitung barang yang hilang atau tidak ditemukan.

### 5. Keamanan & Notifikasi
*   **JWT Authentication**: Login aman dengan Token yang memiliki masa berlaku.
*   **Password Encryption**: Password di-hash menggunakan `bcrypt`.
*   **Email Notifications**: Integrasi SMTP (Gmail) untuk notifikasi real-time ke email user saat status pengadaan berubah.
*   **Forgot Password**: Mekanisme mandiri untuk reset password via email token.

---

## � Teknologi (Tech Stack)

Kami memilih teknologi modern untuk menjamin *maintainability* jangka panjang.

| Kategori | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | SEO friendly, Server Components, dan performa navigasi cepat. |
| **Styling** | Tailwind CSS | Pengembangan UI cepat dengan utility classes. |
| **UI Lib** | Shadcn/UI | Komponen yang *accessible*, cantik, dan mudah kustomisasi. |
| **Icons** | Lucide React | Ikon vektor ringan dan konsisten. |
| **Backend** | NestJS | Framework Node.js paling robust, arsitektur modular (seperti Angular). |
| **ORM** | Prisma | Type-safe database query, meminimalisir runtime error SQL. |
| **Database** | PostgreSQL | Standar industri untuk RDBMS open-source. |
| **Tools** | Git, Docker (Optional) | Version control dan deployment. |

---

## 📂 Struktur Direktori

Struktur folder proyek ini diorganisir untuk memisahkan kepentigan (Separation of Concerns).

```plaintext
sisapras/
├── backend/                # Server-side Application
│   ├── prisma/            # Database Schema & Migrations
│   │   └── schema.prisma  # Definisi Tabel Database
│   ├── src/
│   │   ├── auth/          # Modul Autentikasi (Login/Register)
│   │   ├── users/         # Manajemen User
│   │   ├── assets/        # Logika Bisnis Aset
│   │   ├── procurement/   # Logika Bisnis Pengadaan
│   │   ├── mail/          # Service Email (Nodemailer)
│   │   ├── cron/          # Scheduled Tasks (Cleanup)
│   │   └── ...
│   ├── test/              # E2E Tests
│   └── .env               # Environment Variables Backend
│
├── frontend/               # Client-side Application
│   ├── src/
│   │   ├── app/           # Next.js App Router (Pages)
│   │   │   ├── dashboard/ # Halaman Admin/User
│   │   │   ├── (auth)/    # Halaman Login
│   │   │   └── ...
│   │   ├── components/    # Reusable UI Components
│   │   │   ├── ui/        # Shadcn Base Components
│   │   │   └── ...
│   │   ├── hooks/         # Custom React Hooks (useFormPersist, etc)
│   │   ├── lib/           # Utilities (API axios instance)
│   │   └── context/       # React Context Providers
│   └── ...
│
├── GMAIL_SETUP.md          # Panduan Khusus Email
├── TESTING.md              # Panduan Testing
└── README.md               # File ini
```

---

## � Panduan Instalasi & Setup

Ikuti langkah ini untuk menjalankan aplikasi di komputer lokal (Localhost).

### Prasyarat System
1.  **Node.js**: Versi 18.x atau lebih baru (`node -v` untuk cek).
2.  **PostgreSQL**: Database server sudah berjalan (`psql --version`).
3.  **Git**: Untuk clone repositori.

### Langkah 1: Persiapan Source Code
Pastikan Anda telah mengunduh atau mengekstrak folder source code proyek ini.

```bash
cd sisapras
```

### Langkah 2: Setup Backend
Konfigurasi server dan database.

1.  Masuk folder backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Setup Environment Variable:
    *   Duplicate file `.env.example` (jika ada) atau buat file `.env` baru.
    *   Isi konfigurasi (Lihat [Bagian Konfigurasi Environment](#-konfigurasi-environment-env)).
4.  Migrasi Database:
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```
5.  Jalankan Server (Development Mode):
    ```bash
    npm run start:dev
    ```
    *Output: `Nest application successfully started` di port 3000.*

### Langkah 3: Setup Frontend
Konfigurasi antarmuka pengguna.

1.  Buka terminal baru, masuk folder frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Jalankan Client:
    ```bash
    npm run dev
    ```
4.  Buka Browser:
    *   Akses `http://localhost:3000` (atau port yang tertera di terminal).

---

## ⚙️ Konfigurasi Environment (.env)

Aplikasi membutuhkan variabel lingkungan berikut agar berjalan dengan benar.

**File: `backend/.env`**

```properties
#--- Database Connection ---
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password123@localhost:5432/sisapras?schema=public"

#--- Security ---
# Secret Key untuk generate JWT Token. Ganti dengan string acak yang panjang.
JWT_SECRET="rahasia_super_aman_jangan_disebar"
JWT_EXPIRATION="12h"

#--- Email System (Gmail SMTP) ---
# Diperlukan untuk fitur Notifikasi & Lupa Password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=email.sekolah@gmail.com
# Gunakan App Password, BUKAN password login biasa!
MAIL_PASSWORD=abcd1234efgh5678 
MAIL_FROM="Admin Sarpras <email.sekolah@gmail.com>"
```

**File: `frontend/.env.local`** (Opsional)

```properties
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## � Panduan Penggunaan (Workflow)

### skenario 1: Menambah Aset Baru (Admin)
1.  Login sebagai Admin.
2.  Buka menu **Aset**.
3.  Klik tombol **+ Tambah Aset**.
4.  Isi formulir (Nama, Ketegori, dll).
    *   *Fitur Autosave aktif*: Jika Anda tidak sengaja menutup tab, isian form akan tetap ada saat dibuka kembali.
5.  Klik **Simpan**.
6.  Aset muncul di tabel dengan kode otomatis.

### skenario 2: Mengajukan Pengadaan (Guru)
1.  Login sebagai Guru.
2.  Buka menu **Pengadaan**.
3.  Klik **Buat Usulan Baru**.
4.  Masukkan judul usulan (misal: "Penggantian Proyektor Lab A").
5.  Tambah item barang (Nama barang, jumlah, estimasi harga).
6.  Submit. Status awal: `PENDING`.
7.  Tunggu notifikasi email saat Admin menyetujui.

### skenario 3: Membatalkan Hapus (Undo)
1.  Di halaman Aset/Pengadaan/Ruangan, klik icon **Hapus (Tong Sampah)**.
2.  Muncul notifikasi Toast di pojok bawah: *"Data berhasil dihapus"*.
3.  Terdapat tombol **BATALKAN** pada notifikasi tersebut.
4.  Klik **BATALKAN** dalam waktu 5 detik untuk mengembalikan data.
5.  Jika dibiarkan, data masuk ke *Soft Delete*.
6.  Sistem Cron Job akan menghapus permanen data Soft Delete tersebut setelah 3 hari.

---

## 🔗 Integrasi & Dokumentasi Tambahan

Dokumentasi teknis lebih lanjut dipisahkan ke dalam dokumen khusus untuk menjaga kerapian.

### Setup Email
Panduan lengkap cara mengaktifkan fitur email menggunakan Gmail (termasuk cara generate App Password Google):
👉 **Baca: [GMAIL_SETUP.md](./GMAIL_SETUP.md)**

### Testing & QA
Panduan cara menjalankan Unit Test, E2E Test, dan skenario Pengetesan Manual (UAT):
👉 **Baca: [TESTING.md](./TESTING.md)**

---

## 🔧 Troubleshooting

Masalah umum yang sering terjadi dan solusinya.

### 1. Error: `PrismaClientInitializationError`
*   **Penyebab**: Koneksi database gagal atau Schema berubah tapi client belum di-update.
*   **Solusi**:
    *   Cek apakah PostgreSQL berjalan.
    *   Jalankan `npx prisma generate` di folder backend.

### 2. Eror: Fitur Email tidak jalan / Timeout
*   **Penyebab**: Koneksi SMTP diblokir atau App Password salah.
*   **Solusi**:
    *   Pastikan `MAIL_PASSWORD` di `.env` adalah App Password Google 16 digit, bukan password email biasa.
    *   Cek firewall/koneksi internet server.

### 3. Error: `Cannot find module ...`
*   **Penyebab**: `npm install` belum dijalankan setelah pull update terbaru.
*   **Solusi**: Jalankan `npm install` kembali di folder backend/frontend.

---

## 🗺 Roadmap Pengembangan

Kami terus mengembangkan SISAPRAS. Berikut rencana fitur mendatang (Phase 13++):

- [ ] **Mobile App**: Versi React Native untuk scan QR Code aset via HP.
- [ ] **Barcode Printing**: Generate PDF label aset siap cetak.
- [ ] **Analitik Lanjut**: Grafik depresiasi nilai aset per tahun.
- [ ] **Multi-School Support**: Arsitektur SaaS untuk menangani banyak sekolah sekaligus.

---

## 🤝 Support & Maintenance

Aplikasi ini dikembangkan secara privat (Closed Source) sesuai permintaan klien.
Untuk bantuan teknis, perbaikan bug, atau permintaan fitur tambahan, silakan hubungi tim pengembang secara langsung.

**Pengembang:**
*   [Nama Developer / Tim Anda]
*   Kontak: [email/kontak anda]

---
**Made with ❤️ using Next.js & NestJS**
Copright © 2026 SISAPRAS Team.
