-- SmartCRM - Teszt Adatok (Test Data Seed)
-- Date: 2026-01-23
-- Purpose: Teljes rendszer teszteléshez valósághű teszt adatok

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. FELHASZNÁLÓK (Users / Partners)
-- ============================================================

-- Admin felhasználó
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `phone`, `company_name`, `tax_number`, `status`, `created_at`) VALUES
('admin-001', 'admin@smartcrm.hu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Adminisztrátor', 'admin', '+36-30-123-4567', 'SmartCRM Kft.', '12345678-1-23', 'active', NOW());

-- Partner felhasználók
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `phone`, `company_name`, `tax_number`, `address`, `bank_account`, `status`, `created_at`) VALUES
('partner-001', 'kovacs.peter@example.hu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kovács Péter', 'partner', '+36-30-111-2222', 'Kovács Ingatlan Kft.', '11111111-1-11', 'Budapest, Fő utca 1.', 'HU12-3456-7890-1234-5678-9012-3456', 'active', '2024-01-15 10:00:00'),
('partner-002', 'nagy.maria@example.hu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nagy Mária', 'partner', '+36-30-222-3333', 'Nagy Mária Ingatlan', '22222222-2-22', 'Budapest, Kossuth Lajos utca 5.', 'HU98-7654-3210-9876-5432-1098-7654', 'active', '2024-02-20 14:30:00'),
('partner-003', 'szabo.laszlo@example.hu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Szabó László', 'partner', '+36-30-333-4444', NULL, NULL, 'Budapest, Andrássy út 10.', NULL, 'active', '2024-03-10 09:15:00');

-- Dolgozók (Workers)
INSERT INTO `workers` (`id`, `user_id`, `name`, `phone`, `email`, `hourly_rate`, `textile_rate`, `status`, `created_at`) VALUES
('worker-001', NULL, 'Tóth Anna', '+36-30-555-6666', 'toth.anna@example.hu', 2500, 600, 'active', '2024-01-05 08:00:00'),
('worker-002', NULL, 'Horváth Zsuzsa', '+36-30-666-7777', 'horvath.zsuzsa@example.hu', 2800, 650, 'active', '2024-01-10 08:00:00'),
('worker-003', NULL, 'Kiss János', '+36-30-777-8888', 'kiss.janos@example.hu', 3000, 700, 'active', '2024-02-01 08:00:00');

-- ============================================================
-- 2. LAKÁSOK (Apartments)
-- ============================================================

