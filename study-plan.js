import {studyDays,weeks,studyProtocol,planSources} from './curriculum.js';
import {algorithms} from './algorithms.js';
import {lessons,examples} from './lessons.js';
import {PLAN_KEY,blankPlan,normalizePlan,todayKey,validDate,addDays,dayProgress,readyToComplete,completeDay,nextDay,dueReviews,recordReview} from './planner-state.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const caseById=new Map([...algorithms,...examples].map(a=>[a.id,a]));
let model=blankPlan(),storageProblem=false,showAllReviews=false;
try{model=normalizePlan(JSON.parse(localStorage.getItem(PLAN_KEY)));}catch{storageProblem=true;}
function persist(){try{localStorage.setItem(PLAN_KEY,JSON.stringify(model));storageProblem=false;}catch{storageProblem=true;}return !storageProblem;}
const dateLabel=value=>validDate(value)?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value+'T12:00:00')):'';
const completeCount=()=>studyDays.filter(d=>model.days[d.id]?.completed).length;
export function planSummary(){return {completed:completeCount(),next:nextDay(model),total:studyDays.length};}
export function curriculumMarkdown(){
 return '# CFOP Academy — 112 занятий\n\n'+Object.values(studyProtocol).join('\n\n')+'\n\n'+weeks.map(w=>`## Неделя ${w.number}. ${w.title}\n\n${w.goal}\n\nКонтроль недели: ${w.gate}\n\n`+studyDays.filter(d=>d.week===w.number).map(d=>`### День ${d.id}. ${d.title} · ${d.minutes} мин\n\n${d.goal}\n\n`+d.tasks.map((t,i)=>`${i+1}. **${t.title} · ${t.minutes} мин.** ${t.text}`).join('\n\n')+`\n\nКритерий: ${d.criterion}\n\nЕсли трудно: ${d.rescue}\n\nУроки: ${d.lessonIds.map(id=>lessons.find(l=>l.id===id).title).join('; ')}.\n\nСлучаи: ${d.caseIds.map(id=>caseById.get(id).name).join(', ')||'без новых формул'}.\n\n[Открыть занятие](https://makooyyy.github.io/cfop-academy/#plan/${d.id})\n`).join('\n')).join('\n')+'\n## Источники и методика\n\nПорядок дней, нагрузка, упражнения и интервалы повторения разработаны для этого курса. Материалы по технике:\n\n'+planSources.map(s=>`- [${s.title}](${s.url})`).join('\n');
}
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function renderStudyPlan(main,requestedDay,toast){
 const selected=studyDays.some(d=>d.id===requestedDay)?requestedDay:nextDay(model)||model.selectedDay;
 model.selectedDay=selected;
 const day=studyDays[selected-1],week=weeks[day.week-1],entry=dayProgress(model,selected),done=completeCount(),next=nextDay(model),today=todayKey();
 const calendar=model.startDate?addDays(model.startDate,selected-1):'';
 main.innerHTML=`<div id="study-plan">
 <div class="page-heading"><div><div class="eyebrow">ОДИН ДЕНЬ. ОДИН ПОНЯТНЫЙ ШАГ.</div><h1>От первого хода<br>до полного CFOP.</h1><p>112 занятий с практикой, повторением и проверкой навыков. Продвигайся в своём темпе.</p></div><button class="secondary" data-plan-action="download">Скачать весь план ↓</button></div>
 <section class="plan-overview" aria-label="Прогресс учебного плана"><div><span class="eyebrow">ТВОЙ МАРШРУТ</span><strong>${done}<span> / 112</span></strong><p>занятий завершено</p></div><div class="plan-overview-copy"><h2>${next?done?'Продолжай с того места, где остановился.':'Сегодня достаточно одного шага.':'Маршрут пройден. Сохраняй навык.'}</h2><p>16 учебных недель · обычно 35 минут · до 45 минут для двух новых случаев · каждый 7-й день — 15 минут повторения.</p><div class="progress-line" aria-label="Выполнено ${done} из 112"><span style="width:${done/112*100}%"></span></div><a class="text-link" href="#plan/${next||112}">${next?'К следующему занятию · день '+next:'К итогам и дальнейшей практике'} →</a></div></section>
 <details class="plan-guide"><summary>Как заниматься, если мало времени или пока ничего не получается</summary><div class="plan-guide-grid">${[['Срок и цель',studyProtocol.scope],['Если кубик уже перемешан',studyProtocol.start],['Как изучать алгоритм',studyProtocol.training],['Как проверять распознавание',studyProtocol.recognition],['Только 15 минут',studyProtocol.short],['Пропуски и перерывы',studyProtocol.pauses],['Повторение по датам',studyProtocol.repeats],['Что означают отметки',studyProtocol.success],['Как разбирать ошибки',studyProtocol.fallback]].map(([title,text])=>`<section><h3>${title}</h3><p>${text}</p></section>`).join('')}</div></details>
 <div class="plan-toolbar"><label for="plan-start">Дата старта <input id="plan-start" type="date" min="2000-01-01" max="2199-08-01" value="${model.startDate}" aria-describedby="calendar-note"></label><p id="calendar-note">Даты — ориентир для одного занятия в день. Паузы не сбрасывают прогресс и не переключают учебный день автоматически.</p><button class="text-link" data-plan-action="journal">Скачать дневник ↓</button></div>
 <div class="plan-layout"><aside class="plan-roadmap" aria-label="Недели обучения"><label for="plan-week" class="field-label">Неделя</label><select id="plan-week">${weeks.map(w=>`<option value="${(w.number-1)*7+1}" ${w.number===week.number?'selected':''}>${w.number}. ${w.title}</option>`).join('')}</select><nav class="week-nav" aria-label="Все 16 недель">${weeks.map(w=>{const n=studyDays.filter(d=>d.week===w.number&&model.days[d.id]?.completed).length;return `<a href="#plan/${(w.number-1)*7+1}" ${w.number===week.number?'aria-current="true"':''}><span class="week-number ${n===7?'finished':''}">${n===7?'✓':String(w.number).padStart(2,'0')}</span><span><small>${esc(w.phase)}</small><strong>${esc(w.title)}</strong></span><span class="week-count">${n}/7</span></a>`;}).join('')}</nav></aside>
 <div class="plan-content"><section class="plan-week-heading"><div class="eyebrow">НЕДЕЛЯ ${week.number} / 16 · ${esc(week.phase)}</div><h2>${esc(week.title)}</h2><p>${esc(week.goal)}</p><div class="day-tabs" role="group" aria-label="Дни недели">${studyDays.filter(d=>d.week===week.number).map(d=>`<a href="#plan/${d.id}" ${d.id===selected?'aria-current="page"':''} class="${model.days[d.id]?.completed?'day-done':''}" aria-label="День ${d.id}: ${esc(d.title)}${model.days[d.id]?.completed?', завершён':''}"><small>ДЕНЬ</small><strong>${d.id}</strong><span>${model.days[d.id]?.completed?'✓':d.light?'Легко':d.minutes+' мин'}</span></a>`).join('')}</div></section>
 <article class="plan-day" aria-labelledby="plan-day-title"><div class="plan-day-meta"><span class="pill pale">День ${selected} · ${day.light?'Повторение':'Практика'}</span><span>${day.minutes} мин${calendar?' · ориентир: '+dateLabel(calendar):''}</span></div><h2 id="plan-day-title">${esc(day.title)}</h2><p class="day-goal">${esc(day.goal)}</p>
 ${selected>1&&!model.days[selected-1]?.completed?'<p class="plan-caution">Можно посмотреть любой день. Если предыдущая тема ещё не освоена, сначала вернись к ней — новые задания опираются на пройденное.</p>':''}
 <div class="plan-resources"><span>Материалы дня</span>${day.lessonIds.map(id=>`<button class="plan-resource" data-lesson="${id}">▤ ${esc(lessons.find(l=>l.id===id).title)}</button>`).join('')}${selected===1?'<a class="plan-resource" href="#cube-settings">◈ Настроить цвета кубика</a>':''}${selected>=40?'<a class="plan-resource" href="#timer">◷ Открыть таймер</a>':''}</div>
 ${day.caseIds.length?`<div class="plan-cases"><p>${day.newAlgorithms.length?'Новые случаи выделены. Каждая кнопка открывает подготовку, затем решение.':'Случаи для практики. Кнопка открывает подготовку из собранного кубика.'}</p><div>${day.caseIds.map(id=>`<button data-train="${id}" class="${day.newAlgorithms.includes(id)?'new-case':''}">${esc(caseById.get(id).name)}${day.newAlgorithms.includes(id)?'<small>новый</small>':''} ↗</button>`).join('')}</div></div>`:''}
 <ol class="plan-tasks">${day.tasks.map((t,i)=>`<li><label class="plan-task-check"><input type="checkbox" data-plan-task="${i}" ${entry.checked.includes(i)?'checked':''}><span class="task-number">${i+1}</span><span><strong>${esc(t.title)}</strong><small>${t.minutes} мин</small></span></label><p>${esc(t.text)}</p></li>`).join('')}</ol>
 <section class="plan-criterion"><span class="eyebrow">КАК ПОНЯТЬ, ЧТО ПОЛУЧИЛОСЬ</span><p>${esc(day.criterion)}</p><label><input type="checkbox" id="plan-goal" ${entry.goal?'checked':''}> Я проверил критерий и могу подтвердить результат</label></section>
 <details class="plan-rescue"><summary>Не получается — что делать</summary><p>${esc(day.rescue)}</p><p>${studyProtocol.short}</p><button class="text-link" data-lesson="first-solve">Восстановить кубик с подсказками →</button></details>
 <label class="plan-note-label" for="plan-note">Дневник этого дня <span>Что получилось, где остановился, что повторить</span></label><textarea id="plan-note" rows="4" maxlength="3000" placeholder="Например: 4 из 5 крестов верно. Путаю направление U′. Завтра начну с него.">${esc(entry.note)}</textarea><p id="plan-save-status" class="plan-save-status" role="status">${storageProblem?'Браузер не разрешил прочитать или сохранить прогресс. Скачай дневник перед закрытием.':'Записи и отметки хранятся в этом браузере.'}</p>
 <div class="plan-day-bottom"><button class="${entry.completed?'secondary':'primary'}" id="complete-plan-day" data-plan-action="complete" ${!entry.completed&&!readyToComplete(model,selected)?'disabled':''}>${entry.completed?'✓ День завершён · вернуть в работу':'Завершить день '+selected}</button><span id="plan-completion-help">${entry.completed?'Завершён '+dateLabel(entry.completed):'Сначала отметь 4 задания и проверь критерий.'}</span></div>
 <div class="plan-day-navigation">${selected>1?`<a href="#plan/${selected-1}">← День ${selected-1}</a>`:'<span></span>'}${selected<112?`<a href="#plan/${selected+1}">Посмотреть день ${selected+1} →</a>`:'<a href="#plan/1">Вернуться к началу →</a>'}</div></article>
 <section class="plan-gate"><span>✓</span><div><h3>Контроль недели ${week.number}</h3><p>${esc(week.gate)}</p><small>Не выполнено? Повтори слабые дни. Календарь — ориентир, а не повод идти дальше без понимания.</small></div></section>
 <section class="plan-reviews" id="plan-reviews" aria-labelledby="review-title"></section>
 <details class="plan-guide"><summary>Полная программа и источники</summary><p>В плане отдельно введены все 57 OLL и 21 PLL; базовые случаи включены в эти числа. F2L изучается через понимание пар, а не заучивание 41 формулы. Дни 106–112 посвящены итоговой проверке всего набора и реальных сборок.</p><p>Порядок дней, упражнения, нагрузка и интервалы повторения — авторская программа этого сайта. Техническая основа и дополнительные объяснения:</p><ul>${planSources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></li>`).join('')}</ul></details>
 </div></div></div>`;
 const root=main.querySelector('#study-plan');
 function saveFeedback(){const ok=persist();root.querySelector('#plan-save-status').textContent=ok?'✓ Сохранено в этом браузере.':'Не удалось сохранить. Скачай дневник перед закрытием вкладки.';}
 function refreshCompletion(){const button=root.querySelector('#complete-plan-day');button.disabled=!entry.completed&&!readyToComplete(model,selected);root.querySelector('#plan-completion-help').textContent=entry.completed?'Завершён '+dateLabel(entry.completed):readyToComplete(model,selected)?'Все задания отмечены. Можно завершить день.':'Сначала отметь 4 задания и проверь критерий.';}
 function renderReviews(){
  const due=dueReviews(model),rows=showAllReviews?due:due.slice(0,6),total=Object.keys(model.reviews).length;
  root.querySelector('#plan-reviews').innerHTML=`<div class="section-heading"><div><div class="eyebrow">ПАМЯТЬ НУЖДАЕТСЯ В ПРАКТИКЕ</div><h2 id="review-title">Повторить сегодня <span>${due.length}</span></h2></div></div><p>${due.length?'Сначала проверь случай без формулы, затем оцени результат. Достаточно 5–6 случаев за короткий блок; остальные останутся в очереди.':'На сегодня очередь пуста. '+(total?'Следующие проверки появятся по своим датам.':'После завершения дня с новыми алгоритмами они появятся здесь на следующий день.')}</p>${due.length>6?'<p class="plan-caution">Накопились повторы. Новые формулы можно отложить и посвятить занятие этой очереди.</p>':''}<div class="review-rows">${rows.map(([id,r])=>`<div class="review-row"><button class="text-link" data-train="${id}">${esc(caseById.get(id).name)} ↗</button><span>${r.due<today?'С '+dateLabel(r.due):'Сегодня'}</span><button class="secondary" data-review="${id}" data-remembered="yes" aria-label="${esc(caseById.get(id).name)}: помню">Помню</button><button class="secondary" data-review="${id}" data-remembered="no" aria-label="${esc(caseById.get(id).name)}: нужно повторить">Нужно повторить</button></div>`).join('')}</div>${due.length>6?`<button class="text-link" data-plan-action="reviews">${showAllReviews?'Свернуть список':'Показать всю очередь'}</button>`:''}<small>Интервалы: 1 → 3 → 7 → 14 → 30 дней, затем каждые 30 дней. После ошибки — снова завтра. Закрытие учебного дня не отмечает алгоритм «выученным» в каталоге.</small>`;
 }
 renderReviews();
 root.addEventListener('change',e=>{
  if(e.target.id==='plan-week'){location.hash='plan/'+e.target.value;return;}
  if(e.target.id==='plan-start'){
   if(e.target.value&&!validDate(e.target.value)){toast('Выбери корректную дату.');return;}
   model.startDate=e.target.value;persist();renderStudyPlan(main,selected,toast);return;
  }
  if(e.target.dataset.planTask!==undefined||e.target.id==='plan-goal'){
   if(e.target.id==='plan-goal')entry.goal=e.target.checked;
   else{const n=+e.target.dataset.planTask;entry.checked=entry.checked.filter(i=>i!==n);if(e.target.checked)entry.checked.push(n);}
   if(entry.completed&&!readyToComplete(model,selected)){entry.completed='';saveFeedback();renderStudyPlan(main,selected,toast);return;}
   saveFeedback();refreshCompletion();
  }
 });
 root.querySelector('#plan-note').addEventListener('input',e=>{entry.note=e.target.value;saveFeedback();});
 root.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.review){recordReview(model,button.dataset.review,button.dataset.remembered==='yes');saveFeedback();renderReviews();return;}
  const action=button.dataset.planAction;
  if(action==='complete'){
   if(entry.completed){entry.completed='';toast('День возвращён в работу. Расписание повторений сохранено.');}
   else{try{completeDay(model,selected);toast('День '+selected+' завершён. Продолжай в своём темпе.');}catch(err){toast(err.message);return;}}
   persist();renderStudyPlan(main,selected,toast);return;
  }
  if(action==='reviews'){showAllReviews=!showAllReviews;renderReviews();}
  if(action==='download')download(curriculumMarkdown(),'cfop-plan-112-days.md','text/markdown;charset=utf-8');
  if(action==='journal'){
   const notes=studyDays.filter(d=>model.days[d.id]).map(d=>{const p=model.days[d.id];return `## День ${d.id}. ${d.title}\n\n${p.completed?'Завершён: '+p.completed:'В работе'} · задания ${p.checked.length}/4 · критерий ${p.goal?'подтверждён':'не подтверждён'}\n\n${p.note||'Без записи'}\n`;}).join('\n');
   download('# Мой дневник CFOP\n\n'+notes+'\n## Следующие повторения\n\n'+Object.entries(model.reviews).sort((a,b)=>a[1].due.localeCompare(b[1].due)).map(([id,r])=>`${caseById.get(id).name}: ${r.due}`).join('\n'),'cfop-study-journal.md','text/markdown;charset=utf-8');
  }
 });
}
