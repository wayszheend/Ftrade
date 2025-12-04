# Ftrade Points System Setup Guide

Panduan lengkap untuk mengaktifkan sistem poin loyalty di aplikasi Ftrade.

## 📋 Yang Sudah Diimplementasikan

✅ **Frontend:**
- Profile icon di navbar (menggantikan tombol "Masuk" saat sudah login)
- Profile dropdown menu dengan informasi poin
- Points display di navbar
- Cart page dengan points redemption
- Conversion: 10 poin = Rp 2.000 diskon
- Earning: 1 poin per Rp 1.000 pembelian

✅ **Backend:**
- Points tracking di orders API
- Automatic points earning on purchase
- Points deduction when used for discount
- User authentication & profile management

## 🔧 Setup Database (REQUIRED)

Anda HARUS menjalankan migration SQL ini untuk mengaktifkan points system:

### 1. Jalankan Migration Script

Buka phpMyAdmin atau MySQL terminal dan salin-paste isi dari file:
```
php-backend/MIGRATION_ADD_POINTS.sql
```

**Atau jalankan manual:**

```sql
-- Add points column to users table
ALTER TABLE `users` ADD COLUMN `points` INT DEFAULT 0 AFTER `total_ratings`;
ALTER TABLE `users` ADD INDEX `idx_points` (`points`);

-- Create points transactions table (opsional, untuk tracking history)
CREATE TABLE IF NOT EXISTS `points_transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `points` INT NOT NULL,
  `transaction_type` ENUM('earn', 'spend', 'bonus') DEFAULT 'earn',
  `description` VARCHAR(255),
  `order_id` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

✅ Verifikasi dengan menjalankan:
```sql
DESCRIBE users;
-- Seharusnya ada kolom 'points' dengan tipe INT
```

### 2. Optional - Insert Point Conversion Rates

```sql
-- Create point_discounts table (opsional, untuk flexibility)
CREATE TABLE IF NOT EXISTS `point_discounts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `points_required` INT NOT NULL,
  `discount_amount` DECIMAL(15,2) NOT NULL,
  `description` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_points` (`points_required`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default rates
INSERT INTO `point_discounts` (`points_required`, `discount_amount`, `description`) VALUES
(10, 2000, '10 poin = Rp 2.000'),
(50, 10000, '50 poin = Rp 10.000'),
(100, 20000, '100 poin = Rp 20.000');
```

---

## 🎯 Conversion Rates (Tetap)

- **Earning:** 1 poin per Rp 1.000 pembelian
- **Redeeming:** 10 poin = Rp 2.000 diskon
- **Welcome Bonus:** 100 poin untuk user baru saat register

---

## 📱 User Flow

### 1. Registrasi User Baru
```
User → Register → Get 100 poin bonus → Redirect ke beranda
```

### 2. Berbelanja
```
User → Add to cart → Checkout → 
  - Pilih gunakan poin (opsional)
  - Kurangi harga dengan poin
  - Beli → Dapat poin dari pembelian
```

### 3. Profile Menu
```
User (sudah login) → Klik ikon profile (kanan atas navbar) →
  - Lihat total poin
  - Logout
```

---

## ✨ Features

### Profile Icon di Navbar

**Saat belum login:**
```
[Search] [Keranjang] [Masuk] [Mulai Berjualan]
```

**Saat sudah login:**
```
[Search] [100 poin ⚡] [Keranjang] [👤 Profile Menu]
```

### Profile Menu Dropdown
```
┌─────────────────────┐
│ 👤 Nama User        │ ← User info
│    email@mail.com   │
├─────────────────────┤
│ Poin Anda: 500 poin │ ← Points display
├─────────────────────┤
│ Profil Saya         │
│ Pengaturan          │
├─────────────────────┤
│ Keluar (Logout)     │
└─────────────────────┘
```

### Cart Page Points Redemption

```
┌─────────────────────────────┐
│ Ringkasan Pesanan           │
├─────────────────────────────┤
│ Subtotal: Rp 100.000        │
│ Ongkir: Gratis              │
├─────────────────────────────┤
│ ⚡ Poin Saya: 500 poin      │
│ ☑ Gunakan poin untuk diskon │
│   [___] / 500 poin          │
│   Diskon: -Rp 10.000        │
├─────────────────────────────┤
│ Total: Rp 90.000            │
│ +50 poin setelah pembelian  │
├─────────────────────────────┤
│ [Lanjut ke Pembayaran]      │
└─────────────────────────────┘
```