INSERT INTO `apartments` (
  `id`, `partner_id`, `name`, `address`, `city`, `zip_code`, `district`,
  `size_sqm`, `rooms`, `bathrooms`, `max_guests`, `double_beds`, `single_beds`,
  `time_frame`, `cleaning_fee`, `management_fee`, `monthly_fee`,
  `tourism_tax_type`, `tourism_tax_value`,
  `wifi_name`, `wifi_password`, `door_code`, `key_location`,
  `check_in_instructions`, `check_out_instructions`,
  `airbnb_url`, `booking_url`,
  `ical_airbnb`, `ical_booking`, `ical_szallas`, `ical_own`,
  `status`, `notes`, `created_at`
) VALUES
(
  'apt-001', 'partner-001', 'A57 Downtown', 
  'Budapest, Váci utca 57.', 'Budapest', '1056', 'V. kerület',
  45, 1, 1, 2, 1, 0,
  2.0, 15000, 25, 30000,
  'percent', 4,
  'A57-WiFi', 'wifi123456', '1234', 'Kulcstartó a bejáratnál',
  'Check-in: 15:00-tól. Kulcs a kulcstartóban, kód: 1234', 
  'Check-out: 11:00-ig. Kulcs vissza a kulcstartóba.',
  'https://airbnb.com/rooms/12345678', 'https://booking.com/hotel/123456',
  'https://airbnb.com/calendar/ical/12345678.ics', 
  'https://admin.booking.com/hotels/123456/bookings/calendar/export.ics',
  NULL, 'https://smartcrm.hu/ical/export/apt-001.ics',
  'active', 'Központi helyen, metró közelében. Modern berendezés.', '2024-01-10 10:00:00'
),
(
  'apt-002', 'partner-001', 'Angyalföldi Panoráma',
  'Budapest, Angyalföldi út 25.', 'Budapest', '1138', 'XIII. kerület',
  60, 2, 1, 4, 2, 0,
  2.5, 20000, 25, 35000,
  'percent', 4,
  'Angyalfold-WiFi', 'wifi789012', '5678', 'Postaládában',
  'Check-in: 15:00-tól. Kulcs a postaládában, kód: 5678',
  'Check-out: 11:00-ig. Kulcs vissza a postaládába.',
  'https://airbnb.com/rooms/87654321', 'https://booking.com/hotel/87654321',
  'https://airbnb.com/calendar/ical/87654321.ics',
  'https://admin.booking.com/hotels/87654321/bookings/calendar/export.ics',
  'https://szallas.hu/ical/export/12345.ics', 'https://smartcrm.hu/ical/export/apt-002.ics',
  'active', 'Panorámás kilátás, tágas lakás. Parkolóhely elérhető.', '2024-01-15 11:00:00'
),
(
  'apt-003', 'partner-002', 'B20 Keleti',
  'Budapest, Baross tér 20.', 'Budapest', '1087', 'VIII. kerület',
  35, 1, 1, 2, 1, 0,
  2.0, 12000, 25, 25000,
  'percent', 4,
  'B20-WiFi', 'wifi345678', '9012', 'Kulcstartó',
  'Check-in: 15:00-tól. Kulcs a kulcstartóban, kód: 9012',
  'Check-out: 11:00-ig.',
  NULL, NULL,
  NULL, NULL, NULL, 'https://smartcrm.hu/ical/export/apt-003.ics',
  'active', 'Közvetlenül a Keleti pályaudvar mellett. Ideális rövid távú látogatóknak.', '2024-02-01 09:00:00'
),
(
  'apt-004', 'partner-002', 'Dunakeszi Meder',
  'Dunakeszi, Meder utca 12.', 'Dunakeszi', '2120', NULL,
  80, 3, 2, 6, 3, 0,
  3.0, 25000, 25, 40000,
  'percent', 4,
  'Meder-WiFi', 'wifi901234', '3456', 'Kulcstartó a kapuban',
  'Check-in: 15:00-tól. Kulcs a kapu kulcstartójában, kód: 3456',
  'Check-out: 11:00-ig.',
  'https://airbnb.com/rooms/11223344', NULL,
  'https://airbnb.com/calendar/ical/11223344.ics', NULL,
  NULL, 'https://smartcrm.hu/ical/export/apt-004.ics',
  'active', 'Családi ház, nagy kert. Családoknak ideális.', '2024-02-10 10:30:00'
),
(
  'apt-005', 'partner-003', 'Margit-sziget Panoráma',
  'Budapest, Margit-sziget 5.', 'Budapest', '1138', 'XIII. kerület',
  55, 2, 1, 4, 2, 0,
  2.5, 18000, 25, 32000,
  'percent', 4,
  'Margit-WiFi', 'wifi567890', '7890', 'Kulcstartó',
  'Check-in: 15:00-tól.',
  'Check-out: 11:00-ig.',
  NULL, 'https://booking.com/hotel/55667788',
  NULL, 'https://admin.booking.com/hotels/55667788/bookings/calendar/export.ics',
  NULL, 'https://smartcrm.hu/ical/export/apt-005.ics',
  'active', 'Csendes környezet, park közelében.', '2024-03-01 08:00:00'
);

