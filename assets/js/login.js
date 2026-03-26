/**
 * Login Form Handler
 * Handles AJAX form submission for login
 */




// Role switching
let currentRole = 'client';

function switchRole(role) {
  currentRole = role;
  // Update tabs
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + role).classList.add('active');
  // Update info boxes
  document.querySelectorAll('.role-info-box').forEach(b => b.style.display = 'none');
  document.getElementById('info-' + role).style.display = 'block';
  // Update forms
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + role).classList.add('active');
}

// Admin reveal (triple-click logo or typing 'admin')
let logoClickCount = 0, logoClickTimer;
document.getElementById('logoReveal').addEventListener('click', function () {
  logoClickCount++;
  clearTimeout(logoClickTimer);
  if (logoClickCount >= 3) {
    revealAdmin();
    logoClickCount = 0;
  } else {
    logoClickTimer = setTimeout(() => logoClickCount = 0, 700);
  }
});

let keyBuffer = '';
document.addEventListener('keydown', function (e) {
  if (document.activeElement.tagName === 'INPUT') return;
  keyBuffer += e.key.toLowerCase();
  if (keyBuffer.length > 5) keyBuffer = keyBuffer.slice(-5);
  if (keyBuffer === 'admin') revealAdmin();
});

document.getElementById('adminHint').addEventListener('click', revealAdmin);

function revealAdmin() {
  const adminTab = document.getElementById('tab-admin');
  if (adminTab.style.display !== 'none') {
    // already visible, just switch
    switchRole('admin');
    return;
  }
  adminTab.style.display = 'flex';
  adminTab.style.opacity = '0';
  adminTab.style.transform = 'scale(0.9)';
  setTimeout(() => {
    adminTab.style.transition = 'all 0.3s ease';
    adminTab.style.opacity = '1';
    adminTab.style.transform = 'scale(1)';
  }, 10);
  showToast('Admin portal accessed. All activity is monitored.', 'error');
  setTimeout(() => switchRole('admin'), 600);
}

// Password toggle
function togglePassword(inputId, btn) {
  const inp = document.getElementById(inputId);
  const type = inp.type === 'password' ? 'text' : 'password';
  inp.type = type;
  btn.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
}

// Field validation helpers
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function setError(id, show, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (msg) el.textContent = msg;
  el.classList.toggle('show', show);
}

// Login handler
function handleLogin(role) {
  let valid = true;
  let email = '';
  let password = '';

  if (role === 'client') {
    email = document.getElementById('c-email').value.trim();
    password = document.getElementById('c-password').value;
    if (!validateEmail(email)) { setError('c-email-err', true); valid = false; document.getElementById('c-email').classList.add('error'); } else { setError('c-email-err', false); document.getElementById('c-email').classList.remove('error'); }
    if (!password) { setError('c-pw-err', true); valid = false; document.getElementById('c-password').classList.add('error'); } else { setError('c-pw-err', false); document.getElementById('c-password').classList.remove('error'); }
  }
  else if (role === 'artist') {
    email = document.getElementById('a-email').value.trim();
    password = document.getElementById('a-password').value;
    if (!validateEmail(email)) { setError('a-email-err', true); valid = false; document.getElementById('a-email').classList.add('error'); } else { setError('a-email-err', false); document.getElementById('a-email').classList.remove('error'); }
    if (!password) { setError('a-pw-err', true); valid = false; document.getElementById('a-password').classList.add('error'); } else { setError('a-pw-err', false); document.getElementById('a-password').classList.remove('error'); }
  }
  else if (role === 'admin') {
    const user = document.getElementById('ad-user').value.trim();
    const pw = document.getElementById('ad-password').value;
    const tfa = document.getElementById('ad-2fa').value.trim();
    if (!user) { setError('ad-user-err', true); valid = false; document.getElementById('ad-user').classList.add('error'); } else { setError('ad-user-err', false); document.getElementById('ad-user').classList.remove('error'); }
    if (!pw) { setError('ad-pw-err', true); valid = false; document.getElementById('ad-password').classList.add('error'); } else { setError('ad-pw-err', false); document.getElementById('ad-password').classList.remove('error'); }
    if (!tfa || tfa.length < 6) { setError('ad-2fa-err', true, '6‑digit code required'); valid = false; document.getElementById('ad-2fa').classList.add('error'); } else { setError('ad-2fa-err', false); document.getElementById('ad-2fa').classList.remove('error'); }
    if (!valid) return;
    simulateLogin('admin', 'dashboard-admin.html');
    return;
  }

  if (!valid) return;

  // Call API to login
  performLogin(role, email, password);
}

