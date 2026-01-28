-- Revenue Plan/Fact tábla létrehozása
-- Bevételi terv/tény adatok tárolása

CREATE TABLE IF NOT EXISTS `revenue_plan_fact` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `period` VARCHAR(50) NOT NULL COMMENT 'Időszak értéke (pl. 2026-01 havi, 2026-01-28 napi)',
  `period_type` ENUM('year', 'month', 'week', 'day') NOT NULL COMMENT 'Időszak típusa',
  `plan_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tervezett bevétel',
  `fact_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tényleges bevétel',
  `completion_rate` DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Teljesítési arány (%)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `period_type_unique` (`period`, `period_type`),
  KEY `period_type` (`period_type`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
