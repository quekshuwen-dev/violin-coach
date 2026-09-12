// Shared rendering of a scale analysis result (live Scale Check and video analysis).
import {prettyName,spellMidi} from './notecheck.js';

export const STAMP_MIN_STARS=3;
export function earnsStamp(summary){return summary.played>0&&summary.stars>=STAMP_MIN_STARS;}
export function starsHTML(stars){
  return[1,2,3,4,5].map(i=>{const lit=i<=Math.floor(stars)||(stars%1>=0.5&&i===Math.floor(stars)+1);return`<span class="star-ic ${lit?'star-full':'star-empty'}">${lit?'★':'☆'}</span>`;}).join('');
}
export function resultHTML({matcher,summary,names,stamp,extra=''}){
  const legend=`<div class="sc-legend"><span class="lg nb-ok">in tune</span><span class="lg nb-flat">flat ↓</span><span class="lg nb-sharp">sharp ↑</span><span class="lg nb-wrong">wrong</span><span class="lg nb-missed">skipped</span></div>`;
  const notes=matcher.results.map((r,i)=>{
    const nm=prettyName(names[i]);
    const c=['ok','flat','sharp'].includes(r.status)?` <small>${r.cents>=0?'+':'−'}${Math.abs(r.cents).toFixed(0)}¢</small>`:'';
    const played=['wrong','octave'].includes(r.status)?` <small>→ ${spellMidi(r.playedMidi,matcher.preferFlats)}</small>`:'';
    return`<span class="sc-note nb-${r.status==='notPlayed'?'missed':r.status}">${nm}${c}${played}</span>`;
  }).join('');
  const head=stamp?`<div class="sc-tick">🏅 Stamp earned! ${summary.stars} stars — it's on your calendar</div>`
    :summary.played===0?'':`<div class="sc-nostamp">Score ${STAMP_MIN_STARS} stars or more to earn a stamp. Keep practising!</div>`;
  return`${head}
    <div class="sc-score"><div class="stars-row">${starsHTML(summary.stars)}</div><div class="sc-score-txt">${summary.stars} / 5 · ${summary.right} of ${summary.total} right · ${summary.inTune} in tune</div></div>
    <div class="sc-comments">${summary.comments.map(c=>`<p><span class="sc-ico">${c.icon}</span>${c.text}</p>`).join('')}</div>
    ${legend}<div class="sc-notes">${notes}</div>${extra}`;
}
