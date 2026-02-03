# Product Requirements Document (PRD)
## Sistem Informasi Manajemen Sarpras (SIM-SAPRAS)

## 1. Overview
SIM-SAPRAS adalah aplikasi web internal untuk mendigitalisasi pengelolaan sarana dan prasarana sekolah, meliputi inventaris aset, audit kondisi, manajemen stok, serta proses pengadaan barang. Sistem ini ditujukan untuk meningkatkan efisiensi operasional, akurasi data, dan kemudahan pelaporan.

## 2. Target User
- Wakasek Sarpras (Admin)
- Toolman / Staff Sarpras
- Guru / Kaprog
- Kepala Sekolah (viewer laporan)

## 3. Goals
- Menyediakan sistem inventaris terpusat
- Mempermudah audit dan pemeliharaan aset
- Mendukung pengadaan berbasis prioritas dan data
- Menghasilkan laporan resmi secara otomatis

## 4. Functional Requirements
- CRUD aset dan ruangan
- Auto-generate kode inventaris
- QR Code untuk identifikasi aset
- Audit digital berbasis mobile
- Histori servis dan kondisi
- FIFO stok barang habis pakai
- Sistem usulan dan approval
- Export laporan PDF dan Excel

## 5. Non-Functional Requirements
- Mobile-first responsive UI
- Role-based access control
- Keamanan data dan autentikasi
- Cloud-ready dan portable
- Backup dan audit log

## 6. Technical Constraints
- Frontend: React / Next.js
- Backend: Node.js (Express / NestJS)
- Database: PostgreSQL
- Tahun pertama dapat menggunakan Supabase PostgreSQL
- Sistem harus mudah dimigrasikan ke VPS atau on-premise

## 7. Success Metrics
- 100% aset tercatat digital
- Audit dapat dilakukan tanpa kertas
- Laporan dapat dihasilkan < 1 menit
- User non-teknis dapat menggunakan sistem tanpa pelatihan intensif
