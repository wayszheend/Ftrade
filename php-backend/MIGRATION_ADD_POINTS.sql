-- Add points column to users table for loyalty system
-- Run this SQL in phpMyAdmin to enable the points system

ALTER TABLE `users` ADD COLUMN `points` INT DEFAULT 0 AFTER `total_ratings`;
ALTER TABLE `users` ADD INDEX `idx_points` (`points`);

-- Optional: Create a points history table to track point transactions
CREATE TABLE IF NOT EXISTS `points_transactions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `points` INT NOT NULL,
  `transaction_type` ENUM('earn', 'spend', 'bonus') DEFAULT 'earn',
  `description` VARCHAR(255),
  `order_id` INT UNSIGNED,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create points discount table for applying points as discounts
CREATE TABLE IF NOT EXISTS `point_discounts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `points_required` INT NOT NULL,
  `discount_amount` DECIMAL(15,2) NOT NULL,
  `description` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_points` (`points_required`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default point conversion rates (10 points = 2000 Rp)
INSERT INTO `point_discounts` (`points_required`, `discount_amount`, `description`) VALUES
(10, 2000, '10 poin = Rp 2.000'),
(50, 10000, '50 poin = Rp 10.000'),
(100, 20000, '100 poin = Rp 20.000');
