/* ─── Initialize Platform Data ─── */
document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
  const { getCurrentUser, getUserById, getProfileById, getDashboardPath } = window.PlumPlatform;
  const currentUser = getCurrentUser();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.userType !== 'organizer') {
    window.location.href = getDashboardPath(currentUser.userType);
    return;
  }

  const user = getUserById(currentUser.id);
  const profile = getProfileById(currentUser.id) || {};
  const personalInfo = profile.personalInfo || {};
  const roleInfo = profile.roleSpecificInfo || {};

  // Populate sidebar with user data
  const sbAvatar = document.querySelector('.sb-avatar');
  const sbName = document.querySelector('.uname');
  const sbBudget = document.querySelector('.sb-budget-amt');

  if (sbAvatar) sbAvatar.textContent = (user?.firstName?.[0] || 'O') + (user?.lastName?.[0] || 'O');
  if (sbName) sbName.textContent = personalInfo.firstName && personalInfo.lastName 
    ? `${personalInfo.firstName} ${personalInfo.lastName}` 
    : user?.firstName ? `${user.firstName} ${user.lastName}` : 'Organizer';
  if (sbBudget) sbBudget.textContent = roleInfo.budget || 'Flexible';

  // Load preview data
  loadPreviewData(user, profile);
  
  // Load profile form with user data
  loadProfileForm(user, profile);
}

function loadPreviewData(user, profile) {
  const personalInfo = profile?.personalInfo || {};
  const roleInfo = profile?.roleSpecificInfo || {};

  document.getElementById('previewName').textContent = roleInfo.organizationName || user.orgName || 'Organization';
  document.getElementById('previewRole').textContent = roleInfo.organizationType || user.orgType || 'Organizer';
  document.getElementById('previewLocation').textContent = `${personalInfo.city || user.city || 'Lusaka'}, ${personalInfo.country || 'Zambia'}`;
  document.getElementById('previewBio').textContent = personalInfo.bio || user.bio || 'Professional event organizer.';
  document.getElementById('previewAvatar').src = personalInfo.profilePhoto || user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer';
  document.getElementById('previewCover').style.backgroundImage = `url('${user.coverImage || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80'}')`;
}

function loadProfileForm(user, profile) {
  const personalInfo = profile?.personalInfo || {};
  const roleInfo = profile?.roleSpecificInfo || {};

  // Populate form fields with existing data
  const formFields = {
    dashFirstName: personalInfo.firstName || user?.firstName || '',
    dashLastName: personalInfo.lastName || user?.lastName || '',
    dashOrgName: roleInfo.organizationName || user?.orgName || '',
    dashOrgType: roleInfo.organizationType || user?.orgType || 'Event Agency',
    dashCity: personalInfo.city || user?.city || 'Lusaka',
    dashCountry: personalInfo.country || 'Zambia',
    dashPhone: personalInfo.phone || user?.phone || '',
    dashEventsPerYear: roleInfo.eventsPerYear || user?.eventsPerYear || '6-12 events',
    dashBio: personalInfo.bio || user?.bio || '',
    dashBudget: roleInfo.budget || '',
    dashWebsite: roleInfo.website || '',
    dashSocialMedia: roleInfo.socialLinks || '',
    dashPhoto: personalInfo.profilePhoto || user?.image || '',
    dashCover: user?.coverImage || ''
  };

  Object.keys(formFields).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = formFields[fieldId];
  });
}

/* ─── Tab switching ─── */
const tabTitles = { overview:'Dashboard', pipeline:'Event Pipeline', requests:'My Requests', talent:'Browse Talent', spending:'Spending Report', history:'Booking History', profile:'Edit Profile' };

function showTab(id, navEl) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));

  document.getElementById('tab-' + id)?.classList.add('active');
  document.querySelectorAll('[data-tab="' + id + '"]').forEach(t => t.classList.add('active'));
  if (navEl) navEl.classList.add('active');
  document.getElementById('topbarTitle').textContent = tabTitles[id] || 'Dashboard';

  // lazy-build charts
  if (id === 'overview' && !window._overviewBuilt) buildOverviewChart();
  if (id === 'spending' && !window._spendBuilt) buildSpendChart();
  
  // Load talent data when Browse Talent tab is opened
  if (id === 'talent') loadTalentBrowse();
}

/* ─── Overview chart ─── */
function buildOverviewChart() {
  window._overviewBuilt = true;
  const ctx = document.getElementById('overviewChart').getContext('2d');
  window._oChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
      datasets: [{
        data: [4200, 6500, 22000, 5200, 7800, 9200, 14500],
        backgroundColor: ctx2 => {
          const i = ctx2.dataIndex;
          const arr = [4200,6500,22000,5200,7800,9200,14500];
          return i === arr.length - 1 ? '#c7d20f' : 'rgba(199,210,15,0.18)';
        },
        borderRadius: 5, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' K ' + c.raw.toLocaleString() } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 }, callback: v => 'K ' + (v/1000).toFixed(0) + 'k' }, border: { display: false } }
      }
    }
  });
}

function switchOChart(type, el) {
  document.querySelectorAll('.ph .btn').forEach(b => b.classList.remove('btn-active'));
  el.classList.add('btn-active');
  if (type === 'event') {
    window._oChart.data.labels = ['Corporate','Festival','Wedding','Private','Concert'];
    window._oChart.data.datasets[0].data = [19500, 14500, 9200, 5000, 0];
  } else {
    window._oChart.data.labels = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
    window._oChart.data.datasets[0].data = [4200,6500,22000,5200,7800,9200,14500];
  }
  window._oChart.update();
}