function performLogin(role, email, password) {
  const btn = document.querySelector(`#panel-${role} .btn-submit`);
  btn.classList.add('loading');
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing in…`;

  fetch('api/auth/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email: email, password: password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`✓ Welcome back! Redirecting to your ${role} dashboard.`, 'success');
        const redirect = role === 'artist' ? 'dashboard-artist.html' : 'dashboard-client.html';
        setTimeout(() => { window.location.href = redirect; }, 1200);
      } else {
        setError(`${role}-email-err`, true, data.message || 'Invalid credentials');
        btn.classList.remove('loading');
        btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
        showToast('✗ Login failed: ' + (data.message || 'Invalid email or password'), 'error');
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      showToast('✗ Connection error. Please try again.', 'error');
      btn.classList.remove('loading');
      btn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    });
}

function simulateLogin(role, redirect) {
  const btn = document.querySelector(`#panel-${role} .btn-submit`);
  const originalHTML = btn.innerHTML;
  btn.classList.add('loading');
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing in…`;

  setTimeout(() => {
    showToast(`✓ Welcome back! Redirecting to your ${role} dashboard.`, 'success');
    setTimeout(() => { window.location.href = redirect; }, 1200);
  }, 1500);
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3800);
}

// Clear errors on input
document.querySelectorAll('.input-field').forEach(inp => {
  inp.addEventListener('input', function () {
    this.classList.remove('error');
    const errorId = this.closest('.field-group')?.querySelector('.field-error')?.id;
    if (errorId) setError(errorId, false);
  });
});

// 2FA numeric only
const tfaInput = document.getElementById('ad-2fa');
if (tfaInput) {
  tfaInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
  });
}





document.addEventListener('DOMContentLoaded', function () {
  // Get form elements
  const clientForm = document.getElementById('panel-client');
  const artistForm = document.getElementById('panel-artist');
  const adminForm = document.getElementById('panel-admin');

  // Add event listeners to forms
  if (clientForm) {
    const clientBtn = clientForm.querySelector('.btn-submit');
    if (clientBtn) {
      clientBtn.onclick = function (e) {
        e.preventDefault();
        handleLogin('client');
      };
    }

    // Add enter key support
    addEnterKeySupport(clientForm, 'client');
  }

  if (artistForm) {
    const artistBtn = artistForm.querySelector('.btn-submit');
    if (artistBtn) {
      artistBtn.onclick = function (e) {
        e.preventDefault();
        handleLogin('artist');
      };
    }

    addEnterKeySupport(artistForm, 'artist');
  }

  if (adminForm) {
    const adminBtn = adminForm.querySelector('.btn-submit');
    if (adminBtn) {
      adminBtn.onclick = function (e) {
        e.preventDefault();
        handleLogin('admin');
      };
    }

    addEnterKeySupport(adminForm, 'admin');
  }

  // Clear errors on input
  document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('input', function () {
      this.classList.remove('error');
      const errorElement = this.closest('.field-group')?.querySelector('.field-error');
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    });
  });

  // 2FA numeric only
  const tfaInput = document.getElementById('ad-2fa');
  if (tfaInput) {
    tfaInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
  }
});

/**
 * Handle login for different user types
 */
function handleLogin(role) {
  let email = '';
  let password = '';
  let remember = false;
  let valid = true;

  if (role === 'client') {
    email = document.getElementById('c-email').value.trim();
    password = document.getElementById('c-password').value;
    remember = document.getElementById('c-remember')?.checked || false;

    // Validate email
    if (!validateEmail(email)) {
      showFieldError('c-email-err', 'Please enter a valid email');
      document.getElementById('c-email').classList.add('error');
      valid = false;
    } else {
      clearFieldError('c-email-err');
      document.getElementById('c-email').classList.remove('error');
    }

    // Validate password
    if (!password) {
      showFieldError('c-pw-err', 'Please enter your password');
      document.getElementById('c-password').classList.add('error');
      valid = false;
    } else {
      clearFieldError('c-pw-err');
      document.getElementById('c-password').classList.remove('error');
    }

    if (!valid) return;

  } else if (role === 'artist') {
    email = document.getElementById('a-email').value.trim();
    password = document.getElementById('a-password').value;
    remember = document.getElementById('a-remember')?.checked || false;

    // Validate email
    if (!validateEmail(email)) {
      showFieldError('a-email-err', 'Please enter a valid email');
      document.getElementById('a-email').classList.add('error');
      valid = false;
    } else {
      clearFieldError('a-email-err');
      document.getElementById('a-email').classList.remove('error');
    }

    // Validate password
    if (!password) {
      showFieldError('a-pw-err', 'Please enter your password');
      document.getElementById('a-password').classList.add('error');
      valid = false;
    } else {
      clearFieldError('a-pw-err');
      document.getElementById('a-password').classList.remove('error');
    }

    if (!valid) return;

  } else if (role === 'admin') {
    // Special admin login - this would need separate backend handling
    const username = document.getElementById('ad-user')?.value.trim();
    const adminPassword = document.getElementById('ad-password')?.value;
    const tfaCode = document.getElementById('ad-2fa')?.value.trim();

    if (!username) {
      showFieldError('ad-user-err', 'Username required');
      document.getElementById('ad-user').classList.add('error');
      valid = false;
    } else {
      clearFieldError('ad-user-err');
      document.getElementById('ad-user').classList.remove('error');
    }

    if (!adminPassword) {
      showFieldError('ad-pw-err', 'Password required');
      document.getElementById('ad-password').classList.add('error');
      valid = false;
    } else {
      clearFieldError('ad-pw-err');
      document.getElementById('ad-password').classList.remove('error');
    }

    if (!tfaCode || tfaCode.length < 6) {
      showFieldError('ad-2fa-err', '6-digit code required');
      document.getElementById('ad-2fa').classList.add('error');
      valid = false;
    } else {
      clearFieldError('ad-2fa-err');
      document.getElementById('ad-2fa').classList.remove('error');
    }

    if (!valid) return;

    // Admin login uses a separate endpoint
    performAdminLogin(username, adminPassword, tfaCode);
    return;
  }

  // Perform AJAX login
  performLogin(role, email, password, remember);
}

/**
 * Perform AJAX login request
 */
function performLogin(role, email, password, remember) {
  const btn = document.querySelector(`#panel-${role} .btn-submit`);
  const originalHTML = btn.innerHTML;

  // Show loading state
  btn.classList.add('loading');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  // Prepare request data
  const requestData = {
    email: email,
    password: password,
    user_type: role,
    remember: remember
  };

  // Send AJAX request
  fetch('/api/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success message
        showToast('✓ ' + data.message, 'success');

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = data.data.redirect;
        }, 1200);
      } else {
        // Show error message
        showToast('✗ ' + data.message, 'error');

        // Reset button
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.innerHTML = originalHTML;

        // Highlight relevant field
        if (data.message.includes('email')) {
          const emailField = document.getElementById(`${role}-email`);
          if (emailField) emailField.classList.add('error');
          showFieldError(`${role}-email-err`, data.message);
        } else {
          const passwordField = document.getElementById(`${role}-password`);
          if (passwordField) passwordField.classList.add('error');
          showFieldError(`${role}-pw-err`, data.message);
        }
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      showToast('✗ Connection error. Please try again.', 'error');

      // Reset button
      btn.classList.remove('loading');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    });
}

