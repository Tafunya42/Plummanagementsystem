<?php

/**
 * AJAX Login Handler
 * Processes login requests from the frontend
 */

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(false, 'Invalid request method');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
  json_response(false, 'Invalid request data');
}

// Validate required fields
$email = isset($input['email']) ? sanitize_input($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';
$user_type = isset($input['user_type']) ? sanitize_input($input['user_type']) : '';
$remember = isset($input['remember']) ? (bool)$input['remember'] : false;

// Basic validation
if (empty($email) || empty($password)) {
  json_response(false, 'Email and password are required');
}

if (!validate_email($email)) {
  json_response(false, 'Invalid email format');
}

// Rate limiting by IP
$ip_address = $_SERVER['REMOTE_ADDR'];
if (!check_rate_limit($ip_address, 5, 300)) {
  json_response(false, 'Too many login attempts. Please try again later.');
}

// Rate limiting by email
if (!check_rate_limit($email, 5, 300)) {
  json_response(false, 'Too many login attempts for this email. Please try again later.');
}

// Prepare SQL query
if ($user_type === 'artist') {
  $sql = "SELECT u.id, u.email, u.password, u.full_name, u.user_type, u.is_active, u.is_verified,
                   ap.category, ap.hourly_rate, ap.availability_status
            FROM users u
            LEFT JOIN artist_profiles ap ON u.id = ap.user_id
            WHERE u.email = ? AND u.user_type = 'artist'";
} else {
  $sql = "SELECT u.id, u.email, u.password, u.full_name, u.user_type, u.is_active, u.is_verified
            FROM users u
            WHERE u.email = ? AND u.user_type = ?";
}

$stmt = $conn->prepare($sql);

if ($user_type === 'artist') {
  $stmt->bind_param("s", $email);
} else {
  $stmt->bind_param("ss", $email, $user_type);
}

$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  log_login_attempt($email, 0, $ip_address);
  json_response(false, 'Invalid email or password');
}

$user = $result->fetch_assoc();
$stmt->close();

// Check if account is active
if (!$user['is_active']) {
  log_login_attempt($email, 0, $ip_address);
  json_response(false, 'Your account has been deactivated. Please contact support.');
}

// Verify password
if (!verify_password($password, $user['password'])) {
  log_login_attempt($email, 0, $ip_address);
  json_response(false, 'Invalid email or password');
}

// Check email verification for artists (optional - comment out if not required)
if ($user_type === 'artist' && !$user['is_verified']) {
  json_response(false, 'Your account is pending verification. Please check your email or contact support.');
}

// Update last login
$update_sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
$update_stmt = $conn->prepare($update_sql);
$update_stmt->bind_param("i", $user['id']);
$update_stmt->execute();
$update_stmt->close();

// Create user session
create_user_session($user['id'], $user['user_type'], $user['full_name'], $user['email'], $remember);

// Log successful login
log_login_attempt($email, 1, $ip_address);

// Prepare response data
$response_data = [
  'user_id' => $user['id'],
  'full_name' => $user['full_name'],
  'user_type' => $user['user_type'],
  'redirect' => $user['user_type'] === 'artist' ? 'dashboard-artist.php' : 'dashboard-client.php'
];

// Add artist-specific data if applicable
if ($user_type === 'artist') {
  $response_data['category'] = $user['category'] ?? null;
  $response_data['hourly_rate'] = $user['hourly_rate'] ?? null;
  $response_data['availability_status'] = $user['availability_status'] ?? 'available';
}

json_response(true, 'Login successful', $response_data);
