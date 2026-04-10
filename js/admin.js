// Initialize localStorage with demo data if missing
  if(!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { id:1, role:'artist', name:'B\'Flow', email:'bflow@plum.com', verified:false, category:'Musician', city:'Kabwe', rate:11000, bio:'Afro Fusion', profilePhoto:'https://commons.wikimedia.org/wiki/Special:FilePath/B%20Flow%20happy%20%28cropped%29.jpg' },
      { id:2, role:'organizer', name:'Metropolitan Events', email:'events@metro.com', verified:true, city:'Lusaka' }
    ]));
  }
  if(!localStorage.getItem('bookings')) {
    localStorage.setItem('bookings', JSON.stringify([
      { id:1, client:'John Doe', artist:'B\'Flow', date:'2026-04-10', amount:11000, status:'confirmed' },
      { id:2, client:'Sarah Johnson', artist:'Towela Kaira', date:'2026-04-15', amount:16500, status:'pending' }
    ]));
  }
  if(!localStorage.getItem('disputes')) {
    localStorage.setItem('disputes', JSON.stringify([]));
  }
  if(!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(['Musicians','DJs','Photographers','Comedians','Dancers']));
  }
  // Helper to get data
  function getUsers() { return JSON.parse(localStorage.getItem('users')||'[]'); }
  function getBookings() { return JSON.parse(localStorage.getItem('bookings')||'[]'); }
  function getDisputes() { return JSON.parse(localStorage.getItem('disputes')||'[]'); }
  function getCategories() { return JSON.parse(localStorage.getItem('categories')||'[]'); }
  function statusMarkup(type, label) {
    const icon = type === 'ok'
      ? `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`
      : type === 'off'
      ? `<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>`;
    return `<span class="status-inline">${icon}<span>${label}</span></span>`;
  }
  
  // Update all dashboard stats
  function updateDashboard() {
    let users = getUsers();
    let bookings = getBookings();
    let disputesData = getDisputes();
    if(!disputesData.length) {
      disputesData = [
        { title:'Deposit dispute', owner:'Metropolitan Events vs B\'Flow', priority:'High', age:'2 days' },
        { title:'Late cancellation review', owner:'Private client vs Towela Kaira', priority:'Medium', age:'1 day' }
      ];
    }
    let pending = users.filter(u => u.role==='artist' && !u.verified).length;
    let revenue = bookings.reduce((sum,b)=> sum + (b.status==='confirmed'||b.status==='completed' ? b.amount : 0), 0);
    let pendingPayouts = bookings.filter(b=>b.status==='confirmed').reduce((s,b)=>s+b.amount*0.9, 0);
    let disputes = disputesData.length;
    let artistCount = users.filter(u => u.role === 'artist').length;
    let organizerCount = users.filter(u => u.role === 'organizer').length;
    let verifiedCount = users.filter(u => u.verified).length;
    let confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
    let pendingBookings = bookings.filter(b => b.status === 'pending').length;
    let completedBookingValue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, booking) => sum + booking.amount, 0);
    document.getElementById('statUsers').innerText = users.length;
    document.getElementById('statBookings').innerText = bookings.length;
    document.getElementById('statPending').innerText = pending;
    document.getElementById('statRevenue').innerText = revenue.toLocaleString();
    document.getElementById('statPayouts').innerText = Math.floor(pendingPayouts).toLocaleString();
    document.getElementById('statDisputes').innerText = disputes;
    document.getElementById('sidebarPending').innerText = pending;
    document.getElementById('sidebarRevenue').innerText = `K${revenue.toLocaleString()}`;
    document.getElementById('usersBadge').innerText = users.length;
    document.getElementById('disputesBadge').innerText = disputes;
    document.getElementById('bookingsBadge').innerText = bookings.length;
    document.getElementById('categoriesBadge').innerText = getCategories().length;
    document.getElementById('healthPending').innerText = `${pending} waiting`;
    document.getElementById('healthConversion').innerText = `${users.length ? Math.round((verifiedCount / users.length) * 100) : 0}% approved`;
    document.getElementById('healthRisk').innerText = disputes > 2 ? 'Elevated' : 'Low';
    document.getElementById('reserveBuffer').innerText = `K ${(revenue * 0.15).toLocaleString()}`;
    document.getElementById('financePendingPayouts').innerText = `${bookings.filter(b => b.status === 'confirmed').length} bookings awaiting release`;
    const highValue = bookings.filter(b => b.amount >= 15000);
    document.getElementById('financeHighValue').innerText = highValue.length ? `${highValue.length} high-value bookings flagged` : 'No alerts';
    document.getElementById('artistCount').innerText = artistCount;
    document.getElementById('organizerCount').innerText = organizerCount;
    document.getElementById('verifiedCount').innerText = verifiedCount;
    document.getElementById('openDisputes').innerText = disputes;
    document.getElementById('escalatedDisputes').innerText = disputes > 1 ? 1 : 0;
    document.getElementById('disputeAge').innerText = disputes ? '2 days' : '0 days';
    document.getElementById('confirmedBookings').innerText = confirmedBookings;
    document.getElementById('pendingBookings').innerText = pendingBookings;
    document.getElementById('completedBookingValue').innerText = `K ${completedBookingValue.toLocaleString()}`;
    // Verification table
    let tbody = document.querySelector('#verifyTable tbody');
    tbody.innerHTML = '';
    users.filter(u=>u.role==='artist' && !u.verified).forEach(u => {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.category||'Artist'}</td><td><button class="action-btn approve" onclick="verifyUser(${u.id})">Approve</button><button class="action-btn reject" onclick="rejectUser(${u.id})">Reject</button></td>`;
      tbody.appendChild(tr);
    });
    // Recent bookings
    let btbody = document.querySelector('#recentBookingsTable tbody');
    btbody.innerHTML = '';
    bookings.slice(0,5).forEach(b => {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td>${b.client}</td><td>${b.artist}</td><td>${b.date}</td><td>K${b.amount.toLocaleString()}</td><td>${b.status}</td>`;
      btbody.appendChild(tr);
    });
    // Financial section
    document.getElementById('totalFees').innerText = (revenue * 0.1).toLocaleString();
    document.getElementById('outstandingPayouts').innerText = Math.floor(pendingPayouts).toLocaleString();
    // All users table
    let allUsersBody = document.querySelector('#allUsersTable tbody');
    if(allUsersBody) {
      allUsersBody.innerHTML = '';
      users.forEach(u => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.name}</td><td>${u.role}</td><td>${u.email}</td><td>${u.verified ? `<span class="status-badge ok">Verified</span>` : `<span class="status-badge off">Pending</span>`}</td>`;
        allUsersBody.appendChild(tr);
      });
    }
    // All bookings table
    let allBookingsBody = document.querySelector('#allBookingsTable tbody');
    if(allBookingsBody) {
      allBookingsBody.innerHTML = '';
      bookings.forEach(b => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${b.id}</td><td>${b.client}</td><td>${b.artist}</td><td>${b.date}</td><td>K${b.amount}</td><td>${b.status}</td>`;
        allBookingsBody.appendChild(tr);
      });
    }
    // Disputes list
    let disputesList = document.getElementById('disputesList');
    if(disputesList) {
      disputesList.innerHTML = '';
      disputesData.forEach(item => {
        let row = document.createElement('div');
        row.className = 'stack-item';
        row.innerHTML = `<div><strong>${item.title}</strong><span>${item.owner}</span></div><div style="text-align:right"><div class="status-badge ${item.priority === 'High' ? 'off' : 'wait'}">${item.priority}</div><span>${item.age}</span></div>`;
        disputesList.appendChild(row);
      });
    }
    // Categories list
    let catDiv = document.getElementById('categoriesList');
    if(catDiv) {
      catDiv.innerHTML = '';
      getCategories().forEach(c => {
        let span = document.createElement('span');
        span.className = 'list-tag';
        span.innerText = c;
        catDiv.appendChild(span);
      });
    }
  }
  window.verifyUser = function(id) {
    let users = getUsers();
    let idx = users.findIndex(u=>u.id===id);
    if(idx!==-1) users[idx].verified = true;
    localStorage.setItem('users', JSON.stringify(users));
    updateDashboard();
  };
  window.rejectUser = function(id) {
    let users = getUsers();
    users = users.filter(u=>u.id!==id);
    localStorage.setItem('users', JSON.stringify(users));
    updateDashboard();
  };
  window.addCategory = function() {
    let newCat = document.getElementById('newCategory').value.trim();
    if(newCat) {
      let cats = getCategories();
      cats.push(newCat);
      localStorage.setItem('categories', JSON.stringify(cats));
      updateDashboard();
      document.getElementById('newCategory').value = '';
    }
  };
  // Charts
  function initCharts() {
    new Chart(document.getElementById('bookingsChart'), { type:'line', data:{ labels:['Jan','Feb','Mar','Apr','May','Jun'], datasets:[{ label:'Bookings', data:[12,19,23,28,35,42], borderColor:'#8929C9', tension:0.3 }] } });
    new Chart(document.getElementById('categoryChart'), { type:'doughnut', data:{ labels:['Music','Photo','DJ','Dance'], datasets:[{ data:[45,25,20,10], backgroundColor:['#8929C9','#B8D900','#F5B800','#B264F0'] }] } });
    new Chart(document.getElementById('userGrowthChart'), { type:'bar', data:{ labels:['Jan','Feb','Mar','Apr','May','Jun'], datasets:[{ label:'New Users', data:[8,15,22,28,34,41], backgroundColor:'#B8D900' }] } });
  }
  // Dark mode
  function setDarkMode(enabled) {
    if(enabled) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('darkMode', enabled);
    document.getElementById('darkModeToggleSetting').checked = enabled;
  }
  document.getElementById('darkModeToggleBtn').addEventListener('click', () => setDarkMode(!document.body.classList.contains('dark')));
  document.getElementById('darkModeToggleSetting')?.addEventListener('change', (e) => setDarkMode(e.target.checked));
  if(localStorage.getItem('darkMode') === 'true') setDarkMode(true);
  
  // Sidebar navigation
  const sections = ['dashboard','financial','users','disputes','bookings','events','categories','settings'];
  function showSection(section) {
    sections.forEach(s => {
      const el = document.getElementById(s+'Section');
      if(el) el.style.display = s === section ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-section="${section}"]`).classList.add('active');
  }
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });
  showSection('dashboard');
  initCharts();
  updateDashboard();
  
  // Particles, cursor, mobile menu (same as index)
  const dot=document.getElementById('cursorDot');
  document.addEventListener('mousemove',e=>{dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
  document.querySelectorAll('a,button,.stat-card,.glass-card').forEach(el=>el.addEventListener('mouseenter',()=>dot.classList.add('hovered')));
  document.querySelectorAll('a,button,.stat-card,.glass-card').forEach(el=>el.addEventListener('mouseleave',()=>dot.classList.remove('hovered')));
  for(let i=0;i<40;i++){let p=document.createElement('div'); p.className='particle'; p.style.cssText=`width:${Math.random()*4+1}px;height:${Math.random()*4+1}px;background:rgba(137,41,201,0.4);left:${Math.random()*100}%;animation-duration:${Math.random()*18+10}s;animation-delay:${Math.random()*12}s;`; document.getElementById('particleContainer').appendChild(p);}
  window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',scrollY>60));
  document.getElementById('menuBtn').addEventListener('click',()=>{document.getElementById('mobileNav').classList.add('open');document.body.style.overflow='hidden';});
  document.getElementById('mobileClose').addEventListener('click',()=>{document.getElementById('mobileNav').classList.remove('open');document.body.style.overflow='';});
