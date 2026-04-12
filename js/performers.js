const allPerformers = [
  {name:'Chanda Mwewa',role:'Commercial Photographer',city:'Lusaka',cat:'Photography',rating:4.9,reviews:128,bookings:88,rate:'K800/hr',img:'1531123897727-8f129e1688ce',score:98,streak:4,momentum:3},
  {name:'Naledi Banda',role:'Film Director',city:'Kitwe',cat:'Film',rating:5.0,reviews:74,bookings:62,rate:'K1,200/hr',img:'1573496359142-b8d87734a5a2',score:95,streak:2,momentum:1},
  {name:'Mutale Phiri',role:'Music Producer',city:'Ndola',cat:'Music',rating:4.8,reviews:98,bookings:110,rate:'K600/hr',img:'1522529599102-193c0d76b5b6',score:92,streak:3,momentum:2},
  {name:'Temwani Zulu',role:'Graphic Designer',city:'Lusaka',cat:'Design',rating:4.7,reviews:112,bookings:180,rate:'K500/hr',img:'1531384441138-2736e62e0919',score:88,streak:1,momentum:-1},
  {name:'Bupe Mwale',role:'Fashion Stylist',city:'Lusaka',cat:'Fashion',rating:4.8,reviews:67,bookings:95,rate:'K700/hr',img:'1534528741775-53994a69daeb',score:86,streak:2,momentum:2},
  {name:'Yambwe Kabwe',role:'Portrait Artist',city:'Kabwe',cat:'Photography',rating:4.6,reviews:89,bookings:120,rate:'K600/hr',img:'1500648767791-00dcc994a43e',score:84,streak:1,momentum:-2},
  {name:'Kasonde Mulenga',role:'Composer',city:'Ndola',cat:'Music',rating:4.9,reviews:52,bookings:48,rate:'K800/hr',img:'1519085360753-af0119f7cbe7',score:82,streak:2,momentum:4},
  {name:'Chilufya Banda',role:'Fashion Photographer',city:'Lusaka',cat:'Photography',rating:4.7,reviews:91,bookings:76,rate:'K700/hr',img:'1488426862026-3ee34a7d66df',score:80,streak:1,momentum:1},
  {name:'Mwanza Chipili',role:'Videographer',city:'Lusaka',cat:'Film',rating:4.5,reviews:63,bookings:52,rate:'K3,500/day',img:'1507003211169-0a1dd7228f2d',score:78,streak:1,momentum:0},
];

