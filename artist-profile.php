<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/config.php';

$settings = plum_app_settings();
plum_enforce_maintenance();
$profile = require __DIR__ . '/includes/artist_profile_data.php';

if (!empty($profile['not_found'])) {
    http_response_code(404);
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Artist not found</title></head><body><h1>Artist not found</h1><p>That Plum artist profile is not available.</p></body></html>';
    exit;
}

$artist = $profile['artist'];
$stats = $profile['stats'];
$bookingUrl = 'booking.html?artist=' . rawurlencode($profile['uuid'])
    . '&rate=' . rawurlencode(pp_money($profile['hourly_rate']))
    . '&role=' . rawurlencode($profile['category'] . ' - ' . $profile['location']);
$messageUrl = 'login.php?intent=message&artist=' . rawurlencode($profile['uuid']);
$profileUrl = 'artist-profile.php?artist=' . rawurlencode($profile['uuid']);
$jsPayload = json_encode($profile['js'], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title><?= e($profile['name']) ?> - Artist Profile - <?= e($settings['app_name']) ?></title>
<meta name="description" content="Book <?= e($profile['name']) ?>, <?= e($profile['category']) ?> on <?= e($settings['app_name']) ?>."/>
<link rel="icon" type="image/png" href="<?= e(pp_asset($settings['app_logo_path'] ?? null)) ?>"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="css/artist-profile.css"/>
<style>
.empty-state{padding:1rem;border:1px dashed var(--grey2);border-radius:14px;color:var(--text-muted);font-size:.88rem;line-height:1.6;background:var(--off-white)}
.fallback-av{display:flex;align-items:center;justify-content:center;background:var(--purple-pale);color:var(--purple);font-weight:800}
.profile-avatar.fallback-av{font-size:1.7rem}
.rc-av.fallback-av,.sim-av.fallback-av{font-size:.75rem}
.owner-only{display:inline-flex}
.nav-logo-wrap{display:flex;align-items:center;gap:.55rem;text-decoration:none}
.nav-wordmark{font-family:'Outfit',sans-serif;font-size:1.35rem;font-weight:800;color:var(--navy2);letter-spacing:-.02em}
.nav-wordmark span{color:var(--purple)}
.footer-logo .nav-wordmark span{color:var(--purple)}
.logo-img{height:38px;width:auto;object-fit:contain}
.rating-muted{color:var(--text-muted);font-size:.85rem}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="bg-blob b1"></div><div class="bg-blob b2"></div>

<div class="mob-menu" id="mobMenu">
  <button class="mob-close" id="mobClose"><i data-lucide="x" style="width:28px;height:28px;"></i></button>
  <a href="index.html">Home</a><a href="browse.html">Browse</a>
  <a href="login.php">Sign In</a><a href="adash.php">Dashboard</a>
</div>

<nav id="navbar">
  <a class="nav-logo-wrap" href="index.html" aria-label="<?= e($settings['app_name']) ?> home">
    <img class="logo-img" src="<?= e(pp_asset($settings['app_logo_path'] ?? null)) ?>" alt="<?= e($settings['app_name']) ?> logo"/>
    <div class="nav-wordmark"><?= e($settings['app_name']) ?></div>
  </a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="browse.html">Browse</a></li>
    <li><a href="<?= e($profileUrl) ?>" class="active">Artist Profile</a></li>
    <li><a href="organizer-profile.html">Organizers</a></li>
  </ul>
  <div class="nav-right">
    <a href="login.php" class="btn-ghost">Sign In</a>
    <a href="adash.php" class="btn-primary"><i data-lucide="layout-dashboard"></i> My Desk</a>
  </div>
  <div class="hamburger" id="menuToggle"><span></span><span></span><span></span></div>
</nav>

<div class="profile-cover">
  <img src="<?= e($profile['cover']) ?>" alt="<?= e($profile['name']) ?> cover"/>
  <div class="cover-overlay"></div>
  <div class="cover-actions">
    <?php if ($profile['is_owner']): ?><button class="cover-btn" onclick="openEditModal('cover')"><i data-lucide="camera"></i> Change Cover</button><?php endif; ?>
    <button class="cover-btn" onclick="shareProfile()"><i data-lucide="share-2"></i> Share</button>
  </div>
  <div class="avail-badge"><span class="avail-dot"></span> <?= e($profile['availability_label']) ?></div>
</div>

<div class="profile-header-wrap">
  <div class="profile-header-inner">
    <div class="profile-avatar-wrap">
      <?php if (!empty($artist['profile_picture'])): ?>
        <img class="profile-avatar" src="<?= e($profile['avatar']) ?>" alt="<?= e($profile['name']) ?>" id="profileAvatar"/>
      <?php else: ?>
        <div class="profile-avatar fallback-av" id="profileAvatar"><?= e(pp_initials($profile['name'])) ?></div>
      <?php endif; ?>
      <?php if ($profile['is_owner']): ?>
        <div class="av-edit" onclick="document.getElementById('avatarUpload').click()"><i data-lucide="camera"></i></div>
        <input type="file" id="avatarUpload" accept="image/*" onchange="changeAvatar(this)" style="display:none;"/>
      <?php endif; ?>
    </div>
    <div class="profile-header-info">
      <div class="ph-top">
        <span class="ph-name"><?= e($profile['name']) ?></span>
        <div class="verified-badge"><i data-lucide="badge-check"></i> <?= plum_user_is_verified($artist) ? 'Verified' : 'Pending verification' ?></div>
        <div class="avail-tag"><?= e(ucfirst($profile['availability'])) ?></div>
      </div>
      <div class="ph-role">
        <span><i data-lucide="<?= e($profile['category_icon']) ?>"></i> <?= e($profile['category']) ?></span>
        <span><i data-lucide="map-pin"></i> <?= e($profile['location']) ?></span>
        <span><i data-lucide="star" style="color:var(--gold);fill:var(--gold);"></i> <?= e($stats['review_count'] > 0 ? number_format((float) $stats['rating'], 1) . ' (' . $stats['review_count'] . ' reviews)' : 'New profile') ?></span>
        <span><i data-lucide="briefcase"></i> <?= e($stats['projects_done']) ?> projects</span>
      </div>
    </div>
    <div class="ph-actions">
      <?php if ($profile['is_owner']): ?><button class="btn-lime" onclick="openEditModal('profile')"><i data-lucide="edit-3"></i> Edit Profile</button><?php endif; ?>
      <a href="<?= e($bookingUrl) ?>" class="btn-primary"><i data-lucide="calendar-plus"></i> Book Now</a>
    </div>
  </div>
  <div class="profile-tabs">
    <button class="ptab active" onclick="showTab('overview',this)">Overview</button>
    <button class="ptab" onclick="showTab('portfolio',this)">Portfolio</button>
    <button class="ptab" onclick="showTab('reviews',this)">Reviews</button>
    <button class="ptab" onclick="showTab('services',this)">Services</button>
    <button class="ptab" onclick="showTab('contact',this)">Contact</button>
  </div>
</div>

<div class="profile-body">
  <div class="profile-main">
    <div class="stats-row reveal">
      <div class="stat-card"><div class="stat-icon"><i data-lucide="briefcase"></i></div><div class="stat-num" data-target="<?= e($stats['projects_done']) ?>">0</div><div class="stat-label">Projects Done</div></div>
      <div class="stat-card d1"><div class="stat-icon"><i data-lucide="star"></i></div><div class="stat-num"><?= e($stats['review_count'] > 0 ? number_format((float) $stats['rating'], 1) : 'New') ?></div><div class="stat-label">Average Rating</div></div>
      <div class="stat-card d2"><div class="stat-icon"><i data-lucide="clock"></i></div><div class="stat-num" style="font-size:1.25rem;-webkit-text-fill-color:initial;background:none;color:var(--purple);"><?= e($stats['response_time']) ?></div><div class="stat-label">Response Time</div></div>
      <div class="stat-card d3"><div class="stat-icon"><i data-lucide="repeat"></i></div><div class="stat-num" data-target="<?= e($stats['repeat_rate']) ?>" data-suffix="%">0</div><div class="stat-label">Repeat Clients</div></div>
    </div>

    <div class="card reveal" id="tab-overview">
      <div class="section-tag"><i data-lucide="user"></i> About</div>
      <div class="card-title">Profile Overview</div>
      <div class="card-sub"><?= e($profile['category']) ?> in <?= e($profile['location']) ?></div>
      <p class="about-text" id="bioText"><?= e($profile['bio']) ?></p>
      <?php if ($profile['portfolio_url'] !== ''): ?><p class="about-text"><a href="<?= e($profile['portfolio_url']) ?>" target="_blank" rel="noopener noreferrer">Visit portfolio</a></p><?php endif; ?>
      <div class="skill-chips">
        <?php foreach ($profile['skills'] as $skill): ?><span class="skill-chip"><?= e($skill) ?></span><?php endforeach; ?>
      </div>
    </div>

    <div class="card reveal" id="tab-portfolio">
      <div class="section-tag"><i data-lucide="image"></i> Portfolio</div>
      <div class="card-title">Gallery &amp; Work Samples <?php if ($profile['is_owner']): ?><button onclick="openEditModal('gallery')" style="background:none;border:none;color:var(--purple);font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:0.3rem;"><i data-lucide="plus"></i> Add Media</button><?php endif; ?></div>
      <div class="card-sub">Click any image to view full size</div>
      <div class="gallery-grid">
        <?php if ($profile['portfolio_files'] === []): ?>
          <div class="empty-state" style="grid-column:1/-1">No portfolio media has been added yet.</div>
        <?php else: foreach ($profile['portfolio_files'] as $index => $file): ?>
          <div class="gal-item" onclick="openLightbox(<?= e($index) ?>)"><img src="<?= e(pp_asset($file['path'] ?? null)) ?>" alt="<?= e((string) ($file['original_name'] ?? 'Portfolio media')) ?>"/><div class="gal-overlay"><i data-lucide="maximize-2"></i></div></div>
        <?php endforeach; endif; ?>
        <?php if ($profile['is_owner']): ?><div class="add-media-btn" onclick="openEditModal('gallery')"><i data-lucide="plus-circle"></i><span>Add Photo/Video</span></div><?php endif; ?>
      </div>
    </div>

    <div class="card reveal" id="tab-services">
      <div class="section-tag"><i data-lucide="package"></i> Services</div>
      <div class="card-title">What I Offer</div>
      <div style="display:grid;gap:0.75rem;margin-top:0.5rem;">
        <?php if ($profile['services'] === []): ?>
          <div class="empty-state">No services have been listed yet.</div>
        <?php else: foreach ($profile['services'] as $service): ?>
          <div style="display:grid;grid-template-columns:1fr auto;align-items:start;padding:1rem;border:1px solid var(--grey2);border-radius:14px;gap:1rem;transition:all 0.25s;">
            <div><div style="font-weight:700;color:var(--navy2);margin-bottom:0.3rem;"><?= e($service['name']) ?></div><div style="font-size:0.82rem;color:var(--text-muted);"><?= e($service['description'] ?: ($service['includes_details'] ?: 'Service details coming soon.')) ?></div><?php if (!empty($service['duration_hours'])): ?><div style="display:flex;gap:0.4rem;margin-top:0.6rem;"><span class="skill-chip"><?= e($service['duration_hours']) ?> hours</span></div><?php endif; ?></div>
            <div style="text-align:right;"><div style="font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:800;color:var(--purple);"><?= e(pp_money($service['price'] ?? 0)) ?></div><a href="<?= e($bookingUrl) ?>" class="btn-primary" style="margin-top:0.5rem;font-size:0.78rem;padding:0.4rem 0.9rem;">Book</a></div>
          </div>
        <?php endforeach; endif; ?>
      </div>
    </div>

    <div class="card reveal" id="tab-reviews">
      <div class="section-tag"><i data-lucide="message-square"></i> Reviews</div>
      <div class="card-title">Client Reviews <span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;"><?= e($stats['review_count']) ?> total</span></div>
      <div class="reviews-header">
        <div class="overall-rating"><div class="big-rating"><?= e($stats['review_count'] > 0 ? number_format((float) $stats['rating'], 1) : 'New') ?></div><div><div style="color:var(--gold);font-size:1.1rem;letter-spacing:2px;">&#9733;&#9733;&#9733;&#9733;&#9733;</div><div style="font-size:0.78rem;color:var(--text-muted);"><?= e($stats['review_count']) ?> reviews</div></div></div>
        <div class="rating-breakdown">
          <?php for ($rating = 5; $rating >= 1; $rating--): $count = $profile['rating_breakdown'][$rating] ?? 0; $percent = $stats['review_count'] > 0 ? (int) round(($count / $stats['review_count']) * 100) : 0; ?>
            <div class="rb-row"><?= e($rating) ?>&#9733;<div class="rb-bar"><div class="rb-fill" style="width:<?= e($percent) ?>%;"></div></div><?= e($percent) ?>%</div>
          <?php endfor; ?>
        </div>
      </div>
      <?php if ($profile['reviews'] === []): ?>
        <div class="empty-state">No reviews yet.</div>
      <?php else: foreach ($profile['reviews'] as $review): ?>
        <div class="review-card">
          <div class="rc-header">
            <?php if (!empty($review['reviewer_picture'])): ?><div class="rc-av"><img src="<?= e(pp_asset($review['reviewer_picture'])) ?>" alt=""/></div><?php else: ?><div class="rc-av fallback-av"><?= e(pp_initials((string) $review['reviewer_name'])) ?></div><?php endif; ?>
            <div><div class="rc-name"><?= e($review['reviewer_name']) ?></div><div class="rc-date"><?= e(pp_date($review['created_at'] ?? null)) ?><?= !empty($review['event_type']) ? ' - ' . e($review['event_type']) : '' ?></div></div>
            <div class="rc-stars"><?= str_repeat('&#9733;', (int) $review['rating']) ?></div>
          </div>
          <p class="rc-text"><?= e($review['comment'] ?? '') ?></p>
        </div>
      <?php endforeach; endif; ?>
    </div>
  </div>

  <aside class="booking-sidebar reveal d1">
    <div class="book-card" id="tab-contact">
      <div class="book-header"><h3>Book <?= e($profile['name']) ?></h3><p>Send a booking inquiry or request a custom quote.</p></div>
      <div class="book-body">
        <div class="price-row"><div class="price-main"><?= e(pp_money($profile['hourly_rate'])) ?></div><div class="price-sub">per hour &middot; from</div></div>
        <div class="book-detail"><span class="bd-label"><i data-lucide="clock"></i> Response time</span><span class="bd-value"><?= e($stats['response_time']) ?></span></div>
        <div class="book-detail"><span class="bd-label"><i data-lucide="map-pin"></i> Location</span><span class="bd-value"><?= e($profile['location']) ?></span></div>
        <div class="book-detail"><span class="bd-label"><i data-lucide="check-circle-2"></i> Projects done</span><span class="bd-value"><?= e($stats['projects_done']) ?></span></div>
        <div class="book-detail"><span class="bd-label"><i data-lucide="star"></i> Rating</span><span class="bd-value"><?= e($stats['review_count'] > 0 ? number_format((float) $stats['rating'], 1) . ' (' . $stats['review_count'] . ')' : 'New') ?></span></div>
        <div class="book-detail"><span class="bd-label"><i data-lucide="repeat"></i> Repeat clients</span><span class="bd-value"><?= e($stats['repeat_rate']) ?>%</span></div>
        <button class="btn-book" onclick="window.location.href='<?= e($bookingUrl) ?>'"><i data-lucide="calendar-plus"></i> Send Booking Request</button>
        <button class="btn-msg" onclick="window.location.href='<?= e($messageUrl) ?>'"><i data-lucide="message-circle"></i> Send a Message</button>
        <div class="trust-chips"><div class="trust-chip"><i data-lucide="shield-check"></i> Secure payment</div><div class="trust-chip"><i data-lucide="badge-check"></i> Verified artist</div></div>
      </div>
    </div>

    <div class="card" style="margin-top:1.5rem;">
      <div class="card-title" style="margin-bottom:1rem;">Similar Artists</div>
      <?php if ($profile['similar_artists'] === []): ?>
        <div class="empty-state">More artists will appear here as the marketplace grows.</div>
      <?php else: foreach ($profile['similar_artists'] as $similar): ?>
        <a href="artist-profile.php?artist=<?= e($similar['uuid']) ?>" class="similar-card">
          <?php if (!empty($similar['profile_picture'])): ?><div class="sim-av"><img src="<?= e(pp_asset($similar['profile_picture'])) ?>" alt=""/></div><?php else: ?><div class="sim-av fallback-av"><?= e(pp_initials((string) $similar['name'])) ?></div><?php endif; ?>
          <div><div class="sim-name"><?= e($similar['name']) ?></div><div class="sim-role"><?= e($similar['category']) ?> &middot; <?= e($similar['location'] ?: 'Zambia') ?></div></div>
          <div class="sim-rate"><?= e(pp_money($similar['hourly_rate'] ?? 0)) ?>/hr</div>
        </a>
      <?php endforeach; endif; ?>
    </div>
  </aside>
</div>

<div class="modal-overlay" id="editModal" onclick="if(event.target===this)closeEditModal()">
  <div class="modal">
    <div class="modal-header"><div class="modal-title" id="modalTitle">Edit Profile</div><button class="modal-close" onclick="closeEditModal()"><i data-lucide="x"></i></button></div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-footer"><button class="btn-cancel" onclick="closeEditModal()">Cancel</button><button class="btn-save" onclick="saveProfile()">Save Changes</button></div>
  </div>
</div>

<div id="lightbox" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:300;align-items:center;justify-content:center;" onclick="document.getElementById('lightbox').style.display='none'">
  <img id="lightboxImg" style="max-width:90%;max-height:90%;border-radius:12px;object-fit:contain;" src="" alt=""/>
  <button style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:40px;height:40px;color:#fff;cursor:pointer;font-size:1.2rem;" onclick="document.getElementById('lightbox').style.display='none'">x</button>
</div>

<footer>
  <div class="footer-inner">
    <a class="nav-logo-wrap footer-logo" href="index.html" aria-label="<?= e($settings['app_name']) ?> home"><img class="logo-img" src="<?= e(pp_asset($settings['app_logo_path'] ?? null)) ?>" alt="<?= e($settings['app_name']) ?> logo"/><div class="nav-wordmark"><?= e($settings['app_name']) ?></div></a>
    <div class="footer-links"><a href="browse.html">Browse</a><a href="login.php">Sign In</a><a href="adash.php">Artist Desk</a><a href="organizer-dashboard.html">Organizer Desk</a><a href="#">Help</a></div>
  </div>
  <div class="footer-inner" style="margin-bottom:0;"><div class="footer-copy">&copy; 2026 <?= e($settings['app_name']) ?> - The Sweet Spot for Bookings.</div></div>
</footer>

<script>window.PlumArtistProfile = <?= $jsPayload ?: '{}' ?>;</script>
<script src="js/artist-profile.js"></script>
</body>
</html>
