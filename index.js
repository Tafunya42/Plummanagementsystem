
/* ── CURRENCY TOGGLE ──────────────────────────────────────── */
const RATE = 27.5;
let mode = localStorage.getItem('plum_currency') || 'USD';

function fmtUSD(n) {
  return '$' + Number(n).toLocaleString('en-US');
}
function fmtZMW(n) {
  const k = Math.round(Number(n) * RATE);
  return 'K\u00A0' + k.toLocaleString('en-US');
}
function fmt(n) { return mode === 'ZMW' ? fmtZMW(n) : fmtUSD(n); }

function renderPrices() {
  /* artist cards */
  document.querySelectorAll('.price-val').forEach(el => {
    const usd = el.dataset.usd;
    el.innerHTML = fmt(usd) + ' <small>/ event</small>';
  });
  /* hero pill */
  document.querySelectorAll('.price-pill').forEach(el => {
    const usd = el.dataset.usd;
    el.textContent = 'From ' + fmt(usd) + ' / event';
  });
}

function setCurr(m) {
  mode = m;
  localStorage.setItem('plum_currency', m);
  document.getElementById('btnUSD').classList.toggle('act', m === 'USD');
  document.getElementById('btnZMW').classList.toggle('act', m === 'ZMW');
  renderPrices();
}

// Initialize currency on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnUSD').classList.toggle('act', mode === 'USD');
  document.getElementById('btnZMW').classList.toggle('act', mode === 'ZMW');
  renderPrices();
});

/* ── NAV STICK ────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 80);
}, { passive: true });

/* ── REVEAL ON SCROLL ─────────────────────────────────────── */
// Enable animation — without this class all content stays visible (safe fallback)
document.body.classList.add('anim');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); observer.unobserve(e.target); }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.rev,.rev-l,.rev-r').forEach(el => {
  const r = el.getBoundingClientRect();
  // already in viewport → show immediately, no delay
  if (r.top < window.innerHeight && r.bottom > 0) {
    el.classList.add('on');
  } else {
    observer.observe(el);
  }
});

/* ── ARTIST TRACK SCROLL ──────────────────────────────────── */
const track = document.getElementById('atrack');
document.getElementById('scrollLeft').addEventListener('click',  () => track.scrollBy({ left: -273, behavior: 'smooth' }));
document.getElementById('scrollRight').addEventListener('click', () => track.scrollBy({ left:  273, behavior: 'smooth' }));

/* ── FLOATING PARTICLES ───────────────────────────────────── */
const heroEl = document.querySelector('.hero');
const pc = ['rgba(139,46,200,', 'rgba(170,220,0,', 'rgba(245,166,35,'];
for (let i = 0; i < 30; i++) {
  const d = document.createElement('div');
  const op = (Math.random() * .45 + .1).toFixed(2);
  const sz = (Math.random() * 3 + 1).toFixed(1);
  d.style.cssText = [
    'position:absolute',
    `width:${sz}px`, `height:${sz}px`,
    'border-radius:50%',
    `background:${pc[i % 3]}${op})`,
    `left:${(Math.random()*100).toFixed(1)}%`,
    `top:${(Math.random()*100).toFixed(1)}%`,
    'pointer-events:none', 'z-index:1',
    `animation:pdrift ${(Math.random()*9+6).toFixed(1)}s ease-in-out infinite`,
    `animation-delay:${(Math.random()*7).toFixed(1)}s`
  ].join(';');
  heroEl.appendChild(d);
}
const pst = document.createElement('style');
pst.textContent = '@keyframes pdrift{0%,100%{transform:translate(0,0) scale(1);opacity:.2}33%{transform:translate(18px,-16px) scale(1.8);opacity:.85}66%{transform:translate(-14px,20px) scale(.7);opacity:.15}}';
document.head.appendChild(pst);

/* ── INITIAL PRICE RENDER ─────────────────────────────────── */
renderPrices();

