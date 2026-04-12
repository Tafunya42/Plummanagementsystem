lucide.createIcons();

// CURSOR
const cur = document.getElementById('cursor');
if(cur){
  document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
  document.querySelectorAll('a,button,.tc,.f-chip,.fg-opt,.r-star-opt').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur.classList.add('hov'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('hov'));
  });
}

// NAV SCROLL
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>50));

// MOBILE MENU
document.getElementById('menuToggle').addEventListener('click',()=>{document.getElementById('mobMenu').classList.add('open');document.body.classList.add('menu-open');});
document.getElementById('mobClose').addEventListener('click',()=>{document.getElementById('mobMenu').classList.remove('open');document.body.classList.remove('menu-open');lucide.createIcons();});

// TALENT DATA
const talents = [
  {id:1,name:'Chanda Mwewa',role:'Commercial Photographer',category:'Photography',city:'Lusaka',rating:4.9,reviews:128,rate:'K800/hr',badge:'featured',badgeType:'purple',img:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop',tags:['Weddings','Events','Portraits'],verified:true},
  {id:2,name:'Mutale Phiri',role:'Music Producer',category:'Music',city:'Ndola',rating:4.8,reviews:96,rate:'K1,200/track',badge:'top',badgeType:'lime',img:'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80&auto=format&fit=crop',tags:['Afrobeat','R&B','Hip-Hop'],verified:true},
  {id:3,name:'Naledi Banda',role:'Film Director',category:'Film',city:'Kitwe',rating:5.0,reviews:54,rate:'K5,000/day',badge:'5★',badgeType:'gold',img:'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&q=80&auto=format&fit=crop',tags:['Commercials','Docs','Music Videos'],verified:true},
  {id:4,name:'Temwani Zulu',role:'Graphic Designer',category:'Design',city:'Lusaka',rating:4.7,reviews:203,rate:'K450/hr',badge:null,img:'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&q=80&auto=format&fit=crop',tags:['Branding','UI/UX','Print'],verified:true},
  {id:5,name:'Bupe Mwale',role:'Fashion Designer',category:'Fashion',city:'Livingstone',rating:4.9,reviews:77,rate:'K2,800/look',badge:'top',badgeType:'lime',img:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80&auto=format&fit=crop',tags:['Styling','Editorial','Runway'],verified:true},
  {id:6,name:'Mwanza Chipili',role:'Videographer',category:'Film',city:'Lusaka',rating:4.6,reviews:88,rate:'K3,500/day',badge:null,img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',tags:['Weddings','Corporate','Events'],verified:true},
  {id:7,name:'Kasonde Lungu',role:'DJ & Live Performer',category:'Music',city:'Lusaka',rating:4.8,reviews:145,rate:'K3,000/gig',badge:'featured',badgeType:'purple',img:'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80&auto=format&fit=crop',tags:['Club','Corporate','Weddings'],verified:true},
  {id:8,name:'Wezi Mwale',role:'Dancer & Choreographer',category:'Dance',city:'Ndola',rating:4.7,reviews:62,rate:'K1,500/show',badge:null,img:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80&auto=format&fit=crop',tags:['Contemporary','Traditional','Stage'],verified:true},
  {id:9,name:'Chomba Sikota',role:'Content Writer',category:'Writing',city:'Lusaka',rating:4.5,reviews:34,rate:'K250/article',badge:'new',badgeType:'lime',img:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop',tags:['Copywriting','Blogs','Scripts'],verified:false},
  {id:10,name:'Yambwe Kabwe',role:'Portrait Photographer',category:'Photography',city:'Kabwe',rating:4.6,reviews:91,rate:'K600/hr',badge:null,img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop',tags:['Portraits','Headshots','Events'],verified:true},
  {id:11,name:'Namakau Zulu',role:'Fashion Stylist',category:'Fashion',city:'Lusaka',rating:4.8,reviews:58,rate:'K1,800/day',badge:'top',badgeType:'lime',img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop',tags:['Editorial','Celebrity','Events'],verified:true},
  {id:12,name:'Sitwala Mutale',role:'Music Video Director',category:'Film',city:'Kitwe',rating:4.7,reviews:43,rate:'K8,000/video',badge:null,img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop',tags:['Music Videos','Short Film','Ads'],verified:true},
  {id:13,name:'Mabvuto Phiri',role:'Brand Designer',category:'Design',city:'Lusaka',rating:4.9,reviews:167,rate:'K600/hr',badge:'featured',badgeType:'purple',img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop',tags:['Logos','Branding','Packaging'],verified:true},
  {id:14,name:'Twaambo Mwila',role:'Singer & Songwriter',category:'Music',city:'Livingstone',rating:4.9,reviews:82,rate:'K4,500/show',badge:'top',badgeType:'gold',img:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop',tags:['Afropop','Gospel','Soul'],verified:true},
  {id:15,name:'Chilufya Banda',role:'Event Photographer',category:'Photography',city:'Lusaka',rating:4.5,reviews:110,rate:'K700/hr',badge:null,img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&auto=format&fit=crop',tags:['Events','Corporates','Galas'],verified:true},
  {id:16,name:'Luyando Nkonde',role:'Digital Artist',category:'Design',city:'Ndola',rating:4.6,reviews:45,rate:'K400/hr',badge:'new',badgeType:'lime',img:'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&q=80&auto=format&fit=crop',tags:['Illustration','3D','Motion'],verified:false},
  {id:17,name:'Precious Kawimbe',role:'Dance Instructor',category:'Dance',city:'Lusaka',rating:4.8,reviews:73,rate:'K800/session',badge:null,img:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80&auto=format&fit=crop',tags:['Training','Competitions','Recitals'],verified:true},
  {id:18,name:'Kelvin Mumba',role:'Filmmaker',category:'Film',city:'Lusaka',rating:4.7,reviews:38,rate:'K6,000/day',badge:'featured',badgeType:'purple',img:'https://images.unsplash.com/photo-1537396123957-c468e3191e1e?w=400&q=80&auto=format&fit=crop',tags:['Documentary','Corporate','Weddings'],verified:true},
];

let filteredTalents = [...talents];
let currentPage = 1;
const perPage = 9;
let activeCategory = 'All';
let currentView = 'grid';

function setCategory(cat){
  activeCategory = cat;
  document.querySelectorAll('.f-chip').forEach(c=>c.classList.remove('active'));
  document.querySelectorAll('.f-chip').forEach(c=>{if(c.textContent.trim().includes(cat==='All'?'All':cat))c.classList.add('active');});
  currentPage = 1;
  filterTalent();
}

function setRating(r){
  document.querySelectorAll('.r-star-opt').forEach(s=>s.classList.remove('active'));
  event.currentTarget.classList.add('active');
  filterTalent();
}

function clearFilters(){
  activeCategory='All';
  document.getElementById('searchInput').value='';
  document.getElementById('locationFilter').value='';
  document.querySelectorAll('.f-chip').forEach((c,i)=>{c.classList.toggle('active',i===0);});
  document.querySelectorAll('.fg-opt input').forEach(c=>c.checked=false);
  currentPage=1;
  filterTalent();
}

function updateBudgetLabel(v){
  document.getElementById('budgetLabel').textContent = v>=100000?'K100,000+':'K'+parseInt(v).toLocaleString();
  filterTalent();
}

function filterTalent(){
  const q = document.getElementById('searchInput').value.toLowerCase();
  const loc = document.getElementById('locationFilter').value;
  filteredTalents = talents.filter(t=>{
    const matchQ = !q || t.name.toLowerCase().includes(q)||t.role.toLowerCase().includes(q)||t.tags.some(tg=>tg.toLowerCase().includes(q));
    const matchCat = activeCategory==='All'||t.category===activeCategory;
    const matchLoc = !loc||t.city===loc;
    return matchQ&&matchCat&&matchLoc;
  });
  const sort = document.getElementById('sortSelect').value;
  if(sort==='rating') filteredTalents.sort((a,b)=>b.rating-a.rating);
  else if(sort==='price-low') filteredTalents.sort((a,b)=>parseInt(a.rate.replace(/\D/g,''))-parseInt(b.rate.replace(/\D/g,'')));
  else if(sort==='price-high') filteredTalents.sort((a,b)=>parseInt(b.rate.replace(/\D/g,''))-parseInt(a.rate.replace(/\D/g,'')));
  currentPage=1;
  renderGrid();
}

function setView(v){
  currentView=v;
  document.getElementById('talentGrid').className='talent-grid'+(v==='list'?' list-view':'');
  document.getElementById('gridBtn').classList.toggle('active',v==='grid');
  document.getElementById('listBtn').classList.toggle('active',v==='list');
  renderGrid();
}

function loadMore(){currentPage++;renderGrid();}

function renderGrid(){
  const grid=document.getElementById('talentGrid');
  const toShow=filteredTalents.slice(0,currentPage*perPage);
  document.getElementById('showingCount').textContent=toShow.length;
  document.getElementById('resultCount').innerHTML=`<strong>${filteredTalents.length.toLocaleString()}</strong> creatives found`;
  document.getElementById('loadMoreBtn').style.display=toShow.length>=filteredTalents.length?'none':'inline-flex';

  if(filteredTalents.length===0){
    grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1;"><i data-lucide="search-x" style="width:48px;height:48px;margin-bottom:1rem;opacity:0.25;color:var(--purple);"></i><h3>No results found</h3><p>Try adjusting your filters or search term.</p></div>`;
    lucide.createIcons();return;
  }

  grid.innerHTML=toShow.map((t,i)=>`
    <div class="tc reveal d${(i%6)+1}">
      <div class="tc-img" onclick="window.location='artist-profile.html'">
        <img src="${t.img}" alt="${t.name}" loading="lazy"/>
        ${t.badge?`<div class="tc-badge ${t.badgeType}">${t.badge==='featured'?'Featured':t.badge==='top'?'Top Rated':t.badge==='new'?'New':t.badge}</div>`:''}
        ${t.verified?`<div style="position:absolute;top:0.75rem;${t.badge?'left:unset;right:0.75rem;':'right:0.75rem;'}"><div style="background:rgba(255,255,255,0.85);backdrop-filter:blur(8px);padding:0.2rem 0.5rem;border-radius:100px;font-size:0.65rem;font-weight:700;color:#2E9E4F;display:flex;align-items:center;gap:3px;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Verified</div></div>`:''}
        <button class="tc-fav" onclick="event.stopPropagation();this.classList.toggle('active');this.innerHTML=this.classList.contains('active')?'<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'13\\' height=\\'13\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\\'></path></svg>':'<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'13\\' height=\\'13\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\\'></path></svg>'"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'></path></svg></button>
      </div>
      <div class="tc-body">
        <div class="tc-top">
          <div class="tc-avatar" onclick="window.location='artist-profile.html'"><img src="${t.img}" alt="${t.name}" loading="lazy"/></div>
          <div onclick="window.location='artist-profile.html'"><div class="tc-name">${t.name}</div><div class="tc-role">${t.role}</div></div>
        </div>
        <div class="tc-meta">
          <div class="tc-rating"><span class="star">★</span>${t.rating}<span class="tc-reviews">(${t.reviews})</span></div>
          <div class="tc-city"><svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>${t.city}</div>
          <div class="tc-rate">${t.rate}</div>
        </div>
        <div class="tc-tags">${t.tags.map(tg=>`<span class="tc-tag">${tg}</span>`).join('')}</div>
        <div class="tc-actions">
          <button class="tc-btn primary" onclick="openQuickView(${t.id})"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/></svg> Quick View</button>
          <a href="login.html?intent=booking" class="tc-btn ghost" onclick="event.stopPropagation()"><svg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13.3 19.79 19.79 0 0 1 1.27 4.73 2 2 0 0 1 3.26 2.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.77-1.55a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/></svg> Book</a>
        </div>
      </div>
    </div>
  `).join('');

  // Re-observe reveals
  document.querySelectorAll('.tc.reveal').forEach(el=>revObs.observe(el));
  lucide.createIcons();

  // Re-attach cursor hover
  document.querySelectorAll('.tc,.tc-btn,.tc-fav').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur&&cur.classList.add('hov'));
    el.addEventListener('mouseleave',()=>cur&&cur.classList.remove('hov'));
  });
}

// SCROLL REVEAL
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.05,rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// Init
filterTalent();

// URL params
const params = new URLSearchParams(location.search);
if(params.get('cat')) setCategory(params.get('cat'));
if(params.get('q')) {document.getElementById('searchInput').value=params.get('q');filterTalent();}

// QUICK VIEW LOGIC
window.openQuickView = function(id) {
  const t = talents.find(x => x.id === id);
  if (!t) return;
  document.getElementById('qvMedia').innerHTML = `<img src="${t.img}" alt="${t.name}">`;
  document.getElementById('qvMeta').innerHTML = `<span class="badge badge--violet">${t.category}</span> <span class="badge badge--ghost">${t.city}</span>`;
  document.getElementById('qvName').textContent = t.name;
  document.getElementById('qvBio').textContent = `Professional ${t.role} with ${t.reviews} successful bookings. Expert in ${t.tags.join(', ')}. Rating: ${t.rating} stars. Starting from ${t.rate}.`;
  document.getElementById('qvTags').innerHTML = t.tags.map(tg => `<span class="tag tag--ghost">${tg}</span>`).join('');
  
  document.getElementById('qvBookBtn').onclick = () => window.location = `login.html?intent=booking&artist=${t.id}`;
  document.getElementById('qvProfileBtn').onclick = () => window.location = `artist-profile.html?id=${t.id}`;
  
  document.getElementById('qvOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
};

window.closeQuickView = function() {
  document.getElementById('qvOverlay').classList.remove('open');
  document.body.style.overflow = '';
};
