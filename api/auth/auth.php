<?php

/**
 * Authentication API
 * Handles auth checking and logout
 */

// Start session
session_start();

// Include required files
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/functions.php';

// Handle GET request for auth check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check'])) {
  // Check if user is logged in
  if (isset($_SESSION['user_id']) && isset($_SESSION['user_type'])) {
    json_response(true, 'Authenticated', [
      'user_id' => $_SESSION['user_id'],
      'user_type' => $_SESSION['user_type'],
      'full_name' => $_SESSION['full_name'],
      'email' => $_SESSION['email']
    ]);
  } else {
    json_response(false, 'Not authenticated');
  }
}

// Handle POST request for logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'logout') {
  destroy_session();
  json_response(true, 'Logged out successfully');
}

// Handle any other requests
json_response(false, 'Invalid request');
