// Service worker: precache the app shell so everything except AI feedback
// works offline. Bump VERSION whenever any precached file changes.
const VERSION='v2.2.0';
const CACHE='violin-coach-'+VERSION;
const SHELL=[
  './','./index.html','./manifest.webmanifest','./css/app.css',
  './js/app.js','./js/actions.js','./js/state.js','./js/ui.js','./js/notes.js','./js/pitch.js','./js/mic.js',
  './js/audio.js','./js/playback.js','./js/scales.js','./js/scales-data.js','./js/tuner.js',
  './js/practice.js','./js/notecheck.js','./js/scalecheck.js','./js/analyze.js','./js/scaleresult.js',
  './vendor/Tone.js',
  ...['G3','A3','C4','E4','G4','A4','C5','E5','G5','A5','C6','E6','G6','A6','C7'].map(n=>'./samples/violin/'+n+'.mp3'),
  './icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'
];

self.addEventListener('install',e=>{
  // Precache the whole shell, then take over immediately so page and scripts
  // never come from different versions.
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('violin-coach-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return; // Gemini API etc. go straight to the network
  // Navigations: serve the precached page so it always matches the precached
  // scripts and styles (a new version arrives as a whole via the SW update).
  if(req.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(hit=>hit||fetch(req)));
    return;
  }
  // Everything else: cache first, then network (and cache what we fetched)
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});
