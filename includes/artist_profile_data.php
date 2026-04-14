<?php
declare(strict_types=1);

if (!function_exists('pp_fetch_one')) {
    function pp_fetch_one(string $sql, string $types = '', array $params = []): ?array
    {
        try {
            return plum_fetch_one($sql, $types, $params);
        } catch (Throwable $e) {
            error_log('Artist profile query failed: ' . $e->getMessage());
            return null;
        }
    }

    function pp_fetch_all(string $sql, string $types = '', array $params = []): array
    {
        try {
            return plum_fetch_all($sql, $types, $params);
        } catch (Throwable $e) {
            error_log('Artist profile query failed: ' . $e->getMessage());
            return [];
        }
    }

    function pp_asset(?string $path, string $fallback = 'images/Plum LogoNew-transparent.png'): string
    {
        $path = trim((string) $path);
        if ($path === '') {
            return $fallback;
        }

        return preg_match('#^https?://#i', $path) ? $path : ltrim($path, '/');
    }

    function pp_money(mixed $amount, int $decimals = 0): string
    {
        return 'K' . number_format((float) $amount, $decimals);
    }

    function pp_date(?string $date): string
    {
        $time = $date ? strtotime($date) : false;
        return $time ? date('F Y', $time) : 'Recent booking';
    }

    function pp_initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $letters = '';
        foreach ($parts as $part) {
            if ($part !== '') {
                $letters .= strtoupper(substr($part, 0, 1));
            }
            if (strlen($letters) >= 2) {
                break;
            }
        }

        return $letters !== '' ? $letters : 'P';
    }

    function pp_excerpt(string $text, int $width = 180): string
    {
        if (function_exists('mb_strimwidth')) {
            return mb_strimwidth($text, 0, $width, '...');
        }

        return strlen($text) > $width ? substr($text, 0, max(0, $width - 3)) . '...' : $text;
    }

    function pp_category_icon(string $category): string
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
}

$artistUuid = trim((string) ($_GET['artist'] ?? ''));
$sessionUser = plum_current_user();
$artist = null;

if ($artistUuid !== '') {
    $artist = pp_fetch_one(
        'SELECT u.*, ap.id AS artist_profile_id, ap.category, ap.hourly_rate, ap.description AS artist_description,
                ap.experience_years, ap.portfolio_url, ap.availability_status, ap.total_bookings,
                ap.response_rate, ap.avg_response_time, ap.is_top_rated
         FROM `users` u
         INNER JOIN `artist_profiles` ap ON ap.user_id = u.id
         WHERE u.uuid = ? AND u.is_active = 1
         LIMIT 1',
        's',
        [$artistUuid]
    );
} elseif ($sessionUser && in_array('artist', plum_user_roles((int) $sessionUser['id']), true)) {
    $artist = pp_fetch_one(
        'SELECT u.*, ap.id AS artist_profile_id, ap.category, ap.hourly_rate, ap.description AS artist_description,
                ap.experience_years, ap.portfolio_url, ap.availability_status, ap.total_bookings,
                ap.response_rate, ap.avg_response_time, ap.is_top_rated
         FROM `users` u
         INNER JOIN `artist_profiles` ap ON ap.user_id = u.id
         WHERE u.id = ? AND u.is_active = 1
         LIMIT 1',
        's',
        [(int) $sessionUser['id']]
    );
} else {
    $artist = pp_fetch_one(
        'SELECT u.*, ap.id AS artist_profile_id, ap.category, ap.hourly_rate, ap.description AS artist_description,
                ap.experience_years, ap.portfolio_url, ap.availability_status, ap.total_bookings,
                ap.response_rate, ap.avg_response_time, ap.is_top_rated
         FROM `users` u
         INNER JOIN `artist_profiles` ap ON ap.user_id = u.id
         WHERE u.is_active = 1
         ORDER BY u.created_at DESC
         LIMIT 1'
    );
}

if (!$artist) {
    return ['not_found' => true];
}

