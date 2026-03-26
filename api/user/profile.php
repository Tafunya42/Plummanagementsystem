<?php

/**
 * User Profile API
 * Returns the current user's profile data
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

// Get user profile
$stmt = $conn->prepare("
    SELECT id, email, full_name, user_type, phone, location, bio, profile_picture, 
           rating, total_reviews, events_completed, is_verified, created_at
    FROM users 
    WHERE id = ? AND is_active = 1
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
  json_response(true, 'Profile loaded', $row);
} else {
  json_response(false, 'User not found');
}

$stmt->close();
