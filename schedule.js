'use strict';
const Schedule={
 conflicts(e,breaks=[]){return breaks.filter(b=>b.start<=e.date&&(!b.end||b.end>=e.date)&&e.members.some(i=>b.members.includes(i)));},
 status(e,breaks=[],now=Date.now()){
  if(e.status!=='planned')return {off:'휴방',cancelled:'취소',done:'방송 완료'}[e.status]||'방송 예정';
  const today=Core.day(new Date(now));if(e.date<today)return 'OFF';
  if(this.conflicts(e,breaks).length&&!e.breakException)return '휴방 · 일정 확인';
  if(!e.time)return '시간 미정';
  return e.date===today&&Core.stamp(e)<=now?'LIVE':'방송 예정';
 }
};
if(typeof module!=='undefined')module.exports=Schedule;
