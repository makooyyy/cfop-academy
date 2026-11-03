import test from 'node:test';
import assert from 'node:assert/strict';
import {studyDays,weeks,studyProtocol,planSources} from '../curriculum.js';
import {algorithms} from '../algorithms.js';
import {lessons,examples} from '../lessons.js';
import {blankPlan,normalizePlan,dayProgress,readyToComplete,completeDay,nextDay,dueReviews,recordReview,validDate,addDays,todayKey,REVIEW_INTERVALS} from '../planner-state.js';

test('112 consecutive days form 16 complete weeks with one light day each',()=>{
 assert.equal(studyDays.length,112);assert.equal(weeks.length,16);
 assert.deepEqual(studyDays.map(d=>d.id),Array.from({length:112},(_,i)=>i+1));
 assert.equal(new Set(studyDays.map(d=>d.title)).size,112);
 for(const w of weeks){const days=studyDays.filter(d=>d.week===w.number);assert.equal(days.length,7);assert.equal(days.filter(d=>d.light).length,1);assert.ok(days[6].light);assert.equal(days[6].minutes,15);assert.ok(w.gate.length>40);}
});
test('full coverage: every OLL and PLL is introduced exactly once, at most two per day',()=>{
 const introduced=studyDays.flatMap(d=>d.newAlgorithms);
 assert.equal(introduced.length,78);assert.equal(new Set(introduced).size,78);
 assert.deepEqual([...introduced].sort(),algorithms.map(a=>a.id).sort());
 for(const day of studyDays){assert.ok(day.newAlgorithms.length<=2);if(day.light)assert.equal(day.newAlgorithms.length,0);}
});
test('prerequisites: all basic LL before independent solves, full PLL before new full OLL',()=>{
 const at=id=>studyDays.find(d=>d.newAlgorithms.includes(id)).id;
 for(const a of algorithms.filter(a=>a.basic))assert.ok(at(a.id)<28,a.id);
 for(const a of algorithms.filter(a=>a.type==='PLL'))assert.ok(at(a.id)<=60,a.id);
 for(const a of algorithms.filter(a=>a.type==='OLL'&&!a.basic))assert.ok(at(a.id)>=64&&at(a.id)<=103,a.id);
 for(const day of studyDays)for(const id of day.caseIds.filter(id=>algorithms.some(a=>a.id===id)))assert.ok(at(id)<=day.id,`day ${day.id} refers to future ${id}`);
});
for(const d of studyDays)test(`day ${d.id}: coherent time, actionable content and valid lesson/trainer links`,()=>{
 assert.equal(d.week,Math.ceil(d.id/7));assert.equal(d.tasks.length,4);
 assert.equal(d.tasks.reduce((n,t)=>n+t.minutes,0),d.minutes);
 assert.ok(d.minutes>=15&&d.minutes<=45);
 for(const task of d.tasks){assert.ok(task.minutes>0);assert.ok(task.text.length>=50);assert.ok(task.title);}
 assert.ok(d.goal.length>20);assert.ok(d.criterion.length>40);assert.ok(d.rescue.length>80);
 assert.ok(d.lessonIds.length>0);for(const id of d.lessonIds)assert.ok(lessons.some(l=>l.id===id),id);
 for(const id of d.caseIds)assert.ok([...algorithms,...examples].some(a=>a.id===id),id);
 for(const id of d.newAlgorithms)assert.ok(d.caseIds.includes(id));
 assert.equal(new Set(d.caseIds).size,d.caseIds.length);
});
test('final audits explicitly cover 57 OLL, 21 PLL, cross/F2L and actual solves',()=>{
 const oll=[...studyDays[105].caseIds,...studyDays[106].caseIds];
 assert.equal(oll.length,57);assert.equal(new Set(oll).size,57);
 assert.deepEqual(oll.sort(),algorithms.filter(a=>a.type==='OLL').map(a=>a.id).sort());
 assert.deepEqual([...studyDays[107].caseIds].sort(),algorithms.filter(a=>a.type==='PLL').map(a=>a.id).sort());
 assert.ok(studyDays[108].lessonIds.includes('cross'));assert.ok(studyDays[108].lessonIds.includes('f2l-finish'));
 assert.match(studyDays[109].criterion,/5 попыток/);assert.match(studyDays[111].criterion,/в другой день/);
});
test('all lessons are used; protocol explains starting unsolved, optional pace and honest completion',()=>{
 const covered=new Set(studyDays.flatMap(d=>d.lessonIds));
 for(const l of lessons)assert.ok(covered.has(l.id),l.id);
 assert.match(studyProtocol.start,/перемешанного/);assert.match(studyProtocol.short,/15 минут/);
 assert.match(studyProtocol.scope,/не срок гарантированного/);assert.match(studyProtocol.success,/не видит физический/);
 for(const source of planSources)assert.ok(source.url.startsWith('https://'));
});

