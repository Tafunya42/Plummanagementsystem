

/* ── STATE ────────────────────────────────────────────────── */
let currentMode = 'login';
let currentRole = 'artist';
let currentStep = 1;

/* ── FLOATING MUSIC NOTES ─────────────────────────────────── */
(function spawnNotes() {
  const wrap = document.getElementById('notesWrap');
  const notePaths = [
    '<svg width="24" height="24" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><circle cx="12" cy="12" r="3"/><path d="M12 9V3"/><path d="M12 3l4 2"/></svg>'
  ];
  const colors = ['rgba(170,220,0,', 'rgba(139,46,200,', 'rgba(245,166,35,'];

  function spawn() {
    const el = document.createElement('div');
    el.className = 'note';
    const ci = Math.floor(Math.random() * 3);
    const op = (Math.random() * .5 + .4).toFixed(2);
    el.style.cssText = `
      left:${(Math.random()*80+5).toFixed(1)}%;
      bottom:${(Math.random()*30+10).toFixed(1)}%;
      color:${colors[ci]}${op});
      animation-duration:${(Math.random()*4+4).toFixed(1)}s;
      animation-delay:${(Math.random()*5).toFixed(1)}s;
    `;
    el.innerHTML = notePaths[ci % notePaths.length];
    el.querySelector('svg').style.stroke = `${colors[ci]}${op})`;
    wrap.appendChild(el);
    setTimeout(() => { wrap.removeChild(el); spawn(); }, (parseFloat(el.style.animationDuration) + parseFloat(el.style.animationDelay)) * 1000 + 200);
  }
  for(let i=0;i<8;i++) setTimeout(spawn, i * 700);
})();

/* ── MODE TOGGLE ──────────────────────────────────────────── */
function setMode(m) {
  currentMode = m;
  document.getElementById('loginPanel').style.display = m==='login' ? 'block' : 'none';
  document.getElementById('registerPanel').style.display = m==='register' ? 'block' : 'none';
  document.getElementById('modeLogin').classList.toggle('act', m==='login');
  document.getElementById('modeRegister').classList.toggle('act', m==='register');
}

/* ── ROLE SELECT ──────────────────────────────────────────── */
function selectRole(r) {
  currentRole = r;
  document.getElementById('roleArtist').classList.toggle('sel', r==='artist');
  document.getElementById('roleOrg').classList.toggle('sel', r==='organizer');
}

/* ── STEP NAV ─────────────────────────────────────────────── */
function goStep(n) {
  if(n===3) {
    // validate step 2 basics
    const first = document.getElementById('regFirst').value.trim();
    const last  = document.getElementById('regLast').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    if(!first||!last||!email||!phone) { showMsg('regMsg','Please fill in all required fields.','err'); return; }
    hideMsg('regMsg');
  }

  document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('step'+n).classList.add('on');
  currentStep = n;

  // update role-specific fields
  if(n===2) {
    const isArtist = currentRole==='artist';
    document.getElementById('artistFields').style.display = isArtist ? 'block' : 'none';
    document.getElementById('orgFields').style.display    = isArtist ? 'none' : 'block';
    const h = document.getElementById('step2Heading');
    h.querySelector('h2').textContent = isArtist ? 'Artist details' : 'Organizer details';
    h.querySelector('p').textContent  = isArtist ? 'Set up your performer profile' : 'Tell us about your events business';
    // required toggle
    document.getElementById('stageName').required = isArtist;
    document.getElementById('orgName').required = !isArtist;
  }
}

/* ── PASSWORD VISIBILITY ──────────────────────────────────── */
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const showing = inp.type === 'text';
  inp.type = showing ? 'password' : 'text';
  btn.innerHTML = showing
    ? '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;width:15px;height:15px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    : '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;width:15px;height:15px"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
}

/* ── PASSWORD STRENGTH ────────────────────────────────────── */
function checkPwStrength(v) {
  const bars = [1,2,3,4].map(i=>document.getElementById('psb'+i));
  const clrs = ['#ef4444','#f97316','var(--a)','var(--l)'];
  const txts = ['Too short','Weak — add numbers or symbols','Medium — getting better!','Strong password ✓'];
  let score = 0;
  if(v.length>=8) score++;
  if(/[0-9]/.test(v)) score++;
  if(/[^a-zA-Z0-9]/.test(v)) score++;
  if(v.length>=12) score++;
  bars.forEach((b,i)=>{ b.style.background = i<score ? clrs[score-1] : 'var(--bd)'; });
  document.getElementById('pwStrengthTxt').textContent = score>0 ? txts[score-1] : 'Enter a password to see strength';
}

