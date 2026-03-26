<?php

/**
 * Logout Handler
 * Destroys session and clears remember-me cookie, then redirects to login
 */

session_start();

require_once __DIR__ . '/includes/functions.php';

// Destroy the session and clear remember-me cookie
destroy_session();

// Redirect to login page
header('Location: login.html');
exit;
