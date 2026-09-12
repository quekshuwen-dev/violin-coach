// Plays a note sequence with count-in, metronome and bubble highlights,
// driven by the audio clock so visuals stay locked to the sound.
import * as A from './audio.js';

let playing=false,stopFlag=false,current=null;
export function isPlaying(){return playing;}

function runClock(t0,count,beat,onStep){
  return new Promise(res=>{
    let last=-1;
    (function tick(){
      if(stopFlag)return res();
      const idx=Math.floor((A.now()-t0)/beat+0.002);
      if(idx>=count)return res();
      if(idx!==last&&idx>=0){last=idx;onStep(idx);}
      requestAnimationFrame(tick);
    })();
  });
}
// seq: note names; bubbles: elements to highlight (index-mapped via mapIndex)
export async function playSequence({seq,bpm,metro=true,countIn=4,bubbles=[],mapIndex=i=>i,accentAt=[],onCount,onEnd}){
  if(playing)return;
  playing=true;stopFlag=false;current={bubbles};
  const beat=60/bpm,noteDur=Math.max(0.15,beat*0.95);
  const t0=A.now()+0.1,t1=countIn*beat;
  const clicks=[],events=[];
  if(metro)for(let c=0;c<countIn;c++)clicks.push({time:c*beat,accent:c===0});
  seq.forEach((note,i)=>{
    const time=t1+i*beat;
    if(metro)clicks.push({time,accent:i===0||accentAt.includes(i)});
    events.push({time,note,dur:noteDur});
  });
  A.scheduleSequence({t0,events,clicks});
  if(countIn>0)await runClock(t0,countIn,beat,i=>onCount?.(countIn-i));
  if(!stopFlag){
    onCount?.(0);
    await runClock(t0+t1,seq.length+1,beat,i=>{
      const hl=i<seq.length?mapIndex(i):-1;
      bubbles.forEach((el,j)=>el.classList.toggle('playing',j===hl));
    });
  }
  finish();onEnd?.();
}
function finish(){
  A.stopAll();
  current?.bubbles.forEach(el=>el.classList.remove('playing'));
  playing=false;current=null;
}
export function stopPlayback(){if(!playing)return;stopFlag=true;finish();}
