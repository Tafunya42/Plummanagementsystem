// ── CURSOR DOT ONLY ──────────────────────────────────────
const dot = document.getElementById('cursorDot');
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';
});
document.querySelectorAll('a,button,.cat-card,.talent-card,.step-card,.testi-card,.stat-card,.ic-card').forEach(el => {
  el.addEventListener('mouseenter', () => dot.classList.add('hovered'));
  el.addEventListener('mouseleave', () => dot.classList.remove('hovered'));
});

// ── PARTICLES ──────────────────────────────────────────
(function spawnParticles() {
  const c = document.getElementById('particleContainer');
  const cols = ['rgba(137,41,201,0.5)','rgba(184,217,0,0.4)','rgba(245,184,0,0.4)','rgba(137,41,201,0.3)'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    const sz = Math.random() * 4 + 1;
    p.className = 'particle';
    p.style.cssText = `width:${sz}px;height:${sz}px;background:${cols[i%cols.length]};
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*18+10}s;
      animation-delay:${Math.random()*12}s;`;
    c.appendChild(p);
  }
})();

// ── NAVBAR SCROLL ──────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
});

// ── MOBILE MENU ────────────────────────────────────────
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('mobileNav').classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('mobileClose').addEventListener('click', closeMobile);
function closeMobile() {
  document.getElementById('mobileNav').classList.remove('open');
  document.body.style.overflow = '';
}

// ── SCROLL REVEAL ──────────────────────────────────────
new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
.observe.bind(null); // override below
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── COUNTER ANIMATION ──────────────────────────────────
function animCount(el, target, suffix, dur=1800) {
  let start;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const cntObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = '1';
      animCount(e.target, +e.target.dataset.target, e.target.dataset.suffix || '');
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));

// ── BIG NUM special (has inner <span>) ─────────────────
const bigNumEl = document.getElementById('bigNum');
if (bigNumEl) {
  const bigObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !bigNumEl.dataset.done) {
      bigNumEl.dataset.done = '1';
      let start;
      const target = 5200;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 2200, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        bigNumEl.innerHTML = Math.floor(ease * target).toLocaleString() + '<span style="color:var(--lime-dk)">+</span>';
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.4 });
  bigObs.observe(bigNumEl);
}

// ── SMOOTH SCROLL ──────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── CATS ROW 2 RESPONSIVE ─────────────────────────────
function layoutCats() {
  const r = document.querySelector('.cats-row2');
  if (!r) return;
  r.style.gridTemplateColumns = window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4,1fr)';
}
layoutCats();
window.addEventListener('resize', layoutCats);
