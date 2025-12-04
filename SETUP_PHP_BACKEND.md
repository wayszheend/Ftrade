# Ftrade PHP Backend - Complete Setup Guide

Panduan lengkap untuk menjalankan aplikasi Ftrade dengan PHP backend di localhost:8000.

## 📋 Prerequisit

- **PHP 7.4+** (atau lebih baru)
- **MySQL 5.7+** atau **MariaDB**
- **Composer** (opsional)
- Node.js & npm (untuk frontend React)

---

## 🗄️ Langkah 1: Setup Database MySQL

### 1.1 Buat Database
Buka phpMyAdmin atau terminal MySQL dan jalankan:

```sql
CREATE DATABASE ftrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ftrade;
```

### 1.2 Import Schema
Buka file `DATABASE_SETUP.md` dan copy semua SQL statements untuk membuat tables. Jalankan di MySQL:

```bash
mysql -u root -p ftrade < DATABASE_SETUP.md
```

Atau salin-paste semua SQL dari DATABASE_SETUP.md ke phpMyAdmin.

**Verifikasi Database:**
```bash
mysql -u root -p -e "USE ftrade; SHOW TABLES;"
```

Anda seharusnya melihat 11 tables:
- users, sellers, products, cart_items, orders, order_items
- vouchers, voucher_usage, product_reviews, seller_reviews
- categories

---

## 🚀 Langkah 2: Setup PHP Backend

### 2.1 Verifikasi Konfigurasi Database

Edit file `php-backend/config/db.php` dan pastikan kredensial MySQL sudah benar:

```php
$host = 'localhost';      // Host MySQL
$db_name = 'ftrade';      // Nama database
$username = 'root';       // Username MySQL
$password = '';           // Password MySQL (kosong jika tidak ada)
$charset = 'utf8mb4';
```

### 2.2 Jalankan PHP Development Server

Buka terminal di folder project dan jalankan:

```bash
# Pastikan Anda di folder project root
php -S localhost:8000 -t php-backend
```

**Output yang diharapkan:**
```
Listening on http://localhost:8000
Press Ctrl+C to quit.
```

### 2.3 Test PHP Backend

Buka browser dan akses:
```
http://localhost:8000/api/categories
```

Anda seharusnya melihat response JSON:
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": []
}
```

---

## 💻 Langkah 3: Setup Frontend React

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Verifikasi Konfigurasi Environment

File `.env` sudah diperbarui dengan:
```
VITE_API_URL=http://localhost:8000
```

Jika perlu, Anda bisa edit kembali di `.env`.

### 3.3 Jalankan Dev Server

Di terminal baru, jalankan:

```bash
npm run dev
```

Frontend akan jalan di `http://localhost:5173` (atau port yang ditampilkan).

---

## ✅ Test Semua Fitur

### Test 1: Login (Belum ada user)

1. Buka `http://localhost:5173/login`
2. Coba login dengan email apapun
3. Seharusnya error "Invalid credentials"

### Test 2: Register User Baru

1. Klik "Daftar" atau buka `http://localhost:5173/register`
2. Isi form dengan:
   - Nama Lengkap: `Petani Saya`
   - Email: `petani@test.com`
   - Nomor Telepon: `081234567890`
   - Password: `password123`
   - Konfirmasi Password: `password123`
   - Pilih role: `Pembeli`
3. Klik "Buat Akun"
4. Seharusnya redirect ke `/marketplace`

### Test 3: Login dengan User Baru

1. Buka `http://localhost:5173/login`
2. Login dengan:
   - Email: `petani@test.com`
   - Password: `password123`
3. Seharusnya berhasil dan redirect ke `/marketplace`

### Test 4: Register sebagai Seller

1. Buka `http://localhost:5173/register`
2. Klik "Penjual"
3. Isi form dengan data seller
4. Klik "Buat Akun"
5. User akan tersimpan dengan role `seller`

---

## 📡 API Endpoints

Semua endpoint tersedia di `http://localhost:8000/api/`

### Authentication
```
POST   /api/auth/register     - Daftar user baru
POST   /api/auth/login        - Login user
```

### Products
```
GET    /api/products          - Daftar produk
GET    /api/products/{id}     - Detail produk
POST   /api/products          - Buat produk baru
```

### Cart
```
GET    /api/cart?user_id=...  - Ambil cart user
POST   /api/cart              - Tambah item ke cart
DELETE /api/cart/{id}         - Hapus item dari cart
```

