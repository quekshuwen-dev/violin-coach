// Shared Tone.js signal chain, built once on the first user tap:
//   synth → key-tracked low-pass → vibrato → small room reverb → master
// A sawtooth is rich in harmonics like a bowed string; the filter tames it,
// the slow 5.5 Hz vibrato gives the "singing" quality.
// Tone.js is loaded as a classic script (vendor/Tone.js) and read from window.
const T=()=>window.Tone;

export const VIOLIN_VOICE={
  oscillator:{type:'sawtooth'},
  envelope:{attack:0.06,decay:0.12,sustain:0.85,release:0.3}
};
export let chain=null;
let audioInit=null,tapSynth=null;

export function toneAvailable(){return typeof window.Tone!=='undefined';}

export async function initAudio(){
  if(!toneAvailable())throw new Error('Tone.js missing');
  await T().start();
  if(!audioInit)audioInit=buildAudioChain(); // memoised: rapid taps share one build
  await audioInit;
}
export async function buildAudioChain(){
  const Tone=T();
  const master=new Tone.Volume(-6).toDestination();
  // Convolution reverb: no AudioWorklet, so it works on every origin
  const reverb=new Tone.Reverb({decay:1.4,preDelay:0.01,wet:0.16}).connect(master);
  await reverb.ready;
  const vibrato=new Tone.Vibrato({frequency:5.5,depth:0.05}).connect(reverb);
  const filter=new Tone.Filter({type:'lowpass',frequency:4000,rolloff:-12,Q:0.8}).connect(vibrato);
  chain={master,reverb,vibrato,filter};
  tapSynth=makeViolinSynth();
  return chain;
}
export function makeViolinSynth(){
  return new (T().PolySynth)(T().Synth,VIOLIN_VOICE).connect(chain.filter);
}
// Short, high, woody tick for the metronome
export function makeClick(){
  return new (T().MembraneSynth)({pitchDecay:0.006,octaves:2.5,envelope:{attack:0.001,decay:0.05,sustain:0,release:0.02},volume:-10}).connect(chain.master);
}
// Keep the filter cutoff a fixed number of harmonics above the note so low
// notes are not buzzy and high notes are not muffled.
export function trackFilter(noteName,time){
  const f=T().Frequency(noteName).toFrequency();
  const cutoff=Math.min(9000,Math.max(1800,f*6));
  chain.filter.frequency.setValueAtTime(cutoff,time);
}
export function cancelFilterAutomation(){chain?.filter.frequency.cancelScheduledValues(0);}
export function now(){return T().now();}
export function playTapNote(noteName,dur=0.6){
  const t=now()+0.02;
  trackFilter(noteName,t);
  tapSynth.triggerAttackRelease(noteName,dur,t);
}
