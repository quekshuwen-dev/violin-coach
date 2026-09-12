// Violin tuner. Raw (unprocessed) microphone input → 70 Hz high-pass →
// 8192-sample analysis window → McLeod pitch detection → median + light
// smoothing → needle. Reference pitch (A4) and pure-fifths open-string
// targets come from settings.
import {S,saveS,$} from './state.js';
import {onAction,onChange} from './actions.js';
import {freqToNote,stringTargets,centsBetween,midiToFreq} from './notes.js';
import {detectPitch} from './pitch.js';

const FFT_SIZE=8192;          // ~170 ms at 48 kHz: resolves G3 well below 1 cent
const MIN_CLARITY=0.86;       // reject bow noise / room noise
const HOLD_MS=1200;           // keep the last reading this long after sound stops
const IN_TUNE=4,CLOSE=12;     // cents thresholds

let active=false,starting=false,stream=null,ac=null,analyser=null,raf=null,buf=null;
let hist=[],lastGoodAt=0,smoothCents=null,refCtx=null;

// ─── Open-string targets ────────────────────────────────
function targets(){return stringTargets(S.a4,S.pureFifths);}
export function renderStrings(){
  const grid=$('string-grid');if(!grid)return;
  grid.innerHTML=targets().map(s=>
    `<div class="str-pill" id="str-${s.name}" data-action="playRef" data-string="${s.name}" title="Tap to hear ${s.name}"><div>${s.name}</div><div class="str-hz">${s.freq.toFixed(1)} Hz</div></div>`
  ).join('');
  const chip=$('tun-a4');if(chip)chip.textContent=`A = ${S.a4} Hz`;
  const cb=$('pure-cb');if(cb)cb.checked=!!S.pureFifths;
}
// Target frequency for a detected note: pure-fifth string if enabled, else equal temperament
function targetFor(note){
  if(S.pureFifths){const s=targets().find(s=>s.midi===note.midi);if(s)return s.freq;}
  return midiToFreq(note.midi,S.a4);
}

// ─── Reference tone (tap a string pill) ─────────────────
function playRef(name){
  const s=targets().find(s=>s.name===name);if(!s)return;
  if(!refCtx)refCtx=new (window.AudioContext||window.webkitAudioContext)();
  refCtx.resume();
  const t=refCtx.currentTime,osc=refCtx.createOscillator(),g=refCtx.createGain();
  osc.type='triangle';osc.frequency.value=s.freq;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.25,t+0.03);
  g.gain.setValueAtTime(0.25,t+1.6);g.gain.linearRampToValueAtTime(0,t+2);
  osc.connect(g).connect(refCtx.destination);osc.start(t);osc.stop(t+2.05);
  const el=$('str-'+name);if(el){el.classList.add('hl');setTimeout(()=>{if(!active)el.classList.remove('hl');},2000);}
}

// ─── Mic pipeline ───────────────────────────────────────
export async function startTuner(){
  if(active||starting)return;
  starting=true;
  try{
    // Turn off the browser's voice processing: it distorts harmonics and pitch
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:1}});
  }catch(e){starting=false;alert('Please allow microphone access to use the tuner.');return;}
  ac=new (window.AudioContext||window.webkitAudioContext)();
  await ac.resume();
  const src=ac.createMediaStreamSource(stream);
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=70;hp.Q.value=0.7;
  analyser=ac.createAnalyser();analyser.fftSize=FFT_SIZE;analyser.smoothingTimeConstant=0;
  src.connect(hp).connect(analyser);
  buf=new Float32Array(analyser.fftSize);
  hist=[];lastGoodAt=0;smoothCents=null;active=true;starting=false;
  const b=$('tun-btn');b.textContent='⏹ Stop Tuner';b.className='btn btn-red btn-lg';
  setStatus('🎧 Listening... play a string','white');
  loop();
}
export function stopTuner(){
  if(!active)return;
  active=false;cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  ac?.close();ac=null;analyser=null;
  const b=$('tun-btn');if(b){b.textContent='🎙 Start Tuner';b.className='btn btn-purple btn-lg';}
  resetDisplay('Tap Start Tuner then play a string');
}
export function toggleTuner(){if(starting)return;active?stopTuner():startTuner();}

function loop(){
  if(!active||!analyser)return;
  analyser.getFloatTimeDomainData(buf);
  const r=detectPitch(buf,ac.sampleRate,{minFreq:150,maxFreq:2800,threshold:0.9,minRms:0.004});
  const t=performance.now();
  if(r&&r.clarity>=MIN_CLARITY){
    hist.push({f:r.freq,t});lastGoodAt=t;
  }
  hist=hist.filter(h=>t-h.t<350);          // ~20 frames of context
  if(hist.length>=2){
    const fs=hist.map(h=>h.f).sort((a,b)=>a-b);
    const freq=fs[fs.length>>1];             // median rejects single-frame glitches
    render(freq);
  }else if(t-lastGoodAt>HOLD_MS){
    smoothCents=null;
    resetDisplay('🎧 Listening... play a string');
  }
  raf=requestAnimationFrame(loop);
}

// ─── Display ────────────────────────────────────────────
function setStatus(msg,col){const ts=$('tune-status');ts.textContent=msg;ts.style.color=col;}
function resetDisplay(msg){
  $('tun-note').textContent='🎻';$('tun-cents').textContent='';$('tun-freq').textContent='';
  setStatus(msg,'white');
  const ball=$('needle-ball');ball.style.left='50%';ball.style.background='#F59E0B';
  document.querySelectorAll('.str-pill').forEach(el=>el.classList.remove('hl','intune'));
}
function render(freq){
  const note=freqToNote(freq,S.a4);
  const raw=centsBetween(freq,targetFor(note));
  smoothCents=smoothCents===null?raw:smoothCents+0.5*(raw-smoothCents);
  const c=smoothCents,abs=Math.abs(c);
  const col=abs<=IN_TUNE?'#34D399':abs<=CLOSE?'#F59E0B':'#EF4444';
  const msg=abs<=IN_TUNE?'✅ In tune!':abs<=CLOSE?(c>0?'↓ A little sharp':'↑ A little flat'):(c>0?'↓ Sharp — loosen slightly':'↑ Flat — tighten slightly');
  $('tun-note').innerHTML=`${note.name.replace('#','♯')}<sub>${note.oct}</sub>`;
  $('tun-cents').textContent=`${c>=0?'+':'−'}${abs.toFixed(1)} ¢`;
  $('tun-cents').style.color=col;
  $('tun-freq').textContent=`${freq.toFixed(1)} Hz`;
  setStatus(msg,col);
  const pos=Math.max(4,Math.min(96,50+(c/50)*46));
  const ball=$('needle-ball');ball.style.left=pos+'%';ball.style.background=col;
  const ts=targets(),dist=s=>Math.abs(Math.log2(s.freq/freq));
  const near=ts.reduce((a,b)=>dist(b)<dist(a)?b:a);
  document.querySelectorAll('.str-pill').forEach(el=>{
    const isNear=el.id==='str-'+near.name;
    el.classList.toggle('hl',isNear);
    el.classList.toggle('intune',isNear&&note.midi===near.midi&&abs<=IN_TUNE);
  });
}

export function initTuner(){
  renderStrings();
  onAction({toggleTuner:()=>toggleTuner(),playRef:d=>playRef(d.string)});
  onChange({setPureFifths:(d,el)=>{S.pureFifths=el.checked;saveS();renderStrings();}});
}
