# FITUR TAMBAHAN WAJIB (DI LUAR BRIEF UTAMA)

---

## 1️⃣ Backup & Restore Data (KRUSIAL)

### ✅ Backup  
**Harus ada:**  
- Backup otomatis (bulanan / mingguan)  
- Backup manual (via admin)  

**Format:**  
- SQL dump  
- JSON snapshot (opsional)  

**Best practice:**  
- Backup di luar database utama  
- Simpan di:  
  - Object storage (S3-compatible / Supabase Storage / Cloudflare R2)  

**💡 UI:**  
- Status backup terakhir + tombol “Backup Sekarang”

### ♻️ Restore  
**Harus aman & terbatas:**  
- Hanya admin  
- Konfirmasi berlapis  
- Pilih tanggal backup  

**💡 Catatan penting:**  
Restore tidak overwrite langsung, tapi:  
`staging restore → konfirmasi → apply`

---

## 2️⃣ Audit Log & Activity Log (TAPI RINGAN)

### ❌ Kesalahan Umum  
- Semua log masuk ke DB utama  
- Setiap klik di-log  
👉 Ini bikin DB berat & mahal

### ✅ Solusi Ideal  
**Jenis Log:**  
- **Audit Log (Penting)**  
  - Login / logout  
  - CRUD data penting  
  - Approval / penolakan  
  - Restore data  
- **Activity Log (Ringan)**  
  - View dashboard  
  - Download laporan  

### 🔧 Implementasi Aman  
- **Audit Log** → Database (tabel terpisah, index minimal)  
- **Activity Log** →  
  - File log  
  - atau Redis / queue  
  - atau analytics tool (PostHog / Plausible)  

**💡 Retention:**  
- Audit log: 1–3 tahun  
- Activity log: 30–90 hari

---

## 3️⃣ Forgot Password (WAJIB, Tapi Bedakan Workflow)

### 👑 Admin / Super Admin  
**Workflow:**  
1. Input email  
2. Link reset (token, 15 menit)  
3. Set password baru  
4. Notifikasi email  

**🔐 Extra:**  
- Log aktivitas reset  
- Rate limit  

### 👨‍🏫 Guru / Kaprog / Staff  
**Workflow Lebih Aman:**  

**Opsi A (Direkomendasikan Sekolah):**  
- Lupa password → ajukan reset  
- Admin menyetujui  
- Sistem kirim link reset  

**Opsi B (Mandiri tapi dibatasi):**  
- Reset otomatis  
- Password baru wajib diganti saat login pertama  

**💡 Ini realistis untuk lingkungan sekolah.**

---

## 4️⃣ Role & Permission Management (HALUS TAPI PENTING)

- Bukan cuma role besar, tapi:  
  - Hak akses granular  

**Contoh:**  
- Guru boleh edit pengajuan sendiri  
- Tidak boleh hapus data  
- Kaprog bisa lihat rekap jurusan  

**💡 UI:**  
- Checklist permission  
- Bukan dropdown doang

---

## 5️⃣ Soft Delete & Recovery

❗ Jangan Hard Delete  
- Data aset sekolah tidak boleh benar-benar hilang  

**Solusi:**  
- Soft delete (`deleted_at`)  
- Halaman: “Data Terhapus”  
- Opsi: Restore / Permanent Delete

---

## 6️⃣ Arsip Jangka Panjang

**Extra:**  
- Arsip tahunan (read-only)  
- Tidak ikut diubah tahun berikutnya

---

## 7️⃣ Maintenance Mode & Banner Informasi

### Maintenance Mode  
- Aktifkan via admin  
- Role tertentu tetap bisa masuk  
- Pesan custom  

### Banner Sistem  
- Pengumuman penting  
- Bukan popup ganggu

---

## 8️⃣ Notifikasi (Bukan Spam)

**Channel:**  
- In-app notification  
- Email (opsional)  

**Event:**  
- Pengajuan disetujui / ditolak  
- Stok kritis  
- Backup berhasil / gagal  

**💡 Notifikasi harus bisa diatur per role.**

---

## 9️⃣ Performance Guard (Anti Lemot)

- Pagination wajib  
- Lazy load  
- Debounce search  
- Index DB  

**💡 Jangan pakai:**  
- `SELECT *`  
- Query tanpa limit

---

## 🔟 Security Minimum Standard

- Rate limit login  
- Session expiration  
- CSRF protection  
- Password hashing kuat  
- Token expiration

# 🧠 FITUR & ASPEK TAMBAHAN (LEVEL LANJUT)

---

## 1️⃣ Data Governance & Siklus Tahun Ajaran

**Masalah nyata di sekolah:**  
- Data bercampur antar tahun  
- Aset lama & baru jadi satu  

**Solusi:**  
- Tahun Ajaran aktif  
- Data terikat tahun ajaran  
- Arsip otomatis saat ganti tahun  

**💡 UI:** dropdown “Tahun Aktif” di admin

---

## 2️⃣ Import Data (Excel / CSV) – BUKAN CUMA EXPORT

Sekolah sering migrasi data lama.

**Wajib:**  
- Import aset  
- Import ruangan  
- Validasi sebelum simpan  
- Preview data  

**💡 Error baris harus jelas.**

---

## 3️⃣ Approval Chain (Bukan 1 Level)

**Realistis:**  
`Guru → Kaprog → Wakasek → Kepala Sekolah`

**Fitur:**  
- Approval bertahap  
- Catatan penolakan  
- History keputusan

---

## 4️⃣ Feature Toggle / Flag

**Supaya:**  
- Bisa aktifkan fitur bertahap  
- Testing aman  
- Tidak ganggu user lain  

**💡 Bisa berbasis role atau sekolah.**

---

## 5️⃣ Offline Awareness (Bukan Offline Mode)

Karena internet sekolah kadang… ya kamu tau 😅

**Minimal:**  
- Deteksi koneksi  
- Banner “koneksi terputus”  
- Queue request penting

---

## 6️⃣ Error Handling yang Manusiawi

**❌ Jangan:**  
- “Internal Server Error”

**✅ Harus:**  
- Pesan sopan  
- Bisa retry  
- Ada kode error

---

## 6️⃣ System Health & Monitoring

Admin perlu tahu sistem sehat atau tidak.

**Dashboard kecil:**  
- Status API  
- Last backup  
- Error hari ini

---

## 7️⃣ Dokumentasi Internal (BUKAN README)

**Untuk:**  
- Admin baru  
- Pergantian personel  

**Isi:**  
- Alur sistem  
- SOP reset password  
- SOP backup

---

## 8️⃣ Legal & Compliance (Ringan tapi Penting)

**Kebijakan data**  
**Retensi data**  
**Hak akses**  

**💡 Terutama kalau audit.**

---

## 9️⃣ UX Kecil Tapi Berasa

Hal-hal kecil yang bikin user betah:  
- Autosave draft  
- Undo delete (5–10 detik)  
- Empty state informatif  
- Shortcut keyboard (admin)