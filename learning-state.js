import {studyDays} from './curriculum.js';
import {algorithms} from './algorithms.js';
import {lessons} from './lessons.js';
import {normalizePlan,PLAN_KEY,todayKey,addDays,validDate} from './planner-state.js';
import {validatePalette,PALETTE_KEY,DEFAULT_COLORS} from './cube-palette.js';
export const LEARNING_KEY='cfop-academy-learning-v1';
export const CORE_KEY='cfop-academy-v1',THEME_KEY='cfop-academy-theme';
export const RATINGS={confident:'Уверенно',guided:'С подсказками',repeat:'Нужно повторить'};
export const SKILLS={cross:['Крест','Собери крест на перемешанном кубике. Проверь четыре боковых цвета по центрам.'],f2l:['F2L','Собери четыре пары, сохранив крест. Проверь оба нижних слоя.'],oll:['Выполнение OLL','Подготовь знакомый OLL, закрой формулу и выполни решение. Проверь верх и сохранение F2L.'],pll:['Выполнение PLL','Подготовь знакомый PLL, закрой формулу и выполни решение с заключительным U, если он нужен.'],solve:['Полная сборка','Собери перемешанный кубик от начала до конца без формул. Проверь все шесть сторон.']};
export const blankLearning=()=>({version:1,ratings:{},skills:{},recognition:[]});
export function normalizeLearning(v){
 const out=blankLearning();if(!v||v.version!==1)return out;
 for(const d of studyDays){const r=v.ratings?.[d.id];if(r&&Object.hasOwn(RATINGS,r.value)&&validDate(r.date))out.ratings[d.id]={value:r.value,date:r.date};}
 for(const id of Object.keys(SKILLS)){const rows=v.skills?.[id];if(Array.isArray(rows))out.skills[id]=rows.filter(x=>x&&typeof x.success==='boolean'&&validDate(x.date)).slice(-20).map(x=>({success:x.success,date:x.date}));}
 if(Array.isArray(v.recognition))out.recognition=v.recognition.filter(x=>x&&algorithms.some(a=>a.id===x.id)&&typeof x.correct==='boolean'&&validDate(x.date)).slice(-300).map(x=>({id:x.id,correct:x.correct,date:x.date}));
 return out;
}
export function readLearning(storage=localStorage){try{return normalizeLearning(JSON.parse(storage.getItem(LEARNING_KEY)));}catch{return blankLearning();}}
export function writeLearning(v,storage=localStorage){storage.setItem(LEARNING_KEY,JSON.stringify(normalizeLearning(v)));}
export function rateDay(plan,learning,id,value,date=todayKey()){
 if(!studyDays[id-1]||!Object.hasOwn(RATINGS,value)||!validDate(date))throw Error('Некорректная оценка занятия.');
 learning.ratings[id]={value,date};
 if(value!=='confident')for(const caseId of studyDays[id-1].caseIds){const r=plan.reviews[caseId];if(r){const due=addDays(date,value==='repeat'?1:3);if(r.due>due)r.due=due;if(value==='repeat')r.stage=0;}}
}
export function resumeLesson(plan,learning){
 const weak=Object.entries(learning.ratings).filter(([,r])=>r.value==='repeat').sort((a,b)=>b[1].date.localeCompare(a[1].date)||Number(b[0])-Number(a[0]));
 const selected=plan.selectedDay,partial=plan.days[selected];
 const id=weak.length?+weak[0][0]:partial&&!partial.completed?selected:studyDays.find(d=>!plan.days[d.id]?.completed)?.id;
 if(!id)return null;
 const day=studyDays[id-1],entry=plan.days[id],repeat=weak.length>0,task=repeat?0:day.tasks.findIndex((_,i)=>!entry?.checked.includes(i));
 return {day,task,repeat,remaining:repeat?15:day.tasks.reduce((s,t,i)=>s+(entry?.checked.includes(i)?0:t.minutes),0)};
}
export function recordSkill(learning,id,success,date=todayKey()){
 if(!Object.hasOwn(SKILLS,id)||typeof success!=='boolean'||!validDate(date))throw Error('Неизвестный навык.');
 learning.skills[id]=[...(learning.skills[id]||[]),{success,date}].slice(-20);
}
export function recognitionStats(learning,type){const rows=learning.recognition.filter(r=>r.id.startsWith(type.toLowerCase())).slice(-20);return {count:rows.length,correct:rows.filter(r=>r.correct).length,coverage:new Set(learning.recognition.filter(r=>r.id.startsWith(type.toLowerCase())&&r.correct).map(r=>r.id)).size};}
export function normalizeCore(v){
 if(!v||!Array.isArray(v.lessons)||!Array.isArray(v.learned)||!Array.isArray(v.times))throw Error('В копии отсутствует прогресс курса.');
 return {lessons:[...new Set(v.lessons.filter(id=>lessons.some(l=>l.id===id)))],learned:[...new Set(v.learned.filter(id=>algorithms.some(a=>a.id===id)))],lastLesson:lessons.some(l=>l.id===v.lastLesson)?v.lastLesson:'start',times:v.times.filter(t=>t&&Number.isFinite(t.ms)&&t.ms>=0&&['','+2','DNF'].includes(t.penalty)&&typeof t.scramble==='string'&&/^[URFDLBMESxyzurfdlbw2' ()\s]*$/.test(t.scramble)&&typeof t.date==='string'&&Number.isFinite(Date.parse(t.date))).slice(-500).map(t=>({ms:t.ms,penalty:t.penalty,scramble:t.scramble.slice(0,1000),date:t.date.slice(0,40)}))};
}
export function validateBackup(v){
 if(!v||v.app!=='cfop-academy'||v.version!==1||!v.data)throw Error('Это не поддерживаемая резервная копия CFOP Academy.');
 const d=v.data;if(d.plan?.version!==1||d.learning?.version!==1||!['light','dark','system'].includes(d.theme))throw Error('Неполная копия или неизвестная версия данных.');
 return {app:'cfop-academy',version:1,created:typeof v.created==='string'?v.created.slice(0,40):'',data:{core:normalizeCore(d.core),plan:normalizePlan(d.plan),learning:normalizeLearning(d.learning),palette:validatePalette(d.palette),theme:d.theme}};
}
export function makeBackup(storage=localStorage){
 const read=(k,f)=>{const raw=storage.getItem(k);return raw===null?f:JSON.parse(raw);};
 return validateBackup({app:'cfop-academy',version:1,created:new Date().toISOString(),data:{core:read(CORE_KEY,{lessons:[],learned:[],times:[],lastLesson:'start'}),plan:read(PLAN_KEY,normalizePlan(null)),learning:read(LEARNING_KEY,blankLearning()),palette:read(PALETTE_KEY,DEFAULT_COLORS),theme:storage.getItem(THEME_KEY)||'system'}});
}
export function restoreBackup(value,storage=localStorage){
 const {data:d}=validateBackup(value),entries=[[CORE_KEY,JSON.stringify(d.core)],[PLAN_KEY,JSON.stringify(d.plan)],[LEARNING_KEY,JSON.stringify(d.learning)],[PALETTE_KEY,JSON.stringify(d.palette)],[THEME_KEY,d.theme==='system'?null:d.theme]],previous=entries.map(([k])=>[k,storage.getItem(k)]);
 try{for(const [k,v] of entries){if(v===null)storage.removeItem(k);else storage.setItem(k,v);}}
 catch(error){for(const [k,v] of previous){try{if(v===null)storage.removeItem(k);else storage.setItem(k,v);}catch{}}throw Error('Не удалось восстановить копию. Освободи место в браузере.');}
}
