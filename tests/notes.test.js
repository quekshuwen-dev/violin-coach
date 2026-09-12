import {test} from 'node:test';
import assert from 'node:assert/strict';
import {noteToMidi,normNote,dispNote,freqToNote,midiToFreq,stringTargets,centsBetween} from '../js/notes.js';

test('enharmonic spellings map to the right midi note',()=>{
  assert.equal(noteToMidi('A4'),69);
  assert.equal(noteToMidi('Cb5'),noteToMidi('B4'));
  assert.equal(noteToMidi('B#4'),noteToMidi('C5'));
  assert.equal(noteToMidi('Fx4'),noteToMidi('G4'));
  assert.equal(noteToMidi('Bbb4'),noteToMidi('A4'));
  assert.equal(noteToMidi('Fb4'),noteToMidi('E4'));
});
test('normNote respells with sharps and fixes the octave',()=>{
  assert.equal(normNote('Cb5'),'B4');
  assert.equal(normNote('B#4'),'C5');
  assert.equal(normNote('Ab4'),'G#4');
  assert.equal(normNote('Ebb5'),'D5');
});
test('dispNote uses proper accidental glyphs',()=>{
  assert.equal(dispNote('Ab4'),'A♭');assert.equal(dispNote('F#5'),'F♯');
  assert.equal(dispNote('Fx5'),'F𝄪');assert.equal(dispNote('Bbb4'),'B𝄫');assert.equal(dispNote('C4'),'C');
});
test('freqToNote and cents',()=>{
  const n=freqToNote(440);assert.equal(n.name,'A');assert.equal(n.oct,4);assert.ok(Math.abs(n.cents)<1e-9);
  const g=freqToNote(196);assert.equal(g.name,'G');assert.equal(g.oct,3);assert.ok(Math.abs(g.cents)<0.1);
  const sharp=freqToNote(442);assert.equal(sharp.name,'A');assert.ok(sharp.cents>7.8&&sharp.cents<7.9);
  // with A4 = 442 the same frequency is dead centre
  assert.ok(Math.abs(freqToNote(442,442).cents)<1e-9);
  assert.ok(Math.abs(midiToFreq(76)-659.255)<0.01);
});
test('open string targets: equal temperament vs pure fifths',()=>{
  const et=stringTargets(440,false),pure=stringTargets(440,true);
  const f=n=>et.find(s=>s.name===n).freq,p=n=>pure.find(s=>s.name===n).freq;
  assert.ok(Math.abs(f('G')-196.00)<0.01);assert.ok(Math.abs(f('D')-293.66)<0.01);assert.ok(Math.abs(f('E')-659.26)<0.01);
  assert.ok(Math.abs(p('E')-660)<1e-9);assert.ok(Math.abs(p('D')-293.333)<0.001);assert.ok(Math.abs(p('G')-195.556)<0.001);
  assert.ok(Math.abs(centsBetween(p('E'),f('E'))-1.955)<0.01);
  assert.ok(Math.abs(centsBetween(p('G'),f('G'))+3.910)<0.01);
});