-- Lakások felszereltsége (Amenities)
INSERT INTO `apartment_amenities` (`apartment_id`, `platform`, `amenity`) VALUES
('apt-001', 'airbnb', 'WiFi'),
('apt-001', 'airbnb', 'TV'),
('apt-001', 'airbnb', 'Klima'),
('apt-001', 'airbnb', 'Teli berendezés'),
('apt-001', 'booking', 'WiFi'),
('apt-001', 'booking', 'TV'),
('apt-001', 'booking', 'Klima'),
('apt-002', 'airbnb', 'WiFi'),
('apt-002', 'airbnb', 'TV'),
('apt-002', 'airbnb', 'Klima'),
('apt-002', 'airbnb', 'Parkoló'),
('apt-002', 'booking', 'WiFi'),
('apt-002', 'booking', 'TV'),
('apt-002', 'booking', 'Klima'),
('apt-002', 'booking', 'Parkoló'),
('apt-003', 'airbnb', 'WiFi'),
('apt-003', 'airbnb', 'TV'),
('apt-004', 'airbnb', 'WiFi'),
('apt-004', 'airbnb', 'TV'),
('apt-004', 'airbnb', 'Kert'),
('apt-004', 'airbnb', 'Parkoló'),
('apt-005', 'booking', 'WiFi'),
('apt-005', 'booking', 'TV'),
('apt-005', 'booking', 'Klima');

-- Lakások készlete (Inventory)
INSERT INTO `apartment_inventory` (`apartment_id`, `item_type`, `item_size`, `quantity`, `brand`, `notes`) VALUES
('apt-001', 'Ágynemű szett', '160x200', 2, 'IKEA', 'Fehér színű'),
('apt-001', 'Törölköző', 'Nagy', 4, 'Zara Home', NULL),
('apt-001', 'Törölköző', 'Közepes', 4, 'Zara Home', NULL),
('apt-002', 'Ágynemű szett', '160x200', 4, 'IKEA', 'Fehér színű'),
('apt-002', 'Törölköző', 'Nagy', 6, 'Zara Home', NULL),
('apt-002', 'Párna', 'Standard', 8, 'IKEA', NULL),
('apt-003', 'Ágynemű szett', '140x200', 2, 'IKEA', NULL),
('apt-004', 'Ágynemű szett', '160x200', 6, 'IKEA', NULL),
('apt-004', 'Törölköző', 'Nagy', 8, 'Zara Home', NULL);

-- ============================================================
-- 3. LEAD-EK (Leads)
-- ============================================================

INSERT INTO `leads` (`id`, `name`, `email`, `phone`, `source`, `status`, `rating`, `notes`, `apartment_interest`, `budget`, `created_at`) VALUES
('lead-001', 'Nagy István', 'nagy.istvan@example.hu', '+36-30-111-1111', 'website', 'new', 'hot', 'Sürgős, 2 hét múlva érkezik', 'A57 Downtown', '50000-80000', '2026-01-15 10:00:00'),
('lead-002', 'Kovácsné Mária', 'kovacsne.maria@example.hu', '+36-30-222-2222', 'facebook', 'contacted', 'warm', 'Családi kirándulás, 4 fő', 'Angyalföldi Panoráma', '60000-90000', '2026-01-16 14:30:00'),
('lead-003', 'Szabó János', 'szabo.janos@example.hu', '+36-30-333-3333', 'instagram', 'meeting', 'hot', 'Üzleti út, 1 hét', 'B20 Keleti', '40000-60000', '2026-01-17 09:15:00'),
('lead-004', 'Tóth Anna', 'toth.anna@example.hu', '+36-30-444-4444', 'website', 'offer', 'warm', 'Ajánlat kiküldve, válaszra vár', 'Dunakeszi Meder', '80000-120000', '2026-01-18 11:00:00'),
('lead-005', 'Horváth Péter', 'horvath.peter@example.hu', '+36-30-555-5555', 'booking', 'negotiation', 'hot', 'Ár tárgyalás folyamatban', 'Margit-sziget Panoráma', '70000-100000', '2026-01-19 15:45:00'),
('lead-006', 'Kiss Zsuzsa', 'kiss.zsuzsa@example.hu', '+36-30-666-6666', 'website', 'won', 'hot', 'Foglalás megerősítve!', 'A57 Downtown', '50000-80000', '2026-01-20 10:30:00'),
('lead-007', 'Varga László', 'varga.laszlo@example.hu', '+36-30-777-7777', 'facebook', 'lost', 'cold', 'Túl drágának találta', 'Angyalföldi Panoráma', '40000-50000', '2026-01-21 13:20:00');

