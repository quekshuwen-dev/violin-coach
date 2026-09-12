// Note names, spelling, and pitch maths. Pure functions, no DOM.
export const CHROMATIC=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const ACC={'':0,'#':1,'b':-1,'x':2,'##':2,'bb':-2};
const NOTE_RE=/^([A-G])(x|##|bb|#|b)?(-?\d+)$/;

export function parseNote(str){
  const m=String(str).match(NOTE_RE);
  if(!m)return null;
  return{letter:m[1],acc:m[2]||'',oct:parseInt(m[3],10)};
}
// "Cb5" -> 71 (B4), "B#4" -> 72 (C5), "Fx4" -> 67 (G4)
export function noteToMidi(str){
  const p=parseNote(str);
  if(!p)throw new Error('Bad note: '+str);
  return (p.oct+1)*12+SEMI[p.letter]+ACC[p.acc];
}
export function midiToName(midi){
  return CHROMATIC[((midi%12)+12)%12]+(Math.floor(midi/12)-1);
}
// Respell any note with sharps only, the form the synth accepts
export function normNote(str){
  return parseNote(str)?midiToName(noteToMidi(str)):str;
}
// "Ab4" -> "A♭", "Fx5" -> "F𝄪", "Bbb4" -> "B𝄫"
export function dispNote(str){
  const p=parseNote(str);
  if(!p)return str;
  const sym={'':'','#':'♯','b':'♭','x':'𝄪','##':'𝄪','bb':'𝄫'}[p.acc];
  return p.letter+sym;
}
export function noteOctave(str){const p=parseNote(str);return p?p.oct:4;}

export function midiToFreq(midi,a4=440){return a4*Math.pow(2,(midi-69)/12);}
export function freqToMidi(freq,a4=440){return 69+12*Math.log2(freq/a4);}
export function centsBetween(freq,target){return 1200*Math.log2(freq/target);}
// Nearest equal-tempered note to a frequency
export function freqToNote(freq,a4=440){
  const m=freqToMidi(freq,a4),r=Math.round(m);
  return{name:CHROMATIC[((r%12)+12)%12],oct:Math.floor(r/12)-1,midi:r,cents:(m-r)*100,freq};
}

// Violin open strings. `pure` is the ratio to A4 when tuned in perfect
// (3:2) fifths by ear, which is how violinists actually tune: E is ~2 cents
// above equal temperament, D ~2 cents below, G ~4 cents below.
export const VIOLIN_STRINGS=[
  {name:'G',midi:55,pure:4/9},
  {name:'D',midi:62,pure:2/3},
  {name:'A',midi:69,pure:1},
  {name:'E',midi:76,pure:3/2}
];
export function stringTargets(a4=440,pureFifths=false){
  return VIOLIN_STRINGS.map(s=>({...s,freq:pureFifths?a4*s.pure:midiToFreq(s.midi,a4)}));
}
