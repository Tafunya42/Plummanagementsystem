<?php

/**
 * Artist Dashboard - Server Rendered
 * All data is loaded directly from database via PHP
 */

// Start session
session_start();

// Include required files
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/functions.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  header('Location: login.html');
  exit;
}

// Check if user is an artist
if ($_SESSION['user_type'] !== 'artist') {
  header('Location: dashboard-client.php');
  exit;
}

$user_id = $_SESSION['user_id'];

// Get user profile data
$stmt = $conn->prepare("
    SELECT id, email, full_name, user_type, phone, location, bio, profile_picture, 
           rating, total_reviews, events_completed, is_verified, created_at
    FROM users 
    WHERE id = ? AND is_active = 1
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$user) {
  destroy_session();
  header('Location: login.php');
  exit;
}

// Get dashboard stats
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(total_amount) as total_earnings,
        AVG(CASE WHEN booking_status = 'completed' THEN total_amount ELSE NULL END) as avg_booking_value
    FROM bookings 
    WHERE artist_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stats = $stmt->get_result()->fetch_assoc();
$stmt->close();

$total_bookings = (int)($stats['total_bookings'] ?? 0);
$completed_bookings = (int)($stats['completed_bookings'] ?? 0);
$confirmed_bookings = (int)($stats['confirmed_bookings'] ?? 0);
$total_earnings = (float)($stats['total_earnings'] ?? 0);

