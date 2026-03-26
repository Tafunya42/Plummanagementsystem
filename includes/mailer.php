<?php

/**
 * PHPMailer Configuration
 * Make sure to install PHPMailer via Composer: composer require phpmailer/phpmailer
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

/**
 * Send email using PHPMailer
 */
function send_email($to, $name, $subject, $body)
{
  $mail = new PHPMailer(true);

  try {
    // Server settings
    $mail->SMTPDebug = $_ENV['MAIL_DEBUG'] ?? 0; // 0 = off, 1 = client, 2 = client and server
    $mail->isSMTP();
    $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['MAIL_USERNAME'] ?? '';
    $mail->Password   = $_ENV['MAIL_PASSWORD'] ?? '';
    $mail->SMTPSecure = $_ENV['MAIL_ENCRYPTION'] ?? PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $_ENV['MAIL_PORT'] ?? 587;

    // Recipients
    $mail->setFrom($_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@plum.com', $_ENV['MAIL_FROM_NAME'] ?? 'Plum');
    $mail->addAddress($to, $name);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->AltBody = strip_tags($body); // Plain text version

    $mail->send();
    return true;
  } catch (Exception $e) {
    error_log("Email sending failed: {$mail->ErrorInfo}");
    return false;
  }
}
