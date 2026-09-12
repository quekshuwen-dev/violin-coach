// Profile bar, practice calendar, toast.
import {S,getLog,dateKey,currentStreak,monthStats,$} from './state.js';
import {onAction} from './actions.js';

export function renderProfiles(){
  S.profiles.forEach((p,i)=>{
    const a=$('pav'+i),n=$('pnm'+i);
    if(a)a.textContent=p.avatar;if(n)n.textContent=p.name;
  });
  document.querySelectorAll('.prf-btn').forEach((el,i)=>el.classList.toggle('active',i===S.cur));
}

// ─── Calendar: a tick for every day a scale was played correctly ────
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
let view={y:new Date().getFullYear(),m:new Date().getMonth()};
export function renderCalendar(){
  const grid=$('cal-grid');if(!grid)return;
  const {y,m}=view,log=getLog(S.cur),today=dateKey();
  const first=new Date(y,m,1),startDow=(first.getDay()+6)%7;   // Monday first
  const days=new Date(y,m+1,0).getDate();
  const cells=[];
  for(let i=0;i<startDow;i++)cells.push('<div class="cal-cell empty"></div>');
  for(let d=1;d<=days;d++){
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const e=log[k],tick=e&&e.ticks>0,star=e&&e.stars>0;
    const cls=['cal-cell',k===today?'today':'',tick?'tick':'',star&&!tick?'star':''].filter(Boolean).join(' ');
    const title=e?`${e.ticks} correct scale${e.ticks===1?'':'s'}${e.scales?.length?': '+e.scales.join(', '):''}${e.stars?` · best ${e.stars}★`:''}`:'';
    cells.push(`<div class="${cls}" title="${title}"><span class="cal-day">${d}</span><span class="cal-mark">${tick?'✓':star?'★':''}</span>${tick&&e.ticks>1?`<span class="cal-count">${e.ticks}</span>`:''}</div>`);
  }
  grid.innerHTML=cells.join('');
  $('cal-title').textContent=`${MONTHS[m]} ${y}`;
  const st=monthStats(S.cur,y,m),streak=currentStreak(S.cur);
  $('cal-stats').innerHTML=`<span class="cal-stat">✓ <b>${st.days}</b> day${st.days===1?'':'s'} practised</span><span class="cal-stat">🎼 <b>${st.ticks}</b> scale${st.ticks===1?'':'s'} correct</span><span class="cal-stat">🔥 <b>${streak}</b> day streak</span>`;
}
function calShift(n){view.m+=n;if(view.m<0){view.m=11;view.y--;}if(view.m>11){view.m=0;view.y++;}renderCalendar();}
export function initCalendar(){
  onAction({calPrev:()=>calShift(-1),calNext:()=>calShift(1),calToday:()=>{view={y:new Date().getFullYear(),m:new Date().getMonth()};renderCalendar();}});
}

let toastTimer=null;
export function toast(msg,{action,onAction:cb,ms=6000}={}){
  const el=$('toast');if(!el)return;
  el.innerHTML='';el.append(msg);
  if(action){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{el.classList.remove('show');cb?.();};el.append(b);}
  el.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),ms);
}
