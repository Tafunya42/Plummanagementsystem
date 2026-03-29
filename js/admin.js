// Admin Dashboard Script - Full Functionality
let verifiedUsers = [];
let disputes = [];
let bookings = [];
let payouts = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load all admin data
    loadAdminData();
    
    // Set current date
    const dateElem = document.getElementById('currentDate');
    if (dateElem) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElem.textContent = new Date().toLocaleDateString(undefined, options);
    }

    // Initialize UI
    initCharts();
    updateDashboardStats();
    renderUserManagement();
    renderArtistVerification();
    renderBookingsTable();
    renderDisputesTable();
    renderPayoutsTable();

    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    if (sidebarClose) sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section-content');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout
    document.querySelector('.btn-logout')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) window.location.href = 'login.html';
    });
});

// Load all data from localStorage
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    verifiedUsers = users.filter(u => u.userType === 'artist');
    
    // Generate mock data for bookings, disputes, payouts
    if (!localStorage.getItem('plum_bookings')) {
        bookings = users.slice(0, Math.min(10, users.length)).map((user, i) => ({
            id: `BK${i+1}`,
            artistName: user.firstName + ' ' + user.lastName,
            organizerId: users[(i+1) % users.length].id,
            organizerName: users[(i+1) % users.length].firstName + ' ' + users[(i+1) % users.length].lastName,
            eventDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            amount: Math.floor(Math.random() * 5000) + 500,
            status: ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)],
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }));
        localStorage.setItem('plum_bookings', JSON.stringify(bookings));
    } else {
        bookings = JSON.parse(localStorage.getItem('plum_bookings') || '[]');
    }

    if (!localStorage.getItem('plum_disputes')) {
        disputes = bookings.filter(() => Math.random() < 0.2).map((booking, i) => ({
            id: `DS${i+1}`,
            bookingId: booking.id,
            artistName: booking.artistName,
            organizerName: booking.organizerName,
            reason: ['Payment Issue', 'Service Quality', 'Schedule Conflict'][Math.floor(Math.random() * 3)],
            status: ['open', 'resolved'][Math.floor(Math.random() * 2)],
            createdAt: booking.createdAt
        }));
        localStorage.setItem('plum_disputes', JSON.stringify(disputes));
    } else {
        disputes = JSON.parse(localStorage.getItem('plum_disputes') || '[]');
    }

    if (!localStorage.getItem('plum_payouts')) {
        payouts = bookings.filter(b => b.status === 'completed').map((booking, i) => ({
            id: `PO${i+1}`,
            artistName: booking.artistName,
            amount: booking.amount * 0.8,
            method: ['Bank Transfer', 'Mobile Money'][Math.floor(Math.random() * 2)],
            status: ['pending', 'processing', 'paid'][Math.floor(Math.random() * 3)],
            createdAt: booking.createdAt,
            processedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }));
        localStorage.setItem('plum_payouts', JSON.stringify(payouts));
    } else {
        payouts = JSON.parse(localStorage.getItem('plum_payouts') || '[]');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    const statsCards = document.querySelectorAll('.stat-card');
    
    if (statsCards[0]) statsCards[0].querySelector('.stat-value').textContent = users.length.toLocaleString();
    if (statsCards[1]) statsCards[1].querySelector('.stat-value').textContent = bookings.length.toLocaleString();
    if (statsCards[2]) statsCards[2].querySelector('.stat-value').textContent = '$' + bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString();
    if (statsCards[3]) statsCards[3].querySelector('.stat-value').textContent = disputes.length.toLocaleString();
}