/* ── ORBITAL CANVAS ── */
(function(){
  const c=document.getElementById('orbCanvas'); if(!c)return;
  const ctx=c.getContext('2d'); let W,H;
  const rings=Array.from({length:14},()=>({
    x:Math.random(), y:Math.random(),
    r:30+Math.random()*70,
    spd:0.00025+Math.random()*0.0004,
    ang:Math.random()*Math.PI*2,
    alpha:0.03+Math.random()*0.07,
    col:Math.random()>0.55?'199,210,15':'139,31,200',
  }));
  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  window.addEventListener('resize',resize); resize();
  function draw(){
    ctx.clearRect(0,0,W,H);
    rings.forEach(r=>{
      r.ang+=r.spd;
      const cx=r.x*W+Math.sin(r.ang*1.8)*28, cy=r.y*H+Math.cos(r.ang*1.4)*22;
      ctx.beginPath(); ctx.arc(cx,cy,r.r,0,Math.PI*2);
      ctx.strokeStyle=`rgba(${r.col},${r.alpha})`;
      ctx.lineWidth=1; ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── HEADLINE WORDS ── */
(function(){
  const words=[{t:'The',g:0},{t:'Pantheon',g:0},{t:'of',g:0},{t:'Zambian',g:1},{t:'Talent',g:0}];
  const el=document.getElementById('heroH1'); if(!el)return;
  el.innerHTML=words.map((w,i)=>`<span class="hw${w.g?' gr':''}" style="animation-delay:${0.28+i*0.1}s">${w.t}</span>&thinsp;`).join('');
})();

/* ── COUNT-UP ── */
function countUp(id,target,dur,suffix=''){
  const el=document.getElementById(id); if(!el)return;
  let v=0; const s=target/(dur/16);
  const t=setInterval(()=>{ v=Math.min(v+s,target); el.textContent=(Number.isInteger(target)?Math.round(v):v.toFixed(1))+suffix; if(v>=target)clearInterval(t); },16);
}
setTimeout(()=>{
  countUp('hs1',847,1400); countUp('hs2',2341,1600);
  countUp('hs3',4.8,1200,'★'); countUp('hs4',12,900);
},700);

/* ── HERO FLOAT CARDS ── */
function buildHeroCards(top3){
  const wrap=document.getElementById('heroVisuals'); if(!wrap)return;
  const classes=['fcard fcard-a','fcard fcard-b','fcard fcard-c'];
  const pips=['pip-1','pip-2','pip-3'];
  // Keep SVG lines, prepend cards
  const svg=wrap.querySelector('svg');
  const html=top3.map((p,i)=>`
    <div class="${classes[i]}" onclick="document.getElementById('pc${i+1}').scrollIntoView({behavior:'smooth'})">
      <div class="fcard-pip ${pips[i]}">${i+1}</div>
      <img src="https://images.unsplash.com/photo-${p.img}?w=320&q=80&fit=crop" alt="${p.name}"/>
      <div class="fcard-scrim">
        <span class="fcard-name">${p.name}</span>
        <span class="fcard-role">${p.role}</span>
        <span class="fcard-star"><i data-lucide="star" style="width:10px;height:10px;fill:currentColor;"></i> ${p.rating}</span>
      </div>
    </div>`).join('');
  wrap.insertAdjacentHTML('afterbegin', html);
}

/* ── TABS ── */
function movePill(btn){
  const pill=document.getElementById('tabPill'), track=document.getElementById('tabTrack'); if(!pill||!track)return;
  const tr=track.getBoundingClientRect(), br=btn.getBoundingClientRect();
  pill.style.left=(br.left-tr.left)+'px'; pill.style.width=br.width+'px';
}
document.querySelectorAll('.perf-tab').forEach(btn=>{
  btn.addEventListener('click',function(){
    document.querySelectorAll('.perf-tab').forEach(t=>t.classList.remove('active'));
    this.classList.add('active'); movePill(this);
    const pg=document.getElementById('podiumGrid'), rw=document.getElementById('risingWrap');
    if(!pg || !rw) return;
    pg.style.opacity='0'; pg.style.transform='translateY(15px)';
    rw.style.opacity='0'; rw.style.transform='translateY(15px)';
    setTimeout(()=>{
      renderPerformers(this.dataset.tab);
      [pg,rw].forEach(el=>{ 
        el.style.transition='opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)'; 
        el.style.opacity='1'; el.style.transform='translateY(0)'; 
      });
    },230);
  });
});

/* ── TILT ── */
function addTilt(card){
  if('ontouchstart' in window)return;
  card.addEventListener('mousemove',e=>{
    const rc=card.getBoundingClientRect();
    const dx=(e.clientX-rc.left-rc.width/2)/(rc.width/2), dy=(e.clientY-rc.top-rc.height/2)/(rc.height/2);
    card.style.transform=`perspective(900px) rotateX(${-dy*5}deg) rotateY(${dx*7}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave',()=>{ card.style.transform='perspective(900px) rotateX(0) rotateY(0) translateZ(0)'; card.style.transition='transform 0.6s cubic-bezier(0.34,1.56,0.64,1)'; });
  card.addEventListener('mouseenter',()=>{ card.style.transition='transform 0.1s ease'; });
}

/* ── RENDER ── */
function renderPerformers(tab){
  const filtered=tab==='All'?allPerformers:allPerformers.filter(p=>p.cat===tab);
  const sorted = tab === 'All' && window._sortedAll ? window._sortedAll : [...filtered].sort((a,b)=>b.score-a.score);
  const top3=sorted.slice(0,3), rest=sorted.slice(3);

  /* Podium */
  document.getElementById('podiumGrid').innerHTML=top3.map((p,i)=>{
    const rank=i+1, isFirst=rank===1;
    return `
    <div class="p-item r${rank}">
      <div class="p-card" id="pc${rank}">
        <div class="p-photo">
          <img src="https://images.unsplash.com/photo-${p.img}?w=480&q=85&fit=crop" alt="${p.name}"/>
          <div class="p-ghost-rank">${rank}</div>
        </div>
        <div class="p-body">
          <div class="streak-badge"><i data-lucide="flame"></i> ${p.streak}-month streak</div>
          <div class="p-name" style="font-size:${isFirst?'1.35':'1.15'}rem;">${p.name}</div>
          <div class="p-role">${p.role} · ${p.city}</div>
          <div class="p-score-bar">
            <div class="p-score-top">Score <em>${p.score}%</em></div>
            <div class="p-bar-track"><div class="p-bar-fill" data-w="${p.score}"></div></div>
          </div>
          <div class="p-stats">
            <div class="p-stat"><span class="ps-v">${p.rating}</span><span class="ps-k">Rating</span></div>
            <div class="p-stat"><span class="ps-v">${p.bookings}</span><span class="ps-k">Bookings</span></div>
            <div class="p-stat"><span class="ps-v">${p.reviews}</span><span class="ps-k">Reviews</span></div>
          </div>
          <a href="artist-profile.html" class="p-btn${isFirst?' filled':''}"><span>View Profile</span></a>
        </div>
      </div>
    </div>`;
  }).join('');

  top3.forEach((_,i)=>{ const c=document.getElementById(`pc${i+1}`); if(c) addTilt(c); });
  setTimeout(()=>{ document.querySelectorAll('.p-bar-fill[data-w]').forEach(el=>{ el.style.width=el.dataset.w+'%'; }); },150);

  /* Rising rows */
  document.getElementById('risingGrid').innerHTML=rest.map((p,i)=>{
    const rn=i+4, m=p.momentum;
    const momEl=m>0?`<span class="mom-u">↑ ${m}</span>`:m<0?`<span class="mom-d">↓ ${Math.abs(m)}</span>`:`<span class="mom-n">— 0</span>`;
    return `
    <div class="rs-row" style="opacity:0;animation:fadeSlide 0.5s ${i*0.055}s cubic-bezier(0.22,1,0.36,1) forwards;">
      <div class="rs-num">${rn}</div>
      <div><img class="rs-img" src="https://images.unsplash.com/photo-${p.img}?w=120&q=80&fit=crop" alt="${p.name}"/></div>
      <div>
        <div class="rs-info-name">${p.name}</div>
        <div class="rs-info-role">${p.role} · ${p.city}</div>
      </div>
      <div class="rs-val accent">${p.rating}<span class="rs-lbl">Rating</span></div>
      <div class="rs-val">${p.bookings}<span class="rs-lbl">Bookings</span></div>
      <div class="rs-mom">${momEl}<span class="mom-lbl">Trend</span></div>
      <div class="rs-link"><a href="artist-profile.html"><i data-lucide="arrow-up-right" style="width:13px;height:13px;"></i></a></div>
    </div>`;
  }).join('');

  lucide.createIcons();
}

/* ── INIT ── */
(function(){
  window._sortedAll = [...allPerformers].sort((a,b)=>b.score-a.score);
  buildHeroCards(window._sortedAll.slice(0,3));
  renderPerformers('All');
  setTimeout(()=>{ const a=document.querySelector('.perf-tab.active'); if(a) movePill(a); },80);
  window.addEventListener('resize',()=>{ const a=document.querySelector('.perf-tab.active'); if(a) movePill(a); });
  window.addEventListener('scroll',()=>{ const n=document.getElementById('navbar'); if(n) n.classList.toggle('scrolled',window.scrollY>40); });
})();