/**
 * Admin login handler
 */
function performAdminLogin(username, password, tfaCode) {
  const btn = document.querySelector('#panel-admin .btn-submit');
  const originalHTML = btn.innerHTML;

  btn.classList.add('loading');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

  // This would connect to a separate admin auth endpoint
  setTimeout(() => {
    showToast('✓ Admin access granted', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard-admin.html';
    }, 1200);
  }, 1500);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Show field error message
 */
function showFieldError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

/**
 * Clear field error message
 */
function clearFieldError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.classList.remove('show');
    errorElement.textContent = '';
  }
}

/**
 * Show toast notification
 */
function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) {
    // Create toast if it doesn't exist
    const newToast = document.createElement('div');
    newToast.id = 'toast';
    newToast.className = 'toast';
    document.body.appendChild(newToast);
  }

  const toastElement = document.getElementById('toast');
  toastElement.textContent = message;
  toastElement.className = `toast ${type}`;
  toastElement.classList.add('show');

  clearTimeout(toastElement._timer);
  toastElement._timer = setTimeout(() => {
    toastElement.classList.remove('show');
  }, 3800);
}

/**
 * Add Enter key support for forms
 */
function addEnterKeySupport(form, role) {
  form.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin(role);
    }
  });
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (input) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    button.innerHTML = type === 'password' ? '<i class="far fa-eye"></i>' : '<i class="far fa-eye-slash"></i>';
  }
}

// Make functions globally available
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
