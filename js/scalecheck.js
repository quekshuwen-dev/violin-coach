// Scale Check: the child plays the chosen scale; we listen, judge every
// note (right / flat / sharp / wrong / skipped), show it live on the
// bubbles, and give kid-friendly feedback. A correct scale earns a tick
// on the practice calendar.
import {S,logPractice,$} from './state.js';
import {onAction,runAction} from './actions.js';
import {detectPitch} from './pitch.js';
import {openMic} from './mic.js';
import {NoteTracker,ScaleMatcher,prettyName,spellMidi} from './notecheck.js';
import {freqToNote} from './notes.js';
import {currentScale,bubblesHTML,ensureAudio,onScaleChange,prettyKey} from './scales.js';
import {playSequence,stopPlayback,isPlaying} from './playback.js';
import {renderCalendar} from './ui.js';
import {aiTeacherComment} from './practice.js';

const LEVEL_NAMES={beginner:'Beginner',intermediate:'Intermediate',advanced:'Advanced'};
let listening=false,starting=false,mic=null,raf=null,tracker=null,matcher=null,sc=null,lastEventAt=0,lastSummary=null;

export function renderScaleCheck(){
  if(listening)stopCheck(false);
  sc=currentScale();
  $('sc-title').textContent=sc.title;
  $('sc-sub').textContent=`${LEVEL_NAMES[sc.level]} · ${sc.seq.length} notes up and down · change it on the Scales tab`;
  $('sc-bubbles').innerHTML=bubblesHTML(sc.seq,sc.ascLen,{action:'playNb',size:sc.seq.length>24?30:sc.seq.length>16?34:40});
  $('sc-result').classList.add('hidden');$('sc-live').classList.add('hidden');
  setHint('Listen to it first, then press Start and play the scale slowly, one clear note at a time.');
}
const bubbles=()=>[...document.querySelectorAll('#sc-bubbles .nb')];
function setHint(t){$('sc-hint').textContent=t;}

async function hear(){
  if(isPlaying()){stopPlayback();$('sc-hear').textContent='🔊 Hear it';return;}
  if(listening)stopCheck(false);
  if(!await ensureAudio())return;
  $('sc-hear').textContent='⏹ Stop';
  await playSequence({seq:sc.seq,bpm:S.scBpm,metro:false,countIn:0,bubbles:bubbles(),onEnd:()=>{$('sc-hear').textContent='🔊 Hear it';}});
}

