// Persistent app state (localStorage) and small shared helpers.
export const DAYS=['Mon','Tue','Wed','Thu','Fri'];
export const AVATARS=['🧒','👧','🧒‍♀️','🎻','🌟','🎵','🎶','🦋','🌈','🐰','🦊','🐬','🎀','🌸','🎠'];
const KEY='vsc3';

export const S={
  profiles:[
    {name:'Player 1',avatar:'🧒',stars:{}},
    {name:'Player 2',avatar:'👧',stars:{}},
    {name:'Player 3',avatar:'🌟',stars:{}}
  ],
  cur:0,gemKey:'',tab:'practice',
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
      while(S.profiles.length<3)S.profiles.push({name:'Player '+(S.profiles.length+1),avatar:'🌟',stars:{}});
      if(!(S.a4>=400&&S.a4<=480))S.a4=440;
    }
  }catch(e){/* corrupted storage: keep defaults */}
}
export function saveS(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
export function clearS(){try{localStorage.removeItem(KEY);}catch(e){}}

export function weekKey(){
  const n=new Date(),d=n.getDay(),m=new Date(n);
  m.setDate(n.getDate()-(d===0?6:d-1));
  return`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}-${String(m.getDate()).padStart(2,'0')}`;
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
export function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
export const $=id=>document.getElementById(id);
