'use strict';
// API phase patch for STELLINK v1.2.0. Does not write personal data.
(() => {
 const endpoint='https://stellink-api.a01086042610.workers.dev/live';
 const previousState=CalendarModel.channelState;
 const records=new Map();let last=null,busy=false,failed=false,timer=null;
 CalendarModel.channelState=function(d,i,now=Date.now()){
  const scheduled=previousState(d,i,now),r=records.get(i);
  const fresh=r&&now-Date.parse(r.checkedAt)<180000&&!failed&&r.state!=='unknown';
  if(fresh&&r.state==='live')return {kind:'live',label:'ON AIR',broadcast:r};
  const pendingEvent=d.events.filter(e=>e.members.includes(i)&&e.status==='planned'&&e.date===Core.day(new Date(now))&&e.time&&Core.stamp(e)<=now).sort((a,b)=>Core.stamp(b)-Core.stamp(a))[0];
  if(scheduled.kind==='next')return {...scheduled,label:scheduled.label+(!fresh?' · 방송 확인 지연':'')};
  if(pendingEvent&&!(fresh&&r.state==='offline'&&r.wasLive))return {kind:'next',label:fresh?'시작 대기 · 현재 OFF':'시작 시간 경과 · 방송 확인 지연',event:pendingEvent};
  return {kind:'off',label:fresh?'OFF':r?.lastLive?'확인 지연 · 마지막 확인 ON AIR':'방송 상태 확인 중',broadcast:!fresh?r?.lastLive:null};
 };
 memberStateRow=function(i,state=CalendarModel.channelState(data,i)){
  const r=state.broadcast;
  return `<div class="channel-row ${state.kind}"><button class="channel-member" data-act="crew" data-arg="${i}">${avatar(i)}<span><strong>${esc(names[i])}</strong><small>${esc(state.label)}</small>${r?`<small class="channel-title">${esc(r.title)}</small><small>${esc(r.category)} · ${esc(new Date(r.checkedAt).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}))} 확인</small>`:state.event?`<small class="channel-title">${esc(state.event.title)}</small>`:''}</span></button>${state.kind==='live'?button('시청','memberChannel',i,'watch-button'):state.event?button('일정','detail',state.event.id,'ghost'):button('채널','memberChannel',i,'ghost')}</div>`;
 };
 const oldHome=homeChannels;
 homeChannels=function(){return `<p class="hint">${failed?'치지직 연결 지연':last?(last.complete?'전체 조회 완료':`일부 조회 · ${last.pages}페이지`):'치지직 연결 중'} · 실제 방송 기준${last?' · '+esc(new Date(last.checkedAt).toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul'}))+' 조회':''}</p>`+oldHome().replace('지금 LIVE','지금 ON AIR').replace('등록 일정 기준으로 진행 중인 방송이 없습니다.','현재 확인된 ON AIR 방송이 없습니다.').replace('곧 다가올 스텔라','방송 예정·시작 대기').replace('쉬고 있는 스텔라','OFF·상태 확인');};
 const oldHTML=homeHTML;
 homeHTML=function(){return oldHTML().replace('등록 시간 기준 자동 LIVE · 지난 날짜의 예정 방송은 KST 자정 이후 OFF','치지직 실제 방송 기준 · 화면을 보고 있을 때 1분 간격 조회');};
 function update(){if(typeof data==='undefined'||!data)return;const target=document.getElementById('homeChannels');if(target&&!document.getElementById('modal').open&&!target.contains(document.activeElement))target.innerHTML=homeChannels();}
 async function refresh(){
  if(busy||document.hidden)return;
  busy=true;let delay=60000;
  try{
   const response=await fetch(endpoint,{cache:'no-store',signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('relay');
   const body=await response.json();
   if(body.schema!==1||!Array.isArray(body.members)||body.members.length!==14||!Number.isFinite(Date.parse(body.checkedAt)))throw Error('schema');
   for(const m of MEMBERS){const r=body.members.find(x=>x.id===m.id&&x.channelId===m.channel.split('/').pop());if(!r||!['live','offline','unknown'].includes(r.state)||r.state!=='unknown'&&!Number.isFinite(Date.parse(r.checkedAt)))throw Error('members');}
   for(const r of body.members){const old=records.get(r.id);records.set(r.id,{...r,wasLive:r.state==='live'||old?.wasLive||false,lastLive:r.state==='live'?r:r.state==='unknown'?(old?.state==='live'?old:old?.lastLive):null});}
   last=body;failed=false;delay=Math.max(60,Math.min(300,Number(body.refreshAfter)||60))*1000;
  }catch{failed=true;delay=120000;}
  finally{busy=false;update();clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,delay);}
 }
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden)refresh();});
 setInterval(update,15000);
 refresh();
})();
