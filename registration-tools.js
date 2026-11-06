'use strict';
const RegistrationTools=(()=>{
 function title(value,previous,next){let body=String(value||'');if(previous&&body.startsWith(previous))body=body.slice(previous.length).trimStart();if(next&&body.startsWith(next))body=body.slice(next.length).trimStart();return next?next+(body?' '+body:' '):body;}
 function body(value,prefix){const s=String(value||'').trim();return prefix&&s.startsWith(prefix)?s.slice(prefix.length).trim():s;}
 function files(existing,incoming){const result=[],seen=new Set(existing.map(x=>x.key).filter(Boolean));for(const f of incoming){if(!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)||f.size>12*1024*1024)throw Error('PNG·JPG·WebP·GIF, 장당 12MB 이하 이미지를 선택해 주세요.');const key=[f.name,f.size,f.lastModified].join(':');if(!seen.has(key)){seen.add(key);result.push({file:f,key});}}if(existing.length+result.length>10)throw Error('공지 이미지는 최대 10장까지 첨부할 수 있습니다.');return result;}
 return {title,body,files};
})();
if(typeof module!=='undefined')module.exports=RegistrationTools;
