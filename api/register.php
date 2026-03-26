<?php

/**
 * AJAX Registration Handler
 */

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Check if files were loaded correctly
if (!isset($conn)) {
  error_log("Database connection not established");
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database connection error']);
  exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Invalid request method']);
  exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid request data']);
  exit;
}

// Log the request for debugging
error_log("Registration request: " . json_encode($input));


// Validate required fields
$full_name = isset($input['full_name']) ? sanitize_input($input['full_name']) : '';
$email = isset($input['email']) ? sanitize_input($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';
$user_type = isset($input['user_type']) ? sanitize_input($input['user_type']) : '';
$agree_terms = isset($input['agree_terms']) ? (bool)$input['agree_terms'] : false;
$stage_name = isset($input['stage_name']) ? sanitize_input($input['stage_name']) : null;

// Basic validation
if (empty($full_name) || empty($email) || empty($password)) {
  json_response(false, 'All fields are required');
}

// Validate full name (at least 2 words or 3 characters)
if (strlen($full_name) < 3) {
  json_response(false, 'Please enter your full name');
}

// Validate email format
if (!validate_email($email)) {
  json_response(false, 'Please enter a valid email address');
}

// Validate password strength
if (!is_password_strong($password)) {
  json_response(false, 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers');
}

// Validate user type
if (!in_array($user_type, ['client', 'artist'])) {
  json_response(false, 'Invalid account type');
}

// Check terms agreement
if (!$agree_terms) {
  json_response(false, 'You must agree to the Terms & Privacy Policy');
}

// Rate limiting by IP
$ip_address = $_SERVER['REMOTE_ADDR'];
if (!check_rate_limit($ip_address, 3, 300)) { // 3 attempts per 5 minutes
  json_response(false, 'Too many registration attempts. Please try again later.');
}

// Check if email already exists
if (email_exists($email, $conn)) {
  json_response(false, 'Email already registered. Please login or use a different email.');
}

// Create user
$result = create_user($email, $password, $full_name, $user_type, $conn, $stage_name);

if (!$result['success']) {
  json_response(false, $result['message'] ?? 'Registration failed. Please try again.');
}

// In your /api/register.php, after successful user creation:

// Store token in session for verification page
$_SESSION['verification_token'] = $result['verification_token'];
$_SESSION['verification_email'] = $email;

// Send verification email with secure token link
$email_sent = send_verification_email($email, $full_name, $result['verification_code'], $result['verification_token']);

if (!$email_sent) {
  error_log("Failed to send verification email to: $email");
}

// Prepare response - redirect to verification page with token (not email)
$response_data = [
  'user_id' => $result['user_id'],
  'full_name' => $full_name,
  'user_type' => $user_type,
  'email_sent' => $email_sent,
  'redirect' => '/verify_email.php?token=' . $result['verification_token']  // Secure: token only, no email
];

json_response(true, 'Registration successful! Please check your email for the verification code.', $response_data);
