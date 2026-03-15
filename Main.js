 
 /* ============================================
   PLUM — Main JavaScript
   ============================================ */

// ---- Navbar scroll effect ----
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ---- Mobile nav toggle ----
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = mobileNav.classList.contains('open');
    spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });
}

// ---- Tabs ----
function initTabs(container) {
  const tabBtns = container.querySelectorAll('.tab-btn');
  const tabContents = container.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const content = container.querySelector(`#${target}`);
      if (content) content.classList.add('active');
    });
  });
}

document.querySelectorAll('[data-tabs]').forEach(initTabs);

// ---- Modal ----
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close buttons
document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal-overlay');
    if (modal) closeModal(modal.id);
  });
});

// Open buttons
document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
});

// ---- Favorite toggle ----
document.querySelectorAll('.artist-card-favorite').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    btn.classList.toggle('active');
    btn.innerHTML = btn.classList.contains('active') ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  });
});

// ---- Filter tags ----
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const group = tag.closest('[data-tag-group]');
    if (group) {
      const allowMulti = group.dataset.tagGroup === 'multi';
      if (!allowMulti) group.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
    }
    tag.classList.toggle('active');
  });
});

// ---- Search suggestions (demo) ----
const searchInput = document.querySelector('#hero-search');
if (searchInput) {
  const suggestions = [
    'Live Band', 'DJ', 'Magician', 'Wedding Singer', 'Jazz Trio',
    'Comedian', 'Caricaturist', 'String Quartet', 'Harpist', 'Photographer'
  ];
  const suggBox = document.getElementById('search-suggestions');
  if (suggBox) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase();
      if (val.length < 2) { suggBox.style.display = 'none'; return; }
      const matches = suggestions.filter(s => s.toLowerCase().includes(val));
      if (matches.length === 0) { suggBox.style.display = 'none'; return; }
      suggBox.innerHTML = matches.map(m => `<div class="sugg-item">${m}</div>`).join('');
      suggBox.style.display = 'block';
      suggBox.querySelectorAll('.sugg-item').forEach(item => {
        item.addEventListener('click', () => {
          searchInput.value = item.textContent;
          suggBox.style.display = 'none';
        });
      });
    });
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggBox.contains(e.target)) {
        suggBox.style.display = 'none';
      }
    });
  }
}

// ---- Scroll reveal ----
const revealEls = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-up');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// ---- Price range display ----
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
if (priceRange && priceDisplay) {
  priceRange.addEventListener('input', () => {
    priceDisplay.textContent = `K0 – K${priceRange.value}`;
  });
}

// ---- Counter animation ----
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
  }, 16);
}

const counterEls = document.querySelectorAll('[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObserver.observe(el));

// ---- Sidebar (dashboard mobile) ----
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ---- Star rating input ----
document.querySelectorAll('.rating-input').forEach(group => {
  const stars = group.querySelectorAll('.rating-star');
  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
    star.addEventListener('click', () => {
      group.dataset.rating = i + 1;
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
    star.addEventListener('mouseleave', () => {
      const rating = parseInt(group.dataset.rating || 0);
      stars.forEach((s, j) => s.classList.toggle('active', j < rating));
    });
  });
});

// ---- Toast notification ----
function showToast(message, type = 'info', duration = 3500) {
  const existing = document.querySelector('.toast-container');
  const container = existing || (() => {
    const c = document.createElement('div');
    c.className = 'toast-container';
    c.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 12px;
    `;
    document.body.appendChild(c);
    return c;
  })();

  const icons = { 
    success: '<i class="fas fa-check" style="color: #10b981;"></i>\n', 
    error: '<i class="fas fa-times" style="color: #ef4444;"></i>\n', 
    info: '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>\n', 
    warning: '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>\n' 
  };
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--white); border-radius: 12px; padding: 14px 20px;
    box-shadow: 0 8px 32px rgba(26,10,46,0.18); display: flex; align-items: center;
    gap: 12px; font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
    color: var(--plum-800); border-left: 4px solid var(--plum-500);
    animation: fadeUp 0.3s ease; min-width: 280px; max-width: 360px;
  `;
  const borderColors = { success: '#2E7D32', error: '#C62828', info: '#6B2D8B', warning: '#E65100' };
  toast.style.borderLeftColor = borderColors[type];
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.2s ease reverse';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

// ---- Demo interaction helpers ----
document.querySelectorAll('[data-toast]').forEach(el => {
  el.addEventListener('click', () => {
    const msg = el.dataset.toast;
    const type = el.dataset.toastType || 'info';
    showToast(msg, type);
  });
});

// Make showToast global
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;