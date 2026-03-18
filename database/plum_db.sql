-- Plum - Artist Booking Platform Database Schema
-- Created: 2024

CREATE DATABASE IF NOT EXISTS plum_db;
USE plum_db;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('client', 'artist') NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    profile_picture VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    events_completed INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- ARTIST PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS artist_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    user_id INT NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    description TEXT,
    experience_years INT DEFAULT 0,
    portfolio_url VARCHAR(255),
    availability_status ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    total_bookings INT DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0,
    avg_response_time VARCHAR(50),
    is_top_rated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_availability (availability_status),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- ARTIST MEDIA TABLE
-- Photos and videos for artist portfolios
-- ============================================
CREATE TABLE IF NOT EXISTS artist_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    artist_id INT NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    caption VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_artist_id (artist_id),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- CATEGORIES TABLE
-- Artist category definitions
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- SERVICES/PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    artist_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_hours INT,
    includes_details TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_artist_id (artist_id),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    client_id INT NOT NULL,
    artist_id INT NOT NULL,
    service_id INT,
    event_date DATE NOT NULL,
    event_type VARCHAR(100),
    event_location VARCHAR(255),
    duration_hours INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    booking_status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT,
    cancelled_by INT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_client_id (client_id),
    INDEX idx_artist_id (artist_id),
    INDEX idx_booking_status (booking_status),
    INDEX idx_event_date (event_date),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    booking_id INT NOT NULL UNIQUE,
    reviewer_id INT NOT NULL,
    artist_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    artist_reply TEXT,
    artist_replied_at TIMESTAMP NULL,
    verified_booking BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_artist_id (artist_id),
    INDEX idx_rating (rating),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    artist_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, artist_id),
    INDEX idx_user_id (user_id)
);

-- ============================================
-- CONVERSATIONS TABLE
-- Groups messages between two users into threads
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    user_one_id INT NOT NULL,
    user_two_id INT NOT NULL,
    booking_id INT,
    last_message_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    UNIQUE KEY unique_conversation (user_one_id, user_two_id),
    INDEX idx_user_one (user_one_id),
    INDEX idx_user_two (user_two_id),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    booking_id INT,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_is_read (is_read),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('deposit', 'payment', 'refund') DEFAULT 'payment',
    payment_method VARCHAR(100),
    transaction_ref VARCHAR(255),
    provider_transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    artist_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_artist_id (artist_id),
    INDEX idx_available_date (available_date),
    UNIQUE KEY unique_artist_date (artist_id, available_date),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- In-app notifications for users
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,        -- e.g. 'booking_confirmed', 'new_message', 'review_received'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_type VARCHAR(100),         -- e.g. 'booking', 'message', 'review'
    related_id INT,                    -- ID of the related record
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- PROMO CODES TABLE
-- Discount codes for bookings
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_booking_amount DECIMAL(10, 2) DEFAULT 0,
    max_uses INT,
    uses_count INT DEFAULT 0,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- PROMO CODE USAGES TABLE
-- Tracks which user used which promo code
-- ============================================
CREATE TABLE IF NOT EXISTS promo_code_usages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    promo_code_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_id INT NOT NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_promo (booking_id),
    INDEX idx_user_id (user_id)
);

-- ============================================
-- REPORTS / DISPUTES TABLE
-- For reporting users or disputes on bookings
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    reporter_id INT NOT NULL,
    reported_user_id INT,
    booking_id INT,
    report_type ENUM('user', 'booking', 'review', 'message') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'under_review', 'resolved', 'dismissed') DEFAULT 'pending',
    resolved_by INT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_status (status),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

-- ============================================
-- LOGIN LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    user_id INT,
    email_attempted VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at),
    INDEX idx_uuid (uuid)
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- Tracks all significant actions in the system
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) NOT NULL UNIQUE DEFAULT (UUID()),
    user_id INT,
    action VARCHAR(100) NOT NULL,      -- e.g. 'booking_created', 'profile_updated', 'review_posted'
    entity_type VARCHAR(100),          -- e.g. 'booking', 'user', 'service'
    entity_id INT,
    entity_uuid VARCHAR(255),
    old_values JSON,                   -- snapshot of data before change
    new_values JSON,                   -- snapshot of data after change
    ip_address VARCHAR(45),
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at),
    INDEX idx_uuid (uuid)
);