-- ============================================================
-- 4. FOGLALÁSOK (Bookings)
-- ============================================================

INSERT INTO `bookings` (
  `id`, `apartment_id`, `platform`, `guest_name`, `guest_phone`, `guest_email`, `guest_count`,
  `check_in`, `check_out`, `check_in_time`, `check_out_time`, `nights`,
  `nightly_rate`, `total_amount`, `cleaning_fee`, `platform_fee`, `tourism_tax`, `net_revenue`,
  `status`, `notes`, `external_id`, `source`, `uid`, `created_at`
) VALUES
(
  'booking-001', 'apt-001', 'airbnb', 'Kiss Zsuzsa', '+36-30-666-6666', 'kiss.zsuzsa@example.hu', 2,
  '2026-01-25', '2026-01-30', '15:00', '11:00', 5,
  12000, 60000, 15000, 6000, 2400, 36600,
  'confirmed', 'Foglalás megerősítve, kulcs átadás 15:00-kor', 'airbnb-123456', 'ical_sync', 'airbnb-uid-123456', '2026-01-20 10:30:00'
),
(
  'booking-002', 'apt-001', 'booking', 'Nagy István', '+36-30-111-1111', 'nagy.istvan@example.hu', 2,
  '2026-02-05', '2026-02-10', '15:00', '11:00', 5,
  13000, 65000, 15000, 6500, 2600, 40900,
  'confirmed', 'Korai check-in kérés: 14:00', 'booking-789012', 'ical_sync', 'booking-uid-789012', '2026-01-18 14:00:00'
),
(
  'booking-003', 'apt-002', 'airbnb', 'Kovácsné Mária', '+36-30-222-2222', 'kovacsne.maria@example.hu', 4,
  '2026-01-23', '2026-01-28', '15:00', '11:00', 5,
  15000, 75000, 20000, 7500, 3000, 44500,
  'checked_in', 'Családi kirándulás, 2 gyerek', 'airbnb-345678', 'manual', NULL, '2026-01-16 14:30:00'
),
(
  'booking-004', 'apt-002', 'booking', 'Szabó János', '+36-30-333-3333', 'szabo.janos@example.hu', 2,
  '2026-02-15', '2026-02-22', '15:00', '11:00', 7,
  14000, 98000, 20000, 9800, 3920, 64280,
  'confirmed', 'Üzleti út, hosszabb tartózkodás', 'booking-456789', 'ical_sync', 'booking-uid-456789', '2026-01-17 09:15:00'
),
(
  'booking-005', 'apt-003', 'direct', 'Tóth Anna', '+36-30-444-4444', 'toth.anna@example.hu', 2,
  '2026-01-24', '2026-01-27', '15:00', '11:00', 3,
  10000, 30000, 12000, 0, 1200, 16800,
  'confirmed', 'Direkt foglalás, ismert vendég', NULL, 'manual', NULL, '2026-01-18 11:00:00'
),
(
  'booking-006', 'apt-004', 'airbnb', 'Horváth Péter', '+36-30-555-5555', 'horvath.peter@example.hu', 6,
  '2026-02-10', '2026-02-17', '15:00', '11:00', 7,
  18000, 126000, 25000, 12600, 5040, 83360,
  'confirmed', 'Családi ház, nagy család', 'airbnb-567890', 'ical_sync', 'airbnb-uid-567890', '2026-01-19 15:45:00'
),
(
  'booking-007', 'apt-005', 'booking', 'Varga László', '+36-30-777-7777', 'varga.laszlo@example.hu', 2,
  '2026-02-20', '2026-02-25', '15:00', '11:00', 5,
  11000, 55000, 18000, 5500, 2200, 29300,
  'confirmed', 'Rövid tartózkodás', 'booking-678901', 'ical_sync', 'booking-uid-678901', '2026-01-21 13:20:00'
),
(
  'booking-008', 'apt-001', 'airbnb', 'Kovács Márta', '+36-30-888-8888', 'kovacs.marta@example.hu', 2,
  '2026-02-28', '2026-03-05', '15:00', '11:00', 5,
  12000, 60000, 15000, 6000, 2400, 36600,
  'confirmed', 'Márciusi foglalás', 'airbnb-234567', 'ical_sync', 'airbnb-uid-234567', '2026-01-22 10:00:00'
);

