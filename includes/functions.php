<?php

/**
 * Helper Functions
 * Security and utility functions for authentication and registration
 */

/**
 * Sanitize input data
 */
function sanitize_input($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
  return $data;
}

/**
 * Validate email format
 */
function validate_email($email)
{
  return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Hash password (using bcrypt)
 */
function hash_password($password)
{
  return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

/**
 * Verify password
 */
function verify_password($password, $hash)
{
  return password_verify($password, $hash);
}

/**
 * Generate CSRF token
 */
function generate_csrf_token()
{
  if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
  }
  return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verify_csrf_token($token)
{
  return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Generate secure session ID
 */
function regenerate_session()
{
  session_regenerate_id(true);
}

/**
 * Set secure session cookie parameters
 */
function set_secure_session()
{
  session_set_cookie_params([
    'lifetime' => 86400 * 30, // 30 days
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict'
  ]);
}

/**
 * Create user session
 */
function create_user_session($user_id, $user_type, $full_name, $email, $remember = false)
{
  $_SESSION['user_id'] = $user_id;
  $_SESSION['user_type'] = $user_type;
  $_SESSION['full_name'] = $full_name;
  $_SESSION['email'] = $email;
  $_SESSION['login_time'] = time();
  $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'];
  $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];

  if ($remember) {
    // Set remember me cookie (expires in 30 days)
    $token = bin2hex(random_bytes(32));
    $expires = time() + (86400 * 30);

    setcookie('remember_token', $token, $expires, '/', '', isset($_SERVER['HTTPS']), true);

    // Store token in database
    global $conn;
    $token_hash = hash('sha256', $token);
    $expires_date = date('Y-m-d H:i:s', $expires);

    $stmt = $conn->prepare("UPDATE users SET remember_token = ?, remember_expires = ? WHERE id = ?");
    $stmt->bind_param("ssi", $token_hash, $expires_date, $user_id);
    $stmt->execute();
    $stmt->close();
  }
}

/**
 * Check if user is logged in
 */
function is_logged_in()
{
  if (!isset($_SESSION['user_id'])) {
    // Check remember me cookie
    if (isset($_COOKIE['remember_token'])) {
      return check_remember_token($_COOKIE['remember_token']);
    }
    return false;
  }

  // Validate session integrity
  if (
    $_SESSION['ip_address'] !== $_SERVER['REMOTE_ADDR'] ||
    $_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']
  ) {
    destroy_session();
    return false;
  }

  return true;
}

/**
 * Check remember me token
 */
function check_remember_token($token)
{
  global $conn;

  $token_hash = hash('sha256', $token);
  $now = date('Y-m-d H:i:s');

  $stmt = $conn->prepare("SELECT id, user_type, full_name, email FROM users WHERE remember_token = ? AND remember_expires > ? AND is_active = 1");
  $stmt->bind_param("ss", $token_hash, $now);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($row = $result->fetch_assoc()) {
    create_user_session($row['id'], $row['user_type'], $row['full_name'], $row['email'], true);
    $stmt->close();
    return true;
  }

  $stmt->close();
  return false;
}

/**
 * Destroy user session
 */
function destroy_session()
{
  session_unset();
  session_destroy();

  // Clear remember me cookie
  setcookie('remember_token', '', time() - 3600, '/', '', isset($_SERVER['HTTPS']), true);
}

/**
 * Rate limiting
 */
function check_rate_limit($identifier, $limit = 5, $window = 300)
{
  $log_dir = __DIR__ . '/../logs';
  if (!file_exists($log_dir)) {
    mkdir($log_dir, 0755, true);
  }

  $filename = $log_dir . '/rate_limit_' . md5($identifier) . '.log';

  $now = time();
  $attempts = [];

  if (file_exists($filename)) {
    $attempts = json_decode(file_get_contents($filename), true) ?: [];
    // Remove old attempts
    $attempts = array_filter($attempts, function ($timestamp) use ($now, $window) {
      return $timestamp > ($now - $window);
    });
  }

  if (count($attempts) >= $limit) {
    return false;
  }

  $attempts[] = $now;
  file_put_contents($filename, json_encode($attempts));

  return true;
}

/**
 * Log login attempt
 */
function log_login_attempt($email, $success, $ip)
{
  global $conn;

  // Check if table exists
  $table_check = $conn->query("SHOW TABLES LIKE 'login_attempts'");
  if ($table_check->num_rows == 0) {
    $conn->query("
            CREATE TABLE IF NOT EXISTS `login_attempts` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `email` varchar(255) NOT NULL,
                `success` tinyint(1) NOT NULL DEFAULT 0,
                `ip_address` varchar(45) NOT NULL,
                `attempt_time` datetime NOT NULL,
                PRIMARY KEY (`id`),
                KEY `idx_email` (`email`),
                KEY `idx_ip` (`ip_address`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        ");
  }

  $stmt = $conn->prepare("INSERT INTO login_attempts (email, success, ip_address, attempt_time) VALUES (?, ?, ?, NOW())");
  $stmt->bind_param("sis", $email, $success, $ip);
  $stmt->execute();
  $stmt->close();
}

/**
 * Send JSON response
 */
function json_response($success, $message, $data = null)
{
  $response = [
    'success' => $success,
    'message' => $message
  ];

  if ($data !== null) {
    $response['data'] = $data;
  }

  header('Content-Type: application/json');
  echo json_encode($response);
  exit;
}

/**
 * Generate random string
 */
function random_string($length = 32)
{
  return bin2hex(random_bytes($length / 2));
}

// ==================== REGISTRATION FUNCTIONS ====================

/**
 * Generate email verification code (6-digit)
 * MUST BE DEFINED BEFORE create_user() CALLS IT
 */
function generate_verification_code()
{
  return sprintf("%06d", mt_rand(1, 999999));
}

/**
 * Generate secure verification token (instead of exposing email in URL)
 */
function generate_verification_token()
{
  return bin2hex(random_bytes(32));
}

/**
 * Check if email already exists
 */
function email_exists($email, $conn)
{
  $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();
  $exists = $result->num_rows > 0;
  $stmt->close();
  return $exists;
}

/**
 * Validate password strength
 */
function is_password_strong($password)
{
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return strlen($password) >= 8 &&
    preg_match('/[A-Z]/', $password) &&
    preg_match('/[a-z]/', $password) &&
    preg_match('/[0-9]/', $password);
}

/**
 * Send verification email with code and secure link
 */
function send_verification_email($email, $name, $code, $token = null)
{
  $mailer_file = __DIR__ . '/mailer.php';
  if (!file_exists($mailer_file)) {
    error_log("Mailer file not found: $mailer_file");
    return false;
  }

  require_once $mailer_file;

  $app_url = isset($_ENV['APP_URL']) ? $_ENV['APP_URL'] : 'http://localhost';

  // If token not provided, generate one
  if (!$token) {
    $token = generate_verification_token();
  }

  // Secure link with token only (no email exposed)
  $verify_link = $app_url . "/verify-email.php?token=" . $token;

  $subject = "Verify Your Email - Plum";
  $body = "
        <html>
        <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: linear-gradient(135deg, #6d28d9, #9f5fff); padding: 30px; text-align: center;'>
                <h1 style='color: white; margin: 0;'>Plum</h1>
            </div>
            <div style='padding: 30px; background: #f9fafb;'>
                <h2>Welcome to Plum, $name!</h2>
                <p>Thank you for registering. Please use the verification code below to complete your registration:</p>
                
                <div style='background: white; padding: 20px; text-align: center; margin: 30px 0; border-radius: 12px; border: 2px dashed #9f5fff;'>
                    <span style='font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #6d28d9;'>$code</span>
                </div>
                
                <p>This code will expire in <strong>24 hours</strong>.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                
                <hr style='margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;'>
                
                <p style='font-size: 12px; color: #6b7280;'>
                    Or click here to verify: <a href='$verify_link'>$verify_link</a>
                </p>
            </div>
            <div style='background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;'>
                <p>© 2024 Plum. All rights reserved.</p>
            </div>
        </body>
        </html>
    ";

  return send_email($email, $name, $subject, $body);
}

/**
 * Create new user with verification code and token
 */
function create_user($email, $password, $full_name, $user_type, $conn, $stage_name = null)
{
  // Hash password
  $hashed_password = hash_password($password);

  // Generate verification code and token
  $verification_code = generate_verification_code();
  $verification_token = generate_verification_token();
  $code_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

  // Start transaction
  $conn->begin_transaction();

  try {
    // Insert into users table
    $stmt = $conn->prepare("
            INSERT INTO users (email, password, full_name, user_type, is_verified, is_active, created_at) 
            VALUES (?, ?, ?, ?, 0, 1, NOW())
        ");
    $stmt->bind_param("ssss", $email, $hashed_password, $full_name, $user_type);

    if (!$stmt->execute()) {
      throw new Exception("User insert failed: " . $stmt->error);
    }

    $user_id = $stmt->insert_id;
    $stmt->close();

    // Check if email_verifications table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'email_verifications'");
    if ($table_check->num_rows == 0) {
      $conn->query("
                CREATE TABLE IF NOT EXISTS `email_verifications` (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `user_id` int(11) NOT NULL,
                    `code` varchar(10) NOT NULL,
                    `token` varchar(255) NOT NULL,
                    `expires_at` datetime NOT NULL,
                    `used` tinyint(1) DEFAULT 0,
                    `used_at` datetime DEFAULT NULL,
                    `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    UNIQUE KEY `token` (`token`),
                    KEY `code` (`code`),
                    KEY `user_id` (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
            ");
    }

    // Insert verification data
    $stmt = $conn->prepare("
            INSERT INTO email_verifications (user_id, code, token, expires_at) 
            VALUES (?, ?, ?, ?)
        ");
    $stmt->bind_param("isss", $user_id, $verification_code, $verification_token, $code_expiry);

    if (!$stmt->execute()) {
      throw new Exception("Verification insert failed: " . $stmt->error);
    }
    $stmt->close();

    // If artist, create artist profile
    if ($user_type === 'artist') {
      $table_check = $conn->query("SHOW TABLES LIKE 'artist_profiles'");
      if ($table_check->num_rows > 0) {
        $stmt = $conn->prepare("
                    INSERT INTO artist_profiles (user_id, category, hourly_rate, experience_years, created_at) 
                    VALUES (?, 'pending', 0.00, 0, NOW())
                ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->close();
      }
    }

    // Commit transaction
    $conn->commit();

    return [
      'success' => true,
      'user_id' => $user_id,
      'verification_code' => $verification_code,
      'verification_token' => $verification_token
    ];
  } catch (Exception $e) {
    $conn->rollback();
    error_log("User creation failed: " . $e->getMessage());
    return [
      'success' => false,
      'message' => 'Registration failed: ' . $e->getMessage()
    ];
  }
}

/**
 * Get user by verification token
 */
function get_user_by_token($token, $conn)
{
  $stmt = $conn->prepare("
        SELECT ev.user_id, ev.code, u.email, u.full_name, u.is_verified, ev.expires_at
        FROM email_verifications ev 
        JOIN users u ON ev.user_id = u.id 
        WHERE ev.token = ? AND ev.used = 0
    ");
  $stmt->bind_param("s", $token);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    return null;
  }

  return $result->fetch_assoc();
}

/**
 * Verify email with code (using token from session or URL)
 */
function verify_email_code($code, $token, $conn)
{
  $stmt = $conn->prepare("
        SELECT ev.user_id, ev.expires_at, u.email, u.full_name, u.is_verified 
        FROM email_verifications ev 
        JOIN users u ON ev.user_id = u.id 
        WHERE ev.code = ? AND ev.token = ? AND ev.used = 0
    ");
  $stmt->bind_param("ss", $code, $token);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    return ['success' => false, 'message' => 'Invalid verification code'];
  }

  $verification = $result->fetch_assoc();
  $stmt->close();

  // Check if already verified
  if ($verification['is_verified']) {
    return ['success' => false, 'message' => 'Email already verified'];
  }

  // Check if code expired
  $now = new DateTime();
  $expires = new DateTime($verification['expires_at']);

  if ($now > $expires) {
    return ['success' => false, 'message' => 'Verification code has expired. Please request a new one.'];
  }

  // Update user as verified
  $conn->begin_transaction();

  try {
    $stmt = $conn->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
    $stmt->bind_param("i", $verification['user_id']);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("UPDATE email_verifications SET used = 1, used_at = NOW() WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->close();

    $conn->commit();

    return [
      'success' => true,
      'user_id' => $verification['user_id'],
      'full_name' => $verification['full_name'],
      'email' => $verification['email']
    ];
  } catch (Exception $e) {
    $conn->rollback();
    error_log("Verification failed: " . $e->getMessage());
    return ['success' => false, 'message' => 'Verification failed. Please try again.'];
  }
}

/**
 * Resend verification code
 */
function resend_verification_code($token, $conn)
{
  // Get user by token
  $user_data = get_user_by_token($token, $conn);

  if (!$user_data) {
    return ['success' => false, 'message' => 'Invalid verification request'];
  }

  if ($user_data['is_verified']) {
    return ['success' => false, 'message' => 'Email already verified'];
  }

  // Check if token expired
  $now = new DateTime();
  $expires = new DateTime($user_data['expires_at']);

  if ($now < $expires) {
    // Still valid, just resend same code
    $code = $user_data['code'];
    $email = $user_data['email'];
    $name = $user_data['full_name'];

    $sent = send_verification_email($email, $name, $code, $token);

    if ($sent) {
      return ['success' => true, 'message' => 'Verification code resent to your email'];
    } else {
      return ['success' => false, 'message' => 'Failed to send email. Please try again.'];
    }
  } else {
    // Generate new code and update
    $new_code = generate_verification_code();
    $new_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $stmt = $conn->prepare("
            UPDATE email_verifications 
            SET code = ?, expires_at = ?, used = 0 
            WHERE token = ?
        ");
    $stmt->bind_param("sss", $new_code, $new_expiry, $token);

    if ($stmt->execute()) {
      $sent = send_verification_email($user_data['email'], $user_data['full_name'], $new_code, $token);

      if ($sent) {
        return ['success' => true, 'message' => 'New verification code sent to your email'];
      } else {
        return ['success' => false, 'message' => 'Failed to send email. Please try again.'];
      }
    } else {
      return ['success' => false, 'message' => 'Failed to update verification code'];
    }
  }
}
