# Panduan Setup Gmail SMTP untuk SISAPRAS

Untuk menggunakan Gmail sebagai pengirim email otomatis (Notifikasi & Lupa Password), Anda tidak bisa menggunakan password login biasa jika 2FA aktif. Anda harus menggunakan **App Password**.

## Langkah-langkah:

1.  **Login ke Akun Google** yang akan digunakan sebagai pengirim (misal: `admin.sekolah@gmail.com`).
2.  Buka **Kelola Akun Google Anda** -> **Keamanan** (Security).
3.  Pastikan **Verifikasi 2 Langkah** (2-Step Verification) sudah **AKTIF**.
4.  Di bawah menu Verifikasi 2 Langkah, cari opsi **Sandi Aplikasi** (App Passwords).
    *   *Jika tidak ketemu, cari "App Passwords" di kolom pencarian settings.*
5.  Buat sandi aplikasi baru:
    *   **App**: Pilih *Mail* (atau Lainnya/Custom -> isi "SISAPRAS").
    *   **Device**: Pilih *Mac* (atau Lainnya).
    *   Klik **Generate**.
6.  Google akan memberikan kode 16 digit (contoh: `abcd efgh ijkl mnop`). **Copy kode ini**.

## Konfigurasi Environment (.env)

Buka file `.env` di folder `backend/` dan tambahkan/update konfigurasi berikut:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=alamat.email.anda@gmail.com
MAIL_PASSWORD=kode 16 digit app password (tanpa spasi)
MAIL_FROM="Admin SISAPRAS <alamat.email.anda@gmail.com>"
```

Setelah ini di-save, restart backend server, dan fitur email akan berfungsi.
