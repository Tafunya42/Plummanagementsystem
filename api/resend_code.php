<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/resend_errors.log');

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Log the request
error_log("Resend request received: " . file_get_contents('php://input'));

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

// Validate token
$token = isset($input['token']) ? sanitize_input($input['token']) : '';

if (empty($token)) {
  json_response(false, 'Invalid request');
}

// Rate limiting for resend requests
$ip_address = $_SERVER['REMOTE_ADDR'];
if (!check_rate_limit($ip_address, 3, 900)) {
  json_response(false, 'Too many resend requests. Please try again later.');
}

// Resend code using token
$result = resend_verification_code($token, $conn);

if ($result['success']) {
  json_response(true, $result['message']);
} else {
  json_response(false, $result['message']);
}
