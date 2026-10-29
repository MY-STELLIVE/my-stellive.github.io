const CACHE='stellink-app-v1.0.2';
const FILES=['./','./index.html','./style.css','./core.js','./storage.js','./view-state.js','./app.js','./members.js','./icons.js','./assets/members/yuni.png','./assets/members/huya.png','./assets/members/hina.jpg','./assets/members/mashiro.jpg','./assets/members/lize.png','./assets/members/tabi.jpg','./assets/members/shibuki.png','./assets/members/rin.png','./assets/members/nana.png','./assets/members/riko.png','./assets/members/toa.png','./assets/members/rang.png','./assets/members/hiyori.png','./assets/members/mary.png','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
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
