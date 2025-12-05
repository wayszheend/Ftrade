# 🌾 Ftrade - Agricultural Marketplace Platform

Ftrade adalah platform marketplace modern yang menghubungkan petani langsung dengan pembeli untuk memperjual hasil panen berkualitas dengan harga yang adil.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node-16+-blue)
![Database](https://img.shields.io/badge/Database-MySQL-blue)

---

## 🎯 Fitur Utama

### Untuk Pembeli
✅ **Browse Products** - Jelajahi produk dari berbagai kategori
✅ **Smart Filters** - Filter berdasarkan kategori, harga, dan pencarian
✅ **Shopping Cart** - Tambah produk ke keranjang
✅ **Points Reward** - Dapatkan poin dari setiap pembelian
✅ **Secure Payment** - Pembayaran aman melalui Midtrans
✅ **Order Tracking** - Lacak status pesanan real-time
✅ **Email Notifications** - Notifikasi email untuk setiap transaksi

### Untuk Penjual
✅ **Seller Dashboard** - Dashboard penjualan lengkap
✅ **Product Management** - Kelola produk dengan mudah
✅ **Order Management** - Kelola pesanan dari pembeli
✅ **Sales Analytics** - Lihat statistik penjualan
✅ **Verification** - Verifikasi penjual untuk kepercayaan
✅ **Reviews & Ratings** - Lihat ulasan dari pembeli

### Untuk Admin
✅ **Admin Panel** - Kelola semua aspek platform
✅ **User Management** - Kelola pengguna dan seller
✅ **Product Approval** - Verifikasi dan approve produk
✅ **Voucher System** - Buat dan kelola kode diskon
✅ **Analytics & Reports** - Laporan penjualan dan pengguna
✅ **System Settings** - Atur konfigurasi platform

---

## 🏗️ Teknologi Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 6** - Routing
- **TanStack Query** - Data fetching
- **Zod** - Validation

### Backend
- **Node.js** - Runtime
- **Express** - Server framework
- **TypeScript** - Type safety
- **MySQL 8** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Midtrans** - Payment gateway

### DevOps & Deployment
- **Vite** - Development server
- **Netlify** - Frontend hosting
- **Railway/Render** - Backend hosting
- **MySQL Cloud** - Database hosting

---

## 📁 Struktur Project

```
ftrade/
├── client/                          # React Frontend
│   ├── pages/                       # Route pages
│   │   ├── Index.tsx               # Homepage
│   │   ├── Marketplace.tsx         # Product listing
│   │   ├── Cart.tsx                # Shopping cart
│   │   ├── Login.tsx               # Login page
│   │   ├── Register.tsx            # Registration
│   │   ├── Admin.tsx               # Admin panel
│   │   └── ...
│   ├── components/                  # Reusable components
│   │   ├── Layout.tsx              # Global layout
│   │   └── ui/                     # UI components
│   ├── contexts/                    # React contexts
│   │   └── CartContext.tsx         # Cart state
│   ├── App.tsx                      # Main app
│   ├── global.css                   # Global styles
│   └── vite-env.d.ts
│
├── server/                          # Express Backend
│   ├── routes/                      # API endpoints
│   │   ├── auth.ts                 # Authentication
│   │   ├── products.ts             # Products CRUD
│   │   ├── orders.ts               # Orders
│   │   ├── payments.ts             # Payment gateway
│   │   └── ...
│   ├── middleware/                  # Express middleware
│   │   └── auth.ts                 # JWT auth
│   ├── services/                    # Business logic
│   │   ├── email.ts                # Email service
│   │   └── ...
│   ├── config/                      # Configurations
│   │   └── database.ts             # MySQL connection
│   └── index.ts                     # Server entry
│
├── shared/                          # Shared code
│   └── api.ts                       # Shared types
│
├── public/                          # Static assets
├── DATABASE_SETUP.md                # SQL scripts
├── SETUP_DATABASE.md                # Backend setup guide
├── PAYMENT_GATEWAY_SETUP.md         # Payment integration
├── QUICK_START.md                   # Quick start
├── IMPLEMENTATION_CHECKLIST.md      # Implementation guide
├── AGENTS.md                        # Project info
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- MySQL 8+
- npm atau yarn

### Setup Database

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE ftrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. Run SQL scripts (lihat DATABASE_SETUP.md)
# Import semua SQL statements
```

### Setup Project

```bash
# 1. Clone repository
git clone <repo_url>
cd ftrade

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Configure .env (database, email, payment)
# Edit database credentials, Gmail SMTP, etc
```

### Run Application

```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Express)
npm run server
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

---

## 📚 Dokumentasi

| File | Deskripsi |
|------|-----------|
| [QUICK_START.md](./QUICK_START.md) | Setup cepat dalam 5 langkah |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | SQL scripts dan schema |
| [SETUP_DATABASE.md](./SETUP_DATABASE.md) | Backend setup & API endpoints |
| [PAYMENT_GATEWAY_SETUP.md](./PAYMENT_GATEWAY_SETUP.md) | Integrasi Midtrans |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Checklist implementasi |
| [AGENTS.md](./AGENTS.md) | Struktur project |

---

## ���� API Endpoints

### Authentication
```
POST   /api/auth/register          Register user
POST   /api/auth/login             Login user
GET    /api/auth/verify            Verify token
```

### Products
```
GET    /api/products               Get all products
GET    /api/products/:id           Get product details
POST   /api/products               Create product (seller)
PUT    /api/products/:id           Update product (seller)
DELETE /api/products/:id           Delete product (seller)
GET    /api/seller/products        Get seller's products
```

### Orders
```
POST   /api/orders                 Create order
GET    /api/orders                 Get user's orders
GET    /api/orders/:id             Get order details
PUT    /api/orders/:id/status      Update order status (admin)
```

### Payments
```
POST   /api/payments/create-snap-token     Create payment token
POST   /api/payments/notification          Handle payment webhook
```

---

## 💡 Fitur Unggulan

### 🎁 Points & Rewards System
- Dapatkan poin dari setiap pembelian
- 1 poin = Rp 100 diskon
- Poin bisa ditukar untuk diskon otomatis
- Poin tidak pernah kadaluarsa

### 📧 Email Notifications
- Welcome email saat register
- Order confirmation
- Order tracking updates
- Password reset
- Promotional campaigns

### 🔐 Authentication & Authorization
- JWT based authentication
- Role-based access control (buyer/seller/admin)
- Secure password hashing
- Session management

### 📊 Analytics & Reports
- Dashboard analytics
- Sales reports
- User statistics
- Transaction history

---

## 🚢 Deployment

### Frontend (Netlify)
```bash
npm run build
npm run deploy
```

### Backend (Railway/Render)
- Connect GitHub repository
- Configure environment variables
- Deploy automatically

---

## 📋 Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ftrade

# Server
PORT=3001
NODE_ENV=development

# Auth
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# URLs
APP_URL=http://localhost:5173
API_URL=http://localhost:3001
```

---

## 📈 Roadmap

### Phase 1: MVP (Done)
- ✅ Product browsing & filtering
- ✅ User authentication
- ✅ Shopping cart
- ✅ Points system

### Phase 2: Payment & Orders (In Progress)
- ⏳ Payment gateway integration
- ⏳ Order management
- ⏳ Order tracking

### Phase 3: Seller & Admin (Planning)
- ⏳ Seller dashboard
- ⏳ Admin panel
- ⏳ Product approval system

### Phase 4: Advanced (Future)
- ⏳ User reviews & ratings
- ⏳ Wishlist feature
- ⏳ Chat support
- ⏳ Mobile app
- ⏳ Analytics improvements

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Check dokumentasi di folder root
2. Review existing issues di GitHub
3. Buat issue baru dengan detail lengkap

---

## Acknowledgments

- React & Vite community
- Tailwind CSS
- Midtrans
- Open source contributors

---

Untuk info lebih lanjut, baca [QUICK_START.md](./QUICK_START.md) atau [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
