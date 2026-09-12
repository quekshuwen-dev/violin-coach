// Practice tab: input modes (scale check / camera / upload), Gemini
// feedback, and the feedback card.
import {S,saveS,logPractice,esc,$} from './state.js';
import {onAction,onChange} from './actions.js';
import {detectPitch} from './pitch.js';
import {renderCalendar} from './ui.js';

const GEMINI_MODEL='gemini-2.0-flash';
let camStream=null,camRec=null,camAC=null,camAn=null,pitchTimer=null;
let pitches=[],captFrame=null,recTmr=null,recSec=0;
let camStarted=false,isRec=false,upFile=null;
let onLeaveCheck=null;   // set by app.js so switching modes stops a running scale check

export function setModeHooks({leaveCheck}){onLeaveCheck=leaveCheck;}
export function switchInput(mode){
  if(mode!=='check')onLeaveCheck?.();
  S.inputMode=mode;saveS();
  document.querySelectorAll('.inp-tab').forEach(el=>el.classList.toggle('active',el.dataset.mode===mode));
  $('check-section').classList.toggle('hidden',mode!=='check');
  $('cam-section').classList.toggle('hidden',mode!=='camera');
  $('up-section').classList.toggle('hidden',mode!=='upload');
}
async function handleCamBtn(){
  if(!camStarted)await startCam();
  else if(!isRec)startRec();
  else await stopRec();
}
async function startCam(){
  try{
    camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const v=$('cam-video');v.srcObject=camStream;v.classList.remove('hidden');
    $('cam-placeholder').classList.add('hidden');
    camStarted=true;
    const b=$('cam-btn');b.textContent='● Start Recording';b.className='btn btn-green btn-full btn-lg';
  }catch{alert('Please allow camera and microphone, then try again!');}
}
function startRec(){
  pitches=[];captFrame=null;recSec=0;
  camAC=new (window.AudioContext||window.webkitAudioContext)();camAC.resume();
  camAn=camAC.createAnalyser();camAn.fftSize=8192;
  camAC.createMediaStreamSource(camStream).connect(camAn);
  const pb=new Float32Array(camAn.fftSize);
  pitchTimer=setInterval(()=>{
    if(!camAn)return;camAn.getFloatTimeDomainData(pb);
    const r=detectPitch(pb,camAC.sampleRate,{minFreq:150,maxFreq:2800});
    if(r&&r.clarity>=0.85)pitches.push(r.freq);
  },150);
  setTimeout(()=>{
    const v=$('cam-video');
    if(v&&v.videoWidth>0){const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);captFrame=c.toDataURL('image/jpeg',0.72).split(',')[1];}
  },2500);
  try{camRec=new MediaRecorder(camStream);camRec.start();}catch(e){camRec=null;}
  recTmr=setInterval(()=>{recSec++;const e=$('rec-timer');if(e)e.textContent=`${Math.floor(recSec/60)}:${String(recSec%60).padStart(2,'0')}`;},1000);
  $('rec-badge').classList.add('show');
  isRec=true;const b=$('cam-btn');b.textContent='⏹ Stop & Get Feedback';b.className='btn btn-red btn-full btn-lg';
}
async function stopRec(){
  clearInterval(recTmr);clearInterval(pitchTimer);camRec?.stop();camAC?.close();camAn=null;
  $('rec-badge').classList.remove('show');isRec=false;
  const b=$('cam-btn');b.textContent='🔄 Record Again';b.className='btn btn-amber btn-full btn-lg';
  const cnt=pitches.length;let cons=0;
  if(cnt>3){
    const sorted=[...pitches].sort((a,b)=>a-b),med=sorted[cnt>>1];
    const cents=pitches.map(p=>1200*Math.log2(p/med));
    const sd=Math.sqrt(cents.reduce((a,c)=>a+c*c,0)/cnt);
    cons=Math.max(0,Math.min(100,100-sd/3));
  }
  const audioLine=`Audio: ${cnt} pitch samples over ${Math.round(recSec)}s, pitch steadiness ${cons.toFixed(0)}%, ${cnt<5?'very little violin sound':cnt<30?'some violin playing':'good amount of violin playing'}.`;
  await callGemini({frame:captFrame,audioLine,src:'camera recording'});
}

// ─── Upload ─────────────────────────────────────────────
function handleUpload(e){
  upFile=e.target.files[0];if(!upFile)return;
  const v=$('upload-vid');v.src=URL.createObjectURL(upFile);
  $('upload-area').classList.add('hidden');$('vid-preview-wrap').classList.remove('hidden');
}
function resetUpload(){
  upFile=null;$('file-in').value='';$('upload-vid').src='';
  $('upload-area').classList.remove('hidden');$('vid-preview-wrap').classList.add('hidden');
}
async function analyzeUpload(){
  if(!upFile)return;
  const frame=await extractFrame(upFile);
  await callGemini({frame,audioLine:'Audio: not analysed for uploaded videos.',src:'uploaded video'});
}
function extractFrame(file){
  return new Promise(resolve=>{
    const url=URL.createObjectURL(file),v=document.createElement('video');
    v.src=url;v.muted=true;
    v.onloadeddata=()=>{v.currentTime=Math.min(2,v.duration*0.2);};
    v.onseeked=()=>{
      const c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;
      c.getContext('2d').drawImage(v,0,0);URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg',0.75).split(',')[1]);
    };
    v.onerror=()=>{URL.revokeObjectURL(url);resolve(null);};
  });
}

