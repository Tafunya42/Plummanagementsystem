document.addEventListener('DOMContentLoaded', () => {
  const {
    escapeHtml,
    getDashboardPath,
    getCurrentUser,
    getUserById,
    getProfileById,
    getSelectedProfile,
    setSelectedProfile,
    getSavedProfiles,
    getBookingsForUser,
    getArtists,
    normalizeOrganizer
  } = window.PlumPlatform;

  const fallbackOrganizer = {
    id: 'sample-organizer',
    userType: 'organizer',
    verified: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=400&fit=crop&q=80',
    profile: {
      name: 'Featured Organizer',
      title: 'Event Organizer',
      bio: 'Experienced event organizer coordinating polished live experiences and vendor-ready event briefs.',
      eventTypes: ['Corporate Events', 'Weddings', 'Private Celebrations'],
      location: 'Lusaka, Zambia',
      website: '',
      budget: 'Flexible',
      eventsPerYear: '6-12 events',
      organizationType: 'Organizer'
    }
  };

  function resolveOrganizer() {
    const currentUser = getCurrentUser();
    const selected = getSelectedProfile();
    const forceMine = new URLSearchParams(window.location.search).get('mine') === '1';

    if (forceMine && currentUser?.userType === 'organizer') {
      const user = getUserById(currentUser.id);
      if (user) {
        const profile = getProfileById(user.id);
        setSelectedProfile({ id: user.id, userType: 'organizer' });
        return { organizer: normalizeOrganizer(user, profile), user, profile, isOwner: true };
      }
    }

    if (selected?.userType === 'organizer') {
      const user = getUserById(selected.id);
      if (user) {
        const profile = getProfileById(user.id);
        return { organizer: normalizeOrganizer(user, profile), user, profile, isOwner: currentUser?.id === user.id };
      }
    }

    if (currentUser?.userType === 'organizer') {
      const user = getUserById(currentUser.id);
      if (user) {
        const profile = getProfileById(user.id);
        setSelectedProfile({ id: user.id, userType: 'organizer' });
        return { organizer: normalizeOrganizer(user, profile), user, profile, isOwner: true };
      }
    }

    return { organizer: fallbackOrganizer, user: null, profile: null, isOwner: false };
  }

  const { organizer, user, profile, isOwner } = resolveOrganizer();
  const roleInfo = profile?.roleSpecificInfo || {};
  const personalInfo = profile?.personalInfo || {};
  const bookings = getBookingsForUser(organizer.id, 'organizer');
  const savedTalent = getSavedProfiles();
  const availableArtists = getArtists([]);
  const responseTime = isOwner ? '< 1 hour' : '4 hours';
  const eventCount = bookings.length || 12;

  function personalizeNav() {
    const loginLink = document.querySelector('.navbar-cta a[href="login.html"]');
    const currentUser = getCurrentUser();
    if (!loginLink || !currentUser) return;
    const navUser = getUserById(currentUser.id);
    loginLink.textContent = isOwner ? 'Edit Dashboard' : `Hi, ${navUser?.firstName || currentUser.email?.split('@')[0] || 'Account'}`;
    loginLink.href = getDashboardPath(currentUser.userType);
  }

  function renderHeader() {
    document.title = `${organizer.profile.name} | Plum Organizer Profile`;
    document.querySelector('.cover-image')?.setAttribute('src', user?.coverImage || fallbackOrganizer.coverImage);
    document.querySelector('.cover-image')?.setAttribute('alt', organizer.profile.name);
    document.querySelector('.profile-photo')?.setAttribute('src', organizer.image || fallbackOrganizer.image);
    document.querySelector('.profile-photo')?.setAttribute('alt', organizer.profile.name);
    document.querySelector('.artist-name').textContent = organizer.profile.name;
    document.querySelector('.artist-title').textContent = organizer.profile.title || organizer.profile.organizationType;
    const metaItems = document.querySelectorAll('.artist-meta .meta-item');
    if (metaItems[0]) metaItems[0].innerHTML = `<i data-lucide="map-pin"></i> ${escapeHtml(organizer.profile.location)}`;
    if (metaItems[1]) metaItems[1].innerHTML = `<i data-lucide="star"></i> ${(user?.rating || organizer.rating || 4.8).toFixed(1)} (${eventCount} events)`;
    if (metaItems[2]) metaItems[2].innerHTML = `<i data-lucide="briefcase"></i> ${escapeHtml(organizer.profile.eventsPerYear)} booked`;
    document.querySelector('.bio-text').textContent = organizer.profile.bio;
  }

  function renderMainSections() {
    const tagGroup = document.querySelector('.tag-group');
    if (tagGroup) {
      const tags = organizer.profile.eventTypes || ['Corporate Events', 'Private Celebrations'];
      tagGroup.innerHTML = tags.map((tag, index) => `<span class="${index === 0 ? 'tag-primary' : 'tag'}">${escapeHtml(tag)}</span>`).join('');
    }

    const timeline = document.querySelector('.events-timeline');
    if (timeline) {
      const sourceEvents = bookings.length ? bookings.slice(0, 4).map((booking, index) => ({
        title: booking.eventType || `Event Booking ${index + 1}`,
        date: booking.eventDate || booking.createdAt,
        description: booking.message || `${booking.artistName} was requested for this event.`,
        artistName: booking.artistName,
        artistId: booking.artistId
      })) : availableArtists.slice(0, 4).map((artist, index) => ({
        title: `${artist.profile.category} Showcase ${index + 1}`,
        date: new Date(Date.now() - (index + 1) * 86400000 * 24).toISOString(),
        description: `Featured ${artist.profile.name} for a curated ${artist.profile.category.toLowerCase()} booking experience.`,
        artistName: artist.profile.name,
        artistId: artist.id
      }));
      const timelineEvents = sourceEvents.length ? sourceEvents : [{
        title: 'Event calendar building',
        date: new Date().toISOString(),
        description: 'Complete your organizer profile and start saving talent to build your event timeline.',
        artistName: 'Browse talent',
        artistId: ''
      }];

      timeline.innerHTML = timelineEvents.map(event => `
        <div class="event-item">
          <div class="event-marker"></div>
          <div class="event-content">
            <h4>${escapeHtml(event.title)}</h4>
            <div class="event-date">${new Date(event.date).toLocaleDateString('en-ZM', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <p class="event-description">${escapeHtml(event.description)}</p>
            <div class="event-artists">
              <span class="artist-badge">
                <a href="artist-profile.html" data-artist-id="${escapeHtml(event.artistId || '')}">${escapeHtml(event.artistName || 'Featured artist')}</a>
              </span>
            </div>
          </div>
        </div>
      `).join('');
    }

    const statNumbers = document.querySelectorAll('.booking-stats .stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = String(eventCount);
    if (statNumbers[1]) statNumbers[1].textContent = String(Math.max(savedTalent.length, bookings.length));
    if (statNumbers[2]) statNumbers[2].textContent = `${Math.max(eventCount * 250, 500)}+`;
    if (statNumbers[3]) statNumbers[3].textContent = `${Math.min(100, 72 + eventCount)}%`;

    const reviewScore = document.querySelector('.rating-score');
    const reviewCount = document.querySelector('.rating-count');
    if (reviewScore) reviewScore.textContent = (user?.rating || organizer.rating || 4.8).toFixed(1);
    if (reviewCount) reviewCount.textContent = `Based on ${Math.max(eventCount, 6)} reviews`;

    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList) {
      const reviewArtists = availableArtists.slice(0, 3);
      reviewsList.innerHTML = reviewArtists.length ? reviewArtists.map((artist, index) => `
        <div class="review-item">
          <div class="review-header">
            <div class="review-author">
              <img src="${escapeHtml(artist.image)}" alt="${escapeHtml(artist.profile.name)}">
              <div>
                <h4>${escapeHtml(artist.profile.name)}</h4>
                <p class="review-role">${escapeHtml(artist.profile.category)}</p>
              </div>
            </div>
            <div class="review-stars">
              <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
            </div>
          </div>
          <p class="review-date">${index + 1} month${index === 0 ? '' : 's'} ago</p>
          <p class="review-text">Clear briefs, professional communication, and smooth coordination from booking to show day.</p>
        </div>
      `).join('') : `
        <div class="review-item">
          <div class="review-header">
            <div class="review-author">
              <img src="${escapeHtml(fallbackOrganizer.image)}" alt="${escapeHtml(organizer.profile.name)}">
              <div>
                <h4>Platform feedback</h4>
                <p class="review-role">PLUM</p>
              </div>
            </div>
            <div class="review-stars">
              <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
            </div>
          </div>
          <p class="review-date">Just now</p>
          <p class="review-text">Your organizer page is ready. Start saving talent and sending requests to build live reviews.</p>
        </div>
      `;
    }
  }

  function renderSidebar() {
    const sidebarValues = document.querySelectorAll('.profile-sidebar .stat-value');
    if (sidebarValues[0]) sidebarValues[0].textContent = String(eventCount);
    if (sidebarValues[1]) sidebarValues[1].textContent = new Date(user?.createdAt || Date.now()).getFullYear();
    if (sidebarValues[2]) sidebarValues[2].textContent = `${Math.max(savedTalent.length, 3)} Partners`;
    if (sidebarValues[3]) sidebarValues[3].textContent = responseTime;

    const contactValues = document.querySelectorAll('.contact-value');
    if (contactValues[0]) contactValues[0].textContent = user?.email || 'organizer@plumtalent.co.zm';
    if (contactValues[1]) contactValues[1].textContent = personalInfo.phone || user?.phone || '+260 XXX XXX XXX';
    if (contactValues[2]) contactValues[2].textContent = personalInfo.address || organizer.profile.location;
    if (contactValues[3]) {
      contactValues[3].innerHTML = organizer.profile.website
        ? `<a href="${escapeHtml(organizer.profile.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(organizer.profile.website.replace(/^https?:\/\//, ''))}</a>`
        : '<a href="#">Profile website coming soon</a>';
    }

    const preferenceValues = document.querySelectorAll('.preference-value');
    if (preferenceValues[0]) preferenceValues[0].textContent = 'Email or phone';
    if (preferenceValues[1]) preferenceValues[1].textContent = organizer.profile.eventsPerYear;
    if (preferenceValues[2]) preferenceValues[2].textContent = organizer.profile.budget || 'Flexible budget range';

    const ctaText = document.querySelector('.cta-text');
    if (ctaText) ctaText.textContent = `Connect with ${organizer.profile.name} to discuss your next event brief and talent needs.`;

    const socialCard = document.querySelectorAll('.sidebar-card')[3];
    if (socialCard) {
      socialCard.insertAdjacentHTML('afterend', `
        <div class="sidebar-card">
          <h3 class="sidebar-title">Extra Features</h3>
          <div class="stat-item"><span class="stat-label">Saved Talent</span><span class="stat-value">${savedTalent.length}</span></div>
          <div class="stat-item"><span class="stat-label">Open Requests</span><span class="stat-value">${bookings.filter(booking => booking.status === 'pending').length}</span></div>
          <div class="stat-item"><span class="stat-label">Completed Events</span><span class="stat-value">${bookings.filter(booking => booking.status === 'completed').length}</span></div>
        </div>
      `);
    }
  }

  function setupLinksAndActions() {
    document.querySelectorAll('.event-artists a').forEach(link => {
      link.addEventListener('click', event => {
        const artistId = link.dataset.artistId;
        if (!artistId) return;
        event.preventDefault();
        setSelectedProfile({ id: artistId, userType: 'artist' });
        window.location.href = 'artist-profile.html';
      });
    });

    function showToast(message) {
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#161b2f;border:1px solid rgba(255,255,255,.12);color:#f0eff8;padding:12px 22px;border-radius:999px;font-size:.85rem;font-weight:600;z-index:9999;box-shadow:0 14px 34px rgba(0,0,0,.35)';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2600);
    }

    document.getElementById('saveBtn')?.addEventListener('click', function() {
      this.innerHTML = '<i data-lucide="heart-off"></i> Saved';
      if (window.lucide) window.lucide.createIcons();
      showToast(`${organizer.profile.name} saved to your organizer list.`);
    });

    const shareButton = document.getElementById('shareBtn');
    shareButton?.addEventListener('click', async () => {
      const payload = { title: `${organizer.profile.name} | Plum`, text: `Review organizer ${organizer.profile.name} on Plum.`, url: window.location.href };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          return;
        } catch (_) {}
      }
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Profile link copied to clipboard.');
      } catch (_) {
        showToast('Unable to share this profile right now.');
      }
    });

    const email = user?.email || 'organizer@plumtalent.co.zm';
    [document.getElementById('contactBtn'), document.getElementById('contactBtn2')].filter(Boolean).forEach(button => {
      button.addEventListener('click', () => {
        window.location.href = `mailto:${email}?subject=Event collaboration with ${encodeURIComponent(organizer.profile.name)}`;
      });
    });
  }

  personalizeNav();
  renderHeader();
  renderMainSections();
  renderSidebar();
  setupLinksAndActions();
  if (window.lucide) window.lucide.createIcons();
});
