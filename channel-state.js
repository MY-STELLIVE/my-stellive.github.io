'use strict';
const ChannelState=(()=>{
 const fresh=(r,now,failed)=>!failed&&SessionLink.fresh(r,now);
 function rest(d,i,day){return (d.breaks||[]).find(b=>b.members.includes(i)&&b.start<=day&&(!b.end||b.end>=day));}
 function resolve(d,i,r,now=Date.now(),failed=false){
  const b=rest(d,i,Core.day(new Date(now)));
  if(fresh(r,now,failed)&&r.state==='live')return {kind:'live',label:'라이브',broadcast:r,rest:b};
  return {kind:'off',label:'오프라인',broadcast:null,rest:b};
 }
 function eventLabel(d,e,now=Date.now()){
  if(e.status!=='planned')return {off:'휴방',cancelled:'취소',done:'완료'}[e.status]||'예정';
  const records=i=>typeof window!=='undefined'?window.ChzzkLive?.record(i):null;
  if(SessionLink.active(d,e,records,now))return '진행 중';
  if(Schedule.conflicts(e,d.breaks).length&&!e.breakException)return '휴방 공지 연결';
  if(e.date<Core.day(new Date(now))||e.time&&Core.stamp(e)<=now)return '예정 시간 경과';
  return e.time?e.time+' 예정':'시간 미정';
 }
 return {resolve,eventLabel,fresh,rest};
})();
if(typeof module!=='undefined')module.exports=ChannelState;
