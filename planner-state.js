import {studyDays} from './curriculum.js';
import {algorithms} from './algorithms.js';
export const PLAN_KEY='cfop-academy-study-v1';
export const REVIEW_INTERVALS=[1,3,7,14,30];
export const todayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+'T12:00:00Z');
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value&&value>='2000-01-01'&&value<='2199-12-31';
}
export function addDays(value,amount){
 if(!validDate(value)||!Number.isInteger(amount))throw Error('Некорректная дата.');
 const date=new Date(value+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+amount);
 return date.toISOString().slice(0,10);
}
export const blankPlan=()=>({version:1,startDate:'',selectedDay:1,days:{},reviews:{}});
export function normalizePlan(value){
 const result=blankPlan();
 if(!value||typeof value!=='object'||value.version!==1)return result;
 result.startDate=validDate(value.startDate)?value.startDate:'';
 result.selectedDay=studyDays.some(d=>d.id===value.selectedDay)?value.selectedDay:1;
 for(const day of studyDays){
  const entry=value.days?.[day.id];if(!entry||typeof entry!=='object')continue;
  const checked=Array.isArray(entry.checked)?[...new Set(entry.checked.filter(i=>Number.isInteger(i)&&i>=0&&i<day.tasks.length))]:[];
  const goal=entry.goal===true;
  result.days[day.id]={checked,goal,note:typeof entry.note==='string'?entry.note.slice(0,3000):'',completed:checked.length===day.tasks.length&&goal&&validDate(entry.completed)?entry.completed:''};
 }
 for(const a of algorithms){
  const review=value.reviews?.[a.id];
  if(!review||!validDate(review.due)||!Number.isInteger(review.stage)||review.stage<0||review.stage>=REVIEW_INTERVALS.length)continue;
  // Only cases from a genuinely completed introduction are restored, unless
  // that day was reopened later (the review retains its introduction date).
  if(!validDate(review.introduced))continue;
  result.reviews[a.id]={due:review.due,stage:review.stage,introduced:review.introduced,last:validDate(review.last)?review.last:''};
 }
 return result;
}
export function dayProgress(state,id){
 if(!studyDays.some(d=>d.id===id))throw Error('Учебный день не найден.');
 return state.days[id]||(state.days[id]={checked:[],goal:false,note:'',completed:''});
}
export function readyToComplete(state,id){const day=studyDays.find(d=>d.id===id),p=state.days[id];return !!day&&!!p&&p.goal&&day.tasks.every((_,i)=>p.checked.includes(i));}
export function completeDay(state,id,date=todayKey()){
 if(!validDate(date))throw Error('Некорректная дата.');
 if(!readyToComplete(state,id))throw Error('Сначала выполни задания и проверь критерий дня.');
 const entry=dayProgress(state,id);
 if(entry.completed)return false;
 entry.completed=date;
 if(!state.startDate)state.startDate=addDays(date,1-id);
 for(const caseId of studyDays[id-1].newAlgorithms){
  if(!state.reviews[caseId])state.reviews[caseId]={stage:0,due:addDays(date,1),introduced:date,last:''};
 }
 return true;
}
export function nextDay(state){return studyDays.find(d=>!state.days[d.id]?.completed)?.id||null;}
export function dueReviews(state,date=todayKey()){
 return Object.entries(state.reviews).filter(([,r])=>r.due<=date).sort((a,b)=>a[1].due.localeCompare(b[1].due)||a[0].localeCompare(b[0]));
}
export function recordReview(state,id,remembered,date=todayKey()){
 const review=state.reviews[id];
 if(!review||!validDate(date)||review.due>date)return false;
 review.stage=remembered?Math.min(review.stage+1,REVIEW_INTERVALS.length-1):0;
 review.due=addDays(date,REVIEW_INTERVALS[review.stage]);review.last=date;
 return true;
}