$artistId = (int) $artist['id'];
$displayName = trim((string) ($artist['display_name'] ?: $artist['full_name']));
$category = trim((string) ($artist['category'] ?? 'Artist')) ?: 'Artist';
$location = trim((string) ($artist['location'] ?? 'Zambia')) ?: 'Zambia';
$bio = trim((string) (($artist['artist_description'] ?? '') ?: ($artist['bio'] ?? '')));
$bio = $bio !== '' ? $bio : $displayName . ' is building a profile on Plum. More details will be added soon.';
$hourlyRate = (float) ($artist['hourly_rate'] ?? 0);
$availability = (string) ($artist['availability_status'] ?? 'available');
$availabilityLabel = match ($availability) {
    'busy' => 'Limited availability',
    'unavailable' => 'Currently unavailable',
    default => 'Available for bookings',
};
$isOwner = $sessionUser && (int) ($sessionUser['id'] ?? 0) === $artistId;

$completedBookings = (int) (pp_fetch_one('SELECT COUNT(*) AS total FROM `bookings` WHERE `artist_id` = ? AND `booking_status` = "completed"', 's', [$artistId])['total'] ?? 0);
$bookingCount = (int) (pp_fetch_one('SELECT COUNT(*) AS total FROM `bookings` WHERE `artist_id` = ?', 's', [$artistId])['total'] ?? 0);
$reviewStats = pp_fetch_one('SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS average FROM `reviews` WHERE `artist_id` = ?', 's', [$artistId]) ?? ['total' => 0, 'average' => 0];
$reviewCount = (int) ($reviewStats['total'] ?: ($artist['total_reviews'] ?? 0));
$rating = (float) ($reviewStats['average'] ?: ($artist['rating'] ?? 0));
$projectsDone = max($completedBookings, (int) ($artist['events_completed'] ?? 0), (int) ($artist['total_bookings'] ?? 0));
$responseTime = trim((string) ($artist['avg_response_time'] ?? '')) ?: 'Not set';
$repeatRow = pp_fetch_one(
    'SELECT COUNT(*) AS repeat_clients
     FROM (
       SELECT client_id FROM `bookings` WHERE artist_id = ? GROUP BY client_id HAVING COUNT(*) > 1
     ) repeated',
    's',
    [$artistId]
);
$clientRow = pp_fetch_one('SELECT COUNT(DISTINCT client_id) AS total FROM `bookings` WHERE artist_id = ?', 's', [$artistId]);
$repeatClients = (int) ($repeatRow['repeat_clients'] ?? 0);
$totalClients = max(0, (int) ($clientRow['total'] ?? 0));
$repeatRate = $totalClients > 0 ? (int) round(($repeatClients / $totalClients) * 100) : 0;

$services = pp_fetch_all('SELECT * FROM `services` WHERE `artist_id` = ? AND `is_active` = 1 ORDER BY updated_at DESC LIMIT 12', 's', [$artistId]);
$reviews = pp_fetch_all(
    'SELECT r.*, COALESCE(NULLIF(u.display_name, ""), u.full_name, u.email, "Client") AS reviewer_name,
            u.profile_picture AS reviewer_picture, b.event_type
     FROM `reviews` r
     LEFT JOIN `users` u ON u.id = r.reviewer_id
     LEFT JOIN `bookings` b ON b.id = r.booking_id
     WHERE r.artist_id = ?
     ORDER BY r.created_at DESC
     LIMIT 8',
    's',
    [$artistId]
);
$breakdownRows = pp_fetch_all('SELECT rating, COUNT(*) AS total FROM `reviews` WHERE artist_id = ? GROUP BY rating', 's', [$artistId]);
$ratingBreakdown = array_fill(1, 5, 0);
foreach ($breakdownRows as $row) {
    $ratingBreakdown[(int) $row['rating']] = (int) $row['total'];
}

$portfolioFiles = pp_fetch_all(
    'SELECT `path`, `original_name`, `mime_type`, `created_at`
     FROM `uploaded_files`
     WHERE `user_id` = ? AND `folder` IN ("portfolio", "attachments", "profile_pictures") AND `mime_type` LIKE "image/%"
     ORDER BY `folder` = "profile_pictures" DESC, `created_at` DESC LIMIT 12',
    's',
    [$artistId]
);
$portfolioDocs = pp_fetch_all(
    'SELECT `file_path` AS `path`, `file_name` AS `original_name`, `mime_type`, `upload_date` AS `created_at`
     FROM `artist_documents`
     WHERE `artist_id` = ? AND `document_type` IN ("portfolio", "professional_photo", "profile_photo") AND (`mime_type` LIKE "image/%" OR `mime_type` IS NULL)
     ORDER BY `upload_date` DESC LIMIT 12',
    's',
    [$artistId]
);
$portfolioFiles = array_slice(array_merge($portfolioFiles, $portfolioDocs), 0, 12);
if ($portfolioFiles === [] && !empty($artist['profile_picture'])) {
    $portfolioFiles[] = ['path' => $artist['profile_picture'], 'original_name' => $displayName, 'mime_type' => 'image/jpeg', 'created_at' => $artist['created_at'] ?? null];
}
$coverImage = pp_asset($portfolioFiles[0]['path'] ?? ($artist['profile_picture'] ?? null));
$avatar = pp_asset($artist['profile_picture'] ?? null);

