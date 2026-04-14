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
<title>Forgot Password - <?= e($settings['app_name']) ?></title>
<meta name="description" content="Reset your <?= e($settings['app_name']) ?> account password. Enter your email to receive a secure reset link."/>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🟣</text></svg>"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="css/login.css"/>
<style>
.forgot-wrap {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 2rem 1.5rem;
  position: relative; z-index: 1;
}
.forgot-card {
  background: rgba(28,28,46,0.9); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px; padding: 2.5rem 2.5rem;
  width: 100%; max-width: 460px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.4);
}
.forgot-icon {
  width: 70px; height: 70px; border-radius: 20px;
  background: linear-gradient(135deg, rgba(139,31,200,0.3), rgba(184,217,0,0.15));
  border: 1px solid rgba(139,31,200,0.3);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem; animation: float 3s ease-in-out infinite;
}
.forgot-icon i { width: 32px; height: 32px; color: var(--purple-lt, #B46EE8); }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.success-banner {
  display: none; text-align: center; padding: 1.5rem;
}
.success-banner .success-icon-wrap {
  width: 70px; height: 70px; border-radius: 50%;
  background: linear-gradient(135deg, #8B1FC8, #B8D900);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem; animation: popIn 0.5s ease;
}
.success-banner .success-icon-wrap i { width: 36px; height: 36px; color: #fff; }
@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="bg-blob b1"></div><div class="bg-blob b2"></div><div class="bg-blob b3"></div>

<nav>
  <a class="nav-logo-wrap" href="index.html">
    <?php if (!empty($settings['app_logo_path'])): ?>
      <img src="<?= e($settings['app_logo_path']) ?>" alt="<?= e($settings['app_name']) ?> logo" style="height:40px;width:auto;object-fit:contain;"/>
    <?php else: ?>
      <div class="plum-icon"><div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div><div class="plum-bar"></div></div>
    <?php endif; ?>
    <div class="nav-wordmark"><?= e($settings['app_name']) ?></div>
  </a>
  <a href="login.php" class="nav-link"><i data-lucide="arrow-left"></i> Back to Sign In</a>
</nav>

<div class="forgot-wrap">
  <div class="forgot-card">

    <!-- FORM STATE -->
    <div id="formState">
      <div class="forgot-icon"><i data-lucide="key-round"></i></div>
      <h2 class="auth-title" style="text-align:center;">Forgot your password?</h2>
      <p class="auth-sub" style="text-align:center;margin-bottom:1.75rem;">No worries. Enter your email and we'll send you a secure reset link.</p>

      <div class="form-stack">
        <div>
          <label class="field-label">Email address</label>
          <div class="password-wrap">
            <input type="email" class="field-input" id="resetEmail" placeholder="your@email.com" style="padding-left:2.5rem;"/>
            <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.3);pointer-events:none;"><i data-lucide="mail" style="width:16px;height:16px;"></i></span>
          </div>
        </div>
        <button class="btn-submit" id="sendResetBtn" onclick="sendReset()">
          <i data-lucide="send"></i> Send Reset Link
        </button>
      </div>
      <div class="auth-footer-links" style="text-align:center;margin-top:1.5rem;">
        <a href="login.php" class="accent">← Remember your password? Sign In</a>
      </div>
    </div>

    <!-- SUCCESS STATE -->
    <div id="successState" class="success-banner">
      <div class="success-icon-wrap"><i data-lucide="check"></i></div>
      <h2 class="auth-title">Check your inbox!</h2>
      <p class="auth-sub" style="margin-bottom:1.5rem;">We've sent a password reset link to <strong id="sentEmail" style="color:#B46EE8;"></strong>. Check your spam folder if you don't see it.</p>
      <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:1rem;font-size:0.8rem;color:rgba(255,255,255,0.5);margin-bottom:1.5rem;">
        <i data-lucide="clock" style="width:13px;height:13px;vertical-align:-2px;"></i>
        The link expires in <strong style="color:rgba(255,255,255,0.8)">15 minutes</strong>.
      </div>
      <button class="btn-submit" onclick="resendReset()" style="background:rgba(255,255,255,0.08);color:#fff;">
        <i data-lucide="refresh-cw"></i> Resend Link
      </button>
      <div style="margin-top:1rem;"><a href="login.php" class="accent" style="font-size:0.82rem;">← Back to Sign In</a></div>
    </div>

  </div>
</div>

<script>
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => { cursor.style.transform = `translate(${e.clientX-8}px,${e.clientY-8}px)`; });

function sendReset() {
  const email = document.getElementById('resetEmail').value.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('resetEmail').focus();
    document.getElementById('resetEmail').style.borderColor = 'rgba(232,64,64,0.8)';
    setTimeout(() => document.getElementById('resetEmail').style.borderColor = '', 2000);
    return;
  }
  const btn = document.getElementById('sendResetBtn');
  btn.innerHTML = '<i data-lucide="loader-2"></i> Sending...';
  btn.disabled = true;
  lucide.createIcons();
  setTimeout(() => {
    document.getElementById('sentEmail').textContent = email;
    document.getElementById('formState').style.display = 'none';
    document.getElementById('successState').style.display = 'block';
    lucide.createIcons();
  }, 1500);
}

function resendReset() {
  const btn = event.target.closest('button');
  btn.innerHTML = '<i data-lucide="check"></i> Sent!';
  btn.disabled = true;
  lucide.createIcons();
  setTimeout(() => { btn.innerHTML = '<i data-lucide="refresh-cw"></i> Resend Link'; btn.disabled = false; lucide.createIcons(); }, 3000);
}

lucide.createIcons();
</script>
<script>
window.PlumBackend = {
  csrf: "<?= e(plum_csrf_token()) ?>",
  endpoints: {
    forgotPassword: "ajax/auth/forgot-password.php"
  }
};
</script>
<script src="js/backend-auth.js"></script>
</body>
</html>
