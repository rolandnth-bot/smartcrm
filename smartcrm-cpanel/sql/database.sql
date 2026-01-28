-- SmartCRM Database Schema
-- MySQL 5.7+ / MariaDB 10.3+
-- Charset: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Felhasználók (admin, partner)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'partner', 'worker') NOT NULL DEFAULT 'partner',
  `phone` VARCHAR(50) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `tax_number` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `bank_account` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Takarítók (dolgozók)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workers` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `hourly_rate` INT DEFAULT 2500,
  `textile_rate` INT DEFAULT 600,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Apartmanok
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `apartments` (
  `id` VARCHAR(36) NOT NULL,
  `partner_id` VARCHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `zip_code` VARCHAR(20) DEFAULT NULL,
  `district` VARCHAR(50) DEFAULT NULL,
  `size_sqm` INT DEFAULT NULL,
  `rooms` INT DEFAULT 1,
  `bathrooms` INT DEFAULT 1,
  `max_guests` INT DEFAULT 2,
  `double_beds` INT DEFAULT 1,
  `single_beds` INT DEFAULT 0,
  `sofa_bed_single` INT DEFAULT 0,
  `sofa_bed_double` INT DEFAULT 0,
  `other_double_beds` INT DEFAULT 0,
  `time_frame` DECIMAL(3,1) DEFAULT 2.0,
  `cleaning_fee` INT DEFAULT 0,
  `management_fee` INT DEFAULT 25,
  `monthly_fee` INT DEFAULT 0,
  `tourism_tax_type` ENUM('percent', 'fixed') DEFAULT 'percent',
  `tourism_tax_value` INT DEFAULT 4,
  `wifi_name` VARCHAR(100) DEFAULT NULL,
  `wifi_password` VARCHAR(100) DEFAULT NULL,
  `door_code` VARCHAR(50) DEFAULT NULL,
  `key_location` TEXT DEFAULT NULL,
  `check_in_instructions` TEXT DEFAULT NULL,
  `check_out_instructions` TEXT DEFAULT NULL,
  `house_rules` TEXT DEFAULT NULL,
  `parking_info` TEXT DEFAULT NULL,
  `airbnb_url` VARCHAR(500) DEFAULT NULL,
  `booking_url` VARCHAR(500) DEFAULT NULL,
  `airbnb_username` VARCHAR(255) DEFAULT NULL,
  `airbnb_password` VARCHAR(255) DEFAULT NULL,
  `booking_username` VARCHAR(255) DEFAULT NULL,
  `booking_password` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `partner_id` (`partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Apartman felszereltség (amenities)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `apartment_amenities` (
  `id` INT AUTO_INCREMENT,
  `apartment_id` VARCHAR(36) NOT NULL,
  `platform` ENUM('airbnb', 'booking') NOT NULL,
  `amenity` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  UNIQUE KEY `apt_platform_amenity` (`apartment_id`, `platform`, `amenity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Apartman raktárkészlet (inventory)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `apartment_inventory` (
  `id` INT AUTO_INCREMENT,
  `apartment_id` VARCHAR(36) NOT NULL,
  `item_type` VARCHAR(100) NOT NULL,
  `item_size` VARCHAR(50) DEFAULT NULL,
  `quantity` INT DEFAULT 0,
  `brand` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  UNIQUE KEY `apt_item_size` (`apartment_id`, `item_type`, `item_size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Munka kiosztás (jobs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` VARCHAR(36) NOT NULL,
  `worker_id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `job_date` DATE NOT NULL,
  `checkout_time` TIME DEFAULT NULL,
  `checkin_time` TIME DEFAULT NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `cleaning_hours` DECIMAL(4,2) DEFAULT NULL,
  `cleaning_earnings` INT DEFAULT 0,
  `has_textile` TINYINT(1) DEFAULT 0,
  `textile_earnings` INT DEFAULT 0,
  `expenses` INT DEFAULT 0,
  `expense_note` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `worker_id` (`worker_id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `job_date` (`job_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Textil szállítások
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `textile_deliveries` (
  `id` VARCHAR(36) NOT NULL,
  `job_id` VARCHAR(36) DEFAULT NULL,
  `worker_id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `delivery_date` DATE NOT NULL,
  `bag_count` INT DEFAULT 1,
  `earnings` INT DEFAULT 0,
  `status` ENUM('scheduled', 'delivered', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `job_id` (`job_id`),
  KEY `worker_id` (`worker_id`),
  KEY `apartment_id` (`apartment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Mosoda (laundry)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `laundry_orders` (
  `id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `order_date` DATE NOT NULL,
  `pickup_date` DATE DEFAULT NULL,
  `delivery_date` DATE DEFAULT NULL,
  `bag_count` INT DEFAULT 1,
  `weight_kg` DECIMAL(5,2) DEFAULT NULL,
  `cost` INT DEFAULT 0,
  `status` ENUM('pending', 'picked_up', 'washing', 'ready', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `order_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Foglalások (bookings)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `platform` ENUM('airbnb', 'booking', 'direct', 'other') NOT NULL DEFAULT 'airbnb',
  `guest_name` VARCHAR(255) DEFAULT NULL,
  `guest_phone` VARCHAR(50) DEFAULT NULL,
  `guest_email` VARCHAR(255) DEFAULT NULL,
  `guest_count` INT DEFAULT 1,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `check_in_time` TIME DEFAULT '15:00',
  `check_out_time` TIME DEFAULT '11:00',
  `nights` INT DEFAULT 1,
  `nightly_rate` INT DEFAULT 0,
  `total_amount` INT DEFAULT 0,
  `cleaning_fee` INT DEFAULT 0,
  `platform_fee` INT DEFAULT 0,
  `tourism_tax` INT DEFAULT 0,
  `net_revenue` INT DEFAULT 0,
  `status` ENUM('confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') NOT NULL DEFAULT 'confirmed',
  `notes` TEXT DEFAULT NULL,
  `external_id` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `check_in` (`check_in`),
  KEY `check_out` (`check_out`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Költségek (expenses)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) DEFAULT NULL,
  `worker_id` VARCHAR(36) DEFAULT NULL,
  `category` ENUM('cleaning', 'textile', 'laundry', 'maintenance', 'supplies', 'other') NOT NULL DEFAULT 'other',
  `amount` INT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `expense_date` DATE NOT NULL,
  `receipt_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `worker_id` (`worker_id`),
  KEY `expense_date` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Partner rendelések (webshop)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `partner_orders` (
  `id` VARCHAR(36) NOT NULL,
  `partner_id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) DEFAULT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_amount` INT NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `shipping_address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `partner_id` (`partner_id`),
  KEY `apartment_id` (`apartment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Rendelés tételek
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT,
  `order_id` VARCHAR(36) NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_size` VARCHAR(50) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` INT NOT NULL,
  `total_price` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Beállítások
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Alapértelmezett beállítások
-- --------------------------------------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('default_hourly_rate', '2500'),
('default_textile_rate', '600'),
('laundry_price_per_kg', '800'),
('default_management_fee', '25'),
('default_cleaning_fee', '15000'),
('company_name', 'SmartCRM'),
('company_email', 'info@smartcrm.hu'),
('company_phone', '+36 1 234 5678')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- --------------------------------------------------------
-- Alapértelmezett admin felhasználó (jelszó: admin123)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `status`) VALUES
('admin-001', 'admin@smartcrm.hu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
