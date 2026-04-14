<?php
declare(strict_types=1);

if (!function_exists('plum_db')) {
    throw new RuntimeException('Artist dashboard data requires config.php first.');
}

if (!function_exists('adash_fetch_one')) {
    function adash_fetch_one(string $sql, string $types = '', array $params = []): ?array
    {
        try {
            return plum_fetch_one($sql, $types, $params);
        } catch (Throwable $e) {
            error_log('Artist dashboard query failed: ' . $e->getMessage());
            return null;
        }
    }

    function adash_fetch_all(string $sql, string $types = '', array $params = []): array
    {
        try {
            return plum_fetch_all($sql, $types, $params);
        } catch (Throwable $e) {
            error_log('Artist dashboard query failed: ' . $e->getMessage());
            return [];
        }
    }

    function adash_money(mixed $amount, int $decimals = 0): string
    {
        return 'K' . number_format((float) $amount, $decimals);
    }

    function adash_date(?string $date): string
    {
        $timestamp = $date ? strtotime($date) : false;
        return $timestamp ? date('d M Y', $timestamp) : 'TBC';
    }

    function adash_time_ago(?string $date): string
    {
        $timestamp = $date ? strtotime($date) : false;
        if (!$timestamp) {
            return 'Just now';
        }

        $seconds = max(0, time() - $timestamp);
        if ($seconds < 60) {
            return 'Just now';
        }

        $minutes = intdiv($seconds, 60);
        if ($minutes < 60) {
            return $minutes . 'm ago';
        }

        $hours = intdiv($minutes, 60);
        if ($hours < 24) {
            return $hours . 'h ago';
        }

        $days = intdiv($hours, 24);
        return $days < 7 ? $days . 'd ago' : date('d M Y', $timestamp);
    }

    function adash_asset(?string $path, string $fallback = 'images/Plum LogoNew-transparent.png'): string
    {
        $path = trim((string) $path);
        if ($path === '') {
            return $fallback;
        }

        return preg_match('#^https?://#i', $path) ? $path : ltrim($path, '/');
    }

    function adash_initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $initials = '';
        foreach ($parts as $part) {
            if ($part !== '') {
                $initials .= strtoupper(substr($part, 0, 1));
            }
            if (strlen($initials) >= 2) {
                break;
            }
        }

        return $initials !== '' ? $initials : 'P';
    }

    function adash_status_icon(string $status): string
    {
        return match ($status) {
            'confirmed' => 'check',
            'completed' => 'check-circle-2',
            'cancelled' => 'x',
            default => 'clock',
        };
    }

    function adash_category_icon(string $category): string
    {
        $category = strtolower($category);
        return match (true) {
            str_contains($category, 'photo') => 'camera',
            str_contains($category, 'music'), str_contains($category, 'dj') => 'music',
            str_contains($category, 'video'), str_contains($category, 'film') => 'video',
            str_contains($category, 'design'), str_contains($category, 'art') => 'palette',
            default => 'sparkles',
        };
    }

    function adash_metric_change(int|float $value, string $label): string
    {
        return $value > 0 ? $label : 'No change';
    }

    function adash_excerpt(string $text, int $width = 120): string
    {
        if (function_exists('mb_strimwidth')) {
            return mb_strimwidth($text, 0, $width, '...');
        }

        return strlen($text) > $width ? substr($text, 0, max(0, $width - 3)) . '...' : $text;
    }

    function adash_revenue_total(int $artistId, ?string $startAt = null, ?string $endAt = null): float
    {
        $where = ['b.artist_id = ?', 't.status = "completed"'];
        $types = 's';
        $params = [$artistId];

        if ($startAt) {
            $where[] = 't.created_at >= ?';
            $types .= 's';
            $params[] = $startAt;
        }
        if ($endAt) {
            $where[] = 't.created_at < ?';
            $types .= 's';
            $params[] = $endAt;
        }

        $row = adash_fetch_one(
            'SELECT COALESCE(SUM(CASE WHEN t.transaction_type = "refund" THEN -t.amount ELSE t.amount END), 0) AS total
             FROM `transactions` t INNER JOIN `bookings` b ON b.id = t.booking_id
             WHERE ' . implode(' AND ', $where),
            $types,
            $params
        );
        $total = (float) ($row['total'] ?? 0);
        if ($total !== 0.0) {
            return $total;
        }

        $where = ['artist_id = ?', '(payment_status = "paid" OR booking_status = "completed")'];
        $types = 's';
        $params = [$artistId];
        if ($startAt) {
            $where[] = 'updated_at >= ?';
            $types .= 's';
            $params[] = $startAt;
        }
        if ($endAt) {
            $where[] = 'updated_at < ?';
            $types .= 's';
            $params[] = $endAt;
        }

        $row = adash_fetch_one('SELECT COALESCE(SUM(total_amount), 0) AS total FROM `bookings` WHERE ' . implode(' AND ', $where), $types, $params);
        return (float) ($row['total'] ?? 0);
    }
}