const markReady=(state,id)=>{const p=dayProgress(state,id);p.checked=[0,1,2,3];p.goal=true;return p;};
test('completion requires tasks and criterion, does not auto-complete other days',()=>{
 const state=blankPlan();assert.equal(nextDay(state),1);assert.equal(readyToComplete(state,1),false);
 assert.throws(()=>completeDay(state,1,'2026-11-03'));
 const p=dayProgress(state,1);p.checked=[0,1,2,3];assert.equal(readyToComplete(state,1),false);
 p.goal=true;assert.equal(completeDay(state,1,'2026-11-03'),true);assert.equal(nextDay(state),2);
 markReady(state,3);completeDay(state,3,'2026-11-04');assert.equal(nextDay(state),2);
 assert.equal(state.days[1].completed,'2026-11-03');assert.equal(completeDay(state,1,'2026-11-05'),false);
});
test('reviews are scheduled by actual completion date, no future cases or duplicate enrollment',()=>{
 const state=blankPlan();state.startDate='2026-01-01';
 markReady(state,13);completeDay(state,13,'2026-11-03');
 assert.deepEqual(Object.keys(state.reviews).sort(),['oll-26','oll-27']);
 assert.equal(state.reviews['oll-27'].due,'2026-11-04');assert.equal(dueReviews(state,'2026-11-03').length,0);
 assert.equal(dueReviews(state,'2026-11-04').length,2);
 recordReview(state,'oll-27',true,'2026-11-04');assert.equal(state.reviews['oll-27'].due,'2026-11-07');
 state.days[13].completed='';completeDay(state,13,'2026-11-05');assert.equal(state.reviews['oll-27'].due,'2026-11-07');
});
test('successful recalls expand intervals; mistakes return tomorrow; cannot double-rate early',()=>{
 const state=blankPlan();markReady(state,15);completeDay(state,15,'2026-11-03');
 assert.equal(recordReview(state,'oll-21',true,'2026-11-03'),false);
 let date='2026-11-04';
 for(const interval of [3,7,14,30,30]){
  assert.equal(recordReview(state,'oll-21',true,date),true);assert.equal(state.reviews['oll-21'].due,addDays(date,interval));
  assert.equal(recordReview(state,'oll-21',true,date),false);date=state.reviews['oll-21'].due;
 }
 assert.equal(recordReview(state,'oll-21',false,date),true);assert.equal(state.reviews['oll-21'].stage,0);
 assert.equal(state.reviews['oll-21'].due,addDays(date,1));assert.equal(REVIEW_INTERVALS[0],1);
 assert.equal(recordReview(state,'unknown',true,date),false);
});
test('late reviews use actual date instead of producing a catch-up cascade',()=>{
 const state=blankPlan();markReady(state,15);completeDay(state,15,'2026-01-01');
 assert.equal(dueReviews(state,'2026-11-03').length,1);
 recordReview(state,'oll-21',true,'2026-11-03');assert.equal(state.reviews['oll-21'].due,'2026-11-06');
});
test('state restores progress, notes and reviews while sanitizing damaged storage',()=>{
 const state=blankPlan();const p=markReady(state,13);p.note='Работа над U′';completeDay(state,13,'2026-11-03');
 assert.deepEqual(normalizePlan(JSON.parse(JSON.stringify(state))),state);
 const bad={version:1,startDate:'2026-02-30',selectedDay:999,days:{1:{checked:[0,0,1,9,'2'],goal:true,note:'a'.repeat(4000),completed:'2026-11-03'},2:{checked:[0,1,2,3],goal:true,completed:'2026-11-03'}},reviews:{'oll-21':{due:'nonsense',stage:0,introduced:'2026-11-03'},bogus:{due:'2026-11-04',stage:0,introduced:'2026-11-03'}}};
 const clean=normalizePlan(bad);assert.equal(clean.startDate,'');assert.equal(clean.selectedDay,1);assert.equal(clean.days[1].completed,'');assert.deepEqual(clean.days[1].checked,[0,1]);assert.equal(clean.days[1].note.length,3000);assert.equal(clean.days[2].completed,'2026-11-03');assert.deepEqual(clean.reviews,{});
 for(const input of [null,5,[],{}, {version:99}])assert.deepEqual(normalizePlan(input),blankPlan());
});
test('calendar dates survive month, year, leap day and daylight saving boundaries',()=>{
 assert.equal(addDays('2026-12-31',1),'2027-01-01');assert.equal(addDays('2028-02-28',1),'2028-02-29');assert.equal(addDays('2026-03-28',2),'2026-03-30');assert.equal(addDays('2026-10-24',2),'2026-10-26');
 assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2028-02-29'),true);assert.equal(validDate('2026-13-01'),false);assert.equal(validDate('2026-1-1'),false);
 assert.equal(todayKey(new Date(2026,10,3,0,1)),'2026-11-03');assert.throws(()=>addDays('bad',1));
});
test('all completed has no next day but keeps reviews available',()=>{
 const state=blankPlan();for(const d of studyDays){markReady(state,d.id);completeDay(state,d.id,'2026-11-03');}
 assert.equal(nextDay(state),null);assert.equal(Object.keys(state.reviews).length,78);assert.equal(dueReviews(state,'2026-11-04').length,78);
});