// Get upcoming bookings
$stmt = $conn->prepare("
    SELECT b.*, u.full_name as client_name
    FROM bookings b
    JOIN users u ON b.client_id = u.id
    WHERE b.artist_id = ? 
        AND b.event_date >= CURDATE() 
        AND b.booking_status IN ('confirmed', 'pending')
    ORDER BY b.event_date ASC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$upcoming_bookings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Get recent reviews
$stmt = $conn->prepare("
    SELECT r.*, u.full_name as reviewer_name
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.artist_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$recent_reviews = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// Calculate average rating
$avg_rating = 0;
if (count($recent_reviews) > 0) {
  $total_rating = array_sum(array_column($recent_reviews, 'rating'));
  $avg_rating = $total_rating / count($recent_reviews);
}

// Get response rate
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_messages,
        SUM(CASE 
            WHEN TIMESTAMPDIFF(HOUR, created_at, replied_at) <= 24 THEN 1 
            ELSE 0 
        END) as responded_quickly
    FROM messages
    WHERE recipient_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$response_stats = $stmt->get_result()->fetch_assoc();
$stmt->close();

$total_messages = (int)($response_stats['total_messages'] ?? 0);
$quick_responses = (int)($response_stats['responded_quickly'] ?? 0);
$response_rate = $total_messages > 0 ? round(($quick_responses / $total_messages) * 100) : 0;

// Get average response time
$stmt = $conn->prepare("
    SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, replied_at)) as avg_response_time
    FROM messages
    WHERE recipient_id = ? AND replied_at IS NOT NULL
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$avg_time = $stmt->get_result()->fetch_assoc();
$stmt->close();

$avg_hours = (float)($avg_time['avg_response_time'] ?? 0);
if ($avg_hours < 1) {
  $avg_response_time = '< 1 hour';
} elseif ($avg_hours < 24) {
  $avg_response_time = round($avg_hours, 1) . ' hours';
} else {
  $avg_response_time = round($avg_hours / 24, 1) . ' days';
}

// Get profile views (you'll need to create this table)
$stmt = $conn->prepare("
    SELECT COUNT(*) as view_count
    FROM profile_views
    WHERE artist_id = ? AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$views_result = $stmt->get_result()->fetch_assoc();
$stmt->close();
$profile_views = (int)($views_result['view_count'] ?? 0);

// Get favorites count
$stmt = $conn->prepare("
    SELECT COUNT(*) as favorite_count
    FROM favorites
    WHERE artist_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$favorites = $stmt->get_result()->fetch_assoc();
$stmt->close();
$favorites_count = (int)($favorites['favorite_count'] ?? 0);
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Artist Dashboard — Plum</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300..700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Inter", sans-serif;
      background: #f8f6ff;
      color: #1e1b2b;
      min-height: 100vh;
    }

    :root {
      --plum-50: #f7f2ff;
      --plum-100: #ede4ff;
      --plum-200: #dacfff;
      --plum-300: #c2b0f5;
      --plum-400: #9f85e5;
      --plum-500: #7f5fd6;
      --plum-600: #6848c2;
      --plum-700: #5336a3;
      --plum-800: #3f2980;
      --plum-900: #2d1c5c;
      --gray-50: #f9fafc;
      --gray-100: #f2f4f8;
      --gray-200: #e6e9f0;
      --gray-300: #d0d6e0;
      --gray-400: #a8b1c2;
      --gray-500: #7f8a9e;
      --gray-600: #5e677b;
      --gray-700: #3d4457;
      --white: #ffffff;
      --shadow-sm: 0 8px 20px -6px rgba(60, 30, 100, 0.08);
      --shadow-md: 0 16px 30px -10px rgba(80, 40, 140, 0.15);
      --shadow-lg: 0 25px 40px -12px rgba(70, 30, 130, 0.25);
      --border-radius-card: 28px;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2.5rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(190, 170, 230, 0.3);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .navbar-logo {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--plum-800);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-dot {
      width: 10px;
      height: 10px;
      background: var(--plum-500);
      border-radius: 50%;
      display: inline-block;
      animation: pulse 3s infinite;
    }

    @keyframes pulse {

      0%,
      100% {
        opacity: 0.6;
        transform: scale(1);
      }

      50% {
        opacity: 1;
        transform: scale(1.2);
        background: #a07cff;
      }
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      text-decoration: none;
      color: var(--gray-600);
      font-weight: 500;
      transition: color 0.2s;
      position: relative;
    }

    .nav-link:hover {
      color: var(--plum-700);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--plum-400), var(--plum-600));
      transition: width 0.2s ease;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .logout-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 40px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 14px -6px rgba(239, 68, 68, 0.3);
    }

    .logout-btn:hover {
      background: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -8px #b91c1c;
    }

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 30px;
    }

    .dashboard-header {
      margin-bottom: 40px;
      animation: fadeUp 0.5s ease;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--plum-800);
      margin-bottom: 8px;
    }

    .dashboard-header h1 span {
      color: var(--plum-600);
      background: linear-gradient(135deg, var(--plum-400), var(--plum-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .dashboard-header p {
      color: var(--gray-500);
      font-size: 1rem;
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      background: white;
      border-radius: var(--border-radius-card);
      padding: 28px 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: var(--plum-200);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      background: var(--plum-50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--plum-600);
      font-size: 1.8rem;
    }

    .stat-content h3 {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--plum-800);
      line-height: 1.2;
    }

    .stat-content p {
      color: var(--gray-500);
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section {
      background: white;
      border-radius: var(--border-radius-card);
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      transition: box-shadow 0.2s;
    }

    .section:hover {
      box-shadow: var(--shadow-md);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--plum-800);
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--plum-100);
    }

    .section-title i {
      color: var(--plum-500);
      font-size: 1.6rem;
    }

    .booking-item,
    .review-item,
    .insight-item {
      background: var(--gray-50);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid var(--gray-200);
      transition: all 0.2s;
      position: relative;
    }

    .booking-item:hover,
    .review-item:hover,
    .insight-item:hover {
      transform: translateX(4px);
      border-color: var(--plum-300);
      background: white;
    }

    .booking-header,
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .booking-header h4,
    .review-header h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--plum-700);
    }

    .booking-date {
      font-size: 0.85rem;
      color: var(--gray-500);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .booking-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin: 12px 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--gray-600);
      font-size: 0.9rem;
    }

    .detail-item i {
      color: var(--plum-500);
      width: 18px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 60px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-confirmed {
      background: #d4edda;
      color: #155724;
    }

    .status-completed {
      background: #cce5ff;
      color: #004085;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .stars {
      color: #fbbf24;
      letter-spacing: 2px;
      font-size: 1rem;
    }

    .review-comment {
      color: var(--gray-600);
      margin: 8px 0 0;
      font-style: italic;
    }

    .review-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      font-size: 0.8rem;
      color: var(--gray-500);
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--gray-400);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .btn-primary {
      display: inline-block;
      background: var(--plum-600);
      color: white;
      padding: 12px 28px;
      border-radius: 60px;
      text-decoration: none;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 8px 18px -6px rgba(104, 72, 194, 0.3);
    }

    .btn-primary:hover {
      background: var(--plum-700);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(83, 54, 163, 0.4);
    }

    .btn-secondary {
      background: transparent;
      border: 1.5px solid var(--plum-300);
      color: var(--plum-700);
      padding: 10px 22px;
      border-radius: 60px;
      font-weight: 600;
      text-decoration: none;
      transition: 0.2s;
    }

    .btn-secondary:hover {
      background: var(--plum-50);
      border-color: var(--plum-500);
    }

    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 700px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }

      .navbar {
        padding: 1rem 1.5rem;
      }

      .dashboard-container {
        padding: 20px;
      }
    }
  </style>
