lucide.createIcons();
const cur=document.getElementById('cursor');
if(cur){
  document.addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
  document.querySelectorAll('a,button,.role-opt,.plan-card,.auth-tab').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur.classList.add('hov'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('hov'));
  });
}

let selectedRole='artist';
let currentStep=1;
const tags=[];

function switchTab(t){
  document.querySelectorAll('.auth-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+t).classList.add('active');
  document.querySelectorAll('.auth-view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+t).classList.add('active');
  lucide.createIcons();
}

function selectRole(role,el){
  selectedRole=role;
  document.querySelectorAll('.role-opt').forEach(o=>o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('artistFields').style.display=role==='artist'?'block':'none';
  document.getElementById('organizerFields').style.display=role==='organizer'?'block':'none';
  document.getElementById('artistRateFields').style.display=role==='artist'?'block':'none';
  document.getElementById('nameFieldLabel').textContent=role==='artist'?'Stage Name / Display Name':'Full Name';
  lucide.createIcons();
}

function goStep(n){
  document.getElementById('reg-step-'+currentStep).style.display='none';
  currentStep=n;
  document.getElementById('reg-step-'+n).style.display='block';
  ['sd1','sd2','sd3','sd4'].forEach((id,i)=>{
    const d=document.getElementById(id);
    d.classList.remove('active','done');
    if(i+1<n)d.classList.add('done');
    else if(i+1===n)d.classList.add('active');
  });
  lucide.createIcons();
}

function togglePw(id,btn){
  const inp=document.getElementById(id);
  const show=inp.type==='password';
  inp.type=show?'text':'password';
  btn.innerHTML=show?'<i data-lucide="eye-off"></i>':'<i data-lucide="eye"></i>';
  lucide.createIcons();
}

function previewAvatar(input){
  if(input.files&&input.files[0]){
    const reader=new FileReader();
    reader.onload=e=>{
      const prev=document.getElementById('avatarPreview');
      prev.src=e.target.result;
      prev.style.display='block';
      prev.previousElementSibling.style.display='none';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function addTag(e){
  if(e.key==='Enter'){
    e.preventDefault();
    const val=e.target.value.trim();
    if(val&&tags.length<10){
      tags.push(val);
      const chip=document.createElement('div');
      chip.className='tag-chip';
      chip.innerHTML=`${val}<button type="button" onclick="removeTag(this,'${val}')">×</button>`;
      e.target.parentElement.insertBefore(chip,e.target);
      e.target.value='';
    }
  }
}
function removeTag(btn,val){const idx=tags.indexOf(val);if(idx>-1)tags.splice(idx,1);btn.parentElement.remove();}

function selectPlan(el){document.querySelectorAll('.plan-card').forEach(c=>c.classList.remove('active'));el.classList.add('active');}

function handleSignin(){
  window.location.href='adash.php';
}

function completeRegistration(){
  window.location.href=selectedRole==='artist'?'adash.php':'organizer-dashboard.html';
}

// URL params
const params=new URLSearchParams(location.search);
if(params.get('mode')==='register'||params.get('mode')==='join')switchTab('register');
if(params.get('mode')==='admin')switchTab('admin');
if(params.get('role')==='organizer'){selectRole('organizer',document.querySelectorAll('.role-opt')[1]);lucide.createIcons();}
