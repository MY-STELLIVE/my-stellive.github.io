'use strict';
// STELLINK 1.3.3: read-only live state, separate from personal schedules.
(() => {
 const endpoint='https://stellink-api.a01086042610.workers.dev/live';
 const previousState=CalendarModel.channelState;
 const records=new Map();let last=null,busy=false,failed=false,timer=null,lastAttempt=0,lastSuccess=null,nextAllowedAt=0,errorCode=null;
 CalendarModel.channelState=function(d,i,now=Date.now()){
  const scheduled=previousState(d,i,now),r=records.get(i);
  const fresh=r&&now-Date.parse(r.checkedAt)<180000&&!failed&&r.state!=='unknown';
  if(fresh&&r.state==='live')return {kind:'live',label:'ON AIR',broadcast:r};
  const pendingEvent=d.events.filter(e=>e.members.includes(i)&&e.status==='planned'&&e.date===Core.day(new Date(now))&&e.time&&Core.stamp(e)<=now).sort((a,b)=>Core.stamp(b)-Core.stamp(a))[0];
  if(scheduled.kind==='off'&&scheduled.event?.status==='planned'&&!scheduled.event.time)return {kind:'next',label:'시간 미정',event:scheduled.event};
  if(scheduled.kind==='next')return {...scheduled,label:scheduled.label+(!fresh?' · 방송 확인 지연':'')};
  if(pendingEvent&&!(fresh&&r.state==='offline'&&r.wasLive))return {kind:'next',label:fresh?'시작 대기 · 방송 중 아님':'시작 시간 경과 · 방송 확인 지연',event:pendingEvent};
  return {kind:fresh?'off':'unknown',label:fresh?(r.wasLive?'방송 종료':'방송 중 아님'):failed||last?'확인 불가 · 갱신 지연':'방송 상태 확인 중',broadcast:!fresh?r?.lastLive:null};
 };
 memberStateRow=function(i,state=CalendarModel.channelState(data,i)){
  const r=state.broadcast;
  return `<div class="channel-row ${state.kind}"><button class="channel-member" data-act="crew" data-arg="${i}">${avatar(i)}<span><strong>${esc(names[i])}</strong><small>${esc(state.label)}</small>${r?`<small class="channel-title">${esc(r.title)}</small><small>${esc(r.category)} · ${esc(new Date(r.checkedAt).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}))} 확인</small>`:state.event?`<small class="channel-title">${esc(state.event.title)}</small>`:''}</span></button>${state.kind==='live'?button('시청','memberChannel',i,'watch-button'):state.event?button('일정','detail',state.event.id,'ghost'):button('채널','memberChannel',i,'ghost')}</div>`;
 };
 const oldHTML=homeHTML;
 homeHTML=function(){return oldHTML().replace('등록 시간 기준 자동 LIVE · 지난 날짜의 예정 방송은 KST 자정 이후 OFF','치지직 실제 방송 기준 · 화면을 보고 있을 때 1분 간격 조회');};
 function update(){if(typeof data==='undefined'||!data)return;const target=document.getElementById('homeChannels');if(target&&!document.getElementById('modal').open&&!target.contains(document.activeElement))target.innerHTML=homeChannels();}
 window.ChzzkLive=Object.freeze({snapshot:()=>({endpoint,last: last?structuredClone(last):null,busy,failed,lastAttempt,lastSuccess,nextAllowedAt,errorCode}),refresh:()=>refresh()});
 async function refresh(){
  if(busy||document.hidden)return;
  const remaining=nextAllowedAt-Date.now();if(remaining>0){clearTimeout(timer);timer=setTimeout(refresh,remaining);return;}
  lastAttempt=Date.now();
  busy=true;errorCode=null;let delay=60000;nextAllowedAt=lastAttempt+60000;
  try{
   const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error(response.status===429?'rate_limited':'relay_http_'+response.status);
   const body=await response.json();
   if(body.mode==='direct-unofficial'||body.experimental)throw Error('legacy_worker');
   if(!body.members&&(body.service||body.message))throw Error('wrong_endpoint');
   if(body.schema!==1||!Array.isArray(body.members)||body.members.length!==14||!Number.isFinite(Date.parse(body.checkedAt)))throw Error('schema');
   for(const m of MEMBERS){const r=body.members.find(x=>x.id===m.id&&x.channelId===m.channel.split('/').pop());if(!r||!['live','offline','unknown'].includes(r.state)||r.state!=='unknown'&&!Number.isFinite(Date.parse(r.checkedAt)))throw Error('members');}
   if(body.complete!==true&&body.members.some(r=>r.state==='offline'))throw Error('unsafe_offline');
   for(const r of body.members){const old=records.get(r.id);records.set(r.id,{...r,wasLive:r.state==='live'||old?.wasLive||false,lastLive:r.state==='live'?r:r.state==='unknown'?(old?.state==='live'?old:old?.lastLive):null});}
   last=body;failed=body.members.every(m=>m.state==='unknown');errorCode=body.reason||(failed?'unconfirmed':null);if(!failed)lastSuccess=body.checkedAt;delay=Math.max(60,Math.min(300,Number(body.refreshAfter)||60))*1000;
  }catch(error){failed=true;errorCode=error.name==='TimeoutError'?'timeout':error instanceof SyntaxError?'invalid_json':error.message;delay=errorCode==='rate_limited'?300000:120000;}
  finally{nextAllowedAt=Date.now()+delay;busy=false;update();document.dispatchEvent(new Event('stellink:live'));clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,delay);}
 }
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden)refresh();});
 setInterval(update,15000);
 refresh();
})();
