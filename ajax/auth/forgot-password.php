<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/mailer.php';

plum_require_post();
plum_verify_csrf();

$email = plum_normalize_email((string) ($_POST['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    plum_json_response(['ok' => false, 'message' => 'Enter a valid email address.'], 422);
}

plum_rate_limit_or_fail('forgot_password', 5, plum_auth_rate_limit_window_seconds(), $email . '|' . plum_client_ip());

$user = plum_get_user_by_email($email);
if ($user) {
    try {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash_hmac('sha256', $token, (string) plum_env('APP_KEY', 'plum-dev-key'));
        $expiresAt = date('Y-m-d H:i:s', time() + ((int) plum_env('PASSWORD_RESET_TTL_MINUTES', 15) * 60));

        plum_insert_assoc('password_resets', [
            'uuid' => plum_uuid_v4(),
            'user_id' => $user['id'],
            'email' => $email,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        $resetUrl = plum_app_url('reset-password.php?token=' . rawurlencode($token));
        plum_send_password_reset_email($user, $resetUrl);
    } catch (Throwable $e) {
        error_log('Password reset email failed: ' . $e->getMessage());
    }
}

plum_json_response(['ok' => true, 'message' => 'If that email exists, a reset link has been sent.']);
