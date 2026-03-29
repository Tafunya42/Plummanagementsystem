
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();

            // Dummy artist data with wedding-specific categories
            const dummyArtists = [
                {
                    id: 1001,
                    userType: "artist",
                    profile: {
                        name: "Timeless Moments Photography",
                        bio: "Award-winning wedding photographer specializing in capturing candid moments and timeless portraits. Over 500 weddings captured.",
                        category: "Photography",
                        tags: ["Wedding", "Engagement", "Portrait", "Candid"],
                        price: 2500,
                        portfolio: "https://example.com/photography",
                        joined: "2025-01-15T00:00:00.000Z",
                        location: "New York, NY"
                    },
                    rating: 4.9,
                    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format"
                },
                {
                    id: 1002,
                    userType: "artist",
                    profile: {
                        name: "Vivid Cinema",
                        bio: "Cinematic wedding videography team capturing your love story with emotion and artistry.",
                        category: "Videography",
                        tags: ["Wedding Film", "Cinematic", "Highlight Reel", "Drone"],
                        price: 3000,
                        portfolio: "https://example.com/videography",
                        joined: "2025-02-10T00:00:00.000Z",
                        location: "Los Angeles, CA"
                    },
                    rating: 4.8,
                    image: "https://images.unsplash.com/photo-1492691527719-9d1e4e0e8f7c?w=600&auto=format"
                },
                {
                    id: 1003,
                    userType: "artist",
                    profile: {
                        name: "DJ Pulse",
                        bio: "High-energy wedding DJ with a massive music library. Keeps the dance floor packed all night.",
                        category: "DJ",
                        tags: ["Wedding", "Top 40", "Open Format", "MC Services"],
                        price: 1200,
                        portfolio: "https://example.com/dj",
                        joined: "2025-01-20T00:00:00.000Z",
                        location: "Chicago, IL"
                    },
                    rating: 4.9,
                    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&auto=format"
                },
                {
                    id: 1004,
                    userType: "artist",
                    profile: {
                        name: "Master of Ceremonies James",
                        bio: "Professional wedding MC with a warm, engaging style. Ensures your reception flows perfectly.",
                        category: "MC",
                        tags: ["Wedding", "Announcer", "Host", "Event Flow"],
                        price: 800,
                        portfolio: "https://example.com/mc",
                        joined: "2025-03-01T00:00:00.000Z",
                        location: "Miami, FL"
                    },
                    rating: 4.8,
                    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format"
                },
                {
                    id: 1005,
                    userType: "artist",
                    profile: {
                        name: "The Jazz Collective",
                        bio: "Live jazz band perfect for cocktail hour and dinner. Adds elegance to any wedding.",
                        category: "Live Music",
                        tags: ["Jazz", "Live Band", "Swing", "Cocktail Hour"],
                        price: 2200,
                        portfolio: "https://example.com/jazz",
                        joined: "2025-02-05T00:00:00.000Z",
                        location: "New Orleans, LA"
                    },
                    rating: 4.9,
                    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format"
                },
                {
                    id: 1006,
                    userType: "artist",
                    profile: {
                        name: "Graceful Motion",
                        bio: "Professional choreographer for first dances and wedding party performances.",
                        category: "Choreography",
                        tags: ["First Dance", "Wedding Party", "Salsa", "Ballroom"],
                        price: 600,
                        portfolio: "https://example.com/choreography",
                        joined: "2025-02-28T00:00:00.000Z",
                        location: "Houston, TX"
                    },
                    rating: 4.7,
                    image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&auto=format"
                },
                {
                    id: 1007,
                    userType: "artist",
                    profile: {
                        name: "Elegant Events Decor",
                        bio: "Full-service wedding decor and floral design. Create your dream aesthetic.",
                        category: "Decor",
                        tags: ["Floral", "Centerpieces", "Backdrops", "Lighting"],
                        price: 1800,
                        portfolio: "https://example.com/decor",
                        joined: "2025-03-10T00:00:00.000Z",
                        location: "Seattle, WA"
                    },
                    rating: 4.9,
                    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format"
                },
                {
                    id: 1008,
                    userType: "artist",
                    profile: {
                        name: "Gourmet Catering Co.",
                        bio: "Exceptional wedding catering with custom menus and elegant presentation.",
                        category: "Catering",
                        tags: ["Plated Dinner", "Buffet", "Cocktail Hour", "Custom Menu"],
                        price: 4500,
                        portfolio: "https://example.com/catering",
                        joined: "2025-01-25T00:00:00.000Z",
                        location: "San Francisco, CA"
                    },
                    rating: 4.9,
                    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&auto=format"
                },
                {
                    id: 1009,
                    userType: "artist",
                    profile: {
                        name: "Luxury Rides",
                        bio: "Premium wedding transportation – luxury cars, limousines, and vintage vehicles.",
                        category: "Car Hire",
                        tags: ["Limo", "Vintage Car", "Wedding Transport", "Chauffeur"],
                        price: 800,
                        portfolio: "https://example.com/carhire",
                        joined: "2025-02-15T00:00:00.000Z",
                        location: "Las Vegas, NV"
                    },
                    rating: 4.8,
                    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7fa0a7b?w=600&auto=format"
                }
            ];

            // Global data
            let artists = [];

            // Load artists from localStorage, fallback to dummy
            function loadArtists() {
                const stored = JSON.parse(localStorage.getItem('plum_users')) || [];
                const storedArtists = stored.filter(user => user.userType === 'artist');
                if (storedArtists.length > 0) {
                    artists = storedArtists.map(artist => ({
                        ...artist,
                        rating: artist.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
                        image: artist.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(artist.profile.name)}&backgroundColor=8B2BE2`
                    }));
                } else {
                    artists = dummyArtists;
                }
                // Add trending flag (first 3)
                artists = artists.map((artist, idx) => ({
                    ...artist,
                    trending: idx < 3
                }));
                renderCategoryFilters();
                renderArtists();
            }

            // Render category filter buttons
            function renderCategoryFilters() {
                const categories = [...new Set(artists.map(a => a.profile.category))];
                const container = document.getElementById('categoryFilters');
                container.innerHTML = '';
                const allButton = document.createElement('button');
                allButton.className = `filter-chip ${currentCategory === 'all' ? 'active' : ''}`;
                allButton.textContent = 'All';
                allButton.dataset.category = 'all';
                allButton.addEventListener('click', () => setCategory('all'));
                container.appendChild(allButton);
                categories.forEach(cat => {
                    const btn = document.createElement('button');
                    btn.className = `filter-chip ${currentCategory === cat ? 'active' : ''}`;
                    btn.textContent = cat;
                    btn.dataset.category = cat;
                    btn.addEventListener('click', () => setCategory(cat));
                    container.appendChild(btn);
                });
            }

            let currentCategory = 'all';
            let currentSearchTerm = '';
            let currentMinPrice = 0;
            let currentMaxPrice = Infinity;

            function setCategory(category) {
                currentCategory = category;
                document.querySelectorAll('.filter-chip').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
                renderArtists();
            }

            function getFilteredArtists() {
                let filtered = [...artists];
                // Category filter
                if (currentCategory !== 'all') {
                    filtered = filtered.filter(a => a.profile.category === currentCategory);
                }
                // Search filter
                if (currentSearchTerm) {
                    const term = currentSearchTerm.toLowerCase();
                    filtered = filtered.filter(a =>
                        a.profile.name.toLowerCase().includes(term) ||
                        a.profile.category.toLowerCase().includes(term) ||
                        (a.profile.tags && a.profile.tags.some(tag => tag.toLowerCase().includes(term)))
                    );
                }
                // Price range filter
                filtered = filtered.filter(a => a.profile.price >= currentMinPrice && a.profile.price <= currentMaxPrice);
                // Sort
                const sortBy = document.getElementById('sortSelect').value;
                switch (sortBy) {
                    case 'price_asc':
                        filtered.sort((a, b) => a.profile.price - b.profile.price);
                        break;
                    case 'price_desc':
                        filtered.sort((a, b) => b.profile.price - a.profile.price);
                        break;
                    case 'rating_desc':
                        filtered.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'newest':
                        filtered.sort((a, b) => new Date(b.profile.joined) - new Date(a.profile.joined));
                        break;
                    default:
                        // featured: trending first, then random
                        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || Math.random() - 0.5);
                }
                return filtered;
            }

            function renderArtists() {
                const filtered = getFilteredArtists();
                const container = document.getElementById('artistsContainer');
                if (filtered.length === 0) {
                    container.innerHTML = '<div class="no-results">No professionals found. Try adjusting your filters.</div>';
                    return;
                }

                container.innerHTML = filtered.map((artist, index) => {
                    const profile = artist.profile;
                    const tags = profile.tags || [];
                    const rating = artist.rating;
                    const price = profile.price;
                    const location = profile.location || 'Remote';
                    const imageUrl = artist.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=8B2BE2`;

                    return `
                        <div class="artist-card" style="animation-delay: ${index * 0.05}s">
                            <div class="card-image">
                                <img src="${imageUrl}" alt="${escapeHtml(profile.name)}" loading="lazy">
                                <div class="card-badge">${escapeHtml(profile.category)}</div>
                                ${artist.trending ? '<div class="trending-badge">🔥 Trending</div>' : ''}
                            </div>
                            <div class="card-content">
                                <div class="artist-name">${escapeHtml(profile.name)}</div>
                                <div class="artist-category">${escapeHtml(profile.category)}</div>
                                <div class="artist-meta">
                                    <span class="artist-price">$${price}</span>
                                    <span class="artist-rating"><i data-lucide="star"></i> ${rating}</span>
                                </div>
                                <div class="artist-tags">
                                    ${tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                                </div>
                                <div class="card-actions">
                                    <button class="btn-sm btn-outline view-profile" data-id="${artist.id}">View Profile</button>
                                    <button class="btn-sm btn-primary-sm book-now" data-id="${artist.id}">Book Now</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                lucide.createIcons();

                // Attach event listeners
                document.querySelectorAll('.view-profile').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = parseInt(btn.dataset.id);
                        const artist = artists.find(a => a.id === id);
                        if (artist) showProfileModal(artist);
                    });
                });
                document.querySelectorAll('.book-now').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = parseInt(btn.dataset.id);
                        const artist = artists.find(a => a.id === id);
                        if (artist) showBookingModal(artist);
                    });
                });
            }

            function showProfileModal(artist) {
                const modal = document.getElementById('profileModal');
                const modalTitle = document.getElementById('modalArtistName');
                const modalBody = document.getElementById('modalBody');
                const profile = artist.profile;
                const tags = profile.tags || [];
                const portfolio = profile.portfolio || '';
                const location = profile.location || 'Not specified';

                modalTitle.textContent = profile.name;
                modalBody.innerHTML = `
                    <p><strong>Category:</strong> ${escapeHtml(profile.category)}</p>
                    <p><strong>Bio:</strong> ${escapeHtml(profile.bio)}</p>
                    <p><strong>Skills:</strong> ${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ')}</p>
                    <p><strong>Price:</strong> $${profile.price} per event</p>
                    <p><strong>Location:</strong> ${escapeHtml(location)}</p>
                    <p><strong>Rating:</strong> ${artist.rating} <i data-lucide="star" style="width:16px;height:16px;display:inline;"></i></p>
                    ${portfolio ? `<p><strong>Portfolio:</strong> <a href="${portfolio}" target="_blank" style="color: var(--lime)">${escapeHtml(portfolio)}</a></p>` : ''}
                    <p><strong>Member since:</strong> ${new Date(profile.joined).toLocaleDateString()}</p>
                `;
                lucide.createIcons();
                modal.classList.add('active');
            }

            function showBookingModal(artist) {
                const modal = document.getElementById('bookingModal');
                document.getElementById('bookingArtistName').textContent = artist.profile.name;
                modal.classList.add('active');
            }

            // Event listeners for filters
            const searchInput = document.getElementById('searchInput');
            const sortSelect = document.getElementById('sortSelect');
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');

            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value;
                renderArtists();
            });
            sortSelect.addEventListener('change', () => renderArtists());
            minPriceInput.addEventListener('input', (e) => {
                currentMinPrice = parseFloat(e.target.value) || 0;
                renderArtists();
            });
            maxPriceInput.addEventListener('input', (e) => {
                currentMaxPrice = parseFloat(e.target.value) || Infinity;
                renderArtists();
            });

            // Modal close handlers
            document.getElementById('closeModal').addEventListener('click', () => {
                document.getElementById('profileModal').classList.remove('active');
            });
            document.getElementById('closeBookingModal').addEventListener('click', () => {
                document.getElementById('bookingModal').classList.remove('active');
            });
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.classList.remove('active');
                }
            });

            // Booking form submission
            document.getElementById('bookingForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('bookerName').value;
                const date = document.getElementById('eventDate').value;
                const message = document.getElementById('bookingMessage').value;
                alert(`Booking request sent to artist!\n\nName: ${name}\nDate: ${date}\nMessage: ${message}\n\nThe artist will contact you soon.`);
                document.getElementById('bookingModal').classList.remove('active');
                e.target.reset();
            });

            // Load initial artists
            loadArtists();
        });

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }
 