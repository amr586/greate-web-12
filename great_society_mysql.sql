SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE `u156204542_Dbase`;

DROP TABLE IF EXISTS `property_chat_messages`;
DROP TABLE IF EXISTS `support_messages`;
DROP TABLE IF EXISTS `saved_properties`;
DROP TABLE IF EXISTS `payment_requests`;
DROP TABLE IF EXISTS `property_images`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `otp_codes`;
DROP TABLE IF EXISTS `admin_emails`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `properties`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(30),
  `password_hash` TEXT NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `sub_role` VARCHAR(30),
  `avatar_url` TEXT,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `properties` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `title` VARCHAR(300),
  `title_ar` VARCHAR(300),
  `description` TEXT,
  `description_ar` TEXT,
  `type` VARCHAR(50),
  `purpose` VARCHAR(20) DEFAULT 'sale',
  `price` DECIMAL(15,2),
  `area` DECIMAL(15,2),
  `rooms` INT,
  `bedrooms` INT,
  `bathrooms` INT,
  `floor` INT,
  `address` TEXT,
  `district` VARCHAR(100),
  `city` VARCHAR(100),
  `contact_phone` VARCHAR(20) DEFAULT '01100111618',
  `owner_id` INT,
  `status` VARCHAR(20) DEFAULT 'pending',
  `is_featured` TINYINT(1) DEFAULT 0,
  `views` INT DEFAULT 0,
  `has_parking` TINYINT(1) DEFAULT 0,
  `has_elevator` TINYINT(1) DEFAULT 0,
  `has_garden` TINYINT(1) DEFAULT 0,
  `has_pool` TINYINT(1) DEFAULT 0,
  `is_furnished` TINYINT(1) DEFAULT 0,
  `approved_by` INT,
  `approved_at` DATETIME,
  `sold_to` INT,
  `sold_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `down_payment` VARCHAR(100),
  `delivery_status` VARCHAR(100),
  `finishing_type` VARCHAR(50),
  `floor_plan_image` TEXT,
  `google_maps_url` TEXT,
  `has_basement` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `properties_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_emails` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_emails_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL,
  `phone` VARCHAR(30),
  `subject` VARCHAR(300) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT,
  `type` VARCHAR(50),
  `title` VARCHAR(300),
  `message` TEXT,
  `property_data` JSON,
  `user_data` JSON,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `link` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `otp_codes` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(200) NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `user_data` JSON,
  `attempts` INT DEFAULT 0,
  `locked_until` DATETIME,
  `expires_at` DATETIME NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  `last_sent_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_requests` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `property_id` INT,
  `buyer_id` INT,
  `amount` DECIMAL(15,2),
  `payment_method` VARCHAR(50),
  `notes` TEXT,
  `status` VARCHAR(20) DEFAULT 'pending',
  `processed_by` INT,
  `processed_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `screenshot_url` TEXT,
  `contact_phone` VARCHAR(20),
  PRIMARY KEY (`id`),
  CONSTRAINT `payment_requests_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `payment_requests_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_images` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `property_id` INT,
  `url` TEXT NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `order_index` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `property_images_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `saved_properties` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT,
  `property_id` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_properties_user_id_property_id_key` (`user_id`, `property_id`),
  CONSTRAINT `saved_properties_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_properties_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `property_chat_messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `property_id` INT,
  `sender_id` INT,
  `content` TEXT,
  `is_admin` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `property_chat_messages_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `property_chat_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `support_tickets` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `user_id` INT,
  `subject` TEXT,
  `status` VARCHAR(20) DEFAULT 'open',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `support_tickets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `support_messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `ticket_id` INT,
  `sender_id` INT,
  `content` TEXT,
  `is_admin` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `support_messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `support_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `sub_role`, `avatar_url`, `is_active`, `created_at`) VALUES
(1, 'Super Admin', 'admin@greatsociety.com', '01100111618', '$2b$10$T14y/YEUh6qL5Y0D5G55w.QbR7s4si6I9WhDijB3vc64c/eGreH0q', 'superadmin', NULL, NULL, 1, '2026-04-13 23:10:50'),
(2, 'مدخل بيانات', 'dataentry@greatsociety.com', '01100111619', '$2b$10$8OEKdFdrYecBYv3Ri0XDDu9w0wgWdE57JyI9vtBGRkhWYl7JGQQGe', 'admin', 'data_entry', NULL, 1, '2026-04-13 23:10:50'),
(3, 'مدير عقارات', 'propmanager@greatsociety.com', '01100111620', '$2b$10$C7Wy6SGbqqzTBJIi3t2LUep6TeH95AXs78OxQrB9WUWTyMuAKKhL6', 'admin', 'property_manager', NULL, 1, '2026-04-13 23:10:50'),
(4, 'دعم فني', 'support@greatsociety.com', '01100111621', '$2b$10$GUDzAhPQgGl33By7WKDvJerFweEm/QMMAk9NOJ72VunJpTXz0ydGi', 'admin', 'support', NULL, 1, '2026-04-13 23:10:50'),
(5, 'مستخدم تجريبي', 'user@greatsociety.com', '01100111622', '$2b$10$ZMOFobfwjgvO61nDHmDPke/0oBgKhi5a/76Ef.Qml0.7gUIZv58AS', 'user', NULL, NULL, 1, '2026-04-13 23:10:51');

INSERT INTO `properties` (`id`, `title`, `title_ar`, `description`, `description_ar`, `type`, `purpose`, `price`, `area`, `rooms`, `bedrooms`, `bathrooms`, `floor`, `address`, `district`, `city`, `contact_phone`, `owner_id`, `status`, `is_featured`, `views`, `has_parking`, `has_elevator`, `has_garden`, `has_pool`, `is_furnished`, `approved_by`, `approved_at`, `sold_to`, `sold_at`, `created_at`, `updated_at`, `down_payment`, `delivery_status`, `finishing_type`, `floor_plan_image`, `google_maps_url`, `has_basement`) VALUES
(1, 'Suez Road Finished Apartment', 'شقة 3 غرف متشطبة بالكامل - طريق السويس', NULL, 'شقة 3 غرف متشطبة بالكامل بمقدم 750 ألف في أقوى لوكيشن على طريق السويس مباشرة جمب أول جامعة ومستشفى british في مصر. مبنية بنسبة إنشاءات 40% على أرض الواقع. للمعاينة والتفاصيل سجل بياناتك.', 'apartment', 'sale', '3200000', '140', NULL, 3, 2, NULL, 'طريق السويس مباشرة، جمب أول جامعة ومستشفى british في مصر', 'طريق السويس', 'القاهرة', '01100111618', NULL, 'approved', 1, 222, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '2026-04-13 23:10:51', '2026-04-13 23:10:51', '750,000 ج', 'مبنية بنسبة إنشاءات 40%', 'متشطبة بالكامل', NULL, 'https://maps.google.com/?q=طريق+السويس+القاهرة', 0),
(2, 'Fifth Settlement Villas & Apartments', 'فيلات وشقق استلام فوري - قلب التجمع الخامس', NULL, 'فيلات وشقق استلام فوري في قلب التجمع الخامس بمقدم 1.8 مليون وأقساط تصل إلى 10 سنوات. موقع فريد دقائق من التسعين الجنوبي ومطار القاهرة الدولي. فخامة وخصوصية وتصميم عصري مع واجهات مميزة.', 'villa', 'sale', '18000000', '300', NULL, 4, 3, NULL, 'قلب التجمع الخامس - دقائق من التسعين الجنوبي ومطار القاهرة', 'التجمع الخامس', 'القاهرة', '01100111618', NULL, 'approved', 1, 197, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, '2026-04-13 23:10:51', '2026-04-13 23:10:51', '1,800,000 ج', 'استلام فوري', 'سوبر لوكس', NULL, 'https://maps.google.com/?q=التجمع+الخامس+القاهرة', 0);

INSERT INTO `property_images` (`property_id`, `url`, `is_primary`, `order_index`, `created_at`) VALUES
(1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop', 1, 0, '2026-04-13 23:10:51'),
(1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop', 0, 1, '2026-04-13 23:10:51'),
(1, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop', 0, 2, '2026-04-13 23:10:51'),
(1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop', 0, 3, '2026-04-13 23:10:51'),
(2, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop', 1, 0, '2026-04-13 23:10:51'),
(2, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=500&fit=crop', 0, 1, '2026-04-13 23:10:51'),
(2, 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=500&fit=crop', 0, 2, '2026-04-13 23:10:51'),
(2, 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=500&fit=crop', 0, 3, '2026-04-13 23:10:51');

INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `property_data`, `user_data`, `is_read`, `created_at`, `link`) VALUES
(1, 'property_added', 'عقار جديد يحتاج مراجعة', 'تم إضافة عقار جديد من المستخدم: Super Admin - 01100111618', '{"id":3,"area":"22","type":"شقة","price":"25","title":"gfh","purpose":"sale","bedrooms":2,"district":"rtet","bathrooms":2}', '{"name":"Super Admin","email":"admin@greatsociety.com","phone":"01100111618"}', 1, '2026-04-13 23:42:43', '/properties/3');

SET FOREIGN_KEY_CHECKS = 1;
