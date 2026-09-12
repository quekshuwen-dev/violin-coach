// Practice tab: camera recording and video upload of the chosen scale.
// The recording's audio is decoded and every note is checked locally
// (js/analyze.js); 3+ stars earns a calendar stamp. With a Gemini key, the
// measured report (and a frame) go to the AI for a worded teacher comment.
import {S,saveS,logPractice,esc,$} from './state.js';
import {onAction,onChange} from './actions.js';
import {decodeAudio,analyzePerformance} from './analyze.js';
import {resultHTML,earnsStamp} from './scaleresult.js';
import {currentScale} from './scales.js';
import {renderCalendar} from './ui.js';

let camStream=null,camRec=null,camChunks=[],captFrame=null,recTmr=null,recSec=0;
let camStarted=false,isRec=false,upFile=null,busy=false;
let onLeaveCheck=null;

export function setModeHooks({leaveCheck}){onLeaveCheck=leaveCheck;}
export function switchInput(mode){
  if(mode!=='check')onLeaveCheck?.();
  S.inputMode=mode;saveS();
  document.querySelectorAll('.inp-tab').forEach(el=>el.classList.toggle('active',el.dataset.mode===mode));
  $('check-section').classList.toggle('hidden',mode!=='check');
  $('cam-section').classList.toggle('hidden',mode!=='camera');
  $('up-section').classList.toggle('hidden',mode!=='upload');
}

// ─── Camera ─────────────────────────────────────────────
async function handleCamBtn(){
  if(busy)return;
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
  camChunks=[];captFrame=null;recSec=0;
  try{
    const mime=['audio/webm;codecs=opus','video/webm;codecs=vp8,opus','video/mp4'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m));
    // Audio-only recording keeps the file small and decodes fast; the frame for posture is captured separately
    const audioStream=new MediaStream(camStream.getAudioTracks());
    camRec=new MediaRecorder(audioStream,mime&&mime.startsWith('audio')?{mimeType:mime}:undefined);
    camRec.ondataavailable=e=>{if(e.data&&e.data.size)camChunks.push(e.data);};
    camRec.start(500);
  }catch(e){console.warn('MediaRecorder failed',e);camRec=null;}
  setTimeout(captureFrame,2500);
  recTmr=setInterval(()=>{recSec++;const e=$('rec-timer');if(e)e.textContent=`${Math.floor(recSec/60)}:${String(recSec%60).padStart(2,'0')}`;},1000);
  $('rec-badge').classList.add('show');
  isRec=true;const b=$('cam-btn');b.textContent='⏹ Stop & Check My Scale';b.className='btn btn-red btn-full btn-lg';
}
function captureFrame(){
  const v=$('cam-video');
  if(v&&v.videoWidth>0){const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);captFrame=c.toDataURL('image/jpeg',0.72).split(',')[1];}
}
async function stopRec(){
  clearInterval(recTmr);
  if(!captFrame)captureFrame();
  const blob=await new Promise(res=>{
    if(!camRec||camRec.state==='inactive')return res(new Blob(camChunks,{type:camChunks[0]?.type||'audio/webm'}));
    camRec.onstop=()=>res(new Blob(camChunks,{type:camRec.mimeType||'audio/webm'}));camRec.stop();
  });
  $('rec-badge').classList.remove('show');isRec=false;
  const b=$('cam-btn');b.textContent='🔄 Record Again';b.className='btn btn-amber btn-full btn-lg';
  if(!blob.size){alert('Nothing was recorded. Please try again.');return;}
  await analyzeRecording(blob,captFrame,'camera recording');
}

// ─── Upload ─────────────────────────────────────────────
function handleUpload(e){
  upFile=e.target.files[0];if(!upFile)return;
  const v=$('upload-vid');v.src=URL.createObjectURL(upFile);
  $('upload-area').classList.add('hidden');$('vid-preview-wrap').classList.remove('hidden');
}
function resetUpload(){
  upFile=null;$('file-in').value='';$('upload-vid').removeAttribute('src');$('upload-vid').load();
  $('upload-area').classList.remove('hidden');$('vid-preview-wrap').classList.add('hidden');
}
async function analyzeUpload(){
  if(!upFile||busy)return;
  const frame=await extractFrame(upFile);
  await analyzeRecording(upFile,frame,'uploaded video');
}
function extractFrame(file){
  return new Promise(resolve=>{
    const url=URL.createObjectURL(file),v=document.createElement('video');
    v.src=url;v.muted=true;v.playsInline=true;
    const done=(val)=>{URL.revokeObjectURL(url);resolve(val);};
    v.onloadeddata=()=>{v.currentTime=Math.min(2,(v.duration||10)*0.2);};
    v.onseeked=()=>{
      try{const c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0);done(c.toDataURL('image/jpeg',0.75).split(',')[1]);}
      catch{done(null);}
    };
    v.onerror=()=>done(null);
    setTimeout(()=>done(null),8000);
  });
}

