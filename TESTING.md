# Panduan Testing SISAPRAS

Dokumen ini menjelaskan prosedur pengujian (testing) untuk aplikasi SISAPRAS, mencakup Unit Test, Integration Test, dan Manual Testing untuk fitur-fitur kritis.

## 📋 Daftar Isi
1. [Prasyarat](#prasyarat)
2. [Backend Testing](#backend-testing)
    - [Unit Testing](#unit-testing)
    - [E2E Testing](#e2e-testing)
3. [Frontend Testing](#frontend-testing)
4. [Testing Manual (UAT)](#testing-manual-uat)
5. [Troubleshooting Test](#troubleshooting-test)

---

## 🏗 Prasyarat

Sebelum menjalankan test otomatis, pastikan:
1.  Node.js (v18+) terinstall.
2.  PostgreSQL berjalan (untuk E2E test).
3.  Dependencies terinstall (`npm install` di folder `backend` dan `frontend`).
4.  File `.env.test` telah dikonfigurasi (jika menggunakan environment khusus test).

---

## 🔙 Backend Testing (NestJS)

Backend menggunakan **Jest** sebagai framework testing utama.

### 🧪 Unit Testing

Unit test berfokus pada pengujian method individu di dalam Service dan Controller tanpa menyentuh database asli (menggunakan Mocking).

**Lokasi File:** `src/**/*.spec.ts`

**Cara Menjalankan:**
```bash
cd backend
# Jalankan semua unit test
npm run test

# Jalankan dalam mode watch (dev)
npm run test:watch

# Lihat coverage code
npm run test:cov
```

**Cakupan Unit Test Utama:**
- `AuthService`: Validasi login, register, hash password.
- `ProcurementService`: Logika approval (Kaprog vs Admin), perhitungan budget.
- `AssetsService`: Generasi kode aset otomatis, filter data.

### 🔄 E2E (End-to-End) Testing

E2E test menguji alur API secara penuh dari request HTTP hingga respon, biasanya menggunakan database test.

**Lokasi File:** `test/**/*.e2e-spec.ts`

**Konfigurasi Database Test:**
Pastikan Anda memiliki database terpisah (misal: `sisapras_test`) agar data development tidak terhapus.

**Cara Menjalankan:**
```bash
cd backend
# Jalankan E2E test
npm run test:e2e
```

---

## 🖥 Frontend Testing

Frontend belum memiliki automated test suite yang ekstensif (seperti Cypress/Jest DOM), namun fokus utama adalah **Linting** dan **Build Check**.

**Linting:**
```bash
cd frontend
npm run lint
```

**Build Verification:**
```bash
cd frontend
npm run build
```
*Jika build sukses, berarti tidak ada error TypeScript fatal.*

---

## 🕵️ Testing Manual (UAT - User Acceptance Test)

Gunakan checklist ini untuk memverifikasi fitur sebelum release.

### 1. Skenario Autentikasi
- [ ] Login sebagia Admin (Sukses).
- [ ] Login sebagai User biasa (Sukses).
- [ ] Login dengan password salah (Gagal + Pesan Error).
- [ ] **Lupa Password**: Request link -> Cek Email -> Klik Link (Mock) -> Reset Password.

### 2. Skenario Aset
- [ ] **Tambah Aset**: Input lengkap -> Simpan -> Cek di Tabel.
- [ ] **Validasi**: Input kosong -> Muncul pesan "Required".
- [ ] **Autosave**: Ketik nama aset -> Refresh halaman -> Nama aset masih ada.
- [ ] **Hapus**: Klik hapus -> Muncul Toast -> Klik "Undo" -> Aset kembali.
- [ ] **Hapus Permanen**: Klik hapus -> Tunggu 5 detik -> Cek database `deletedAt` terisi.

### 3. Skenario Pengadaan (Procurement)
- [ ] **Flow Approval**:
    1.  User `Guru` buat usulan.
    2.  Login `Kaprog` -> Approve (Status jadi `REVIEW_WAKASEK`).
    3.  Login `Admin` -> Approve (Status jadi `APPROVED`).
    4.  Cek Email Notifikasi di inbox User `Guru`.

### 4. Skenario Reliability
- [ ] **Offline**: Matikan WiFi/LAN -> Muncul Banner "Koneksi Terputus".
- [ ] **Auto-Prune**: (Backend) Jalankan cron secara manual atau tunggu 3 hari (ganti jam sistem) -> Aset soft-deleted hilang.

---

## 🛠 Troubleshooting Test

### Error: `connect ECONNREFUSED 127.0.0.1:5432`
*Database tidak berjalan.*
**Solusi**: Start PostgreSQL service atau Docker container.

### Error: `PrismaClientInitializationError`
*Schema berubah tapi client belum di-generate.*
**Solusi**:
```bash
cd backend
npx prisma generate
```

### Error: `Cannot find module ...`
*Dependency baru belum terinstall.*
**Solusi**:
```bash
npm install
```