### Orders
```
GET    /api/orders?buyer_id=...  - Daftar order user
GET    /api/orders/{id}          - Detail order
POST   /api/orders               - Buat order baru
```

### Users
```
GET    /api/users/{id}        - Profil user
PUT    /api/users/{id}        - Update profil user
```

### Categories
```
GET    /api/categories        - Daftar kategori
GET    /api/categories/{id}   - Detail kategori
```

### Vouchers & Reviews
```
GET    /api/vouchers          - Daftar voucher
GET    /api/vouchers/validate?code=... - Validasi voucher
GET    /api/reviews?product_id=...     - Review produk
POST   /api/reviews           - Buat review
```

---

## 🔧 Troubleshooting

### Error: "Database connection failed"
**Solusi:**
- Pastikan MySQL running
- Verifikasi kredensial di `php-backend/config/db.php`
- Pastikan database `ftrade` sudah dibuat

### Error: "404 Not Found" saat akses API
**Solusi:**
- Pastikan PHP server jalan di port 8000
- Verifikasi `.env` punya `VITE_API_URL=http://localhost:8000`
- Refresh browser (Ctrl+F5)

### Error: "CORS policy blocked"
**Solusi:**
- CORS sudah dikonfigurasi di `php-backend/config/cors.php`
- Pastikan frontend akses dari port yang benar

### Error: "Email already registered"
**Solusi:**
- Email sudah ada di database
- Gunakan email berbeda untuk register

### Frontend Form tidak bisa submit
**Solusi:**
- Pastikan PHP backend running
- Check browser console (F12 → Console) untuk error detail
- Pastikan semua field form terisi

---

## 📁 Struktur File

```
project-root/
├── php-backend/              # PHP Backend
│   ├── api/
│   │   └── index.php         # Main router & handlers
│   ├── config/
│   │   ├── db.php            # Database config
│   │   ├── cors.php          # CORS headers
│   │   └── helpers.php       # Helper functions
│   ├── .htaccess             # URL rewriting
│   └── README.md             # PHP docs
│
├── client/                   # Frontend React
│   ├── pages/
│   │   ├── Login.tsx         # Login page (updated)
│   │   ├── Register.tsx      # Register page (updated)
│   │   └── ...
│   └── ...
│
├── shared/
│   └── api.ts               # API client & types (updated)
│
├── .env                     # Environment (updated)
├── vite.config.ts
├── package.json
└── DATABASE_SETUP.md        # Database schema

```

---

## 🚀 Deployment (Production)

Untuk production, Anda perlu:

1. **Ganti PHP server** dengan Apache/Nginx
2. **Enable mod_rewrite** di Apache untuk `.htaccess`
3. **Update VITE_API_URL** ke domain production
4. **Setup HTTPS** untuk keamanan
5. **Configure database** di production server
6. **Run `npm run build`** untuk build frontend

---

## 📞 Testing dengan cURL

```bash
# Test Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@test.com",
    "password": "password123",
    "phone": "081234567890",
    "role": "buyer"
  }'

# Test Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'

# Test Get Categories
curl http://localhost:8000/api/categories
```

---

## ✨ Fitur yang Sudah Diimplementasi

✅ User Registration (Buyer & Seller)
✅ User Login
✅ Password Hashing (bcrypt)
✅ Product CRUD
✅ Shopping Cart
✅ Orders Management
✅ Voucher Validation
✅ Reviews & Ratings
✅ User Profile Management
✅ Category Management
✅ Input Sanitization & Validation
✅ CORS Configuration
✅ SQL Injection Prevention (Prepared Statements)

---

## 🎯 Next Steps

Setelah semua berjalan:

1. ✅ Implementasi login/register di frontend ← SUDAH DILAKUKAN
2. ⏳ Implementasi marketplace products page
3. ⏳ Implementasi shopping cart UI
4. ⏳ Implementasi checkout flow
5. ⏳ Implementasi seller dashboard
6. ⏳ Setup payment gateway (Midtrans)
7. ⏳ Setup email notifications

---

## 📚 Resources

- PHP Documentation: https://www.php.net/manual/
- MySQL Documentation: https://dev.mysql.com/doc/
- React Documentation: https://react.dev/
- Vite Documentation: https://vitejs.dev/

---

**Selesai!** Aplikasi Ftrade PHP backend sudah siap digunakan. 🎉

Jika ada pertanyaan atau masalah, cek error messages di:
- Browser Console (F12)
- PHP error log
- MySQL error messages
