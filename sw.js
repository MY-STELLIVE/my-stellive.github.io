const CACHE='stellink-app-v1.4.2-brand1';
const FILES=['./assets/brand/live-placeholder.svg','./channel-state.js','./live-store.js','./live-ui.js','./navigation.js','./v140.css','./assets/brand/chzzk-partner.png','./assets/brand/stellink-apple-touch-180.png','./assets/brand/stellink-favicon-64.png','./assets/brand/stellink-icon-192.png','./assets/brand/stellink-icon-512.png','./assets/brand/stellink-logo-512.png','./assets/brand/stellink-maskable-512.png','./','./release-ui.js','./release-ui.css','./assets/brand/stellink-wordmark.png','./index.html','./style.css','./calendar-data.js','./calendar-model.js','./registration.js','./calendar-ui.js','./upgrade-ui.js','./chzzk-live.js','./next-ui.js','./next-ui.css','./data/calendar.json','./core.js','./storage.js','./view-state.js','./app.js','./schedule.js','./breaks.js','./calendar.js','./notices.js','./image-viewer.js','./features.js','./members.js','./icons.js','./assets/members/yuni.png','./assets/members/huya.png','./assets/members/hina.jpg','./assets/members/mashiro.jpg','./assets/members/lize.png','./assets/members/tabi.jpg','./assets/members/shibuki.png','./assets/members/rin.png','./assets/members/nana.png','./assets/members/riko.png','./assets/members/toa.png','./assets/members/rang.png','./assets/members/hiyori.png','./assets/members/mary.png','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
// Keep one complete version together; never mix new HTML with cached old JS.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stellink-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/data/calendar.json')){e.respondWith(fetch(e.request).then(r=>{if(!r.ok)throw Error('fetch');return r;}).catch(()=>caches.open(CACHE).then(c=>c.match('./data/calendar.json'))));return;}
 const base=new URL(self.registration.scope);
 const local=url.pathname.slice(base.pathname.length);
 if(url.pathname.startsWith(base.pathname)&&(['','index.html',...FILES.map(x=>x.slice(2))].includes(local))){
  e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:true}))||(e.request.mode==='navigate'?await c.match('./index.html'):null)||fetch(e.request)));
 }
});
