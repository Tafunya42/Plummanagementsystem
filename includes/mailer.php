<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . DIRECTORY_SEPARATOR . 'config.php';

function plum_mail_log(string $toEmail, string $subject, string $html, string $text): void
{
    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'mail_logs';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $body = "To: {$toEmail}\nSubject: {$subject}\n\n{$text}\n\n--- HTML ---\n{$html}";
    file_put_contents($dir . DIRECTORY_SEPARATOR . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.log', $body);
}

function plum_send_mail(string $toEmail, string $toName, string $subject, string $html, string $text): bool
{
    $smtpHost = trim((string) plum_env('SMTP_HOST', ''));
    $isLocal = strtolower((string) plum_env('APP_ENV', 'local')) === 'local';

    if (plum_bool(plum_env('MAIL_LOG_ONLY', 'false')) || ($isLocal && $smtpHost === '')) {
        plum_mail_log($toEmail, $subject, $html, $text);
        return true;
    }

    if (!class_exists(PHPMailer::class)) {
        throw new RuntimeException('PHPMailer is not installed. Run composer install first.');
    }

    $mail = new PHPMailer(true);

    if ($smtpHost === '') {
        throw new RuntimeException('SMTP_HOST is not configured. Set SMTP credentials or enable MAIL_LOG_ONLY for local testing.');
    }

    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->Port = (int) plum_env('SMTP_PORT', 587);
    $mail->SMTPAuth = trim((string) plum_env('SMTP_USERNAME', '')) !== '';
    $mail->Username = (string) plum_env('SMTP_USERNAME', '');
    $mail->Password = (string) plum_env('SMTP_PASSWORD', '');

    $encryption = trim((string) plum_env('SMTP_ENCRYPTION', 'tls'));
    if ($encryption !== '') {
        $mail->SMTPSecure = $encryption;
    }

    $mail->CharSet = 'UTF-8';
    $mail->setFrom((string) plum_env('MAIL_FROM_ADDRESS', 'no-reply@plum.local'), (string) plum_env('MAIL_FROM_NAME', plum_setting('app_name', 'Plum')));
    $mail->addAddress($toEmail, $toName);
    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $html;
    $mail->AltBody = $text;

    return $mail->send();
}

function plum_email_template(string $heading, string $bodyHtml): string
{
    $appName = e(plum_setting('app_name', 'Plum'));

    return '<!doctype html><html><body style="margin:0;background:#f7f3fb;font-family:Arial,sans-serif;color:#1E2438;">'
        . '<div style="max-width:560px;margin:0 auto;padding:32px 18px;">'
        . '<div style="background:#ffffff;border:1px solid #e8e1f0;border-radius:12px;padding:28px;">'
        . '<p style="margin:0 0 18px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8B1FC8;">' . $appName . '</p>'
        . '<h1 style="font-size:24px;line-height:1.25;margin:0 0 16px;color:#1E2438;">' . e($heading) . '</h1>'
        . $bodyHtml
        . '</div></div></body></html>';
}

function plum_send_verification_code_email(array $user, string $code): bool
{
    $appName = (string) plum_setting('app_name', 'Plum');
    $name = (string) ($user['first_name'] ?? $user['full_name'] ?? '');
    $html = plum_email_template(
        'Verify your email',
        '<p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Use this 6 digit code to verify your ' . e($appName) . ' account.</p>'
        . '<div style="font-size:32px;font-weight:800;letter-spacing:10px;color:#8B1FC8;background:#f3e8ff;padding:18px 22px;border-radius:10px;text-align:center;">' . e($code) . '</div>'
        . '<p style="font-size:13px;line-height:1.6;color:#6b6078;margin:18px 0 0;">This code expires soon. If you did not create an account, you can ignore this email.</p>'
    );
    $text = "Your {$appName} verification code is {$code}.";

    return plum_send_mail((string) $user['email'], $name, 'Your ' . $appName . ' verification code', $html, $text);
}

function plum_send_password_reset_email(array $user, string $resetUrl): bool
{
    $appName = (string) plum_setting('app_name', 'Plum');
    $name = (string) ($user['first_name'] ?? $user['full_name'] ?? '');
    $html = plum_email_template(
        'Reset your password',
        '<p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Use the secure link below to set a new password.</p>'
        . '<p style="margin:24px 0;"><a href="' . e($resetUrl) . '" style="background:#8B1FC8;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Reset password</a></p>'
        . '<p style="font-size:13px;line-height:1.6;color:#6b6078;margin:18px 0 0;">This link expires in ' . e((string) plum_env('PASSWORD_RESET_TTL_MINUTES', 15)) . ' minutes. If you did not request it, you can ignore this email.</p>'
    );
    $text = "Reset your {$appName} password: {$resetUrl}";

    return plum_send_mail((string) $user['email'], $name, 'Reset your ' . $appName . ' password', $html, $text);
}
