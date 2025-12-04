import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "../config/database";
import { sendEmail, emailTemplates } from "../services/email";
import { z } from "zod";

// Validation schemas
const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  role: z.enum(["buyer", "seller"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register: RequestHandler = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existing = await query("SELECT * FROM users WHERE email = ?", [
      data.email,
    ]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert user
    await query(
      "INSERT INTO users (full_name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [data.fullName, data.email, hashedPassword, data.phone, data.role]
    );

    // If seller, create seller record
    if (data.role === "seller") {
      const users = await query("SELECT id FROM users WHERE email = ?", [
        data.email,
      ]);
      if (Array.isArray(users) && users.length > 0) {
        const userId = (users[0] as any).id;
        await query(
          "INSERT INTO sellers (user_id, business_name, created_at) VALUES (?, ?, NOW())",
          [userId, data.fullName]
        );
      }
    }

    // Send welcome email
    await sendEmail({
      to: data.email,
      ...emailTemplates.welcomeEmail(data.fullName, data.role),
    });

    return res.status(201).json({ message: "Pendaftaran berhasil" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const results = await query("SELECT * FROM users WHERE email = ?", [
      data.email,
    ]);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const user = results[0] as any;
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Update last login
    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Token tidak valid" });
  }
};