$sessionUser = plum_current_user();
if (!$sessionUser) {
    return ['redirect' => 'login.php'];
}

$artistUser = plum_get_user_by_id((int) $sessionUser['id']);
if (!$artistUser || !plum_user_is_active($artistUser)) {
    unset($_SESSION['user']);
    return ['redirect' => 'login.php'];
}

$artistRoles = plum_user_roles($artistUser);
$_SESSION['user']['roles'] = $artistRoles;
$_SESSION['user']['role'] = $artistRoles[0] ?? 'artist';

if (!array_intersect($artistRoles, ['artist', 'admin', 'supreme_admin'])) {
    return ['forbidden' => true];
}

$artistId = (int) $artistUser['id'];
$artistProfile = adash_fetch_one('SELECT * FROM `artist_profiles` WHERE `user_id` = ? LIMIT 1', 's', [$artistId]) ?? [];
$displayName = trim((string) ($artistUser['display_name'] ?: $artistUser['full_name']));
$firstName = trim((string) ($artistUser['first_name'] ?: strtok($displayName, ' '))) ?: $displayName;
$category = trim((string) ($artistProfile['category'] ?? '')) ?: 'Artist';
$bio = trim((string) (($artistProfile['description'] ?? '') ?: ($artistUser['bio'] ?? '')));
$portfolioUrl = trim((string) ($artistProfile['portfolio_url'] ?? ''));
$profileUrl = 'artist-profile.php?artist=' . rawurlencode((string) ($artistUser['uuid'] ?? $artistId));

$bookings = adash_fetch_all(
    'SELECT b.*, COALESCE(NULLIF(u.display_name, ""), u.full_name, u.email, "Client") AS client_name,
            u.profile_picture AS client_picture, COALESCE(NULLIF(s.name, ""), b.event_type, "Booking") AS service_name
     FROM `bookings` b
     LEFT JOIN `users` u ON u.id = b.client_id
     LEFT JOIN `services` s ON s.id = b.service_id
     WHERE b.artist_id = ?
     ORDER BY CASE WHEN b.event_date >= CURDATE() THEN 0 ELSE 1 END, b.event_date ASC, b.created_at DESC
     LIMIT 30',
    's',
    [$artistId]
);

$messages = adash_fetch_all(
    'SELECT m.*, COALESCE(NULLIF(u.display_name, ""), u.full_name, u.email, "Client") AS sender_name,
            u.profile_picture AS sender_picture, b.event_type AS booking_event_type
     FROM `messages` m
     LEFT JOIN `users` u ON u.id = m.sender_id
     LEFT JOIN `bookings` b ON b.id = m.booking_id
     WHERE m.recipient_id = ?
     ORDER BY m.is_read ASC, m.created_at DESC
     LIMIT 30',
    's',
    [$artistId]
);

$services = adash_fetch_all('SELECT * FROM `services` WHERE `artist_id` = ? ORDER BY is_active DESC, updated_at DESC LIMIT 20', 's', [$artistId]);
$portfolioFiles = adash_fetch_all(
    'SELECT `path`, `original_name`, `mime_type`, `created_at`
     FROM `uploaded_files`
     WHERE `user_id` = ? AND `folder` IN ("portfolio", "attachments") AND `mime_type` LIKE "image/%"
     ORDER BY `created_at` DESC LIMIT 12',
    's',
    [$artistId]
);
$portfolioDocs = adash_fetch_all(
    'SELECT `file_path` AS `path`, `file_name` AS `original_name`, `mime_type`, `upload_date` AS `created_at`
     FROM `artist_documents`
     WHERE `artist_id` = ? AND `document_type` IN ("portfolio", "professional_photo") AND (`mime_type` LIKE "image/%" OR `mime_type` IS NULL)
     ORDER BY `upload_date` DESC LIMIT 12',
    's',
    [$artistId]
);
$portfolioFiles = array_slice(array_merge($portfolioFiles, $portfolioDocs), 0, 12);

