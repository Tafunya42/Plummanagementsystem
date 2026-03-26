<?php

/**
 * Client Dashboard API
 * Returns dashboard data for logged-in client
 */

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  json_response(false, 'Not authenticated');
}

$user_id = $_SESSION['user_id'];

// Check if user is a client
if ($_SESSION['user_type'] !== 'client') {
  json_response(false, 'Not a client account');
}

// Initialize dashboard data
$dashboard_data = [];

// 1. Get stats
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(total_amount) as total_spent
    FROM bookings 
    WHERE client_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stats = $stmt->get_result()->fetch_assoc();
$stmt->close();

$dashboard_data['total_bookings'] = (int)($stats['total_bookings'] ?? 0);
$dashboard_data['completed_bookings'] = (int)($stats['completed_bookings'] ?? 0);
$dashboard_data['confirmed_bookings'] = (int)($stats['confirmed_bookings'] ?? 0);
$dashboard_data['pending_bookings'] = (int)($stats['pending_bookings'] ?? 0);
$dashboard_data['cancelled_bookings'] = (int)($stats['cancelled_bookings'] ?? 0);
$dashboard_data['total_spent'] = (float)($stats['total_spent'] ?? 0);

// 2. Get upcoming bookings
$stmt = $conn->prepare("
    SELECT b.*, u.full_name as artist_name, u.category, u.rating
    FROM bookings b
    JOIN users u ON b.artist_id = u.id
    WHERE b.client_id = ? 
        AND b.event_date >= CURDATE() 
        AND b.booking_status IN ('confirmed', 'pending')
    ORDER BY b.event_date ASC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$upcoming = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$dashboard_data['upcoming_bookings'] = $upcoming;

// 3. Get favorite artists
$stmt = $conn->prepare("
    SELECT u.id, u.full_name, u.location, u.category, u.rating, ap.hourly_rate
    FROM favorites f
    JOIN users u ON f.artist_id = u.id
    LEFT JOIN artist_profiles ap ON u.id = ap.user_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT 10
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$favorites = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$dashboard_data['favorite_artists'] = $favorites;
$dashboard_data['favorites_count'] = count($favorites);

// 4. Get recent activity (bookings, reviews, favorites)
$activity = [];

// Recent bookings
$stmt = $conn->prepare("
    SELECT 
        'booking_created' as type,
        CONCAT('You booked ', u.full_name, ' for ', b.event_type) as message,
        b.created_at
    FROM bookings b
    JOIN users u ON b.artist_id = u.id
    WHERE b.client_id = ?
    ORDER BY b.created_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$bookings_activity = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$activity = array_merge($activity, $bookings_activity);

// Recent reviews
$stmt = $conn->prepare("
    SELECT 
        'review_written' as type,
        CONCAT('You reviewed ', u.full_name) as message,
        r.created_at
    FROM reviews r
    JOIN users u ON r.artist_id = u.id
    WHERE r.reviewer_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$reviews_activity = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$activity = array_merge($activity, $reviews_activity);

// Recent favorites
$stmt = $conn->prepare("
    SELECT 
        'favorite_added' as type,
        CONCAT('You added ', u.full_name, ' to favorites') as message,
        f.created_at
    FROM favorites f
    JOIN users u ON f.artist_id = u.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$favorites_activity = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$activity = array_merge($activity, $favorites_activity);

// Sort activity by date (newest first) and take top 10
usort($activity, function ($a, $b) {
  return strtotime($b['created_at']) - strtotime($a['created_at']);
});
$dashboard_data['recent_activity'] = array_slice($activity, 0, 10);

json_response(true, 'Dashboard data loaded', $dashboard_data);
