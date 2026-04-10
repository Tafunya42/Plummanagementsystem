document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  let saved = false;
  const saveButton = document.getElementById('saveBtn');
  const contactButtons = [document.getElementById('contactBtn'), document.getElementById('contactBtn2')].filter(Boolean);
  const shareButton = document.getElementById('shareBtn');

  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#161b2f;border:1px solid rgba(255,255,255,.12);color:#f0eff8;padding:12px 22px;border-radius:999px;font-size:.85rem;font-weight:600;z-index:9999;box-shadow:0 14px 34px rgba(0,0,0,.35)';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  saveButton?.addEventListener('click', () => {
    saved = !saved;
    saveButton.innerHTML = saved ? '<i data-lucide="heart-off"></i> Saved' : '<i data-lucide="heart"></i> Save';
    if (window.lucide) {
      window.lucide.createIcons();
    }
    showToast(saved ? 'Organizer saved to your shortlist.' : 'Organizer removed from your shortlist.');
  });

  contactButtons.forEach(button => {
    button.addEventListener('click', () => {
      const email = document.querySelector('.contact-value')?.textContent?.trim();
      if (email) {
        window.location.href = `mailto:${email}?subject=Booking inquiry from Plum`;
      } else {
        showToast('Contact details are not available right now.');
      }
    });
  });

  shareButton?.addEventListener('click', async () => {
    const payload = {
      title: 'Metropolitan Event Management | Plum',
      text: 'Review this organizer profile on Plum.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch (_) {
        // Fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard.');
    } catch (_) {
      showToast('Unable to share this profile right now.');
    }
  });
});
