(() => {
  const STORAGE_KEYS = {
    currency: 'plum_currency',
    users: 'plum_users',
    profiles: 'plum_profiles',
    currentUser: 'plum_current_user',
    selectedProfile: 'plum_selected_profile',
    savedProfiles: 'plum_saved_profiles',
    bookings: 'plum_bookings',
    disputes: 'plum_disputes',
    payouts: 'plum_payouts',
    reviews: 'plum_reviews',
    activities: 'plum_activities',
    media: 'plum_media'
  };

  const EXCHANGE_RATE_USD_TO_ZMW = 27.5;
  const DEFAULT_CURRENCY = 'ZMW';

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function ensureCurrencyPreference() {
    const saved = localStorage.getItem(STORAGE_KEYS.currency);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.currency, DEFAULT_CURRENCY);
      return DEFAULT_CURRENCY;
    }
    return saved;
  }

  function getCurrency() {
    return ensureCurrencyPreference();
  }

  function getDashboardPath(role) {
    if (role === 'artist') return 'adash.php';
    if (role === 'organizer') return 'organizer-dashboard.html';
    if (role === 'admin') return 'admin.html';
    return 'login.php';
  }

  function getProfilePath(role) {
    if (role === 'artist') return 'artist-profile.php';
    if (role === 'organizer') return 'organizer-profile.html';
    if (role === 'admin') return 'admin.html';
    return 'login.php';
  }

  function setCurrency(currency) {
    localStorage.setItem(STORAGE_KEYS.currency, currency || DEFAULT_CURRENCY);
  }

  function toNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function convertAmount(amount, fromCurrency = DEFAULT_CURRENCY, toCurrency = DEFAULT_CURRENCY) {
    const numeric = toNumber(amount);
    if (fromCurrency === toCurrency) return numeric;
    if (fromCurrency === 'USD' && toCurrency === 'ZMW') return numeric * EXCHANGE_RATE_USD_TO_ZMW;
    if (fromCurrency === 'ZMW' && toCurrency === 'USD') return numeric / EXCHANGE_RATE_USD_TO_ZMW;
    return numeric;
  }

  function formatCurrency(amount, currency = DEFAULT_CURRENCY, sourceCurrency = currency) {
    const converted = convertAmount(amount, sourceCurrency, currency);
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(converted);
    }
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      maximumFractionDigits: 0
    }).format(converted);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getUsers() {
    return readJSON(STORAGE_KEYS.users, []);
  }

  function saveUsers(users) {
    return writeJSON(STORAGE_KEYS.users, users);
  }

  function getProfiles() {
    return readJSON(STORAGE_KEYS.profiles, {});
  }

  function saveProfiles(profiles) {
    return writeJSON(STORAGE_KEYS.profiles, profiles);
  }

  function getReviews() {
    return readJSON(STORAGE_KEYS.reviews, []);
  }

  function saveReviews(reviews) {
    return writeJSON(STORAGE_KEYS.reviews, reviews);
  }

  function getActivities() {
    return readJSON(STORAGE_KEYS.activities, []);
  }

  function saveActivities(activities) {
    return writeJSON(STORAGE_KEYS.activities, activities);
  }

  function getMediaAssets() {
    return readJSON(STORAGE_KEYS.media, []);
  }

  function saveMediaAssets(assets) {
    return writeJSON(STORAGE_KEYS.media, assets);
  }

  function getCurrentUser() {
    return readJSON(STORAGE_KEYS.currentUser, null);
  }

  function setCurrentUser(user) {
    return writeJSON(STORAGE_KEYS.currentUser, user);
  }

  function getUserById(userId) {
    return getUsers().find(user => String(user.id) === String(userId)) || null;
  }

  function getProfileById(userId) {
    return getProfiles()[userId] || null;
  }

  function getUserDisplayName(user, profile) {
    const roleInfo = profile?.roleSpecificInfo || {};
    return (
      roleInfo.stageName ||
      roleInfo.organizationName ||
      user.stageName ||
      user.orgName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      'Unknown User'
    );
  }

  function normalizeArtist(user, profile) {
    const roleInfo = profile?.roleSpecificInfo || {};
    const personalInfo = profile?.personalInfo || {};
    const rateCurrency = roleInfo.rateCurrency || user.rateCurr || DEFAULT_CURRENCY;
    const rawPrice = roleInfo.rateAmount || user.rateAmt || 0;

    return {
      id: user.id,
      userType: user.userType,
      verified: Boolean(user.verified),
      suspended: Boolean(user.suspended),
      joined: user.createdAt,
      rating: Number(user.rating || 4.7),
      image: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(getUserDisplayName(user, profile))}`,
      profile: {
        name: getUserDisplayName(user, profile),
        bio: personalInfo.bio || user.bio || 'Professional talent available for live events and private bookings.',
        category: roleInfo.genre || user.genre || 'Live Entertainment',
        tags: [
          roleInfo.genre || user.genre,
          personalInfo.city || user.city,
          user.experience || roleInfo.experience
        ].filter(Boolean),
        price: convertAmount(rawPrice, rateCurrency, 'ZMW'),
        priceCurrency: 'ZMW',
        location: personalInfo.city || user.city || 'Zambia',
        portfolio: roleInfo.portfolio || '',
        joined: user.createdAt
      }
    };
  }

  function normalizeOrganizer(user, profile) {
    const roleInfo = profile?.roleSpecificInfo || {};
    const personalInfo = profile?.personalInfo || {};
    const eventTypes = user.eventTypes || [];

    return {
      id: user.id,
      userType: user.userType,
      verified: Boolean(user.verified),
      suspended: Boolean(user.suspended),
      joined: user.createdAt,
      rating: Number(user.rating || 4.8),
      image: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(getUserDisplayName(user, profile))}`,
      profile: {
        name: getUserDisplayName(user, profile),
        title: roleInfo.organizationType || user.orgType || 'Event Organizer',
        bio: personalInfo.bio || user.bio || 'Professional event organizer managing polished experiences and coordinated bookings.',
        eventTypes: eventTypes.length ? eventTypes : ['Corporate Events', 'Private Events', 'Weddings'],
        location: personalInfo.city || user.city || 'Zambia',
        website: roleInfo.website || '',
        budget: roleInfo.budget || 'Flexible',
        eventsPerYear: roleInfo.eventsPerYear || user.eventsPerYear || '1-5 events',
        organizationType: roleInfo.organizationType || user.orgType || 'Organizer'
      }
    };
  }

  function getArtists(dummyArtists = []) {
    const profiles = getProfiles();
    const artists = getUsers()
      .filter(user => user.userType === 'artist')
      .map(user => normalizeArtist(user, profiles[user.id]))
      .filter(artist => !artist.suspended);

    return artists.length ? artists : dummyArtists;
  }

  function getOrganizers(dummyOrganizers = []) {
    const profiles = getProfiles();
    const organizers = getUsers()
      .filter(user => user.userType === 'organizer')
      .map(user => normalizeOrganizer(user, profiles[user.id]))
      .filter(organizer => !organizer.suspended);

    return organizers.length ? organizers : dummyOrganizers;
  }

  function getCollection(key) {
    return readJSON(STORAGE_KEYS[key] || key, []);
  }

  function setCollection(key, value) {
    return writeJSON(STORAGE_KEYS[key] || key, value);
  }

  function getSelectedProfile() {
    return readJSON(STORAGE_KEYS.selectedProfile, null);
  }

  function setSelectedProfile(selection) {
    return writeJSON(STORAGE_KEYS.selectedProfile, selection);
  }

  function getSavedProfiles() {
    return readJSON(STORAGE_KEYS.savedProfiles, []);
  }

  function setSavedProfiles(savedProfiles) {
    return writeJSON(STORAGE_KEYS.savedProfiles, savedProfiles);
  }

  function isProfileSaved(profileId) {
    return getSavedProfiles().some(savedId => String(savedId) === String(profileId));
  }

  function toggleSavedProfile(profileId) {
    const savedProfiles = getSavedProfiles();
    const existingIndex = savedProfiles.findIndex(savedId => String(savedId) === String(profileId));
    if (existingIndex >= 0) {
      savedProfiles.splice(existingIndex, 1);
      setSavedProfiles(savedProfiles);
      return false;
    }
    savedProfiles.push(profileId);
    setSavedProfiles(savedProfiles);
    return true;
  }

  function logActivity(activityData) {
    const activities = getActivities();
    const activity = {
      id: activityData.id || uid('ACT'),
      createdAt: activityData.createdAt || new Date().toISOString(),
      ...activityData
    };
    const existingIndex = activities.findIndex(entry => entry.id === activity.id);
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.unshift(activity);
    }
    saveActivities(activities);
    return activity;
  }

  function removeActivity(activityId) {
    const filtered = getActivities().filter(activity => activity.id !== activityId);
    saveActivities(filtered);
  }

  function getMediaForUser(userId, mediaType = '') {
    return getMediaAssets()
      .filter(asset => String(asset.userId) === String(userId))
      .filter(asset => !mediaType || asset.type === mediaType)
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
  }

  function saveMediaAsset(assetData) {
    const assets = getMediaAssets();
    const asset = {
      id: assetData.id || uid('MD'),
      createdAt: assetData.createdAt || new Date().toISOString(),
      ...assetData
    };
    const existingIndex = assets.findIndex(entry => entry.id === asset.id);
    if (existingIndex >= 0) {
      assets[existingIndex] = asset;
    } else {
      assets.unshift(asset);
    }
    saveMediaAssets(assets);
    logActivity({
      type: 'media_uploaded',
      userId: asset.userId,
      entityId: asset.id,
      entityType: 'media',
      title: `${asset.type === 'audio' ? 'Audio' : asset.type === 'video' ? 'Video' : 'Image'} sample uploaded`,
      description: asset.title || asset.fileName || 'New media asset added to the profile.',
      metadata: { mediaType: asset.type, role: asset.role || '' }
    });
    return asset;
  }

  function deleteMediaAsset(assetId) {
    const asset = getMediaAssets().find(entry => entry.id === assetId);
    if (!asset) return false;
    const filtered = getMediaAssets().filter(entry => entry.id !== assetId);
    saveMediaAssets(filtered);
    logActivity({
      type: 'media_removed',
      userId: asset.userId,
      entityId: asset.id,
      entityType: 'media',
      title: 'Media sample removed',
      description: asset.title || asset.fileName || 'A profile asset was removed.',
      metadata: { mediaType: asset.type }
    });
    return true;
  }

  function createReview(reviewData) {
    const reviews = getReviews();
    const review = {
      id: reviewData.id || uid('RV'),
      createdAt: reviewData.createdAt || new Date().toISOString(),
      source: reviewData.source || 'user',
      ...reviewData
    };
    const existingIndex = reviews.findIndex(entry => entry.id === review.id);
    if (existingIndex >= 0) {
      reviews[existingIndex] = review;
    } else {
      reviews.unshift(review);
    }
    saveReviews(reviews);
    return review;
  }

  function getReviewsForUser(userId, reviewFor = '') {
    return getReviews()
      .filter(review => String(review.targetUserId) === String(userId))
      .filter(review => !reviewFor || review.reviewFor === reviewFor)
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
  }

  function getAverageRatingForUser(userId, reviewFor = '') {
    const reviews = getReviewsForUser(userId, reviewFor);
    if (!reviews.length) return 0;
    return reviews.reduce((total, review) => total + toNumber(review.rating), 0) / reviews.length;
  }

  function getCompletionScore(userId) {
    const user = getUserById(userId);
    const profile = getProfileById(userId);
    if (!user) return 0;
    const personal = profile?.personalInfo || {};
    const roleInfo = profile?.roleSpecificInfo || {};
    const checkpoints = [
      user.firstName,
      user.lastName,
      user.phone,
      personal.bio || user.bio,
      personal.city || user.city,
      personal.profilePhoto || user.image,
      user.coverImage
    ];

    if (user.userType === 'artist') {
      checkpoints.push(roleInfo.stageName || user.stageName, roleInfo.genre || user.genre, roleInfo.rateAmount || user.rateAmt);
    }

    if (user.userType === 'organizer') {
      checkpoints.push(roleInfo.organizationName || user.orgName, roleInfo.organizationType || user.orgType, roleInfo.budget);
    }

    const complete = checkpoints.filter(Boolean).length;
    return Math.round((complete / checkpoints.length) * 100);
  }

  function getPerformanceInsights(userId, role = 'artist') {
    const bookings = getBookingsForUser(userId, role);
    const reviews = getReviewsForUser(userId, role);
    const media = getMediaForUser(userId);
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
    const revenueBase = completedBookings.reduce((total, booking) => total + toNumber(booking.amount), 0);

    return {
      totalBookings: bookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: pendingBookings.length,
      confirmedBookings: confirmedBookings.length,
      revenue: role === 'artist' ? Math.round(revenueBase * 0.8) : revenueBase,
      mediaCount: media.length,
      reviewCount: reviews.length,
      rating: reviews.length ? Number((reviews.reduce((total, review) => total + toNumber(review.rating), 0) / reviews.length).toFixed(1)) : 0,
      completionScore: getCompletionScore(userId)
    };
  }

  function getPerformanceHistory(userId, role = 'artist') {
    const bookings = getBookingsForUser(userId, role).map(booking => ({
      id: `history-booking-${booking.id}`,
      createdAt: booking.eventDate || booking.updatedAt || booking.createdAt,
      source: 'booking',
      status: booking.status,
      title: role === 'artist'
        ? `${booking.status === 'completed' ? 'Completed' : booking.status === 'confirmed' ? 'Confirmed' : 'New'} booking with ${booking.organizerName || 'organizer'}`
        : `${booking.status === 'completed' ? 'Hosted' : booking.status === 'confirmed' ? 'Confirmed' : 'Requested'} ${booking.artistName || 'artist'}`,
      description: booking.message || `Booking value ${formatCurrency(booking.amount, 'ZMW', 'ZMW')}`
    }));

    const activities = getActivities()
      .filter(activity => String(activity.userId) === String(userId) || String(activity.relatedUserId) === String(userId))
      .map(activity => ({
        id: `history-activity-${activity.id}`,
        createdAt: activity.createdAt,
        source: 'activity',
        status: activity.type,
        title: activity.title,
        description: activity.description || 'Platform activity recorded.'
      }));

    return [...bookings, ...activities]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 12);
  }

  function createBooking(bookingData) {
    const bookings = getCollection('bookings');
    const booking = {
      id: bookingData.id || uid('BK'),
      createdAt: bookingData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: bookingData.status || 'pending',
      amount: toNumber(bookingData.amount),
      ...bookingData
    };
    bookings.unshift(booking);
    setCollection('bookings', bookings);
    logActivity({
      id: `ACT-booking-created-${booking.id}`,
      type: 'booking_created',
      userId: booking.organizerId,
      relatedUserId: booking.artistId,
      entityId: booking.id,
      entityType: 'booking',
      title: `Booking request created for ${booking.artistName || 'artist'}`,
      description: booking.message || `${booking.organizerName || 'Organizer'} requested ${booking.artistName || 'artist'} for ${booking.eventDate || 'a future date'}.`,
      metadata: { amount: booking.amount, status: booking.status }
    });
    return booking;
  }

  function getBookingsForUser(userId, role = 'artist') {
    return getCollection('bookings').filter(booking =>
      role === 'organizer'
        ? String(booking.organizerId) === String(userId)
        : String(booking.artistId) === String(userId)
    );
  }

  function syncDerivedCollections() {
    const users = getUsers();
    const profiles = getProfiles();
    const bookings = getCollection('bookings');
    const disputes = getCollection('disputes');
    const payouts = getCollection('payouts');
    const reviews = getReviews();
    const activities = getActivities();
    let reviewsChanged = false;
    let activitiesChanged = false;
    let payoutsChanged = false;

    users.forEach(user => {
      const activityId = `ACT-user-created-${user.id}`;
      if (!activities.some(entry => entry.id === activityId)) {
        activities.unshift({
          id: activityId,
          type: 'user_registered',
          userId: user.id,
          entityId: user.id,
          entityType: 'user',
          createdAt: user.createdAt || new Date().toISOString(),
          title: `${getUserDisplayName(user, profiles[user.id])} joined PLUM`,
          description: `${user.userType === 'artist' ? 'Artist' : user.userType === 'organizer' ? 'Organizer' : 'Admin'} account created.`
        });
        activitiesChanged = true;
      }
    });

    bookings.forEach(booking => {
      const baseActivityId = `ACT-booking-created-${booking.id}`;
      if (!activities.some(entry => entry.id === baseActivityId)) {
        activities.unshift({
          id: baseActivityId,
          type: 'booking_created',
          userId: booking.organizerId,
          relatedUserId: booking.artistId,
          entityId: booking.id,
          entityType: 'booking',
          createdAt: booking.createdAt || new Date().toISOString(),
          title: `Booking request created for ${booking.artistName || 'artist'}`,
          description: booking.message || `${booking.organizerName || 'Organizer'} requested ${booking.artistName || 'artist'}.`
        });
        activitiesChanged = true;
      }

      if (booking.status === 'completed') {
        const payoutId = `PO-${booking.id}`;
        if (!payouts.some(entry => entry.id === payoutId)) {
          payouts.unshift({
            id: payoutId,
            bookingId: booking.id,
            artistId: booking.artistId,
            artistName: booking.artistName,
            amount: Math.round(toNumber(booking.amount) * 0.8),
            method: 'Bank Transfer',
            status: 'pending',
            createdAt: booking.updatedAt || booking.createdAt || new Date().toISOString()
          });
          payoutsChanged = true;
        }

        const artistUser = getUserById(booking.artistId);
        const organizerUser = getUserById(booking.organizerId);
        const artistProfile = profiles[booking.artistId];
        const organizerProfile = profiles[booking.organizerId];
        const artistCategory = artistProfile?.roleSpecificInfo?.genre || artistUser?.genre || 'Talent';
        const organizerCategory = organizerProfile?.roleSpecificInfo?.organizationType || organizerUser?.orgType || 'Organizer';

        if (!reviews.some(entry => entry.id === `RV-artist-${booking.id}`)) {
          reviews.unshift({
            id: `RV-artist-${booking.id}`,
            bookingId: booking.id,
            reviewFor: 'artist',
            targetUserId: booking.artistId,
            authorUserId: booking.organizerId,
            category: artistCategory,
            title: booking.eventType || artistCategory,
            rating: Number((Math.min(5, Math.max(4.3, Number(artistUser?.rating || 4.7) + 0.2))).toFixed(1)),
            text: `${booking.artistName || 'This artist'} delivered a reliable ${artistCategory.toLowerCase()} booking and handled the event professionally.`,
            source: 'system',
            createdAt: booking.updatedAt || booking.createdAt || new Date().toISOString()
          });
          reviewsChanged = true;
        }

        if (!reviews.some(entry => entry.id === `RV-organizer-${booking.id}`)) {
          reviews.unshift({
            id: `RV-organizer-${booking.id}`,
            bookingId: booking.id,
            reviewFor: 'organizer',
            targetUserId: booking.organizerId,
            authorUserId: booking.artistId,
            category: organizerCategory,
            title: booking.eventType || organizerCategory,
            rating: Number((Math.min(5, Math.max(4.3, Number(organizerUser?.rating || 4.8) + 0.1))).toFixed(1)),
            text: `${booking.organizerName || 'This organizer'} shared a clear brief and coordinated the booking process well.`,
            source: 'system',
            createdAt: booking.updatedAt || booking.createdAt || new Date().toISOString()
          });
          reviewsChanged = true;
        }
      }
    });

    disputes.forEach(dispute => {
      const disputeActivityId = `ACT-dispute-${dispute.id}`;
      if (!activities.some(entry => entry.id === disputeActivityId)) {
        activities.unshift({
          id: disputeActivityId,
          type: 'dispute_logged',
          entityId: dispute.id,
          entityType: 'dispute',
          createdAt: dispute.createdAt || new Date().toISOString(),
          title: `Dispute ${dispute.id} logged`,
          description: dispute.reason || 'A dispute was raised for a booking.'
        });
        activitiesChanged = true;
      }
    });

    if (activitiesChanged) saveActivities(activities.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)));
    if (reviewsChanged) saveReviews(reviews.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)));
    if (payoutsChanged) setCollection('payouts', payouts.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)));
  }

  function ensureAdminUser() {
    const users = getUsers();
    if (users.some(user => user.userType === 'admin')) return;
    users.push({
      id: 'plum-admin',
      email: 'admin@plumtalent.co.zm',
      password: 'Admin@123',
      firstName: 'Plum',
      lastName: 'Admin',
      userType: 'admin',
      verified: true,
      suspended: false,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }

  ensureAdminUser();
  ensureCurrencyPreference();
  syncDerivedCollections();

  window.PlumPlatform = {
    STORAGE_KEYS,
    DEFAULT_CURRENCY,
    EXCHANGE_RATE_USD_TO_ZMW,
    readJSON,
    writeJSON,
    getCurrency,
    getDashboardPath,
    getProfilePath,
    setCurrency,
    convertAmount,
    formatCurrency,
    escapeHtml,
    getUsers,
    saveUsers,
    getProfiles,
    saveProfiles,
    getReviews,
    saveReviews,
    getActivities,
    saveActivities,
    getMediaAssets,
    saveMediaAssets,
    getCurrentUser,
    setCurrentUser,
    getUserById,
    getProfileById,
    getUserDisplayName,
    normalizeArtist,
    normalizeOrganizer,
    getArtists,
    getOrganizers,
    getCollection,
    setCollection,
    getSelectedProfile,
    setSelectedProfile,
    getSavedProfiles,
    setSavedProfiles,
    isProfileSaved,
    toggleSavedProfile,
    logActivity,
    removeActivity,
    getMediaForUser,
    saveMediaAsset,
    deleteMediaAsset,
    createReview,
    getReviewsForUser,
    getAverageRatingForUser,
    getCompletionScore,
    getPerformanceInsights,
    getPerformanceHistory,
    createBooking,
    getBookingsForUser,
    uid,
    syncDerivedCollections
  };
})();
