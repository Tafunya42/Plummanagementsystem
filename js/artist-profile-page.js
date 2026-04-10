document.addEventListener('DOMContentLoaded', () => {
  const {
    escapeHtml,
    formatCurrency,
    getCurrentUser,
    getDashboardPath,
    getUserById,
    getProfileById,
    getSelectedProfile,
    setSelectedProfile,
    toggleSavedProfile,
    isProfileSaved,
    createBooking,
    getBookingsForUser,
    normalizeArtist
  } = window.PlumPlatform;

  const fallbackArtist = {
    id: 'sample-artist',
    userType: 'artist',
    verified: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e?w=296&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&auto=format&fit=crop&q=80',
    profile: {
      name: 'Featured Artist',
      bio: 'High-energy live talent for weddings, private functions, and premium brand experiences.',
      category: 'Live Entertainment',
      tags: ['Live Performance', 'Corporate Events', 'Weddings'],
      price: 45000,
      priceCurrency: 'ZMW',
      location: 'Lusaka, Zambia',
      portfolio: '',
      joined: new Date().toISOString()
    }
  };

  function estimateYearsActive(experience) {
    if (!experience) return '5+';
    const numeric = String(experience).match(/\d+/);
    return numeric ? `${numeric[0]}+` : experience;
  }

  function resolveArtist() {
    const currentUser = getCurrentUser();
    const selected = getSelectedProfile();
    const forceMine = new URLSearchParams(window.location.search).get('mine') === '1';

    if (forceMine && currentUser?.userType === 'artist') {
      const user = getUserById(currentUser.id);
      if (user) {
        const profile = getProfileById(user.id);
        setSelectedProfile({ id: user.id, userType: 'artist' });
        return { artist: normalizeArtist(user, profile), user, profile, isOwner: true };
      }
    }

    if (selected?.userType === 'artist') {
      const user = getUserById(selected.id);
      if (user) {
        const profile = getProfileById(user.id);
        return { artist: normalizeArtist(user, profile), user, profile, isOwner: currentUser?.id === user.id };
      }
    }

    if (currentUser?.userType === 'artist') {
      const user = getUserById(currentUser.id);
      if (user) {
        const profile = getProfileById(user.id);
        setSelectedProfile({ id: user.id, userType: 'artist' });
        return { artist: normalizeArtist(user, profile), user, profile, isOwner: true };
      }
    }

    return { artist: fallbackArtist, user: null, profile: null, isOwner: false };
  }

  const { artist, user, profile, isOwner } = resolveArtist();
  const roleInfo = profile?.roleSpecificInfo || {};
  const personalInfo = profile?.personalInfo || {};
  const currentUser = getCurrentUser();
  const bookings = getBookingsForUser(artist.id, 'artist');
  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  const upcomingBookings = bookings.filter(booking => new Date(booking.eventDate || booking.createdAt) >= new Date()).length;
  const bookingCount = bookings.length || 24;
  const rating = Number(user?.rating || artist.rating || 4.8).toFixed(1);
  const bandMembers = roleInfo.bandMembers || (artist.profile.category.toLowerCase().includes('band') ? 5 : 1);
  const yearsActive = estimateYearsActive(roleInfo.experience || user?.experience);
  const locationLabel = artist.profile.location.includes('Zambia') ? artist.profile.location : `${artist.profile.location}, Zambia`;
  const availabilityLabel = upcomingBookings > 1 ? `${upcomingBookings} bookings ahead` : 'Available this weekend';

  function personalizeNav() {
    const loginLink = document.querySelector('.nav-r a[href="login.html"]');
    if (!loginLink || !currentUser) return;
    const navUser = getUserById(currentUser.id);
    const label = navUser?.firstName || currentUser.email?.split('@')[0] || 'Account';
    loginLink.textContent = isOwner ? 'Edit Dashboard' : `Hi, ${label}`;
    loginLink.href = getDashboardPath(currentUser.userType);
  }

  function renderHeader() {
    document.title = `${artist.profile.name} | PLUM Artist Profile`;
    document.querySelector('.cover img')?.setAttribute('src', user?.coverImage || fallbackArtist.coverImage);
    document.querySelector('.cover img')?.setAttribute('alt', artist.profile.name);
    document.querySelector('.ph-photo img')?.setAttribute('src', artist.image || fallbackArtist.image);
    document.querySelector('.ph-photo img')?.setAttribute('alt', artist.profile.name);
    document.querySelector('.ph-name').innerHTML = escapeHtml(artist.profile.name);
    document.querySelector('.ph-subtitle').innerHTML = `${escapeHtml(artist.profile.category)} &middot; ${bandMembers} ${bandMembers === 1 ? 'Member' : 'Members'}`;

    const metaItems = document.querySelectorAll('.ph-meta-item');
    if (metaItems[0]) metaItems[0].innerHTML = `${metaItems[0].innerHTML.split('</svg>')[0]}</svg>${escapeHtml(locationLabel)}`;
    if (metaItems[1]) metaItems[1].innerHTML = `${metaItems[1].innerHTML.split('</svg>')[0]}</svg>${rating} &nbsp;(${bookingCount} bookings)`;
    if (metaItems[2]) metaItems[2].innerHTML = `${metaItems[2].innerHTML.split('</svg>')[0]}</svg>${escapeHtml(availabilityLabel)}`;

    const bio = document.querySelector('.bio');
    if (bio) bio.textContent = artist.profile.bio;

    const tagsWrap = document.querySelector('.tags');
    if (tagsWrap) {
      const tags = [artist.profile.category, ...(artist.profile.tags || [])].slice(0, 9);
      tagsWrap.innerHTML = tags.map((tag, index) => `<span class="${index === 0 ? 'tag-main' : 'tag'}">${escapeHtml(tag)}</span>`).join('');
    }
  }

  function renderPricing() {
    const basePrice = Number(artist.profile.price || 0);
    const priceCards = document.querySelectorAll('.price-card');
    if (priceCards[0]) priceCards[0].querySelector('.price-amt').innerHTML = `${formatCurrency(Math.round(basePrice * 0.55), 'ZMW', 'ZMW')} <span>/ event</span>`;
    if (priceCards[1]) priceCards[1].querySelector('.price-amt').innerHTML = `${formatCurrency(basePrice, 'ZMW', 'ZMW')} <span>/ event</span>`;
    const note = document.querySelector('.price-note');
    if (note) {
      note.lastChild.textContent = ` Typical starting investment begins at ${formatCurrency(basePrice, 'ZMW', 'ZMW')}. Travel, production, and late-night set extensions can adjust the final quote.`;
    }
  }

  function renderSidebar() {
    const statValues = document.querySelectorAll('.s-stat-val');
    const statText = [
      String(bookingCount),
      isOwner ? '< 1 hour' : '< 3 hours',
      String(bandMembers),
      yearsActive,
      `★ ${rating}`,
      artist.profile.location.replace(', Zambia', '')
    ];
    statValues.forEach((node, index) => {
      if (statText[index]) node.textContent = statText[index];
    });

    const portfolioLinks = document.querySelector('.port-links');
    if (portfolioLinks) {
      const links = [];
      if (artist.profile.portfolio) links.push({ label: artist.profile.portfolio.replace(/^https?:\/\//, ''), href: artist.profile.portfolio });
      if (roleInfo.portfolio) links.push({ label: 'Professional Portfolio', href: roleInfo.portfolio });
      if (personalInfo.profilePhoto) links.push({ label: 'Press Photo Kit', href: personalInfo.profilePhoto });
      if (!links.length) links.push({ label: 'Contact for full media kit', href: '#' });
      portfolioLinks.innerHTML = links.slice(0, 3).map(link => `<a href="${escapeHtml(link.href)}" class="port-link" ${link.href !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>${escapeHtml(link.label)}</a>`).join('');
    }

    const ctaCard = document.querySelector('.cta-card p');
    if (ctaCard) {
      ctaCard.textContent = `Reach out to ${artist.profile.name} for date checks, rider details, and a tailored quote for your event.`;
    }
  }

  function insertExtraFeatures() {
    if (isOwner) {
      const ownerCard = document.createElement('div');
      ownerCard.className = 'card';
      ownerCard.innerHTML = `
        <h2 class="card-title">Profile Performance</h2>
        <p class="bio">This is your public profile. You currently have ${bookingCount} booking records, ${upcomingBookings} upcoming event ${upcomingBookings === 1 ? 'request' : 'requests'}, and ${completedBookings} completed performance ${completedBookings === 1 ? 'log' : 'logs'}.</p>
      `;
      document.querySelector('.main-col')?.insertAdjacentElement('afterbegin', ownerCard);
    }

    const activityCard = document.createElement('div');
    activityCard.className = 's-card';
    activityCard.innerHTML = `
      <div class="s-title">Recent Activity</div>
      ${(bookings.slice(0, 4).map(booking => `
        <div class="s-stat">
          <span class="s-stat-lbl">${escapeHtml(booking.organizerName || 'Client')} · ${escapeHtml(booking.status || 'pending')}</span>
          <span class="s-stat-val">${new Date(booking.eventDate || booking.createdAt).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' })}</span>
        </div>
      `).join('')) || '<div class="s-stat"><span class="s-stat-lbl">No booking activity yet</span><span class="s-stat-val">Start sharing</span></div>'}
    `;
    document.querySelector('.sidebar .cta-card')?.insertAdjacentElement('beforebegin', activityCard);
  }

  function updateSaveButton(saved) {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) return;
    saveBtn.innerHTML = saved
      ? '<svg viewBox="0 0 24 24" style="fill:#ef4444;stroke:#ef4444;width:15px;height:15px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Saved'
      : '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;width:15px;height:15px;stroke-width:2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Save';
    saveBtn.style.borderColor = saved ? '#ef4444' : '';
    saveBtn.style.color = saved ? '#ef4444' : '';
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#221640;border:1px solid rgba(139,46,200,.5);color:#F0EAF8;padding:12px 24px;border-radius:100px;font-size:.8rem;font-weight:600;z-index:9998';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function setupBooking() {
    const modal = document.getElementById('bookModal');
    const bookingTitle = document.querySelector('.modal-hdr h2');
    const form = document.getElementById('bookingForm');
    const inputs = form?.querySelectorAll('input');
    if (bookingTitle) bookingTitle.textContent = `Request Booking · ${artist.profile.name}`;

    if (currentUser && inputs?.length >= 3) {
      const bookingUser = getUserById(currentUser.id);
      inputs[0].value = [bookingUser?.firstName, bookingUser?.lastName].filter(Boolean).join(' ');
      inputs[1].value = bookingUser?.email || currentUser.email || '';
      inputs[2].value = bookingUser?.phone || '';
    }

    document.getElementById('bookBtn')?.addEventListener('click', () => modal.classList.add('on'));
    document.getElementById('bookBtn2')?.addEventListener('click', () => modal.classList.add('on'));
    document.getElementById('closeModal')?.addEventListener('click', () => modal.classList.remove('on'));
    modal?.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('on'); });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      const [nameInput, emailInput, phoneInput, dateInput] = form.querySelectorAll('input');
      const selects = form.querySelectorAll('select');
      const message = form.querySelector('textarea')?.value?.trim() || '';
      createBooking({
        artistId: artist.id,
        artistName: artist.profile.name,
        organizerId: currentUser?.id || `guest-${Date.now()}`,
        organizerName: currentUser ? ([getUserById(currentUser.id)?.firstName, getUserById(currentUser.id)?.lastName].filter(Boolean).join(' ') || currentUser.email) : (nameInput?.value || 'Guest Booker'),
        organizerEmail: emailInput?.value || '',
        organizerPhone: phoneInput?.value || '',
        eventDate: dateInput?.value || '',
        eventType: selects[0]?.value || '',
        packageName: selects[1]?.value || '',
        amount: artist.profile.price || 0,
        message,
        status: 'pending'
      });
      modal.classList.remove('on');
      form.reset();
      showToast(`Booking request sent to ${artist.profile.name}.`);
    });
  }

  function setupSaveAndShare() {
    updateSaveButton(isProfileSaved(artist.id));
    document.getElementById('saveBtn')?.addEventListener('click', () => {
      const saved = toggleSavedProfile(artist.id);
      updateSaveButton(saved);
      showToast(saved ? `${artist.profile.name} saved to your shortlist.` : `${artist.profile.name} removed from your shortlist.`);
    });

    document.getElementById('shareBtn')?.addEventListener('click', async () => {
      const payload = { title: `${artist.profile.name} — PLUM`, text: `Book ${artist.profile.name} for your next event.`, url: window.location.href };
      if (navigator.share) {
        try {
          await navigator.share(payload);
          return;
        } catch (_) {}
      }
      navigator.clipboard.writeText(window.location.href).then(() => showToast('Profile link copied to clipboard.')).catch(() => showToast('Unable to copy the profile link.'));
    });
  }

  function setupTabsAndGallery() {
    document.querySelectorAll('.tab-btn').forEach(button => {
      button.addEventListener('click', function() {
        const tab = this.dataset.tab;
        this.closest('.card').querySelectorAll('.tab-btn').forEach(item => item.classList.remove('on'));
        this.closest('.card').querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('on'));
        this.classList.add('on');
        this.closest('.card').querySelector(`.tab-pane[data-tab="${tab}"]`)?.classList.add('on');
      });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImg');
    document.querySelectorAll('.gal-item').forEach(item => {
      item.addEventListener('click', () => {
        lightboxImage.src = item.dataset.src;
        lightbox.classList.add('on');
      });
    });
    document.getElementById('lightboxClose')?.addEventListener('click', () => lightbox.classList.remove('on'));
    lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.classList.remove('on'); });
  }

  function setupCalendar() {
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const bookedDates = bookings.map(booking => new Date(booking.eventDate || booking.createdAt)).filter(date => !Number.isNaN(date.getTime()));
    let cal = new Date();

    function renderCal() {
      const grid = document.getElementById('calGrid');
      document.getElementById('calLabel').textContent = `${MONTHS[cal.getMonth()]} ${cal.getFullYear()}`;
      grid.innerHTML = '';
      DAYS.forEach(day => {
        const el = document.createElement('div');
        el.className = 'cal-day-name';
        el.textContent = day;
        grid.appendChild(el);
      });
      const first = new Date(cal.getFullYear(), cal.getMonth(), 1).getDay();
      const total = new Date(cal.getFullYear(), cal.getMonth() + 1, 0).getDate();
      const today = new Date();
      for (let i = 0; i < first; i += 1) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
      }
      for (let day = 1; day <= total; day += 1) {
        const el = document.createElement('div');
        const date = new Date(cal.getFullYear(), cal.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        const isBooked = bookedDates.some(booked => booked.toDateString() === date.toDateString());
        el.className = `cal-day ${isBooked ? 'bk' : 'av'}${isToday ? ' today' : ''}`;
        el.textContent = day;
        if (!isBooked) el.addEventListener('click', () => document.getElementById('bookModal').classList.add('on'));
        grid.appendChild(el);
      }
    }

    document.getElementById('calPrev')?.addEventListener('click', () => { cal.setMonth(cal.getMonth() - 1); renderCal(); });
    document.getElementById('calNext')?.addEventListener('click', () => { cal.setMonth(cal.getMonth() + 1); renderCal(); });
    renderCal();
  }

  personalizeNav();
  renderHeader();
  renderPricing();
  renderSidebar();
  insertExtraFeatures();
  setupBooking();
  setupSaveAndShare();
  setupTabsAndGallery();
  setupCalendar();
});