-- ============================================================
-- 5. TAKARÍTÁSOK (Cleanings)
-- ============================================================

INSERT INTO `cleanings` (
  `id`, `apartment_id`, `booking_id`, `date`, `amount`, `currency`, `status`,
  `assignee_user_id`, `cleaning_hours`, `has_textile`, `textile_earnings`, `expenses`, `expense_note`,
  `checkin_time`, `checkout_time`, `notes`, `created_at`
) VALUES
(
  'cleaning-001', 'apt-001', NULL, '2026-01-23', 15000, 'HUF', 'planned',
  'worker-001', 3, FALSE, 0, 0, NULL,
  NULL, NULL, 'Heti rendszeres takarítás', '2026-01-22 08:00:00'
),
(
  'cleaning-002', 'apt-002', 'booking-003', '2026-01-28', 20000, 'HUF', 'planned',
  'worker-002', 4, TRUE, 1200, 0, NULL,
  '11:00', '15:00', 'Check-out takarítás, textil mosás', '2026-01-27 08:00:00'
),
(
  'cleaning-003', 'apt-001', 'booking-001', '2026-01-30', 15000, 'HUF', 'planned',
  'worker-001', 3, FALSE, 0, 0, NULL,
  '11:00', '15:00', 'Check-out takarítás', '2026-01-29 08:00:00'
),
(
  'cleaning-004', 'apt-003', 'booking-005', '2026-01-27', 12000, 'HUF', 'completed',
  'worker-003', 2.5, FALSE, 0, 500, 'Tisztítószerek',
  '11:00', '15:00', 'Check-out takarítás befejezve', '2026-01-26 08:00:00'
),
(
  'cleaning-005', 'apt-002', 'booking-004', '2026-02-22', 20000, 'HUF', 'planned',
  'worker-002', 4, TRUE, 1200, 0, NULL,
  '11:00', '15:00', 'Check-out takarítás, textil', '2026-02-21 08:00:00'
);

-- ============================================================
-- 6. PÉNZÜGYI TÉTELEK (Finance Transactions)
-- ============================================================

-- Először bankszámlák
INSERT INTO `bank_accounts` (`id`, `name`, `bank_name`, `account_number`, `currency`, `current_balance`, `initial_balance`, `is_active`, `created_at`) VALUES
('bank-001', 'Wise EUR', 'Wise', 'EUR-1234567890', 'EUR', 5000.00, 5000.00, TRUE, '2024-01-01 00:00:00'),
('bank-002', 'Revolut HUF', 'Revolut', 'HUF-9876543210', 'HUF', 2500000.00, 2000000.00, TRUE, '2024-01-01 00:00:00'),
('bank-003', 'OTP HUF', 'OTP Bank', 'HU12-3456-7890-1234-5678-9012-3456', 'HUF', 1500000.00, 1500000.00, TRUE, '2024-01-01 00:00:00');

-- Kategóriák (ha még nincs)
INSERT INTO `finance_categories` (`id`, `name`, `type`, `parent_id`, `is_active`, `sort_order`) 
SELECT UUID(), 'Bevételek', 'income', NULL, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM finance_categories WHERE name = 'Bevételek' AND type = 'income');

INSERT INTO `finance_categories` (`id`, `name`, `type`, `parent_id`, `is_active`, `sort_order`) 
SELECT UUID(), 'Foglalási bevétel', 'income', (SELECT id FROM finance_categories WHERE name = 'Bevételek' AND type = 'income' LIMIT 1), TRUE, 10
WHERE NOT EXISTS (SELECT 1 FROM finance_categories WHERE name = 'Foglalási bevétel');

INSERT INTO `finance_categories` (`id`, `name`, `type`, `parent_id`, `is_active`, `sort_order`) 
SELECT UUID(), 'Kiadások', 'expense', NULL, TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM finance_categories WHERE name = 'Kiadások' AND type = 'expense');

