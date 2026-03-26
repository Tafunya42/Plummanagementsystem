/**
 * Email Verification JavaScript
 * Handles verification code entry and resend functionality
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function () {
  console.log('Verification page loaded');

  // Get token from the page (set by PHP)
  const verificationTokenElement = document.getElementById('verification-token');
  if (!verificationTokenElement) {
    console.error('Verification token not found in page');
    showMessage('Invalid verification link. Please try again.', 'error');
    return;
  }

  const verificationToken = verificationTokenElement.value;
  console.log('Token loaded:', verificationToken.substring(0, 20) + '...');

  // Get DOM elements
  const codeInput = document.getElementById('verificationCode');
  const verifyBtn = document.getElementById('verifyBtn');
  const messageDiv = document.getElementById('message');
  const timerDiv = document.getElementById('timer');
  const resendLink = document.querySelector('.resend-link a');

  // Variables for resend cooldown
  let canResend = true;
  let countdown = 60;
  let resendInterval = null;

  if (!codeInput) {
    console.error('Code input not found');
    return;
  }

  // Auto-focus the code input
  codeInput.focus();

  // Handle input - only allow numbers
  codeInput.addEventListener('input', function (e) {
    // Only allow numbers
    this.value = this.value.replace(/[^0-9]/g, '');

    // Auto-submit when 6 digits entered
    if (this.value.length === 6) {
      verifyCode(verificationToken);
    }

    // Remove error class when user starts typing
    this.classList.remove('error');
    if (messageDiv) {
      messageDiv.className = 'message';
    }
  });

  // Allow paste
  codeInput.addEventListener('paste', function (e) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const numbersOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
    this.value = numbersOnly;
    if (numbersOnly.length === 6) {
      verifyCode(verificationToken);
    }
  });

  // Enter key support
  codeInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyCode(verificationToken);
    }
  });

  // Verify button click handler
  if (verifyBtn) {
    verifyBtn.onclick = function (e) {
      e.preventDefault();
      verifyCode(verificationToken);
    };
  }

  // Resend link click handler
  if (resendLink) {
    resendLink.onclick = function (e) {
      e.preventDefault();
      resendCode(verificationToken);
    };
  }
});

/**
 * Verify the entered code
 */
async function verifyCode(token) {
  const codeInput = document.getElementById('verificationCode');
  const messageDiv = document.getElementById('message');
  const verifyBtn = document.getElementById('verifyBtn');

  const code = codeInput.value.trim();

  console.log('Verifying code:', code);
  console.log('With token:', token.substring(0, 20) + '...');

  if (!code || code.length !== 6) {
    showMessage('Please enter the 6-digit verification code', 'error');
    codeInput.classList.add('error');
    return;
  }

  // Disable button and show loading
  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="loading"></span> Verifying...';
  }

  try {
    const response = await fetch('/api/verify_code.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        code: code,
        token: token
      })
    });

    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      showMessage(data.message, 'success');

      // Redirect after success
      setTimeout(() => {
        window.location.href = data.data.redirect;
      }, 2000);
    } else {
      showMessage(data.message, 'error');
      codeInput.classList.add('error');
      codeInput.value = '';
      codeInput.focus();

      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Email';
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    showMessage('Connection error. Please try again.', 'error');

    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Email';
    }
  }
}

/**
 * Resend verification code
 */
async function resendCode(token) {
  console.log('Resending code with token:', token.substring(0, 20) + '...');

  const resendLink = document.querySelector('.resend-link a');

  if (!canResend) {
    showMessage(`Please wait ${countdown} seconds before requesting another code`, 'error');
    return;
  }

  if (resendLink) {
    const originalText = resendLink.textContent;
    resendLink.textContent = 'Sending...';
    resendLink.style.pointerEvents = 'none';

    try {
      const response = await fetch('/api/resend_code.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          token: token
        })
      });

      console.log('Resend response status:', response.status);

      const data = await response.json();
      console.log('Resend response data:', data);

      if (data.success) {
        showMessage(data.message, 'success');
        startResendCooldown();
      } else {
        showMessage(data.message, 'error');
      }
    } catch (error) {
      console.error('Resend error:', error);
      showMessage('Failed to resend code. Please try again.', 'error');
    } finally {
      resendLink.textContent = originalText;
      resendLink.style.pointerEvents = 'auto';
    }
  }
}

/**
 * Start resend cooldown timer
 */
function startResendCooldown() {
  canResend = false;
  const timerDiv = document.getElementById('timer');
  let countdown = 60;

  if (resendInterval) {
    clearInterval(resendInterval);
  }

  resendInterval = setInterval(() => {
    if (countdown <= 0) {
      clearInterval(resendInterval);
      canResend = true;
      if (timerDiv) {
        timerDiv.innerHTML = '';
      }
    } else {
      if (timerDiv) {
        timerDiv.innerHTML = `You can request another code in <span>${countdown}</span> seconds`;
      }
      countdown--;
    }
  }, 1000);
}

/**
 * Show message to user
 */
function showMessage(message, type) {
  const messageDiv = document.getElementById('message');

  if (!messageDiv) {
    // Create message div if it doesn't exist
    const newMessageDiv = document.createElement('div');
    newMessageDiv.id = 'message';
    newMessageDiv.className = 'message';

    const verifyContent = document.querySelector('.verify-content');
    if (verifyContent) {
      verifyContent.insertBefore(newMessageDiv, verifyContent.firstChild);
    }
  }

  const msgDiv = document.getElementById('message');
  if (msgDiv) {
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        if (msgDiv.className.includes('success')) {
          msgDiv.className = 'message';
        }
      }, 5000);
    }
  }
}