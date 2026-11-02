'use strict';
// STELLINK 1.4.1: read-only live state, separate from personal schedules.
(() => {
 const endpoint='https://stellink-api.a01086042610.workers.dev/live';
 const previousState=CalendarModel.channelState;
 const records=new Map();let last=null,busy=false,failed=false,timer=null,lastAttempt=0,lastSuccess=null,nextAllowedAt=0,errorCode=null;
 CalendarModel.channelState=function(d,i,now=Date.now()){
  const scheduled=previousState(d,i,now),r=records.get(i);
  if(typeof ChannelState!=='undefined')return ChannelState.resolve(d,i,r,now,failed);
  const fresh=r&&now-Date.parse(r.checkedAt)>=-30000&&now-Date.parse(r.checkedAt)<180000&&!failed&&r.state!=='unknown';
  if(fresh&&r.state==='live')return {kind:'live',label:'ON AIR',broadcast:r};
  const pendingEvent=d.events.filter(e=>e.members.includes(i)&&e.status==='planned'&&e.date===Core.day(new Date(now))&&e.time&&Core.stamp(e)<=now).sort((a,b)=>Core.stamp(b)-Core.stamp(a))[0];
  if(scheduled.kind==='off'&&scheduled.event?.status==='planned'&&!scheduled.event.time)return {kind:'next',label:'시간 미정',event:scheduled.event};
  if(scheduled.kind==='next')return {...scheduled,label:scheduled.label+(!fresh?' · 방송 확인 지연':'')};
  if(pendingEvent&&!(fresh&&r.state==='offline'&&r.wasLive))return {kind:'next',label:fresh?'시작 대기 · 방송 중 아님':'시작 시간 경과 · 방송 확인 지연',event:pendingEvent};
  return {kind:fresh?'off':'unknown',label:fresh?(r.wasLive?'방송 종료':'방송 중 아님'):r?.pendingOffline?'종료 여부 재확인 중':failed||last?'확인 불가 · 갱신 지연':'방송 상태 확인 중',broadcast:!fresh?r?.lastLive:null};
 };
 memberStateRow=function(i,state=CalendarModel.channelState(data,i)){
  const r=state.broadcast;
  return `<div class="channel-row ${state.kind}"><button class="channel-member" data-act="crew" data-arg="${i}">${avatar(i)}<span><strong>${esc(names[i])}</strong><small>${esc(state.label)}</small>${r?`<small class="channel-title">${esc(r.title)}</small><small>${esc(r.category)} · ${esc(new Date(r.checkedAt).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}))} 확인</small>`:state.event?`<small class="channel-title">${esc(state.event.title)}</small>`:''}</span></button>${state.kind==='live'?button('시청','memberChannel',i,'watch-button'):state.event?button('일정','detail',state.event.id,'ghost'):button('채널','memberChannel',i,'ghost')}</div>`;
 };
 const oldHTML=homeHTML;
 homeHTML=function(){return oldHTML().replace('등록 시간 기준 자동 LIVE · 지난 날짜의 예정 방송은 KST 자정 이후 OFF','치지직 실제 방송 기준 · 화면을 보고 있을 때 1분 간격 조회');};
 function update(){
  if(typeof data==='undefined'||!data)return;
  const target=document.getElementById('homeChannels'),active=document.activeElement;
  if(!target||document.getElementById('modal').open||target.contains(active)&&active?.matches('input,textarea,select,[contenteditable="true"]'))return;
  const railLeft=target.querySelector('.member-strip')?.scrollLeft||0,opened=[...target.querySelectorAll('details')].map(el=>el.open),focus=target.contains(active)&&active?.dataset?.act?{act:active.dataset.act,arg:active.dataset.arg}:null;
  target.innerHTML=homeChannels();
  const rail=target.querySelector('.member-strip');if(rail)rail.scrollLeft=railLeft;
  target.querySelectorAll('details').forEach((el,i)=>{if(opened[i]!==undefined)el.open=opened[i];});
  if(focus){const button=[...target.querySelectorAll('[data-act]')].find(el=>el.dataset.act===focus.act&&el.dataset.arg===focus.arg&&!el.disabled);button?.focus({preventScroll:true});}
 }

 window.ChzzkLive=Object.freeze({snapshot:()=>({endpoint,last: last?structuredClone(last):null,busy,failed,lastAttempt,lastSuccess,nextAllowedAt,errorCode}),refresh:()=>refresh(),record:i=>records.has(i)?structuredClone(records.get(i)):null});
 async function refresh(){
  if(busy||document.hidden)return;
  if(typeof navigator!=='undefined'&&navigator.onLine===false){failed=true;errorCode='device_offline';update();document.dispatchEvent(new Event('stellink:live'));return;}
  const remaining=nextAllowedAt-Date.now();if(remaining>0){clearTimeout(timer);timer=setTimeout(refresh,remaining);return;}
  lastAttempt=Date.now();
  busy=true;let delay=60000;nextAllowedAt=0;update();document.dispatchEvent(new Event('stellink:live'));
  try{
   const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(45000)});
   if(!response.ok){if(response.status===429){const raw=response.headers?.get('Retry-After');const seconds=raw?(/^\d+$/.test(raw)?Number(raw):Math.ceil((Date.parse(raw)-Date.now())/1000)):300;delay=Math.min(3600,Math.max(300,seconds||300))*1000;}throw Error(response.status===429?'rate_limited':'relay_http_'+response.status);}
   const body=await response.json();
   if(body.mode==='direct-unofficial'||body.experimental)throw Error('legacy_worker');
   if(!body.members&&(body.service||body.message))throw Error('wrong_endpoint');
   if(body.schema!==1||!Array.isArray(body.members)||body.members.length!==14||!Number.isFinite(Date.parse(body.checkedAt)))throw Error('schema');
   if(Date.parse(body.checkedAt)>Date.now()+30000||last&&Date.parse(body.checkedAt)<Date.parse(last.checkedAt))throw Error('stale_response');
   for(const m of MEMBERS){const r=body.members.find(x=>x.id===m.id&&x.channelId===m.channel.split('/').pop());if(!r||!['live','offline','unknown'].includes(r.state)||r.state!=='unknown'&&(!Number.isFinite(Date.parse(r.checkedAt))||Date.parse(r.checkedAt)>Date.now()+30000))throw Error('members');}
   if(body.complete!==true&&body.members.some(r=>r.state==='offline'))throw Error('unsafe_offline');
   body.members=body.members.map(r=>({...r,title:typeof r.title==='string'?r.title:'',category:typeof r.category==='string'?r.category:'',tags:Array.isArray(r.tags)?r.tags.filter(t=>typeof t==='string').slice(0,30):[],viewerCount:Number.isSafeInteger(r.viewerCount)&&r.viewerCount>=0?r.viewerCount:null,openDate:typeof r.openDate==='string'?r.openDate:null,thumbnail:typeof r.thumbnail==='string'?r.thumbnail:null,adult:r.adult===true}));
   for(const r of body.members){const old=records.get(r.id);if(typeof LiveStore!=='undefined')LiveStore.observe(r,old);records.set(r.id,{...r,wasLive:r.state==='live'||old?.wasLive||false,lastLive:r.state==='live'?r:r.state==='unknown'?(old?.state==='live'?old:old?.lastLive):null});}
   last=body;const confirmed=body.members.filter(m=>m.state!=='unknown'&&Date.now()-Date.parse(m.checkedAt)<180000);failed=false;errorCode=body.reason||null;if(confirmed.length)lastSuccess=new Date(Math.max(...confirmed.map(m=>Date.parse(m.checkedAt)))).toISOString();
   const wait=Number(body.nextPollIn);delay=Number.isFinite(wait)&&wait>0?Math.max(5,Math.min(3600,wait))*1000:Math.max(60,Math.min(3600,Number(body.refreshAfter)||60))*1000;

  }catch(error){failed=true;errorCode=['TimeoutError','AbortError'].includes(error.name)?'timeout':error instanceof SyntaxError?'invalid_json':error.message;delay=errorCode==='rate_limited'?Math.max(delay,300000):120000;}
  finally{nextAllowedAt=Date.now()+delay;busy=false;update();document.dispatchEvent(new Event('stellink:live'));clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,delay);}
 }
 if(typeof window.addEventListener==='function'){window.addEventListener('offline',()=>{clearTimeout(timer);failed=true;errorCode='device_offline';update();document.dispatchEvent(new Event('stellink:live'));});window.addEventListener('online',()=>refresh());}
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden)refresh();});
 setInterval(update,15000);
 setInterval(()=>{const s=window.ChzzkLive.snapshot(),wait=Math.max(0,Math.ceil((s.nextAllowedAt-Date.now())/1000));document.querySelectorAll('[data-live-countdown]').forEach(el=>{el.textContent=s.errorCode==='device_offline'?'인터넷 연결을 기다리고 있습니다.':s.busy?'최신 방송 정보를 확인하고 있습니다.':wait?'다음 자동 조회까지 '+wait+'초':'조회 가능';});document.querySelectorAll('[data-live-refresh]').forEach(el=>{el.disabled=s.busy||wait>0||s.errorCode==='device_offline';el.textContent=s.busy?'조회 중…':'새로고침';});},1000);
 refresh();
})();
