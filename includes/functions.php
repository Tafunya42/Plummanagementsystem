<?php
declare(strict_types=1);

function plum_load_environment(string $basePath): void
{
    if (class_exists(\Dotenv\Dotenv::class)) {
        \Dotenv\Dotenv::createImmutable($basePath)->safeLoad();
        return;
    }

    $envPath = rtrim($basePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '.env';
    if (!is_readable($envPath)) {
        return;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '') {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv($key . '=' . $value);
    }
}

function plum_env(string $key, mixed $default = null): mixed
{
    if (array_key_exists($key, $_ENV)) {
        return $_ENV[$key];
    }

    if (array_key_exists($key, $_SERVER)) {
        return $_SERVER[$key];
    }

    $value = getenv($key);
    return $value === false ? $default : $value;
}

function plum_bool(mixed $value, bool $default = false): bool
{
    if ($value === null || $value === '') {
        return $default;
    }

    return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
}

function plum_db(): mysqli
{
    static $connection = null;

    if ($connection instanceof mysqli) {
        return $connection;
    }

    $socket = (string) plum_env('DB_SOCKET', '');
    $connection = new mysqli(
        (string) plum_env('DB_HOST', '127.0.0.1'),
        (string) plum_env('DB_USERNAME', 'root'),
        (string) plum_env('DB_PASSWORD', ''),
        (string) plum_env('DB_DATABASE', 'plum_db'),
        (int) plum_env('DB_PORT', 3306),
        $socket !== '' ? $socket : null
    );
    $connection->set_charset('utf8mb4');

    return $connection;
}

function plum_bind_params(mysqli_stmt $stmt, string $types, array &$values): void
{
    $refs = [];
    foreach ($values as $key => &$value) {
        $refs[$key] = &$value;
    }

    $stmt->bind_param($types, ...$refs);
}

function plum_query(string $sql, string $types = '', array $params = []): mysqli_stmt
{
    $stmt = plum_db()->prepare($sql);

    if ($types !== '' && $params !== []) {
        $values = array_values($params);
        plum_bind_params($stmt, $types, $values);
    }

    $stmt->execute();
    return $stmt;
}

function plum_fetch_one(string $sql, string $types = '', array $params = []): ?array
{
    $stmt = plum_query($sql, $types, $params);
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();

    return $row ?: null;
}

function plum_fetch_all(string $sql, string $types = '', array $params = []): array
{
    $stmt = plum_query($sql, $types, $params);
    $result = $stmt->get_result();
    $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    $stmt->close();

    return $rows;
}

function plum_safe_identifier(string $identifier): string
{
    if (!preg_match('/^[A-Za-z0-9_]+$/', $identifier)) {
        throw new InvalidArgumentException('Unsafe SQL identifier.');
    }

    return $identifier;
}

function plum_table_columns(string $table): array
{
    static $cache = [];

    $table = plum_safe_identifier($table);
    if (array_key_exists($table, $cache)) {
        return $cache[$table];
    }

    try {
        $result = plum_db()->query('SHOW COLUMNS FROM `' . $table . '`');
        $columns = [];
        while ($row = $result->fetch_assoc()) {
            $columns[] = $row['Field'];
        }

        $cache[$table] = $columns;
        return $columns;
    } catch (Throwable $e) {
        error_log('Column lookup failed for ' . $table . ': ' . $e->getMessage());
        $cache[$table] = [];
        return [];
    }
}

function plum_column_exists(string $table, string $column): bool
{
    return in_array($column, plum_table_columns($table), true);
}

function plum_insert_assoc(string $table, array $data): int
{
    $table = plum_safe_identifier($table);
    $available = array_flip(plum_table_columns($table));
    $filtered = array_intersect_key($data, $available);

    if ($filtered === []) {
        throw new RuntimeException('No insertable columns found for ' . $table . '.');
    }

    $columns = array_keys($filtered);
    $values = array_values($filtered);
    $placeholders = implode(',', array_fill(0, count($columns), '?'));

    plum_query(
        'INSERT INTO `' . $table . '` (`' . implode('`,`', $columns) . '`) VALUES (' . $placeholders . ')',
        str_repeat('s', count($values)),
        $values
    )->close();

    return plum_db()->insert_id;
}

function plum_update_assoc(string $table, array $data, string $whereSql, string $whereTypes, array $whereParams): void
{
    $table = plum_safe_identifier($table);
    $available = array_flip(plum_table_columns($table));
    $filtered = array_intersect_key($data, $available);

    if ($filtered === []) {
        return;
    }

    $assignments = [];
    foreach (array_keys($filtered) as $column) {
        $assignments[] = '`' . $column . '` = ?';
    }

    $values = array_values($filtered);
    plum_query(
        'UPDATE `' . $table . '` SET ' . implode(', ', $assignments) . ' WHERE ' . $whereSql,
        str_repeat('s', count($values)) . $whereTypes,
        array_merge($values, $whereParams)
    )->close();
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function plum_json_response(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function plum_require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        plum_json_response(['ok' => false, 'message' => 'POST requests only.'], 405);
    }
}

function plum_csrf_token(): string
{
    if (empty($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['_csrf_token'];
}

function plum_csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(plum_csrf_token()) . '">';
}

function plum_verify_csrf(): void
{
    $token = (string) ($_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));

    if ($token === '' || !hash_equals(plum_csrf_token(), $token)) {
        plum_json_response(['ok' => false, 'message' => 'Your secure session expired. Refresh and try again.'], 419);
    }
}

function plum_client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

function plum_client_agent(): string
{
    return substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 1024);
}

