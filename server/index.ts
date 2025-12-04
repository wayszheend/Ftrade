import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import * as productRoutes from "./routes/products";
import * as orderRoutes from "./routes/orders";
import { authenticate, authorize } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes (public)
  app.post("/api/auth/register", authRoutes.register);
  app.post("/api/auth/login", authRoutes.login);
  app.get("/api/auth/verify", authRoutes.verifyToken);

  // Product routes
  app.get("/api/products", productRoutes.getProducts);
  app.get("/api/products/:id", productRoutes.getProductById);
  app.post("/api/products", authenticate, productRoutes.createProduct);
  app.put("/api/products/:id", authenticate, productRoutes.updateProduct);
  app.delete("/api/products/:id", authenticate, productRoutes.deleteProduct);
  app.get(
    "/api/seller/products",
    authenticate,
    authorize(["seller"]),
    productRoutes.getSellerProducts
  );

  // Order routes
  app.post("/api/orders", authenticate, orderRoutes.createOrder);
  app.get("/api/orders", authenticate, orderRoutes.getUserOrders);
  app.get("/api/orders/:orderId", authenticate, orderRoutes.getOrderDetails);
  app.put(
    "/api/orders/:orderId/status",
    authenticate,
    authorize(["seller"]),
    orderRoutes.updateOrderStatus
  );

  return app;
}