// ─── Listening ──────────────────────────────────────────
async function startCheck(){
  if(listening||starting)return;
  starting=true;stopPlayback();
  try{mic=await openMic();}catch(e){starting=false;alert('Please allow microphone access so I can hear you play.');return;}
  starting=false;listening=true;
  tracker=new NoteTracker({a4:S.a4});matcher=new ScaleMatcher(sc.seq);lastEventAt=performance.now();lastSummary=null;
  bubbles().forEach(el=>el.classList.remove('nb-ok','nb-flat','nb-sharp','nb-wrong','nb-missed','nb-trying','nb-next','nb-octave','playing'));
  $('sc-result').classList.add('hidden');$('sc-live').classList.remove('hidden');
  $('sc-start').classList.add('hidden');$('sc-stop').classList.remove('hidden');
  $('sc-heard').textContent='🎧 listening…';
  setHint('Play each note and hold it for a moment. Press Finished when you are done.');
  showNext();loop();
}
function showNext(){
  const i=matcher.index;
  bubbles().forEach((el,j)=>el.classList.toggle('nb-next',j===i&&!matcher.done));
  $('sc-next').textContent=matcher.done?'🎉 all done!':prettyName(sc.seq[i]);
}
function paint(i){
  const r=matcher.results[i],el=bubbles()[i];if(!el)return;
  el.classList.remove('nb-ok','nb-flat','nb-sharp','nb-wrong','nb-missed','nb-trying','nb-octave');
  const map={ok:'nb-ok',flat:'nb-flat',sharp:'nb-sharp',wrong:'nb-wrong',octave:'nb-octave',missed:'nb-missed',trying:'nb-trying',notPlayed:'nb-missed'};
  if(map[r.status])el.classList.add(map[r.status]);
}
function loop(){
  if(!listening||!mic)return;
  const r=detectPitch(mic.read(),mic.sampleRate,{minFreq:150,maxFreq:2800,threshold:0.9,minRms:0.004});
  const t=performance.now();
  if(r&&r.clarity>=0.86){
    const n=freqToNote(r.freq,S.a4);
    $('sc-heard').textContent=`I hear ${n.name.replace('#','♯')}${n.oct}  ${n.cents>=0?'+':'−'}${Math.abs(n.cents).toFixed(0)}¢`;
  }
  const ev=tracker.push(r,t);
  if(ev){
    if(ev.type==='onset')lastEventAt=t;
    const {changed,done}=matcher.onEvent(ev);
    changed.forEach(paint);
    if(changed.length)showNext();
    if(done){finishCheck();return;}
  }else if(t-lastEventAt>12000){
    setHint("I can't hear any notes. Move closer to the microphone and bow slowly and clearly.");lastEventAt=t;
  }
  raf=requestAnimationFrame(loop);
}
function stopCheck(showResult=true){
  if(!listening)return;
  listening=false;cancelAnimationFrame(raf);mic?.close();mic=null;
  $('sc-start').classList.remove('hidden');$('sc-stop').classList.add('hidden');
  bubbles().forEach(el=>el.classList.remove('nb-next'));
  if(showResult)finishCheck();
}
function finishCheck(){
  if(listening){listening=false;cancelAnimationFrame(raf);mic?.close();mic=null;}
  $('sc-start').classList.remove('hidden');$('sc-stop').classList.add('hidden');
  const s=matcher.finish();lastSummary=s;
  matcher.results.forEach((_,i)=>paint(i));
  bubbles().forEach(el=>el.classList.remove('nb-next'));
  $('sc-live').classList.add('hidden');
  const correct=s.played>0&&s.right===s.total;
  logPractice(S.cur,{correct,stars:s.stars,label:sc.title.split(' — ')[0]});
  renderCalendar();
  const starsHTML=[1,2,3,4,5].map(i=>`<span class="star-ic ${i<=Math.round(s.stars)?'star-full':'star-empty'}">${i<=s.stars?'★':i-0.5===s.stars?'★':'☆'}</span>`).join('');
  const head=correct?`<div class="sc-tick">✓ Correct scale — a tick on your calendar!</div>`:'';
  const legend=`<div class="sc-legend"><span class="lg nb-ok">in tune</span><span class="lg nb-flat">flat ↓</span><span class="lg nb-sharp">sharp ↑</span><span class="lg nb-wrong">wrong</span><span class="lg nb-missed">skipped</span></div>`;
  const notes=matcher.results.map((r,i)=>{
    const nm=prettyName(sc.seq[i]);
    const c=['ok','flat','sharp'].includes(r.status)?` <small>${r.cents>=0?'+':'−'}${Math.abs(r.cents).toFixed(0)}¢</small>`:'';
    const played=['wrong','octave'].includes(r.status)?` <small>→ ${spellMidi(r.playedMidi,matcher.preferFlats)}</small>`:'';
    return`<span class="sc-note nb-${r.status==='notPlayed'?'missed':r.status}">${nm}${c}${played}</span>`;
  }).join('');
  $('sc-result').innerHTML=`
    ${head}
    <div class="sc-score"><div class="stars-row">${starsHTML}</div><div class="sc-score-txt">${s.right} of ${s.total} right · ${s.inTune} in tune</div></div>
    <div class="sc-comments">${s.comments.map(c=>`<p><span class="sc-ico">${c.icon}</span>${c.text}</p>`).join('')}</div>
    ${legend}
    <div class="sc-notes">${notes}</div>
    <div class="sc-btns">
      <button class="btn btn-purple" data-action="scHear">🔊 Hear it again</button>
      <button class="btn btn-green" data-action="scStart">🔁 Try again</button>
      ${S.gemKey?'<button class="btn btn-pink" data-action="scAskAI">🤖 Ask the AI teacher</button>':''}
    </div>`;
  $('sc-result').classList.remove('hidden');
  $('sc-result').scrollIntoView({behavior:'smooth',block:'nearest'});
  setHint(correct?'Brilliant! Try a faster tempo or a new key on the Scales tab.':'Look at the coloured notes, listen again, and have another go.');
}
export function stopScaleCheck(){stopPlayback();if(listening)stopCheck(false);}

export function initScaleCheck(){
  renderScaleCheck();
  onScaleChange(renderScaleCheck);
  onAction({
    scHear:()=>hear(),
    scStart:()=>startCheck(),
    scStop:()=>stopCheck(true),
    scChange:()=>runAction('switchTab',{tab:'scales'}),
    scAskAI:()=>{if(matcher&&lastSummary)aiTeacherComment(matcher.report(),sc.title);}
  });
}
