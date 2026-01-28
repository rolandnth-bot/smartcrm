-- SmartCRM iCal Sync Migration
-- Run this migration to add iCal sync functionality
-- Date: 2026-01-23

-- --------------------------------------------------------
-- 1. Add iCal URL columns to apartments table
-- --------------------------------------------------------
ALTER TABLE `apartments`
ADD COLUMN IF NOT EXISTS `ical_airbnb` VARCHAR(500) DEFAULT NULL AFTER `booking_url`,
ADD COLUMN IF NOT EXISTS `ical_booking` VARCHAR(500) DEFAULT NULL AFTER `ical_airbnb`,
ADD COLUMN IF NOT EXISTS `ical_szallas` VARCHAR(500) DEFAULT NULL AFTER `ical_booking`,
ADD COLUMN IF NOT EXISTS `ical_own` VARCHAR(500) DEFAULT NULL AFTER `ical_szallas`;

-- --------------------------------------------------------
-- 2. Add source tracking columns to bookings table
-- --------------------------------------------------------
ALTER TABLE `bookings`
ADD COLUMN IF NOT EXISTS `source` ENUM('manual', 'ical_sync', 'csv_import', 'api') DEFAULT 'manual' AFTER `status`,
ADD COLUMN IF NOT EXISTS `feed_id` VARCHAR(50) DEFAULT NULL AFTER `source`,
ADD COLUMN IF NOT EXISTS `uid` VARCHAR(255) DEFAULT NULL AFTER `feed_id`,
ADD COLUMN IF NOT EXISTS `synced_at` TIMESTAMP NULL DEFAULT NULL AFTER `uid`,
ADD INDEX IF NOT EXISTS `idx_external_id` (`external_id`),
ADD INDEX IF NOT EXISTS `idx_uid` (`uid`),
ADD INDEX IF NOT EXISTS `idx_source` (`source`);

-- Update existing bookings to have source = 'manual'
UPDATE `bookings` SET `source` = 'manual' WHERE `source` IS NULL OR `source` = '';

-- --------------------------------------------------------
-- 3. Create sync_logs table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sync_logs` (
  `id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `feed_id` VARCHAR(50) DEFAULT NULL,
  `type` ENUM('ical_sync', 'csv_import', 'manual') NOT NULL DEFAULT 'ical_sync',
  `status` ENUM('success', 'partial', 'failed') NOT NULL DEFAULT 'success',
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `duration` INT DEFAULT NULL COMMENT 'Duration in milliseconds',
  `created_count` INT DEFAULT 0,
  `updated_count` INT DEFAULT 0,
  `cancelled_count` INT DEFAULT 0,
  `skipped_count` INT DEFAULT 0,
  `errors_json` TEXT DEFAULT NULL,
  `triggered_by` ENUM('user', 'cron', 'system') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `feed_id` (`feed_id`),
  KEY `type` (`type`),
  KEY `status` (`status`),
  KEY `started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Create import_batches table (for CSV/ICS imports)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `import_batches` (
  `id` VARCHAR(36) NOT NULL,
  `apartment_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_type` ENUM('csv', 'ics') NOT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `mapping_json` TEXT DEFAULT NULL,
  `total_rows` INT DEFAULT 0,
  `valid_rows` INT DEFAULT 0,
  `imported_rows` INT DEFAULT 0,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `status` (`status`),
  KEY `uploaded_at` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Notes:
-- - The iCal columns (ical_airbnb, ical_booking, etc.) store the feed URLs
-- - The sync_logs table tracks all sync operations
-- - The bookings table now tracks source (manual/ical_sync/csv_import/api)
-- - The uid column in bookings stores the iCal UID for duplicate detection
-- --------------------------------------------------------
