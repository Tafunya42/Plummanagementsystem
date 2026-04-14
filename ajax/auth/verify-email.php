<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/config.php';

plum_require_post();
plum_verify_csrf();

$email = plum_normalize_email((string) ($_POST['email'] ?? ''));
$code = preg_replace('/\D+/', '', (string) ($_POST['code'] ?? '')) ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($code) !== 6) {
    plum_json_response(['ok' => false, 'message' => 'Enter the 6 digit code from your email.'], 422);
}

plum_rate_limit_or_fail('verify_email', 10, plum_auth_rate_limit_window_seconds(), $email . '|' . plum_client_ip());

$user = plum_get_user_by_email($email);
if (!$user) {
    plum_json_response(['ok' => false, 'message' => 'Invalid verification request.'], 404);
}

if (plum_user_is_verified($user)) {
    plum_login_user($user);
    plum_json_response(['ok' => true, 'message' => 'Email already verified.', 'redirect' => plum_dashboard_path(plum_user_role($user))]);
}

$verification = plum_fetch_one(
    'SELECT * FROM `email_verifications` WHERE `user_id` = ? AND `used` = 0 AND `expires_at` > NOW() ORDER BY `id` DESC LIMIT 1',
    's',
    [$user['id']]
);

if (!$verification) {
    plum_json_response(['ok' => false, 'message' => 'That code has expired. Please request a new one.'], 422);
}

$expectedHash = (string) ($verification['code_hash'] ?? '');
$isValid = $expectedHash !== '' && hash_equals($expectedHash, plum_verification_code_hash($code));

if (!$isValid && !empty($verification['code']) && $verification['code'] !== '******') {
    $isValid = hash_equals((string) $verification['code'], $code);
}

if (!$isValid) {
    plum_json_response(['ok' => false, 'message' => 'That verification code is not correct.'], 422);
}

plum_update_assoc('email_verifications', ['used' => 1, 'used_at' => date('Y-m-d H:i:s')], 'id = ?', 's', [$verification['id']]);
plum_mark_user_verified((int) $user['id']);

$user = plum_get_user_by_email($email);
if ($user) {
    plum_login_user($user);
}

plum_json_response([
    'ok' => true,
    'message' => 'Email verified.',
    'redirect' => plum_dashboard_path($user ? plum_user_role($user) : 'artist'),
]);