/* ── SOCIAL LOGIN STUB ────────────────────────────────────── */
function socialLogin(provider) {
  toast(`Redirecting to ${provider}…`, 'info');
}

/* ── LOGIN HANDLER ────────────────────────────────────────── */
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const users = JSON.parse(localStorage.getItem('plum_users')||'[]');
  const user  = users.find(u=>u.email===email && u.password===pass);
  if(!user) { showMsg('loginMsg','Invalid email or password. Please try again.','err'); return; }
  localStorage.setItem('plum_current_user', JSON.stringify({id:user.id,email:user.email,userType:user.userType}));
  showMsg('loginMsg','Welcome back! Redirecting…','ok');
  const redirectUrl = user.userType === 'organizer' ? 'organizer-profile.html' : 'artist-profile.html';
  setTimeout(()=>{ window.location.href=redirectUrl; }, 1200);
}

/* ── FINAL REGISTER ───────────────────────────────────────── */
function finalRegister() {
  const pass  = document.getElementById('regPass').value;
  const conf  = document.getElementById('regPassConf').value;
  const terms = document.getElementById('termsCheck').checked;
  if(pass.length<8) { showMsg('regMsg','Password must be at least 8 characters.','err'); return; }
  if(pass!==conf)   { showMsg('regMsg','Passwords do not match.','err'); return; }
  if(!terms)        { showMsg('regMsg','Please accept the terms to continue.','err'); return; }

  const userData = {
    id: Date.now().toString(),
    email:    document.getElementById('regEmail').value.trim(),
    password: pass,
    firstName:document.getElementById('regFirst').value.trim(),
    lastName: document.getElementById('regLast').value.trim(),
    phone:    document.getElementById('regPhone').value.trim(),
    city:     document.getElementById('regCity').value,
    userType: currentRole,
    // role extras
    stageName:   currentRole==='artist'   ? document.getElementById('stageName').value : '',
    genre:       currentRole==='artist'   ? document.getElementById('genre').value : '',
    experience:  currentRole==='artist'   ? document.getElementById('experience').value : '',
    bio:         currentRole==='artist'   ? document.getElementById('bio').value : '',
    rateAmt:     currentRole==='artist'   ? document.getElementById('rateAmt').value : '',
    rateCurr:    currentRole==='artist'   ? document.getElementById('rateCurr').value : '',
    orgName:     currentRole==='organizer'? document.getElementById('orgName').value : '',
    orgType:     currentRole==='organizer'? document.getElementById('orgType').value : '',
    eventsPerYear:currentRole==='organizer'?document.getElementById('eventsPerYear').value:'',
    createdAt: new Date().toISOString()
  };

  const users = JSON.parse(localStorage.getItem('plum_users')||'[]');
  if(users.find(u=>u.email===userData.email)) {
    showMsg('regMsg','An account with that email already exists.','err');
    return;
  }
  users.push(userData);
  localStorage.setItem('plum_users', JSON.stringify(users));
  localStorage.setItem('plum_current_user', JSON.stringify({id:userData.id,email:userData.email,userType:userData.userType}));

  showMsg('regMsg', currentRole==='artist'
    ? '🎉 Artist profile created! Setting up your dashboard…'
    : '🎉 Organizer account created! Redirecting…', 'ok');
  const redirectUrl = currentRole === 'organizer' ? 'organizer-profile.html' : 'artist-profile.html';
  setTimeout(()=>{ window.location.href=redirectUrl; }, 1600);
}

/* ── HELPERS ──────────────────────────────────────────────── */
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg show ' + type;
}
function hideMsg(id) {
  const el = document.getElementById(id);
  el.className = 'msg';
}
function toast(msg) {
  const t = document.createElement('div');
  t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg4);border:1px solid var(--bb);color:var(--iv);padding:11px 24px;border-radius:100px;font-size:.8rem;font-weight:600;z-index:9998;box-shadow:0 8px 28px rgba(0,0,0,.4)';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2400);
}