const {
  formatCurrency,
  setCurrency,
  getCurrency,
  getCurrentUser,
  getUserById,
  getDashboardPath
} = window.PlumPlatform;

let mode = getCurrency();

function renderPrices() {
  document.querySelectorAll('.price-val').forEach(element => {
    element.innerHTML = `${formatCurrency(element.dataset.usd, mode, 'USD')} <small>/ event</small>`;
  });

  document.querySelectorAll('.price-pill').forEach(element => {
    element.textContent = `From ${formatCurrency(element.dataset.usd, mode, 'USD')} / event`;
  });
}

function setCurr(currency) {
  mode = currency;
  setCurrency(currency);
  document.getElementById('btnUSD')?.classList.toggle('act', currency === 'USD');
  document.getElementById('btnZMW')?.classList.toggle('act', currency === 'ZMW');
  renderPrices();
}

function personalizeHome() {
  const currentUser = getCurrentUser();
  const loginLink = document.querySelector('.nav-login');
  const primaryCta = document.querySelector('.nav-r .btn.btn-p');
  const heroTitle = document.querySelector('.eyebrow');
  if (!currentUser || !loginLink) return;

  const user = getUserById(currentUser.id);
  const label = user?.firstName || currentUser.email?.split('@')[0] || 'Account';
  const dashboardHref = getDashboardPath(currentUser.userType);
  loginLink.textContent = `Hi, ${label}`;
  loginLink.href = dashboardHref;

  if (primaryCta) {
    primaryCta.href = dashboardHref;
    primaryCta.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Open Dashboard
    `;
  }

  if (heroTitle) {
    heroTitle.innerHTML = `<span class="eydot"></span>Welcome back, ${label}`;
  }
}

function navigateToBrowse(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  window.location.href = `browse.html${params.toString() ? `?${params.toString()}` : ''}`;
}

function setupSearch() {
  const form = document.getElementById('homeSearchForm');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    navigateToBrowse({
      q: document.getElementById('homeSearchTalent')?.value?.trim() || '',
      location: document.getElementById('homeSearchLocation')?.value?.trim() || '',
      date: document.getElementById('homeSearchDate')?.value || ''
    });
  });
}

function setupFeaturedActions() {
  document.querySelectorAll('.abk').forEach(button => {
    button.addEventListener('click', () => {
      navigateToBrowse({ q: button.dataset.search || '' });
    });
  });
}

function animateCounts() {
  const targets = document.querySelectorAll('.sin, .hs-n');
  const numberPattern = /[\d.]+/;

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      if (entry.target.querySelector('span')) return;
      const original = entry.target.textContent;
      const match = original.match(numberPattern);
      if (!match) return;
      const finalValue = Number(match[0].replace('.', ''));
      const isDecimal = match[0].includes('.');
      const duration = 1200;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(finalValue * eased);
        const display = isDecimal ? (current / 10).toFixed(1) : current.toLocaleString();
        entry.target.innerHTML = original.replace(numberPattern, display);
        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    });
  }, { threshold: 0.45 });

  targets.forEach(target => countObserver.observe(target));
}

function setupRevealAnimations() {
  document.body.classList.add('anim');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.rev,.rev-l,.rev-r').forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      element.classList.add('on');
    } else {
      observer.observe(element);
    }
  });
}

function setupFeaturedScroller() {
  const track = document.getElementById('atrack');
  document.getElementById('scrollLeft')?.addEventListener('click', () => track?.scrollBy({ left: -273, behavior: 'smooth' }));
  document.getElementById('scrollRight')?.addEventListener('click', () => track?.scrollBy({ left: 273, behavior: 'smooth' }));
}

function setupHeroParticles() {
  const hero = document.querySelector('.hero');
  const particleColors = ['rgba(139,46,200,', 'rgba(170,220,0,', 'rgba(245,166,35,'];
  if (!hero) return;

  for (let index = 0; index < 30; index += 1) {
    const particle = document.createElement('div');
    const opacity = (Math.random() * 0.45 + 0.1).toFixed(2);
    const size = (Math.random() * 3 + 1).toFixed(1);
    particle.style.cssText = [
      'position:absolute',
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      `background:${particleColors[index % 3]}${opacity})`,
      `left:${(Math.random() * 100).toFixed(1)}%`,
      `top:${(Math.random() * 100).toFixed(1)}%`,
      'pointer-events:none',
      'z-index:1',
      `animation:pdrift ${(Math.random() * 9 + 6).toFixed(1)}s ease-in-out infinite`,
      `animation-delay:${(Math.random() * 7).toFixed(1)}s`
    ].join(';');
    hero.appendChild(particle);
  }

  const particleStyle = document.createElement('style');
  particleStyle.textContent = '@keyframes pdrift{0%,100%{transform:translate(0,0) scale(1);opacity:.2}33%{transform:translate(18px,-16px) scale(1.8);opacity:.85}66%{transform:translate(-14px,20px) scale(.7);opacity:.15}}';
  document.head.appendChild(particleStyle);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnUSD')?.classList.toggle('act', mode === 'USD');
  document.getElementById('btnZMW')?.classList.toggle('act', mode === 'ZMW');
  renderPrices();
  personalizeHome();
  setupSearch();
  setupFeaturedActions();
  setupRevealAnimations();
  setupFeaturedScroller();
  setupHeroParticles();
  animateCounts();
});

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav?.classList.toggle('stuck', window.scrollY > 80), { passive: true });