---

## 🔌 API Endpoints

### Create Order (dengan points)

```bash
POST /api/orders
Content-Type: application/json

{
  "buyer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ],
  "shipping_address": "Jl. Contoh No. 123",
  "payment_method": "pending",
  "points_used": 50  // Optional: berapa poin yang digunakan
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order_id": 1,
    "order_number": "ORD-20240101-ABC123",
    "points_earned": 45,
    "user_points": 495
  }
}
```

### Get User

```bash
GET /api/users/1
```

**Response:**
```json
{
  "success": true,
  "message": "User found",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "buyer",
    "points": 495,
    "rating": 4.5
  }
}
```

---

## 💾 Data Storage

### Points di Frontend
- **Sumber utama:** localStorage (CartContext)
- **Di sync dengan:** Database MySQL saat checkout

### Points di Backend
- **Disimpan di:** `users.points` column
- **Tracked via:** `orders` table
- **Optional history:** `points_transactions` table

---

## 🧪 Testing

### Test 1: Register User Baru
```
1. Klik "Mulai Berjualan"
2. Pilih role "Pembeli"
3. Isi form lengkap
4. Klik "Buat Akun"
5. ✅ Seharusnya dapat 100 poin bonus
6. ✅ Navbar menampilkan profile icon + poin
```

### Test 2: Login & Lihat Poin
```
1. Klik logout
2. Klik "Masuk"
3. Login dengan akun tadi
4. ✅ Navbar menampilkan poin Anda
5. Klik profile icon → dropdown menu
```

### Test 3: Berbelanja & Earn Points
```
1. Cari produk di marketplace
2. Tambah ke cart (Rp 50.000)
3. Checkout (jangan gunakan poin)
4. ✅ Seharusnya dapat 50 poin (50.000 / 1.000)
5. ✅ Total poin jadi 150 (100 + 50)
```

### Test 4: Redeem Points
```
1. Belanja lagi (Rp 100.000)
2. Di cart, centang "Gunakan poin untuk diskon"
3. Input: 100 poin
4. ✅ Diskon: -Rp 20.000 (100 poin = 10 × 2.000)
5. Total: Rp 80.000
6. Checkout
7. ✅ Points digunakan: -100
8. ✅ Points earned: +80 (80.000 / 1.000)
```

---

## 🚀 Deployment Checklist

- [ ] Run migration SQL di production database
- [ ] Update environment variables jika perlu
- [ ] Test semua flows di production
- [ ] Backup database sebelum migration
- [ ] Monitor logs untuk errors
- [ ] Communicate perubahan ke users

---

## 📊 Monitoring

Untuk melihat points transactions:

```sql
-- Lihat semua user dan poin mereka
SELECT id, full_name, email, points FROM users ORDER BY points DESC;

-- Lihat user dengan poin terbanyak
SELECT id, full_name, points FROM users WHERE points > 0 ORDER BY points DESC LIMIT 10;

-- Total poin di sistem
SELECT SUM(points) as total_points FROM users;
```

---

## 🐛 Troubleshooting

### "Points column doesn't exist"
**Solusi:** Jalankan migration SQL dari `MIGRATION_ADD_POINTS.sql`

### "User tidak mendapat poin saat checkout"
**Cek:**
1. Apakah `points` column ada di `users` table?
2. Apakah order berhasil dibuat?
3. Check server logs untuk error

### "Points tidak tersimpan setelah refresh"
**Solusi:** Points disimpan di `users` table di database. Jika tidak tersimpan, check:
1. Koneksi database OK?
2. API response OK?
3. Frontend update localStorage?

---

## 📝 Notes

- Points system sudah fully integrated dengan database
- Frontend dan backend sudah connected
- Hanya perlu run migration SQL untuk aktifkan
- Conversion rates bisa diubah di `php-backend/api/index.php` (search: "1 point per 1000")
- Welcome bonus configurable di `Register.tsx` (line: `addPoints(100)`)

---

**STATUS:** ✅ Siap untuk deployment!

Jika ada pertanyaan, check bagian API di `php-backend/README.md`
