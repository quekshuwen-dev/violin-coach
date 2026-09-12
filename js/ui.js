// Profile bar and weekly star tracker.
import {S,DAYS,getWeekStars,todayIdx,$} from './state.js';

export function renderProfiles(){
  S.profiles.forEach((p,i)=>{
    const a=$('pav'+i),n=$('pnm'+i);
    if(a)a.textContent=p.avatar;if(n)n.textContent=p.name;
  });
  document.querySelectorAll('.prf-btn').forEach((el,i)=>el.classList.toggle('active',i===S.cur));
}
export function renderWeek(){
  const stars=getWeekStars(S.cur),ti=todayIdx(),total=stars.reduce((a,b)=>a+b,0);
  $('week-days').innerHTML=DAYS.map((d,i)=>{
    const s=stars[i]||0,isTd=i===ti,sc=Math.round(s);
    return`<div class="day-cell${isTd?' today':''}"><div class="day-lbl">${d}</div><div class="day-stars">${s>0?'★'.repeat(sc):''}</div>${s>0?`<div class="day-num">${s}★</div>`:'<div class="day-none">–</div>'}</div>`;
  }).join('');
  const wt=$('week-total');if(wt)wt.textContent=`⭐ ${total.toFixed(1)} total`;
}
let toastTimer=null;
export function toast(msg,{action,onAction,ms=6000}={}){
  const el=$('toast');if(!el)return;
  el.innerHTML='';el.append(msg);
  if(action){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{el.classList.remove('show');onAction?.();};el.append(b);}
  el.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),ms);
}