// ─── Gemini ─────────────────────────────────────────────
// A warm teacher comment on a finished scale check (uses the real per-note report)
export function aiTeacherComment(report,label){
  return callGemini({scaleReport:report,src:`scale check: ${label}`});
}
async function callGemini({frame=null,audioLine='',scaleReport='',src}){
  if(!S.gemKey){
    alert('⚙️ Please add your free Gemini API key first!\n\n1. Tap the ⚙️ button at the top right\n2. Paste your Gemini key\n3. Get a free key at: aistudio.google.com/apikey');
    return;
  }
  if(!navigator.onLine){alert('AI feedback needs an internet connection. Scale Check, the tuner and scales all work offline!');return;}
  const overlay=$('analyzing');overlay.classList.add('show');
  const prof=S.profiles[S.cur];
  const parts=[];
  if(frame)parts.push({inline_data:{mime_type:'image/jpeg',data:frame}});
  parts.push({text:`You are a warm, encouraging violin teacher for a young student named "${prof.name}".

Session: ${src}.
${audioLine}
${scaleReport?`The app measured every note the student played against the scale. Use these facts; do not invent others:\n${scaleReport}\nExplain in simple words which notes were right, which were flat/sharp/wrong, and one concrete finger tip for each problem (flat = finger a little closer to the bridge, sharp = finger a little back towards the scroll).`:''}
${frame?'Assess posture and technique from the image of the student playing violin.':'No visual available.'}

Give kind, age-appropriate, encouraging feedback. Be very positive and motivating for a child.

Respond ONLY with raw JSON — no markdown, no code fences:
{"stars":4,"posture":"...","violin_hold":"...","bow_hold":"...","intonation":"...","overall":"one warm sentence","positives":["...","..."],"improvements":["...","..."],"encouragement":"fun motivating phrase"}`});
  try{
    const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':S.gemKey},
      body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:0.7,maxOutputTokens:600}})
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error.message);
    let raw=data.candidates?.[0]?.content?.parts?.[0]?.text||'{}';
    raw=raw.replace(/```json|```/g,'').trim();
    const fb=JSON.parse(raw);
    showFeedback(fb);
    if(!scaleReport){logPractice(S.cur,{stars:Number(fb.stars)||0});renderCalendar();}
  }catch(e){
    console.error(e);
    const fb={stars:3.5,posture:'Keep your back straight and comfortable!',violin_hold:'Make sure your chin rests nicely on the chin rest.',bow_hold:'Try to keep your bow arm nice and relaxed.',intonation:'Keep listening carefully to each note as you play.',overall:`Great effort today, ${prof.name}! Every practice makes you better! 🌟`,positives:['Showed up and practised!','Gave it your best effort'],improvements:['Try playing more slowly','Listen to each note carefully'],encouragement:'🎵 Every great violinist started exactly where you are!'};
    showFeedback(fb);
    if(e.message&&e.message.length<200)alert('AI Error: '+e.message+'\n\nCheck your Gemini key in ⚙️ Settings.\nMake sure it is copied correctly from aistudio.google.com/apikey');
  }
  overlay.classList.remove('show');
}
function showFeedback(fb){
  const card=$('feedback-card'),prof=S.profiles[S.cur];
  $('fb-pname').textContent=prof.name;
  const stars=Number(fb.stars)||0,full=Math.floor(stars),half=stars%1>=0.5;
  $('fb-stars').innerHTML=[1,2,3,4,5].map(i=>{const lit=i<=full||(half&&i===full+1);return`<span class="star-ic ${lit?'star-full':'star-empty'}">${lit?'★':'☆'}</span>`;}).join('');
  $('fb-score').textContent=`${stars} / 5 stars`;
  $('fb-trophy').textContent=stars>=4.5?'🏆':stars>=3.5?'🌟':stars>=2.5?'⭐':'💪';
  $('fb-overall').textContent=`"${fb.overall||''}"`;
  $('fb-posture').textContent=fb.posture||'';$('fb-hold').textContent=fb.violin_hold||'';
  $('fb-bow').textContent=fb.bow_hold||'';$('fb-intone').textContent=fb.intonation||'';
  $('fb-pos').innerHTML=(fb.positives||[]).map(p=>`<p>• ${esc(p)}</p>`).join('');
  $('fb-imp').innerHTML=(fb.improvements||[]).map(p=>`<p>• ${esc(p)}</p>`).join('');
  $('fb-enc').textContent=fb.encouragement||'';
  card.classList.add('show','pop');setTimeout(()=>card.classList.remove('pop'),400);
  card.scrollIntoView({behavior:'smooth',block:'start'});
}
export function initPractice(){
  onAction({
    switchInput:d=>switchInput(d.mode),
    handleCamBtn:()=>handleCamBtn(),
    pickFile:()=>$('file-in').click(),
    analyzeUpload:()=>analyzeUpload(),
    resetUpload:()=>resetUpload()
  });
  onChange({handleUpload:(d,el,e)=>handleUpload(e)});
  switchInput(S.inputMode||'check');
}
