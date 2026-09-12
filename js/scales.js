// Scale Explorer tab: pickers, note bubbles, and clock-accurate playback.
import {S,saveS,$} from './state.js';
import {onAction} from './actions.js';
import {normNote,dispNote,noteOctave} from './notes.js';
import * as D from './scales-data.js';
import * as A from './audio.js';

let scPlaying=false,scStop=false,scSynth=null,clickSynth=null;
const COUNT_IN=4;

const level=()=>S.scLevel,type=()=>S.scType,key=()=>S.scKey,bpm=()=>S.scBpm;

// ─── Renderers ──────────────────────────────────────────
function renderLevel(){
  document.querySelectorAll('.level-btn').forEach(el=>el.classList.toggle('active',el.dataset.level===level()));
  $('level-desc').textContent=D.LEVEL_DESC[level()];
}
function renderTypeToggle(){
  $('type-toggle').innerHTML=D.LEVEL_TYPES[level()].map(t=>
    `<button class="type-btn${t.id===type()?' active':''}" data-type="${t.id}" data-action="setScaleType">${t.label}</button>`
  ).join('');
}
function renderScaleKeys(){
  if(type()==='chromatic'){
    $('scale-keys').innerHTML='<div class="sk-note">🌈 The chromatic scale uses every note — no key needed!</div>';
    return;
  }
  $('scale-keys').innerHTML=D.getAvailableKeys(level(),type()).map(k=>
    `<button class="sk-btn${k===key()?' active':''}" data-key="${k}" data-action="pickScaleKey">${k.replace('#','♯').replace(/b$/,'♭')}</button>`
  ).join('');
}
function renderBpmGrid(){
  $('bpm-grid').innerHTML=D.BPM_OPTIONS.map(b=>
    `<button class="bpm-btn${b===bpm()?' active':''}" data-bpm="${b}" data-action="setBpm">${b}</button>`
  ).join('');
}
function renderScaleNotes(){
  const data=D.getScaleData(level(),type(),key());
  const ascLen=data.asc.length;
  // Melodic minor descends on different notes, so show both directions
  const notes=type()==='melodic'?[...data.asc,...data.desc.slice(1)]:data.asc;
  const sz=notes.length>24?32:notes.length>16?36:notes.length>10?42:46;
  $('scale-notes').innerHTML=notes.map((note,i)=>{
    const deg=i<ascLen?i:(2*ascLen-2-i);
    const col=D.NB_COLS[((deg%7)+7)%7];
    const isRoot=i===0||i===ascLen-1||i===notes.length-1;
    const brd=isRoot?`border:3px solid ${col.c};`:'';
    return`<div class="nb" id="nb${i}" style="width:${sz}px;height:${sz}px;background:${col.bg};color:${col.c};${brd}" data-action="playNb" data-note="${note}" data-i="${i}"><div class="nb-name" style="font-size:${sz>40?0.78:0.62}rem">${dispNote(note)}</div><div class="nb-oct">${noteOctave(note)}</div></div>`;
  }).join('');

  const octCount=level()==='advanced'&&(!D.isChromaticOrArp(type())||type()==='chromatic')?'3 octaves':
                 level()==='intermediate'?'1 octave':level()==='beginner'?'2 octaves (exam form)':'3 octaves';
  const keyLabel=type()==='chromatic'?'':`${key().replace('#','♯').replace(/b$/,'♭')} `;
  $('scale-title').textContent=`${keyLabel}${D.TYPE_LABELS[type()]} — ${octCount}`;

  const ml=$('minor-label');
  if(type()==='melodic'){ml.textContent='⬆ Melodic minor ascending · ⬇ Natural minor descending (exam style)';ml.classList.remove('hidden');}
  else if(type()==='harmonic'){ml.textContent='⬆⬇ Harmonic minor — same notes ascending and descending';ml.classList.remove('hidden');}
  else ml.classList.add('hidden');
}
function renderAllScales(){renderLevel();renderTypeToggle();renderScaleKeys();renderBpmGrid();renderScaleNotes();}

// ─── Setters ────────────────────────────────────────────
function ensureValidSelection(){
  if(!D.LEVEL_TYPES[level()].find(t=>t.id===type()))S.scType=D.LEVEL_TYPES[level()][0].id;
  const keys=D.getAvailableKeys(level(),type());
  if(keys.length&&!keys.includes(key()))S.scKey=keys[0];
}
function setLevel(lvl){S.scLevel=lvl;ensureValidSelection();saveS();stopScale();renderAllScales();}
function setScaleType(t){S.scType=t;ensureValidSelection();saveS();stopScale();renderAllScales();}
function pickScaleKey(k){S.scKey=k;saveS();stopScale();renderScaleKeys();renderScaleNotes();}
function setBpm(b){S.scBpm=b;saveS();renderBpmGrid();}

