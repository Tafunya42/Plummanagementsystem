lucide.createIcons();
const cur=document.getElementById('cursor');
if(cur){document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});document.querySelectorAll('a,button,.nav-item,.metric-card,.booking-row,.inq-item,.qa-btn').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('hov'));el.addEventListener('mouseleave',()=>cur.classList.remove('hov'));});}

function showPage(id,clickedEl){
  document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));
  const sec=document.getElementById('sec-'+id);
  if(sec){sec.classList.add('active');document.getElementById('pageTitle').textContent=sec.querySelector('.dc-title')?.textContent||sec.querySelector('h2')?.textContent||id.charAt(0).toUpperCase()+id.slice(1);}
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(clickedEl)clickedEl.classList.add('active');
  if(id==='earnings')buildCharts();
  if(window.innerWidth<768)document.getElementById('sidebar').classList.remove('open');
}

// BAR CHARTS
const months=['Jan','Feb','Mar','Apr','May','Jun'];
const vals=[28000,62400,44200,38900,48200,51000];
const maxV=Math.max(...vals);
function buildBarChart(id,data){
  const el=document.getElementById(id);
  if(!el)return;
  el.innerHTML=data.map((v,i)=>`<div class="bar-wrap"><div class="bar-val">K${(v/1000).toFixed(0)}k</div><div class="bar" style="height:${Math.max(8,(v/maxV)*80)}px;"></div><div class="bar-label">${months[i]}</div></div>`).join('');
}
buildBarChart('earningsChart',vals);
function buildCharts(){buildBarChart('fullEarningsChart',vals);}

// COUNTERS
function animCount(el,target,suffix,prefix,dur=1500){let s=null;const fn=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);const e=1-Math.pow(1-p,3);const v=Math.floor(e*target);el.textContent=(prefix||'')+v.toLocaleString()+(suffix||'');if(p<1)requestAnimationFrame(fn);};requestAnimationFrame(fn);}
const cObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting&&!e.target.dataset.done){e.target.dataset.done='1';animCount(e.target,+e.target.dataset.target,e.target.dataset.suffix||'',e.target.dataset.prefix||'');}});},{threshold:0.5});
document.querySelectorAll('[data-target]').forEach(el=>cObs.observe(el));

// REVEAL
const revObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.05});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

function changeAvatar(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{document.getElementById('sideAvatar').src=e.target.result;};r.readAsDataURL(input.files[0]);}}
function handlePortfolioUpload(input){if(input.files.length>0){showToast(`${input.files.length} file(s) added!`);[...input.files].forEach(f=>{const reader=new FileReader();reader.onload=e=>{const div=document.createElement('div');div.style.cssText='border-radius:12px;overflow:hidden;aspect-ratio:1;position:relative;cursor:pointer;';div.innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;" alt=""/><button onclick="this.parentElement.remove()" style="position:absolute;top:6px;right:6px;background:rgba(232,64,64,0.85);border:none;border-radius:50%;width:26px;height:26px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg></button>`;const grid=document.getElementById('portfolioGrid');grid.insertBefore(div,grid.lastElementChild);};reader.readAsDataURL(f);});}}

function openEditModal(){document.getElementById('editModal').classList.add('open');lucide.createIcons();}
function closeModal(){document.getElementById('editModal').classList.remove('open');}
function saveAndClose(){showToast('Profile updated!');closeModal();}
function editService(btn){showToast('Service editor opening...');}
function openAddService(){showToast('Add service — coming soon!');}
function shareProfile(){navigator.clipboard?navigator.clipboard.writeText(window.location.origin+'/artist-profile.html').then(()=>showToast('Profile link copied!')):showToast('Share: '+window.location.origin+'/artist-profile.html');}
function showToast(msg){const t=document.createElement('div');t.style.cssText='position:fixed;bottom:2rem;right:2rem;background:var(--navy2);color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-size:0.875rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:translateY(20px);opacity:0;transition:all 0.3s;';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{t.style.transform='none';t.style.opacity='1';},10);setTimeout(()=>{t.style.transform='translateY(20px)';t.style.opacity='0';setTimeout(()=>t.remove(),300);},3000);}
