// Scale Check engine: turns a stream of pitch frames into note events, then
// matches those events against the expected scale and grades each note.
// Pure logic, no DOM, covered by tests/notecheck.test.js.
import {freqToMidi,noteToMidi,parseNote,midiToName} from './notes.js';

export const IN_TUNE_CENTS=15;   // green
export const CLOSE_CENTS=35;     // amber "a little flat/sharp"; beyond that "quite flat/sharp"

const median=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};

// ─── Frames → note events ───────────────────────────────
// push(frame, tMs) with frame = {freq, clarity} or null. Emits:
//   {type:'onset', id, midi, cents}  once a pitch has held for minMs
//   {type:'update', id, midi, cents} while it keeps sounding (better cents estimate)
//   {type:'end', id, midi, cents}    when it stops or changes
export class NoteTracker{
  constructor({a4=440,minMs=110,gapMs=90,minClarity=0.86}={}){
    Object.assign(this,{a4,minMs,gapMs,minClarity});this.reset();
  }
  reset(){this.run=null;this.seq=0;}
  push(frame,t){
    const run=this.run;
    if(frame&&frame.clarity>=this.minClarity){
      const m=freqToMidi(frame.freq,this.a4),midi=Math.round(m),cents=(m-midi)*100;
      if(run&&run.midi===midi){
        run.cents.push(cents);run.last=t;
        if(!run.emitted&&t-run.start>=this.minMs){run.emitted=true;return{type:'onset',id:run.id,midi,cents:median(run.cents)};}
        if(run.emitted)return{type:'update',id:run.id,midi,cents:median(run.cents)};
        return null;
      }
      const ended=run&&run.emitted?{type:'end',id:run.id,midi:run.midi,cents:median(run.cents)}:null;
      this.run={midi,cents:[cents],start:t,last:t,emitted:false,id:++this.seq};
      return ended;
    }
    if(run&&t-run.last>this.gapMs){
      this.run=null;
      return run.emitted?{type:'end',id:run.id,midi:run.midi,cents:median(run.cents)}:null;
    }
    return null;
  }
}

// ─── Grading ────────────────────────────────────────────
export function grade(cents){
  if(Math.abs(cents)<=IN_TUNE_CENTS)return'ok';
  return cents<0?'flat':'sharp';
}
const FLAT_NAMES=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const SHARP_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const GLYPH={'#':'♯','b':'♭','x':'𝄪','##':'𝄪','bb':'𝄫','':''};
export function prettyName(name){const p=parseNote(name);return p?`${p.letter}${GLYPH[p.acc]}${p.oct}`:name;}
export function spellMidi(midi,preferFlats){
  const names=preferFlats?FLAT_NAMES:SHARP_NAMES;
  return prettyName(names[((midi%12)+12)%12]+(Math.floor(midi/12)-1));
}

