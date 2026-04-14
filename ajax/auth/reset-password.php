<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/config.php';

plum_require_post();
plum_verify_csrf();
plum_rate_limit_or_fail('reset_password', 8, plum_auth_rate_limit_window_seconds(), plum_client_ip());

$token = trim((string) ($_POST['token'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$confirm = (string) ($_POST['password_confirm'] ?? '');

if ($token === '') {
    plum_json_response(['ok' => false, 'message' => 'The reset link is missing or invalid.'], 422);
}

if ($password !== $confirm) {
    plum_json_response(['ok' => false, 'message' => 'Passwords do not match.'], 422);
}

$passwordErrors = plum_password_errors($password);
if ($passwordErrors !== []) {
    plum_json_response(['ok' => false, 'message' => implode(' ', $passwordErrors)], 422);
}

$tokenHash = hash_hmac('sha256', $token, (string) plum_env('APP_KEY', 'plum-dev-key'));
$reset = plum_fetch_one(
    'SELECT * FROM `password_resets` WHERE `token_hash` = ? AND `used_at` IS NULL AND `expires_at` > NOW() ORDER BY `id` DESC LIMIT 1',
    's',
    [$tokenHash]
);

if (!$reset) {
    plum_json_response(['ok' => false, 'message' => 'That reset link has expired. Please request a new one.'], 422);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
plum_update_assoc('users', ['password_hash' => $hash], 'id = ?', 's', [$reset['user_id']]);
plum_update_assoc('password_resets', ['used_at' => date('Y-m-d H:i:s')], 'id = ?', 's', [$reset['id']]);

plum_json_response(['ok' => true, 'message' => 'Your password has been updated.', 'redirect' => 'login.php']);
