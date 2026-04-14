<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/config.php';

$settings = plum_app_settings();
plum_enforce_maintenance();
$dash = require __DIR__ . '/includes/artist_dashboard_data.php';

if (!empty($dash['redirect'])) {
    header('Location: ' . $dash['redirect']);
    exit;
}
if (!empty($dash['forbidden'])) {
    http_response_code(403);
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Access denied</title></head><body><h1>Access denied</h1><p>This workspace is for artist accounts.</p></body></html>';
    exit;
}

$user = $dash['user'];
$profile = $dash['profile'];
$stats = $dash['stats'];
$jsPayload = json_encode($dash['js'], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
$scoreOffset = 188.5 * (1 - ((int) $stats['profile_score'] / 100));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Artist Dashboard - <?= e($settings['app_name']) ?></title>
<meta name="description" content="Manage bookings, inquiries, portfolio and earnings in your <?= e($settings['app_name']) ?> artist workspace."/>
<link rel="icon" type="image/png" href="<?= e(adash_asset($settings['app_logo_path'] ?? null)) ?>"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="css/adash.css"/>
<link rel="stylesheet" href="css/site-theme.css"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
.notif-panel{display:none;position:absolute;top:calc(100% + 8px);right:0;width:320px;background:var(--surface2,#1C1C2E);border:1px solid rgba(255,255,255,0.1);border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,0.5);z-index:200;overflow:hidden}.notif-panel.open{display:block;animation:slideDown .2s ease}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:.75rem}.cal-day{aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid transparent}.cal-day:hover{background:rgba(139,31,200,.2);border-color:rgba(139,31,200,.3)}.cal-day.booked{background:rgba(139,31,200,.3);border-color:rgba(139,31,200,.5);color:#B46EE8}.cal-day.available{background:rgba(184,217,0,.15);border-color:rgba(184,217,0,.3);color:#5A8A00}.cal-day.today{background:var(--purple,#8B1FC8);color:#fff;font-weight:800}.cal-day.header{cursor:default;color:rgba(30,36,56,.45);font-size:.65rem;font-weight:700;text-transform:uppercase;background:none;border:none}.cal-day.empty{cursor:default;background:none;border:none}.cal-legend{display:flex;gap:1rem;margin-top:.75rem;font-size:.7rem;color:var(--text-muted);flex-wrap:wrap}.cal-legend span{display:flex;align-items:center;gap:.35rem}.cal-legend .dot{width:8px;height:8px;border-radius:50%}
.empty-state{padding:1rem;border:1px dashed var(--grey2);border-radius:12px;color:var(--text-muted);font-size:.85rem;line-height:1.5;background:var(--off-white)}.client-av.fallback,.inq-av.fallback{display:flex;align-items:center;justify-content:center;background:var(--purple-pale);color:var(--purple);font-weight:800;font-size:.75rem}.sp-avatar-initials{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--purple-pale);color:var(--purple);font-weight:800}.logo-img{height:38px;width:auto;object-fit:contain}.sf-logout{background:none;border:0;width:100%;font-family:inherit;text-align:left}.settings-note{font-size:.78rem;color:var(--text-muted);line-height:1.5}.profile-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}@media(max-width:640px){.profile-field-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="dash-layout">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <a class="nav-logo-wrap" href="index.html" aria-label="<?= e($settings['app_name']) ?> home">
        <img class="logo-img" src="<?= e(adash_asset($settings['app_logo_path'] ?? null)) ?>" alt="<?= e($settings['app_name']) ?> logo"/>
        <div class="nav-wordmark"><?= e($settings['app_name']) ?></div>
      </a>
    </div>
    <div class="sidebar-profile">
      <div class="sp-avatar" onclick="document.getElementById('avUpload').click()">
        <?php if (!empty($user['profile_picture'])): ?>
          <img src="<?= e($dash['avatar']) ?>" alt="<?= e($dash['name']) ?>" id="sideAvatar"/>
        <?php else: ?>
          <div class="sp-avatar-initials" id="sideAvatarInitials"><?= e(adash_initials($dash['name'])) ?></div>
        <?php endif; ?>
        <div class="sp-avatar-overlay"><i data-lucide="camera"></i></div>
      </div>
      <input type="file" id="avUpload" accept="image/*" style="display:none" onchange="changeAvatar(this)"/>
      <div>
        <div class="sp-name"><?= e($dash['name']) ?></div>
        <div class="sp-role"><i data-lucide="<?= e($dash['category_icon']) ?>"></i> <?= e($dash['category']) ?></div>
        <div class="sp-badge"><i data-lucide="badge-check"></i> <?= plum_user_is_verified($user) ? 'Verified' : 'Pending verification' ?></div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-label">Main</div>
        <a class="nav-item active" onclick="showPage('overview',this)"><i data-lucide="layout-dashboard"></i> Overview</a>
        <a class="nav-item" onclick="showPage('bookings',this)"><i data-lucide="calendar-check"></i> Bookings <span class="badge"><?= e($stats['upcoming_confirmed']) ?></span></a>
        <a class="nav-item" onclick="showPage('inquiries',this)"><i data-lucide="message-circle"></i> Inquiries <span class="badge"><?= e($stats['unread_inquiries']) ?></span></a>
        <a class="nav-item" onclick="showPage('earnings',this)"><i data-lucide="banknote"></i> Earnings</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-label">Profile</div>
        <a class="nav-item" href="<?= e($dash['profile_url']) ?>"><i data-lucide="user-circle-2"></i> My Profile</a>
        <a class="nav-item" onclick="openEditModal();showPage('profile',this)"><i data-lucide="edit-3"></i> Edit Profile</a>
        <a class="nav-item" onclick="showPage('portfolio',this)"><i data-lucide="image"></i> Portfolio</a>
        <a class="nav-item" onclick="showPage('services',this)"><i data-lucide="package"></i> Services</a>
        <a class="nav-item" onclick="showPage('calendar',this)"><i data-lucide="calendar"></i> Availability</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-label">Account</div>
        <a class="nav-item" onclick="showPage('settings',this)"><i data-lucide="settings"></i> Settings</a>
        <a class="nav-item" href="browse.html"><i data-lucide="compass"></i> Browse Market</a>
      </div>
    </nav>
    <div class="sidebar-footer"><button class="sf-logout" type="button" onclick="logoutUser()"><i data-lucide="log-out"></i> Log Out</button></div>
  </aside>

  <div class="dash-main">
    <div class="dash-topbar">
      <div class="topbar-title" id="pageTitle">Dashboard Overview</div>
      <div class="topbar-right">
        <div class="tb-greeting"><?= e($dash['greeting']) ?>, <?= e($dash['first_name']) ?></div>
        <div style="position:relative">
          <div class="icon-btn" id="notifBtn" onclick="toggleNotif()"><i data-lucide="bell"></i><?php if ((int) $stats['unread_inquiries'] > 0): ?><div class="notif-dot"></div><?php endif; ?></div>
          <div class="notif-panel" id="notifPanel">
            <div style="padding:1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;font-size:.875rem">Notifications</span><span style="font-size:.72rem;color:#B46EE8;cursor:pointer" onclick="markAllRead()">Mark all read</span></div>
            <div style="padding:.5rem">
              <?php if ($dash['recent_messages'] === []): ?>
                <div class="empty-state">No new notifications yet.</div>
              <?php else: foreach ($dash['recent_messages'] as $message): ?>
                <div class="inq-item" style="padding:.75rem;border-radius:12px;<?= ((int) $message['is_read'] === 0) ? 'background:rgba(139,31,200,.08)' : '' ?>">
                  <?php if (!empty($message['sender_picture'])): ?><div class="inq-av"><img src="<?= e(adash_asset($message['sender_picture'])) ?>" alt="" loading="lazy"/></div><?php else: ?><div class="inq-av fallback"><?= e(adash_initials((string) $message['sender_name'])) ?></div><?php endif; ?>
                  <div class="inq-body"><div class="inq-top"><span class="inq-name"><?= e($message['sender_name']) ?></span><span class="inq-time"><?= e(adash_time_ago($message['created_at'] ?? null)) ?></span></div><div class="inq-msg"><?= e(adash_excerpt((string) $message['message_text'], 90)) ?></div></div>
                </div>
              <?php endforeach; endif; ?>
            </div>
            <div style="padding:.75rem;text-align:center;border-top:1px solid rgba(255,255,255,.06)"><span style="font-size:.78rem;color:#B46EE8;cursor:pointer" onclick="showPage('inquiries',null);toggleNotif()">View all inquiries</span></div>
          </div>
        </div>
        <div class="icon-btn" id="themeToggle" onclick="window.toggleTheme()" title="Toggle Theme"><i data-lucide="moon" class="dark-icon"></i><i data-lucide="sun" class="light-icon"></i></div>
        <div class="icon-btn" onclick="shareProfile()"><i data-lucide="share-2"></i></div>
        <button class="btn-primary" onclick="window.location.href='<?= e($dash['profile_url']) ?>'"><i data-lucide="external-link"></i> View Profile</button>
      </div>
    </div>

    <div class="dash-content">
      <div class="page-section active" id="sec-overview">
        <div class="welcome-banner reveal">
          <div class="wb-text"><h2>Welcome back, <?= e($dash['first_name']) ?>!</h2><p>You have <?= e($stats['unread_inquiries']) ?> unread inquiries and <?= e($stats['upcoming_confirmed']) ?> upcoming confirmed bookings.</p></div>
          <div style="display:flex;align-items:center;gap:1.5rem"><div class="wb-stat"><div class="num" data-target="<?= e((int) round($stats['projected_earnings'])) ?>" data-prefix="K">K0</div><div class="lbl">Projected earnings</div></div><button class="btn-lime" onclick="openEditModal()"><i data-lucide="edit-3"></i> Quick Edit</button></div>
        </div>
        <div class="metrics-grid">
          <div class="metric-card reveal"><div class="mc-top"><div class="mc-icon purple"><i data-lucide="message-circle"></i></div><span class="mc-change up"><?= e(adash_metric_change($stats['new_inquiries'], $stats['new_inquiries'] . ' new')) ?></span></div><div class="mc-num" data-target="<?= e($stats['unread_inquiries']) ?>">0</div><div class="mc-label">Open Inquiries</div></div>
          <div class="metric-card reveal d1"><div class="mc-top"><div class="mc-icon lime"><i data-lucide="calendar-check"></i></div><span class="mc-change up"><?= e(adash_metric_change($stats['confirmed_this_week'], $stats['confirmed_this_week'] . ' this wk')) ?></span></div><div class="mc-num" data-target="<?= e($stats['upcoming_confirmed']) ?>">0</div><div class="mc-label">Confirmed Shows</div></div>
          <div class="metric-card reveal d2"><div class="mc-top"><div class="mc-icon gold"><i data-lucide="banknote"></i></div><span class="mc-change up"><?= ((float) $stats['earned_this_month'] > 0) ? 'Active' : 'No change' ?></span></div><div class="mc-num"><?= e(adash_money($stats['earned_this_month'])) ?></div><div class="mc-label">Earned This Month</div></div>
          <div class="metric-card reveal d3"><div class="mc-top"><div class="mc-icon blue"><i data-lucide="eye"></i></div><span class="mc-change up"><?= e(adash_metric_change($stats['profile_views_week'], $stats['profile_views_week'] . ' this wk')) ?></span></div><div class="mc-num" data-target="<?= e($stats['profile_views']) ?>">0</div><div class="mc-label">Profile Views</div></div>
        </div>
        <div class="grid-2">
          <div class="dash-card reveal">
            <div class="dc-header"><div class="dc-title">Recent Bookings</div><a class="view-all-link" onclick="showPage('bookings',null)">View all <i data-lucide="arrow-right"></i></a></div>
            <div class="booking-row header"><div>Client</div><div>Date</div><div>Amount</div><div>Status</div><div></div></div>
            <?php if ($dash['recent_bookings'] === []): ?><div class="empty-state">No bookings yet. New booking requests will appear here.</div><?php else: foreach ($dash['recent_bookings'] as $booking): ?>
              <?php require __DIR__ . '/includes/artist_dashboard_booking_row.php'; ?>
            <?php endforeach; endif; ?>
          </div>
          <div>
            <div class="dash-card reveal d1" style="margin-bottom:1.2rem"><div class="dc-header"><div class="dc-title">Earnings Trend</div><span class="dc-tag">Past 6 Months</span></div><div style="height:200px;margin-top:1rem"><canvas id="earningsChart"></canvas></div></div>
            <div class="dash-card reveal d1" style="margin-bottom:1.2rem"><div class="dc-header"><div class="dc-title">Profile Engagement</div><span class="dc-tag">Daily Views</span></div><div style="height:140px;margin-top:.5rem"><canvas id="engagementChart"></canvas></div></div>
            <div class="dash-card reveal d2">
              <div class="dc-header"><div class="dc-title">Profile Score</div><span class="dc-tag"><?= e($stats['profile_score']) ?>%</span></div>
              <div class="score-ring-wrap"><div class="score-ring"><svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="var(--grey2)" stroke-width="6"/><circle cx="36" cy="36" r="30" fill="none" stroke="var(--purple)" stroke-width="6" stroke-dasharray="188.5" stroke-dashoffset="<?= e($scoreOffset) ?>" stroke-linecap="round"/></svg><div class="num"><?= e($stats['profile_score']) ?>%</div></div><div style="font-size:.82rem;color:var(--text-muted)"><?= ((int) $stats['profile_score'] === 100) ? 'Your profile is ready for bookings.' : 'Finish the remaining items to strengthen your profile.' ?></div></div>
              <?php foreach ($stats['score_items'] as $item): ?><div class="score-item"><span><?= e($item['label']) ?></span><div class="score-check <?= $item['done'] ? 'done' : 'todo' ?>"><i data-lucide="<?= $item['done'] ? 'check' : 'plus' ?>"></i></div></div><?php endforeach; ?>
            </div>
          </div>
        </div>
        <div class="grid-2">
          <div class="dash-card reveal">
            <div class="dc-header"><div class="dc-title">Recent Inquiries</div><a class="view-all-link" onclick="showPage('inquiries',null)">View all <i data-lucide="arrow-right"></i></a></div>
            <?php if ($dash['recent_messages'] === []): ?><div class="empty-state">No inquiries yet. New client messages will appear here.</div><?php else: foreach ($dash['recent_messages'] as $message): ?>
              <?php require __DIR__ . '/includes/artist_dashboard_message_row.php'; ?>
            <?php endforeach; endif; ?>
          </div>
          <div class="dash-card reveal d1">
            <div class="dc-header"><div class="dc-title">Quick Actions</div></div>
            <div class="qa-grid">
              <button class="qa-btn" onclick="openEditModal()"><div class="qa-icon" style="background:var(--purple-pale)"><i data-lucide="edit-3" style="color:var(--purple)"></i></div><div class="qa-name">Edit Profile</div><div class="qa-desc">Update info and rates</div></button>
              <button class="qa-btn" onclick="showPage('portfolio',null)"><div class="qa-icon" style="background:#EFFFDA"><i data-lucide="image" style="color:#5A8A00"></i></div><div class="qa-name">Add Media</div><div class="qa-desc">Photos and videos</div></button>
              <button class="qa-btn" onclick="showPage('services',null)"><div class="qa-icon" style="background:#FFF7E0"><i data-lucide="package" style="color:#A07800"></i></div><div class="qa-name">Add Service</div><div class="qa-desc">New package</div></button>
              <button class="qa-btn" onclick="shareProfile()"><div class="qa-icon" style="background:#E8F4FF"><i data-lucide="share-2" style="color:#1A6AB5"></i></div><div class="qa-name">Share Profile</div><div class="qa-desc">Copy your link</div></button>
            </div>
          </div>
        </div>
      </div>

      <div class="page-section" id="sec-bookings">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">All Bookings</div><span class="dc-tag"><?= e(count($dash['bookings'])) ?> total</span></div>
          <div class="booking-row header"><div>Client</div><div>Date</div><div>Amount</div><div>Status</div><div></div></div>
          <?php if ($dash['bookings'] === []): ?>
            <div class="empty-state">No bookings yet.</div>
          <?php else: foreach ($dash['bookings'] as $booking): ?>
            <?php require __DIR__ . '/includes/artist_dashboard_booking_row.php'; ?>
          <?php endforeach; endif; ?>
        </div>
      </div>

      <div class="page-section" id="sec-inquiries">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">All Inquiries <span class="dc-tag"><?= e($stats['unread_inquiries']) ?> unread</span></div></div>
          <?php if ($dash['messages'] === []): ?>
            <div class="empty-state">No inquiries yet.</div>
          <?php else: foreach ($dash['messages'] as $message): ?>
            <?php require __DIR__ . '/includes/artist_dashboard_message_row.php'; ?>
          <?php endforeach; endif; ?>
        </div>
      </div>

      <div class="page-section" id="sec-earnings">
        <div class="metrics-grid reveal">
          <div class="metric-card"><div class="mc-top"><div class="mc-icon purple"><i data-lucide="banknote"></i></div></div><div class="mc-num"><?= e(adash_money($stats['earned_this_month'])) ?></div><div class="mc-label">This Month</div></div>
          <div class="metric-card"><div class="mc-top"><div class="mc-icon lime"><i data-lucide="trending-up"></i></div></div><div class="mc-num"><?= e(adash_money($stats['earned_this_quarter'])) ?></div><div class="mc-label">This Quarter</div></div>
          <div class="metric-card"><div class="mc-top"><div class="mc-icon gold"><i data-lucide="star"></i></div></div><div class="mc-num"><?= e(adash_money($stats['best_month_amount'])) ?></div><div class="mc-label">Best Month (<?= e($stats['best_month_label']) ?>)</div></div>
          <div class="metric-card"><div class="mc-top"><div class="mc-icon blue"><i data-lucide="check-circle-2"></i></div></div><div class="mc-num"><?= e(adash_money($stats['earned_total'])) ?></div><div class="mc-label">Total Earned</div></div>
        </div>
        <div class="dash-card reveal d1"><div class="dc-header"><div class="dc-title">Earnings by Month</div></div><div class="bar-chart" id="fullEarningsChart"></div></div>
      </div>

      <div class="page-section" id="sec-profile">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">Edit Profile</div></div>
          <div class="field-group"><label class="field-label">Display Name</label><input type="text" class="field-input" value="<?= e($dash['name']) ?>"/></div>
          <div class="field-group"><label class="field-label">Bio</label><textarea class="field-input" rows="4" style="resize:vertical"><?= e($dash['bio']) ?></textarea></div>
          <div class="profile-field-grid">
            <div class="field-group"><label class="field-label">City</label><input type="text" class="field-input" value="<?= e((string) ($user['location'] ?? '')) ?>"/></div>
            <div class="field-group"><label class="field-label">Starting Rate (K)</label><input type="number" class="field-input" value="<?= e((string) ($profile['hourly_rate'] ?? 0)) ?>"/></div>
          </div>
          <div class="field-group"><label class="field-label">Category</label><input type="text" class="field-input" value="<?= e($dash['category']) ?>"/></div>
          <div class="field-group"><label class="field-label">Portfolio URL</label><input type="url" class="field-input" value="<?= e($dash['portfolio_url']) ?>" placeholder="https://yourwebsite.com"/></div>
          <button class="btn-primary" style="margin-top:.5rem" onclick="showToast('Profile editing is next.')"><i data-lucide="save"></i> Save Changes</button>
        </div>
      </div>

      <div class="page-section" id="sec-portfolio">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">Portfolio Media</div><button class="btn-primary" onclick="document.getElementById('portfolioUpload').click()"><i data-lucide="upload"></i> Add Media</button></div>
          <input type="file" id="portfolioUpload" accept="image/*,video/*" multiple style="display:none" onchange="handlePortfolioUpload(this)"/>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem;margin-top:.5rem" id="portfolioGrid">
            <?php foreach ($dash['portfolio_files'] as $file): ?>
              <div style="border-radius:12px;overflow:hidden;aspect-ratio:1;position:relative;cursor:pointer"><img src="<?= e(adash_asset($file['path'] ?? '')) ?>" style="width:100%;height:100%;object-fit:cover" alt="<?= e((string) ($file['original_name'] ?? 'Portfolio media')) ?>"/></div>
            <?php endforeach; ?>
            <?php if ($dash['portfolio_files'] === []): ?><div class="empty-state" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;text-align:center">No portfolio media yet.</div><?php endif; ?>
            <div style="border-radius:12px;border:2px dashed var(--grey2);aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;cursor:pointer;transition:all .25s;color:var(--text-muted)" onclick="document.getElementById('portfolioUpload').click()"><i data-lucide="plus-circle"></i><span style="font-size:.72rem;font-weight:600">Add Photo</span></div>
          </div>
        </div>
      </div>

      <div class="page-section" id="sec-services">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">My Services</div><button class="btn-primary" onclick="openAddService()"><i data-lucide="plus"></i> Add Service</button></div>
          <div id="servicesList" style="display:grid;gap:.75rem;margin-top:.5rem">
            <?php if ($dash['services'] === []): ?><div class="empty-state">No services listed yet.</div><?php else: foreach ($dash['services'] as $service): ?>
              <div style="display:grid;grid-template-columns:1fr auto;align-items:start;padding:1rem;border:1px solid var(--grey2);border-radius:14px;gap:1rem">
                <div><div style="font-weight:700;color:var(--navy2);margin-bottom:.3rem"><?= e($service['name']) ?></div><div style="font-size:.82rem;color:var(--text-muted)"><?= e($service['description'] ?: ($service['includes_details'] ?: 'Service details coming soon.')) ?></div></div>
                <div style="display:flex;align-items:center;gap:.5rem"><span style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:800;color:var(--purple)"><?= e(adash_money($service['price'] ?? 0)) ?></span><button class="row-action" onclick="editService(this)">Edit</button></div>
              </div>
            <?php endforeach; endif; ?>
          </div>
        </div>
      </div>

      <div class="page-section" id="sec-settings">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">Account Settings</div></div>
          <div class="field-group"><label class="field-label">Email</label><input type="email" class="field-input" value="<?= e($user['email']) ?>"/></div>
          <div class="field-group"><label class="field-label">Phone</label><input type="tel" class="field-input" value="<?= e((string) ($user['phone'] ?? '')) ?>"/></div>
          <div class="field-group"><label class="field-label">Support Email</label><input type="email" class="field-input" value="<?= e((string) ($settings['support_email'] ?? plum_env('MAIL_FROM_ADDRESS', 'support@plum.local'))) ?>" readonly/></div>
          <div class="settings-note">Availability status: <?= e(ucfirst((string) ($profile['availability_status'] ?? 'available'))) ?>. Account updates will be connected through secure AJAX endpoints next.</div>
          <button class="btn-primary" style="margin-top:1rem" onclick="showToast('Settings updates are next.')"><i data-lucide="save"></i> Save Settings</button>
        </div>
      </div>

      <div class="page-section" id="sec-calendar">
        <div class="dash-card reveal">
          <div class="dc-header"><div class="dc-title">Availability Calendar</div><div style="display:flex;gap:.5rem"><button class="row-action" onclick="prevMonth()"><i data-lucide="chevron-left"></i></button><button class="row-action" onclick="nextMonth()"><i data-lucide="chevron-right"></i></button></div></div>
          <div style="font-weight:700;font-size:1rem;color:var(--text);margin:.5rem 0" id="calMonthLabel"></div>
          <div class="cal-grid" id="calGrid"></div>
          <div class="cal-legend"><span><div class="dot" style="background:#8B1FC8"></div> Booked</span><span><div class="dot" style="background:#B8D900"></div> Available</span><span><div class="dot" style="background:rgba(30,36,56,.2)"></div> Click to toggle</span></div>
        </div>
        <div class="grid-2" style="margin-top:1.5rem">
          <div class="dash-card reveal d1"><div class="dc-header"><div class="dc-title">Availability Settings</div></div><div class="empty-state">Weekly availability editing will be connected through AJAX next.</div><button class="btn-primary" style="margin-top:1rem" onclick="showToast('Availability updates are next.')"><i data-lucide="save"></i> Save Availability</button></div>
          <div class="dash-card reveal d2">
            <div class="dc-header"><div class="dc-title">Blocked Dates</div><button class="btn-primary" onclick="addBlock()"><i data-lucide="plus"></i> Add Block</button></div>
            <div style="display:flex;flex-direction:column;gap:.5rem;margin-top:.5rem" id="blockList">
              <?php if ($dash['blocked_items'] === []): ?><div class="empty-state">No blocked dates yet.</div><?php else: foreach ($dash['blocked_items'] as $blocked): ?>
                <div style="display:grid;grid-template-columns:1fr auto;align-items:center;padding:.6rem .8rem;background:rgba(232,64,64,.08);border:1px solid rgba(232,64,64,.2);border-radius:10px"><div><div style="font-weight:600;font-size:.82rem"><?= e(adash_date($blocked['date'] ?? null)) ?></div><div style="font-size:.72rem;color:var(--text-muted)"><?= e((string) ($blocked['note'] ?? 'Blocked')) ?></div></div></div>
              <?php endforeach; endif; ?>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<button class="sidebar-toggle" id="sidebarToggle" onclick="document.getElementById('sidebar').classList.toggle('open')"><i data-lucide="menu"></i></button>

<div class="modal-overlay" id="editModal" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-header"><div class="modal-title">Edit Profile</div><button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button></div>
    <div class="modal-body">
      <div class="field-group"><label class="field-label">Display Name</label><input type="text" class="field-input" value="<?= e($dash['name']) ?>"/></div>
      <div class="field-group"><label class="field-label">Bio</label><textarea class="field-input" rows="3" style="resize:vertical"><?= e($dash['bio']) ?></textarea></div>
      <div class="profile-field-grid">
        <div class="field-group"><label class="field-label">City</label><input type="text" class="field-input" value="<?= e((string) ($user['location'] ?? '')) ?>"/></div>
        <div class="field-group"><label class="field-label">Rate (K/hr)</label><input type="number" class="field-input" value="<?= e((string) ($profile['hourly_rate'] ?? 0)) ?>"/></div>
      </div>
      <div class="field-group"><label class="field-label">Category</label><input type="text" class="field-input" value="<?= e($dash['category']) ?>"/></div>
    </div>
    <div class="modal-footer"><button class="btn-cancel" onclick="closeModal()">Cancel</button><button class="btn-save" onclick="saveAndClose()">Save Changes</button></div>
  </div>
</div>

<script>
window.PlumArtistDashboard = <?= $jsPayload ?: '{}' ?>;
</script>
<script src="js/adash.js"></script>
<script src="js/site-theme.js"></script>
<script src="js/dashboard-charts.js"></script>
<script src="js/messaging-mock.js"></script>
<script>
function toggleNotif() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open');
}
function markAllRead() {
  const panel = document.getElementById('notifPanel');
  const dot = document.querySelector('.notif-dot');
  if (panel) panel.classList.remove('open');
  if (dot) dot.style.display = 'none';
  if (window.lucide) lucide.createIcons();
}
document.addEventListener('click', e => {
  const panel = document.getElementById('notifPanel');
  if (panel && !e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')) panel.classList.remove('open');
});

let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
const dashboardCalendar = window.PlumArtistDashboard && window.PlumArtistDashboard.calendar ? window.PlumArtistDashboard.calendar : {};
const bookedDays = new Set(dashboardCalendar.bookedDates || []);
const availDays = new Set(dashboardCalendar.availableDates || []);

function calKey(day) {
  return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function renderCal() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label = document.getElementById('calMonthLabel');
  const grid = document.getElementById('calGrid');
  if (!label || !grid) return;
  label.textContent = months[calMonth] + ' ' + calYear;
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="cal-day header">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = calKey(d);
    const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
    const cls = isToday ? 'today' : bookedDays.has(key) ? 'booked' : availDays.has(key) ? 'available' : '';
    html += `<div class="cal-day ${cls}" onclick="toggleDay('${key}')" title="${key}">${d}</div>`;
  }
  grid.innerHTML = html;
}
function toggleDay(key) {
  if (bookedDays.has(key)) return;
  if (availDays.has(key)) availDays.delete(key);
  else availDays.add(key);
  renderCal();
}
function prevMonth() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCal(); }
function nextMonth() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCal(); }
function addBlock() { showToast('Blocked date tools are next.'); }
if (typeof showPage === 'function') {
  const originalShowPage = showPage;
  window.showPage = function(id, el) {
    originalShowPage(id, el);
    if (id === 'calendar') {
      renderCal();
      if (window.lucide) lucide.createIcons();
    }
  };
}
</script>
</body>
</html>
