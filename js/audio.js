// Audio engine: real violin recordings (samples/violin, CC-BY 3.0, see README)
// played through a small sampler with exact fractional pitch, plus a light
// room reverb. Tone.js (vendor/Tone.js, classic script) provides the audio
// context, buffer loading, transport scheduling and reverb.
const T=()=>window.Tone;

export const SAMPLE_NOTES=['G3','A3','C4','E4','G4','A4','C5','E5','G5','A5','C6','E6','G6','A6','C7'];
export const SAMPLE_BASE='samples/violin/';
export let chain=null;           // {master, reverb, sampler}
let audioInit=null,activeClick=null;

export function toneAvailable(){return typeof window.Tone!=='undefined';}
export async function initAudio(){
  if(!toneAvailable())throw new Error('Tone.js missing');
  await T().start();
  if(!audioInit)audioInit=buildAudioChain();   // memoised: rapid taps share one build
  await audioInit;
}
export async function buildAudioChain(){
  const Tone=T();
  const master=new Tone.Volume(-2).toDestination();
  const reverb=new Tone.Reverb({decay:1.6,preDelay:0.01,wet:0.14}).connect(master);
  await reverb.ready;
  const sampler=new ViolinSampler(reverb);
  await sampler.load();
  chain={master,reverb,sampler};
  return chain;
}

// Minimal sampler: picks the nearest recorded note and shifts playback rate
// to the exact target pitch (a frequency in Hz or a note name).
export class ViolinSampler{
  constructor(output){
    const Tone=T();
    this.out=new Tone.Gain(1).connect(output);
    this.midis=SAMPLE_NOTES.map(n=>Tone.Frequency(n).toMidi());
    this.buffers=null;this.active=new Set();
  }
  load(){
    const Tone=T();
    return new Promise((res,rej)=>{
      const urls={};SAMPLE_NOTES.forEach((n,i)=>{urls[this.midis[i]]=n+'.mp3';});
      this.buffers=new Tone.ToneAudioBuffers({urls,baseUrl:SAMPLE_BASE,onload:res,onerror:rej});
    });
  }
  get loaded(){return !!this.buffers&&this.buffers.loaded;}
  // note: 'F#4' | 440 (Hz). Returns the source so callers can stop it.
  play(note,dur=1,time=T().now(),velocity=1){
    const Tone=T();
    const freq=typeof note==='number'?note:Tone.Frequency(note).toFrequency();
    const midiF=69+12*Math.log2(freq/440);
    let best=this.midis[0];for(const m of this.midis)if(Math.abs(m-midiF)<Math.abs(best-midiF))best=m;
    const src=new Tone.ToneBufferSource({url:this.buffers.get(best),playbackRate:Math.pow(2,(midiF-best)/12),fadeIn:0.005,fadeOut:Math.min(0.25,dur*0.4)}).connect(this.out);
    src.onended=()=>{this.active.delete(src);src.dispose();};
    this.active.add(src);
    src.start(time).stop(time+dur);
    return src;
  }
  releaseAll(time=T().now()){this.active.forEach(s=>{try{s.stop(time);}catch(e){}});}
}

// Short, high, woody tick for the metronome
export function makeClick(){
  return new (T().MembraneSynth)({pitchDecay:0.006,octaves:2.5,envelope:{attack:0.001,decay:0.05,sustain:0,release:0.02},volume:-10}).connect(chain.master);
}
export function now(){return T().now();}
export function playNote(note,dur=1.2){chain.sampler.play(note,dur,now()+0.02);}

// Schedule a whole sequence on the Transport so it can be cancelled cleanly.
// events: [{time, note, dur}] (seconds from t0); clicks: [{time, accent}]
export function scheduleSequence({t0,events,clicks=[]}){
  const Tone=T(),tr=Tone.Transport;
  stopAll();
  activeClick=clicks.length?makeClick():null;
  for(const e of events)tr.schedule(time=>chain.sampler.play(e.note,e.dur,time),e.time);
  for(const c of clicks)tr.schedule(time=>activeClick?.triggerAttackRelease(c.accent?'G5':'C5','32n',time),c.time);
  tr.start(t0);
}
export function stopAll(){
  if(!toneAvailable()||!chain)return;
  const tr=T().Transport;
  tr.stop();tr.cancel(0);tr.position=0;
  chain.sampler.releaseAll();
  setTimeout(()=>chain?.sampler.releaseAll(),200);   // anything that slipped in within the lookahead
  activeClick?.dispose();activeClick=null;
}