$unreadInquiries = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `messages` WHERE `recipient_id` = ? AND `is_read` = 0', 's', [$artistId])['total'] ?? 0);
$newInquiries = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `messages` WHERE `recipient_id` = ? AND `created_at` >= DATE_SUB(NOW(), INTERVAL 7 DAY)', 's', [$artistId])['total'] ?? 0);
$upcomingConfirmed = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `bookings` WHERE `artist_id` = ? AND `booking_status` = "confirmed" AND `event_date` >= CURDATE()', 's', [$artistId])['total'] ?? 0);
$confirmedThisWeek = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `bookings` WHERE `artist_id` = ? AND `booking_status` = "confirmed" AND `event_date` BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)', 's', [$artistId])['total'] ?? 0);
$profileViews = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `profile_views` WHERE `artist_id` = ?', 's', [$artistId])['total'] ?? 0);
$profileViewsWeek = (int) (adash_fetch_one('SELECT COUNT(*) AS total FROM `profile_views` WHERE `artist_id` = ? AND `viewed_at` >= DATE_SUB(NOW(), INTERVAL 7 DAY)', 's', [$artistId])['total'] ?? 0);
$projectedEarnings = (float) (adash_fetch_one('SELECT COALESCE(SUM(total_amount), 0) AS total FROM `bookings` WHERE `artist_id` = ? AND `booking_status` IN ("pending", "confirmed") AND `event_date` >= CURDATE()', 's', [$artistId])['total'] ?? 0);

$monthStart = date('Y-m-01 00:00:00');
$nextMonthStart = date('Y-m-01 00:00:00', strtotime('+1 month'));
$quarterStartMonth = (int) (floor(((int) date('n') - 1) / 3) * 3) + 1;
$quarterStart = date('Y-' . str_pad((string) $quarterStartMonth, 2, '0', STR_PAD_LEFT) . '-01 00:00:00');
$quarterEnd = date('Y-m-d 00:00:00', strtotime($quarterStart . ' +3 months'));
$earnedThisMonth = adash_revenue_total($artistId, $monthStart, $nextMonthStart);
$earnedThisQuarter = adash_revenue_total($artistId, $quarterStart, $quarterEnd);
$earnedTotal = adash_revenue_total($artistId);

$chartMonths = [];
for ($i = 5; $i >= 0; $i--) {
    $timestamp = strtotime(date('Y-m-01') . ' -' . $i . ' months');
    $chartMonths[date('Y-m', $timestamp)] = ['label' => date('M', $timestamp), 'value' => 0.0];
}
$chartStart = array_key_first($chartMonths) . '-01 00:00:00';
$transactionMonths = adash_fetch_all(
    'SELECT DATE_FORMAT(t.created_at, "%Y-%m") AS month_key,
            COALESCE(SUM(CASE WHEN t.transaction_type = "refund" THEN -t.amount ELSE t.amount END), 0) AS total
     FROM `transactions` t INNER JOIN `bookings` b ON b.id = t.booking_id
     WHERE b.artist_id = ? AND t.status = "completed" AND t.created_at >= ?
     GROUP BY DATE_FORMAT(t.created_at, "%Y-%m")',
    'ss',
    [$artistId, $chartStart]
);
foreach ($transactionMonths as $row) {
    if (isset($chartMonths[$row['month_key']])) {
        $chartMonths[$row['month_key']]['value'] = (float) $row['total'];
    }
}
if (array_sum(array_column($chartMonths, 'value')) === 0) {
    $bookingMonths = adash_fetch_all(
        'SELECT DATE_FORMAT(updated_at, "%Y-%m") AS month_key, COALESCE(SUM(total_amount), 0) AS total
         FROM `bookings`
         WHERE artist_id = ? AND (payment_status = "paid" OR booking_status = "completed") AND updated_at >= ?
         GROUP BY DATE_FORMAT(updated_at, "%Y-%m")',
        'ss',
        [$artistId, $chartStart]
    );
    foreach ($bookingMonths as $row) {
        if (isset($chartMonths[$row['month_key']])) {
            $chartMonths[$row['month_key']]['value'] = (float) $row['total'];
        }
    }
}
$earningsLabels = array_column($chartMonths, 'label');
$earningsValues = array_map(static fn (array $row): float => (float) $row['value'], array_values($chartMonths));
$bestMonthAmount = max($earningsValues ?: [0]);
$bestMonthLabel = $bestMonthAmount > 0 ? ($earningsLabels[array_search($bestMonthAmount, $earningsValues, true)] ?? date('M')) : date('M');

$viewBuckets = [];
for ($i = 6; $i >= 0; $i--) {
    $timestamp = strtotime('-' . $i . ' days');
    $viewBuckets[date('Y-m-d', $timestamp)] = ['label' => date('D', $timestamp), 'value' => 0];
}
$viewRows = adash_fetch_all(
    'SELECT DATE(viewed_at) AS view_date, COUNT(*) AS total
     FROM `profile_views`
     WHERE `artist_id` = ? AND `viewed_at` >= ?
     GROUP BY DATE(viewed_at)',
    'ss',
    [$artistId, array_key_first($viewBuckets) . ' 00:00:00']
);
foreach ($viewRows as $row) {
    if (isset($viewBuckets[$row['view_date']])) {
        $viewBuckets[$row['view_date']]['value'] = (int) $row['total'];
    }
}

