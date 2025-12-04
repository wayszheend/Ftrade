import { RequestHandler } from "express";
import { query } from "../config/database";
import { authenticate, AuthRequest, authorize } from "../middleware/auth";

// Get all products with filters
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, limit = 20, offset = 0 } =
      req.query;

    let sql =
      "SELECT p.*, u.full_name as seller_name FROM products p JOIN sellers s ON p.seller_id = s.id JOIN users u ON s.user_id = u.id WHERE p.is_active = true";
    const params: any[] = [];

    if (category && category !== "all") {
      sql += " AND p.category = ?";
      params.push(category);
    }

    if (minPrice) {
      sql += " AND p.price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += " AND p.price <= ?";
      params.push(maxPrice);
    }

    if (search) {
      sql += " AND (p.name LIKE ? OR p.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit as string), parseInt(offset as string));

    const results = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: results,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Get product by ID
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await query(
      "SELECT p.*, u.full_name as seller_name, u.rating as seller_rating FROM products p JOIN sellers s ON p.seller_id = s.id JOIN users u ON s.user_id = u.id WHERE p.id = ?",
      [id]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: results[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Create product (seller only)
export const createProduct: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      description,
      category,
      price,
      quantityAvailable,
      unit,
      harvestDate,
      expiryDate,
      qualityGrade,
      isOrganic,
      originLocation,
    } = req.body;

    // Get seller ID for this user
    const sellers = await query("SELECT id FROM sellers WHERE user_id = ?", [
      req.userId,
    ]);

    if (!Array.isArray(sellers) || sellers.length === 0) {
      return res.status(403).json({ message: "Anda bukan penjual" });
    }

    const sellerId = (sellers[0] as any).id;

    await query(
      `INSERT INTO products 
       (seller_id, name, description, category, price, quantity_available, unit, harvest_date, expiry_date, quality_grade, is_organic, origin_location, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        sellerId,
        name,
        description,
        category,
        price,
        quantityAvailable,
        unit,
        harvestDate,
        expiryDate,
        qualityGrade,
        isOrganic,
        originLocation,
      ]
    );

    return res.status(201).json({ message: "Produk berhasil ditambahkan" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Update product (seller only)
export const updateProduct: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { name, description, price, quantityAvailable } = req.body;

    // Verify ownership
    const products = await query(
      `SELECT p.* FROM products p 
       JOIN sellers s ON p.seller_id = s.id 
       WHERE p.id = ? AND s.user_id = ?`,
      [id, req.userId]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    await query(
      "UPDATE products SET name = ?, description = ?, price = ?, quantity_available = ?, updated_at = NOW() WHERE id = ?",
      [name, description, price, quantityAvailable, id]
    );

    return res.status(200).json({ message: "Produk berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Delete product (seller only)
export const deleteProduct: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    // Verify ownership
    const products = await query(
      `SELECT p.* FROM products p 
       JOIN sellers s ON p.seller_id = s.id 
       WHERE p.id = ? AND s.user_id = ?`,
      [id, req.userId]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    await query("DELETE FROM products WHERE id = ?", [id]);

    return res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Get seller's products
export const getSellerProducts: RequestHandler = async (
  req: AuthRequest,
  res
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const results = await query(
      `SELECT p.* FROM products p 
       JOIN sellers s ON p.seller_id = s.id 
       WHERE s.user_id = ? 
       ORDER BY p.created_at DESC`,
      [req.userId]
    );

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
