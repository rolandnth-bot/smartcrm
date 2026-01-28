-- SmartCRM - Finance & Accounting Modules Database Schema
-- Date: 2026-01-23
-- Purpose: Separate Finance (operational) and Accounting (legal) modules

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- MODULE 1: PÉNZÜGY (FINANCE) - Operational Cashflow
-- ============================================================

-- --------------------------------------------------------
-- Bankszámlák (Bank Accounts)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL COMMENT 'Account name (e.g., "Wise EUR", "OTP HUF")',
  `bank_name` VARCHAR(100) NOT NULL COMMENT 'Bank name (Wise, Revolut, OTP, etc.)',
  `account_number` VARCHAR(100) DEFAULT NULL COMMENT 'Account number or identifier',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'HUF' COMMENT 'ISO currency code',
  `current_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Current balance',
  `initial_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Initial balance when added',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `currency` (`currency`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Pénzügyi kategóriák (Finance Categories)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_categories` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `parent_id` VARCHAR(36) DEFAULT NULL COMMENT 'For subcategories',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default categories
INSERT INTO `finance_categories` (`id`, `name`, `type`, `parent_id`, `sort_order`) VALUES
(UUID(), 'Bevételek', 'income', NULL, 1),
(UUID(), 'Foglalási bevétel', 'income', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Bevételek' LIMIT 1) AS tmp), 10),
(UUID(), 'Takarítási díj', 'income', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Bevételek' LIMIT 1) AS tmp), 20),
(UUID(), 'Kiadások', 'expense', NULL, 100),
(UUID(), 'Takarítás', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 110),
(UUID(), 'Karbantartás', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 120),
(UUID(), 'Szoftver', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 130),
(UUID(), 'Marketing', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 140),
(UUID(), 'Bér', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 150),
(UUID(), 'Egyéb', 'expense', (SELECT id FROM (SELECT id FROM finance_categories WHERE name = 'Kiadások' LIMIT 1) AS tmp), 999);

-- --------------------------------------------------------
-- Forgalmi tételek (Financial Transactions)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `finance_transactions` (
  `id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL COMMENT 'Positive for income, negative for expense',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'HUF',
  `exchange_rate` DECIMAL(10,4) DEFAULT NULL COMMENT 'Exchange rate to HUF at transaction date',
  `amount_huf` DECIMAL(15,2) NOT NULL COMMENT 'Amount converted to HUF',
  `type` ENUM('income', 'expense') NOT NULL,
  `category_id` VARCHAR(36) DEFAULT NULL,
  `bank_account_id` VARCHAR(36) DEFAULT NULL COMMENT 'Which bank account',
  `apartment_id` VARCHAR(36) DEFAULT NULL COMMENT 'Related apartment',
  `partner_id` VARCHAR(36) DEFAULT NULL COMMENT 'Related partner/client',
  `invoice_id` VARCHAR(36) DEFAULT NULL COMMENT 'Link to accounting invoice (if exists)',
  `description` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
  `recurring_pattern` VARCHAR(50) DEFAULT NULL COMMENT 'monthly, quarterly, yearly',
  `recurring_end_date` DATE DEFAULT NULL,
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `date` (`date`),
  KEY `type` (`type`),
  KEY `category_id` (`category_id`),
  KEY `bank_account_id` (`bank_account_id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `partner_id` (`partner_id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `is_recurring` (`is_recurring`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Bankszámla egyenleg változások (Bank Balance Adjustments)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bank_balance_adjustments` (
  `id` VARCHAR(36) NOT NULL,
  `bank_account_id` VARCHAR(36) NOT NULL,
  `adjustment_date` DATE NOT NULL,
  `previous_balance` DECIMAL(15,2) NOT NULL,
  `new_balance` DECIMAL(15,2) NOT NULL,
  `difference` DECIMAL(15,2) NOT NULL COMMENT 'new_balance - previous_balance',
  `reason` TEXT DEFAULT NULL COMMENT 'Why was adjustment made',
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bank_account_id` (`bank_account_id`),
  KEY `adjustment_date` (`adjustment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MODULE 2: KÖNYVELÉS (ACCOUNTING) - Legal Compliance
-- ============================================================

-- --------------------------------------------------------
-- Számlafiókok (Invoicing Accounts)
-- Each apartment+partner pair can have separate invoicing identity
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoicing_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL COMMENT 'Account name (e.g., "Lakás A57 - Partner XY")',
  `apartment_id` VARCHAR(36) DEFAULT NULL COMMENT 'Related apartment (optional)',
  `partner_id` VARCHAR(36) DEFAULT NULL COMMENT 'Related partner (optional)',
  `tax_number` VARCHAR(50) DEFAULT NULL COMMENT 'Tax number (adószám)',
  `company_name` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `invoice_number_prefix` VARCHAR(20) DEFAULT NULL COMMENT 'Prefix for invoice numbers (e.g., "A57-")',
  `invoice_number_counter` INT NOT NULL DEFAULT 0 COMMENT 'Current invoice number counter',
  `nav_technical_user` VARCHAR(255) DEFAULT NULL COMMENT 'NAV technical user for API',
  `nav_signing_key_encrypted` TEXT DEFAULT NULL COMMENT 'Encrypted NAV signing key',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `partner_id` (`partner_id`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Számlák (Invoices)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_number` VARCHAR(100) NOT NULL COMMENT 'Full invoice number (e.g., "A57-2026-001")',
  `invoicing_account_id` VARCHAR(36) NOT NULL,
  `invoice_type` ENUM('normal', 'advance', 'final', 'correction') NOT NULL DEFAULT 'normal',
  `status` ENUM('draft', 'issued', 'paid', 'storno', 'correction') NOT NULL DEFAULT 'draft',
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `payment_date` DATE DEFAULT NULL COMMENT 'When actually paid',
  `currency` VARCHAR(3) NOT NULL DEFAULT 'HUF',
  `exchange_rate` DECIMAL(10,4) DEFAULT NULL COMMENT 'MNB exchange rate at issue_date',
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Amount without VAT',
  `vat_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total VAT amount',
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Total with VAT',
  `total_amount_huf` DECIMAL(15,2) NOT NULL COMMENT 'Total converted to HUF',
  `partner_id` VARCHAR(36) DEFAULT NULL COMMENT 'Invoice recipient',
  `apartment_id` VARCHAR(36) DEFAULT NULL COMMENT 'Related apartment',
  `items_json` TEXT DEFAULT NULL COMMENT 'Invoice items as JSON',
  `notes` TEXT DEFAULT NULL,
  `pdf_path` VARCHAR(500) DEFAULT NULL COMMENT 'Path to generated PDF',
  `nav_transaction_id` VARCHAR(255) DEFAULT NULL COMMENT 'NAV Online Számla transaction ID',
  `nav_status` ENUM('not_sent', 'sent', 'accepted', 'rejected', 'error') DEFAULT 'not_sent',
  `nav_error_message` TEXT DEFAULT NULL,
  `corrected_invoice_id` VARCHAR(36) DEFAULT NULL COMMENT 'If this is a correction, link to original',
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `invoicing_account_id` (`invoicing_account_id`),
  KEY `status` (`status`),
  KEY `issue_date` (`issue_date`),
  KEY `partner_id` (`partner_id`),
  KEY `apartment_id` (`apartment_id`),
  KEY `nav_status` (`nav_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Számla tételek (Invoice Items)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `line_number` INT NOT NULL DEFAULT 1,
  `description` TEXT NOT NULL,
  `quantity` DECIMAL(10,3) NOT NULL DEFAULT 1.000,
  `unit_price` DECIMAL(15,2) NOT NULL,
  `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 27.00 COMMENT 'VAT rate: 0, 5, 18, 27',
  `vat_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(15,2) NOT NULL COMMENT 'quantity * unit_price + vat_amount',
  `ledger_account_id` VARCHAR(36) DEFAULT NULL COMMENT 'Mapped ledger account',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `ledger_account_id` (`ledger_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Díjbekérők (Proforma Invoices)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `proforma_invoices` (
  `id` VARCHAR(36) NOT NULL,
  `proforma_number` VARCHAR(100) NOT NULL,
  `invoicing_account_id` VARCHAR(36) NOT NULL,
  `status` ENUM('draft', 'sent', 'paid', 'expired', 'converted') NOT NULL DEFAULT 'draft',
  `issue_date` DATE NOT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'HUF',
  `exchange_rate` DECIMAL(10,4) DEFAULT NULL,
  `subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `vat_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `partner_id` VARCHAR(36) DEFAULT NULL,
  `apartment_id` VARCHAR(36) DEFAULT NULL,
  `items_json` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `converted_to_invoice_id` VARCHAR(36) DEFAULT NULL COMMENT 'If converted to real invoice',
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proforma_number` (`proforma_number`),
  KEY `invoicing_account_id` (`invoicing_account_id`),
  KEY `status` (`status`),
  KEY `converted_to_invoice_id` (`converted_to_invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Számlatükör (Chart of Accounts)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chart_of_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `account_number` VARCHAR(20) NOT NULL COMMENT 'Account number (e.g., "411", "571")',
  `account_name` VARCHAR(255) NOT NULL,
  `account_type` ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
  `parent_account_id` VARCHAR(36) DEFAULT NULL COMMENT 'For hierarchical structure',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_number` (`account_number`),
  KEY `account_type` (`account_type`),
  KEY `parent_account_id` (`parent_account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Hungarian chart of accounts (sample)
INSERT INTO `chart_of_accounts` (`id`, `account_number`, `account_name`, `account_type`, `sort_order`) VALUES
(UUID(), '411', 'Vevők', 'asset', 10),
(UUID(), '454', 'Fizetendő ÁFA', 'liability', 20),
(UUID(), '466', 'Levonandó ÁFA', 'asset', 30),
(UUID(), '571', 'Készpénz', 'asset', 40),
(UUID(), '911', 'Üzleti tevékenység bevétele', 'revenue', 50),
(UUID(), '922', 'Üzleti tevékenység költségei', 'expense', 60);

-- --------------------------------------------------------
-- Főkönyv (General Ledger)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ledger_entries` (
  `id` VARCHAR(36) NOT NULL,
  `entry_date` DATE NOT NULL,
  `entry_number` VARCHAR(50) NOT NULL COMMENT 'Entry number (e.g., "2026-001")',
  `description` TEXT DEFAULT NULL,
  `debit_account_id` VARCHAR(36) NOT NULL COMMENT 'Debit account from chart_of_accounts',
  `credit_account_id` VARCHAR(36) NOT NULL COMMENT 'Credit account from chart_of_accounts',
  `amount` DECIMAL(15,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'HUF',
  `source_type` ENUM('invoice', 'proforma', 'expense_document', 'manual') NOT NULL,
  `source_id` VARCHAR(36) DEFAULT NULL COMMENT 'ID of source document',
  `period` VARCHAR(7) NOT NULL COMMENT 'YYYY-MM format',
  `is_locked` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Period locked',
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `entry_date` (`entry_date`),
  KEY `period` (`period`),
  KEY `debit_account_id` (`debit_account_id`),
  KEY `credit_account_id` (`credit_account_id`),
  KEY `source_type` (`source_type`),
  KEY `source_id` (`source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- ÁFA regiszterek (VAT Registers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vat_entries` (
  `id` VARCHAR(36) NOT NULL,
  `entry_date` DATE NOT NULL,
  `vat_type` ENUM('payable', 'deductible') NOT NULL COMMENT 'Fizetendő / Levonandó',
  `vat_rate` DECIMAL(5,2) NOT NULL COMMENT '0, 5, 18, 27',
  `base_amount` DECIMAL(15,2) NOT NULL COMMENT 'Amount without VAT',
  `vat_amount` DECIMAL(15,2) NOT NULL COMMENT 'VAT amount',
  `invoice_id` VARCHAR(36) DEFAULT NULL COMMENT 'Source invoice',
  `invoice_item_id` VARCHAR(36) DEFAULT NULL COMMENT 'Source invoice item',
  `period` VARCHAR(7) NOT NULL COMMENT 'YYYY-MM format',
  `is_locked` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `entry_date` (`entry_date`),
  KEY `vat_type` (`vat_type`),
  KEY `period` (`period`),
  KEY `invoice_id` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NAV Online Számla log (NAV API Log)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `nav_api_logs` (
  `id` VARCHAR(36) NOT NULL,
  `invoice_id` VARCHAR(36) NOT NULL,
  `request_type` ENUM('send', 'query', 'cancel') NOT NULL,
  `request_xml` TEXT DEFAULT NULL COMMENT 'Request XML sent to NAV',
  `response_xml` TEXT DEFAULT NULL COMMENT 'Response XML from NAV',
  `nav_transaction_id` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('success', 'error', 'pending') NOT NULL,
  `error_code` VARCHAR(50) DEFAULT NULL,
  `error_message` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Audit log (Accounting module only)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounting_audit_log` (
  `id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'create, update, delete, issue, pay, storno, etc.',
  `entity_type` VARCHAR(50) NOT NULL COMMENT 'invoice, proforma, ledger_entry, etc.',
  `entity_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `changes_json` TEXT DEFAULT NULL COMMENT 'JSON of what changed',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `entity_type` (`entity_type`),
  KEY `entity_id` (`entity_id`),
  KEY `user_id` (`user_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CONNECTION TABLES
-- ============================================================

-- Finance transaction can link to accounting invoice
-- (Already in finance_transactions.invoice_id)

-- ============================================================
-- INDEXES for performance
-- ============================================================

-- Additional composite indexes for common queries
CREATE INDEX `idx_finance_transactions_date_type` ON `finance_transactions` (`date`, `type`);
CREATE INDEX `idx_finance_transactions_apartment_date` ON `finance_transactions` (`apartment_id`, `date`);
CREATE INDEX `idx_invoices_status_date` ON `invoices` (`status`, `issue_date`);
CREATE INDEX `idx_ledger_entries_period_locked` ON `ledger_entries` (`period`, `is_locked`);
CREATE INDEX `idx_vat_entries_period_type` ON `vat_entries` (`period`, `vat_type`);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Finance module is operational, can work independently
-- 2. Accounting module is legal compliance, always structured
-- 3. When invoice is paid → create finance_transaction automatically
-- 4. When expense invoice is booked → create finance_transaction automatically
-- 5. Finance entries can exist without accounting documents
-- 6. No DELETE on accounting data, only correction/storno
-- 7. Full audit log on accounting module
-- 8. Period locking prevents modification of closed periods
