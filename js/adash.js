if (window.lucide) lucide.createIcons();

const artistDash = window.PlumArtistDashboard || {};
const cursor = document.getElementById('cursor');

if (cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,.nav-item,.metric-card,.booking-row,.inq-item,.qa-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hov'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hov'));
  });
}

function showPage(id, clickedEl) {
  document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
  const section = document.getElementById('sec-' + id);
  if (section) {
    section.classList.add('active');
    const title = section.querySelector('.dc-title')?.textContent || section.querySelector('h2')?.textContent || id.charAt(0).toUpperCase() + id.slice(1);
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = title;
  }

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
  if (id === 'earnings') buildCharts();
  if (window.innerWidth < 768) document.getElementById('sidebar')?.classList.remove('open');
}

const earningsData = artistDash.charts?.earnings || {};
const months = Array.isArray(earningsData.labels) && earningsData.labels.length ? earningsData.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const vals = Array.isArray(earningsData.values) && earningsData.values.length ? earningsData.values.map(Number) : [0, 0, 0, 0, 0, 0];

function buildBarChart(id, values) {
  const element = document.getElementById(id);
  if (!element || element.tagName === 'CANVAS') return;

  const maxValue = Math.max(...values, 1);
  element.innerHTML = values.map((value, index) => {
    const label = months[index] || '';
    const height = Math.max(8, (Number(value || 0) / maxValue) * 80);
    return `<div class="bar-wrap"><div class="bar-val">K${(Number(value || 0) / 1000).toFixed(0)}k</div><div class="bar" style="height:${height}px;"></div><div class="bar-label">${label}</div></div>`;
  }).join('');
}

function buildCharts() {
  buildBarChart('fullEarningsChart', vals);
}

buildCharts();

function animCount(el, target, suffix, prefix, duration = 1500) {
  let start = null;
  const render = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = (prefix || '') + value.toLocaleString() + (suffix || '');
    if (progress < 1) requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.done) {
      entry.target.dataset.done = '1';
      animCount(entry.target, Number(entry.target.dataset.target || 0), entry.target.dataset.suffix || '', entry.target.dataset.prefix || '');
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
    let avatar = document.getElementById('sideAvatar');
    const wrapper = document.querySelector('.sp-avatar');
    if (!avatar && wrapper) {
      wrapper.querySelector('.sp-avatar-initials')?.remove();
      avatar = document.createElement('img');
      avatar.id = 'sideAvatar';
      avatar.alt = 'Profile picture preview';
      wrapper.prepend(avatar);
    }
    if (avatar) avatar.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function handlePortfolioUpload(input) {
  if (!input.files || input.files.length === 0) return;

  showToast(`${input.files.length} file(s) added for preview.`);
  [...input.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.style.cssText = 'border-radius:12px;overflow:hidden;aspect-ratio:1;position:relative;cursor:pointer;';
      div.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" alt=""/><button onclick="this.parentElement.remove()" style="position:absolute;top:6px;right:6px;background:rgba(232,64,64,0.85);border:none;border-radius:50%;width:26px;height:26px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;">x</button>`;
      const grid = document.getElementById('portfolioGrid');
      if (grid) grid.insertBefore(div, grid.lastElementChild);
    };
    reader.readAsDataURL(file);
  });
}

function openEditModal() {
  document.getElementById('editModal')?.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById('editModal')?.classList.remove('open');
}

function saveAndClose() {
  showToast('Profile editing is next.');
  closeModal();
}

function editService() {
  showToast('Service editing is next.');
}

function openAddService() {
  showToast('Service creation is next.');
}

function shareProfile() {
  const profileUrl = new URL(artistDash.profileUrl || 'artist-profile.php', window.location.href).href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(profileUrl).then(() => showToast('Profile link copied.'));
    return;
  }
  showToast('Profile link: ' + profileUrl);
}

async function logoutUser() {
  const endpoint = artistDash.endpoints?.logout;
  if (!endpoint) {
    window.location.href = 'login.php';
    return;
  }

  const formData = new FormData();
  if (artistDash.csrf) formData.append('_csrf', artistDash.csrf);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: artistDash.csrf ? { 'X-CSRF-Token': artistDash.csrf } : {}
    });
    const payload = await response.json();
    window.location.href = payload.redirect || 'login.php';
  } catch (error) {
    showToast('Could not log out. Try again.');
  }
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