/* ─── Spending chart ─── */
function buildSpendChart() {
  window._spendBuilt = true;
  const ctx = document.getElementById('spendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{
        data: [5200, 22300, 9200, 8500, 3000, 0],
        borderColor: '#c7d20f', backgroundColor: 'rgba(199,210,15,0.07)',
        borderWidth: 2, tension: 0.4, fill: true,
        pointBackgroundColor: '#c7d20f', pointRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' K ' + c.raw.toLocaleString() } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 }, callback: v => 'K ' + (v/1000).toFixed(0) + 'k' }, border: { display: false } }
      }
    }
  });
}

/* ─── Save profile ─── */
function saveProfile() {
  showToast('Profile saved successfully.');
  const { getCurrentUser, getProfiles, saveProfiles } = window.PlumPlatform;
  const user = getCurrentUser();
  if (user && window.PlumPlatform) {
    const profiles = getProfiles();
    if (!profiles[user.id]) profiles[user.id] = {};
    if (!profiles[user.id].roleSpecificInfo) profiles[user.id].roleSpecificInfo = {};
    if (!profiles[user.id].personalInfo) profiles[user.id].personalInfo = {};
    
    profiles[user.id].personalInfo.firstName = document.getElementById('dashFirstName')?.value || '';
    profiles[user.id].personalInfo.lastName = document.getElementById('dashLastName')?.value || '';
    profiles[user.id].personalInfo.phone = document.getElementById('dashPhone')?.value || '';
    profiles[user.id].personalInfo.city = document.getElementById('dashCity')?.value || '';
    profiles[user.id].personalInfo.bio = document.getElementById('dashBio')?.value || '';
    profiles[user.id].roleSpecificInfo.organizationName = document.getElementById('dashOrgName')?.value || '';
    profiles[user.id].roleSpecificInfo.organizationType = document.getElementById('dashOrgType')?.value || '';
    profiles[user.id].roleSpecificInfo.budget = document.getElementById('dashBudget')?.value || '';
    profiles[user.id].roleSpecificInfo.website = document.getElementById('dashWebsite')?.value || '';
    
    saveProfiles(profiles);
    loadPreviewData(window.PlumPlatform.getUserById(user.id), profiles[user.id]);
  }
}

/* ─── Talent Browsing ─── */
function loadTalentBrowse() {
  if (window._talentLoaded) return;
  window._talentLoaded = true;
  
  const { getArtists, setSelectedProfile, getCurrentUser } = window.PlumPlatform;
  const talentGrid = document.querySelector('.talent-grid');
  if (!talentGrid) return;
  
  const artists = getArtists();
  talentGrid.innerHTML = artists.map(artist => `
    <div class="tc">
      <div class="tc-head">
        <div class="tc-av" style="background:linear-gradient(135deg,#8b5cf6,#ef8f27)">${artist.profile.name.substring(0, 2).toUpperCase()}</div>
        <button class="tc-saved" onclick="toggleSave(this, ${artist.id})" title="Save talent">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="tc-name">${artist.profile.name}</div>
      <div class="tc-genre">${artist.profile.category}</div>
      <div class="tc-stars">★★★★★ <span style="color:var(--muted);font-size:10px">${artist.rating} (Reviews)</span></div>
      <div class="tc-loc"><svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${artist.profile.location}</div>
      <div class="tc-rate">Rate: Contact for quote</div>
      <div class="tc-footer">
        <button class="btn btn-sm" onclick="requestTalent(${artist.id}, '${artist.profile.name}')">Request</button>
        <button class="btn btn-sm btn-purple" onclick="viewArtistProfile(${artist.id})">Profile</button>
      </div>
    </div>
  `).join('');
}

function requestTalent(artistId, artistName) {
  const { getCurrentUser, createBooking } = window.PlumPlatform;
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Please login to send booking requests.', 'error');
    return;
  }
  
  const booking = createBooking({
    artistId: artistId,
    organizerId: currentUser.id,
    artistName: artistName,
    organizerName: document.querySelector('.uname')?.textContent || 'Organizer',
    status: 'pending',
    amount: 0,
    message: 'Booking request sent',
    eventDate: new Date().toISOString()
  });
  
  showToast(`Booking request sent to ${artistName}!`);
}

function viewArtistProfile(artistId) {
  const { setSelectedProfile } = window.PlumPlatform;
  setSelectedProfile(artistId);
  window.location.href = 'artist-profile.html';
}

function toggleSave(btn, artistId) {
  const { toggleSavedProfile } = window.PlumPlatform;
  const isSaved = toggleSavedProfile(artistId);
  btn.classList.toggle('on', isSaved);
  showToast(isSaved ? 'Added to shortlist' : 'Removed from shortlist');
}

/* ─── Modals ─── */
function showNewEventModal() { document.getElementById('newEventModal').classList.add('open'); }
function showNewRequestModal() { document.getElementById('newRequestModal').classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));

/* ─── Notifications ─── */
function markAllRead() {
  document.querySelectorAll('.act-unread').forEach(d => d.remove());
  document.querySelector('.t-btn .dot')?.remove();
  showToast('All notifications marked as read.');
}

/* ─── Toast ─── */
let _toastT;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─── Init ─── */
// buildOverviewChart is called on tab open, not on page load


