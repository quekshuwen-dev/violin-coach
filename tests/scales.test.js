import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as D from '../js/scales-data.js';
import {noteToMidi} from '../js/notes.js';

const PAT={major:[2,2,1,2,2,2,1],natural:[2,1,2,2,1,2,2],harmonic:[2,1,2,2,1,3,1],melodic:[2,1,2,2,2,2,1],
  chromatic:[1],majArp:[4,3,5],minArp:[3,4,5],dom7Arp:[4,3,3,2],dim7Arp:[3,3,3,3]};
const G3=55,G7=103;

function checkScale(label,type,d){
  const a=d.asc.map(noteToMidi),ds=d.desc.map(noteToMidi),p=PAT[type];
  for(let i=1;i<a.length;i++)assert.equal(a[i]-a[i-1],p[(i-1)%p.length],`${label}: asc ${d.asc[i-1]}→${d.asc[i]}`);
  const rev=[...(type==='melodic'?PAT.natural:p)].reverse();
  for(let i=1;i<ds.length;i++)assert.equal(ds[i-1]-ds[i],rev[(i-1)%rev.length],`${label}: desc ${d.desc[i-1]}→${d.desc[i]}`);
  assert.equal(a[0],ds[ds.length-1],`${label}: endpoints`);
  assert.equal(a[a.length-1],ds[0],`${label}: top`);
  if(type!=='melodic')assert.deepEqual(ds,[...a].reverse(),`${label}: desc mirrors asc`);
  assert.ok(a[0]>=G3,`${label}: starts below open G`);
  assert.ok(a[a.length-1]<=G7,`${label}: above G7`);
}

test('beginner major scales',()=>{for(const k in D.BEGINNER_SCALES)checkScale('beginner '+k,'major',D.BEGINNER_SCALES[k]);});
test('intermediate major scales',()=>{for(const k in D.INTERMEDIATE_MAJOR)checkScale('inter '+k,'major',D.INTERMEDIATE_MAJOR[k]);});
test('intermediate minor scales (3 forms)',()=>{
  for(const k in D.INTERMEDIATE_MINOR)for(const f of ['natural','harmonic','melodic'])checkScale(`inter ${f} ${k}`,f,D.INTERMEDIATE_MINOR[k][f]);
});
test('advanced 3-octave scales',()=>{
  for(const k in D.ADVANCED_MAJOR)checkScale('adv major '+k,'major',D.ADVANCED_MAJOR[k]);
  for(const k in D.ADVANCED_NATURAL_MINOR)checkScale('adv natural '+k,'natural',D.ADVANCED_NATURAL_MINOR[k]);
  for(const k in D.ADVANCED_HARMONIC_MINOR)checkScale('adv harmonic '+k,'harmonic',D.ADVANCED_HARMONIC_MINOR[k]);
  for(const k in D.ADVANCED_MELODIC_MINOR)checkScale('adv melodic '+k,'melodic',D.ADVANCED_MELODIC_MINOR[k]);
  checkScale('chromatic','chromatic',D.CHROMATIC_3OCT);
});
test('arpeggios',()=>{
  for(const k in D.MAJOR_ARPEGGIO)checkScale('majArp '+k,'majArp',D.MAJOR_ARPEGGIO[k]);
  for(const k in D.MINOR_ARPEGGIO)checkScale('minArp '+k,'minArp',D.MINOR_ARPEGGIO[k]);
  for(const k in D.DOM7_ARPEGGIO)checkScale('dom7 '+k,'dom7Arp',D.DOM7_ARPEGGIO[k]);
  for(const k in D.DIM7_ARPEGGIO)checkScale('dim7 '+k,'dim7Arp',D.DIM7_ARPEGGIO[k]);
});
test('every level/type/key resolves to data',()=>{
  for(const level of Object.keys(D.LEVEL_TYPES))for(const {id:type} of D.LEVEL_TYPES[level]){
    const keys=D.getAvailableKeys(level,type);
    if(type==='chromatic'){assert.deepEqual(keys,[]);assert.ok(D.getScaleData(level,type,'C').asc.length);continue;}
    assert.ok(keys.length>0,`${level}/${type} has keys`);
    for(const k of keys){const d=D.getScaleData(level,type,k);assert.ok(d&&d.asc&&d.desc,`${level}/${type}/${k}`);}
  }
});