</head>

<body>

  <nav class="navbar">
    <a href="index.html" class="navbar-logo">Plum <span class="logo-dot"></span></a>
    <div class="nav-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="Browse.html" class="nav-link">Browse Artists</a>
      <a href="#" class="nav-link">Dashboard</a>
    </div>
    <form method="POST" action="logout.php" style="margin:0;">
      <button type="submit" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
    </form>
  </nav>

  <main class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>Welcome back, <span><?php echo htmlspecialchars($user['full_name']); ?></span>!</h1>
      <p>Your creative journey at a glance – manage gigs, earnings, and connect with clients.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
        <div class="stat-content">
          <h3><?php echo number_format($total_bookings); ?></h3>
          <p>Total bookings</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
        <div class="stat-content">
          <h3><?php echo number_format($completed_bookings); ?></h3>
          <p>Completed</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-wallet"></i></div>
        <div class="stat-content">
          <h3>K<?php echo number_format($total_earnings, 2); ?></h3>
          <p>Total earnings</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-star"></i></div>
        <div class="stat-content">
          <h3><?php echo number_format($avg_rating, 1); ?></h3>
          <p>Average rating</p>
        </div>
      </div>
    </div>

    <!-- Two column layout for upcoming and performance -->
    <div class="grid-2">
      <!-- Upcoming Bookings -->
      <div class="section">
        <div class="section-title">
          <i class="fas fa-music"></i>
          <span>Upcoming Gigs</span>
        </div>
        <div id="upcoming-container">
          <?php if (count($upcoming_bookings) > 0): ?>
            <?php foreach ($upcoming_bookings as $booking): ?>
              <div class="booking-item">
                <div class="booking-header">
                  <h4><?php echo htmlspecialchars($booking['event_location'] ?? 'Location TBD'); ?></h4>
                  <span class="status-badge status-<?php echo $booking['booking_status']; ?>">
                    <?php echo strtoupper($booking['booking_status']); ?>
                  </span>
                </div>
                <div class="booking-details">
                  <div class="detail-item"><i class="fas fa-user"></i> <?php echo htmlspecialchars($booking['client_name'] ?? 'Client'); ?></div>
                  <div class="detail-item"><i class="fas fa-tag"></i> <?php echo htmlspecialchars($booking['event_type'] ?? 'Event'); ?></div>
                  <div class="detail-item"><i class="fas fa-clock"></i> <?php echo $booking['duration_hours'] ?? 0; ?> hours</div>
                  <div class="detail-item"><i class="fas fa-wallet"></i> K<?php echo number_format($booking['total_amount'] ?? 0, 2); ?></div>
                </div>
                <div class="booking-date">
                  <i class="far fa-calendar-alt"></i>
                  <?php echo date('D, d M Y', strtotime($booking['event_date'])); ?>
                </div>
              </div>
            <?php endforeach; ?>
          <?php else: ?>
            <div class="empty-state">
              <i class="fas fa-calendar-times"></i>
              <p>No upcoming gigs. Time to update your availability!</p>
              <a href="#" class="btn-secondary" style="margin-top: 12px;">Manage Calendar</a>
            </div>
          <?php endif; ?>
        </div>
        <div style="margin-top: 20px; text-align: right;">
          <a href="#" class="btn-secondary"><i class="fas fa-calendar-alt"></i> View all</a>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="section">
        <div class="section-title">
          <i class="fas fa-chart-line"></i>
          <span>Performance</span>
        </div>
        <div class="insight-item">
          <div class="flex-between">
            <span><i class="fas fa-reply-all"></i> Response rate</span>
            <strong><?php echo $response_rate; ?>%</strong>
          </div>
          <div style="background: var(--plum-100); height: 6px; border-radius: 10px; margin-top: 8px;">
            <div style="width: <?php echo $response_rate; ?>%; background: var(--plum-600); height: 6px; border-radius: 10px;"></div>
          </div>
        </div>
        <div class="insight-item">
          <div class="flex-between">
            <span><i class="fas fa-clock"></i> Avg. response time</span>
            <strong><?php echo $avg_response_time; ?></strong>
          </div>
        </div>
        <div class="insight-item">
          <div class="flex-between">
            <span><i class="fas fa-eye"></i> Profile views (last 30d)</span>
            <strong><?php echo number_format($profile_views); ?></strong>
          </div>
        </div>
        <div class="insight-item">
          <div class="flex-between">
            <span><i class="fas fa-heart"></i> Times favorited</span>
            <strong><?php echo number_format($favorites_count); ?></strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reviews -->
    <div class="section">
      <div class="section-title">
        <i class="fas fa-star-half-alt"></i>
        <span>Recent Reviews</span>
      </div>
      <div id="reviews-container">
        <?php if (count($recent_reviews) > 0): ?>
          <?php foreach ($recent_reviews as $review): ?>
            <div class="review-item">
              <div class="review-header">
                <h4><?php echo htmlspecialchars($review['reviewer_name']); ?></h4>
                <div class="stars">
                  <?php echo str_repeat('★', $review['rating']); ?>
                  <?php echo str_repeat('☆', 5 - $review['rating']); ?>
                </div>
              </div>
              <p class="review-comment"><?php echo htmlspecialchars($review['comment'] ?? 'No comment provided'); ?></p>
              <div class="review-meta">
                <span><i class="far fa-calendar-alt"></i> <?php echo date('M d, Y', strtotime($review['created_at'])); ?></span>
              </div>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="empty-state">
            <i class="fas fa-star"></i>
            <p>No reviews yet. Complete bookings to receive reviews!</p>
          </div>
        <?php endif; ?>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="#" class="btn-primary"><i class="fas fa-plus-circle"></i> View all reviews</a>
      </div>
    </div>

    <!-- Quick actions / Manage profile -->
    <div class="section" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
      <div>
        <h3 style="color: var(--plum-800); margin-bottom: 4px;">Manage your artist profile</h3>
        <p style="color: var(--gray-500);">Update your bio, media, rates, and availability.</p>
      </div>
      <div style="display: flex; gap: 12px;">
        <a href="#" class="btn-secondary"><i class="fas fa-edit"></i> Edit profile</a>
        <a href="#" class="btn-primary"><i class="fas fa-calendar-plus"></i> Set availability</a>
      </div>
    </div>
  </main>

</body>

</html>