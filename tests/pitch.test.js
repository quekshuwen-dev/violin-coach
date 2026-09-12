import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectPitch} from '../js/pitch.js';

const SR=48000,N=8192;
// Seeded PRNG so noisy cases are reproducible
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function tone(f,harmonics=[1],{amp=0.3,noise=0,vibratoCents=0,vibratoHz=5.5,dc=0,seed=1}={}){
  const b=new Float32Array(N);let phase=0;const rand=rng(seed);
  for(let i=0;i<N;i++){
    const t=i/SR;
    const fm=f*Math.pow(2,(vibratoCents*Math.sin(2*Math.PI*vibratoHz*t))/1200);
    phase+=2*Math.PI*fm/SR;  // accumulate phase so vibrato is a true frequency modulation
    let v=0;harmonics.forEach((a,k)=>v+=a*Math.sin(phase*(k+1)+k*0.7));
    b[i]=amp*v+noise*(rand()*2-1)+dc;
  }
  return b;
}
const cents=(got,want)=>1200*Math.log2(got/want);
function expectPitch(name,buf,want,tol){
  const r=detectPitch(buf,SR);
  assert.ok(r,`${name}: no pitch detected`);
  const c=cents(r.freq,want);
  assert.ok(Math.abs(c)<tol,`${name}: want ${want} got ${r.freq.toFixed(2)} (${c.toFixed(2)} cents)`);
  return r;
}

test('open strings, pure sine, within 0.5 cent',()=>{
  for(const [n,f] of [['G3',196],['D4',293.66],['A4',440],['E5',659.25]]){
    const r=expectPitch(n,tone(f),f,0.5);assert.ok(r.clarity>0.95,`${n} clarity ${r.clarity}`);
  }
});
test('violin-like spectra (strong upper harmonics) do not octave-jump',()=>{
  expectPitch('G3 rich',tone(196,[0.6,1,0.8,0.7,0.5,0.4,0.3,0.2]),196,1);
  expectPitch('A4 2nd harmonic dominant',tone(440,[0.4,1,0.5,0.3]),440,1);
  expectPitch('D4 3rd harmonic dominant',tone(293.66,[0.5,0.6,1,0.4]),293.66,1);
});
test('full playable range 150–2800 Hz',()=>{
  for(const f of [160,196,440,880,1318.5,1760,2637])expectPitch('f='+f,tone(f,[1,0.5,0.25]),f,1.5);
});
test('vibrato ±20 cents reads the centre within a few cents',()=>{
  const r=detectPitch(tone(440,[1,0.5],{vibratoCents:20}),SR);
  assert.ok(r&&Math.abs(cents(r.freq,440))<8,'vibrato centre');
});
test('quiet signal and DC offset still detected',()=>{
  expectPitch('quiet',tone(440,[1,0.4],{amp:0.02}),440,1);
  expectPitch('dc offset',tone(293.66,[1,0.3],{dc:0.2}),293.66,1);
});
test('noisy signal stays within 1 cent (several noise seeds)',()=>{
  for(const seed of [1,2,3,4,5])expectPitch('noisy seed '+seed,tone(440,[1,0.5,0.3],{noise:0.12,seed}),440,1);
});
test('silence and white noise are rejected or low clarity',()=>{
  assert.equal(detectPitch(new Float32Array(N),SR),null);
  const r0=rng(7);const noise=new Float32Array(N).map(()=>r0()*0.6-0.3);
  const r=detectPitch(noise,SR);
  assert.ok(r===null||r.clarity<0.86,'noise should not read as a confident note');
});
test('reference pitch offsets are resolved: 440 vs 442 Hz differ by ~7.85 cents',()=>{
  const a=detectPitch(tone(440),SR).freq,b=detectPitch(tone(442),SR).freq;
  assert.ok(Math.abs(cents(b,a)-7.85)<0.3);
});
test('fast enough for a 60 fps loop',()=>{
  const buf=tone(196,[1,0.5,0.3]);const t=performance.now();
  for(let i=0;i<30;i++)detectPitch(buf,SR);
  const per=(performance.now()-t)/30;
  assert.ok(per<16,`${per.toFixed(1)} ms per frame`);
});