function plum_rate_identifier(string $identifier): string
{
    return hash_hmac('sha256', $identifier, (string) plum_env('APP_KEY', 'plum-dev-key'));
}

function plum_rate_limit(string $action, int $limit, int $windowSeconds, ?string $identifier = null): array
{
    $identifier = plum_rate_identifier($identifier ?: plum_client_ip());
    $now = time();
    $nowSql = date('Y-m-d H:i:s', $now);
    $windowStart = date('Y-m-d H:i:s', $now - $windowSeconds);

    try {
        $row = plum_fetch_one(
            'SELECT * FROM `rate_limits` WHERE `action` = ? AND `identifier` = ? LIMIT 1',
            'ss',
            [$action, $identifier]
        );

        if (!$row) {
            plum_insert_assoc('rate_limits', [
                'uuid' => plum_uuid_v4(),
                'action' => $action,
                'identifier' => $identifier,
                'attempts' => 1,
                'window_started_at' => $nowSql,
                'last_attempt_at' => $nowSql,
                'blocked_until' => null,
            ]);

            return ['allowed' => true, 'remaining' => max(0, $limit - 1), 'retry_after' => 0];
        }

        $blockedUntil = !empty($row['blocked_until']) ? strtotime((string) $row['blocked_until']) : false;
        if ($blockedUntil !== false && $blockedUntil > $now) {
            return ['allowed' => false, 'remaining' => 0, 'retry_after' => $blockedUntil - $now];
        }

        if ((string) $row['window_started_at'] <= $windowStart) {
            plum_update_assoc('rate_limits', [
                'attempts' => 1,
                'window_started_at' => $nowSql,
                'last_attempt_at' => $nowSql,
                'blocked_until' => null,
            ], 'id = ?', 's', [$row['id']]);

            return ['allowed' => true, 'remaining' => max(0, $limit - 1), 'retry_after' => 0];
        }

        $attempts = (int) $row['attempts'];
        if ($attempts >= $limit) {
            plum_update_assoc('rate_limits', [
                'attempts' => $attempts + 1,
                'last_attempt_at' => $nowSql,
                'blocked_until' => date('Y-m-d H:i:s', $now + $windowSeconds),
            ], 'id = ?', 's', [$row['id']]);

            return ['allowed' => false, 'remaining' => 0, 'retry_after' => $windowSeconds];
        }

        plum_update_assoc('rate_limits', [
            'attempts' => $attempts + 1,
            'last_attempt_at' => $nowSql,
        ], 'id = ?', 's', [$row['id']]);

        return ['allowed' => true, 'remaining' => max(0, $limit - $attempts - 1), 'retry_after' => 0];
    } catch (Throwable $e) {
        error_log('Rate limiter failed: ' . $e->getMessage());
        return ['allowed' => true, 'remaining' => $limit, 'retry_after' => 0];
    }
}

