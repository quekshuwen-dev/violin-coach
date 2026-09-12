import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NoteTracker,ScaleMatcher,grade} from '../js/notecheck.js';
import {midiToFreq,noteToMidi} from '../js/notes.js';

// Simulate a child playing: [note, cents, ms] with silence gaps, 16 ms frames
function play(matcher,plan,{a4=440}={}){
  const tr=new NoteTracker({a4});let t=0;const events=[];
  const step=(frame)=>{const ev=tr.push(frame,t);t+=16;if(ev){events.push(ev);matcher.onEvent(ev);}};
  for(const [note,cents,ms] of plan){
    const midi=typeof note==='number'?note:noteToMidi(note);
    const f=midiToFreq(midi+cents/100,a4);
    for(let i=0;i<ms/16;i++)step({freq:f*(1+(Math.random()-0.5)*0.0004),clarity:0.98});
    for(let i=0;i<12;i++)step(null);   // ~190 ms gap
  }
  for(let i=0;i<20;i++)step(null);
  return events;
}
const D_MAJOR=['D4','E4','F#4','G4','A4','B4','C#5','D5'];
const statuses=m=>m.results.map(r=>r.status);

test('grade thresholds',()=>{
  assert.equal(grade(0),'ok');assert.equal(grade(15),'ok');assert.equal(grade(-16),'flat');assert.equal(grade(20),'sharp');
});
test('tracker: a held pitch gives one onset, updates, then an end; short blips are ignored',()=>{
  const tr=new NoteTracker();let t=0;const types=[];
  for(let i=0;i<30;i++){const e=tr.push({freq:440,clarity:0.99},t);t+=16;if(e)types.push(e.type);}
  for(let i=0;i<10;i++){const e=tr.push(null,t);t+=16;if(e)types.push(e.type);}
  assert.equal(types[0],'onset');assert.equal(types[types.length-1],'end');assert.ok(types.filter(x=>x==='onset').length===1);
  // 3 frames (48 ms) of a stray pitch: no event at all
  const tr2=new NoteTracker();t=0;let got=null;
  for(let i=0;i<3;i++){got=tr2.push({freq:660,clarity:0.99},t)||got;t+=16;}
  for(let i=0;i<10;i++){got=tr2.push(null,t)||got;t+=16;}
  assert.equal(got,null);
});
test('perfect D major scale: all ok, 5 stars',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,D_MAJOR.map(n=>[n,0,500]));
  assert.ok(m.done);assert.deepEqual(statuses(m),Array(8).fill('ok'));
  const s=m.finish();assert.equal(s.stars,5);assert.equal(s.right,8);assert.equal(s.inTune,8);
  assert.match(s.comments[0].text,/Superstar/);
});
test('flat and sharp notes are graded with cents and a finger tip',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['E4',0,500],['F#4',-28,500],['G4',0,500],['A4',22,500],['B4',0,500],['C#5',0,500],['D5',0,500]]);
  const st=statuses(m);assert.equal(st[2],'flat');assert.equal(st[4],'sharp');
  assert.ok(Math.abs(m.results[2].cents+28)<3,'cents of F# '+m.results[2].cents);
  const s=m.finish();assert.equal(s.stars,4.5);
  assert.ok(s.comments.some(c=>/F♯4 was a little flat.*bridge/.test(c.text)));
  assert.ok(s.comments.some(c=>/A4 was a little sharp.*scroll/.test(c.text)));
});
test('wrong note then correction counts as right; wrong note then moving on counts as wrong',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['E4',0,500],['F4',0,400],['F#4',0,500],['G4',0,500],['A4',0,500],['C5',0,400],['C#5',0,500],['D5',0,500]]);
  // B4 was replaced by C5 then the child went on to C#5
  const st=statuses(m);
  assert.equal(st[2],'ok','F natural then F# corrected');
  assert.equal(st[5],'wrong');assert.equal(m.results[5].playedMidi,noteToMidi('C5'));
  assert.equal(st[6],'ok');assert.equal(st[7],'ok');
  const s=m.finish();
  assert.ok(s.comments.some(c=>/You played C5 where B4 belongs/.test(c.text)),JSON.stringify(s.comments));
});
test('sharp-key hint appears when a sharp note is played natural and skipped',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['E4',0,500],['F4',0,500],['G4',0,500],['A4',0,500],['B4',0,500],['C#5',0,500],['D5',0,500]]);
  assert.equal(statuses(m)[2],'wrong');
  const s=m.finish();assert.ok(s.comments.some(c=>/F is sharp \(♯\)/.test(c.text)));
});
test('skipped note is marked missed; re-bowing the same note is ignored',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['D4',0,300],['E4',0,500],['G4',0,500],['A4',0,500],['B4',0,500],['C#5',0,500],['D5',0,500]]);
  const st=statuses(m);assert.equal(st[2],'missed');assert.equal(st[3],'ok');
  assert.ok(m.finish().comments.some(c=>/skipped F♯4/.test(c.text)));
});
test('octave error is reported',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['E4',0,500],['F#4',0,500],['G5',0,500],['A4',0,500],['B4',0,500],['C#5',0,500],['D5',0,500]]);
  assert.equal(statuses(m)[3],'octave');
  assert.ok(m.finish().comments.some(c=>/G4 came out an octave too high/.test(c.text)));
});
test('stopping early marks the rest notPlayed and lowers the score',()=>{
  const m=new ScaleMatcher(D_MAJOR);
  play(m,[['D4',0,500],['E4',0,500],['F#4',0,500],['G4',0,500]]);
  const s=m.finish();
  assert.deepEqual(statuses(m).slice(4),Array(4).fill('notPlayed'));
  assert.equal(s.stars,2);assert.ok(s.comments.some(c=>/stopped before A4/.test(c.text)));
});
test('flat-key scale spells wrong notes with flats and reports at A4=442',()=>{
  const names=['F4','G4','A4','Bb4','C5','D5','E5','F5'];
  const m=new ScaleMatcher(names);
  play(m,[['F4',0,500],['G4',0,500],['A4',0,500],['B4',0,500],['C5',0,500],['D5',0,500],['E5',0,500],['F5',0,500]],{a4:442});
  assert.equal(statuses(m)[3],'wrong');
  const s=m.finish();
  assert.ok(s.comments.some(c=>/You played B4 where B♭4 belongs.*flat \(♭\)/.test(c.text)),JSON.stringify(s.comments));
  assert.match(m.report(),/Scale check: 7\/8 right notes/);
});
test('nothing played',()=>{
  const m=new ScaleMatcher(D_MAJOR);play(m,[]);const s=m.finish();
  assert.equal(s.stars,0);assert.match(s.comments[0].text,/did not hear/);
});
