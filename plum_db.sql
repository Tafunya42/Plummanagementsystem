-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 14, 2026 at 09:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `plum_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `artist_documents`
--

CREATE TABLE `artist_documents` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `document_type` enum('id_front','id_back','profile_photo','professional_photo','portfolio','license','certificate','contract','other') NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `upload_date` datetime NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `artist_legal_info`
--

CREATE TABLE `artist_legal_info` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `full_legal_name` varchar(255) NOT NULL,
  `stage_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `id_type` enum('national_id','passport','drivers_license','temporary_id') NOT NULL,
  `id_number` varchar(50) NOT NULL,
  `id_expiry_date` date NOT NULL,
  `id_document_front` varchar(500) DEFAULT NULL,
  `id_document_back` varchar(500) DEFAULT NULL,
  `profile_photo` varchar(500) DEFAULT NULL,
  `residential_address` varchar(500) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `primary_phone` varchar(20) NOT NULL,
  `alternative_phone` varchar(20) DEFAULT NULL,
  `bank_name` varchar(255) NOT NULL,
  `account_holder_name` varchar(255) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_type` enum('savings','checking','mobile_money') DEFAULT 'savings',
  `branch_name` varchar(255) DEFAULT NULL,
  `swift_code` varchar(20) DEFAULT NULL,
  `mobile_money_provider` varchar(100) DEFAULT NULL,
  `business_registration_number` varchar(100) DEFAULT NULL,
  `tax_identification_number` varchar(50) DEFAULT NULL,
  `professional_license_number` varchar(100) DEFAULT NULL,
  `years_of_experience` int(11) NOT NULL,
  `base_hourly_rate` decimal(10,2) NOT NULL,
  `minimum_booking_hours` int(11) DEFAULT 1,
  `travel_fee` decimal(10,2) DEFAULT 0.00,
  `travel_radius_km` int(11) DEFAULT 50,
  `agreed_to_terms` tinyint(1) DEFAULT 0,
  `terms_agreed_date` datetime DEFAULT NULL,
  `agreed_to_privacy_policy` tinyint(1) DEFAULT 0,
  `agreed_to_code_of_conduct` tinyint(1) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_bank_verified` tinyint(1) DEFAULT 0,
  `is_id_verified` tinyint(1) DEFAULT 0,
  `verification_date` datetime DEFAULT NULL,
  `verified_by_admin_id` int(11) DEFAULT NULL,
  `compliance_status` enum('pending','verified','suspended','rejected') DEFAULT 'pending',
  `compliance_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `artist_policy_acknowledgments`
--

CREATE TABLE `artist_policy_acknowledgments` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `policy_type` enum('terms_of_service','privacy_policy','code_of_conduct','payment_policy','cancellation_policy') NOT NULL,
  `policy_version` varchar(20) NOT NULL,
  `acknowledged_at` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `artist_profiles`
--

CREATE TABLE `artist_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `availability_status` enum('available','busy','unavailable') DEFAULT 'available',
  `total_bookings` int(11) DEFAULT 0,
  `response_rate` decimal(5,2) DEFAULT 0.00,
  `avg_response_time` varchar(50) DEFAULT NULL,
  `is_top_rated` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `available_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `event_location` varchar(255) DEFAULT NULL,
  `duration_hours` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT 0.00,
  `booking_status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','paid','refunded') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `user_id`, `code`, `token`, `expires_at`, `used`, `used_at`, `created_at`) VALUES
