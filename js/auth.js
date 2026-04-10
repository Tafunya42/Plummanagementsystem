let currentMode = 'login';
let currentRole = 'artist';

const { getUsers, saveUsers, setCurrentUser, DEFAULT_CURRENCY, getDashboardPath } = window.PlumPlatform;

(function spawnNotes() {
  const wrap = document.getElementById('notesWrap');
  if (!wrap) return;
  const notePaths = [
    '<svg width="24" height="24" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/></svg>',
    '<svg width="16" height="16" viewBox="0 0 24 24" style="fill:none;stroke-width:1.5"><circle cx="12" cy="12" r="3"/><path d="M12 9V3"/><path d="M12 3l4 2"/></svg>'
  ];
  const colors = ['rgba(170,220,0,', 'rgba(139,46,200,', 'rgba(245,166,35,'];

  function spawn() {
    const note = document.createElement('div');
    const colorIndex = Math.floor(Math.random() * 3);
    const opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
    note.className = 'note';
    note.style.cssText = `left:${(Math.random() * 80 + 5).toFixed(1)}%;bottom:${(Math.random() * 30 + 10).toFixed(1)}%;color:${colors[colorIndex]}${opacity});animation-duration:${(Math.random() * 4 + 4).toFixed(1)}s;animation-delay:${(Math.random() * 5).toFixed(1)}s;`;
    note.innerHTML = notePaths[colorIndex];
    note.querySelector('svg').style.stroke = `${colors[colorIndex]}${opacity})`;
    wrap.appendChild(note);
    setTimeout(() => {
      if (wrap.contains(note)) wrap.removeChild(note);
      spawn();
    }, (parseFloat(note.style.animationDuration) + parseFloat(note.style.animationDelay)) * 1000 + 200);
  }

  for (let index = 0; index < 8; index += 1) {
    setTimeout(spawn, index * 700);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const rateCurrency = document.getElementById('rateCurr');
  if (rateCurrency) rateCurrency.value = DEFAULT_CURRENCY;
});

function setMode(mode) {
  currentMode = mode;
  document.getElementById('loginPanel').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('registerPanel').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('adminPanel').style.display = mode === 'admin' ? 'block' : 'none';
  document.getElementById('modeLogin').classList.toggle('act', mode === 'login');
  document.getElementById('modeRegister').classList.toggle('act', mode === 'register');
  document.getElementById('modeAdmin').classList.toggle('act', mode === 'admin');
}

function selectRole(role) {
  currentRole = role;
  document.getElementById('roleArtist').classList.toggle('sel', role === 'artist');
  document.getElementById('roleOrg').classList.toggle('sel', role === 'organizer');
}

function goStep(step) {
  if (step === 3) {
    const requiredIds = ['regFirst', 'regLast', 'regEmail', 'regPhone'];
    if (requiredIds.some(id => !document.getElementById(id).value.trim())) {
      showMsg('regMsg', 'Please fill in all required account fields before continuing.', 'err');
      return;
    }
    hideMsg('regMsg');
  }

  document.querySelectorAll('.step-panel').forEach(panel => panel.classList.remove('on'));
  document.getElementById(`step${step}`).classList.add('on');

  if (step === 2) {
    const isArtist = currentRole === 'artist';
    document.getElementById('artistFields').style.display = isArtist ? 'block' : 'none';
    document.getElementById('orgFields').style.display = isArtist ? 'none' : 'block';
    document.getElementById('stageName').required = isArtist;
    document.getElementById('orgName').required = !isArtist;
    const heading = document.getElementById('step2Heading');
    heading.querySelector('h2').textContent = isArtist ? 'Artist details' : 'Organizer details';
    heading.querySelector('p').textContent = isArtist ? 'Set up your performer profile' : 'Tell us about your events business';
  }
}

function togglePw(id, button) {
  const input = document.getElementById(id);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  button.innerHTML = showing
    ? '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;width:15px;height:15px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    : '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:2;width:15px;height:15px"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
}

function checkPwStrength(value) {
  const bars = [1, 2, 3, 4].map(index => document.getElementById(`psb${index}`));
  const colors = ['#ef4444', '#f97316', 'var(--a)', 'var(--l)'];
  const labels = ['Too short', 'Weak, add numbers or symbols', 'Medium, almost there', 'Strong password'];
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  if (value.length >= 12) score += 1;
  bars.forEach((bar, index) => { bar.style.background = index < score ? colors[score - 1] : 'var(--bd)'; });
  document.getElementById('pwStrengthTxt').textContent = score ? labels[score - 1] : 'Enter a password to see strength';
}

function socialLogin(provider) {
  toast(`Redirecting to ${provider}...`);
}

function handleAdminLogin(event) {
  event.preventDefault();
  const adminEmail = document.getElementById('adminEmail').value.trim().toLowerCase();
  const adminPassword = document.getElementById('adminPass').value;
  
  // Hardcoded admin credentials (in production, verify against backend)
  const ADMIN_EMAIL = 'admin@plum.com';
  const ADMIN_PASSWORD = 'Admin@123456';
  
  if (adminEmail !== ADMIN_EMAIL || adminPassword !== ADMIN_PASSWORD) {
    showMsg('adminMsg', 'Invalid admin credentials. Please check email and password.', 'err');
    return;
  }
  
  // Set admin user and redirect
  setCurrentUser({ id: 'admin-user', email: adminEmail, userType: 'admin' });
  showMsg('adminMsg', 'Admin access granted. Redirecting to dashboard...', 'ok');
  setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;
  const user = getUsers().find(entry => (entry.email || '').toLowerCase() === email && entry.password === password);
  if (!user) return showMsg('loginMsg', 'Invalid email or password. Please try again.', 'err');

  setCurrentUser({ id: user.id, email: user.email, userType: user.userType });
  showMsg('loginMsg', 'Welcome back. Redirecting...', 'ok');
  const target = user.userType === 'admin' ? 'admin.html' : getDashboardPath(user.userType);
  setTimeout(() => { window.location.href = target; }, 1000);
}

function handleRegister(event) {
  event?.preventDefault();
  goStep(3);
}

function finalRegister() {
  const password = document.getElementById('regPass').value;
  const confirmation = document.getElementById('regPassConf').value;
  if (password.length < 8) return showMsg('regMsg', 'Password must be at least 8 characters.', 'err');
  if (password !== confirmation) return showMsg('regMsg', 'Passwords do not match.', 'err');
  if (!document.getElementById('termsCheck').checked) return showMsg('regMsg', 'Please accept the terms to continue.', 'err');

  const users = getUsers();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  if (users.some(user => (user.email || '').toLowerCase() === email)) {
    return showMsg('regMsg', 'An account with that email already exists.', 'err');
  }

  const userData = {
    id: Date.now().toString(),
    email,
    password,
    firstName: document.getElementById('regFirst').value.trim(),
    lastName: document.getElementById('regLast').value.trim(),
    phone: document.getElementById('regPhone').value.trim(),
    city: document.getElementById('regCity').value,
    userType: currentRole,
    stageName: currentRole === 'artist' ? document.getElementById('stageName').value.trim() : '',
    genre: currentRole === 'artist' ? document.getElementById('genre').value : '',
    experience: currentRole === 'artist' ? document.getElementById('experience').value : '',
    bio: currentRole === 'artist' ? document.getElementById('bio').value.trim() : '',
    rateAmt: currentRole === 'artist' ? document.getElementById('rateAmt').value : '',
    rateCurr: currentRole === 'artist' ? (document.getElementById('rateCurr').value || DEFAULT_CURRENCY) : '',
    orgName: currentRole === 'organizer' ? document.getElementById('orgName').value.trim() : '',
    orgType: currentRole === 'organizer' ? document.getElementById('orgType').value : '',
    eventTypes: currentRole === 'organizer' ? [...document.querySelectorAll('#eventTypeWrap input:checked')].map(input => input.value) : [],
    eventsPerYear: currentRole === 'organizer' ? document.getElementById('eventsPerYear').value : '',
    createdAt: new Date().toISOString(),
    verified: false,
    suspended: false
  };

  users.push(userData);
  saveUsers(users);
  setCurrentUser({ id: userData.id, email: userData.email, userType: userData.userType });
  showMsg('regMsg', currentRole === 'artist' ? 'Artist profile created. Preparing your dashboard...' : 'Organizer account created. Redirecting...', 'ok');
  setTimeout(() => { window.location.href = getDashboardPath(currentRole); }, 1300);
}

function showMsg(id, text, type) {
  const element = document.getElementById(id);
  element.textContent = text;
  element.className = `msg show ${type}`;
}

function hideMsg(id) {
  document.getElementById(id).className = 'msg';
}

function toast(message) {
  const element = document.createElement('div');
  element.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg4);border:1px solid var(--bb);color:var(--iv);padding:11px 24px;border-radius:100px;font-size:.8rem;font-weight:600;z-index:9998;box-shadow:0 8px 28px rgba(0,0,0,.4)';
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2400);
}