$similarArtists = pp_fetch_all(
    'SELECT u.uuid, COALESCE(NULLIF(u.display_name, ""), u.full_name) AS name, u.profile_picture,
            u.location, ap.category, ap.hourly_rate
     FROM `users` u
     INNER JOIN `artist_profiles` ap ON ap.user_id = u.id
     WHERE u.id <> ? AND u.is_active = 1 AND ap.category = ?
     ORDER BY u.created_at DESC LIMIT 3',
    'ss',
    [$artistId, $category]
);
if ($similarArtists === []) {
    $similarArtists = pp_fetch_all(
        'SELECT u.uuid, COALESCE(NULLIF(u.display_name, ""), u.full_name) AS name, u.profile_picture,
                u.location, ap.category, ap.hourly_rate
         FROM `users` u
         INNER JOIN `artist_profiles` ap ON ap.user_id = u.id
         WHERE u.id <> ? AND u.is_active = 1
         ORDER BY u.created_at DESC LIMIT 3',
        's',
        [$artistId]
    );
}

$skills = array_values(array_unique(array_filter(array_merge(
    [$category],
    array_map(static fn (array $service): string => (string) $service['name'], $services),
    ((int) ($artist['experience_years'] ?? 0) > 0 ? [(int) $artist['experience_years'] . '+ years experience'] : []),
    ($artist['is_top_rated'] ? ['Top rated'] : [])
))));

if (empty($_SESSION['viewed_artist_profiles'][$artistId]) && (!$sessionUser || (int) ($sessionUser['id'] ?? 0) !== $artistId)) {
    try {
        plum_insert_assoc('profile_views', [
            'artist_id' => $artistId,
            'viewer_id' => $sessionUser['id'] ?? null,
            'ip_address' => plum_client_ip(),
            'viewed_at' => date('Y-m-d H:i:s'),
        ]);
        $_SESSION['viewed_artist_profiles'][$artistId] = true;
    } catch (Throwable $e) {
        error_log('Profile view tracking failed: ' . $e->getMessage());
    }
}

return [
    'artist' => $artist,
    'id' => $artistId,
    'uuid' => (string) $artist['uuid'],
    'name' => $displayName,
    'category' => $category,
    'category_icon' => pp_category_icon($category),
    'location' => $location,
    'bio' => $bio,
    'hourly_rate' => $hourlyRate,
    'availability' => $availability,
    'availability_label' => $availabilityLabel,
    'is_owner' => $isOwner,
    'avatar' => $avatar,
    'cover' => $coverImage,
    'portfolio_url' => trim((string) ($artist['portfolio_url'] ?? '')),
    'stats' => [
        'projects_done' => $projectsDone,
        'booking_count' => $bookingCount,
        'rating' => $rating,
        'review_count' => $reviewCount,
        'response_time' => $responseTime,
        'repeat_rate' => $repeatRate,
        'experience_years' => (int) ($artist['experience_years'] ?? 0),
    ],
    'services' => $services,
    'reviews' => $reviews,
    'rating_breakdown' => $ratingBreakdown,
    'portfolio_files' => $portfolioFiles,
    'similar_artists' => $similarArtists,
    'skills' => array_slice($skills, 0, 10),
    'js' => [
        'name' => $displayName,
        'category' => $category,
        'location' => $location,
        'hourlyRate' => $hourlyRate,
        'bio' => $bio,
        'portfolioUrl' => 'artist-profile.php?artist=' . rawurlencode((string) $artist['uuid']),
        'gallery' => array_map(static fn (array $file): array => [
            'src' => pp_asset($file['path'] ?? null),
            'alt' => (string) ($file['original_name'] ?? 'Portfolio media'),
        ], $portfolioFiles),
    ],
];
