global.CalendarModel=require('../calendar-model.js');
const assert=require('node:assert/strict'),C=require('../core.js');
let passed=0;function test(name,fn){fn();console.log('PASS '+name);passed++}
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXQAAAAASUVORK5CYII=';
const d=C.initial();d.events=[{id:'e1',date:'2026-10-28',time:'01:00',members:[0,4],channels:[0],title:'합방',note:'',external:'',boardId:'b1',status:'planned',history:[],watched:false}];d.boards=[{id:'b1',week:'2026-10-26',member:0,created:'2026-10-28T00:00:00Z',images:[image],previous:''}];d.profiles={'0':{fullname:'유니',note:'',color:'#a99bff',image,url:'https://example.com'}};d.favorites=[0,4];
test('KST midnight',()=>assert.equal(C.day(new Date('2026-10-27T15:00:00Z')),'2026-10-28'));
test('week and year boundary',()=>{assert.equal(C.monday('2026-11-01'),'2026-10-26');assert.equal(C.add('2026-12-31',1),'2027-01-01')});
test('NEXT cohost and passed time',()=>{assert.equal(C.next(d.events,[4],Date.parse('2026-10-27T15:00Z')).id,'e1');assert.equal(C.next(d.events,[],Date.parse('2026-10-27T16:00Z')),undefined)});
test('legacy schema ZIP including images',()=>assert.deepEqual(C.validate(C.unzip(C.zip(d).buffer)),C.migrate(d)));
function bad(name,fn){test(name,()=>{let x=structuredClone(d);fn(x);assert.throws(()=>C.validate(x))})}
bad('invalid real calendar day',x=>x.events[0].date='2026-02-30');
bad('invalid time',x=>x.events[0].time='25:00');bad('duplicate event ID',x=>x.events.push(x.events[0]));bad('duplicate board ID',x=>x.boards.push(x.boards[0]));bad('missing board link',x=>x.events[0].boardId='missing');bad('cyclic board version',x=>x.boards[0].previous='b1');bad('invalid channel member',x=>x.events[0].channels=[3]);bad('duplicate favorites',x=>x.favorites=[0,0]);bad('invalid profile URL',x=>x.profiles[0].url='javascript:alert(1)');bad('invalid image',x=>x.profiles[0].image='data:image/svg+xml;base64,abcd');bad('invalid settings',x=>x.settings.theme='other');bad('invalid history',x=>x.events[0].history=[{at:'no'}]);
test('prototype key rejected',()=>assert.throws(()=>C.validate(JSON.parse(JSON.stringify(d).replace('"profiles":{','"profiles":{"__proto__":{},')))));
test('ZIP corruption rejected',()=>{let z=C.zip(d);z[80]^=1;assert.throws(()=>C.unzip(z.buffer))});test('short ZIP rejected',()=>assert.throws(()=>C.unzip(new ArrayBuffer(2))));


global.Core=C;const S=require('../schedule.js');
test('LIVE exact start and OFF midnight',()=>{const e={...d.events[0],date:'2026-10-30',time:'19:00'};assert.equal(S.status(e,[],Date.parse('2026-10-30T18:59:59+09:00')),'방송 예정');assert.equal(S.status(e,[],Date.parse('2026-10-30T19:00:00+09:00')),'LIVE');assert.equal(S.status(e,[],Date.parse('2026-10-31T00:00:00+09:00')),'OFF');});
test('legacy break migration idempotent and lossless',()=>{const old=structuredClone(d);old.events[0].status='off';const m=C.migrate(old);assert.equal(m.events.length,0);assert.deepEqual(m.breaks[0].originalEvent,old.events[0]);assert.deepEqual(C.migrate(m),m);assert.equal(m.boards[0].noticeDate,'');assert.deepEqual(C.validate(C.unzip(C.zip(m).buffer)),m);});
test('break inclusive boundaries and exception',()=>{const e={...d.events[0],date:'2026-10-30',time:'19:00'},b={start:'2026-10-29',end:'2026-10-30',members:[0]};assert.equal(S.status(e,[b],Date.parse('2026-10-30T20:00:00+09:00')),'휴방 · 일정 확인');assert.equal(S.status({...e,breakException:true},[b],Date.parse('2026-10-30T20:00:00+09:00')),'LIVE');assert.equal(S.conflicts({...e,date:'2026-10-31'},[b]).length,0);});

console.log(passed+' tests passed');
