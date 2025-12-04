# Panduan Integrasi Payment Gateway Midtrans

Setup lengkap untuk integrasi Midtrans dengan Ftrade marketplace.

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Setup Midtrans Account](#setup-midtrans-account)
3. [Server-Side Implementation](#server-side-implementation)
4. [Client-Side Implementation](#client-side-implementation)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

---

## 🎯 Pendahuluan

Midtrans adalah payment gateway terpercaya di Indonesia yang mendukung:
- **Kartu Kredit** (Visa, Mastercard, JCB)
- **Bank Transfer** (Virtual Account)
- **E-wallet** (GCash, OVO, DANA, LinkAja)
- **Cicilan** (Installment)

---

## 🔧 Setup Midtrans Account

### Langkah 1: Daftar

1. Kunjungi [Midtrans](https://midtrans.com)
2. Klik "Sign Up"
3. Pilih "Bussiness Type: Online Store"
4. Isi data bisnis Anda

### Langkah 2: Verifikasi Email

- Check email dan klik link verifikasi
- Lengkapi data profil

### Langkah 3: Dapatkan API Keys

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Pergi ke **Settings** → **Access Keys**
3. Copy:
   - **Sandbox Server Key** (untuk testing)
   - **Sandbox Client Key** (untuk testing)
   - **Production Server Key** (untuk live)
   - **Production Client Key** (untuk live)

### Langkah 4: Whitelist Domain

1. Di Settings, pergi ke **Configuration**
2. Tambah domain frontend Anda:
   - Development: `localhost:5173`
   - Production: `your-domain.com`

---

## 🖥️ Server-Side Implementation

### Langkah 1: Install Library

```bash
npm install midtrans-client
```

### Langkah 2: Create Payment Routes

Buat file `server/routes/payments.ts`:

```typescript
import { RequestHandler } from "express";
import { query } from "../config/database";
import { authenticate, AuthRequest } from "../middleware/auth";
import midtransClient from "midtrans-client";

// Initialize Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENVIRONMENT === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createSnapToken: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId, amount } = req.body;

    // Get order details
    const orders = await query(
      "SELECT o.*, u.full_name, u.email FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.id = ? AND o.buyer_id = ?",
      [orderId, req.userId]
    );

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const order = orders[0] as any;

    // Create Snap transaction
    const parameter = {
      transaction_details: {
        order_id: order.order_number,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: order.full_name,
        email: order.email,
        phone: order.phone || "",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return res.status(200).json({
      success: true,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const handleNotification: RequestHandler = async (req, res) => {
  try {
    const notification = req.body;

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Get order by Midtrans order ID
    const orders = await query(
      "SELECT * FROM orders WHERE order_number = ?",
      [notification.order_id]
    );

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    const order = orders[0] as any;

    // Update order status based on transaction status
    if (
      transactionStatus === "capture" ||
      transactionStatus === "settlement"
    ) {
      if (fraudStatus === "challenge") {
        // TODO: Set order status to 'challenge'
        await query("UPDATE orders SET payment_status = 'pending' WHERE id = ?", [
          order.id,
        ]);
      } else if (fraudStatus === "accept") {
        // TODO: Set order status to 'completed'
        await query(
          "UPDATE orders SET payment_status = 'completed', status = 'confirmed' WHERE id = ?",
          [order.id]
        );
      }
    } else if (transactionStatus === "settlement") {
      // Set order status to completed
      await query(
        "UPDATE orders SET payment_status = 'completed', status = 'confirmed' WHERE id = ?",
        [order.id]
      );
    } else if (transactionStatus === "pending") {
      // Set order status to pending
      await query(
        "UPDATE orders SET payment_status = 'pending' WHERE id = ?",
        [order.id]
      );
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "expire" ||
      transactionStatus === "cancel"
    ) {
      // Set order status to failed
      await query(
        "UPDATE orders SET payment_status = 'failed', status = 'cancelled' WHERE id = ?",
        [order.id]
      );
    }

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
```

### Langkah 3: Add Routes ke Server

Update `server/index.ts`:

```typescript
import * as paymentRoutes from "./routes/payments";

// Payment routes
app.post(
  "/api/payments/create-snap-token",
  authenticate,
  paymentRoutes.createSnapToken
);
app.post("/api/payments/notification", paymentRoutes.handleNotification);
```

---

## 🎨 Client-Side Implementation

### Langkah 1: Load Midtrans Script

Update `client/pages/Cart.tsx`:

```typescript
import { useEffect } from "react";

useEffect(() => {
  // Load Midtrans Snap script
  const script = document.createElement("script");
  script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
  script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);
```

### Langkah 2: Create Payment Handler

```typescript
const handlePayment = async () => {
  try {
    // 1. Get Snap Token from backend
    const response = await fetch("/api/payments/create-snap-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId: orderId,
        amount: finalTotal,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      toast.error(data.message || "Terjadi kesalahan");
      return;
    }

    // 2. Open Midtrans payment popup
    if (window.snap) {
      window.snap.pay(data.snapToken, {
        onSuccess: (result) => {
          console.log("Success:", result);
          toast.success("Pembayaran berhasil!");
          // Redirect to order confirmation
          window.location.href = `/orders/${orderId}`;
        },
        onPending: (result) => {
          console.log("Pending:", result);
          toast.info("Pembayaran menunggu konfirmasi...");
        },
        onError: (result) => {
          console.log("Error:", result);
          toast.error("Pembayaran gagal!");
        },
        onClose: () => {
          toast.info("Pembayaran dibatalkan");
        },
      });
    }
  } catch (error) {
    console.error(error);
    toast.error("Terjadi kesalahan");
  }
};
```

### Langkah 3: Add Payment Button

```typescript
<Button
  onClick={handlePayment}
  disabled={isProcessing}
  className="w-full bg-primary hover:bg-primary/90"
>
  {isProcessing ? "Memproses..." : "Bayar Sekarang"}
</Button>
```

---

## 🧪 Testing

### Test Card Numbers

**Success (Approved)**
- Card Number: `4811111111111114`
- Expiration: `12/25`
- CVV: `123`

**Pending (Challenge)**
- Card Number: `4911111111111113`
- Expiration: `12/25`
- CVV: `123`

**Denied**
- Card Number: `4911111111111112`
- Expiration: `12/25`
- CVV: `123`

### Test Scenario

1. Tambah produk ke keranjang
2. Klik "Bayar Sekarang"
3. Pilih "Credit Card"
4. Masuk ke Midtrans payment form
5. Input card number test
6. Check order status di database

---

## 🚀 Production Deployment

### 1. Switch to Production Keys

Update `.env`:
```env
MIDTRANS_ENVIRONMENT=production
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
```

### 2. Update Whitelist Domain

1. Di Midtrans Dashboard
2. Settings → Configuration
3. Tambah production domain:
   - `your-domain.com`
   - `www.your-domain.com`

### 3. Setup Notification Handler

- Midtrans akan send POST request ke `/api/payments/notification`
- Pastikan endpoint ini public dan tidak memerlukan auth
- Implement proper security (verify signature)

### 4. Verify Signature (Security)

```typescript
import crypto from "crypto";

const verifySignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signature: string
) => {
  const data = orderId + statusCode + grossAmount + serverKey;
  const hash = crypto.createHash("sha512").update(data).digest("hex");
  return hash === signature;
};

export const handleNotification: RequestHandler = async (req, res) => {
  const { order_id, status_code, gross_amount, signature_key } = req.body;

  const isValid = verifySignature(
    order_id,
    status_code,
    gross_amount,
    process.env.MIDTRANS_SERVER_KEY || "",
    signature_key
  );

  if (!isValid) {
    return res.status(403).json({ message: "Invalid signature" });
  }

  // Process notification...
};
```

### 5. SSL Certificate

- Pastikan domain menggunakan HTTPS
- Get free SSL dari Let's Encrypt
- Update APP_URL di `.env` ke HTTPS

---

## 📊 Monitor Transactions

1. Login ke Midtrans Dashboard
2. Pergi ke **Transactions**
3. Lihat semua transaksi
4. Check payment status & details

---

## 💡 Best Practices

✅ **DO:**
- Validate semua input di backend
- Store order ID dan amount sebelum create token
- Log semua transactions
- Test dengan test cards di sandbox dulu
- Implement retry logic untuk payment
- Send email confirmation setelah payment

❌ **DON'T:**
- Jangan expose server key di frontend
- Jangan hardcode credentials
- Jangan trust client-side amount validation
- Jangan skip signature verification

---

Selamat! Payment gateway Anda sudah integrated. Silakan test dengan card test! 🎉
