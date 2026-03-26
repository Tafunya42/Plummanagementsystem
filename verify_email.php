<?php

/**
 * Email Verification Page
 * Uses secure token instead of exposing email in URL
 */

// Start session
session_start();

// Include required files
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

// Get token from URL
$token = isset($_GET['token']) ? sanitize_input($_GET['token']) : '';

// If no token, check session
if (empty($token) && isset($_SESSION['verification_token'])) {
  $token = $_SESSION['verification_token'];
}

if (empty($token)) {
  die('Invalid verification link. Please go back and try again.');
}

// Get user data from token
$user_data = get_user_by_token($token, $conn);

if (!$user_data) {
  die('Invalid or expired verification link. Please register again.');
}

if ($user_data['is_verified']) {
  // Already verified, redirect to login
  header('Location: /login.php?verified=1');
  exit;
}

// Store token in session for the verification process
$_SESSION['verification_token'] = $token;

// Mask email for display (show only first 3 characters and domain)
$email_parts = explode('@', $user_data['email']);
$masked_email = substr($email_parts[0], 0, 3) . '***@' . $email_parts[1];
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Email - Plum</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f8f6ff 0%, #f0e9ff 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .verify-container {
      max-width: 500px;
      width: 100%;
      background: white;
      border-radius: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .verify-header {
      background: linear-gradient(135deg, #6d28d9, #9f5fff);
      padding: 40px;
      text-align: center;
      color: white;
    }

    .verify-header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }

    .verify-header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .verify-content {
      padding: 40px;
    }

    .info-email {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
      color: #4b5563;
    }

    .info-email i {
      color: #6d28d9;
      margin-right: 8px;
    }

    .code-input-container {
      margin: 30px 0;
      text-align: center;
    }

    .code-input {
      width: 100%;
      padding: 20px;
      font-size: 32px;
      text-align: center;
      letter-spacing: 10px;
      font-weight: 700;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      font-family: monospace;
      transition: all 0.3s;
    }

    .code-input:focus {
      outline: none;
      border-color: #9f5fff;
      box-shadow: 0 0 0 3px rgba(159, 95, 255, 0.1);
    }

    .code-input.error {
      border-color: #ef4444;
    }

    .btn-verify {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #6d28d9, #9f5fff);
      color: white;
      border: none;
      border-radius: 40px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }

    .btn-verify:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(109, 40, 217, 0.4);
    }

    .btn-verify:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .resend-link {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }

    .resend-link a {
      color: #6d28d9;
      text-decoration: none;
      font-weight: 600;
    }

    .resend-link a:hover {
      text-decoration: underline;
    }

    .message {
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: none;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      display: block;
    }

    .message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
      display: block;
    }

    .timer {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      margin-top: 15px;
    }

    .timer span {
      font-weight: 700;
      color: #6d28d9;
    }

    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>
  <div class="verify-container">
    <div class="verify-header">
      <h1>Verify Your Email</h1>
      <p>Enter the 6-digit code sent to your email</p>
    </div>
    <div class="verify-content">
      <div class="info-email">
        <i class="fas fa-envelope"></i>
        We sent a verification code to:<br>
        <strong><?php echo htmlspecialchars($masked_email); ?></strong>
      </div>

      <div id="message" class="message"></div>

      <div class="code-input-container">
        <input type="text"
          class="code-input"
          id="verificationCode"
          maxlength="6"
          placeholder="000000"
          autocomplete="off">
      </div>

      <button class="btn-verify" id="verifyBtn">
        <i class="fas fa-check-circle"></i> Verify Email
      </button>

      <div class="resend-link">
        Didn't receive a code? <a href="#">Resend Code</a>
      </div>
      <div class="timer" id="timer"></div>
    </div>
  </div>

  <!-- Hidden input to store the verification token -->
  <input type="hidden" id="verification-token" value="<?php echo htmlspecialchars($token); ?>">

  <!-- External JavaScript -->
  <script src="/assets/js/verify_email.js"></script>
</body>

</html>