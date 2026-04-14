<?php
declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'config.php';

$settings = $settings ?? plum_app_settings();
$pageTitle = $pageTitle ?? $settings['app_name'];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle) ?> - <?= e($settings['app_name']) ?></title>
</head>
<body>
