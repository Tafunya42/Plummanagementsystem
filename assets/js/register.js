/**
 * Registration Form Handler
 * Handles AJAX form submission for registration
 */

document.addEventListener('DOMContentLoaded', function () {
  // Get form elements
  const clientForm = document.getElementById('panel-client');
  const artistForm = document.getElementById('panel-artist');

  // Add event listeners to forms
  if (clientForm) {
    const clientBtn = clientForm.querySelector('.btn-submit');
    if (clientBtn) {
      clientBtn.onclick = function (e) {
        e.preventDefault();
        handleSignup('client');
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
        handleSignup('artist');
      };
    }

    addEnterKeySupport(artistForm, 'artist');
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
});

/**
 * Handle signup for different user types
 */
function handleSignup(role) {
  let full_name = '';
  let email = '';
  let password = '';
  let agree_terms = false;
  let stage_name = null;
  let valid = true;

  if (role === 'client') {
    full_name = document.getElementById('c-name')?.value.trim() || '';
    email = document.getElementById('c-email')?.value.trim() || '';
    password = document.getElementById('c-password')?.value || '';
    agree_terms = document.getElementById('c-agree')?.checked || false;

    // Validate full name
    if (!full_name || full_name.length < 3) {
      showFieldError('c-name-err', 'Please enter your full name');
      document.getElementById('c-name')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('c-name-err');
      document.getElementById('c-name')?.classList.remove('error');
    }

    // Validate email
    if (!validateEmail(email)) {
      showFieldError('c-email-err', 'Please enter a valid email');
      document.getElementById('c-email')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('c-email-err');
      document.getElementById('c-email')?.classList.remove('error');
    }

    // Validate password
    if (!validatePassword(password)) {
      showFieldError('c-pw-err', 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
      document.getElementById('c-password')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('c-pw-err');
      document.getElementById('c-password')?.classList.remove('error');
    }

    // Validate terms agreement
    if (!agree_terms) {
      showFieldError('c-terms-err', 'You must agree to the Terms & Privacy Policy');
      valid = false;
    } else {
      clearFieldError('c-terms-err');
    }

    if (!valid) return;

  } else if (role === 'artist') {
    full_name = document.getElementById('a-name')?.value.trim() || '';
    stage_name = document.getElementById('a-stage')?.value.trim() || null;
    email = document.getElementById('a-email')?.value.trim() || '';
    password = document.getElementById('a-password')?.value || '';
    agree_terms = document.getElementById('a-agree')?.checked || false;

    // Validate full name
    if (!full_name || full_name.length < 3) {
      showFieldError('a-name-err', 'Please enter your full name');
      document.getElementById('a-name')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('a-name-err');
      document.getElementById('a-name')?.classList.remove('error');
    }

    // Validate email
    if (!validateEmail(email)) {
      showFieldError('a-email-err', 'Please enter a valid email');
      document.getElementById('a-email')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('a-email-err');
      document.getElementById('a-email')?.classList.remove('error');
    }

    // Validate password
    if (!validatePassword(password)) {
      showFieldError('a-pw-err', 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
      document.getElementById('a-password')?.classList.add('error');
      valid = false;
    } else {
      clearFieldError('a-pw-err');
      document.getElementById('a-password')?.classList.remove('error');
    }

    // Validate terms agreement
    if (!agree_terms) {
      showFieldError('a-terms-err', 'You must agree to the Terms & Privacy Policy');
      valid = false;
    } else {
      clearFieldError('a-terms-err');
    }

    if (!valid) return;
  }

  // Perform AJAX registration
  performSignup(role, full_name, email, password, agree_terms, stage_name);
}

/**
 * Perform AJAX registration request
 */
function performSignup(role, full_name, email, password, agree_terms, stage_name = null) {
  const btn = document.querySelector(`#panel-${role} .btn-submit`);
  const originalHTML = btn.innerHTML;

  // Show loading state
  btn.classList.add('loading');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

  // Prepare request data
  const requestData = {
    full_name: full_name,
    email: email,
    password: password,
    user_type: role,
    agree_terms: agree_terms
  };

  if (stage_name) {
    requestData.stage_name = stage_name;
  }

  // Send AJAX request
  fetch('/api/register.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(requestData)
  })
    .then(response => response.json())
    .then(data => {
      // Update the performSignup function success handling:
      if (data.success) {
        // Show success message
        showToast('✓ ' + data.message, 'success');

        // Redirect to verification page
        setTimeout(() => {
          window.location.href = data.data.redirect;
        }, 2000);
      } else {
        // Show error message
        showToast('✗ ' + data.message, 'error');

        // Reset button
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.innerHTML = originalHTML;

        // Highlight relevant field based on error message
        if (data.message.includes('email')) {
          const emailField = document.getElementById(`${role}-email`);
          if (emailField) emailField.classList.add('error');
          showFieldError(`${role}-email-err`, data.message);
        } else if (data.message.includes('password')) {
          const passwordField = document.getElementById(`${role}-password`);
          if (passwordField) passwordField.classList.add('error');
          showFieldError(`${role}-pw-err`, data.message);
        }
      }
    })
    .catch(error => {
      console.error('Registration error:', error);
      showToast('✗ Connection error. Please try again.', 'error');

      // Reset button
      btn.classList.remove('loading');
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    });
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

/**
 * Show field error message
 */
function showFieldError(elementId, message) {
  // Create error element if it doesn't exist
  let errorElement = document.getElementById(elementId);
  if (!errorElement) {
    // Find the parent field group
    const fieldGroup = document.querySelector(`[id*="${elementId.split('-')[0]}"]`)?.closest('.field-group');
    if (fieldGroup) {
      errorElement = document.createElement('div');
      errorElement.id = elementId;
      errorElement.className = 'field-error';
      fieldGroup.appendChild(errorElement);
    }
  }

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
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);

    // Add toast styles if not present
    if (!document.querySelector('#toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'toast-styles';
      styles.textContent = `
                .toast {
                    position: fixed;
                    bottom: 28px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    padding: 12px 28px;
                    border-radius: 60px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    z-index: 999;
                    opacity: 0;
                    transition: all 0.4s ease;
                    white-space: nowrap;
                    pointer-events: none;
                }
                .toast.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                .toast.success {
                    background: #dff0d8;
                    color: #2e7d32;
                    border: 1px solid #a5d6a7;
                }
                .toast.error {
                    background: #ffebee;
                    color: #b71c1c;
                    border: 1px solid #ef9a9a;
                }
            `;
      document.head.appendChild(styles);
    }
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

/**
 * Add Enter key support for forms
 */
function addEnterKeySupport(form, role) {
  form.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignup(role);
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
window.handleSignup = handleSignup;
window.togglePassword = togglePassword;
window.switchRole = function (role) {
  // Update tabs
  document.querySelectorAll('.role-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById('tab-' + role).classList.add('active');

  // Show/hide info boxes
  document.querySelectorAll('[id^="info-"]').forEach(box => box.style.display = 'none');
  document.getElementById('info-' + role).style.display = 'flex';

  // Show/hide form panels
  document.querySelectorAll('.form-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById('panel-' + role).classList.add('active');
};