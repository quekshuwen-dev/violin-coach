// Service worker: precache the app shell so everything except AI feedback
// works offline. Bump VERSION whenever any precached file changes.
const VERSION='v2.1.0';
const CACHE='violin-coach-'+VERSION;
const SHELL=[
  './','./index.html','./manifest.webmanifest','./css/app.css',
  './js/app.js','./js/actions.js','./js/state.js','./js/ui.js','./js/notes.js','./js/pitch.js','./js/mic.js',
  './js/audio.js','./js/playback.js','./js/scales.js','./js/scales-data.js','./js/tuner.js',
  './js/practice.js','./js/notecheck.js','./js/scalecheck.js',
  './vendor/Tone.js',
  ...['G3','A3','C4','E4','G4','A4','C5','E5','G5','A5','C6','E6','G6','A6','C7'].map(n=>'./samples/violin/'+n+'.mp3'),
  './icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/apple-touch-icon.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));
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
  // Navigations: network first (fresh shell), cached index as offline fallback
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res;})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  // Everything else: cache first, then network (and cache what we fetched)
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});
