// Persistent app state (localStorage) and small shared helpers.
export const DAYS=['Mon','Tue','Wed','Thu','Fri'];
export const AVATARS=['🧒','👧','🧒‍♀️','🎻','🌟','🎵','🎶','🦋','🌈','🐰','🦊','🐬','🎀','🌸','🎠'];
const KEY='vsc3';

export const S={
  profiles:[
    {name:'Player 1',avatar:'🧒',stars:{},log:{}},
    {name:'Player 2',avatar:'👧',stars:{},log:{}},
    {name:'Player 3',avatar:'🌟',stars:{},log:{}}
  ],
  cur:0,gemKey:'',tab:'practice',inputMode:'check',
  scLevel:'beginner',scType:'major',scKey:'C',scBpm:60,setupDone:false,
  setupAvatars:['🧒','👧','🌟'],
  a4:440,          // reference pitch in Hz (440 standard, 442/443 common in orchestras)
  pureFifths:false // tune open strings in perfect fifths from A instead of equal temperament
};

export function loadS(){
  try{
    const d=localStorage.getItem(KEY);
    if(d){
      Object.assign(S,JSON.parse(d));
      while(S.profiles.length<3)S.profiles.push({name:'Player '+(S.profiles.length+1),avatar:'🌟',stars:{},log:{}});
      S.profiles.forEach(p=>{p.stars=p.stars||{};p.log=p.log||{};});
      if(!(S.a4>=400&&S.a4<=480))S.a4=440;
    }
  }catch(e){/* corrupted storage: keep defaults */}
}
export function saveS(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
export function clearS(){try{localStorage.removeItem(KEY);}catch(e){}}

// ─── Dates ──────────────────────────────────────────────
const pad=n=>String(n).padStart(2,'0');
export function dateKey(d=new Date()){return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
export function weekKey(){
  const n=new Date(),d=n.getDay(),m=new Date(n);
  m.setDate(n.getDate()-(d===0?6:d-1));
  return dateKey(m);
}
export function todayIdx(){const d=new Date().getDay();return(d===0||d===6)?-1:d-1;}
export function getWeekStars(pi){
  const wk=weekKey(),p=S.profiles[pi];
  if(!p.stars[wk])return[0,0,0,0,0];
  return DAYS.map((_,i)=>p.stars[wk][i]||0);
}
export function setDayStars(pi,di,v){
  const wk=weekKey(),p=S.profiles[pi];
  if(!p.stars[wk])p.stars[wk]={};
  p.stars[wk][di]=Math.max(p.stars[wk][di]||0,v);
  saveS();
}

// ─── Practice log (per profile, per day) ────────────────
// log[YYYY-MM-DD] = {stamps, stars, scales:[label]}
// A stamp = a scale (live check, camera or uploaded video) analysed at 3+ stars.
export function logPractice(pi,{stamp=false,stars=0,label=''}={},date=new Date()){
  const p=S.profiles[pi],k=dateKey(date);
  const e=p.log[k]||(p.log[k]={stamps:0,stars:0,scales:[]});
  if(e.ticks&&!e.stamps){e.stamps=e.ticks;delete e.ticks;}   // migrate v2.1 entries
  if(stamp){e.stamps=(e.stamps||0)+1;if(label&&!e.scales.includes(label))e.scales.push(label);}
  e.stars=Math.max(e.stars||0,stars||0);
  const di=todayIdx();if(di>=0&&stars>0&&k===dateKey())setDayStars(pi,di,stars);
  saveS();
  return e;
}
export function getLog(pi){const log=S.profiles[pi].log||{};for(const k in log){const e=log[k];if(e.ticks&&!e.stamps){e.stamps=e.ticks;delete e.ticks;}}return log;}
// Consecutive days with a tick, ending today or yesterday
export function currentStreak(pi,today=new Date()){
  const log=getLog(pi);let d=new Date(today);let n=0;
  if(!(log[dateKey(d)]?.stamps>0))d.setDate(d.getDate()-1);
  while(log[dateKey(d)]?.stamps>0){n++;d.setDate(d.getDate()-1);}
  return n;
}
export function monthStats(pi,year,month){
  const log=getLog(pi);let days=0,stamps=0;
  for(const k in log){const [y,m]=k.split('-').map(Number);if(y===year&&m===month+1&&log[k].stamps>0){days++;stamps+=log[k].stamps;}}
  return{days,stamps};
}
export function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
export const $=id=>document.getElementById(id);
