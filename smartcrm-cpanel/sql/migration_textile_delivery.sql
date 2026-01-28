-- Migration: Textil szállítás módja és automatikus költségszámítás
-- Hozzáadja az új mezőket a jobs táblához

ALTER TABLE `jobs`
ADD COLUMN `textile_delivery_mode` ENUM('worker', 'laundry') DEFAULT NULL AFTER `has_textile`,
ADD COLUMN `laundry_time_slot` VARCHAR(20) DEFAULT NULL AFTER `textile_delivery_mode`,
ADD COLUMN `textile_worker_fee` INT DEFAULT 0 AFTER `laundry_time_slot`,
ADD COLUMN `laundry_cost` INT DEFAULT 0 AFTER `textile_worker_fee`,
ADD COLUMN `assigned_worker_count` INT DEFAULT 0 AFTER `laundry_cost`;

-- Index a textile_delivery_mode mezőhöz (szűréshez)
CREATE INDEX `idx_textile_delivery_mode` ON `jobs` (`textile_delivery_mode`);
