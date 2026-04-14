<?php
require_once __DIR__ . '/includes/config.php';
$settings = plum_app_settings();
plum_enforce_maintenance();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Sign In - <?= e($settings['app_name']) ?></title>
<meta name="description" content="Sign in or create your <?= e($settings['app_name']) ?> account. Join Zambia's leading creative booking marketplace."/>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🟣</text></svg>"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="css/login.css"/>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="bg-blob b1"></div><div class="bg-blob b2"></div><div class="bg-blob b3"></div>

<!-- NAV -->
<nav>
  <a class="nav-logo-wrap" href="index.html" aria-label="PLUM home">
    <?php if (!empty($settings['app_logo_path'])): ?>
      <img src="<?= e($settings['app_logo_path']) ?>" alt="<?= e($settings['app_name']) ?> logo" style="height:40px;width:auto;object-fit:contain;"/>
    <?php else: ?>
    <div class="plum-icon">
      <div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div>
    </div>
    <?php endif; ?>
    <div class="nav-wordmark"><?= e($settings['app_name']) ?></div>
  </a>
  <a href="browse.html" class="nav-link"><i data-lucide="arrow-left"></i> Back to Browse</a>
</nav>

<div class="page-wrap">
  <div class="auth-grid">
    <!-- VISUAL -->
    <div class="auth-visual">
      <div class="av-orbs"><div class="orb orb1"></div><div class="orb orb2"></div></div>
      <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80&auto=format&fit=crop" alt=""/>
      <div class="av-content">
        <div class="av-tag"><i data-lucide="zap"></i> Sweet Spot for Bookings</div>
        <h2>Zambia's Creative<br>Platform Awaits You</h2>
        <p>Join thousands of verified creatives and event organizers already earning and booking on Plum.</p>
        <div class="av-stats">
          <div class="av-stat"><div class="num">5,240+</div><div class="lbl">Creatives</div></div>
          <div class="av-stat"><div class="num">14k+</div><div class="lbl">Projects</div></div>
          <div class="av-stat"><div class="num">98%</div><div class="lbl">Satisfaction</div></div>
        </div>
      </div>
    </div>

    <!-- FORM PANEL -->
    <div class="auth-form-panel">
      <div class="auth-tabs">
        <button class="auth-tab active" onclick="switchTab('signin')" id="tab-signin">Sign In</button>
        <button class="auth-tab" onclick="switchTab('register')" id="tab-register">Create Account</button>
        <button class="auth-tab" onclick="switchTab('admin')" id="tab-admin">Admin</button>
      </div>

      <!-- SIGN IN -->
      <div class="auth-view active" id="view-signin">
        <h2 class="auth-title">Welcome back</h2>
        <p class="auth-sub">Sign in to your <?= e($settings['app_name']) ?> workspace.</p>
        <div class="form-stack">
          <div>
            <label class="field-label">Email address</label>
            <input type="email" class="field-input" id="signin-email" placeholder="you@example.com"/>
          </div>
          <div>
            <label class="field-label">Password</label>
            <div class="password-wrap">
              <input type="password" class="field-input" id="signin-pass" placeholder="Your password"/>
              <button class="pw-toggle" onclick="togglePw('signin-pass',this)" type="button"><i data-lucide="eye"></i></button>
            </div>
          </div>
          <div>
            <label class="field-label">Continue as</label>
            <select class="field-input" id="signin-role">
              <option value="adash.php">Artist</option>
              <option value="organizer-dashboard.html">Event Organizer</option>
            </select>
          </div>
          <button class="btn-submit" onclick="handleSignin()"><i data-lucide="log-in"></i> Enter Workspace</button>
        </div>
        <div class="or-divider">or continue with</div>
        <div class="social-btns">
          <button class="social-btn"><svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google</button>
          <button class="social-btn"><svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook</button>
        </div>
        <div class="auth-footer-links">
          <a href="forgot-password.php">Forgot password?</a>
          <a href="#" onclick="switchTab('register');return false;" class="accent">Create account →</a>
        </div>
      </div>

      <!-- REGISTER (multi-step) -->
      <div class="auth-view" id="view-register">
        <div class="steps-indicator" id="regSteps">
          <div class="step-dot active" id="sd1"></div>
          <div class="step-dot" id="sd2"></div>
          <div class="step-dot" id="sd3"></div>
          <div class="step-dot" id="sd4"></div>
        </div>

        <!-- STEP 1: Account Type -->
        <div id="reg-step-1">
          <h2 class="auth-title">Create your space</h2>
          <p class="auth-sub">Choose your account type to get started.</p>
          <div class="step-label">Step <strong>1</strong> of 4 — Account type</div>
          <div class="role-select" id="roleSelector">
            <div class="role-opt active" onclick="selectRole('artist',this)">
              <div class="role-icon" style="background:var(--purple-pale);"><i data-lucide="mic-2"></i></div>
              <div class="role-name">Creative / Artist</div>
              <div class="role-sub">Showcase &amp; get booked</div>
            </div>
            <div class="role-opt" onclick="selectRole('organizer',this)">
              <div class="role-icon" style="background:#FFF7E0;"><i data-lucide="calendar-check" style="color:var(--gold);"></i></div>
              <div class="role-name">Event Organizer</div>
              <div class="role-sub">Find &amp; hire talent</div>
            </div>
          </div>
          <div style="height:0.8rem;"></div>
          <div class="form-stack">
            <div class="field-row">
              <div><label class="field-label">First Name</label><input type="text" class="field-input" id="reg-fname" placeholder="First name"/></div>
              <div><label class="field-label">Last Name</label><input type="text" class="field-input" id="reg-lname" placeholder="Last name"/></div>
            </div>
            <div><label class="field-label">Email</label><input type="email" class="field-input" id="reg-email" placeholder="your@email.com"/></div>
            <div><label class="field-label">Password</label><div class="password-wrap"><input type="password" class="field-input" id="reg-pass" placeholder="Create a strong password"/><button class="pw-toggle" onclick="togglePw('reg-pass',this)" type="button"><i data-lucide="eye"></i></button></div></div>
            <button class="btn-submit" onclick="goStep(2)"><i data-lucide="arrow-right"></i> Continue</button>
          </div>
          <div class="auth-footer-links"><a href="#" onclick="switchTab('signin');return false;" class="accent">← Already have an account?</a></div>
        </div>

        <!-- STEP 2: Profile Info -->
        <div id="reg-step-2" style="display:none;">
          <h2 class="auth-title">Build your profile</h2>
          <div class="step-label">Step <strong>2</strong> of 4 — Profile details</div>
          <div class="form-stack">
            <div>
              <label class="field-label">Profile Photo</label>
              <div class="avatar-upload">
                <div class="av-circle" onclick="document.getElementById('avatarFile').click()">
                  <img id="avatarPreview" src="" alt=""/>
                  <i data-lucide="camera"></i>
                </div>
                <input type="file" id="avatarFile" accept="image/*" onchange="previewAvatar(this)"/>
                <div class="av-upload-hint">Upload a professional photo<br><strong onclick="document.getElementById('avatarFile').click()">Browse files</strong> or drag &amp; drop</div>
              </div>
            </div>
            <div><label class="field-label" id="nameFieldLabel">Stage Name / Display Name</label><input type="text" class="field-input" id="reg-displayname" placeholder="Your professional name"/></div>
            <div><label class="field-label">City / Location</label>
              <select class="field-input" id="reg-city"><option value="">Select city</option><option>Lusaka</option><option>Ndola</option><option>Kitwe</option><option>Livingstone</option><option>Kabwe</option><option>Chipata</option><option>Other</option></select>
            </div>
            <div><label class="field-label">Phone Number</label><input type="tel" class="field-input" id="reg-phone" placeholder="+260 97 XXX XXXX"/></div>
            <div id="artistFields">
              <label class="field-label">Primary Category</label>
              <select class="field-input" id="reg-category">
                <option value="">Select your main category</option>
                <option>Photography</option><option>Music</option><option>Film &amp; Video</option><option>Graphic Design</option><option>Fashion</option><option>Dance &amp; Performance</option><option>Writing</option><option>Visual Art</option><option>DJ</option><option>Other</option>
              </select>
            </div>
            <div id="organizerFields" style="display:none;">
              <label class="field-label">Company / Organisation Name</label>
              <input type="text" class="field-input" id="reg-company" placeholder="Company or organisation name"/>
            </div>
            <button class="btn-submit" onclick="goStep(3)"><i data-lucide="arrow-right"></i> Continue</button>
            <button onclick="goStep(1)" type="button" style="background:none;border:none;color:var(--text-muted);font-family:inherit;font-size:0.85rem;cursor:pointer;">← Back</button>
          </div>
        </div>

        <!-- STEP 3: About & Rates -->
        <div id="reg-step-3" style="display:none;">
          <h2 class="auth-title">Tell your story</h2>
          <div class="step-label">Step <strong>3</strong> of 4 — Bio &amp; rates</div>
          <div class="form-stack">
            <div><label class="field-label">Bio / About You</label><textarea class="field-input" id="reg-bio" rows="4" placeholder="Describe yourself, your work and what makes you unique..." style="resize:vertical;"></textarea></div>
            <div id="artistRateFields">
              <label class="field-label">Starting Rate (K)</label>
              <input type="number" class="field-input" id="reg-rate" placeholder="e.g. 1500"/>
            </div>
            <div><label class="field-label">Skills / Specialties</label>
              <div class="tags-input-wrap" id="tagsWrap" onclick="document.getElementById('tagsInput').focus()">
                <input type="text" id="tagsInput" placeholder="Type a skill and press Enter..." onkeydown="addTag(event)"/>
              </div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.3rem;">Press Enter to add each tag</div>
            </div>
            <div><label class="field-label">Portfolio Link <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label><input type="url" class="field-input" id="reg-portfolio" placeholder="https://yourwebsite.com"/></div>
            <div><label class="field-label">Social Media <span style="color:var(--text-muted);font-weight:400;">(optional)</span></label><input type="url" class="field-input" id="reg-social" placeholder="Instagram / Facebook URL"/></div>
            <button class="btn-submit" onclick="goStep(4)"><i data-lucide="arrow-right"></i> Continue</button>
            <button onclick="goStep(2)" type="button" style="background:none;border:none;color:var(--text-muted);font-family:inherit;font-size:0.85rem;cursor:pointer;">← Back</button>
          </div>
        </div>

        <!-- STEP 4: Plan -->
        <div id="reg-step-4" style="display:none;">
          <h2 class="auth-title">Choose your plan</h2>
          <div class="step-label">Step <strong>4</strong> of 4 — Get started free</div>
          <div class="plan-cards">
            <div class="plan-card active" onclick="selectPlan(this)">
              <div class="plan-name">Launch</div>
              <div class="plan-price">Free <span>/forever</span></div>
              <div style="margin-top:0.6rem;">
                <div class="check-row"><i data-lucide="check"></i>Basic profile</div>
                <div class="check-row"><i data-lucide="check"></i>5 bookings/mo</div>
                <div class="check-row"><i data-lucide="check"></i>Marketplace listing</div>
              </div>
            </div>
            <div class="plan-card" onclick="selectPlan(this)">
              <div class="plan-name">Spotlight</div>
              <div class="plan-price">K299 <span>/mo</span></div>
              <div style="margin-top:0.6rem;">
                <div class="check-row"><i data-lucide="check"></i>Featured placement</div>
                <div class="check-row"><i data-lucide="check"></i>Unlimited bookings</div>
                <div class="check-row"><i data-lucide="check"></i>Analytics dashboard</div>
              </div>
            </div>
            <div class="plan-card" onclick="selectPlan(this)">
              <div class="plan-name">Agency</div>
              <div class="plan-price">K799 <span>/mo</span></div>
              <div style="margin-top:0.6rem;">
                <div class="check-row"><i data-lucide="check"></i>Priority support</div>
                <div class="check-row"><i data-lucide="check"></i>Team accounts</div>
                <div class="check-row"><i data-lucide="check"></i>Custom branding</div>
              </div>
            </div>
          </div>
          <div style="height:1rem;"></div>
          <button class="btn-submit" onclick="completeRegistration()"><i data-lucide="check-circle-2"></i> Complete Registration</button>
          <button onclick="goStep(3)" type="button" style="background:none;border:none;color:var(--text-muted);font-family:inherit;font-size:0.85rem;cursor:pointer;margin-top:0.5rem;display:block;width:100%;text-align:center;">← Back</button>
        </div>
      </div>

      <!-- ADMIN -->
      <div class="auth-view" id="view-admin">
        <h2 class="auth-title">Admin Access</h2>
        <p class="auth-sub">Platform operations and moderation.</p>
        <div class="form-stack">
          <div><label class="field-label">Admin Email</label><input type="email" class="field-input" placeholder="admin@plum.zm"/></div>
          <div><label class="field-label">Password</label><div class="password-wrap"><input type="password" class="field-input" id="admin-pass" placeholder="Secure password"/><button class="pw-toggle" onclick="togglePw('admin-pass',this)" type="button"><i data-lucide="eye"></i></button></div></div>
          <div><label class="field-label">Admin Key</label><input type="text" class="field-input" placeholder="Admin access key"/></div>
          <button class="btn-submit" onclick="location.href='admin.html'" style="background:var(--navy2);"><i data-lucide="shield"></i> Open Admin Panel</button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
window.PlumBackend = {
  csrf: "<?= e(plum_csrf_token()) ?>",
  appName: "<?= e($settings['app_name']) ?>",
  endpoints: {
    login: "ajax/auth/login.php",
    register: "ajax/auth/register.php"
  }
};
</script>
<script src="js/login.js"></script>
<script src="js/backend-auth.js"></script>
</body>
</html>