$availabilityRows = adash_fetch_all(
    'SELECT `available_date`, `is_available`
     FROM `availability`
     WHERE `artist_id` = ? AND `available_date` BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 120 DAY)
     ORDER BY `available_date` ASC',
    's',
    [$artistId]
);
$availableDates = [];
$blockedAvailability = [];
foreach ($availabilityRows as $row) {
    ((int) $row['is_available'] === 1) ? $availableDates[] = (string) $row['available_date'] : $blockedAvailability[] = $row;
}
$bookedDateRows = adash_fetch_all(
    'SELECT `event_date`, COALESCE(NULLIF(`event_type`, ""), "Confirmed booking") AS note
     FROM `bookings`
     WHERE `artist_id` = ? AND `booking_status` = "confirmed" AND `event_date` >= CURDATE()
     ORDER BY `event_date` ASC LIMIT 30',
    's',
    [$artistId]
);
$bookedDates = array_values(array_unique(array_map(static fn (array $row): string => (string) $row['event_date'], $bookedDateRows)));

$scoreItems = [
    ['label' => 'Profile photo', 'done' => trim((string) ($artistUser['profile_picture'] ?? '')) !== ''],
    ['label' => 'Bio added', 'done' => $bio !== ''],
    ['label' => 'Category selected', 'done' => $category !== 'Artist'],
    ['label' => 'Portfolio link or media', 'done' => $portfolioUrl !== '' || $portfolioFiles !== []],
    ['label' => 'Services listed', 'done' => $services !== []],
];
$scoreDone = count(array_filter($scoreItems, static fn (array $item): bool => (bool) $item['done']));
$profileScore = (int) round(($scoreDone / max(1, count($scoreItems))) * 100);
$blockedItems = array_slice(array_merge(
    array_map(static fn (array $row): array => ['date' => $row['event_date'], 'note' => $row['note']], $bookedDateRows),
    array_map(static fn (array $row): array => ['date' => $row['available_date'], 'note' => 'Unavailable'], $blockedAvailability)
), 0, 8);

$greetingHour = (int) date('G');

return [
    'user' => $artistUser,
    'profile' => $artistProfile,
    'roles' => $artistRoles,
    'id' => $artistId,
    'name' => $displayName,
    'first_name' => $firstName,
    'category' => $category,
    'category_icon' => adash_category_icon($category),
    'bio' => $bio,
    'portfolio_url' => $portfolioUrl,
    'profile_url' => $profileUrl,
    'avatar' => adash_asset($artistUser['profile_picture'] ?? null),
    'bookings' => $bookings,
    'recent_bookings' => array_slice($bookings, 0, 3),
    'messages' => $messages,
    'recent_messages' => array_slice($messages, 0, 3),
    'services' => $services,
    'portfolio_files' => $portfolioFiles,
    'blocked_items' => $blockedItems,
    'greeting' => $greetingHour < 12 ? 'Good morning' : ($greetingHour < 17 ? 'Good afternoon' : 'Good evening'),
    'stats' => [
        'unread_inquiries' => $unreadInquiries,
        'new_inquiries' => $newInquiries,
        'upcoming_confirmed' => $upcomingConfirmed,
        'confirmed_this_week' => $confirmedThisWeek,
        'profile_views' => $profileViews,
        'profile_views_week' => $profileViewsWeek,
        'projected_earnings' => $projectedEarnings,
        'earned_this_month' => $earnedThisMonth,
        'earned_this_quarter' => $earnedThisQuarter,
        'earned_total' => $earnedTotal,
        'best_month_amount' => $bestMonthAmount,
        'best_month_label' => $bestMonthLabel,
        'profile_score' => $profileScore,
        'score_items' => $scoreItems,
    ],
    'js' => [
        'csrf' => plum_csrf_token(),
        'profileUrl' => $profileUrl,
        'charts' => [
            'earnings' => ['labels' => $earningsLabels, 'values' => $earningsValues],
            'engagement' => [
                'labels' => array_column($viewBuckets, 'label'),
                'values' => array_map(static fn (array $row): int => (int) $row['value'], array_values($viewBuckets)),
            ],
        ],
        'calendar' => ['bookedDates' => $bookedDates, 'availableDates' => $availableDates],
        'endpoints' => ['logout' => 'ajax/auth/logout.php'],
    ],
];
