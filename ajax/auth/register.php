<?php
declare(strict_types=1);

require_once __DIR__ . '/../../includes/mailer.php';

plum_require_post();
plum_verify_csrf();
plum_rate_limit_or_fail('register_ip', 5, plum_auth_rate_limit_window_seconds(), plum_client_ip());

$email = plum_normalize_email((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$firstName = trim((string) ($_POST['first_name'] ?? ''));
$lastName = trim((string) ($_POST['last_name'] ?? ''));
$role = trim((string) ($_POST['role'] ?? 'artist'));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    plum_json_response(['ok' => false, 'message' => 'Enter a valid email address.'], 422);
}

plum_rate_limit_or_fail('register_email', 3, plum_auth_rate_limit_window_seconds(), $email);

if (!in_array($role, ['artist', 'organizer'], true)) {
    plum_json_response(['ok' => false, 'message' => 'Choose a valid account type.'], 422);
}

if ($firstName === '' || $lastName === '') {
    plum_json_response(['ok' => false, 'message' => 'First name and last name are required.'], 422);
}

$passwordErrors = plum_password_errors($password);
if ($passwordErrors !== []) {
    plum_json_response(['ok' => false, 'message' => implode(' ', $passwordErrors)], 422);
}

if (plum_get_user_by_email($email)) {
    plum_json_response(['ok' => false, 'message' => 'An account with that email already exists.'], 409);
}

$userUuid = plum_uuid_v4();

try {
    $profilePicture = plum_store_uploaded_file('profile_picture', 'profile_pictures', $userUuid);
} catch (Throwable $e) {
    plum_json_response(['ok' => false, 'message' => $e->getMessage()], 422);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$fullName = trim($firstName . ' ' . $lastName);

try {
    plum_db()->begin_transaction();

    $userId = plum_insert_assoc('users', [
        'uuid' => $userUuid,
        'email' => $email,
        'password_hash' => $hash,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'full_name' => $fullName,
        'display_name' => trim((string) ($_POST['display_name'] ?? $fullName)),
        'phone' => trim((string) ($_POST['phone'] ?? '')),
        'location' => trim((string) ($_POST['city'] ?? '')),
        'bio' => trim((string) ($_POST['bio'] ?? '')),
        'profile_picture' => $profilePicture,
        'is_verified' => 0,
        'is_active' => 1,
        'email_verified_at' => null,
    ]);

    plum_assign_role($userId, $role);

    if ($profilePicture !== null && !empty($_FILES['profile_picture'])) {
        plum_insert_assoc('uploaded_files', [
            'uuid' => plum_uuid_v4(),
            'user_id' => $userId,
            'folder' => 'profile_pictures',
            'original_name' => (string) ($_FILES['profile_picture']['name'] ?? ''),
            'stored_name' => basename($profilePicture),
            'path' => $profilePicture,
            'mime_type' => (string) ($_FILES['profile_picture']['type'] ?? ''),
            'size_bytes' => (string) ($_FILES['profile_picture']['size'] ?? 0),
        ]);
    }

    if ($role === 'artist') {
        try {
            plum_insert_assoc('artist_profiles', [
                'user_id' => $userId,
                'category' => trim((string) ($_POST['category'] ?? 'Other')) ?: 'Other',
                'hourly_rate' => trim((string) ($_POST['rate'] ?? '0')) ?: '0',
                'description' => trim((string) ($_POST['bio'] ?? '')),
                'portfolio_url' => trim((string) ($_POST['portfolio_url'] ?? '')),
            ]);
        } catch (Throwable $e) {
            error_log('Artist profile insert failed: ' . $e->getMessage());
        }
    }

    $verification = plum_create_email_verification($userId);
    plum_db()->commit();
} catch (Throwable $e) {
    plum_db()->rollback();
    error_log('Registration failed: ' . $e->getMessage());
    plum_json_response(['ok' => false, 'message' => 'We could not create the account right now.'], 500);
}

$user = plum_get_user_by_email($email);

try {
    if ($user) {
        plum_send_verification_code_email($user, $verification['code']);
    }
} catch (Throwable $e) {
    error_log('Verification email failed: ' . $e->getMessage());
    plum_json_response([
        'ok' => false,
        'message' => 'Your account was created, but the verification email could not be sent. Try resending the code.',
        'redirect' => 'verify-email.php?email=' . rawurlencode($email),
    ], 500);
}

plum_json_response([
    'ok' => true,
    'message' => 'Account created. Check your email for the 6 digit code.',
    'redirect' => 'verify-email.php?email=' . rawurlencode($email),
]);
