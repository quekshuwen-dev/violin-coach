// App bootstrap: state, setup screen, profiles, settings, tabs, PWA wiring.
import {S,loadS,saveS,clearS,AVATARS,esc,$} from './state.js';
import {installDelegation,onAction} from './actions.js';
import {renderProfiles,renderCalendar,initCalendar,toast} from './ui.js';
import {initScales,stopScale} from './scales.js';
import {initTuner,stopTuner,renderStrings} from './tuner.js';
import {initPractice,setModeHooks} from './practice.js';
import {initScaleCheck,stopScaleCheck} from './scalecheck.js';

// ─── Setup screen ───────────────────────────────────────
let setupAv=[];
function cycleAvatar(i){setupAv[i]=AVATARS[(AVATARS.indexOf(setupAv[i])+1)%AVATARS.length];$('sav'+i).textContent=setupAv[i];}
function saveSetup(){
  for(let i=0;i<3;i++){
    S.profiles[i].name=$('sname'+i).value.trim()||'Player '+(i+1);
    S.profiles[i].avatar=setupAv[i];
  }
  S.setupAvatars=[...setupAv];S.setupDone=true;saveS();
  $('setup-screen').classList.add('hidden');
  renderAll();
}

// ─── Profiles ───────────────────────────────────────────
function selectProfile(i){S.cur=i;saveS();renderProfiles();renderCalendar();}

// ─── Settings ───────────────────────────────────────────
const A4_PRESETS=[440,441,442,443];
function openSettings(){
  $('gem-key-in').value=S.gemKey||'';
  $('a4-in').value=S.a4;
  renderA4Presets(S.a4);
  $('profile-settings').innerHTML=S.profiles.map((p,i)=>`
    <div class="profile-edit-item">
      <p class="field-label" style="margin-bottom:8px">Player ${i+1}</p>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:1.8rem" id="sav_prev_${i}">${esc(p.avatar)}</span>
        <input type="text" class="text-in" id="sname_${i}" value="${esc(p.name)}" style="flex:1">
      </div>
      <p class="field-label">Avatar</p>
      <div class="avatar-row">
        ${AVATARS.map(av=>`<div class="av-opt ${p.avatar===av?'sel':''}" data-p="${i}" data-av="${av}" data-action="pickAv">${av}</div>`).join('')}
      </div>
    </div>`).join('');
  $('settings-modal').classList.add('open');
}
function renderA4Presets(v){
  $('a4-presets').innerHTML=A4_PRESETS.map(p=>`<button class="a4-preset${Number(v)===p?' active':''}" data-action="setA4Preset" data-hz="${p}">${p}</button>`).join('');
}
function pickAv(pi,av){
  S.profiles[pi].avatar=av;
  $('sav_prev_'+pi).textContent=av;
  document.querySelectorAll(`.av-opt[data-p="${pi}"]`).forEach(el=>el.classList.toggle('sel',el.dataset.av===av));
}
function saveSettings(){
  S.gemKey=$('gem-key-in').value.trim();
  const a4=parseFloat($('a4-in').value);
  if(a4>=400&&a4<=480)S.a4=Math.round(a4*10)/10;
  for(let i=0;i<3;i++){const el=$('sname_'+i);if(el)S.profiles[i].name=el.value.trim()||S.profiles[i].name;}
  saveS();renderProfiles();renderStrings();closeSettings();
}
function closeSettings(){$('settings-modal').classList.remove('open');}
function resetAll(){if(confirm('Reset ALL data including all stars and profiles?')){clearS();location.reload();}}

// ─── Tabs ───────────────────────────────────────────────
const TABS=['practice','tuner','scales'];
function switchTab(t){
  if(!TABS.includes(t))t='practice';
  S.tab=t;saveS();
  document.querySelectorAll('.tab-pane').forEach(el=>el.classList.toggle('active',el.id===t+'-tab'));
  document.querySelectorAll('.nav-btn').forEach(el=>el.classList.toggle('active',el.dataset.tab===t));
  if(t!=='tuner')stopTuner();
  if(t!=='scales')stopScale();
  if(t!=='practice')stopScaleCheck();
  window.scrollTo({top:0});
}

// ─── PWA: service worker + install prompt ───────────────
let deferredInstall=null,updateRequested=false;
function setupPWA(){
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('install-btn').classList.remove('hidden');});
  window.addEventListener('appinstalled',()=>{deferredInstall=null;$('install-btn').classList.add('hidden');});
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{
      const nw=reg.installing;
      nw?.addEventListener('statechange',()=>{
        if(nw.state==='installed'&&navigator.serviceWorker.controller)
          toast('A new version is ready.',{action:'Update',onAction:()=>{updateRequested=true;nw.postMessage({type:'SKIP_WAITING'});}});
      });
    });
  }).catch(e=>console.warn('SW registration failed',e));
  // Reload only for a user-requested update, never when the worker first claims the page
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!updateRequested||refreshing)return;refreshing=true;location.reload();});
}
async function promptInstall(){
  if(!deferredInstall)return;
  deferredInstall.prompt();await deferredInstall.userChoice;
  deferredInstall=null;$('install-btn').classList.add('hidden');
}

// ─── Boot ───────────────────────────────────────────────
function renderAll(){renderProfiles();renderCalendar();renderStrings();switchTab(S.tab||'practice');}
function boot(){
  loadS();
  installDelegation();
  onAction({
    cycleAvatar:d=>cycleAvatar(parseInt(d.i,10)),
    saveSetup:()=>saveSetup(),
    selectProfile:d=>selectProfile(parseInt(d.i,10)),
    openSettings:()=>openSettings(),
    closeSettings:()=>closeSettings(),
    saveSettings:()=>saveSettings(),
    resetAll:()=>resetAll(),
    pickAv:d=>pickAv(parseInt(d.p,10),d.av),
    setA4Preset:d=>{$('a4-in').value=d.hz;renderA4Presets(d.hz);},
    switchTab:d=>switchTab(d.tab),
    promptInstall:()=>promptInstall()
  });
  initCalendar();initScales();initTuner();initPractice();initScaleCheck();
  setModeHooks({leaveCheck:stopScaleCheck});
  setupPWA();
  if(!S.setupDone){
    setupAv=[...S.setupAvatars];
    setupAv.forEach((av,i)=>{$('sav'+i).textContent=av;});
    $('setup-screen').classList.remove('hidden');
  }else{
    $('setup-screen').classList.add('hidden');
    renderAll();
  }
}
boot();
