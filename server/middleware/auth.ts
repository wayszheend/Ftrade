import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Express.Request {
  userId?: number;
  userRole?: "buyer" | "seller";
}

export const authenticate: RequestHandler = (req: AuthRequest, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
      role: "buyer" | "seller";
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

export const authorize = (roles: ("buyer" | "seller")[]) => {
  return (req: AuthRequest, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses ke resource ini" });
    }
    next();
  };
};
