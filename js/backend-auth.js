(function () {
  const backend = window.PlumBackend || {};

  function value(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
  }

  function setButton(button, label, disabled) {
    if (!button) return;
    button.disabled = disabled;
    if (label) button.innerHTML = label;
    if (window.lucide) lucide.createIcons();
  }

  function showMessage(viewId, message, type) {
    const view = document.getElementById(viewId) || document.body;
    let box = view.querySelector('.backend-message');
    if (!box) {
      box = document.createElement('div');
      box.className = 'backend-message';
      box.style.cssText = 'margin:0 0 1rem;padding:0.75rem 0.9rem;border-radius:8px;font-size:0.82rem;font-weight:600;line-height:1.45;';
      const anchor = view.querySelector('.auth-sub') || view.firstElementChild;
      if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(box, anchor.nextSibling);
      else view.prepend(box);
    }
    box.textContent = message;
    box.style.background = type === 'ok' ? 'rgba(37, 154, 80, 0.12)' : 'rgba(232, 64, 64, 0.12)';
    box.style.color = type === 'ok' ? '#177245' : '#B42318';
    box.style.border = type === 'ok' ? '1px solid rgba(37, 154, 80, 0.2)' : '1px solid rgba(232, 64, 64, 0.2)';
  }

  async function post(endpoint, formData) {
    if (!endpoint) throw new Error('Missing AJAX endpoint.');
    if (backend.csrf && !formData.has('_csrf')) formData.append('_csrf', backend.csrf);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: backend.csrf ? { 'X-CSRF-Token': backend.csrf } : {}
    });

    const payload = await response.json().catch(() => ({
      ok: false,
      message: 'The server returned an invalid response.'
    }));

    return { response, payload };
  }

  window.handleSignin = async function () {
    const button = typeof event !== 'undefined' && event.target ? event.target.closest('button') : document.querySelector('#view-signin .btn-submit');
    const formData = new FormData();
    formData.append('email', value('signin-email'));
    formData.append('password', value('signin-pass'));

    setButton(button, '<i data-lucide="loader-2"></i> Signing in...', true);

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.login, formData);
      showMessage('view-signin', payload.message || (payload.ok ? 'Signed in.' : 'Sign in failed.'), payload.ok ? 'ok' : 'err');

      if (payload.redirect) {
        window.setTimeout(() => { window.location.href = payload.redirect; }, payload.ok ? 500 : 900);
      }
    } catch (error) {
      showMessage('view-signin', error.message || 'Sign in failed.', 'err');
    } finally {
      setButton(button, '<i data-lucide="log-in"></i> Enter Workspace', false);
    }
  };

  window.completeRegistration = async function () {
    const button = typeof event !== 'undefined' && event.target ? event.target.closest('button') : document.querySelector('#reg-step-4 .btn-submit');
    const formData = new FormData();
    const avatar = document.getElementById('avatarFile');
    const role = typeof selectedRole !== 'undefined' ? selectedRole : 'artist';
    const skillTags = typeof tags !== 'undefined' ? tags : [];

    formData.append('role', role);
    formData.append('first_name', value('reg-fname'));
    formData.append('last_name', value('reg-lname'));
    formData.append('email', value('reg-email'));
    formData.append('password', value('reg-pass'));
    formData.append('display_name', value('reg-displayname'));
    formData.append('city', value('reg-city'));
    formData.append('phone', value('reg-phone'));
    formData.append('category', value('reg-category'));
    formData.append('company_name', value('reg-company'));
    formData.append('bio', value('reg-bio'));
    formData.append('rate', value('reg-rate'));
    formData.append('portfolio_url', value('reg-portfolio'));
    formData.append('social_url', value('reg-social'));
    formData.append('skills', JSON.stringify(skillTags));

    if (avatar && avatar.files && avatar.files[0]) {
      formData.append('profile_picture', avatar.files[0]);
    }

    setButton(button, '<i data-lucide="loader-2"></i> Creating...', true);

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.register, formData);
      showMessage('view-register', payload.message || (payload.ok ? 'Account created.' : 'Registration failed.'), payload.ok ? 'ok' : 'err');

      if (payload.redirect) {
        window.setTimeout(() => { window.location.href = payload.redirect; }, payload.ok ? 700 : 1400);
      }
    } catch (error) {
      showMessage('view-register', error.message || 'Registration failed.', 'err');
    } finally {
      setButton(button, '<i data-lucide="check-circle-2"></i> Complete Registration', false);
    }
  };

  window.verifyCode = async function () {
    const inputs = Array.from(document.querySelectorAll('.code-input'));
    const code = inputs.map((input) => input.value).join('');
    if (code.length < 6) {
      if (inputs[0]) inputs[0].focus();
      return;
    }

    const button = typeof event !== 'undefined' && event.target ? event.target.closest('button') : document.querySelector('#verifyCard .btn-submit');
    const formData = new FormData();
    formData.append('email', document.getElementById('emailDisplay')?.textContent.trim() || '');
    formData.append('code', code);

    setButton(button, '<i data-lucide="loader-2"></i> Verifying...', true);

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.verifyEmail, formData);
      if (!payload.ok) {
        showMessage('verifyCard', payload.message || 'Verification failed.', 'err');
        return;
      }

      document.getElementById('verifyCard').style.display = 'none';
      document.getElementById('successCard').style.display = 'block';
      if (window.lucide) lucide.createIcons();
      if (payload.redirect) window.setTimeout(() => { window.location.href = payload.redirect; }, 900);
    } catch (error) {
      showMessage('verifyCard', error.message || 'Verification failed.', 'err');
    } finally {
      setButton(button, '<i data-lucide="check-circle-2"></i> Verify Email', false);
    }
  };

  window.resendCode = async function () {
    const formData = new FormData();
    formData.append('email', document.getElementById('emailDisplay')?.textContent.trim() || '');

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.resendVerification, formData);
      showMessage('verifyCard', payload.message || 'Code sent.', payload.ok ? 'ok' : 'err');
      if (payload.ok && typeof window.startResendTimer === 'function') {
        window.startResendTimer();
      }
    } catch (error) {
      showMessage('verifyCard', error.message || 'Could not resend the code.', 'err');
    }
  };

  window.sendReset = async function () {
    const button = document.getElementById('sendResetBtn');
    const email = value('resetEmail');
    const formData = new FormData();
    formData.append('email', email);

    setButton(button, '<i data-lucide="loader-2"></i> Sending...', true);

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.forgotPassword, formData);
      if (!payload.ok) {
        showMessage('formState', payload.message || 'Could not send reset link.', 'err');
        return;
      }

      const sent = document.getElementById('sentEmail');
      if (sent) sent.textContent = email;
      document.getElementById('formState').style.display = 'none';
      document.getElementById('successState').style.display = 'block';
      if (window.lucide) lucide.createIcons();
    } catch (error) {
      showMessage('formState', error.message || 'Could not send reset link.', 'err');
    } finally {
      setButton(button, '<i data-lucide="send"></i> Send Reset Link', false);
    }
  };

  window.resendReset = function () {
    window.sendReset();
  };

  window.doReset = async function () {
    const button = document.getElementById('resetBtn');
    const formData = new FormData();
    formData.append('token', backend.resetToken || new URLSearchParams(window.location.search).get('token') || '');
    formData.append('password', document.getElementById('newPass')?.value || '');
    formData.append('password_confirm', document.getElementById('confPass')?.value || '');

    setButton(button, '<i data-lucide="loader-2"></i> Saving...', true);

    try {
      const { payload } = await post(backend.endpoints && backend.endpoints.resetPassword, formData);
      if (!payload.ok) {
        showMessage('formCard', payload.message || 'Could not reset password.', 'err');
        return;
      }

      document.getElementById('formCard').style.display = 'none';
      document.getElementById('successCard').style.display = 'block';
      if (window.lucide) lucide.createIcons();
      if (payload.redirect) window.setTimeout(() => { window.location.href = payload.redirect; }, 1200);
    } catch (error) {
      showMessage('formCard', error.message || 'Could not reset password.', 'err');
    } finally {
      setButton(button, '<i data-lucide="check-circle-2"></i> Reset Password', false);
    }
  };
}());
