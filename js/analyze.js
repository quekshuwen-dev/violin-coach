// Offline analysis of a recording (camera or uploaded video): decode the
// audio track, run the pitch detector over it, and match the notes against
// the chosen scale with the same engine as the live Scale Check.
import {detectPitch} from './pitch.js';
import {NoteTracker,ScaleMatcher} from './notecheck.js';

export const ANALYSIS_SR=32000,WIN=4096,HOP_MS=40;

// Decode any audio/video blob to mono Float32 at ANALYSIS_SR
export async function decodeAudio(blob){
  const ab=await blob.arrayBuffer();
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const ctx=new OAC(1,1,ANALYSIS_SR);
  const buf=await new Promise((res,rej)=>{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej);});
  const n=buf.length,data=new Float32Array(n);
  for(let c=0;c<buf.numberOfChannels;c++){const ch=buf.getChannelData(c);for(let i=0;i<n;i++)data[i]+=ch[i]/buf.numberOfChannels;}
  // resample if the browser ignored the requested rate
  if(buf.sampleRate!==ANALYSIS_SR){
    const ratio=buf.sampleRate/ANALYSIS_SR,m=Math.floor(n/ratio),out=new Float32Array(m);
    for(let i=0;i<m;i++){const p=i*ratio,j=Math.floor(p),f=p-j;out[i]=data[j]*(1-f)+(data[j+1]||0)*f;}
    return{data:out,sr:ANALYSIS_SR,duration:m/ANALYSIS_SR};
  }
  return{data,sr:ANALYSIS_SR,duration:n/ANALYSIS_SR};
}

// Run the note tracker + matcher over decoded audio. Yields to the UI
// between chunks and reports progress 0..1.
export async function analyzePerformance(data,sr,expectedNames,{a4=440,onProgress}={}){
  const hop=Math.round(sr*HOP_MS/1000);
  const tracker=new NoteTracker({a4,minMs:100,gapMs:100});
  const matcher=new ScaleMatcher(expectedNames);
  let heard=0,peak=0;
  for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));
  const gain=peak>0.05?1:peak>0?0.3/peak:1;     // quiet phone recordings: normalise
  const total=Math.max(1,Math.floor((data.length-WIN)/hop));
  for(let k=0;k<total;k++){
    const s=k*hop,w=data.subarray(s,s+WIN);
    let frame=null;
    const r=detectPitch(gain===1?w:w.map(v=>v*gain),sr,{minFreq:150,maxFreq:2800,threshold:0.9,minRms:0.003});
    if(r&&r.clarity>=0.86){frame=r;}
    const ev=tracker.push(frame,(s+WIN/2)/sr*1000);
    if(ev){if(ev.type==='onset')heard++;matcher.onEvent(ev);}
    if(k%40===0){onProgress?.(k/total);await new Promise(r=>setTimeout(r,0));}
  }
  const endEv=tracker.push(null,data.length/sr*1000+1000);if(endEv)matcher.onEvent(endEv);
  const summary=matcher.finish();
  onProgress?.(1);
  return{matcher,summary,report:matcher.report(),notesHeard:heard,duration:data.length/sr};
}
