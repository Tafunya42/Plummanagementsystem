/* ── CURSOR ── */
const cd=document.getElementById('cd'),cr=document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function animC(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;cd.style.cssText=`left:${mx}px;top:${my}px`;cr.style.cssText=`left:${rx}px;top:${ry}px`;requestAnimationFrame(animC)})();
document.querySelectorAll('a,button,.cc,.ac,.hst,.hiw-card,.tc,.step,.hcard,.hcardsm').forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'))});

/* ── NAV ── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>80),{passive:true});

/* ── HERO SPOTLIGHT ── */
const spot=document.getElementById('hspot'),heroEl=document.querySelector('.hero');
heroEl&&document.addEventListener('mousemove',e=>{const r=heroEl.getBoundingClientRect();if(e.clientY<r.bottom){spot.style.setProperty('--sx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');spot.style.setProperty('--sy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')}});

/* ── HERO CARD PARALLAX ── */
const hcm=document.getElementById('hcm'),hcs=document.getElementById('hcs');
document.addEventListener('mousemove',e=>{const px=(e.clientX/window.innerWidth-.5),py=(e.clientY/window.innerHeight-.5);hcm&&(hcm.style.transform=`translateY(0) translate(${px*12}px,${py*8}px)`);hcs&&(hcs.style.transform=`translate(${-px*9}px,${py*6}px)`)});

/* ── WORD CYCLE ── */
const words=['Live Musicians','Talented DJs','Amazing MCs','Photographers','Comedians','Live Dancers','Creative Artists'];
let wi=0;
const wcT=document.getElementById('wcText');
function cycleWord(){wi=(wi+1)%words.length;wcT.style.opacity='0';wcT.style.transform='translateY(12px)';setTimeout(()=>{wcT.textContent=words[wi];wcT.style.opacity='1';wcT.style.transform='translateY(0)'},330)}
setInterval(cycleWord,2500);

/* ── STAT COUNTERS (hero) ── */
function animCnt(el,end,dur,suffix){let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);const ease=1-Math.pow(1-p,3);el.textContent=Math.round(ease*end);if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
setTimeout(()=>{animCnt(document.getElementById('c1'),8300,2000);animCnt(document.getElementById('c2'),42,1800)},500);

/* ── STAT COUNTER ON SCROLL ── */
const sObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,t=+el.dataset.target;if(!t)return;const ac=el.querySelector('.ac');let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/1600,1);const ease=1-Math.pow(1-p,3);ac.textContent=Math.round(ease*t).toLocaleString();if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);sObs.unobserve(el)})},{threshold:.5});
document.querySelectorAll('.scnum[data-target]').forEach(el=>sObs.observe(el));

/* ── TICKER DUPLICATE ── */
const tt=document.getElementById('tt');
tt&&(tt.innerHTML+=tt.innerHTML);

/* ── CATEGORY SPOTLIGHT ── */
document.querySelectorAll('.cc').forEach(cc=>{cc.addEventListener('mousemove',e=>{const r=cc.getBoundingClientRect();cc.querySelector('.cc-spot').style.setProperty('--cx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');cc.querySelector('.cc-spot').style.setProperty('--cy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')})});

/* ── REVEAL ── */
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.rvl,.rvr').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0)el.classList.add('on');else obs.observe(el)});

/* ── CAROUSEL ── */
const track=document.getElementById('atrack');
let pos=0;
document.getElementById('scrollLeft').addEventListener('click',()=>{pos=Math.max(pos-273,0);track.style.transform=`translateX(-${pos}px)`});
document.getElementById('scrollRight').addEventListener('click',()=>{const max=(track.children.length-3)*273;pos=Math.min(pos+273,max);track.style.transform=`translateX(-${pos}px)`});

/* ── ARTIST CARD DIM-SIBLINGS ── */
const atw=document.querySelector('.atrack');
if(atw){atw.addEventListener('mouseenter',e=>{const card=e.target.closest('.ac');if(card)atw.querySelectorAll('.ac').forEach(c=>{c.style.transition='opacity .3s,transform .4s';if(c!==card){c.style.opacity='.48';c.style.transform='scale(.97)'}})},true);atw.addEventListener('mouseleave',()=>atw.querySelectorAll('.ac').forEach(c=>{c.style.opacity='';c.style.transform=''}))}

/* ── STEP HOVER ── */
document.querySelectorAll('.step').forEach(s=>{s.addEventListener('mouseenter',()=>{const n=s.querySelector('.sn');n.style.transition='opacity .3s';n.style.opacity='1'});s.addEventListener('mouseleave',()=>s.querySelector('.sn').style.opacity='.22')});

/* ── CURRENCY ── */
const RATE=27.5;let mode=localStorage.getItem('plum_currency')||'ZMW';
function fmt(n){return mode==='ZMW'?'K\u00A0'+Math.round(n*RATE).toLocaleString():'$'+Number(n).toLocaleString()}
function renderPrices(){document.querySelectorAll('.price-val').forEach(el=>{el.innerHTML=fmt(el.dataset.usd)+' <small>/ event</small>'})}
function setCurr(m){mode=m;localStorage.setItem('plum_currency',m);document.getElementById('btnUSD').classList.toggle('act',m==='USD');document.getElementById('btnZMW').classList.toggle('act',m==='ZMW');renderPrices()}
document.getElementById('btnUSD').classList.toggle('act',mode==='USD');document.getElementById('btnZMW').classList.toggle('act',mode==='ZMW');renderPrices();

/* ── SEARCH ── */
document.getElementById('hsb').addEventListener('click',()=>{const q=document.getElementById('hsi').value.trim();if(q)location.href=`browse.html?q=${encodeURIComponent(q)}`});
document.getElementById('hsi').addEventListener('keypress',e=>{if(e.key==='Enter'){const q=e.target.value.trim();if(q)location.href=`browse.html?q=${encodeURIComponent(q)}`}});

/* ── FLOATING PARTICLES ── */
const cols=['rgba(139,46,200,','rgba(170,220,0,','rgba(245,166,35,'];
for(let i=0;i<38;i++){const d=document.createElement('div');const op=(Math.random()*.42+.08).toFixed(2),sz=(Math.random()*2.5+.7).toFixed(1);d.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${cols[i%3]}${op});left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;pointer-events:none;z-index:1;animation:pd${i%4} ${(Math.random()*11+7).toFixed(1)}s ease-in-out infinite ${(Math.random()*9).toFixed(1)}s`;heroEl&&heroEl.appendChild(d)}
const ps=document.createElement('style');
ps.textContent='@keyframes pd0{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,-20px) scale(2.2);opacity:.95}}@keyframes pd1{0%,100%{transform:translate(0,0)}50%{transform:translate(-17px,24px) scale(.4);opacity:.12}}@keyframes pd2{0%,100%{transform:translate(0,0)}33%{transform:translate(15px,11px)}66%{transform:translate(-11px,-15px)}}@keyframes pd3{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(11px,-22px) rotate(180deg);opacity:.85}}';
document.head.appendChild(ps);

/* ── AURORA SCROLL PARALLAX ── */
window.addEventListener('scroll',()=>{const y=scrollY;document.querySelectorAll('.ab').forEach((b,i)=>{b.style.transform=`translateY(${y*(.05+i*.015)}px)`})},{passive:true});

/* ── HITEST HIW CARD GLOW ON HOVER ── */
document.querySelectorAll('.hiw-card').forEach(c=>{c.addEventListener('mouseenter',()=>c.style.setProperty('--hgl','1'));c.addEventListener('mouseleave',()=>c.style.removeProperty('--hgl'))});