INSERT INTO `finance_categories` (`id`, `name`, `type`, `parent_id`, `is_active`, `sort_order`) 
SELECT UUID(), 'Takarítás', 'expense', (SELECT id FROM finance_categories WHERE name = 'Kiadások' AND type = 'expense' LIMIT 1), TRUE, 110
WHERE NOT EXISTS (SELECT 1 FROM finance_categories WHERE name = 'Takarítás');

-- Forgalmi tételek (Bevételek)
INSERT INTO `finance_transactions` (
  `id`, `date`, `amount`, `currency`, `exchange_rate`, `amount_huf`, `type`,
  `category_id`, `bank_account_id`, `apartment_id`, `partner_id`, `invoice_id`,
  `description`, `notes`, `created_at`
) VALUES
(
  'fin-001', '2026-01-25', 36600, 'HUF', 1.0000, 36600, 'income',
  (SELECT id FROM finance_categories WHERE name = 'Foglalási bevétel' LIMIT 1),
  'bank-002', 'apt-001', 'partner-001', NULL,
  'Foglalási bevétel - A57 Downtown', 'Airbnb foglalás, booking-001', '2026-01-25 16:00:00'
),
(
  'fin-002', '2026-01-23', 44500, 'HUF', 1.0000, 44500, 'income',
  (SELECT id FROM finance_categories WHERE name = 'Foglalási bevétel' LIMIT 1),
  'bank-002', 'apt-002', 'partner-001', NULL,
  'Foglalási bevétel - Angyalföldi Panoráma', 'Airbnb foglalás, booking-003', '2026-01-23 16:00:00'
),
(
  'fin-003', '2026-01-24', 16800, 'HUF', 1.0000, 16800, 'income',
  (SELECT id FROM finance_categories WHERE name = 'Foglalási bevétel' LIMIT 1),
  'bank-002', 'apt-003', 'partner-002', NULL,
  'Foglalási bevétel - B20 Keleti', 'Direkt foglalás, booking-005', '2026-01-24 16:00:00'
);

-- Forgalmi tételek (Kiadások)
INSERT INTO `finance_transactions` (
  `id`, `date`, `amount`, `currency`, `exchange_rate`, `amount_huf`, `type`,
  `category_id`, `bank_account_id`, `apartment_id`, `partner_id`, `invoice_id`,
  `description`, `notes`, `created_at`
) VALUES
(
  'fin-004', '2026-01-23', -15000, 'HUF', 1.0000, -15000, 'expense',
  (SELECT id FROM finance_categories WHERE name = 'Takarítás' LIMIT 1),
  'bank-002', 'apt-001', 'partner-001', NULL,
  'Takarítás - A57 Downtown', 'Heti rendszeres takarítás, cleaning-001', '2026-01-23 10:00:00'
),
(
  'fin-005', '2026-01-28', -20000, 'HUF', 1.0000, -20000, 'expense',
  (SELECT id FROM finance_categories WHERE name = 'Takarítás' LIMIT 1),
  'bank-002', 'apt-002', 'partner-001', NULL,
  'Takarítás - Angyalföldi Panoráma', 'Check-out takarítás, cleaning-002', '2026-01-28 10:00:00'
),
(
  'fin-006', '2026-01-27', -12500, 'HUF', 1.0000, -12500, 'expense',
  (SELECT id FROM finance_categories WHERE name = 'Takarítás' LIMIT 1),
  'bank-002', 'apt-003', 'partner-002', NULL,
  'Takarítás - B20 Keleti', 'Check-out takarítás + költség, cleaning-004', '2026-01-27 10:00:00'
);

-- ============================================================
-- 7. KÖNYVELÉS - Számlafiókok (Invoicing Accounts)
-- ============================================================

