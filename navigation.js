'use strict';
// v1.4.1 owns the final application shell. Retained editors and storage are reused.
const save140=save;
save=async function(next){const signature=b=>JSON.stringify([b.members,b.start,b.end,b.date,b.status,b.title,b.note]);for(const key of ['breaks','events'])for(const b of next[key]||[]){if(key==='events'&&b.status!=='off')continue;const old=data?.[key]?.find(x=>x.id===b.id);if(!old||signature(old)!==signature(b))b.appliedAt=Date.now();else if(!b.appliedAt)b.appliedAt=old.appliedAt||1;}await save140(next);};
// Existing breaks remain effective until a genuinely new observation arrives after loading.
let initializedBreaks=false;
function initializeBreaks(){if(initializedBreaks||!data)return;initializedBreaks=true;for(const b of [...data.breaks,...data.events.filter(e=>e.status==='off')])if(!b.appliedAt)b.appliedAt=Date.now();}
const oldCrew140=crews;
crews=function(){let html=oldCrew140();if(crew!==null){const s=CalendarModel.channelState(data,crew),r=window.ChzzkLive.record(crew);html=html.replace('<div class="segmented">',`${s.kind==='live'?liveCard(crew,s,true):`<p class="state-banner">${esc(s.label)}</p>`}<div class="tools">${button('일정 전체 보기 ›','memberCalendar',crew,'ghost')}${button('소식 전체 보기 ›','memberNotices',crew,'ghost')}</div>${r?.channel?`<p class="hint">팔로워 ${liveNumber(r.channel.followerCount)}명 · ${esc(liveClock(r.channel.checkedAt))} 확인</p>`:''}<div class="segmented">`);}return html;};
function home140(){const all=liveRecords(),live=all.filter(x=>x.state.kind==='live').sort((a,b)=>(b.state.broadcast.viewerCount??-1)-(a.state.broadcast.viewerCount??-1)||a.i-b.i),rest=all.filter(x=>x.state.rest&&x.state.kind!=='live'),today=data.events.filter(e=>e.date===Core.day()&&e.status==='planned'&&(!Schedule.conflicts(e,data.breaks).length||e.breakException)).sort((a,b)=>(a.time||'99').localeCompare(b.time||'99')),occasions=CalendarModel.between(data,Core.day(),Core.day());return `<div class="page-heading"><div><small>YOUR STELLA, TODAY</small><h1>오늘의 스텔링크</h1></div></div><div class="today-summary"><span>방송 중 <b>${live.length}</b></span><span>오늘 일정 <b>${today.length}</b></span><span>휴방 <b>${rest.length}</b></span></div><section><div class="section-head"><h2>지금 방송 중</h2>${button('라이브 전체 보기 ›','nav','live','text-button')}</div><div id="homeLive140" class="live-grid">${live.slice(0,4).map(x=>liveCard(x.i,x.state,true)).join('')||'<p class="empty-line">현재 확인된 방송이 없습니다.</p>'}</div></section><section><div class="section-head"><h2>오늘 예정</h2>${button('오늘 일정 보기 ›','todayCalendar','','text-button')}</div>${today.map(eventHTML).join('')||'<p class="empty-line">오늘 등록된 예정 일정이 없습니다.</p>'}</section>${boardHTML(true)}${occasions.length?`<section><h2>오늘의 스텔라 데이</h2>${occasions.map(calendarEntryHTML).join('')}</section>`:''}<section><details><summary>쉬는 채널</summary>${all.filter(x=>x.state.kind==='off').map(x=>memberStateRow(x.i,x.state)).join('')||'<p>확인된 채널이 없습니다.</p>'}</details></section>`;}
const navStates140=new Map();let closeResolve140=null,closing140=null,modalDepth140=0,modalFrames140=[],restoringModal140=false;
function route140(){return {screen,crew,date,filter,plannerTab,scroll:window.scrollY};}
function remember140(){history.replaceState({...history.state,stellink:true,route:route140()},'');}
function go140(next,extra={}){remember140();navStates140.set(screen,{...route140(),view:captureView()});const old=navStates140.get(next);screen=next;crew=old?.crew??null;date=old?.date||Core.day();filter=old?.filter??-1;if(next==='planner')plannerTab='calendar';if(extra.crew!==undefined)crew=extra.crew;if(extra.date)date=extra.date;if(extra.filter!==undefined)filter=extra.filter;draw();restoreView(old?.view);if(extra.top)window.scrollTo(0,0);history.pushState({stellink:true,route:route140()},'');}
switchScreen=function(next){if(screen!==next)go140(next);};
const modal140=modal,close140=close;
function frame140(){return {html:$('#sheet').innerHTML,scroll:$('#sheet').scrollTop,dirty};}
modal=function(html){if(!restoringModal140){remember140();if($('#modal').open)modalFrames140.push(frame140());else modalFrames140=[];history.pushState({stellink:true,route:route140(),overlay:true},'');modalDepth140++;}modal140(html);};
close=function(force=false){if(!$('#modal').open)return closing140||Promise.resolve();close140(force);if($('#modal').open)return;modalFrames140=[];if(modalDepth140){const n=modalDepth140;modalDepth140=0;closing140=new Promise(resolve=>closeResolve140=resolve);history.go(-n);return closing140;}return Promise.resolve(); };
actions.close=()=>close();

