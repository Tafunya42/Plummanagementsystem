lucide.createIcons();
const cur=document.getElementById('cursor');
if(cur){document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});document.querySelectorAll('a,button,.gal-item,.similar-card,.stat-card,.review-card').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('hov'));el.addEventListener('mouseleave',()=>cur.classList.remove('hov'));});}
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>50));
document.getElementById('menuToggle').addEventListener('click',()=>{document.getElementById('mobMenu').classList.add('open');document.body.classList.add('menu-open');});
document.getElementById('mobClose').addEventListener('click',()=>{document.getElementById('mobMenu').classList.remove('open');document.body.classList.remove('menu-open');lucide.createIcons();});

// TABS
function showTab(tab,btn){
  document.querySelectorAll('.ptab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

// COUNTERS
function animCount(el,target,suffix,dur=1800){let s=null;const fn=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);const e=1-Math.pow(1-p,3);el.textContent=Math.floor(e*target).toLocaleString()+suffix;if(p<1)requestAnimationFrame(fn);};requestAnimationFrame(fn);}
const cObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting&&!e.target.dataset.done){e.target.dataset.done='1';animCount(e.target,+e.target.dataset.target,e.target.dataset.suffix||'');}});},{threshold:0.5});
document.querySelectorAll('[data-target]').forEach(el=>cObs.observe(el));

// REVEAL
const revObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.05});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

// AVATAR
function changeAvatar(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>document.getElementById('profileAvatar').src=e.target.result;r.readAsDataURL(input.files[0]);}}

// LIGHTBOX
const galleryImgs=['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=90','https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=90','https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=90','https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=90','https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=1200&q=90'];
function openLightbox(idx){const lb=document.getElementById('lightbox');document.getElementById('lightboxImg').src=galleryImgs[idx];lb.style.display='flex';}

// EDIT MODAL
const modalContents={
  profile:`<div class="field-group"><label class="field-label">Display Name</label><input type="text" class="field-input" value="Chanda Mwewa"/></div><div class="field-group"><label class="field-label">Category</label><select class="field-input"><option selected>Photography</option><option>Film & Video</option><option>Music</option></select></div><div class="field-group"><label class="field-label">City</label><select class="field-input"><option selected>Lusaka</option><option>Ndola</option><option>Kitwe</option></select></div><div class="field-group"><label class="field-label">Starting Rate (K)</label><input type="number" class="field-input" value="800"/></div><div class="field-group"><label class="field-label">Bio</label><textarea class="field-input" rows="4" style="resize:vertical;">Chanda Mwewa is a Lusaka-based commercial photographer...</textarea></div><div class="field-group"><label class="field-label">Skills (comma-separated)</label><input type="text" class="field-input" value="Commercial Photography, Events, Portraits, Weddings"/></div><div class="field-group"><label class="field-label">Portfolio URL</label><input type="url" class="field-input" placeholder="https://yourwebsite.com"/></div>`,
  gallery:`<div style="text-align:center;padding:1.5rem;"><div style="width:80px;height:80px;border-radius:20px;background:var(--purple-pale);margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;"><svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='var(--purple)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg></div><div style="font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;">Upload Media</div><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.2rem;">Add photos or videos to your portfolio gallery</p><input type="file" id="mediaUpload" accept="image/*,video/*" multiple style="display:none;" onchange="handleMediaUpload(this)"/><button onclick="document.getElementById('mediaUpload').click()" style="background:var(--purple);color:#fff;border:none;padding:0.7rem 2rem;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Choose Files</button><p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.8rem;">Supported: JPG, PNG, MP4 · Max 10MB per file</p></div>`,
  cover:`<div style="text-align:center;padding:1.5rem;"><div style="font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;margin-bottom:0.4rem;">Change Cover Photo</div><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.2rem;">Recommended size: 1400 × 320px</p><input type="file" id="coverFile" accept="image/*" style="display:none;" onchange="handleCoverUpload(this)"/><button onclick="document.getElementById('coverFile').click()" style="background:var(--purple);color:#fff;border:none;padding:0.7rem 2rem;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Upload Cover</button></div>`
};
function openEditModal(type){
  document.getElementById('modalTitle').textContent=type==='profile'?'Edit Profile':type==='gallery'?'Add Media':'Change Cover';
  document.getElementById('modalBody').innerHTML=modalContents[type]||'';
  document.getElementById('editModal').classList.add('open');
  lucide.createIcons();
}
function closeEditModal(){document.getElementById('editModal').classList.remove('open');}
function saveProfile(){showToast('Profile updated successfully!');closeEditModal();}
function handleMediaUpload(input){if(input.files.length>0)showToast(`${input.files.length} file(s) uploaded successfully!`);}
function handleCoverUpload(input){if(input.files&&input.files[0]){const r=new FileReader();r.onload=e=>{document.querySelector('.profile-cover img').src=e.target.result;showToast('Cover updated!');closeEditModal();};r.readAsDataURL(input.files[0]);}}

function shareProfile(){if(navigator.share){navigator.share({title:'Chanda Mwewa on Plum',url:window.location.href});}else{navigator.clipboard.writeText(window.location.href).then(()=>showToast('Profile link copied!'));}}

// TOAST
function showToast(msg){const t=document.createElement('div');t.style.cssText='position:fixed;bottom:2rem;right:2rem;background:var(--navy2);color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-size:0.875rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);transform:translateY(20px);opacity:0;transition:all 0.3s;';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{t.style.transform='none';t.style.opacity='1';},10);setTimeout(()=>{t.style.transform='translateY(20px)';t.style.opacity='0';setTimeout(()=>t.remove(),300);},3000);}
