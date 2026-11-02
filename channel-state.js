'use strict';
const ChannelState=(()=>{
 const fresh=(r,now,failed)=>!!r&&!failed&&r.state!=='unknown'&&now-Date.parse(r.checkedAt)>=-30000&&now-Date.parse(r.checkedAt)<180000;
 function rest(d,i,day){return (d.breaks||[]).filter(b=>b.members.includes(i)&&b.start<=day&&(!b.end||b.end>=day)).sort((a,b)=>(b.appliedAt||0)-(a.appliedAt||0))[0]||(d.events||[]).find(e=>e.members.includes(i)&&e.date===day&&e.status==='off');}
 function resolve(d,i,r,now=Date.now(),failed=false){
  const day=Core.day(new Date(now)),b=rest(d,i,day),ok=fresh(r,now,failed),mine=d.events.filter(e=>e.members.includes(i));
  const exception=mine.some(e=>e.date===day&&e.status==='planned'&&e.breakException&&(e.channels||[]).includes(i));
  if(b&&!exception&&!(ok&&r.state==='live'&&Date.parse(r.checkedAt)>Number(b.appliedAt||Infinity)))return {kind:'off',label:'휴방 공지 기준 OFF',rest:b,broadcast:null};
  if(ok&&r.state==='live')return {kind:'live',label:'LIVE',broadcast:r,conflict:!!b,rest:b};
  const planned=mine.filter(e=>e.status==='planned'&&e.date>=day&&(!Schedule.conflicts(e,d.breaks).length||e.breakException)).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99').localeCompare(b.time||'99'));
  const e=planned.find(e=>!(e.date===day&&e.time&&Core.stamp(e)<=now&&ok&&r.state==='offline'&&r.wasLive));
  if(e)return {kind:'next',event:e,label:!e.time?'시간 미정':Core.stamp(e)<=now?'시작 대기':e.date===day?e.time+' 예정':e.date+' '+e.time+' 예정'};
  return {kind:ok?'off':'unknown',label:ok?(r.wasLive?'방송 종료':'방송 중 아님'):r?.pendingOffline?'종료 여부 재확인 중':'방송 확인 지연',broadcast:!ok?(r?.lastLive||r):null};
 }
 function eventLabel(d,e,now=Date.now()){
  if(e.status!=='planned')return {off:'휴방',cancelled:'취소',done:'방송 완료'}[e.status]||'예정';
  const today=Core.day(new Date(now));
  if(Schedule.conflicts(e,d.breaks).length&&!e.breakException)return '휴방 반영';
  const s=typeof window!=='undefined'?window.ChzzkLive?.snapshot():null;
  const live=(e.channels||[]).some(i=>{const r=typeof window!=='undefined'?window.ChzzkLive?.record(i):null;return resolve(d,i,r,now,s?.failed).kind==='live';});
  if(live&&e.date===today)return '채널 LIVE · 일정 일치 미확인';
  if(e.date<today)return '지난 일정';
  if(!e.time)return '시간 미정';
  return Core.stamp(e)<=now?'시작 대기':e.time+' 예정';
 }
 return {resolve,eventLabel,fresh,rest};
})();
if(typeof module!=='undefined')module.exports=ChannelState;