(7, 16, '307585', '518b75f606dfbd50e8706b8010cb98a3f85e269ec07b76ed7549678c2bb1912a', '2026-03-27 01:21:08', 1, '2026-03-26 00:21:47', '2026-03-26 00:21:08');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) NOT NULL,
  `attempt_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `email`, `success`, `ip_address`, `attempt_time`) VALUES
(1, 'aaronmubby@gmail.com', 1, '::1', '2026-03-25 23:24:05'),
(2, 'aaronmubby@gmail.com', 1, '::1', '2026-03-25 23:26:48'),
(3, 'aaronmubby@gmail.com', 1, '::1', '2026-03-25 23:52:44'),
(4, 'aaronmubby@gmail.com', 0, '::1', '2026-03-25 23:53:55'),
(5, 'aaronmubby@gmail.com', 0, '::1', '2026-03-25 23:54:03'),
(6, 'aaronmubby@gmail.com', 0, '::1', '2026-03-25 23:58:12'),
(7, 'aaronmubby@gmail.com', 0, '::1', '2026-03-25 23:58:22'),
(8, 'aaronmubby@gmail.com', 1, '::1', '2026-03-25 23:58:54'),
(9, 'aaronmubby@gmail.com', 1, '::1', '2026-03-26 00:01:32'),
(10, 'aaronmubby@gmail.com', 1, '::1', '2026-03-26 00:09:36');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `replied_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile_views`
--

CREATE TABLE `profile_views` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `viewer_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `viewed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `verified_booking` tinyint(1) DEFAULT 1,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_hours` int(11) DEFAULT NULL,
  `includes_details` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('deposit','payment','refund') DEFAULT 'payment',
  `payment_method` varchar(100) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `uuid` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `display_name` varchar(180) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `events_completed` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `remember_token` varchar(255) DEFAULT NULL,
  `remember_expires` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `email`, `password_hash`, `first_name`, `last_name`, `display_name`, `full_name`, `phone`, `location`, `bio`, `profile_picture`, `rating`, `total_reviews`, `events_completed`, `is_verified`, `email_verified_at`, `is_active`, `created_at`, `updated_at`, `remember_token`, `remember_expires`, `last_login`) VALUES
