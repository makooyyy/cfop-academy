import {algorithms} from './algorithms.js';
import {solved,apply,inverse,facelets,netSVG} from './cube.js';
import {readLearning,writeLearning} from './learning-state.js';
import {todayKey} from './planner-state.js';
const shuffle=items=>items.map(value=>({value,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.value);
export function makeQuestion(pool,previous=''){
 if(pool.length<4)throw Error('Для упражнения нужны минимум четыре случая.');
 const answer=shuffle(pool.filter(a=>a.id!==previous))[0],rotation=['','U','U2',"U'"][Math.floor(Math.random()*4)];
 return {answer,rotation,cube:apply(solved(),inverse(answer.alg)+' '+rotation),options:shuffle([answer,...shuffle(pool.filter(a=>a.id!==answer.id)).slice(0,3)])};
}
export function recognitionClues(cube,type){
 if(type==='OLL')return ['На верхней грани '+facelets(cube,'U').filter(s=>s.color==='U').length+' наклеек цвета U (включая центр).',...['F','R','B','L'].map(f=>`${f}: цвет U в верхнем ряду — ${facelets(cube,f).slice(0,3).map((s,i)=>s.color==='U'?['слева','в центре','справа'][i]:null).filter(Boolean).join(', ')||'отсутствует'}.`)];
 return ['Верх уже ориентирован. Сравни все четыре боковые полосы, не только одну.',...['F','R','B','L'].map(f=>{const row=facelets(cube,f).slice(0,3).map(s=>s.color);return `${f}: ${row.join(' · ')}${row[0]===row[2]?' — крайние наклейки совпадают («фары»)':''}${row.every(x=>x===row[0])?' — полная полоса':''}.`;})];
}
export function renderRecognition(main,toast){
 let type='OLL',basic=true,question,answered=false,round=0,score=0,previous='';
 main.innerHTML='<div class="page-heading"><div><div class="eyebrow">СНАЧАЛА УЗНАЙ. ПОТОМ ВРАЩАЙ.</div><h1>Распознавание случаев</h1><p>10 вопросов без формулы. Случай повёрнут случайным U; сопоставь верх и боковые наклейки.</p></div></div><section class="learning-card"><div class="recognition-toolbar"><label>Этап <select id="recognition-type"><option>OLL</option><option>PLL</option></select></label><label class="check"><input id="recognition-basic" type="checkbox" checked> Только базовые 2-look</label><button class="secondary" id="recognition-restart">Новая серия</button></div><div id="recognition-question"></div></section>';
 const root=main.querySelector('#recognition-question');
 const pool=()=>algorithms.filter(a=>a.type===type&&(!basic||a.basic));
 function next(){question=makeQuestion(pool(),previous);previous=question.answer.id;answered=false;draw();}
 function draw(){
  if(round===10){root.innerHTML=`<div class="recognition-result" role="status"><h2>${score} из 10</h2><p>Это результат распознавания в этой серии, а не оценка выполнения алгоритмов. Ошибочные случаи стоит разобрать в тренажёре.</p><button class="primary" id="recognition-again">Ещё 10 вопросов</button><a class="secondary" href="#progress">Посмотреть навыки</a></div>`;root.querySelector('button').onclick=restart;return;}
  root.innerHTML=`<p class="recognition-counter">Вопрос ${round+1} / 10 · верно ${score}</p><div class="recognition-diagram">${netSVG(question.cube,{mask:type==='OLL',label:'Определи случай по рисунку',small:type==='OLL'})}</div><p>${type==='OLL'?'Выделен только цвет верхнего центра U. Обязательно сравни боковые наклейки.':'Буквы обозначают цвета центров. Сравни перестановку боковых полос.'}</p><div class="recognition-answers">${question.options.map(a=>`<button class="secondary" data-recognition-answer="${a.id}">${a.name}</button>`).join('')}</div><div id="recognition-feedback" role="status"></div>`;
 }
 function restart(){round=0;score=0;previous='';next();}
 root.onclick=e=>{
  const b=e.target.closest('[data-recognition-answer]');if(!b||answered)return;answered=true;
  const correct=b.dataset.recognitionAnswer===question.answer.id;score+=Number(correct);
  const data=readLearning();data.recognition.push({id:question.answer.id,correct,date:todayKey()});try{writeLearning(data);}catch{toast('Результат не сохранён: проверь доступ к хранилищу.');}
  root.querySelectorAll('[data-recognition-answer]').forEach(el=>{el.disabled=true;el.classList.toggle('answer-right',el.dataset.recognitionAnswer===question.answer.id);if(el===b&&!correct)el.classList.add('answer-wrong');});
  root.querySelector('#recognition-feedback').innerHTML=`<h2>${correct?'Верно':'Правильный ответ'}: ${question.answer.name}</h2><p>Семейство: ${question.answer.group}. Признаки именно показанного положения:</p><ul>${recognitionClues(question.cube,type).map(s=>`<li>${s}</li>`).join('')}</ul><details><summary>Сравнить схемы четырёх вариантов</summary><p>Все варианты ниже показаны с тем же предварительным U-поворотом. Сопоставь рисунок и боковые наклейки.</p><div class="recognition-comparison">${question.options.map(a=>`<div><strong>${a.name}</strong>${netSVG(apply(solved(),inverse(a.alg)+' '+question.rotation),{mask:type==='OLL',small:true,label:a.name})}</div>`).join('')}</div></details><p>Для отработки руками тренажёр начнёт с подготовки из собранного кубика, в исходном хвате выбранного алгоритма.</p><button class="secondary" data-train="${question.answer.id}">Подготовка и решение →</button> <button class="primary" id="recognition-next">${round===9?'Результат серии':'Следующий случай'} →</button>`;
  root.querySelector('#recognition-next').onclick=()=>{round++;if(round===10)draw();else next();root.setAttribute('tabindex','-1');root.focus({preventScroll:true});root.scrollIntoView({block:'start'});};
 };
 main.querySelector('#recognition-type').onchange=e=>{type=e.target.value;restart();};
 main.querySelector('#recognition-basic').onchange=e=>{basic=e.target.checked;restart();};
 main.querySelector('#recognition-restart').onclick=restart;next();
}
