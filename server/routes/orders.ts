import { RequestHandler } from "express";
import { query } from "../config/database";
import { authenticate, AuthRequest } from "../middleware/auth";
import { sendEmail, emailTemplates } from "../services/email";
import crypto from "crypto";

// Create order
export const createOrder: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { items, shippingAddress, shippingMethod, voucherCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    const orderNumber = `ORD-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    // Calculate total
    let totalAmount = 0;
    let discountAmount = 0;

    // Add items to order
    const orderId = await query(
      `INSERT INTO orders (order_number, buyer_id, total_amount, shipping_address, shipping_method, status, payment_status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 'pending', NOW())`,
      [orderNumber, req.userId, 0, shippingAddress, shippingMethod]
    );

    // Process order items
    for (const item of items) {
      const product = await query("SELECT * FROM products WHERE id = ?", [
        item.productId,
      ]);

      if (Array.isArray(product) && product.length > 0) {
        const prod = product[0] as any;
        const subtotal = prod.price * item.quantity;
        totalAmount += subtotal;

        await query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.productId, item.quantity, prod.price, subtotal]
        );

        // Update product quantity
        await query(
          "UPDATE products SET quantity_available = quantity_available - ?, total_sold = total_sold + ? WHERE id = ?",
          [item.quantity, item.quantity, item.productId]
        );
      }
    }

    // Apply voucher if provided
    if (voucherCode) {
      const vouchers = await query(
        "SELECT * FROM vouchers WHERE code = ? AND is_active = true AND expires_at > NOW()",
        [voucherCode]
      );

      if (Array.isArray(vouchers) && vouchers.length > 0) {
        const voucher = vouchers[0] as any;

        if (voucher.discount_type === "percentage") {
          discountAmount = (totalAmount * voucher.discount_value) / 100;
          if (
            voucher.max_discount_amount &&
            discountAmount > voucher.max_discount_amount
          ) {
            discountAmount = voucher.max_discount_amount;
          }
        } else {
          discountAmount = voucher.discount_value;
        }

        // Update voucher usage
        await query(
          "UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?",
          [voucher.id]
        );

        await query(
          "INSERT INTO voucher_usage (voucher_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)",
          [voucher.id, req.userId, orderId, discountAmount]
        );

        await query(
          "UPDATE orders SET voucher_code = ?, discount_amount = ? WHERE id = ?",
          [voucherCode, discountAmount, orderId]
        );
      }
    }

    // Update order total
    const finalTotal = totalAmount - discountAmount;
    await query(
      "UPDATE orders SET total_amount = ? WHERE id = ?",
      [finalTotal, orderId]
    );

    // Get user email for confirmation
    const users = await query("SELECT email, full_name FROM users WHERE id = ?", [
      req.userId,
    ]);

    if (Array.isArray(users) && users.length > 0) {
      const user = users[0] as any;
      await sendEmail({
        to: user.email,
        ...emailTemplates.orderConfirmation(orderNumber, finalTotal),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: {
        orderId,
        orderNumber,
        totalAmount: finalTotal,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Get user's orders
export const getUserOrders: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const results = await query(
      "SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC",
      [req.userId]
    );

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Get order details
export const getOrderDetails: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { orderId } = req.params;

    const orderResults = await query(
      "SELECT * FROM orders WHERE id = ? AND buyer_id = ?",
      [orderId, req.userId]
    );

    if (!Array.isArray(orderResults) || orderResults.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const itemResults = await query(
      `SELECT oi.*, p.name, p.image_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return res.status(200).json({
      success: true,
      data: {
        order: orderResults[0],
        items: itemResults,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Update order status (admin only)
export const updateOrderStatus: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    await query(
      "UPDATE orders SET status = ?, tracking_number = ?, updated_at = NOW() WHERE id = ?",
      [status, trackingNumber || null, orderId]
    );

    // Send notification email based on status
    const orders = await query(
      "SELECT o.*, u.email FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.id = ?",
      [orderId]
    );

    if (Array.isArray(orders) && orders.length > 0) {
      const order = orders[0] as any;

      if (status === "shipped" && trackingNumber) {
        await sendEmail({
          to: order.email,
          ...emailTemplates.orderShipped(order.order_number, trackingNumber),
        });
      } else if (status === "delivered") {
        await sendEmail({
          to: order.email,
          ...emailTemplates.orderDelivered(order.order_number),
        });
      }
    }

    return res.status(200).json({ message: "Status pesanan berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