function plum_rate_limit_or_fail(string $action, int $limit, int $windowSeconds, ?string $identifier = null): void
{
    $result = plum_rate_limit($action, $limit, $windowSeconds, $identifier);

    if (!$result['allowed']) {
        plum_json_response([
            'ok' => false,
            'message' => 'Too many attempts. Please wait a little and try again.',
            'retry_after' => $result['retry_after'],
        ], 429);
    }
}

function plum_auth_rate_limit_window_seconds(): int
{
    return max(60, (int) plum_env('AUTH_RATE_LIMIT_WINDOW_SECONDS', 300));
}

function plum_resend_code_cooldown_seconds(): int
{
    return max(60, (int) plum_env('VERIFY_RESEND_COOLDOWN_SECONDS', 120));
}

function plum_uuid_v4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function plum_normalize_email(string $email): string
{
    return strtolower(trim($email));
}

function plum_password_errors(string $password): array
{
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = 'Use at least 8 characters.';
    }
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'Add at least one uppercase letter.';
    }
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'Add at least one lowercase letter.';
    }
    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = 'Add at least one number.';
    }
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        $errors[] = 'Add at least one special character.';
    }

    return $errors;
}

function plum_password_is_strong(string $password): bool
{
    return plum_password_errors($password) === [];
}

function plum_app_settings(): array
{
    static $settings = null;

    if (is_array($settings)) {
        return $settings;
    }

    $settings = [
        'app_name' => (string) plum_env('APP_NAME', 'Plum'),
        'app_logo_path' => (string) plum_env('APP_LOGO_PATH', 'images/Plum LogoNew-transparent.png'),
        'support_email' => (string) plum_env('MAIL_FROM_ADDRESS', 'support@plum.local'),
        'maintenance_mode' => '0',
        'maintenance_message' => 'Plum is getting a quick tune-up. Please check back soon.',
    ];

    try {
        if (plum_table_columns('system_settings') !== []) {
            $rows = plum_fetch_all('SELECT `key`, `value` FROM `system_settings`');
            foreach ($rows as $row) {
                $settings[(string) $row['key']] = (string) ($row['value'] ?? '');
            }
        }
    } catch (Throwable $e) {
        error_log('Settings lookup failed: ' . $e->getMessage());
    }

    return $settings;
}

function plum_setting(string $key, mixed $default = null): mixed
{
    $settings = plum_app_settings();
    return array_key_exists($key, $settings) ? $settings[$key] : $default;
}

function plum_maintenance_enabled(): bool
{
    return plum_bool(plum_setting('maintenance_mode', '0'));
}

function plum_current_user(): ?array
{
    if (empty($_SESSION['user']['id'])) {
        return null;
    }

    return $_SESSION['user'];
}

function plum_current_user_is_supreme_admin(): bool
{
    $user = plum_current_user();
    if (!$user) {
        return false;
    }

    return in_array('supreme_admin', $user['roles'] ?? [], true);
}

function plum_enforce_maintenance(): void
{
    if (!plum_maintenance_enabled() || plum_current_user_is_supreme_admin()) {
        return;
    }

    http_response_code(503);
    $settings = plum_app_settings();
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' . e($settings['app_name']) . ' Maintenance</title></head><body>';
    echo '<h1>' . e($settings['app_name']) . ' is under maintenance</h1>';
    echo '<p>' . e($settings['maintenance_message']) . '</p>';
    echo '</body></html>';
    exit;
}

