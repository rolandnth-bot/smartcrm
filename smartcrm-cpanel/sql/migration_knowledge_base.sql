-- Knowledge Base tábla létrehozása
-- AI Asszisztens tudásbázis dokumentumokhoz

CREATE TABLE IF NOT EXISTS `knowledge_base` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT 'Dokumentum címe',
  `content` TEXT NOT NULL COMMENT 'Dokumentum tartalma',
  `category` ENUM('inventory', 'contracts', 'processes', 'pricing', 'partner') NOT NULL COMMENT 'Kategória',
  `source` VARCHAR(500) DEFAULT NULL COMMENT 'Forrás (fájl, URL, stb.)',
  `vector_embedding` TEXT DEFAULT NULL COMMENT 'Vector embedding (Pinecone/Supabase)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  FULLTEXT KEY `content_search` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calls tábla (Twilio hívásokhoz)
CREATE TABLE IF NOT EXISTS `calls` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `call_sid` VARCHAR(100) NOT NULL COMMENT 'Twilio Call SID',
  `from_number` VARCHAR(50) NOT NULL COMMENT 'Hívó telefonszám',
  `to_number` VARCHAR(50) NOT NULL COMMENT 'Fogadó telefonszám',
  `status` VARCHAR(50) NOT NULL COMMENT 'Hívás státusza',
  `duration` INT(11) DEFAULT NULL COMMENT 'Hívás hossza másodpercben',
  `recording_url` VARCHAR(500) DEFAULT NULL COMMENT 'Felvétel URL (ha van)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `call_sid` (`call_sid`),
  KEY `from_number` (`from_number`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
