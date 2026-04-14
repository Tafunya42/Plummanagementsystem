<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/config.php';

plum_require_post();
plum_verify_csrf();
plum_rate_limit_or_fail('login_ip', 20, plum_auth_rate_limit_window_seconds(), plum_client_ip());

$email = plum_normalize_email((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    plum_json_response(['ok' => false, 'message' => 'Enter your email and password.'], 422);
}

plum_rate_limit_or_fail('login_email', 8, plum_auth_rate_limit_window_seconds(), $email);

$user = plum_get_user_by_email($email);
$valid = $user && password_verify($password, plum_user_password_hash($user));

if (!$valid) {
    plum_record_login_attempt($email, false, null, 'invalid_credentials');
    plum_json_response(['ok' => false, 'message' => 'Invalid email or password.'], 401);
}

if (!plum_user_is_active($user)) {
    plum_record_login_attempt($email, false, (int) $user['id'], 'inactive');
    plum_json_response(['ok' => false, 'message' => 'This account is not active.'], 403);
}

if (!plum_user_is_verified($user)) {
    plum_record_login_attempt($email, false, (int) $user['id'], 'email_unverified');
    plum_json_response([
        'ok' => false,
        'needs_verification' => true,
        'message' => 'Please verify your email before signing in.',
        'redirect' => 'verify-email.php?email=' . rawurlencode($email),
    ], 403);
}

plum_login_user($user);
plum_record_login_attempt($email, true, (int) $user['id']);
plum_update_assoc('users', ['last_login' => date('Y-m-d H:i:s')], 'id = ?', 's', [$user['id']]);

plum_json_response([
    'ok' => true,
    'message' => 'Welcome back.',
    'redirect' => plum_dashboard_path(plum_user_role($user)),
]);
