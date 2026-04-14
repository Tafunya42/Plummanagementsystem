<?php
require_once __DIR__ . '/includes/config.php';
$settings = plum_app_settings();
$resetToken = trim((string) ($_GET['token'] ?? ''));
plum_enforce_maintenance();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Reset Password - <?= e($settings['app_name']) ?></title>
<meta name="description" content="Create a new secure password for your <?= e($settings['app_name']) ?> account."/>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🟣</text></svg>"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="css/login.css"/>
<style>
.reset-wrap { min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.5rem;position:relative;z-index:1; }
.reset-card { background:rgba(28,28,46,0.9);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:2.5rem;width:100%;max-width:460px;backdrop-filter:blur(20px);box-shadow:0 32px 80px rgba(0,0,0,0.4); }
.reset-icon { width:70px;height:70px;border-radius:20px;background:linear-gradient(135deg,rgba(139,31,200,0.3),rgba(184,217,0,0.15));border:1px solid rgba(139,31,200,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem; }
.reset-icon i { width:32px;height:32px;color:#B46EE8; }
.strength-bar { height:6px;border-radius:3px;background:rgba(255,255,255,0.08);margin-top:0.5rem;overflow:hidden; }
.strength-fill { height:100%;border-radius:3px;transition:width 0.3s,background 0.3s;width:0; }
.strength-label { font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:0.3rem;transition:color 0.3s; }
.req-list { display:flex;flex-direction:column;gap:0.25rem;margin-top:0.75rem;padding:0.75rem;background:rgba(255,255,255,0.03);border-radius:10px; }
.req-item { display:flex;align-items:center;gap:0.4rem;font-size:0.73rem;color:rgba(255,255,255,0.4);transition:color 0.3s; }
.req-item i { width:12px;height:12px; }
.req-item.ok { color:rgba(184,217,0,0.9); }
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

<div class="reset-wrap">
  <div class="reset-card" id="formCard">
    <div class="reset-icon"><i data-lucide="lock"></i></div>
    <h2 class="auth-title" style="text-align:center;">Create new password</h2>
    <p class="auth-sub" style="text-align:center;margin-bottom:1.75rem;">Choose a strong password for your Plum account.</p>

    <div class="form-stack">
      <div>
        <label class="field-label">New Password</label>
        <div class="password-wrap">
          <input type="password" class="field-input" id="newPass" placeholder="Create a strong password" oninput="checkStrength(this.value)"/>
          <button class="pw-toggle" onclick="togglePw('newPass',this)" type="button"><i data-lucide="eye"></i></button>
        </div>
        <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
        <div class="strength-label" id="strengthLabel">Enter a password</div>
        <div class="req-list">
          <div class="req-item" id="req-len"><i data-lucide="circle"></i> At least 8 characters</div>
          <div class="req-item" id="req-upper"><i data-lucide="circle"></i> One uppercase letter</div>
          <div class="req-item" id="req-num"><i data-lucide="circle"></i> One number</div>
          <div class="req-item" id="req-sym"><i data-lucide="circle"></i> One special character</div>
        </div>
      </div>
      <div>
        <label class="field-label">Confirm Password</label>
        <div class="password-wrap">
          <input type="password" class="field-input" id="confPass" placeholder="Repeat your password" oninput="checkMatch()"/>
          <button class="pw-toggle" onclick="togglePw('confPass',this)" type="button"><i data-lucide="eye"></i></button>
        </div>
        <div class="strength-label" id="matchLabel"></div>
      </div>
      <button class="btn-submit" id="resetBtn" onclick="doReset()"><i data-lucide="check-circle-2"></i> Reset Password</button>
    </div>
  </div>

  <div id="successCard" style="display:none;" class="reset-card" style="text-align:center;">
    <div style="text-align:center;">
      <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#8B1FC8,#B8D900);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;animation:popIn 0.5s ease;"><i data-lucide="check" style="width:36px;height:36px;color:#fff;"></i></div>
      <h2 class="auth-title">Password Updated!</h2>
      <p class="auth-sub" style="margin-bottom:2rem;">Your password has been successfully changed. You can now sign in with your new credentials.</p>
      <a href="login.php" class="btn-submit" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:0.5rem;"><i data-lucide="log-in"></i> Sign In Now</a>
    </div>
  </div>
</div>

<script>
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => { cursor.style.transform = `translate(${e.clientX-8}px,${e.clientY-8}px)`; });

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.innerHTML = isText ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
  lucide.createIcons();
}

function checkStrength(val) {
  const checks = {
    len: val.length >= 8,
    upper: /[A-Z]/.test(val),
    num: /[0-9]/.test(val),
    sym: /[^A-Za-z0-9]/.test(val),
  };
  for (const [k,v] of Object.entries(checks)) {
    const el = document.getElementById('req-'+k);
    el.classList.toggle('ok', v);
    el.querySelector('i').setAttribute('data-lucide', v ? 'check-circle' : 'circle');
  }
  lucide.createIcons();
  const score = Object.values(checks).filter(Boolean).length;
  const colors = ['#E84040','#E84040','#F5B800','#B8D900','#B8D900'];
  const labels = ['','Weak','Fair','Good','Strong'];
  const fill = document.getElementById('strengthFill');
  fill.style.width = (score * 25) + '%';
  fill.style.background = colors[score];
  document.getElementById('strengthLabel').textContent = labels[score] || '';
  document.getElementById('strengthLabel').style.color = colors[score];
}

function checkMatch() {
  const p1 = document.getElementById('newPass').value;
  const p2 = document.getElementById('confPass').value;
  const lbl = document.getElementById('matchLabel');
  if (!p2) { lbl.textContent = ''; return; }
  if (p1 === p2) { lbl.textContent = '✓ Passwords match'; lbl.style.color = '#B8D900'; }
  else { lbl.textContent = '✗ Passwords do not match'; lbl.style.color = '#E84040'; }
}

function doReset() {
  const p1 = document.getElementById('newPass').value;
  const p2 = document.getElementById('confPass').value;
  if (p1.length < 8) return;
  if (p1 !== p2) { document.getElementById('confPass').focus(); return; }
  const btn = document.getElementById('resetBtn');
  btn.innerHTML = '<i data-lucide="loader-2"></i> Saving...';
  btn.disabled = true;
  lucide.createIcons();
  setTimeout(() => {
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'block';
    lucide.createIcons();
  }, 1500);
}
lucide.createIcons();
</script>
<script>
window.PlumBackend = {
  csrf: "<?= e(plum_csrf_token()) ?>",
  resetToken: "<?= e($resetToken) ?>",
  endpoints: {
    resetPassword: "ajax/auth/reset-password.php"
  }
};
</script>
<script src="js/backend-auth.js"></script>
</body>
</html>
