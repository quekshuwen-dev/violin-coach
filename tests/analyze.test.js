import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzePerformance,ANALYSIS_SR} from '../js/analyze.js';
import {midiToFreq} from '../js/notes.js';

// Synthetic "child playing": [midi, cents, seconds], violin-like harmonics, small vibrato
function performance_(plan,{sr=ANALYSIS_SR,gap=0.25}={}){
  const h=[0.6,1,0.8,0.6,0.45,0.35,0.25,0.18];const chunks=[new Float32Array(Math.floor(0.6*sr))];let phase=0;
  for(const [m,c,sec] of plan){const fr=midiToFreq(m+c/100);const N=Math.floor(sec*sr);const b=new Float32Array(N);
    for(let i=0;i<N;i++){const t=i/sr;const fm=fr*Math.pow(2,(5*Math.sin(2*Math.PI*5.5*t))/1200);phase+=2*Math.PI*fm/sr;let v=0;h.forEach((a,k)=>v+=a*Math.sin(phase*(k+1)+k));b[i]=0.22*v*Math.min(1,t/0.04,(sec-t)/0.08);}
    chunks.push(b,new Float32Array(Math.floor(gap*sr)));}
  const n=chunks.reduce((a,b)=>a+b.length,0),out=new Float32Array(n);let o=0;for(const ch of chunks){out.set(ch,o);o+=ch.length;}
  return out;
}
const D=['D4','E4','F#4','G4','A4','B4','C#5','D5','C#5','B4','A4','G4','F#4','E4','D4'];
const M={D4:62,E4:64,'F#4':66,G4:67,A4:69,B4:71,'C#5':73,D5:74,C5:72};

test('offline analysis of a clean D major recording: 15/15, 5 stars',async()=>{
  const data=performance_(D.map(n=>[M[n],0,0.6]));
  const r=await analyzePerformance(data,ANALYSIS_SR,D);
  assert.equal(r.summary.right,15);assert.equal(r.summary.inTune,15);assert.equal(r.summary.stars,5);
});
test('offline analysis finds planted mistakes (flat F#, corrected C, skipped B, sharp A)',async()=>{
  const plan=[[62,0,.7],[64,0,.7],[66,-28,.7],[67,0,.7],[69,0,.7],[71,0,.7],[72,0,.5],[73,0,.7],[74,0,.9],[73,0,.7],[69,22,.7],[67,0,.7],[66,0,.7],[64,0,.7],[62,0,.9]];
  const r=await analyzePerformance(performance_(plan),ANALYSIS_SR,D);
  const st=r.matcher.results.map(x=>x.status);
  assert.deepEqual(st,['ok','ok','flat','ok','ok','ok','ok','ok','ok','missed','sharp','ok','ok','ok','ok']);
  assert.equal(r.summary.stars,3);
  assert.ok(Math.abs(r.matcher.results[2].cents+28)<4);
});
test('quiet recording is normalised and still analysed',async()=>{
  const data=performance_(D.map(n=>[M[n],0,0.6])).map(v=>v*0.05);
  const r=await analyzePerformance(data,ANALYSIS_SR,D);
  assert.equal(r.summary.right,15);
});
test('silence gives no notes and 0 stars',async()=>{
  const r=await analyzePerformance(new Float32Array(ANALYSIS_SR*3),ANALYSIS_SR,D);
  assert.equal(r.summary.played,0);assert.equal(r.summary.stars,0);
});