window.addEventListener('popstate',ev=>{
 if(closeResolve140){const resolve=closeResolve140;closeResolve140=null;closing140=null;history.replaceState({stellink:true,route:route140()},'');resolve();return;}
 if($('#modal').open){if(dirty&&!confirm('작성 중인 내용을 버리고 돌아갈까요?')){history.pushState({stellink:true,route:route140(),overlay:true},'');return;}if(modalDepth140>1&&modalFrames140.length){const f=modalFrames140.pop();$('#sheet').innerHTML=f.html;$('#sheet').scrollTop=f.scroll;dirty=f.dirty;modalDepth140--;return;}close140(true);modalDepth140=0;modalFrames140=[];}
 const r=ev.state?.route;if(r){screen=r.screen;crew=r.crew;date=r.date;filter=r.filter;plannerTab=r.plannerTab;draw();window.scrollTo(0,r.scroll||0);}
});
history.replaceState({stellink:true,route:route140()},'');
const settings140=settings;
settings=function(){return settings140().replace('STELLINK v1.3.6','STELLINK v1.4.1').replace('<h2>화면 꾸미기</h2>',`<h2>화면 꾸미기</h2><div class="setting"><span>라이브 기본 보기</span><select id="liveDefaultView"><option value="cards" ${liveFilter.view==='cards'?'selected':''}>썸네일 카드</option><option value="list" ${liveFilter.view==='list'?'selected':''}>가로 썸네일 목록</option></select></div>`);};
draw=function(){initializeBreaks();const s=data.settings,light=s.theme==='light'||s.theme==='system'&&matchMedia('(prefers-color-scheme: light)').matches;document.body.className=(light?'light ':'')+(s.size==='large'?'large-text ':'')+(s.motion==='reduce'?'reduce-motion ':'')+'v140';
 const page=screen==='today'?home140():screen==='live'?livePage():screen==='planner'?planner():screen==='crew'?crews():screen==='notices'?`<h1>소식</h1>${boardHTML()}`:settings();
 $('#app').innerHTML=`<header class="app-header"><div class="brand">${brandLockupHTML}</div><div class="header-time"><span>${Core.day().slice(5).replace('-',' / ')}</span><small id="kstClock">${new Date().toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour12:false})}</small></div><button class="header-settings" data-act="nav" data-arg="settings" aria-label="설정">⚙</button></header>${['settings','notices'].includes(screen)?button('‹ 돌아가기','pageBack','','ghost'):''}${page}${!['settings','notices'].includes(screen)?'<div class="register-dock">'+button('＋ 일정 등록','register','','register-fab')+'</div>':''}`;
 const n=liveRecords().filter(x=>x.state.kind==='live').length;
 $('#nav').innerHTML=[['today','home','홈'],['live','live','라이브'],['planner','calendar','캘린더'],['crew','members','멤버']].map(([id,icon,label])=>`<button type="button" data-act="nav" data-arg="${id}" class="${screen===id?'active':''}" ${screen===id?'aria-current="page"':''}>${icon==='live'?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M6 6a8.5 8.5 0 0 0 0 12M18 6a8.5 8.5 0 0 1 0 12"/></svg>':navIcon(icon)}<span>${label}</span>${id==='live'?`<small data-nav-live>${n||''}</small>`:''}</button>`).join('');lastHomeSignature=homeSignature();};
Object.assign(actions,{
 nav:x=>{if(['today','live','planner','crew','settings','notices'].includes(x))switchScreen(x);},
 crew:i=>go140('crew',{crew:+i,filter:+i,top:true}),crewBack:()=>go140('crew',{crew:null,filter:-1,top:true}),
 archive:()=>switchScreen('notices'),pageBack:()=>history.back(),
 todayCalendar:()=>{go140('planner',{date:Core.day(),top:true});},
 memberCalendar:async i=>{go140('planner',{filter:+i,top:true});planIds=[+i];planFilter='custom';await mutate(d=>d.calendarFilters.members=[+i]);},
 memberNotices:i=>{noticeMember=+i;go140('notices',{filter:+i,top:true});},
 editBreak:id=>breakForm(id),
 register:()=>{if(screen!=='planner')date=Core.day();if(screen==='live')filter=-1;registrationDraft=null;unifiedForm();}
});
document.addEventListener('change',ev=>{if(ev.target.id==='liveDefaultView'){liveFilter.view=ev.target.value;persistLivePrefs();}});
