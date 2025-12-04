# Panduan Setup Database dan Backend Ftrade

Panduan lengkap untuk setup database MySQL, backend API, dan integrasi dengan frontend.

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Setup MySQL Database](#setup-mysql-database)
3. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
4. [Install Dependencies Backend](#install-dependencies-backend)
5. [Menjalankan Server](#menjalankan-server)
6. [API Endpoints](#api-endpoints)
7. [Setup Payment Gateway](#setup-payment-gateway)
8. [Setup Email Service](#setup-email-service)
9. [Troubleshooting](#troubleshooting)

---

## 📦 Prasyarat

Pastikan Anda sudah menginstall:

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MySQL Server** ([Download](https://dev.mysql.com/downloads/mysql/))
- **phpMyAdmin** (opsional, untuk GUI management database)
- **Git** ([Download](https://git-scm.com/))

---

## 🗄️ Setup MySQL Database

### Langkah 1: Buat Database

Buka MySQL Command Line atau phpMyAdmin dan jalankan:

```sql
CREATE DATABASE ftrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ftrade;
```

### Langkah 2: Jalankan Script SQL

Buka file `DATABASE_SETUP.md` dan copy **semua SQL statements** untuk membuat tabel. 

**Dengan Command Line:**
```bash
mysql -u root -p ftrade < database_setup.sql
```

**Dengan phpMyAdmin:**
1. Buka http://localhost/phpmyadmin
2. Login dengan username root
3. Pilih database "ftrade"
4. Pergi ke tab "Import"
5. Upload file `database_setup.sql`
6. Klik "Import"

### Langkah 3: Verifikasi Tabel

Jalankan query untuk memastikan semua tabel sudah dibuat:

```sql
SHOW TABLES;
```

Anda seharusnya melihat tabel-tabel berikut:
- `users`
- `sellers`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `vouchers`
- `voucher_usage`
- `product_reviews`
- `seller_reviews`
- `categories`

---

## 🔑 Konfigurasi Environment Variables

### Langkah 1: Copy Template

```bash
cp .env.example .env
```

### Langkah 2: Edit `.env`

Buka file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ftrade

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Ftrade <noreply@ftrade.com>

# Payment Gateway (Midtrans)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_ENVIRONMENT=sandbox

# App URLs
APP_URL=http://localhost:5173
API_URL=http://localhost:3001
```

### Langkah 3: Konfigurasi Gmail SMTP

1. Login ke [Google Account](https://myaccount.google.com)
2. Pergi ke **Security** → **App Passwords**
3. Generate password untuk aplikasi "Mail"
4. Copy password dan paste di `SMTP_PASSWORD`

---

## 📦 Install Dependencies Backend

```bash
# Install dependencies
npm install

# Install additional packages if needed
npm install mysql2 jsonwebtoken bcryptjs nodemailer cors
npm install --save-dev @types/express @types/node typescript
```

### Package Dependencies

```json
{
  "dependencies": {
    "express": "^5.0.0+",
    "mysql2": "^3.0+",
    "jsonwebtoken": "^9.0+",
    "bcryptjs": "^2.4+",
    "nodemailer": "^6.9+",
    "cors": "^2.8+",
    "dotenv": "^17+",
    "zod": "^3.0+"
  }
}
```

---

## 🚀 Menjalankan Server

### Development Mode

```bash
# Terminal 1: Start Frontend (Vite)
npm run dev

# Terminal 2: Start Backend (Express)
npm run server
```

Frontend akan berjalan di: `http://localhost:5173`
Backend akan berjalan di: `http://localhost:3001`

### Production Build

```bash
# Build frontend
npm run build

# Build server
npm run build:server

# Start production
npm start
```

---

## 🔌 API Endpoints

### Authentication

**Register (Public)**
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08123456789",
  "role": "buyer" | "seller"
}
```

**Login (Public)**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

### Products

**Get All Products**
```http
GET /api/products?category=vegetables&minPrice=10000&maxPrice=50000&search=tomat&limit=20&offset=0
```

**Get Product by ID**
```http
GET /api/products/1
```

**Create Product (Seller Only)**
```http
POST /api/products
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Tomat Segar",
  "description": "Tomat merah organik",
  "category": "vegetables",
  "price": 25000,
  "quantityAvailable": 100,
  "unit": "kg",
  "harvestDate": "2024-01-15",
  "expiryDate": "2024-01-25",
  "qualityGrade": "A",
  "isOrganic": true,
  "originLocation": "Bandung"
}
```

**Update Product**
```http
PUT /api/products/1
Authorization: Bearer token

{
  "name": "Tomat Segar",
  "description": "Updated description",
  "price": 28000,
  "quantityAvailable": 80
}
```

### Orders

**Create Order**
```http
POST /api/orders
Authorization: Bearer token

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": "Jl. Sudirman No. 1, Jakarta",
  "shippingMethod": "standard",
  "voucherCode": "SAVE10"
}
```

**Get User Orders**
```http
GET /api/orders
Authorization: Bearer token
```

**Get Order Details**
```http
GET /api/orders/1
Authorization: Bearer token
```

---

## 💳 Setup Payment Gateway (Midtrans)

### Langkah 1: Daftar Midtrans

1. Kunjungi [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Sign up atau login
3. Buat akun (sandbox untuk testing)

### Langkah 2: Dapatkan Keys

1. Di dashboard, pergi ke **Settings** → **Access Keys**
2. Copy **Server Key** dan **Client Key**
3. Paste di `.env`:
   ```env
   MIDTRANS_SERVER_KEY=your_server_key
   MIDTRANS_CLIENT_KEY=your_client_key
   MIDTRANS_ENVIRONMENT=sandbox
   ```

### Langkah 3: Implementasi di Frontend

```typescript
// Contoh integrasi di komponen checkout
declare global {
  interface Window {
    snap: any;
  }
}

const handlePayment = async (orderId: string, amount: number) => {
  // 1. Dapatkan Snap Token dari backend
  const response = await fetch("/api/payments/create-snap-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId, amount }),
  });

  const { snapToken } = await response.json();

  // 2. Open Midtrans payment popup
  window.snap.pay(snapToken, {
    onSuccess: (result) => {
      console.log("Payment successful", result);
    },
    onPending: (result) => {
      console.log("Payment pending", result);
    },
    onError: (result) => {
      console.log("Payment failed", result);
    },
  });
};
```

---

## 📧 Setup Email Service

### Gmail SMTP Configuration

**1. Enable Less Secure Apps**

- Login ke [Google Account](https://myaccount.google.com)
- Pergi ke **Security**
- Buka **App Passwords**
- Pilih Mail dan Windows
- Generate password

**2. Konfigurasi di `.env`**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=generated_app_password
SMTP_FROM=Ftrade <noreply@ftrade.com>
```

**3. Test Email**

```typescript
import { sendEmail, emailTemplates } from "./services/email";

// Send welcome email
await sendEmail({
  to: "user@example.com",
  ...emailTemplates.welcomeEmail("John Doe", "buyer"),
});

// Send order confirmation
await sendEmail({
  to: "user@example.com",
  ...emailTemplates.orderConfirmation("ORD-123456", 250000),
});
```

---

## 🆘 Troubleshooting

### Error: "Connection refused" saat connect database

**Solusi:**
1. Pastikan MySQL server running
2. Check username, password, host di `.env`
3. Restart MySQL service

### Error: "Unknown database 'ftrade'"

**Solusi:**
1. Pastikan sudah jalankan `CREATE DATABASE ftrade`
2. Jalankan SQL scripts untuk membuat tabel

### Error: "Token undefined" saat login

**Solusi:**
1. Pastikan JWT_SECRET sudah di set di `.env`
2. Check request body login (email & password)

### SMTP Error: "Invalid login"

**Solusi:**
1. Verify Gmail credentials
2. Generate new app password
3. Enable "Less secure apps" jika diperlukan

### Error: "CORS error"

**Solusi:**
1. Check CORS configuration di `server/index.ts`
2. Pastikan frontend URL di whitelist
3. Restart backend server

### Database tidak tersinkronisasi dengan data frontend

**Solusi:**
1. Clear localStorage browser
2. Restart backend server
3. Check API responses di Network tab browser

---

## ✅ Checklist Setup

- [ ] MySQL Server installed dan running
- [ ] Database `ftrade` created
- [ ] Semua tables sudah dibuat
- [ ] `.env` file dikonfigurasi
- [ ] Dependencies installed
- [ ] Gmail SMTP configured
- [ ] Midtrans keys obtained
- [ ] Frontend dan backend running
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test create product (seller)
- [ ] Test create order
- [ ] Test email notification

---

## 📞 Support

Jika mengalami kesulitan, check:
- Database error logs: `/var/log/mysql/error.log`
- Server logs: Terminal backend
- Browser console untuk frontend errors

---

## 🔒 Security Notes

⚠️ **PENTING:**
- Jangan commit `.env` file ke repository
- Change `JWT_SECRET` ke string yang lebih kuat
- Use HTTPS di production
- Validate semua user input di backend
- Implement rate limiting untuk login attempts
- Regular backup database

---

Selamat! Database dan backend Anda sudah siap. Mulai develop fitur tambahan! 🎉
