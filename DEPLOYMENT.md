# Panduan Deployment (Online)

Dokumen ini menjelaskan cara meng-online-kan aplikasi SISAPRAS agar bisa diakses dari internet.

## 🧱 Arsitektur Deployment

Aplikasi ini terdiri dari dua bagian yang berjalan terpisah:
1.  **Backend (NestJS + PostgreSQL)**: Membutuhkan server yang bisa menjalankan Node.js terus menerus (Long-running process).
2.  **Frontend (Next.js)**: Bisa dideploy sebagai serverless function atau static site.

---

## 1️⃣ Deploy Backend & Database

Pilihan terbaik tergantung budget. Railway memang paling mudah, tapi berbayar setelah trial.

### Opsi Gratis / Freemium (Cocok untuk Percobaan)
1.  **Backend**: [Render.com](https://render.com) (Free Tier, server tidur jika tidak dipakai 15 menit), atau [Koyeb](https://koyeb.com) (Free Tier cukup oke).
2.  **Database**: [Neon.tech](https://neon.tech) atau [Supabase](https://supabase.com) (Serverless Postgres Gratis 500MB).

### Opsi Berbayar Murah & Stabil (Rekomendasi untuk Sekolah)
Jika ini untuk dipakai sekolah sehari-hari, sangat disarankan menggunakan **VPS Lokal Indonesia**.
*   **Kenapa?**: Lebih cepat (koneksi lokal), data berdaulat di Indonesia, harga fix (tidak bengkak), dan kontrol penuh.
*   **Provider**: IDCloudHost, Biznet Gio, atau Cloudkilat.
*   **Biaya**: Mulai dari Rp 50.000 - Rp 80.000 per bulan.

---

### Opsi A: Menggunakan VPS (Murah & Kontrol Penuh)

### Opsi A: Menggunakan VPS (Murah & Kontrol Penuh)
Rekomendasi Provider: DigitalOcean, IDCloudHost, Biznet Gio (mulai Rp 50rb/bulan).

1.  **Sewa VPS** dengan OS Ubuntu 22.04 LTS.
2.  **Install Software**:
    ```bash
    # Update & Install Node.js, Git, PM2
    sudo apt update
    sudo apt install nodejs npm git postgresql postgresql-contrib
    sudo npm install -g pm2 @nestjs/cli
    ```
3.  **Clone Repo**:
    ```bash
    git clone https://github.com/smksmuhammadiyah/sisapras-sekolah.git /var/www/sisapras
    ```
4.  **Setup Database**:
    *   Buat database PostgreSQL dan user baru di VPS.
5.  **Setup Backend**:
    ```bash
    cd /var/www/sisapras/backend
    npm install
    cp .env.example .env
    # Edit .env, isi DATABASE_URL dengan kredensial VPS
    npm run build
    npx prisma migrate deploy
    ```
6.  **Jalankan dengan PM2**:
    ```bash
    pm2 start dist/main.js --name sisapras-backend
    pm2 save
    ```

### Opsi B: Menggunakan Railway / Render (Mudah)
1.  Upload repo ke GitHub.
2.  Buka [Railway.app](https://railway.app/).
3.  Pilih "New Project" -> "Deploy from GitHub repo".
4.  Tambahkan Service Database PostgreSQL di Railway.
5.  **PENTING**: Masuk ke **Settings** Service Backend -> **General** -> **Root Directory**, isi dengan `/backend`. (Jika tidak, deploy akan gagal karena file package.json tidak ditemukan di root).
6.  Set Environment Variables (`DATABASE_URL`, `JWT_SECRET`, dll) di dashboard Railway.
7.  Railway akan otomatis mendeteksi NestJS dan menjalankannya.

---

## 2️⃣ Deploy Frontend (Next.js)

Pilihan terbaik: **Vercel** (Gratis & Sangat Cepat).

1.  Push kode ke GitHub.
2.  Buka [Vercel.com](https://vercel.com) dan login dengan akun GitHub.
3.  Klik "Add New Project" -> Import repo `sisapras-sekolah`.
4.  Konfigurasi Project:
    *   **Root Directory**: Pilih `frontend` (PENTING!).
    *   **Environment Variables**:
        *   `NEXT_PUBLIC_API_URL`: Isi dengan URL Backend Anda (contoh: `https://api.sisapras.sekolah.sch.id` atau URL Railway `https://backend-production.up.railway.app`).
5.  Klik **Deploy**.

---

## 3️⃣ Integrasi Frontend & Backend

Agar Frontend bisa menghubungi Backend:
1.  Pastikan URL Backend (API) sudah aktif dan bisa diakses (masuk ke browser, coba buka `https://url-backend.com/health`).
2.  Pastikan konfigurasi `NEXT_PUBLIC_API_URL` di Vercel sudah benar tanpa slash di belakang (contoh: `https://api.myschool.com`).
3.  **CORS**: Jika Backend dan Frontend berbeda domain, Anda mungkin perlu mengatur CORS di Backend (`main.ts`).
    *   Edit `backend/src/main.ts`:
    ```typescript
    app.enableCors({
      origin: ['https://sisapras-frontend.vercel.app'], // URL Frontend Anda
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    ```