(16, 'a8c06444-1b08-4cc2-9b56-33c46e60ac90', 'aaronmubby@gmail.com', '$2y$12$TShEbD9h79Thuvl5A1ZY5uiVpUoaSYGHEKIvIV5G0hav/AC9xZr3i', 'Aaron', 'Mubiana', 'Aaron Mubiana', 'Aaron Mubiana', NULL, NULL, NULL, NULL, 0.00, 0, 0, 1, '2026-03-26 00:21:47', 1, '2026-03-26 00:21:08', '2026-03-26 00:21:47', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `artist_documents`
--
ALTER TABLE `artist_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_is_verified` (`is_verified`);

--
-- Indexes for table `artist_legal_info`
--
ALTER TABLE `artist_legal_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `artist_id` (`artist_id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD KEY `verified_by_admin_id` (`verified_by_admin_id`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_compliance_status` (`compliance_status`),
  ADD KEY `idx_is_verified` (`is_verified`);

--
-- Indexes for table `artist_policy_acknowledgments`
--
ALTER TABLE `artist_policy_acknowledgments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_artist_policy` (`artist_id`,`policy_type`,`policy_version`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_policy_type` (`policy_type`);

--
-- Indexes for table `artist_profiles`
--
ALTER TABLE `artist_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_availability` (`availability_status`);

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_artist_date` (`artist_id`,`available_date`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_available_date` (`available_date`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_booking_status` (`booking_status`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`artist_id`),
  ADD KEY `artist_id` (`artist_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_ip` (`ip_address`),
  ADD KEY `idx_time` (`attempt_time`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_recipient_id` (`recipient_id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Indexes for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artist_id` (`artist_id`),
  ADD KEY `viewer_id` (`viewer_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `idx_artist_id` (`artist_id`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_artist_id` (`artist_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_uuid_unique` (`uuid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_remember_token` (`remember_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `artist_documents`
--
ALTER TABLE `artist_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `artist_legal_info`
--
ALTER TABLE `artist_legal_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `artist_policy_acknowledgments`
--
ALTER TABLE `artist_policy_acknowledgments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `artist_profiles`
--
ALTER TABLE `artist_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profile_views`
--
ALTER TABLE `profile_views`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `artist_documents`
--
ALTER TABLE `artist_documents`
  ADD CONSTRAINT `artist_documents_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `artist_legal_info`
--
ALTER TABLE `artist_legal_info`
  ADD CONSTRAINT `artist_legal_info_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `artist_legal_info_ibfk_2` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `artist_policy_acknowledgments`
--
ALTER TABLE `artist_policy_acknowledgments`
  ADD CONSTRAINT `artist_policy_acknowledgments_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `artist_profiles`
--
ALTER TABLE `artist_profiles`
  ADD CONSTRAINT `artist_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

--
-- Constraints for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD CONSTRAINT `profile_views_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- --------------------------------------------------------
--
-- Backend auth, settings, maintenance and upload support
--

ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `uuid` char(36) NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `password_hash` varchar(255) DEFAULT NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `first_name` varchar(100) DEFAULT NULL AFTER `password_hash`,
  ADD COLUMN IF NOT EXISTS `last_name` varchar(100) DEFAULT NULL AFTER `first_name`,
  ADD COLUMN IF NOT EXISTS `display_name` varchar(180) DEFAULT NULL AFTER `last_name`,
  ADD COLUMN IF NOT EXISTS `email_verified_at` datetime DEFAULT NULL AFTER `is_verified`;

UPDATE `users`
SET `uuid` = UUID()
WHERE `uuid` IS NULL OR `uuid` = '';

SET @has_password_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'password'
);
SET @copy_password_sql := IF(
  @has_password_column > 0,
  'UPDATE `users` SET `password_hash` = `password` WHERE `password_hash` IS NULL OR `password_hash` = ""',
  'SELECT 1'
);
PREPARE copy_password_stmt FROM @copy_password_sql;
EXECUTE copy_password_stmt;
DEALLOCATE PREPARE copy_password_stmt;

UPDATE `users`
SET `email_verified_at` = COALESCE(`email_verified_at`, `updated_at`)
WHERE `is_verified` = 1;

ALTER TABLE `users`
  MODIFY COLUMN `password_hash` varchar(255) NOT NULL;

ALTER TABLE `users`
  MODIFY COLUMN `uuid` char(36) NOT NULL,
  ADD UNIQUE KEY IF NOT EXISTS `users_uuid_unique` (`uuid`);

CREATE TABLE IF NOT EXISTS `roles` (
  `id` smallint(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` smallint(5) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `ux_user_roles_user_role` (`user_id`,`role_id`),
  KEY `idx_user_roles_user_id` (`user_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `user_roles_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_role_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`uuid`, `name`, `description`) VALUES
(UUID(), 'artist', 'Creative or artist account.'),
(UUID(), 'organizer', 'Event organizer account.'),
(UUID(), 'client', 'Client account.'),
(UUID(), 'admin', 'Admin account.'),
(UUID(), 'supreme_admin', 'Supreme admin account with maintenance access.')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

SET @has_user_type_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'user_type'
);
SET @copy_user_type_sql := IF(
  @has_user_type_column > 0,
  'INSERT IGNORE INTO `user_roles` (`uuid`, `user_id`, `role_id`) SELECT UUID(), u.id, r.id FROM `users` u INNER JOIN `roles` r ON r.name = CONVERT(u.user_type USING utf8mb4) COLLATE utf8mb4_unicode_ci',
  'SELECT 1'
);
PREPARE copy_user_type_stmt FROM @copy_user_type_sql;
EXECUTE copy_user_type_stmt;
DEALLOCATE PREPARE copy_user_type_stmt;

SET @has_supreme_admin_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_supreme_admin'
);
SET @copy_supreme_admin_sql := IF(
  @has_supreme_admin_column > 0,
  'INSERT IGNORE INTO `user_roles` (`uuid`, `user_id`, `role_id`) SELECT UUID(), u.id, r.id FROM `users` u INNER JOIN `roles` r ON r.name = "supreme_admin" WHERE u.is_supreme_admin = 1',
  'SELECT 1'
);
PREPARE copy_supreme_admin_stmt FROM @copy_supreme_admin_sql;
EXECUTE copy_supreme_admin_stmt;
DEALLOCATE PREPARE copy_supreme_admin_stmt;

INSERT IGNORE INTO `user_roles` (`uuid`, `user_id`, `role_id`)
SELECT UUID(), u.id, r.id
FROM `users` u
INNER JOIN `roles` r ON r.name = 'client'
LEFT JOIN `user_roles` ur ON ur.user_id = u.id
WHERE ur.id IS NULL;

ALTER TABLE `users`
  DROP INDEX IF EXISTS `idx_user_type`,
  DROP COLUMN IF EXISTS `user_type`,
  DROP COLUMN IF EXISTS `is_supreme_admin`,
  DROP COLUMN IF EXISTS `password`;

ALTER TABLE `email_verifications`
  ADD COLUMN IF NOT EXISTS `uuid` char(36) NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `code_hash` char(64) DEFAULT NULL AFTER `code`,
  MODIFY COLUMN `code` varchar(10) DEFAULT NULL,
  ADD KEY IF NOT EXISTS `idx_email_verifications_code_hash` (`code_hash`),
  ADD KEY IF NOT EXISTS `idx_email_verifications_expires` (`expires_at`);

UPDATE `email_verifications`
SET `uuid` = UUID()
WHERE `uuid` IS NULL OR `uuid` = '';

ALTER TABLE `email_verifications`
  MODIFY COLUMN `uuid` char(36) NOT NULL,
  ADD UNIQUE KEY IF NOT EXISTS `email_verifications_uuid_unique` (`uuid`);

CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `key` varchar(128) NOT NULL,
  `value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_system_settings_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_settings` (`uuid`, `key`, `value`, `description`) VALUES
(UUID(), 'app_name', 'Plum', 'Public application name.'),
(UUID(), 'app_logo_path', 'images/Plum LogoNew-transparent.png', 'Public logo path used by PHP-rendered pages.'),
(UUID(), 'maintenance_mode', '0', 'When 1, only the supreme admin should bypass maintenance.'),
(UUID(), 'maintenance_message', 'Plum is getting a quick tune-up. Please check back soon.', 'Message shown while maintenance mode is active.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`);

CREATE TABLE IF NOT EXISTS `rate_limits` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `identifier` char(64) NOT NULL,
  `attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `window_started_at` datetime NOT NULL,
  `last_attempt_at` datetime NOT NULL,
  `blocked_until` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `ux_rate_limits_action_identifier` (`action`,`identifier`),
  KEY `idx_rate_limits_blocked_until` (`blocked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_password_resets_user` (`user_id`),
  KEY `idx_password_resets_email` (`email`),
  KEY `idx_password_resets_expires` (`expires_at`),
  CONSTRAINT `password_resets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(1024) DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 1,
  `failure_reason` varchar(255) DEFAULT NULL,
  `logged_in_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logged_out_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_login_logs_user` (`user_id`),
  KEY `idx_login_logs_success` (`success`),
  CONSTRAINT `login_logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_queue` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `to_email` varchar(255) NOT NULL,
  `to_name` varchar(200) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `body_html` mediumtext NOT NULL,
  `body_text` mediumtext NOT NULL,
  `status` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `max_attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 3,
  `next_retry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `last_error` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_email_queue_user` (`user_id`),
  KEY `idx_email_queue_status` (`status`,`next_retry_at`),
  CONSTRAINT `email_queue_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `folder` varchar(80) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `stored_name` varchar(255) NOT NULL,
  `path` varchar(500) NOT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `size_bytes` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_uploaded_files_user` (`user_id`),
  KEY `idx_uploaded_files_folder` (`folder`),
  CONSTRAINT `uploaded_files_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