// ─── Expected sequence → per-note results ───────────────
// statuses: pending | trying | ok | flat | sharp | wrong | octave | missed | notPlayed
export class ScaleMatcher{
  constructor(expectedNames){
    this.names=expectedNames;
    this.expected=expectedNames.map(noteToMidi);
    this.preferFlats=expectedNames.some(n=>/b\d/.test(n));
    this.results=this.expected.map(()=>({status:'pending',attempts:[]}));
    this.index=0;this.done=false;this.last=null;
  }
  _set(i,status,ev){const r=this.results[i];r.status=status;r.playedMidi=ev.midi;r.cents=ev.cents;this.last={index:i,id:ev.id};}
  onEvent(ev){
    const changed=[];
    if(!ev||this.done&&ev.type==='onset')return{changed,done:this.done};
    if(ev.type!=='onset'){
      // refine intonation of the note we matched from this same sounding event
      if(this.last&&this.last.id===ev.id){
        const r=this.results[this.last.index];
        if(['ok','flat','sharp'].includes(r.status)){r.cents=ev.cents;r.status=grade(ev.cents);changed.push(this.last.index);}
      }
      return{changed,done:this.done};
    }
    const i=this.index,exp=this.expected[i],n=this.expected.length;
    if(ev.midi===exp){
      this._set(i,grade(ev.cents),ev);this.index=i+1;changed.push(i);
    }else if(i>0&&ev.midi===this.expected[i-1]){
      // re-bowed the previous note: ignore
      this.last=null;
    }else if(i+1<n&&ev.midi===this.expected[i+1]){
      const r=this.results[i];
      r.status=r.attempts.length?'wrong':'missed';
      this._set(i+1,grade(ev.cents),ev);this.index=i+2;changed.push(i,i+1);
    }else if(Math.abs(ev.midi-exp)===12){
      this._set(i,'octave',ev);this.index=i+1;changed.push(i);
    }else{
      const r=this.results[i];r.attempts.push({midi:ev.midi,cents:ev.cents});r.status='trying';r.playedMidi=ev.midi;
      this.last=null;changed.push(i);
    }
    this.done=this.index>=n;
    return{changed,done:this.done};
  }
  // Called when the child stops or time runs out
  finish(){
    this.results.forEach((r,i)=>{
      if(r.status==='trying')r.status='wrong';
      else if(r.status==='pending')r.status='notPlayed';
    });
    this.done=true;
    return this.summary();
  }
  summary(){
    const rs=this.results,total=rs.length;
    const count=s=>rs.filter(r=>s.includes(r.status)).length;
    const right=count(['ok','flat','sharp']),inTune=count(['ok']);
    const played=total-count(['notPlayed']);
    const wrong=count(['wrong','octave']),missed=count(['missed']),notPlayed=count(['notPlayed']);
    let stars=0;
    if(played>0){
      const frac=right/total,tuneFrac=inTune/Math.max(1,right);
      if(right===total&&tuneFrac>=0.9)stars=5;
      else if(right===total&&tuneFrac>=0.7)stars=4.5;
      else if(right===total)stars=4;
      else if(frac>=0.75)stars=3;
      else if(frac>=0.5)stars=2;
      else stars=1;
    }
    return{stars,total,played,right,inTune,wrong,missed,notPlayed,comments:this.comments({stars,right,inTune,total,played})};
  }
  comments({stars,right,inTune,total,played}){
    const out=[];const name=i=>prettyName(this.names[i]);
    const spell=m=>spellMidi(m,this.preferFlats);
    if(played===0){out.push({icon:'🎻',text:'I did not hear any notes. Stand close to the microphone and bow each note slowly.'});return out;}
    if(right===total&&inTune===total)out.push({icon:'🌟',text:'Every note was right and in tune. Superstar!'});
    else if(right===total)out.push({icon:'✅',text:`All ${total} notes were the right notes! Now let's polish the tuning.`});
    else out.push({icon:'💪',text:`${right} of ${total} notes were right. Keep going, you are getting there!`});
    let shown=0;
    this.results.forEach((r,i)=>{
      if(shown>=4)return;
      const nm=name(i),abs=Math.abs(r.cents||0),how=abs>CLOSE_CENTS?'quite':'a little';
      const p=parseNote(this.names[i]);
      switch(r.status){
        case'flat':out.push({icon:'↓',text:`${nm} was ${how} flat. Slide that finger a tiny bit towards the bridge.`});shown++;break;
        case'sharp':out.push({icon:'↑',text:`${nm} was ${how} sharp. Move that finger a tiny bit back towards the scroll.`});shown++;break;
        case'wrong':{
          let hint='';
          if(p.acc==='#')hint=` Remember: ${p.letter} is sharp (♯) in this scale, so the finger sits a little higher.`;
          else if(p.acc==='b')hint=` Remember: ${p.letter} is flat (♭) in this scale, so the finger sits a little lower.`;
          else if(r.playedMidi!==undefined&&Math.abs(r.playedMidi-this.expected[i])===1)hint=' That finger was just a half step off. Sing the note first, then play it.';
          out.push({icon:'✗',text:`You played ${spell(r.playedMidi)} where ${nm} belongs.${hint}`});shown++;break;
        }
        case'octave':out.push({icon:'↕',text:`${nm} came out an octave too ${r.playedMidi>this.expected[i]?'high':'low'}. Check you are on the right string.`});shown++;break;
        case'missed':out.push({icon:'⏭',text:`You skipped ${nm}. Try to play every note in order.`});shown++;break;
      }
    });
    const firstNP=this.results.findIndex(r=>r.status==='notPlayed');
    if(firstNP>=0)out.push({icon:'🏁',text:`You stopped before ${name(firstNP)}. Next time keep going all the way up and back down!`});
    if(stars>=4&&inTune<total)out.push({icon:'👂',text:'Listen to the reference scale once more, then match each note.'});
    return out;
  }
  // Plain-text report for the AI teacher prompt
  report(){
    const s=this.summary();
    const lines=this.results.map((r,i)=>{
      const nm=prettyName(this.names[i]);
      const c=r.cents!==undefined?` (${r.cents>=0?'+':''}${r.cents.toFixed(0)} cents)`:'';
      const played=r.playedMidi!==undefined&&['wrong','octave'].includes(r.status)?` played ${spellMidi(r.playedMidi,this.preferFlats)}`:'';
      return`${nm}: ${r.status}${c}${played}`;
    });
    return`Scale check: ${s.right}/${s.total} right notes, ${s.inTune} in tune, ${s.wrong} wrong, ${s.missed} skipped, ${s.notPlayed} not played, ${s.stars} stars.\n`+lines.join('\n');
  }
}
