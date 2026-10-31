'use strict';
const CalendarModel=(()=>{
 const categories={birthday:['🎂','생일'],anniversary:['✦','기념일'],event:['♫','공연·행사'],popup:['⌖','팝업·협업'],content:['▷','음악·콘텐츠'],sale:['▣','예매·판매'],other:['•','기타'],holiday:['⚑','국경일·공휴일']};
 const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
 const validTime=x=>x===''||typeof x==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
 function validateItem(e){
  if(!e||typeof e!=='object'||['__proto__','constructor','prototype'].includes(e.id)||!/^[-\w]{1,100}$/.test(e.id)||typeof e.title!=='string'||!e.title.trim()||e.title.length>200||!Object.hasOwn(categories,e.category)||!validDate(e.start)||!validDate(e.end)||e.end<e.start||!['none','yearly'].includes(e.repeat)||!validTime(e.time||'')||!validTime(e.endTime||'')||!Array.isArray(e.members)||e.members.some(i=>!Number.isInteger(i)||i<0||i>13)||new Set(e.members).size!==e.members.length)throw Error('기념일·행사 형식이 올바르지 않습니다.');
  if(e.repeat==='yearly'&&e.end!==e.start)throw Error('매년 반복은 하루 일정에만 설정할 수 있습니다.');
  if(e.originYear!=null&&(!Number.isInteger(e.originYear)||e.originYear<1900||e.originYear>Number(e.start.slice(0,4))))throw Error('기준 연도를 확인해 주세요.');
  for(const k of ['note','source','place','parentId','verifiedAt','kind'])if(e[k]!==undefined&&(typeof e[k]!=='string'||e[k].length>20000))throw Error('행사 부가 정보를 확인해 주세요.');
  if(e.source){let u;try{u=new URL(e.source)}catch{throw Error('출처 URL을 확인해 주세요.')}if(!['https:','http:'].includes(u.protocol))throw Error('출처 URL을 확인해 주세요.');}
  if(e.images!==undefined&&(!Array.isArray(e.images)||e.images.some(x=>typeof x!=='string')))throw Error('행사 이미지를 확인해 주세요.');
  return e;
 }
 function validateCatalog(c){if(!c||c.schema!==1||!validDate(c.updated)||!Array.isArray(c.items)||c.items.length>20000)throw Error('공식 달력 데이터 형식이 올바르지 않습니다.');const checkKeys=x=>{if(x&&typeof x==='object')for(const k of Object.keys(x)){if(['__proto__','constructor','prototype'].includes(k))throw Error('허용하지 않는 데이터 키입니다.');checkKeys(x[k]);}};checkKeys(c);const ids=new Set();for(const e of c.items){validateItem(e);if(ids.has(e.id)||!e.source||e.images?.length)throw Error('공식 일정의 번호·출처를 확인해 주세요.');ids.add(e.id);}return c;}
 function all(d){const base=(d.calendarCatalog?.items||[]).map(e=>d.calendarOverrides?.[e.id]?{...d.calendarOverrides[e.id],official:true,customized:true}:{...e,official:true});const ids=new Set(base.map(e=>e.id));const retained=Object.values(d.calendarOverrides||{}).filter(e=>!ids.has(e.id)).map(e=>({...e,official:true,customized:true}));return [...base,...retained,...(d.calendarItems||[])].filter(e=>!d.calendarHidden?.includes(e.id));}
 function between(d,start,end){const out=[];for(const e of all(d)){if(e.repeat==='yearly'){for(let y=+start.slice(0,4);y<=+end.slice(0,4);y++){const day=y+e.start.slice(4);if(day<e.start||!validDate(day)||day<start||day>end)continue;const n=e.originYear==null?null:y-e.originYear;out.push({...e,date:day,occurrenceEnd:day,anniversary:n,displayTitle:e.title+(n>0?' · '+n+'주년':'')});}}else if(e.start<=end&&e.end>=start)out.push({...e,date:e.start,occurrenceEnd:e.end,displayTitle:e.title});}return out.sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'').localeCompare(b.time||'')||a.title.localeCompare(b.title,'ko'));}
 function mergeCatalog(d,c){validateCatalog(c);if(c.items.some(e=>(d.calendarItems||[]).some(x=>x.id===e.id)))throw Error('개인 일정과 같은 번호가 있는 자료입니다.');if(d.calendarCatalog&&c.updated<d.calendarCatalog.updated)throw Error('현재보다 이전 달력 데이터입니다.');return {...d,calendarCatalog:structuredClone(c)};}
 function channelState(d,i,now=Date.now()){
  const mine=d.events.filter(e=>e.members.includes(i)),live=mine.filter(e=>Schedule.status(e,d.breaks,now)==='LIVE'&&(e.channels||[]).includes(i));
  if(live.length)return {kind:'live',label:'LIVE',event:live.sort((a,b)=>Core.stamp(b)-Core.stamp(a))[0]};
  const next=mine.filter(e=>e.status==='planned'&&Core.stamp(e)>now&&e.time&&(!Schedule.conflicts(e,d.breaks).length||e.breakException)).sort((a,b)=>Core.stamp(a)-Core.stamp(b))[0];
  if(next)return {kind:'next',label:next.date+' '+next.time+((next.channels||[]).includes(i)?' 예정':' 참여 예정'),event:next};
  const today=Core.day(new Date(now)),rest=d.breaks.find(b=>b.members.includes(i)&&b.start<=today&&(!b.end||b.end>=today));
  const unknown=mine.find(e=>e.status==='planned'&&e.date>=today&&!e.time);
  return {kind:'off',label:rest?'휴방 중':unknown?'시간 미정 일정 있음':'OFF',event:unknown};
 }
 return {categories,validDate,validTime,validateItem,validateCatalog,all,between,mergeCatalog,channelState};
})();
if(typeof module!=='undefined')module.exports=CalendarModel;
