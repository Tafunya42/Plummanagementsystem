
/* ── TABS ──────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const t = this.dataset.tab;
    this.closest('.card').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
    this.closest('.card').querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
    this.classList.add('on');
    this.closest('.card').querySelector(`.tab-pane[data-tab="${t}"]`).classList.add('on');
  });
});

/* ── GALLERY LIGHTBOX ──────────────────────────────────────── */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
document.querySelectorAll('.gal-item').forEach(item => {
  item.addEventListener('click', () => {
    lbImg.src = item.dataset.src;
    lb.classList.add('on');
  });
});
document.getElementById('lightboxClose').addEventListener('click', () => lb.classList.remove('on'));
lb.addEventListener('click', e => { if(e.target === lb) lb.classList.remove('on'); });

/* ── BOOKING MODAL ─────────────────────────────────────────── */
const modal = document.getElementById('bookModal');
document.getElementById('bookBtn').addEventListener('click',  () => modal.classList.add('on'));
document.getElementById('bookBtn2').addEventListener('click', () => modal.classList.add('on'));
document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('on'));
modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('on'); });
document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  modal.classList.remove('on');
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#8B2EC8,#B06CE6);color:#fff;padding:14px 28px;border-radius:100px;font-size:.85rem;font-weight:600;z-index:9998;box-shadow:0 8px 32px rgba(0,0,0,.4);letter-spacing:.02em';
  toast.textContent = '✓ Booking request sent! Chanda will respond within 2 hours.';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
});

/* ── SAVE BUTTON ───────────────────────────────────────────── */
const saveBtn = document.getElementById('saveBtn');
let saved = false;
saveBtn.addEventListener('click', function() {
  saved = !saved;
  if(saved) {
    this.innerHTML = '<svg viewBox="0 0 24 24" style="fill:#ef4444;stroke:#ef4444;width:15px;height:15px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved';
    this.style.borderColor = '#ef4444';
    this.style.color = '#ef4444';
  } else {
    this.innerHTML = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;width:15px;height:15px;stroke-width:2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Save';
    this.style.borderColor = '';
    this.style.color = '';
  }
});

/* ── SHARE ─────────────────────────────────────────────────── */
document.getElementById('shareBtn').addEventListener('click', () => {
  if(navigator.share) {
    navigator.share({title:'Chanda & The Soul Collective — PLUM',text:'Book this amazing artist for your event!',url:window.location.href});
  } else {
    navigator.clipboard.writeText(window.location.href).catch(()=>{});
    const t = document.createElement('div');
    t.style.cssText='position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#221640;border:1px solid rgba(139,46,200,.5);color:#F0EAF8;padding:12px 24px;border-radius:100px;font-size:.8rem;font-weight:600;z-index:9998';
    t.textContent='Profile link copied to clipboard';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2800);
  }
});

/* ── AUDIO PLAYER ──────────────────────────────────────────── */
let activeBtn=null, activeInterval=null;
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const item = this.closest('.audio-item');
    const fill = item.querySelector('.progress-fill');
    if(this === activeBtn) {
      // pause
      clearInterval(activeInterval);
      this.classList.remove('playing');
      this.innerHTML = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2.2;width:14px;height:14px"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      activeBtn = null; activeInterval = null;
    } else {
      // stop previous
      if(activeBtn) {
        clearInterval(activeInterval);
        activeBtn.classList.remove('playing');
        activeBtn.innerHTML = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2.2;width:14px;height:14px"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        activeBtn.closest('.audio-item').querySelector('.progress-fill').style.width='0%';
      }
      this.classList.add('playing');
      this.innerHTML = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2.2;width:14px;height:14px"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>';
      activeBtn = this;
      let w = 0;
      activeInterval = setInterval(() => {
        w += 1.2;
        fill.style.width = w + '%';
        if(w >= 100) {
          clearInterval(activeInterval);
          this.classList.remove('playing');
          this.innerHTML = '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2.2;width:14px;height:14px"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
          fill.style.width = '0%';
          activeBtn = null;
        }
      }, 90);
    }
  });
});

/* ── CALENDAR ──────────────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
let cal = new Date(2026,3,1);

function renderCal() {
  const grid = document.getElementById('calGrid');
  document.getElementById('calLabel').textContent = MONTHS[cal.getMonth()] + ' ' + cal.getFullYear();
  grid.innerHTML = '';
  DAYS.forEach(d => { const el=document.createElement('div'); el.className='cal-day-name'; el.textContent=d; grid.appendChild(el); });
  const first = new Date(cal.getFullYear(), cal.getMonth(), 1).getDay();
  const total = new Date(cal.getFullYear(), cal.getMonth()+1, 0).getDate();
  const today = new Date();
  for(let i=0;i<first;i++) { const e=document.createElement('div'); e.className='cal-day empty'; grid.appendChild(e); }
  for(let d=1;d<=total;d++) {
    const el = document.createElement('div');
    const isToday = cal.getFullYear()===today.getFullYear() && cal.getMonth()===today.getMonth() && d===today.getDate();
    const av = d<=14 || d%3!==0;
    el.className = 'cal-day ' + (av ? 'av' : 'bk') + (isToday?' today':'');
    el.textContent = d;
    if(av) el.addEventListener('click', () => { modal.classList.add('on'); });
    grid.appendChild(el);
  }
}
document.getElementById('calPrev').addEventListener('click', () => { cal.setMonth(cal.getMonth()-1); renderCal(); });
document.getElementById('calNext').addEventListener('click', () => { cal.setMonth(cal.getMonth()+1); renderCal(); });
renderCal();
