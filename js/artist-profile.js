const artistProfile = window.PlumArtistProfile || {};
if (window.lucide) lucide.createIcons();

const cur = document.getElementById('cursor');
if (cur) {
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,.gal-item,.similar-card,.stat-card,.review-card').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hov'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hov'));
  });
}

window.addEventListener('scroll', () => document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50));
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('mobMenu')?.classList.add('open');
  document.body.classList.add('menu-open');
});
document.getElementById('mobClose')?.addEventListener('click', () => {
  document.getElementById('mobMenu')?.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (window.lucide) lucide.createIcons();
});

function showTab(tab, btn) {
  document.querySelectorAll('.ptab').forEach(item => item.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('tab-' + tab)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animCount(el, target, suffix, dur = 1800) {
  let start = null;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.done) {
      entry.target.dataset.done = '1';
      animCount(entry.target, Number(entry.target.dataset.target || 0), entry.target.dataset.suffix || '');
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function changeAvatar(input) {
  if (!input.files || !input.files[0]) return;

  const reader = new FileReader();
  reader.onload = e => {
    const avatar = document.getElementById('profileAvatar');
    if (avatar && avatar.tagName === 'IMG') avatar.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

const galleryImgs = Array.isArray(artistProfile.gallery) && artistProfile.gallery.length
  ? artistProfile.gallery.map(item => item.src)
  : [];

function openLightbox(idx) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  if (!lb || !img || !galleryImgs[idx]) return;

  img.src = galleryImgs[idx];
  lb.style.display = 'flex';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function modalContent(type) {
  if (type === 'profile') {
    return `<div class="field-group"><label class="field-label">Display Name</label><input type="text" class="field-input" value="${escapeHtml(artistProfile.name)}"/></div><div class="field-group"><label class="field-label">Category</label><input type="text" class="field-input" value="${escapeHtml(artistProfile.category)}"/></div><div class="field-group"><label class="field-label">City</label><input type="text" class="field-input" value="${escapeHtml(artistProfile.location)}"/></div><div class="field-group"><label class="field-label">Starting Rate (K)</label><input type="number" class="field-input" value="${escapeHtml(artistProfile.hourlyRate)}"/></div><div class="field-group"><label class="field-label">Bio</label><textarea class="field-input" rows="4" style="resize:vertical;">${escapeHtml(artistProfile.bio)}</textarea></div><div class="field-group"><label class="field-label">Portfolio URL</label><input type="url" class="field-input" placeholder="https://yourwebsite.com"/></div>`;
  }

  if (type === 'gallery') {
    return `<div style="text-align:center;padding:1.5rem;"><div style="font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;">Upload Media</div><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.2rem;">Add photos or videos to your portfolio gallery</p><input type="file" id="mediaUpload" accept="image/*,video/*" multiple style="display:none;" onchange="handleMediaUpload(this)"/><button onclick="document.getElementById('mediaUpload').click()" style="background:var(--purple);color:#fff;border:none;padding:0.7rem 2rem;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Choose Files</button><p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.8rem;">Supported: JPG, PNG, MP4 - Max 10MB per file</p></div>`;
  }

  return `<div style="text-align:center;padding:1.5rem;"><div style="font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;">Change Cover Photo</div><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.2rem;">Recommended size: 1400 x 320px</p><input type="file" id="coverFile" accept="image/*" style="display:none;" onchange="handleCoverUpload(this)"/><button onclick="document.getElementById('coverFile').click()" style="background:var(--purple);color:#fff;border:none;padding:0.7rem 2rem;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Upload Cover</button></div>`;
}

function openEditModal(type) {
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const modal = document.getElementById('editModal');
  if (!title || !body || !modal) return;

  title.textContent = type === 'profile' ? 'Edit Profile' : type === 'gallery' ? 'Add Media' : 'Change Cover';
  body.innerHTML = modalContent(type);
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function closeEditModal() {
  document.getElementById('editModal')?.classList.remove('open');
}

function saveProfile() {
  showToast('Profile editing is next.');
  closeEditModal();
}

function handleMediaUpload(input) {
  if (input.files && input.files.length > 0) showToast(`${input.files.length} file(s) added for preview.`);
}

function handleCoverUpload(input) {
  if (!input.files || !input.files[0]) return;

  const reader = new FileReader();
  reader.onload = e => {
    const cover = document.querySelector('.profile-cover img');
    if (cover) cover.src = e.target.result;
    showToast('Cover preview updated.');
    closeEditModal();
  };
  reader.readAsDataURL(input.files[0]);
}

function shareProfile() {
  const url = new URL(artistProfile.portfolioUrl || window.location.href, window.location.href).href;
  if (navigator.share) {
    navigator.share({ title: `${artistProfile.name || 'Artist'} on Plum`, url });
    return;
  }

  navigator.clipboard.writeText(url).then(() => showToast('Profile link copied.'));
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--navy2);color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-size:0.875rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:translateY(20px);opacity:0;transition:all 0.3s;';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transform = 'none';
    toast.style.opacity = '1';
  }, 10);
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