// ─── Playback ───────────────────────────────────────────
async function ensureAudio(){
  try{await A.initAudio();return true;}
  catch(e){alert('The sound engine did not load. Please reload the app.');console.warn(e);return false;}
}
async function playNb(noteStr,i){
  if(!await ensureAudio())return;
  try{A.playTapNote(normNote(noteStr));}catch(e){console.warn(e);}
  const el=$('nb'+i);if(el){el.classList.add('playing');setTimeout(()=>el.classList.remove('playing'),500);}
}
// Drive UI steps from the audio clock so highlights stay locked to the sound.
function runClock(t0,count,beat,onStep){
  return new Promise(res=>{
    let last=-1;
    (function tick(){
      if(scStop)return res();
      const idx=Math.floor((A.now()-t0)/beat+0.002);
      if(idx>=count)return res();
      if(idx!==last&&idx>=0){last=idx;onStep(idx);}
      requestAnimationFrame(tick);
    })();
  });
}
export async function playScale(){
  if(scPlaying)return;
  if(!await ensureAudio())return;
  scPlaying=true;scStop=false;
  const metro=$('metro-cb').checked;
  $('play-btn').classList.add('hidden');$('stop-btn').classList.remove('hidden');
  const cdEl=$('sc-countdown'),cdNum=$('cd-num');
  cdEl.classList.add('show');

  const beat=60/bpm();
  const data=D.getScaleData(level(),type(),key());
  const seq=[...data.asc,...data.desc.slice(1)];
  const ascLen=data.asc.length;
  const bubbles=document.querySelectorAll('.nb');
  const showsDesc=bubbles.length===seq.length;

  // Count-in at tempo, then the scale: all scheduled on the audio clock up
  // front so timing never drifts with JS timers.
  scSynth=A.makeViolinSynth();
  clickSynth=A.makeClick();
  const click=(t,accent)=>{if(metro)clickSynth.triggerAttackRelease(accent?'G5':'C5','32n',t);};
  const t0=A.now()+0.1,t1=t0+COUNT_IN*beat;
  const noteDur=Math.max(0.12,beat*0.92);
  for(let c=0;c<COUNT_IN;c++)click(t0+c*beat,c===0);
  seq.forEach((note,i)=>{
    const t=t1+i*beat,nn=normNote(note);
    click(t,i===0||i===ascLen-1);
    A.trackFilter(nn,t);
    try{scSynth.triggerAttackRelease(nn,noteDur,t);}catch(e){console.warn('Note error:',note,e);}
  });

  await runClock(t0,COUNT_IN,beat,idx=>{
    cdNum.textContent=COUNT_IN-idx;
    cdNum.style.animation='none';void cdNum.offsetWidth;cdNum.style.animation='cdpop 0.9s ease';
  });
  cdEl.classList.remove('show');
  if(scStop){stopScale();return;}

  // +1 beat so the final note's release is not cut off
  await runClock(t1,seq.length+1,beat,i=>{
    let hl=-1;
    if(i<seq.length)hl=showsDesc||i<ascLen?i:Math.max(0,2*ascLen-2-i);
    bubbles.forEach((el,j)=>el.classList.toggle('playing',j===hl));
  });
  stopScale();
}
export function stopScale(){
  scStop=true;scPlaying=false;
  scSynth?.dispose();scSynth=null;
  clickSynth?.dispose();clickSynth=null;
  A.cancelFilterAutomation();
  document.querySelectorAll('.nb').forEach(el=>el.classList.remove('playing'));
  $('play-btn')?.classList.remove('hidden');$('stop-btn')?.classList.add('hidden');
  $('sc-countdown')?.classList.remove('show');
}
export function isPlaying(){return scPlaying;}

export function initScales(){
  ensureValidSelection();
  renderAllScales();
  onAction({
    setLevel:d=>setLevel(d.level),
    setScaleType:d=>setScaleType(d.type),
    pickScaleKey:d=>pickScaleKey(d.key),
    setBpm:d=>setBpm(parseInt(d.bpm,10)),
    playNb:d=>playNb(d.note,parseInt(d.i,10)),
    playScale:()=>playScale(),
    stopScale:()=>stopScale()
  });
}
