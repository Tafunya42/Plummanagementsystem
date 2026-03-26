<?php

/**
 * Artist Dashboard API
 * Returns dashboard data for logged-in artist
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

// Check if user is an artist
if ($_SESSION['user_type'] !== 'artist') {
  json_response(false, 'Not an artist account');
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
        SUM(total_amount) as total_earnings,
        AVG(CASE WHEN booking_status = 'completed' THEN total_amount ELSE NULL END) as avg_booking_value
    FROM bookings 
    WHERE artist_id = ?
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
$dashboard_data['total_earnings'] = (float)($stats['total_earnings'] ?? 0);
$dashboard_data['avg_booking_value'] = (float)($stats['avg_booking_value'] ?? 0);

// 2. Get upcoming bookings
$stmt = $conn->prepare("
    SELECT b.*, u.full_name as client_name
    FROM bookings b
    JOIN users u ON b.client_id = u.id
    WHERE b.artist_id = ? 
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

// 3. Get recent reviews
$stmt = $conn->prepare("
    SELECT r.*, u.full_name as reviewer_name
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.artist_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$reviews = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$dashboard_data['recent_reviews'] = $reviews;

// 4. Get performance insights
// Response rate - count of messages responded to within 24 hours
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_messages,
        SUM(CASE 
            WHEN TIMESTAMPDIFF(HOUR, created_at, replied_at) <= 24 THEN 1 
            ELSE 0 
        END) as responded_quickly
    FROM messages
    WHERE recipient_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$response_stats = $stmt->get_result()->fetch_assoc();
$stmt->close();

$total_messages = (int)($response_stats['total_messages'] ?? 0);
$quick_responses = (int)($response_stats['responded_quickly'] ?? 0);
$dashboard_data['response_rate'] = $total_messages > 0 ? round(($quick_responses / $total_messages) * 100) : 0;

// Average response time
$stmt = $conn->prepare("
    SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, replied_at)) as avg_response_time
    FROM messages
    WHERE recipient_id = ? AND replied_at IS NOT NULL
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$avg_time = $stmt->get_result()->fetch_assoc();
$stmt->close();

$avg_hours = (float)($avg_time['avg_response_time'] ?? 0);
if ($avg_hours < 1) {
  $dashboard_data['avg_response_time'] = '< 1 hour';
} elseif ($avg_hours < 24) {
  $dashboard_data['avg_response_time'] = round($avg_hours, 1) . ' hours';
} else {
  $dashboard_data['avg_response_time'] = round($avg_hours / 24, 1) . ' days';
}

// Profile views (you'll need a profile_views table for this)
// For now, return mock data or a placeholder
$dashboard_data['profile_views'] = 342; // This would come from a profile_views table

// Times favorited
$stmt = $conn->prepare("
    SELECT COUNT(*) as favorite_count
    FROM favorites
    WHERE artist_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$favorites = $stmt->get_result()->fetch_assoc();
$stmt->close();

$dashboard_data['favorites_count'] = (int)($favorites['favorite_count'] ?? 0);

json_response(true, 'Dashboard data loaded', $dashboard_data);
