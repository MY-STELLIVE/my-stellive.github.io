'use strict';
const Core = (()=>{
const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
const day=(d=new Date())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const monday=d=>add(d,-((new Date(d+'T00:00:00Z').getUTCDay()+6)%7));
const stamp=e=>e.time?Date.parse(e.date+'T'+e.time+':00+09:00'):Infinity;
const next=(events,ids=[],now=Date.now())=>events.filter(e=>e.status==='planned'&&e.time&&stamp(e)>now&&(!ids.length||e.members.some(m=>ids.includes(m)))).sort((a,b)=>stamp(a)-stamp(b))[0];
const initial=()=>({schema:1,version:'1.1.0',breaks:[],events:[],boards:[],profiles:{},favorites:[],settings:{theme:'system',glass:'normal',size:'normal',motion:'system',clock:'12',view:'week',weekMode:'day'},lastBackup:null});
const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0};
function zip(data){const name=new TextEncoder().encode('stellink.json'),b=new TextEncoder().encode(JSON.stringify(data)),out=new Uint8Array(30+name.length+b.length+46+name.length+22),v=new DataView(out.buffer);const put=(p,x,n=4)=>n===2?v.setUint16(p,x,true):v.setUint32(p,x,true);let size=30+name.length+b.length;put(0,0x04034b50);put(4,20,2);put(14,crc(b));put(18,b.length);put(22,b.length);put(26,name.length,2);out.set(name,30);out.set(b,30+name.length);put(size,0x02014b50);put(size+4,20,2);put(size+6,20,2);put(size+16,crc(b));put(size+20,b.length);put(size+24,b.length);put(size+28,name.length,2);out.set(name,size+46);let end=size+46+name.length;put(end,0x06054b50);put(end+8,1,2);put(end+10,1,2);put(end+12,46+name.length);put(end+16,size);return out}
function unzip(buffer){if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<60)throw Error('백업 파일이 너무 짧거나 손상되었습니다.');let v=new DataView(buffer);if(v.getUint32(0,true)!==0x04034b50||v.getUint16(8,true)!==0)throw Error('스텔링크에서 생성한 백업 ZIP을 선택해 주세요.');let n=v.getUint16(26,true),extra=v.getUint16(28,true),len=v.getUint32(18,true),p=30+n+extra;if(new TextDecoder().decode(new Uint8Array(buffer,30,n))!=='stellink.json'||p+len>buffer.byteLength)throw Error('백업 구조가 올바르지 않습니다.');let end=buffer.byteLength-22,central=p+len;if(central+46+n!==end||v.getUint32(central,true)!==0x02014b50||v.getUint32(end,true)!==0x06054b50||v.getUint16(end+8,true)!==1||v.getUint16(end+10,true)!==1||v.getUint32(end+16,true)!==central||v.getUint32(end+12,true)!==46+n||v.getUint32(central+20,true)!==len||v.getUint32(central+16,true)!==v.getUint32(14,true))throw Error('백업 ZIP의 끝부분이 손상되었습니다.');let b=new Uint8Array(buffer,p,len);if(crc(b)!==v.getUint32(14,true))throw Error('손상된 백업 파일입니다.');return JSON.parse(new TextDecoder().decode(b))}
function migrate(input){
 const d=structuredClone(input);d.breaks??=[];
 for(const b of d.boards){b.kind??='legacy';b.noticeDate??='';}
 for(const e of d.events.filter(e=>e.status==='off')){if(!d.breaks.some(b=>b.legacyEventId===e.id))d.breaks.push({id:'break_'+e.id,legacyEventId:e.id,members:[...e.members],start:e.date,end:e.date,title:e.title,note:e.note||'',expected:'',boardId:e.boardId||'',history:structuredClone(e.history),originalEvent:structuredClone(e)});}
 d.events=d.events.filter(e=>e.status!=='off');d.version='1.1.0';return d;
}
function validate(d){
 const fail=msg=>{throw Error('백업 확인 실패: '+msg)};
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const str=(x,max=20000)=>typeof x==='string'&&x.length<=max;
 const mid=x=>Number.isInteger(x)&&x>=0&&x<14;
 const unique=a=>new Set(a).size===a.length;
 const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
 const time=x=>x===''||typeof x==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
 const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
 const states=['planned','off','cancelled','done'];
 const image=x=>typeof x==='string'&&/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(x)&&x.split(',')[1].length%4===0;
 const instant=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const optionalText=(x,max)=>x===undefined||str(x,max);
 const forbidden=(x)=>{if(!obj(x)&&!Array.isArray(x))return;for(const k of Object.keys(x)){if(['__proto__','constructor','prototype'].includes(k))fail('허용하지 않는 키');if(typeof x[k]==='object')forbidden(x[k]);}};
 if(!obj(d)||d.schema!==1||!Array.isArray(d.events)||!Array.isArray(d.boards)||!Array.isArray(d.favorites)||!obj(d.profiles)||!obj(d.settings))fail('지원하지 않는 데이터 구조');
 forbidden(d);
 if(!d.favorites.every(mid)||!unique(d.favorites))fail('즐겨찾기');
 const eventIds=new Set(),boardIds=new Set();
 for(const b of d.boards){
  if(!obj(b)||!id(b.id)||boardIds.has(b.id)||!mid(b.member)||!date(b.week)||monday(b.week)!==b.week||!instant(b.created)||!Array.isArray(b.images)||!b.images.length||!b.images.every(image)||!optionalText(b.previous,100)||!optionalText(b.title,200))fail('시간표 또는 이미지');
  if(b.noticeDate!==undefined&&b.noticeDate!==''&&!date(b.noticeDate))fail('공지 날짜');
  if(b.kind!==undefined&&!['daily','weekly','legacy'].includes(b.kind))fail('공지 유형');
  if(!optionalText(b.note)||!optionalText(b.url,4000))fail('공지 부가 정보');
  boardIds.add(b.id);
 }
 const boardMap=new Map(d.boards.map(b=>[b.id,b]));
 for(const b of d.boards){if(b.previous){let p=boardMap.get(b.previous);if(!p||p.member!==b.member||p.week!==b.week||p.id===b.id)fail('시간표 버전 연결');let chain=new Set([b.id]);while(p){if(chain.has(p.id))fail('시간표 버전 순환');chain.add(p.id);p=boardMap.get(p.previous);}}}
 for(const e of d.events){
  if(!obj(e)||!id(e.id)||eventIds.has(e.id)||!date(e.date)||!time(e.time)||!Array.isArray(e.members)||!e.members.length||!e.members.every(mid)||!unique(e.members)||!str(e.title,200)||!states.includes(e.status)||!Array.isArray(e.history))fail('일정 형식');
  if(!optionalText(e.note)||!optionalText(e.external)||!optionalText(e.boardId,100)||(e.watched!==undefined&&typeof e.watched!=='boolean'))fail('일정 부가 정보');
  if(e.channels!==undefined&&(!Array.isArray(e.channels)||!unique(e.channels)||!e.channels.every(x=>e.members.includes(x))))fail('합방 송출 멤버');
  if(e.boardId&&!boardIds.has(e.boardId))fail('원본 시간표 연결');
  for(const h of e.history){if(!obj(h)||!instant(h.at)||!optionalText(h.reason))fail('변경 이력');for(const k of ['before','after']){const v=h[k];if(!obj(v)||!date(v.date)||!time(v.time)||!states.includes(v.status)||!str(v.title,200))fail('변경 전후 값');}}
  eventIds.add(e.id);
 }
 if(d.breaks!==undefined){if(!Array.isArray(d.breaks))fail('휴방 목록');const seen=new Set();for(const b of d.breaks){if(!obj(b)||!id(b.id)||seen.has(b.id)||!Array.isArray(b.members)||!b.members.length||!b.members.every(mid)||!unique(b.members)||!date(b.start)||(b.end!==''&&(!date(b.end)||b.end<b.start))||!str(b.title,200)||!str(b.note)||!str(b.expected,200)||!optionalText(b.boardId,100)||b.boardId&&!boardIds.has(b.boardId))fail('휴방 기록');seen.add(b.id);}}
 for(const [key,p] of Object.entries(d.profiles)){
  if(!/^(?:[0-9]|1[0-3])$/.test(key)||!obj(p)||!optionalText(p.fullname,200)||!optionalText(p.note)||!optionalText(p.url,4000))fail('프로필');
  if(p.color!==undefined&&!/^#[0-9a-f]{6}$/i.test(p.color))fail('프로필 색상');
  if(p.image!==undefined&&!image(p.image))fail('프로필 이미지');
  if(p.url){try{if(!['http:','https:'].includes(new URL(p.url).protocol))fail('채널 주소')}catch{fail('채널 주소')}}
 }
 const options={theme:['system','dark','light'],glass:['normal','weak'],size:['normal','large'],motion:['system','reduce'],clock:['12','24'],view:['week','month'],weekMode:['day','all']};
 for(const [k,values] of Object.entries(options))if(!values.includes(d.settings[k]))fail('설정 '+k);
 if(d.lastBackup!==null&&d.lastBackup!==undefined&&!instant(d.lastBackup))fail('백업 시각');
 return migrate(d);
}
return{uuid,day,add,monday,stamp,next,initial,zip,unzip,validate,migrate};})();
if(typeof module!=='undefined')module.exports=Core;
