/* MY STELLIVE v2.6.1 - network-first navigation, offline fallback */
const CACHE='my-stellive-v2.6.1-shell';
const SHELL=['./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('my-stellive-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin!==self.location.origin)return;
 const scope=new URL(self.registration.scope);
 if(!u.pathname.startsWith(scope.pathname))return;
 if(r.mode==='navigate'||u.pathname.endsWith('/index.html')){
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
   if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)));}
   return res;
  }).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(fetch(r).catch(()=>caches.match(r)));
});
