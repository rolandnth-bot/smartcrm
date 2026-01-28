-- Migration: Lakás adatlap bővített mezők
-- Hozzáadja az új mezőket az apartments táblához

ALTER TABLE `apartments`
ADD COLUMN `ntak_number` VARCHAR(50) DEFAULT NULL AFTER `partner_id`,
ADD COLUMN `tax_number` VARCHAR(50) DEFAULT NULL AFTER `ntak_number`,
ADD COLUMN `wifi_speed_mbps` INT DEFAULT NULL AFTER `wifi_password`,
ADD COLUMN `service_package` ENUM('basic', 'pro', 'max') DEFAULT 'basic' AFTER `management_fee`,
ADD COLUMN `parking_revenue_eur` INT DEFAULT 0 AFTER `monthly_fee`,
ADD COLUMN `revenue_handling` ENUM('partner', 'us') DEFAULT 'partner' AFTER `parking_revenue_eur`,
ADD COLUMN `annual_revenue_plan_min_eur` INT DEFAULT NULL AFTER `revenue_handling`,
ADD COLUMN `annual_revenue_plan_expected_eur` INT DEFAULT NULL AFTER `annual_revenue_plan_min_eur`,
ADD COLUMN `cost_plan_percent` INT DEFAULT NULL AFTER `annual_revenue_plan_expected_eur`,
ADD COLUMN `guest_parking` ENUM('none', 'free_on_site', 'free_street', 'paid_on_site', 'paid_off_site') DEFAULT 'none' AFTER `max_guests`;

-- Indexek
CREATE INDEX `idx_ntak_number` ON `apartments` (`ntak_number`);
CREATE INDEX `idx_service_package` ON `apartments` (`service_package`);
