'use strict';
const LiveStore=(()=>{
 const history=new Map();
 function observe(r,old){if(r.state!=='live')return;const id=r.liveId||r.openDate;if(!id)return;
  let h=history.get(r.id);if(!h||h.id!==id)h={id,changes:[]};
  if(old?.state==='live'&&(old.liveId||old.openDate)===id)for(const k of ['title','category'])if(old[k]!==r[k])h.changes.unshift({at:r.checkedAt,field:k,before:old[k],after:r[k]});
  h.changes=h.changes.slice(0,20);history.set(r.id,h);
 }
 function start(value){if(typeof value!=='string'||!value)return NaN;const s=value.trim();return Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(s)?s:s.replace(' ','T')+'+09:00');}
 function elapsed(r,now=Date.now()){const t=start(r?.openDate);if(!Number.isFinite(t)||t>now)return '';const seconds=Math.floor((now-t)/1000);return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':')+' 스트리밍 중';}
 const image=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:''}catch{return '';}};
 return {observe,start,elapsed,image,changes:i=>history.get(i)?.changes||[]};
})();
if(typeof module!=='undefined')module.exports=LiveStore;