// Render User Management
function renderUserManagement() {
    const section = document.getElementById('users');
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    
    let html = '<div class="section-header"><h1>User Management</h1><input type="text" placeholder="Search users..." class="search-input" onkeyup="filterUsers(this.value)"></div>';
    html += '<div class="table-card"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody id="usersTableBody">';
    
    users.forEach(user => {
        const status = user.verified ? 'Verified' : 'Pending';
        const statusClass = user.verified ? 'verified' : 'pending';
        html += `<tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.userType}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn-small" onclick="viewUser('${user.id}')">View</button>
                <button class="btn-small" onclick="suspendUser('${user.id}')">Suspend</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    section.innerHTML = html;
}

// Render Artist Verification
function renderArtistVerification() {
    const section = document.getElementById('verification');
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]').filter(u => u.userType === 'artist' && !u.verified);
    
    let html = '<div class="section-header"><h1>Artist Verification Queue</h1></div>';
    html += '<div class="table-card"><table class="admin-table"><thead><tr><th>Artist Name</th><th>Genre</th><th>Experience</th><th>Bio</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>';
    
    users.forEach(artist => {
        html += `<tr>
            <td>${artist.firstName} ${artist.lastName}</td>
            <td>${artist.genre || 'N/A'}</td>
            <td>${artist.experience || 'N/A'}</td>
            <td>${artist.bio ? artist.bio.substring(0, 50) + '...' : 'N/A'}</td>
            <td>${new Date(artist.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-small" onclick="approveArtist('${artist.id}')" style="background:#4CAF50">Approve</button>
                <button class="btn-small" onclick="rejectArtist('${artist.id}')" style="background:#f44336">Reject</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    section.innerHTML = html;
}

// Render Bookings Table
function renderBookingsTable() {
    const section = document.getElementById('bookings');
    
    let html = '<div class="section-header"><h1>Bookings Oversight</h1></div>';
    html += '<div class="table-card"><table class="admin-table"><thead><tr><th>Booking ID</th><th>Artist</th><th>Organizer</th><th>Event Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    bookings.forEach(booking => {
        const statusClass = booking.status === 'completed' ? 'completed' : booking.status === 'confirmed' ? 'confirmed' : 'pending';
        html += `<tr>
            <td>${booking.id}</td>
            <td>${booking.artistName}</td>
            <td>${booking.organizerName}</td>
            <td>${booking.eventDate}</td>
            <td>$${booking.amount}</td>
            <td><span class="badge ${statusClass}">${booking.status}</span></td>
            <td>
                <button class="btn-small" onclick="updateBookingStatus('${booking.id}', 'confirmed')" style="background:#2196F3">Confirm</button>
                <button class="btn-small" onclick="updateBookingStatus('${booking.id}', 'cancelled')" style="background:#f44336">Cancel</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    section.innerHTML = html;
}

// Render Disputes Table
function renderDisputesTable() {
    const section = document.getElementById('disputes');
    
    let html = '<div class="section-header"><h1>Dispute Management</h1></div>';
    html += '<div class="table-card"><table class="admin-table"><thead><tr><th>ID</th><th>Artist</th><th>Organizer</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    disputes.forEach(dispute => {
        const statusClass = dispute.status === 'resolved' ? 'resolved' : 'open';
        html += `<tr>
            <td>${dispute.id}</td>
            <td>${dispute.artistName}</td>
            <td>${dispute.organizerName}</td>
            <td>${dispute.reason}</td>
            <td><span class="badge ${statusClass}">${dispute.status}</span></td>
            <td>
                <button class="btn-small" onclick="resolveDispute('${dispute.id}')" style="background:#4CAF50">Resolve</button>
                <button class="btn-small" onclick="viewDispute('${dispute.id}')">View Details</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    section.innerHTML = html;
}

// Render Payouts Table
function renderPayoutsTable() {
    const section = document.getElementById('payouts');
    
    let html = '<div class="section-header"><h1>Payout Management</h1></div>';
    html += '<div class="table-card"><table class="admin-table"><thead><tr><th>ID</th><th>Artist</th><th>Amount</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    payouts.forEach(payout => {
        const statusClass = payout.status === 'paid' ? 'completed' : payout.status === 'processing' ? 'confirmed' : 'pending';
        html += `<tr>
            <td>${payout.id}</td>
            <td>${payout.artistName}</td>
            <td>$${payout.amount.toFixed(2)}</td>
            <td>${payout.method}</td>
            <td><span class="badge ${statusClass}">${payout.status}</span></td>
            <td>
                <button class="btn-small" onclick="approvePayout('${payout.id}')" style="background:#4CAF50">Approve</button>
                <button class="btn-small" onclick="declinePayout('${payout.id}')" style="background:#f44336">Decline</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    section.innerHTML = html;
}

// Action Functions
function approveArtist(userId) {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        user.verified = true;
        localStorage.setItem('plum_users', JSON.stringify(users));
        alert(`${user.firstName} ${user.lastName} has been verified!`);
        renderArtistVerification();
        updateDashboardStats();
    }
}

function rejectArtist(userId) {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        const index = users.indexOf(user);
        users.splice(index, 1);
        localStorage.setItem('plum_users', JSON.stringify(users));
        alert(`${user.firstName} ${user.lastName} has been rejected.`);
        renderArtistVerification();
        updateDashboardStats();
    }
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        localStorage.setItem('plum_bookings', JSON.stringify(bookings));
        alert(`Booking ${bookingId} updated to ${newStatus}`);
        renderBookingsTable();
        updateDashboardStats();
    }
}

function resolveDispute(disputeId) {
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
        dispute.status = 'resolved';
        localStorage.setItem('plum_disputes', JSON.stringify(disputes));
        alert(`Dispute ${disputeId} marked as resolved`);
        renderDisputesTable();
        updateDashboardStats();
    }
}

function approvePayout(payoutId) {
    const payout = payouts.find(p => p.id === payoutId);
    if (payout) {
        payout.status = 'paid';
        localStorage.setItem('plum_payouts', JSON.stringify(payouts));
        alert(`Payout ${payoutId} approved for $${payout.amount.toFixed(2)}`);
        renderPayoutsTable();
        updateDashboardStats();
    }
}

function declinePayout(payoutId) {
    const payout = payouts.find(p => p.id === payoutId);
    if (payout) {
        payout.status = 'declined';
        localStorage.setItem('plum_payouts', JSON.stringify(payouts));
        alert(`Payout ${payoutId} declined`);
        renderPayoutsTable();
        updateDashboardStats();
    }
}

function viewUser(userId) {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nType: ${user.userType}\nJoined: ${user.createdAt}`);
    }
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
        const user = users.find(u => u.id === userId);
        if (user) {
            user.suspended = true;
            localStorage.setItem('plum_users', JSON.stringify(users));
            alert('User suspended');
            renderUserManagement();
        }
    }
}

function viewDispute(disputeId) {
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
        alert(`Dispute: ${dispute.id}\nArtist: ${dispute.artistName}\nOrganizer: ${dispute.organizerName}\nReason: ${dispute.reason}\nStatus: ${dispute.status}`);
    }
}

