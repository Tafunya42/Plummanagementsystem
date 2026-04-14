<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/mailer.php';

plum_require_post();
plum_verify_csrf();

$email = plum_normalize_email((string) ($_POST['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    plum_json_response(['ok' => false, 'message' => 'Enter a valid email address.'], 422);
}

plum_rate_limit_or_fail('resend_verification', 1, plum_resend_code_cooldown_seconds(), $email . '|' . plum_client_ip());

$user = plum_get_user_by_email($email);
if (!$user) {
    plum_json_response(['ok' => true, 'message' => 'If the account exists, a new code has been sent.']);
}

if (plum_user_is_verified($user)) {
    plum_json_response(['ok' => true, 'message' => 'This email is already verified.', 'redirect' => plum_dashboard_path(plum_user_role($user))]);
}

$verification = plum_create_email_verification((int) $user['id']);

try {
    plum_send_verification_code_email($user, $verification['code']);
} catch (Throwable $e) {
    error_log('Verification resend email failed: ' . $e->getMessage());
    plum_json_response([
        'ok' => false,
        'message' => 'The code was created, but the email could not be sent. Check your mail settings and try again.',
    ], 500);
}

plum_json_response(['ok' => true, 'message' => 'A new code has been sent.']);
