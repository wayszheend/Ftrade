# 🚀 Ftrade - Quick Start Guide

Panduan cepat untuk setup Ftrade dari awal sampai bisa production.

---

## ⚡ Setup dalam 5 Langkah

### Langkah 1: Database Setup (10 menit)

```bash
# 1. Buka MySQL Client
mysql -u root -p

# 2. Buat database
CREATE DATABASE ftrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ftrade;

# 3. Jalankan script SQL dari DATABASE_SETUP.md
# (Copy paste semua SQL statements)

# 4. Verifikasi
SHOW TABLES;
```

### Langkah 2: Clone & Install (5 menit)

```bash
# Clone repository (atau download zip)
git clone <repo_url>
cd ftrade

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Langkah 3: Konfigurasi `.env` (5 menit)

Edit file `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ftrade

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=generate_random_string_min_32_characters_here
JWT_EXPIRE=7d

# Email (Gmail)
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Ftrade <noreply@ftrade.com>

# Payment (Optional - Setup Later)
MIDTRANS_ENVIRONMENT=sandbox
MIDTRANS_SERVER_KEY=your_key
MIDTRANS_CLIENT_KEY=your_key

# URLs
APP_URL=http://localhost:5173
API_URL=http://localhost:3001
```

### Langkah 4: Setup Email (Gmail) - 5 Menit

1. Login ke [Google Account](https://myaccount.google.com)
2. Security → App Passwords
3. Generate password untuk "Mail"
4. Copy ke `SMTP_PASSWORD` di `.env`

### Langkah 5: Run Application (2 menit)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

Buka: http://localhost:5173

---

## ✅ Checklist Fitur

- [x] Database MySQL setup
- [x] Backend API endpoints (Products, Orders, Auth)
- [x] Frontend marketplace dengan filter
- [x] Shopping cart dengan points system
- [x] Email notifications
- [ ] Payment gateway (Midtrans)
- [ ] Admin panel
- [ ] Seller dashboard

---

## 📚 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| `DATABASE_SETUP.md` | SQL scripts & database schema |
| `SETUP_DATABASE.md` | Backend setup & API endpoints |
| `PAYMENT_GATEWAY_SETUP.md` | Midtrans integration |
| `AGENTS.md` | Project structure |

---

## 🧪 Test API Endpoints

### 1. Register User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "08123456789",
    "role": "buyer"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Simpan `token` dari response.

### 3. Get Products

```bash
curl http://localhost:3001/api/products
```

### 4. Create Product (Seller)

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tomat Segar",
    "description": "Tomat merah organik",
    "category": "vegetables",
    "price": 25000,
    "quantityAvailable": 100,
    "unit": "kg",
    "qualityGrade": "A",
    "isOrganic": true,
    "originLocation": "Bandung"
  }'
```

---

## 🔐 Security Checklist

Sebelum production:

- [ ] Change `JWT_SECRET` ke string random panjang
- [ ] Change `SMTP_PASSWORD` ke app password yang aman
- [ ] Setup HTTPS/SSL certificate
- [ ] Update `APP_URL` & `API_URL` ke domain production
- [ ] Enable CORS hanya untuk domain Anda
- [ ] Setup database backups
- [ ] Enable firewall rules
- [ ] Change default MySQL password
- [ ] Hide `.env` file (di .gitignore)

---

## 🚢 Deployment

### Frontend Deployment (Netlify)

```bash
# Build
npm run build

# Deploy (Netlify)
npm run deploy
```

Atau gunakan Netlify UI untuk connect GitHub repo.

### Backend Deployment (Railway/Render)

1. Connect GitHub repo
2. Set environment variables
3. Deploy
4. Update `API_URL` di frontend

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | MySQL belum running |
| "Token undefined" | JWT_SECRET belum di set |
| "CORS error" | Update origin di server |
| "Email tidak terkirim" | Check Gmail app password |
| "Database not found" | Jalankan SQL scripts |

---

## 📊 Project Structure

```
ftrade/
├── client/                 # React Frontend
│   ├── pages/             # Routes (Index, Marketplace, Cart, etc)
│   ├── components/        # UI components
│   ├── contexts/          # CartContext, etc
│   └── App.tsx            # Main app
├── server/                # Express Backend
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── services/          # Email, payment
│   ├── config/            # Database
│   └── index.ts           # Server entry
├── shared/                # Shared types
├── DATABASE_SETUP.md      # SQL scripts
├── SETUP_DATABASE.md      # Setup guide
├── PAYMENT_GATEWAY_SETUP.md  # Payment integration
└── .env.example           # Environment template
```

---

## 🎯 Next Steps

1. ✅ Setup database & backend
2. ✅ Test API endpoints
3. 🔄 Customize email templates
4. 🔄 Setup Midtrans payment
5. 🔄 Build admin dashboard
6. 🔄 Seller dashboard
7. 🔄 Deploy to production

---

## 💬 Support

Jika ada masalah:

1. Check documentation di folder root
2. Check API responses di DevTools Network tab
3. Check console logs di terminal
4. Check database logs: `mysql error.log`

---

## 📝 License

Ftrade © 2024. All rights reserved.

---

**Selamat! Anda sudah ready untuk develop Ftrade! 🎉**

Mulai dari setup database, customize email, integrate payment, dan deploy!