function plum_get_user_by_email(string $email): ?array
{
    return plum_fetch_one('SELECT * FROM `users` WHERE `email` = ? LIMIT 1', 's', [$email]);
}

function plum_get_user_by_id(int $id): ?array
{
    return plum_fetch_one('SELECT * FROM `users` WHERE `id` = ? LIMIT 1', 's', [$id]);
}

function plum_user_password_hash(array $user): string
{
    return (string) ($user['password_hash'] ?? '');
}

function plum_user_is_active(array $user): bool
{
    return (int) ($user['is_active'] ?? 0) === 1;
}

function plum_user_is_verified(array $user): bool
{
    if (!empty($user['email_verified_at'])) {
        return true;
    }

    return (int) ($user['is_verified'] ?? 0) === 1;
}

function plum_user_roles(array|int $user): array
{
    $userId = is_array($user) ? (int) ($user['id'] ?? 0) : (int) $user;
    if ($userId <= 0) {
        return [];
    }

    static $cache = [];
    if (array_key_exists($userId, $cache)) {
        return $cache[$userId];
    }

    try {
        $rows = plum_fetch_all(
            'SELECT r.name
             FROM `roles` r
             INNER JOIN `user_roles` ur ON ur.role_id = r.id
             WHERE ur.user_id = ?
             ORDER BY FIELD(r.name, \'supreme_admin\', \'admin\', \'organizer\', \'artist\', \'client\'), r.name',
            's',
            [$userId]
        );
    } catch (Throwable $e) {
        error_log('Role lookup failed: ' . $e->getMessage());
        $cache[$userId] = [];
        return [];
    }

    $cache[$userId] = array_values(array_unique(array_map(static fn (array $row): string => (string) $row['name'], $rows)));
    return $cache[$userId];
}

function plum_user_role(array $user): string
{
    $roles = plum_user_roles($user);
    return $roles[0] ?? 'artist';
}

function plum_role_id(string $roleName): int
{
    $roleName = trim(strtolower($roleName));
    if (!preg_match('/^[a-z_]+$/', $roleName)) {
        throw new InvalidArgumentException('Invalid role name.');
    }

    $role = plum_fetch_one('SELECT `id` FROM `roles` WHERE `name` = ? LIMIT 1', 's', [$roleName]);
    if ($role) {
        return (int) $role['id'];
    }

    plum_insert_assoc('roles', [
        'uuid' => plum_uuid_v4(),
        'name' => $roleName,
        'description' => ucfirst(str_replace('_', ' ', $roleName)) . ' role.',
    ]);

    return plum_db()->insert_id;
}

function plum_assign_role(int $userId, string $roleName): void
{
    $roleId = plum_role_id($roleName);
    $existing = plum_fetch_one(
        'SELECT `id` FROM `user_roles` WHERE `user_id` = ? AND `role_id` = ? LIMIT 1',
        'ss',
        [$userId, $roleId]
    );

    if ($existing) {
        return;
    }

    plum_insert_assoc('user_roles', [
        'uuid' => plum_uuid_v4(),
        'user_id' => $userId,
        'role_id' => $roleId,
    ]);
}

function plum_dashboard_path(string $role): string
{
    return match ($role) {
        'admin', 'supreme_admin' => 'admin.html',
        'organizer', 'client' => 'organizer-dashboard.html',
        default => 'adash.php',
    };
}

function plum_login_user(array $user): void
{
    session_regenerate_id(true);
    $roles = plum_user_roles($user);

    $_SESSION['user'] = [
        'id' => (int) $user['id'],
        'uuid' => (string) ($user['uuid'] ?? ''),
        'email' => (string) $user['email'],
        'full_name' => (string) ($user['full_name'] ?? trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''))),
        'role' => $roles[0] ?? 'artist',
        'roles' => $roles,
    ];
}

function plum_mark_user_verified(int $userId): void
{
    plum_update_assoc('users', [
        'is_verified' => 1,
        'email_verified_at' => date('Y-m-d H:i:s'),
    ], 'id = ?', 's', [$userId]);
}

