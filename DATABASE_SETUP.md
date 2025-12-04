# Ftrade Database Setup Guide

This guide provides instructions for setting up the Ftrade database using phpMyAdmin. Follow these steps to create all necessary tables for users, sellers, products, cart, and vouchers.

## Database Creation

First, create a new database in phpMyAdmin:

```sql
CREATE DATABASE ftrade DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Tables

### 1. Users Table

This table stores all user information (both buyers and sellers).

```sql
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `role` ENUM('buyer', 'seller') NOT NULL DEFAULT 'buyer',
  `profile_image` VARCHAR(255),
  `bio` TEXT,
  `address` TEXT,
  `city` VARCHAR(100),
  `province` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `is_verified` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `total_ratings` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_is_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Sellers Table

Extended information for users who are sellers.

```sql
CREATE TABLE `sellers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `business_name` VARCHAR(255) NOT NULL,
  `business_registration` VARCHAR(255),
  `bank_account_name` VARCHAR(255),
  `bank_account_number` VARCHAR(50),
  `bank_name` VARCHAR(100),
  `total_products` INT DEFAULT 0,
  `total_sales` INT DEFAULT 0,
  `total_revenue` DECIMAL(15,2) DEFAULT 0.00,
  `average_response_time` INT,
  `verification_document` VARCHAR(255),
  `verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Products Table

Product listings from sellers.

```sql
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` LONGTEXT,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity_available` INT NOT NULL,
  `unit` VARCHAR(50),
  `image_url` VARCHAR(255),
  `harvest_date` DATE,
  `expiry_date` DATE,
  `quality_grade` ENUM('A', 'B', 'C') DEFAULT 'A',
  `is_organic` BOOLEAN DEFAULT FALSE,
  `origin_location` VARCHAR(255),
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `total_ratings` INT DEFAULT 0,
  `total_sold` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE,
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_active` (`is_active`),
  FULLTEXT INDEX `ft_search` (`name`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Shopping Cart Table

Items in users' shopping carts.

```sql
CREATE TABLE `cart_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_cart_item` (`user_id`, `product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Orders Table

Customer orders.

```sql
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `buyer_id` INT UNSIGNED NOT NULL,
  `seller_id` INT UNSIGNED,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `discount_amount` DECIMAL(15,2) DEFAULT 0.00,
  `voucher_code` VARCHAR(50),
  `shipping_address` TEXT NOT NULL,
  `shipping_method` VARCHAR(50),
  `tracking_number` VARCHAR(100),
  `status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `payment_method` VARCHAR(50),
  `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`),
  INDEX `idx_buyer_id` (`buyer_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6. Order Items Table

Individual items within orders.

```sql
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. Vouchers Table

Discount vouchers/coupons.

```sql
CREATE TABLE `vouchers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `description` TEXT,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `max_discount_amount` DECIMAL(15,2),
  `minimum_purchase_amount` DECIMAL(15,2) DEFAULT 0.00,
  `usage_limit` INT,
  `used_count` INT DEFAULT 0,
  `per_user_limit` INT DEFAULT 1,
  `applicable_categories` VARCHAR(255),
  `applicable_seller_id` INT UNSIGNED,
  `is_active` BOOLEAN DEFAULT TRUE,
  `starts_at` TIMESTAMP NOT NULL,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`applicable_seller_id`) REFERENCES `sellers`(`id`) ON DELETE SET NULL,
  UNIQUE INDEX `idx_code` (`code`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. Voucher Usage Table

Track which users have used which vouchers.

```sql
CREATE TABLE `voucher_usage` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `voucher_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED,
  `discount_amount` DECIMAL(15,2) NOT NULL,
  `used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_voucher_id` (`voucher_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9. Reviews and Ratings Table

Customer reviews for products.

```sql
CREATE TABLE `product_reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `buyer_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `title` VARCHAR(255),
  `comment` TEXT,
  `helpful_count` INT DEFAULT 0,
  `is_verified_purchase` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_buyer_id` (`buyer_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 10. Seller Reviews Table

Customer reviews for sellers.

```sql
CREATE TABLE `seller_reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT UNSIGNED NOT NULL,
  `buyer_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `aspect` ENUM('quality', 'communication', 'delivery', 'overall') DEFAULT 'overall',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `sellers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_buyer_id` (`buyer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11. Product Categories Table

Categories for organizing products.

```sql
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(255),
  `image` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12. farmer verification

 for approved the farmer

'''sql
CREATE TABLE farmer_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_user_id INT NOT NULL,
  farmer_card_number VARCHAR(50),
  organization_name VARCHAR(100),
  is_verified TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_user_id) REFERENCES users(id)
);


## Sample Data Insertion

### Insert Sample Categories

```sql
INSERT INTO `categories` (`name`, `slug`, `description`, `is_active`) VALUES
('Vegetables', 'vegetables', 'Fresh vegetables from local farms', TRUE),
('Fruits', 'fruits', 'Seasonal fruits', TRUE),
('Grains', 'grains', 'Rice, wheat, and other grains', TRUE),
('Dairy', 'dairy', 'Milk, cheese, and dairy products', TRUE),
('Herbs & Spices', 'herbs-spices', 'Fresh herbs and dried spices', TRUE);
```

## Security Best Practices

1. **Use Password Hashing**: Store passwords using bcrypt or similar algorithms, never plain text
2. **SQL Injection Prevention**: Use prepared statements in your application code
3. **Data Encryption**: Encrypt sensitive data like bank account information
4. **Regular Backups**: Back up your database regularly
5. **Access Control**: Restrict database access to your application only
6. **SSL/TLS**: Use secure connections for all database communications
7. **Audit Logs**: Keep logs of important transactions and changes

## Performance Optimization Tips

1. Use appropriate indexes as shown in the table definitions
2. Regularly optimize tables: `OPTIMIZE TABLE table_name;`
3. Monitor slow queries and optimize them
4. Archive old orders periodically
5. Use connection pooling in your application
6. Consider caching frequently accessed data

## Relationships Overview

```
users
  ├── sellers (1-to-1)
  ├── orders (1-to-many)
  ├── cart_items (1-to-many)
  ├── product_reviews (1-to-many)
  └── seller_reviews (1-to-many)

sellers
  ├── products (1-to-many)
  ├── orders (1-to-many)
  ├── seller_reviews (1-to-many)
  └── vouchers (1-to-many)

products
  ├── cart_items (1-to-many)
  ├── order_items (1-to-many)
  └── product_reviews (1-to-many)

orders
  ├── order_items (1-to-many)
  └── voucher_usage (1-to-many)

vouchers
  └── voucher_usage (1-to-many)
```

## Next Steps

1. Execute these SQL statements in phpMyAdmin to create the database and tables
2. Implement backend API endpoints using your chosen framework (Express, Laravel, etc.)
3. Add authentication and authorization logic
4. Create admin panel for managing products, vouchers, and user accounts
5. Implement payment gateway integration
6. Set up email notifications for orders and account activities

## Support

For questions or assistance with database setup, please refer to the phpMyAdmin documentation or contact your database administrator.