function filterUsers(searchTerm) {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    const filtered = users.filter(u => u.firstName.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm));
    
    let html = '';
    filtered.forEach(user => {
        const status = user.verified ? 'Verified' : 'Pending';
        const statusClass = user.verified ? 'verified' : 'pending';
        html += `<tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.userType}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn-small" onclick="viewUser('${user.id}')">View</button>
                <button class="btn-small" onclick="suspendUser('${user.id}')">Suspend</button>
            </td>
        </tr>`;
    });
    document.getElementById('usersTableBody').innerHTML = html;
}

function initCharts() {
    const users = JSON.parse(localStorage.getItem('plum_users') || '[]');
    
    // Sparklines for stats
    const sparkCtxUsers = document.getElementById('usersSparkline')?.getContext('2d');
    if (sparkCtxUsers) {
        new Chart(sparkCtxUsers, {
            type: 'line',
            data: { labels: ['','','','','',''], datasets: [{ data: [5,8,6,12,10,users.length], borderColor: '#8B2BE2', borderWidth: 2, pointRadius: 0, fill: false }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
    const sparkBookings = document.getElementById('bookingsSparkline')?.getContext('2d');
    if (sparkBookings) {
        new Chart(sparkBookings, {
            type: 'line',
            data: { labels: ['','','','','',''], datasets: [{ data: [8,12,10,15,18,bookings.length], borderColor: '#C4E000', borderWidth: 2, pointRadius: 0, fill: false }] },
            options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }
}

    