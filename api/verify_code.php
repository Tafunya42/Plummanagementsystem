<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/verify_errors.log');

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Log the request for debugging
error_log("Verify request received: " . file_get_contents('php://input'));

// Rest of your code...
// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_response(false, 'Invalid request method');
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
  json_response(false, 'Invalid request data');
}

// Validate inputs
$code = isset($input['code']) ? sanitize_input($input['code']) : '';
$token = isset($input['token']) ? sanitize_input($input['token']) : '';

if (empty($code) || empty($token)) {
  json_response(false, 'Verification code and token are required');
}

// Validate code format (6 digits)
if (!preg_match('/^\d{6}$/', $code)) {
  json_response(false, 'Please enter a valid 6-digit verification code');
}

// Rate limiting
$ip_address = $_SERVER['REMOTE_ADDR'];
if (!check_rate_limit($ip_address, 10, 300)) {
  json_response(false, 'Too many verification attempts. Please try again later.');
}

// Verify the code using token
$result = verify_email_code($code, $token, $conn);

if ($result['success']) {
  $stmt = $conn->prepare("SELECT user_type FROM users WHERE id = ?");
  $stmt->bind_param("i", $result['user_id']);
  $stmt->execute();
  $user_row = $stmt->get_result()->fetch_assoc();
  $stmt->close();
  $user_type = $user_row['user_type'] ?? 'client';

  create_user_session($result['user_id'], $user_type, $result['full_name'], $result['email'], false);
  $redirect = $user_type === 'artist' ? '/dashboard-artist.php?verified=1' : '/dashboard-client.php?verified=1';
  json_response(true, 'Email verified successfully!', ['redirect' => $redirect]);

  // Clear verification session data
  unset($_SESSION['verification_token']);
  unset($_SESSION['verification_email']);
} else {
  json_response(false, $result['message']);
}
