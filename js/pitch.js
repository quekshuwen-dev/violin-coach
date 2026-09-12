// Pitch detection: McLeod Pitch Method (normalised square difference).
//
// The NSDF is a normalised autocorrelation that peaks at exactly 1.0 for a
// perfectly periodic signal at its true period, and lower at multiples of
// the period. Picking the first key maximum that is close to the global
// maximum avoids the octave errors of plain autocorrelation, and parabolic
// interpolation around the peak gives sub-sample resolution.
//
// Precision refinement: noise jitters a peak's position by roughly the same
// number of samples whichever multiple of the period it sits at, so locating
// the peak at k periods and dividing by k shrinks the error k times. We use
// the furthest multiple that still overlaps at least half the window.
//
// Returns {freq, clarity} or null. clarity is 0..1; treat < 0.9 as unsure.
export function detectPitch(input,sampleRate,opts={}){
  const{minFreq=120,maxFreq=2800,threshold=0.9,minRms=0.005}=opts;
  const n=input.length;
  // Remove DC offset
  let mean=0;for(let i=0;i<n;i++)mean+=input[i];mean/=n;
  const x=new Float32Array(n);
  const pe=new Float64Array(n+1);            // prefix energy: pe[i] = sum x[j]^2, j<i
  for(let i=0;i<n;i++){x[i]=input[i]-mean;pe[i+1]=pe[i]+x[i]*x[i];}
  const energy=pe[n];
  if(Math.sqrt(energy/n)<minRms)return null;

  const minLag=Math.max(2,Math.floor(sampleRate/maxFreq));
  const maxLag=Math.min(Math.ceil(sampleRate/minFreq),(n>>1)-2);
  if(maxLag<=minLag)return null;

  // nsdf(tau) = 2*r(tau) / m(tau), m(tau) = sum over the overlap of x[j]^2 + x[j+tau]^2
  const nsdfAt=tau=>{
    const lim=n-tau;let r=0;
    for(let j=0;j<lim;j++)r+=x[j]*x[j+tau];
    const m=pe[lim]+energy-pe[tau];
    return m>0?(2*r)/m:0;
  };
  const nsdf=new Float32Array(maxLag+2);
  nsdf[0]=1;
  for(let tau=1;tau<=maxLag+1;tau++)nsdf[tau]=nsdfAt(tau);

  // Key maxima: highest point of each positive lobe after the first zero crossing
  const peaks=[];
  let tau=1;
  while(tau<maxLag&&nsdf[tau]>0)tau++;
  while(tau<maxLag){
    while(tau<maxLag&&nsdf[tau]<=0)tau++;
    let best=-Infinity,bestTau=-1;
    while(tau<maxLag&&nsdf[tau]>0){if(nsdf[tau]>best){best=nsdf[tau];bestTau=tau;}tau++;}
    if(bestTau>=minLag)peaks.push({tau:bestTau,val:best});
  }
  if(!peaks.length)return null;
  let mx=0;for(const p of peaks)if(p.val>mx)mx=p.val;
  const chosen=peaks.find(p=>p.val>=threshold*mx);
  if(!chosen||chosen.val<0.3)return null;

  const interp=(a,b,c)=>{const d=a-2*b+c;return d!==0?Math.max(-1,Math.min(1,0.5*(a-c)/d)):0;};
  const t=chosen.tau,a=nsdf[t-1],b=nsdf[t],c=nsdf[t+1];
  const shift=interp(a,b,c);
  let period=t+shift;
  const clarity=Math.max(0,Math.min(1,b-0.25*(a-c)*shift));

  // Refine from the furthest clean multiple of the period (>= half-window overlap)
  const kMax=Math.floor((n>>1)/period);
  for(let k=kMax;k>=2;k--){
    const center=Math.round(k*period),half=Math.max(2,Math.floor(period/4));
    const lo=Math.max(2,center-half),hi=Math.min(n-2,center+half);
    let bi=-1,bv=-Infinity,prev=null;
    const vals={};
    for(let i=lo;i<=hi;i++){const v=nsdfAt(i);vals[i]=v;if(v>bv){bv=v;bi=i;}}
    if(bi<=lo||bi>=hi||bv<0.8*chosen.val)continue;
    const sh=interp(vals[bi-1],vals[bi],vals[bi+1]);
    period=(bi+sh)/k;
    break;
  }
  return{freq:sampleRate/period,clarity};
}