INSERT INTO `invoicing_accounts` (
  `id`, `name`, `apartment_id`, `partner_id`, `tax_number`, `company_name`,
  `address`, `invoice_number_prefix`, `invoice_number_counter`, `is_active`, `created_at`
) VALUES
(
  'inv-acc-001', 'A57 Downtown - Kovács Péter', 'apt-001', 'partner-001',
  '11111111-1-11', 'Kovács Ingatlan Kft.',
  'Budapest, Fő utca 1.', 'A57-', 5, TRUE, '2024-01-10 10:00:00'
),
(
  'inv-acc-002', 'Angyalföldi - Kovács Péter', 'apt-002', 'partner-001',
  '11111111-1-11', 'Kovács Ingatlan Kft.',
  'Budapest, Fő utca 1.', 'ANG-', 3, TRUE, '2024-01-15 11:00:00'
),
(
  'inv-acc-003', 'B20 Keleti - Nagy Mária', 'apt-003', 'partner-002',
  '22222222-2-22', 'Nagy Mária Ingatlan',
  'Budapest, Kossuth Lajos utca 5.', 'B20-', 2, TRUE, '2024-02-01 09:00:00'
);

-- ============================================================
-- 8. KÖNYVELÉS - Számlák (Invoices)
-- ============================================================

INSERT INTO `invoices` (
  `id`, `invoice_number`, `invoicing_account_id`, `invoice_type`, `status`,
  `issue_date`, `due_date`, `payment_date`, `currency`, `exchange_rate`,
  `subtotal`, `vat_amount`, `total_amount`, `total_amount_huf`,
  `partner_id`, `apartment_id`, `items_json`, `notes`, `created_at`
) VALUES
(
  'inv-001', 'A57-2026-001', 'inv-acc-001', 'normal', 'paid',
  '2026-01-10', '2026-02-10', '2026-01-15', 'HUF', 1.0000,
  30000.00, 8100.00, 38100.00, 38100.00,
  'partner-001', 'apt-001',
  '[{"description": "Havi kezelési díj - 2026 január", "quantity": 1, "unit_price": 30000, "vat_rate": 27, "vat_amount": 8100, "total_amount": 38100}]',
  'Havi kezelési díj', '2026-01-10 10:00:00'
),
(
  'inv-002', 'A57-2026-002', 'inv-acc-001', 'normal', 'issued',
  '2026-01-20', '2026-02-20', NULL, 'HUF', 1.0000,
  30000.00, 8100.00, 38100.00, 38100.00,
  'partner-001', 'apt-001',
  '[{"description": "Havi kezelési díj - 2026 február", "quantity": 1, "unit_price": 30000, "vat_rate": 27, "vat_amount": 8100, "total_amount": 38100}]',
  'Havi kezelési díj', '2026-01-20 10:00:00'
),
(
  'inv-003', 'ANG-2026-001', 'inv-acc-002', 'normal', 'paid',
  '2026-01-15', '2026-02-15', '2026-01-18', 'HUF', 1.0000,
  35000.00, 9450.00, 44450.00, 44450.00,
  'partner-001', 'apt-002',
  '[{"description": "Havi kezelési díj - 2026 január", "quantity": 1, "unit_price": 35000, "vat_rate": 27, "vat_amount": 9450, "total_amount": 44450}]',
  'Havi kezelési díj', '2026-01-15 11:00:00'
);

-- Számla tételek
INSERT INTO `invoice_items` (
  `id`, `invoice_id`, `line_number`, `description`, `quantity`, `unit_price`,
  `vat_rate`, `vat_amount`, `total_amount`, `created_at`
) VALUES
('inv-item-001', 'inv-001', 1, 'Havi kezelési díj - 2026 január', 1.000, 30000.00, 27.00, 8100.00, 38100.00, '2026-01-10 10:00:00'),
('inv-item-002', 'inv-002', 1, 'Havi kezelési díj - 2026 február', 1.000, 30000.00, 27.00, 8100.00, 38100.00, '2026-01-20 10:00:00'),
('inv-item-003', 'inv-003', 1, 'Havi kezelési díj - 2026 január', 1.000, 35000.00, 27.00, 9450.00, 44450.00, '2026-01-15 11:00:00');

-- ============================================================
-- 9. KÖNYVELÉS - Főkönyv (Ledger Entries)
-- ============================================================

