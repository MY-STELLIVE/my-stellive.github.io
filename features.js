'use strict';
Object.assign(actions,{
 break:id=>breakForm(id),breakDetail,breakFromBoard:id=>breakForm('',id),boardTitle:noticeEdit,
 archive:()=>{switchScreen('planner');plannerTab='notices';render();},plannerTab:x=>{plannerTab=x;render();},
 noticeReset:()=>{noticeFrom='';noticeTo='';noticeMember=-1;noticeKind='all';boardQuery='';render();},
 imageUp:i=>{i=+i;if(i>0)[noticeFiles[i-1],noticeFiles[i]]=[noticeFiles[i],noticeFiles[i-1]];dirty=true;showNoticePreviews();},
 imageRemove:i=>{noticeFiles.splice(+i,1);dirty=true;showNoticePreviews();},
 endBreak:async id=>{const b=data.breaks.find(x=>x.id===id);if(b.start>Core.day())throw Error('시작 전 휴방은 기간을 수정해 주세요.');await mutate(d=>d.breaks.find(x=>x.id===id).end=Core.day());breakDetail(id);},
 deleteBreak:async id=>{if(confirm('휴방 기록을 삭제할까요? 연결 공지와 방송은 유지됩니다.')){await mutate(d=>d.breaks=d.breaks.filter(x=>x.id!==id));close(true);}}
});
document.addEventListener('change',async ev=>{const el=ev.target;try{if(el.id==='noticeFiles'){const files=[...el.files];const images=await Promise.all(files.map(async f=>({name:f.name,uri:await imageData(f)})));noticeFiles.push(...images);dirty=true;el.value='';showNoticePreviews();}if(el.closest('#breakForm'))updateBreakForm();if(el.id==='noticeMember'){noticeMember=+el.value;render();}if(el.id==='noticeKind'){noticeKind=el.value;render();}if(el.id==='noticeFrom'){noticeFrom=el.value;render();}if(el.id==='noticeTo'){noticeTo=el.value;render();}}catch(e){toast(e.message);}});
document.addEventListener('submit',async ev=>{const f=ev.target;if(!['breakForm','noticeForm','noticeEditForm'].includes(f.id)||f.dataset.featureBusy)return;ev.preventDefault();f.dataset.featureBusy='true';const btn=f.querySelector('button[type=submit]');btn.disabled=true;try{const bad=[...f.elements].find(x=>x.willValidate&&!x.validity.valid);if(bad){bad.focus();throw Error('날짜와 입력 내용을 확인해 주세요.');}if(f.id==='breakForm')await saveBreak(f,new FormData(f));else await saveNotice(f,new FormData(f));}catch(e){const msg=f.querySelector('.form-message');msg.hidden=false;msg.textContent=e.message;}finally{delete f.dataset.featureBusy;btn.disabled=false;}});
