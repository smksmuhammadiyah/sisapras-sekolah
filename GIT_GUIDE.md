# 🌿 Panduan Git & Workflow Pengembangan (Feature Branching)

Dokumen ini menjelaskan cara bekerja dengan Git agar fitur baru bisa dikembangkan dengan aman tanpa merusak kode utama (`main`).

---

## 🚀 Prinsip Utama: "Safe Development"

Jangan melakukan perubahan besar langsung di branch `main`. Gunakan **Feature Branches** untuk setiap fitur atau perbaikan baru.

### 1. Membuat Fitur Baru (Staging/Feature)
Saat ingin menambah fitur (misalnya: "Export PDF"), jangan langsung koding di `main`. Buat branch baru:

```bash
# Pastikan berada di main dan kode terbaru sudah ditarik
git checkout main
git pull origin main

# Buat branch baru untuk fitur tersebut
git checkout -b feature/export-pdf
```
*Sekarang Anda berada di branch `feature/export-pdf`. Semua perubahan di sini tidak akan terlihat di `main`.*

### 2. Bekerja di Branch Fitur
Silakan koding, buat file, atau hapus sesuka hati. Jika sudah selesai:

```bash
git add .
git commit -m "feat: menambah fungsi export pdf"
git push origin feature/export-pdf
```

### 3. Cara Menggabungkan (Merge) ke Main
Jika fitur sudah dites dan "Oke Tidak Ada Cacat", gabungkan ke `main`:

```bash
# Pindah kembali ke main
git checkout main

# Tarik kode terbaru lagi (antisipasi kalau ada perubahan lain)
git pull origin main

# Gabungkan fitur tadi
git merge feature/export-pdf

# Push ke repository pusat
git push origin main
```

### 4. Jika Fitur Rusak & Ingin Dihapus
Jika ternyata fiturnya gagal atau bos ingin membatalkannya total tanpa merusak `main`:

```bash
# Pindah ke main
git checkout main

# Hapus branch fitur yang rusak tadi (pakai -D besar untuk paksa hapus)
git branch -D feature/export-pdf
```
*Hasilnya: Folder dan file bos akan kembali persis seperti sebelum fitur itu dibuat. Branch `main` tetap bersih.*

---

## 🛠 Konsep "Staging" Branch
Jika bos ingin punya satu tempat "Uji Coba" yang permanen sebelum masuk ke `main`, bos bisa buat branch `staging`:

1.  **Main**: Kode yang sudah 100% stabil (Produksi).
2.  **Staging**: Tempat semua fitur dikumpulkan untuk dites bareng-bareng.
3.  **Feature**: Tempat koding spesifik per-fitur.

**Alurnya:** `Feature` -> Gabung ke `Staging` (Tes) -> Jika Oke, Gabung ke `Main`.

---

## 💡 Tips Antigravity
> [!TIP]
> Kalau bos ragu saat ingin mencoba sesuatu yang ekstrem, cukup ketik:
> **"Tolong buatkan branch baru untuk percobaan [nama_fitur]"**
> Saya akan otomatis buatkan dan bos bisa bereksperimen dengan aman!
