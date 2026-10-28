'use strict';
const screenStates = {};
function captureView(){return {scroll:window.scrollY,rails:[...document.querySelectorAll('#app .rail')].map(el=>el.scrollLeft)};}
function restoreView(v){document.querySelectorAll('#app .rail').forEach((el,i)=>el.scrollLeft=v?.rails?.[i]||0);window.scrollTo(0,v?.scroll||0);}
function render(){
 const view=captureView(),active=document.activeElement;
 const id=active?.id, selection=active?.selectionStart, end=active?.selectionEnd;
 draw();restoreView(view);
 if(id){const el=document.getElementById(id);if(el&&el.matches('input,textarea,select')){el.focus({preventScroll:true});if(typeof selection==='number'&&el.setSelectionRange){try{el.setSelectionRange(selection,end)}catch{}}}}
}
function switchScreen(next){
 if(screen===next)return;
 screenStates[screen]={date,week,filter,crew,crewTab,search,expanded,view:captureView()};
 const state=screenStates[next]||{date:Core.day(),week:Core.monday(Core.day()),filter:-1,crew:null,crewTab:'schedule',search:'',expanded:false};
 screen=next;({date,week,filter,crew,crewTab,search,expanded}=state);
 draw();restoreView(state.view);
}
function plannerResults(){
 if(search)return searchHTML();
 const dates=data.settings.weekMode==='all'&&data.settings.view!=='month'?Array.from({length:7},(_,i)=>Core.add(Core.monday(date),i)):[date];
 return dates.map(d=>`<section><h3>${d} ${d===Core.day()?'· 오늘':''}</h3>${list(d)}</section>`).join('');
}
