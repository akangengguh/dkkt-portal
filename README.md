# DKKT Portal

Portal publik dan CMS untuk Dewan Kesenian dan Kebudayaan Kota Tasikmalaya.

## Prasyarat

- Node.js 22+
- PostgreSQL yang tersedia di `DATABASE_URL`
- Secret yang kuat untuk `AUTH_SECRET`
- Akses upload storage yang benar untuk media publik

## Instalasi

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

## Environment variables

Buat file `.env` berdasarkan `.env.example` dan isi nilai berikut:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
POSTGRES_PASSWORD=change-this-local-password
AUTH_SECRET=replace-with-strong-random-string
ADMIN_NAME=Super Admin DKKT
ADMIN_EMAIL=admin@domain.com
ADMIN_PASSWORD=strong-password
ADMIN_USERNAME=admin
NEXT_PUBLIC_SITE_URL=http://localhost:3000
UPLOAD_STORAGE_DRIVER=local
UPLOAD_STORAGE_BASE_URL=http://localhost:3000
UPLOAD_STORAGE_BUCKET=
UPLOAD_STORAGE_REGION=
UPLOAD_STORAGE_ENDPOINT=
UPLOAD_STORAGE_ACCESS_KEY_ID=
UPLOAD_STORAGE_SECRET_ACCESS_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Untuk PostgreSQL lokal lewat Docker Compose, samakan `POSTGRES_PASSWORD` dengan password pada `DATABASE_URL`, lalu jalankan `docker compose up -d postgres`. Port database hanya dipublikasikan ke `127.0.0.1`.

## Upload storage

Aplikasi mendukung dua mode:

- `local`: menyimpan file di `public/uploads/<scope>/` dan menampilkan URL lokal.
- `remote`: mengunggah objek ke bucket S3-compatible, lalu membangun URL publik dari `UPLOAD_STORAGE_BASE_URL`.

Untuk produksi, disarankan memakai storage yang persistent dan bukan folder lokal karena serverless/ephemeral environment.

Untuk mode object storage `remote`, konfigurasi `UPLOAD_STORAGE_BUCKET`, `UPLOAD_STORAGE_REGION`, `UPLOAD_STORAGE_ACCESS_KEY_ID`, `UPLOAD_STORAGE_SECRET_ACCESS_KEY`, dan `UPLOAD_STORAGE_BASE_URL`. `UPLOAD_STORAGE_ENDPOINT` opsional untuk endpoint S3-compatible seperti Cloudflare R2 (region `auto`). Pastikan bucket/CDN mengizinkan pembacaan objek publik; kredensial yang dipakai aplikasi hanya perlu izin upload ke bucket tersebut.

## Build dan deploy

```bash
npm run build
npm run start
```

### Hostinger Business Web Hosting

Deploy aplikasi ini melalui **hPanel → Deploy Web App** dengan tipe Next.js/Node.js, bukan sebagai file statis di `public_html`. Upload ZIP berisi source project atau hubungkan repositori GitHub. Pastikan fitur Web App/Node.js tersedia pada paket akun dan gunakan Node.js 22 atau versi yang kompatibel.

Build command: `npm run build`. Start command: `npm run start`. Sertakan `package.json`, `package-lock.json`, `prisma/`, `app/`, `components/`, `lib/`, dan `public/`. Jangan masukkan `.env`, `node_modules`, atau `.next` ke ZIP; masukkan environment production melalui pengaturan aplikasi di hPanel.

Set `NEXT_PUBLIC_SITE_URL=https://dkkt.or.id`, `DATABASE_URL`, dan `AUTH_SECRET` sebelum build. Aplikasi membutuhkan PostgreSQL; jika paket hanya menyediakan MySQL, gunakan PostgreSQL eksternal yang mengizinkan koneksi dari aplikasi. Isi kredensial Upstash Redis agar login dan form kontak aktif, serta kredensial object storage S3-compatible agar upload media tidak bergantung pada filesystem hosting. Data upload lama di `public/uploads` perlu dipindahkan ke object storage dan URL-nya diperbarui sebelum mengandalkan file tersebut di production.

Di hPanel, buka pengaturan domain aplikasi dan pastikan `dkkt.or.id` terpasang pada Web App yang benar serta SSL aktif. Saya tidak dapat memeriksa keterkaitan domain dari workspace; verifikasi statusnya langsung di hPanel setelah aplikasi dibuat.

### Vercel

Project memakai Next.js App Router. Vercel dapat mendeteksi framework secara otomatis; `vercel.json` menetapkan perintah install/build dan URL publik `https://dkkt.or.id`. Tambahkan domain tersebut pada pengaturan Domains Vercel. Isi `DATABASE_URL` dan `AUTH_SECRET` pada environment Production dan Preview yang digunakan. Keduanya harus tersedia saat build karena aplikasi menginisialisasi Prisma dari environment. Tambahkan kredensial Redis Upstash serta environment object storage di atas. Redis Upstash wajib di production; tanpa Redis, login dan form kontak menolak request dengan 503 daripada memakai rate limit per-instance yang dapat dilewati di serverless. Gunakan PostgreSQL yang dapat dijangkau dari build dan runtime Vercel.

### Render

`render.yaml` menyediakan web service Node.js dan PostgreSQL serta menetapkan URL publik `https://dkkt.or.id`. Tambahkan `dkkt.or.id` dan `www.dkkt.or.id` pada pengaturan Custom Domains Render, lalu arahkan DNS sesuai target yang diberikan Render. Blueprint membuat `AUTH_SECRET`; isi environment bertanda `sync: false`, terutama Upstash dan object storage, sebelum mengandalkan login, form kontak, atau upload. Gunakan object storage remote, bukan filesystem container.

### Nginx self-hosted

Jalankan app dengan `NODE_ENV=production`, `PORT=3000`, `NEXT_PUBLIC_SITE_URL=https://dkkt.or.id`, `DATABASE_URL`, `AUTH_SECRET`, dan environment Redis/object storage yang dibutuhkan. File `deploy/nginx/dkkt-portal.conf` sudah memakai `dkkt.or.id`; terbitkan sertifikat Let's Encrypt untuk domain utama dan `www` sebelum mengaktifkan server HTTPS. File tersebut membatasi upload HTTP ke 16 MB, cukup untuk batas upload aplikasi 15 MB.

Untuk database baru, siapkan database dan terapkan contract/migration Prisma sesuai prosedur proyek sebelum membuka traffic. Jangan menjalankan inisialisasi schema otomatis dari setiap instance web saat startup.

Untuk hosting, pastikan:

1. `DATABASE_URL` tidak di-commit dan hanya ada di environment hosting.
2. `AUTH_SECRET` kuat dan unik per environment.
3. `NEXT_PUBLIC_SITE_URL` sesuai domain publik.
4. `UPLOAD_STORAGE_DRIVER` sesuai provider storage yang dipilih.
5. `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` diisi di production agar rate limit login dan kontak aktif.

## Migrasi dan seed

```bash
npx prisma generate
npm run db:seed
```

## Smoke test utama

- login admin berhasil
- login gagal untuk password salah
- logout berhasil dan redirect ke landing page
- page admin terproteksi dengan auth
- form kontak memblokir spam dengan rate limit
- upload file menolak extension atau ukuran yang tidak valid

## Catatan hosting

- Jangan menaruh file upload di folder public di hosting serverless.
- Gunakan object storage dan simpan URL saja di database.
- Jika menggunakan Vercel atau Next serverless, pastikan semua asset yang diperlukan tersedia dari storage eksternal karena file lokal dapat hilang saat restart container.
