<?php
declare(strict_types=1);

$autoloadPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
if (is_readable($autoloadPath)) {
    require_once $autoloadPath;
}

require_once __DIR__ . DIRECTORY_SEPARATOR . 'functions.php';

plum_load_environment(dirname(__DIR__));

date_default_timezone_set((string) plum_env('APP_TIMEZONE', 'Africa/Lusaka'));
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name((string) plum_env('SESSION_NAME', 'PLUMSESSID'));
    $sessionSavePath = (string) plum_env('SESSION_SAVE_PATH', '');
    if ($sessionSavePath !== '') {
        session_save_path($sessionSavePath);
    } elseif (PHP_SAPI === 'cli') {
        $cliSessionPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.sessions';
        if (!is_dir($cliSessionPath)) {
            mkdir($cliSessionPath, 0755, true);
        }
        session_save_path($cliSessionPath);
    }
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

header_remove('X-Powered-By');
