// Scale Explorer tab: pickers, note bubbles, and playback.
import {S,saveS,$} from './state.js';
import {onAction} from './actions.js';
import {dispNote,noteOctave} from './notes.js';
import * as D from './scales-data.js';
import * as A from './audio.js';
import {playSequence,stopPlayback,isPlaying} from './playback.js';

const level=()=>S.scLevel,type=()=>S.scType,key=()=>S.scKey,bpm=()=>S.scBpm;
export const prettyKey=k=>k.replace('#','♯').replace(/b$/,'♭');

// Current scale: sequence up and down, and the bubbles to show
export function currentScale(){
  const data=D.getScaleData(level(),type(),key());
  const seq=[...data.asc,...data.desc.slice(1)],ascLen=data.asc.length;
  const bubbleNotes=type()==='melodic'?seq:data.asc;
  const mapIndex=type()==='melodic'?(i=>i):(i=>i<ascLen?i:Math.max(0,2*ascLen-2-i));
  const octCount=level()==='intermediate'?'1 octave':level()==='beginner'?'2 octaves':'3 octaves';
  const title=`${type()==='chromatic'?'':prettyKey(key())+' '}${D.TYPE_LABELS[type()]} — ${octCount}`;
  return{seq,ascLen,bubbleNotes,mapIndex,title,level:level(),type:type(),key:key()};
}
export function bubblesHTML(notes,ascLen,{action='playNb',size}={}){
  const sz=size||(notes.length>24?32:notes.length>16?36:notes.length>10?42:46);
  return notes.map((note,i)=>{
    const deg=i<ascLen?i:(2*ascLen-2-i);
    const col=D.NB_COLS[((deg%7)+7)%7];
    const isRoot=i===0||i===ascLen-1||i===notes.length-1;
    const brd=isRoot?`border:3px solid ${col.c};`:'';
    return`<div class="nb" style="width:${sz}px;height:${sz}px;background:${col.bg};color:${col.c};${brd}" data-action="${action}" data-note="${note}" data-i="${i}"><div class="nb-name" style="font-size:${sz>40?0.78:0.62}rem">${dispNote(note)}</div><div class="nb-oct">${noteOctave(note)}</div></div>`;
  }).join('');
}

// ─── Renderers ──────────────────────────────────────────
function renderLevel(){
  document.querySelectorAll('.level-btn').forEach(el=>el.classList.toggle('active',el.dataset.level===level()));
  $('level-desc').textContent=D.LEVEL_DESC[level()];
}
function renderTypeToggle(){
  $('type-toggle').innerHTML=D.LEVEL_TYPES[level()].map(t=>
    `<button class="type-btn${t.id===type()?' active':''}" data-type="${t.id}" data-action="setScaleType">${t.label}</button>`).join('');
}
function renderScaleKeys(){
  if(type()==='chromatic'){$('scale-keys').innerHTML='<div class="sk-note">🌈 The chromatic scale uses every note — no key needed!</div>';return;}
  $('scale-keys').innerHTML=D.getAvailableKeys(level(),type()).map(k=>
    `<button class="sk-btn${k===key()?' active':''}" data-key="${k}" data-action="pickScaleKey">${prettyKey(k)}</button>`).join('');
}
function renderBpmGrid(){
  $('bpm-grid').innerHTML=D.BPM_OPTIONS.map(b=>`<button class="bpm-btn${b===bpm()?' active':''}" data-bpm="${b}" data-action="setBpm">${b}</button>`).join('');
}
function renderScaleNotes(){
  const sc=currentScale();
  $('scale-notes').innerHTML=bubblesHTML(sc.bubbleNotes,sc.ascLen);
  $('scale-title').textContent=sc.title;
  const ml=$('minor-label');
  if(type()==='melodic'){ml.textContent='⬆ Melodic minor ascending · ⬇ Natural minor descending (exam style)';ml.classList.remove('hidden');}
  else if(type()==='harmonic'){ml.textContent='⬆⬇ Harmonic minor — same notes ascending and descending';ml.classList.remove('hidden');}
  else ml.classList.add('hidden');
}
function renderAllScales(){renderLevel();renderTypeToggle();renderScaleKeys();renderBpmGrid();renderScaleNotes();}
export function ensureValidSelection(){
  if(!D.LEVEL_TYPES[level()].find(t=>t.id===type()))S.scType=D.LEVEL_TYPES[level()][0].id;
  const keys=D.getAvailableKeys(level(),type());
  if(keys.length&&!keys.includes(key()))S.scKey=keys[0];
}
const listeners=new Set();
export function onScaleChange(fn){listeners.add(fn);}
function changed(){saveS();stopScale();renderAllScales();listeners.forEach(fn=>fn());}
function setLevel(lvl){S.scLevel=lvl;ensureValidSelection();changed();}
function setScaleType(t){S.scType=t;ensureValidSelection();changed();}
function pickScaleKey(k){S.scKey=k;changed();}
function setBpm(b){S.scBpm=b;saveS();renderBpmGrid();listeners.forEach(fn=>fn());}

// ─── Playback ───────────────────────────────────────────
export async function ensureAudio(){
  try{await A.initAudio();return true;}
  catch(e){alert('The violin sounds could not load. Check your connection once, then try again.');console.warn(e);return false;}
}
export async function playNb(noteStr,el){
  if(!await ensureAudio())return;
  try{A.playNote(noteStr,1.2);}catch(e){console.warn(e);}
  if(el){el.classList.add('playing');setTimeout(()=>el.classList.remove('playing'),600);}
}
async function playScale(){
  if(isPlaying())return;
  if(!await ensureAudio())return;
  const sc=currentScale();
  $('play-btn').classList.add('hidden');$('stop-btn').classList.remove('hidden');
  const cdEl=$('sc-countdown'),cdNum=$('cd-num');cdEl.classList.add('show');
  await playSequence({
    seq:sc.seq,bpm:bpm(),metro:$('metro-cb').checked,mapIndex:sc.mapIndex,accentAt:[sc.ascLen-1],
    bubbles:[...document.querySelectorAll('#scale-notes .nb')],
    onCount:n=>{if(n>0){cdNum.textContent=n;cdNum.style.animation='none';void cdNum.offsetWidth;cdNum.style.animation='cdpop 0.9s ease';}else cdEl.classList.remove('show');},
    onEnd:()=>stopScale()
  });
}
export function stopScale(){
  stopPlayback();
  $('play-btn')?.classList.remove('hidden');$('stop-btn')?.classList.add('hidden');
  $('sc-countdown')?.classList.remove('show');
}

export function initScales(){
  ensureValidSelection();
  renderAllScales();
  onAction({
    setLevel:d=>setLevel(d.level),
    setScaleType:d=>setScaleType(d.type),
    pickScaleKey:d=>pickScaleKey(d.key),
    setBpm:d=>setBpm(parseInt(d.bpm,10)),
    playNb:(d,el)=>playNb(d.note,el),
    playScale:()=>playScale(),
    stopScale:()=>stopScale()
  });
}
