'use strict';
// Personal schedule associations are stored locally; the relay never receives them.
const SessionLink=(()=>{
 const key=r=>r?.liveId!=null?'id:'+r.liveId:r?.openDate?'start:'+r.openDate:null;
 const start=r=>{if(!r?.openDate)return NaN;return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(r.openDate)?r.openDate:r.openDate.replace(' ','T')+'+09:00');};
 const fresh=(r,now=Date.now())=>!!r&&Number.isFinite(Date.parse(r.checkedAt))&&now-Date.parse(r.checkedAt)>=-30000&&now-Date.parse(r.checkedAt)<180000;
 function candidates(d,i,r){const t=start(r);if(!key(r)||!Number.isFinite(t))return [];return d.events.filter(e=>e.status==='planned'&&(e.channels||[]).includes(i)&&e.time&&t-Core.stamp(e)>=-3600000&&t-Core.stamp(e)<=10800000&&(!Schedule.conflicts(e,d.breaks).length||e.breakException)&&!(e.sessionLinks||[]).some(l=>l.member===i));}
 function active(d,e,records,now=Date.now()){return (e.sessionLinks||[]).some(l=>{const r=records(l.member);return !l.endedAt&&r?.state==='live'&&fresh(r,now)&&key(r)===l.key;});}
 function reconcile(d,records,now=Date.now()){
  let changed=false;
  for(const e of d.events)for(const l of e.sessionLinks||[]){const r=records(l.member);if(!l.endedAt&&fresh(r,now)&&(r.state==='offline'||r.state==='live'&&key(r)!==l.key)){l.endedAt=new Date(now).toISOString();l.endKind='observed';changed=true;}}
  for(let i=0;i<14;i++){const r=records(i),k=key(r);if(r?.state!=='live'||!fresh(r,now)||!k)continue;if((d.sessionRejections||[]).some(x=>x.member===i&&x.key===k))continue;if(d.events.some(e=>(e.sessionLinks||[]).some(l=>l.member===i&&l.key===k)))continue;const c=candidates(d,i,r);if(c.length===1){(c[0].sessionLinks??=[]).push({member:i,key:k,startedAt:new Date(start(r)).toISOString(),linkedAt:new Date(now).toISOString(),method:'auto'});changed=true;}}
  for(const e of d.events){const channels=e.channels||[],links=e.sessionLinks||[];if(e.status==='planned'&&channels.length&&channels.every(i=>links.some(l=>l.member===i&&l.endedAt))&&!links.some(l=>!l.endedAt)){e.status='done';changed=true;}}
  return changed;
 }
 return {key,start,fresh,candidates,active,reconcile};
})();
if(typeof module!=='undefined')module.exports=SessionLink;
