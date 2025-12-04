import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@ftrade.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

// Email Templates
export const emailTemplates = {
  welcomeEmail: (name: string, role: string) => ({
    subject: "Selamat Datang di Ftrade!",
    html: `
      <h2>Selamat Datang, ${name}!</h2>
      <p>Terima kasih telah mendaftar di Ftrade sebagai ${role === "seller" ? "Penjual" : "Pembeli"}.</p>
      <p>Akun Anda sudah siap digunakan. Mulai berbelanja atau menjual hasil panen Anda sekarang!</p>
      <p>Link: <a href="${process.env.APP_URL}">Buka Ftrade</a></p>
    `,
  }),

  orderConfirmation: (orderId: string, total: number) => ({
    subject: `Pesanan Anda Dikonfirmasi - #${orderId}`,
    html: `
      <h2>Pesanan Dikonfirmasi</h2>
      <p>Nomor Pesanan: <strong>#${orderId}</strong></p>
      <p>Total Pembayaran: <strong>Rp ${total.toLocaleString("id-ID")}</strong></p>
      <p>Terima kasih atas pemesanan Anda. Kami akan segera memproses pesanan Anda.</p>
      <p>Cek status pesanan: <a href="${process.env.APP_URL}/orders/${orderId}">Lihat Pesanan</a></p>
    `,
  }),

  orderShipped: (orderId: string, trackingNumber: string) => ({
    subject: `Pesanan Anda Telah Dikirim - #${orderId}`,
    html: `
      <h2>Pesanan Dikirim</h2>
      <p>Nomor Pesanan: <strong>#${orderId}</strong></p>
      <p>Nomor Resi: <strong>${trackingNumber}</strong></p>
      <p>Pesanan Anda sedang dalam perjalanan. Pantau pengiriman Anda.</p>
      <p>Tracking: <a href="${process.env.APP_URL}/orders/${orderId}">Lacak Pesanan</a></p>
    `,
  }),

  orderDelivered: (orderId: string) => ({
    subject: `Pesanan Anda Telah Diterima - #${orderId}`,
    html: `
      <h2>Pesanan Diterima</h2>
      <p>Nomor Pesanan: <strong>#${orderId}</strong></p>
      <p>Pesanan Anda telah sampai dengan selamat. Terima kasih telah berbelanja di Ftrade!</p>
      <p>Berikan ulasan untuk membantu seller lainnya: <a href="${process.env.APP_URL}/orders/${orderId}/review">Beri Ulasan</a></p>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: "Reset Kata Sandi Ftrade",
    html: `
      <h2>Reset Kata Sandi</h2>
      <p>Kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
      <p>Klik link berikut untuk mengatur ulang kata sandi Anda:</p>
      <p><a href="${resetLink}">Reset Kata Sandi</a></p>
      <p>Link ini akan berlaku selama 24 jam.</p>
      <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
    `,
  }),
};