-- Számlatükör alapok (ha még nincs)
INSERT INTO `chart_of_accounts` (`id`, `account_number`, `account_name`, `account_type`, `sort_order`)
SELECT UUID(), '411', 'Vevők', 'asset', 10
WHERE NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_number = '411');

INSERT INTO `chart_of_accounts` (`id`, `account_number`, `account_name`, `account_type`, `sort_order`)
SELECT UUID(), '454', 'Fizetendő ÁFA', 'liability', 20
WHERE NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_number = '454');

INSERT INTO `chart_of_accounts` (`id`, `account_number`, `account_name`, `account_type`, `sort_order`)
SELECT UUID(), '911', 'Üzleti tevékenység bevétele', 'revenue', 50
WHERE NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_number = '911');

-- Főkönyvi bejegyzés (számla kiadásakor)
INSERT INTO `ledger_entries` (
  `id`, `entry_date`, `entry_number`, `description`,
  `debit_account_id`, `credit_account_id`, `amount`, `currency`,
  `source_type`, `source_id`, `period`, `created_at`
) VALUES
(
  'ledger-001', '2026-01-10', '2026-001',
  'Számla kiadás: A57-2026-001',
  (SELECT id FROM chart_of_accounts WHERE account_number = '411' LIMIT 1),
  (SELECT id FROM chart_of_accounts WHERE account_number = '911' LIMIT 1),
  38100.00, 'HUF',
  'invoice', 'inv-001', '2026-01', '2026-01-10 10:00:00'
);

-- ============================================================
-- 10. MARKETING - Kampányok
-- ============================================================

-- Ha van marketing tábla
INSERT INTO `campaigns` (`id`, `name`, `channel`, `status`, `start_date`, `end_date`, `budget`, `spent`, `notes`, `created_at`)
SELECT UUID(), '2026 január Facebook kampány', 'facebook', 'active', '2026-01-01', '2026-01-31', 50000, 25000, 'Facebook hirdetések', NOW()
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'campaigns');

-- ============================================================
-- 11. KARBANTARTÁS (Maintenance)
-- ============================================================

-- Ha van maintenance tábla
INSERT INTO `maintenance_requests` (`id`, `apartment_id`, `title`, `description`, `status`, `priority`, `reported_by`, `created_at`)
SELECT UUID(), 'apt-001', 'Csap javítás', 'Fürdőszobai csap csepegtet', 'open', 'medium', 'partner-001', NOW()
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'maintenance_requests');

-- ============================================================
-- 12. STATISZTIKÁK FRISSÍTÉSE
-- ============================================================

-- Bankszámla egyenlegek frissítése a tranzakciók alapján
UPDATE `bank_accounts` SET `current_balance` = (
  SELECT COALESCE(SUM(amount_huf), 0) + `initial_balance`
  FROM `finance_transactions`
  WHERE `bank_account_id` = `bank_accounts`.`id`
  AND `type` = 'income'
) - (
  SELECT COALESCE(SUM(ABS(amount_huf)), 0)
  FROM `finance_transactions`
  WHERE `bank_account_id` = `bank_accounts`.`id`
  AND `type` = 'expense'
)
WHERE `id` IN ('bank-001', 'bank-002', 'bank-003');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ÖSSZEFOGLALÓ
-- ============================================================
-- ✅ 1 Admin felhasználó
-- ✅ 3 Partner felhasználó
-- ✅ 3 Dolgozó
-- ✅ 5 Lakás (különböző partnerekkel, iCal beállításokkal)
-- ✅ 7 Lead (különböző státuszokkal)
-- ✅ 8 Foglalás (különböző platformokkal, dátumokkal)
-- ✅ 5 Takarítás (különböző státuszokkal)
-- ✅ 3 Bankszámla (EUR, HUF)
-- ✅ 6 Pénzügyi tétel (bevétel + kiadás)
-- ✅ 3 Számlafiók
-- ✅ 3 Számla (paid, issued)
-- ✅ Főkönyvi bejegyzés
-- 
-- Minden adat valósághű és kapcsolódik egymáshoz!
-- ============================================================
