const CACHE='stellink-app-v1.0.1';
const FILES=['./','./index.html','./style.css','./core.js','./storage.js','./view-state.js','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
// Keep one complete version together; never mix new HTML with cached old JS.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stellink-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const url=new URL(e.request.url),base=new URL(self.registration.scope);
 const local=url.pathname.slice(base.pathname.length);
 if(url.pathname.startsWith(base.pathname)&&(['','index.html',...FILES.map(x=>x.slice(2))].includes(local))){
  e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:true}))||(e.request.mode==='navigate'?await c.match('./index.html'):null)||fetch(e.request)));
 }
});
