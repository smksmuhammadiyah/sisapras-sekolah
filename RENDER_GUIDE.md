# Panduan Deployment Gratis di Render.com

Panduan ini akan membantu Anda meng-online-kan Backend SISAPRAS menggunakan layanan **Render.com (Free Tier)**.

Karena database PostgreSQL di Render tidak gratis selamanya (trial 30 hari), kita akan menggunakan layanan database gratis dari **Neon.tech** atau **Supabase**.

---

## Langkah 1: Siapkan Database Gratis (Neon.tech)

1.  Buka [Neon.tech](https://neon.tech) dan **Sign Up** (bisa pakai Google).
2.  Buat **Project Baru** (misal: `sisapras-db`).
3.  Pilih region yang dekat (misal: `Singapore`).
4.  Setelah jadi, Anda akan mendapatkan **Connection String**.
    *   Klik tombol "Copy" pada string koneksi (format: `postgres://user:pass@host/db...`).
    *   **Simpan URL ini**, kita akan pakai nanti.

> **Opsional**: Anda juga bisa pakai [Supabase.com](https://supabase.com) jika lebih suka. Caranya mirip, cari "Connection String" di menu Database Settings.

---

## Langkah 2: Deploy Backend ke Render

1.  Buka [Render.com](https://render.com) dan **Login** dengan GitHub.
2.  Klik tombol **New +** -> Pilih **Web Service**.
3.  Pilih opsi **Build and deploy from a Git repository**.
4.  Cari dan pilih repository `sisapras-sekolah`.
5.  **Konfigurasi Service** (PENTING! Jangan salah isi):
    *   **Name**: `sisapras-backend` (bebas).
    *   **Region**: `Singapore` (agar cepat).
    *   **Branch**: `main`.
    *   **Root Directory**: `backend` (⚠️ WAJIB DIISI! Karena kode ada di folder backend).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npx prisma generate && npm run build`
    *   **Start Command**: `npm run start:prod`
    *   **Instance Type**: `Free`.

6.  **Environment Variables**:
    Scroll ke bawah, klik tombol **Add Environment Variable**. Tambahkan satu per satu (sesuai file `.env` lokal Anda):

    | Key | Value |
    | :--- | :--- |
    | `DATABASE_URL` | Paste **Connection String** dari Langkah 1 (Neon/Supabase) |
    | `JWT_SECRET` | Isi dengan kode rahasia bebas (misal: `rahasiaku123`) |
    | `JWT_EXPIRATION` | `1d` |
    | `MAIL_HOST` | `smtp.gmail.com` |
    | `MAIL_USER` | Email Gmail sekolah/admin |
    | `MAIL_PASSWORD` | App Password Gmail (Bukan password login biasa) |
    | `MAIL_FROM` | `"SISAPRAS Notification" <email@sekolah.com>` |
    | `PORT` | `3000` (Opsional, Render biasanya otomatis set ini) |

7.  Klik tombol **Create Web Service**.

Render akan mulai mendownload, install, dan deploy. Tunggu sampai muncul tulisan **Live** (hijau).
URL Backend Anda akan terlihat di atas kiri (contoh: `https://sisapras-backend.onrender.com`).

---

## Langkah 3: Setup Database Schema

Karena database di Neon masih kosong, kita perlu "mengirim" struktur tabel kita ke sana.

**Cara Paling Mudah (Via Laptop Lokal):**
1.  Buka file `.env` di laptop (folder `backend`).
2.  Ubah `DATABASE_URL` sementara menjadi URL Neon tadi.
3.  Jalankan perintah ini di terminal VSCode:
    ```bash
    cd backend
    npx prisma migrate deploy
    ```
4.  (Opsional) Kembalikan isi file `.env` ke localhost jika mau develop offline lagi.

---

## Langkah 4: Sambungkan Frontend (Vercel)

Sekarang Backend sudah online, kita update Frontend agar bicara ke Backend yang baru.

1.  Buka Dashboard **Vercel** -> Project Frontend Anda.
2.  Masuk ke **Settings** -> **Environment Variables**.
3.  Edit variable `NEXT_PUBLIC_API_URL`.
4.  Isi dengan URL Render tadi (contoh: `https://sisapras-backend.onrender.com`).
    *   *Pastikan tidak ada garis miring `/` di belakang URL*.
5.  Masuk ke tab **Deployments**, lalu **Redeploy** (atau push commit pancingan kosong ke GitHub) agar perubahan ini terasa.

---

## 🎉 Selesai!

*   Web Frontend (Vercel) sekarang bisa diakses siapa saja.
*   Data tersimpan aman di Neon (Cloud Database).
*   Backend berjalan di Render.

**Catatan Render Free Tier:**
*   Server akan "tidur" (sleep) jika tidak diakses selama 15 menit.
*   Saat pertama kali akses setelah tidur, web akan loading lama (30-60 detik). Ini wajar untuk versi gratis.