function plum_verification_code_hash(string $code): string
{
    return hash_hmac('sha256', $code, (string) plum_env('APP_KEY', 'plum-dev-key'));
}

function plum_create_email_verification(int $userId): array
{
    $code = (string) random_int(100000, 999999);
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + ((int) plum_env('VERIFY_CODE_TTL_MINUTES', 10) * 60));

    try {
        if (plum_column_exists('email_verifications', 'used')) {
            plum_query(
                'UPDATE `email_verifications` SET `used` = 1, `used_at` = NOW() WHERE `user_id` = ? AND `used` = 0',
                's',
                [$userId]
            )->close();
        }
    } catch (Throwable $e) {
        error_log('Could not retire old verification codes: ' . $e->getMessage());
    }

    plum_insert_assoc('email_verifications', [
        'uuid' => plum_uuid_v4(),
        'user_id' => $userId,
        'code' => '******',
        'code_hash' => plum_verification_code_hash($code),
        'token' => $token,
        'expires_at' => $expiresAt,
        'used' => 0,
        'created_at' => date('Y-m-d H:i:s'),
    ]);

    return ['code' => $code, 'token' => $token, 'expires_at' => $expiresAt];
}

function plum_store_uploaded_file(string $inputName, string $folder, string $userUuid): ?string
{
    if (empty($_FILES[$inputName]) || ($_FILES[$inputName]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $file = $_FILES[$inputName];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('The upload could not be processed.');
    }

    $maxBytes = (int) plum_env('MAX_UPLOAD_MB', 5) * 1024 * 1024;
    if ((int) $file['size'] > $maxBytes) {
        throw new RuntimeException('The uploaded file is too large.');
    }

    $folder = plum_safe_identifier($folder);
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'application/pdf' => 'pdf',
    ];

    if ($folder === 'profile_pictures') {
        $allowed = array_intersect_key($allowed, array_flip(['image/jpeg', 'image/png', 'image/webp', 'image/gif']));
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file((string) $file['tmp_name']);

    if (!is_string($mime) || !array_key_exists($mime, $allowed)) {
        throw new RuntimeException('That file type is not allowed.');
    }

    $safeUuid = preg_match('/^[0-9a-fA-F-]{36}$/', $userUuid) ? strtolower($userUuid) : plum_uuid_v4();
    $filename = $safeUuid . '-' . bin2hex(random_bytes(6)) . '.' . $allowed[$mime];
    $targetDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $folder;

    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        throw new RuntimeException('The upload directory is not available.');
    }

    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file((string) $file['tmp_name'], $targetPath)) {
        throw new RuntimeException('The uploaded file could not be saved.');
    }

    return 'uploads/' . $folder . '/' . $filename;
}

function plum_record_login_attempt(string $email, bool $success, ?int $userId = null, ?string $failureReason = null): void
{
    try {
        plum_insert_assoc('login_attempts', [
            'email' => $email,
            'success' => $success ? 1 : 0,
            'ip_address' => plum_client_ip(),
            'attempt_time' => date('Y-m-d H:i:s'),
            'ip' => plum_client_ip(),
            'identifier' => $email,
            'attempts' => 1,
            'last_attempt_at' => date('Y-m-d H:i:s'),
        ]);
    } catch (Throwable $e) {
        error_log('Login attempt log failed: ' . $e->getMessage());
    }

    try {
        plum_insert_assoc('login_logs', [
            'uuid' => plum_uuid_v4(),
            'user_id' => $userId,
            'ip_address' => plum_client_ip(),
            'user_agent' => plum_client_agent(),
            'success' => $success ? 1 : 0,
            'failure_reason' => $failureReason,
            'logged_in_at' => date('Y-m-d H:i:s'),
        ]);
    } catch (Throwable $e) {
        error_log('Login event log failed: ' . $e->getMessage());
    }
}

function plum_app_url(string $path = ''): string
{
    $base = rtrim((string) plum_env('APP_URL', 'http://localhost'), '/');
    return $base . '/' . ltrim($path, '/');
}