// ─── Analysis (local) + AI comment ──────────────────────
function overlay(show,title,text){
  const o=$('analyzing');o.classList.toggle('show',show);
  if(title)$('an-title').textContent=title;if(text!==undefined)$('an-text').textContent=text;
  $('an-bar').style.width='0%';
}
async function analyzeRecording(blob,frame,src){
  busy=true;
  const sc=currentScale(),prof=S.profiles[S.cur];
  overlay(true,'Checking your scale…','Listening to every note');
  let res;
  try{
    const {data,sr,duration}=await decodeAudio(blob);
    if(duration<1)throw new Error('The recording is too short.');
    res=await analyzePerformance(data,sr,sc.seq,{a4:S.a4,onProgress:p=>{$('an-bar').style.width=Math.round(p*100)+'%';}});
  }catch(e){
    overlay(false);busy=false;console.error(e);
    alert('I could not read the sound from that recording.\n\n'+(e.message||e)+'\n\nTry a different video, or record with the camera.');
    return;
  }
  const stamp=earnsStamp(res.summary);
  logPractice(S.cur,{stamp,stars:res.summary.stars,label:sc.title.split(' — ')[0]});
  renderCalendar();
  const card=$('feedback-card');
  $('fb-pname').textContent=prof.name;
  $('fb-scale').innerHTML=`<p class="fb-section-lbl">🎼 ${esc(sc.title)} · ${src}</p>`+resultHTML({matcher:res.matcher,summary:res.summary,names:sc.seq,stamp});
  $('fb-ai').classList.add('hidden');$('fb-ai-err').classList.add('hidden');
  card.classList.add('show','pop');setTimeout(()=>card.classList.remove('pop'),400);
  overlay(false);
  card.scrollIntoView({behavior:'smooth',block:'start'});
  if(S.gemKey&&res.summary.played>0)await aiComment({frame,report:res.report,src});
  busy=false;
}
export async function aiTeacherComment(report,label){await aiComment({report,src:`live scale check: ${label}`});}

// Pick a model that actually exists for this key (model names change over time)
const PREFERRED=['gemini-2.5-flash','gemini-2.5-flash-lite','gemini-flash-latest','gemini-2.0-flash','gemini-2.0-flash-lite'];
let modelCache=null;
async function pickModel(key){
  if(modelCache)return modelCache;
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',{headers:{'x-goog-api-key':key}});
  const d=await r.json();
  if(d.error)throw new Error(d.error.message);
  const names=(d.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,''));
  modelCache=PREFERRED.find(p=>names.includes(p))||names.find(n=>/flash/.test(n)&&!/image|tts|live|audio|thinking/.test(n))||names[0];
  if(!modelCache)throw new Error('This key has no text models available.');
  return modelCache;
}
async function aiComment({frame=null,report='',src}){
  if(!S.gemKey)return;
  const errBox=$('fb-ai-err'),ai=$('fb-ai');
  if(!navigator.onLine){errBox.innerHTML='<b>AI teacher comment skipped</b>You are offline. The scale check above still counts!';errBox.classList.remove('hidden');return;}
  overlay(true,'Asking the AI teacher…','Writing a comment about your scale');
  const prof=S.profiles[S.cur];
  const parts=[];
  if(frame)parts.push({inline_data:{mime_type:'image/jpeg',data:frame}});
  parts.push({text:`You are a warm, encouraging violin teacher for a young student named "${prof.name}".
Session: ${src}.
The app measured every note the student played against the scale. These are the facts; use them and do not invent others:
${report}
Explain in simple words which notes were right and which were flat, sharp, wrong or skipped, with one concrete finger tip for each problem (flat = finger a little closer to the bridge, sharp = finger a little back towards the scroll). Mention the notes by name. Vary your wording; do not use stock phrases.
${frame?'Also assess posture, violin hold and bow hold from the image.':'No image was available: say posture, hold and bowing could not be seen this time.'}
Be kind, specific and age-appropriate. Keep each field to one or two short sentences.
Respond with JSON: {"stars":number 1-5 matching the measured result,"posture":"...","violin_hold":"...","bow_hold":"...","intonation":"...","overall":"one warm sentence","positives":["...","..."],"improvements":["...","..."],"encouragement":"fun motivating phrase"}`});
  try{
    const model=await pickModel(S.gemKey);
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':S.gemKey},
      body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:0.9,maxOutputTokens:900,responseMimeType:'application/json'}})
    });
    const data=await r.json();
    if(data.error)throw new Error(data.error.message);
    const raw=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    const m=raw.match(/\{[\s\S]*\}/);
    if(!m)throw new Error('The AI reply was not in the expected format.');
    showAI(JSON.parse(m[0]));
    errBox.classList.add('hidden');
  }catch(e){
    console.error(e);
    ai.classList.add('hidden');
    errBox.innerHTML=`<b>AI teacher comment unavailable</b>${esc(e.message||String(e))}<br>Check the Gemini key in ⚙️ Settings. The scale check above still counts.`;
    errBox.classList.remove('hidden');
  }
  overlay(false);
}
function showAI(fb){
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
  $('fb-ai').classList.remove('hidden');
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
