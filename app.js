import {resumeCard,mountProgress} from './learning-ui.js';
import {renderRecognition} from './recognition.js';
import { algorithms } from './algorithms.js';
import { lessons,examples } from './lessons.js';
import {solved,apply,move,inverse,tokens,netSVG,isoSVG,scramble,isSolved} from './cube.js';
import {effective,average5,formatTime} from './stats.js';
import {animatedCubeSVG} from './cube-view.js?v=learn-1';
import {ReleaseTimerKeys,acceptsTimerKey} from './timer-keys.js';
import {colors,DEFAULT_COLORS,FACE_LABELS,STANDARD_NAMES,PALETTE_KEY,setCubePalette,isCustomPalette} from './cube-palette.js';
import {GuidedPractice,moveInstruction} from './trainer-guide.js';
import {renderCubeSettings} from './cube-settings.js';
import {renderStudyPlan,planSummary} from './study-plan.js?v=learn-1';
try{const stored=localStorage.getItem(PALETTE_KEY);if(stored)setCubePalette(JSON.parse(stored));}catch{setCubePalette(DEFAULT_COLORS);}
const $=s=>document.querySelector(s), main=$('#main'),key='cfop-academy-v1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={lessons:[],learned:[],times:[],lastLesson:'start'};
try{const data=JSON.parse(localStorage.getItem(key));if(data&&Array.isArray(data.lessons)&&Array.isArray(data.learned)&&Array.isArray(data.times)){state={...state,...data,lessons:data.lessons.filter(id=>lessons.some(l=>l.id===id)),learned:data.learned.filter(id=>algorithms.some(a=>a.id===id)),times:data.times.filter(t=>Number.isFinite(t.ms)&&t.ms>=0&&['','+2','DNF'].includes(t.penalty)).slice(-500)};}}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{toast('Не удалось сохранить прогресс: проверь свободное место и настройки браузера.');}}
let toastHandle;function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastHandle);toastHandle=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
const pct=()=>Math.round(state.lessons.length/lessons.length*100);
const timerKeys=new ReleaseTimerKeys();
let autoPlaying=false,turnAnimation=null,turnFrame=null;
let trainerPractice=null,trainerSignature='',trainerSpeed='1000',trainerPlanDay=0;
const allCases=[...examples,...algorithms];let activeRoute='',playHandle=null,clockFrame=null,running=false,startAt=0,currentScramble=scramble(),trainerCase=algorithms.find(a=>a.id==='oll-27'),trainerIndex=0,trainerHidden=false,trainerCube,trainerMoves,trainerInitial;
function heading(kicker,title,sub,action=''){return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${sub}</p></div>${action}</div>`;}
function stageCard(n,title,en,desc,cls,lesson){return `<button class="stage-card ${cls}" data-lesson="${lesson}"><div class="stage-top"><span class="stage-number">0${n}</span><span>↗</span></div><div class="stage-symbol">${['✚','▦','▧','⇄'][n-1]}</div><h3>${title}</h3><span class="stage-en">${en}</span><p>${desc}</p><span class="stage-link">Открыть этап <span>→</span></span></button>`;}
function planCard(){const p=planSummary();return '<section class="plan-home-link"><div><strong>Твой план на каждый день</strong><p>112 занятий · 16 учебных недель · '+p.completed+' завершено</p></div><a href="#plan/'+(p.next||112)+'" class="text-link">'+(p.completed?'Продолжить маршрут':'Открыть программу')+' →</a></section>';}
function home(){const p=planSummary();main.innerHTML=heading('УЧИСЬ. ПРАКТИКУЙСЯ. ЗАМЕЧАЙ ПРОГРЕСС.','Каждый ход —<br>шаг к пониманию.','Твоё пространство для изучения кубика. От первой пары до уверенного CFOP.')+`
${resumeCard()}<section class="hero"><div class="hero-copy"><span class="pill">МЕТОД ФРИДРИХ · КУБИК 3×3</span><h2>Пойми кубик.<br><em>Найди свой ритм.</em></h2><p>Понятные уроки, объёмный тренажёр и план на каждый день. Всё, чтобы собрать кубик своими руками.</p><div class="hero-actions"><a class="primary" href="#plan/${p.next||112}">${p.completed?'Продолжить маршрут':'Начать маршрут'} <span>↗</span></a><a class="hero-secondary" href="#trainer">К тренажёру <span>→</span></a></div><div class="hero-meta"><span>В своём темпе</span><span>Без регистрации</span></div></div><div class="hero-art"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><span class="art-label label-u">U · верхняя</span>${isoSVG(solved())}<span class="art-label label-f">F · передняя</span><span class="art-label label-r">R · правая</span><div class="art-caption">CROSS / F2L / OLL / PLL</div></div></section>
<section class="hero-facts" aria-label="Что есть в курсе"><div><strong>13</strong><span>уроков<br>от простого к сложному</span></div><div><strong>78</strong><span>алгоритмов<br>с пошаговым разбором</span></div><div><strong>112</strong><span>занятий<br>в твоём учебном плане</span></div></section>
<div class="section-heading"><div><div class="eyebrow">ТВОЯ КАРТА СБОРКИ</div><h2>Четыре этапа. Один результат.</h2><p>Разберись с каждым — и кубик сложится.</p></div><a href="#course">Все уроки ↗</a></div><section class="stage-grid">${stageCard(1,'Крест','CROSS','Четыре ребра. Основа для всей сборки.','mint','cross')}${stageCard(2,'Первые два слоя','FIRST TWO LAYERS','Находи, соединяй и вставляй пары.','peach','f2l-pair')}${stageCard(3,'Верхняя сторона','ORIENT LAST LAYER','Разверни детали последнего слоя.','yellow','oll-edges')}${stageCard(4,'Финальная сборка','PERMUTE LAST LAYER','Расставь детали. Кубик собран.','lavender','pll-corners')}</section>
${planCard()}<div class="overview-strip"><div><span class="strip-icon">↗</span><div><strong>Твой прогресс</strong><p>${state.lessons.length} из 13 уроков пройдено</p></div></div><div class="progress-line"><span style="width:${pct()}%"></span></div><strong>${pct()}%</strong><a href="#progress">Подробнее →</a></div>
<div class="bottom-grid"><section class="practice-callout"><div><span class="eyebrow">ОТ ПОНИМАНИЯ К ПРИВЫЧКЕ</span><h2>Смотри. Повторяй.<br>Пробуй самостоятельно.</h2><p>Каждый поворот — в анимации, каждый шаг — с пояснением.</p><a href="#trainer" class="text-link">Начать практику →</a></div><span class="practice-art">R U R′ U′</span></section><section class="tip-card"><span class="eyebrow">ХОРОШАЯ ПРИВЫЧКА</span><span class="tip-star">✳</span><h3>Сначала плавно.<br>Потом быстро.</h3><p>Одна осмысленная сборка полезнее десяти попыток наугад. Дай себе время увидеть следующую пару.</p></section></div>`;}
function course(){main.innerHTML=heading('ТВОЙ УЧЕБНЫЙ МАРШРУТ','От знакомства до полной сборки','Все уроки открыты. Начинай с основ или переходи к нужному этапу.')+planCard()+`<div class="course-layout"><section class="lesson-list">${lessons.map((l,i)=>`<button class="lesson-row" data-lesson="${l.id}"><span class="lesson-index ${state.lessons.includes(l.id)?'done':''}">${state.lessons.includes(l.id)?'✓':String(i+1).padStart(2,'0')}</span><span class="lesson-info"><small>${l.stage}</small><strong>${l.title}</strong><span>${l.time} мин · теория + практика</span></span><span class="row-arrow">→</span></button>`).join('')}</section><aside class="course-note"><span class="eyebrow">ТВОЯ ЦЕЛЬ</span>${isoSVG(solved())}<h3>Одна полная сборка.<br>Без подсказок.</h3><p>Первые 11 уроков доведут тебя до сборки с 2-look OLL и PLL. Затем — полный CFOP и работа над скоростью.</p><div class="progress-line"><span style="width:${pct()}%"></span></div><p>${pct()}% пути пройдено</p></aside></div>`;}
function colorReference(){return isCustomPalette()?'<div class="color-reference"><strong>Твои цвета в этом уроке</strong><p>Названия в тексте относятся к стандартной схеме. Сопоставляй их с выбранными цветами:</p><div>'+Object.keys(DEFAULT_COLORS).map(face=>`<span><i style="background:${colors[face]}"></i>${STANDARD_NAMES[face]} = ${face}</span>`).join('')+'</div></div>':'';}
function cubeSwatches(){return ['U','D','F','B','R','L'].map(face=>`<span><i style="background:${colors[face]}"></i>${face} · ${FACE_LABELS[face].toLowerCase()}</span>`).join('');}
function openLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return;state.lastLesson=id;save();const i=lessons.indexOf(l);$('#lesson-body').innerHTML=`<div class="eyebrow">УРОК ${String(i+1).padStart(2,'0')} / 13 · ${esc(l.tag)}</div><h2 id="lesson-title">${l.title}</h2><p class="lesson-intro">${l.intro}</p>${colorReference()}${l.sections.map(([h,p],i)=>`<section class="lesson-section"><span>${i+1}</span><div><h3>${h}</h3><p>${p}</p></div></section>`).join('')}${l.demo?`<div class="lesson-demo"><div>${netSVG(apply(solved(),inverse(l.demo)),{label:'Начальное положение учебного примера'})}</div><div><span class="eyebrow">ПОВТОРИ ПО ШАГАМ</span><code>${esc(l.demo)}</code><p>Схема показывает точное начальное положение. Чтобы получить его на собранном кубике, выполни обратную последовательность.</p><button class="secondary" data-demo="${id}">Разобрать в тренажёре →</button></div></div>`:''}<div class="practice-box"><strong>Твоя практика</strong><p>${l.practice}</p></div><section class="quiz"><h3>Проверь понимание</h3><p>${l.quiz.q}</p><div>${l.quiz.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}" data-for="${id}">${o}</button>`).join('')}</div><p id="quiz-feedback" role="status"></p></section><div class="lesson-bottom"><button class="${state.lessons.includes(id)?'secondary':'primary'}" data-complete="${id}">${state.lessons.includes(id)?'✓ Урок пройден · отменить':'Я выполнил практику · отметить урок'}</button>${i<lessons.length-1?`<button class="text-link" data-lesson="${lessons[i+1].id}">Следующий урок →</button>`:''}</div>`;if(!$('#lesson-dialog').open)$('#lesson-dialog').showModal();$('#lesson-dialog').scrollTop=0;}
let algFilter='ALL',algSearch='',basicOnly=false,unlearnedOnly=false;
function library(){main.innerHTML=heading('ТВОЯ БИБЛИОТЕКА ДВИЖЕНИЙ','Алгоритмы, которые складываются','57 OLL и 21 PLL. Схема каждого случая вычислена по обратному алгоритму.')+`<div class="library-tools"><div class="segmented" role="group" aria-label="Тип алгоритмов">${['ALL','OLL','PLL'].map(t=>`<button data-filter="${t}" class="${algFilter===t?'selected':''}">${t==='ALL'?'Все 78':t}</button>`).join('')}</div><label class="search-label"><span>⌕</span><input id="alg-search" type="search" placeholder="Найти: Sune, OLL 27, T…" value="${esc(algSearch)}" aria-label="Поиск алгоритмов"></label><label class="check"><input id="basic-only" type="checkbox" ${basicOnly?'checked':''}> Базовые 2-look</label><label class="check"><input id="unlearned-only" type="checkbox" ${unlearnedOnly?'checked':''}> Ещё не выучены</label></div><div class="info-note">OLL: сравни рисунок цвета верхнего центра U, включая боковые наклейки. PLL: сравни все верхние боковые цвета. Вращай U или меняй хват y перед алгоритмом, пока положение не совпадёт.</div><div id="alg-results"></div>`;renderAlgs();$('#alg-search').addEventListener('input',e=>{algSearch=e.target.value;renderAlgs();});$('#basic-only').addEventListener('change',e=>{basicOnly=e.target.checked;renderAlgs();});$('#unlearned-only').addEventListener('change',e=>{unlearnedOnly=e.target.checked;renderAlgs();});}
function renderAlgs(){const q=algSearch.toLowerCase().trim();const list=algorithms.filter(a=>(algFilter==='ALL'||a.type===algFilter)&&(!basicOnly||a.basic)&&(!unlearnedOnly||!state.learned.includes(a.id))&&`${a.name} ${a.group} ${a.id==='oll-27'?'Sune':a.id==='oll-26'?'Anti-Sune':''}`.toLowerCase().includes(q));$('#alg-results').innerHTML=`<p class="result-count">${list.length} случаев · выучено ${state.learned.length} из 78</p><div class="algorithm-grid">${list.map(a=>`<article class="alg-card"><div class="alg-top"><span class="case-type">${a.type}</span><button class="learn-toggle ${state.learned.includes(a.id)?'is-learned':''}" data-learn="${a.id}" aria-label="${state.learned.includes(a.id)?'Отменить изучение':'Отметить выученным'} ${a.name}" aria-pressed="${state.learned.includes(a.id)}">${state.learned.includes(a.id)?'✓ Выучен':'+ Учить'}</button></div><div class="alg-diagram">${netSVG(apply(solved(),inverse(a.alg)),{mask:a.type==='OLL',small:true,label:`Начальное положение ${a.name}`})}</div><div class="alg-title"><h3>${a.name}${a.id==='oll-27'?' · Sune':a.id==='oll-26'?' · Anti-Sune':''}</h3><span>${a.group}</span></div><code>${esc(a.alg)}</code><button class="card-action" data-train="${a.id}">Разобрать по шагам <span>→</span></button></article>`).join('')}</div>${!list.length?'<div class="empty">Ничего не найдено. Измени запрос или отключи фильтры.</div>':''}`;}
function setupTrainer(){
 cancelTrainerMotion();trainerPractice=new GuidedPractice(trainerCase.alg);
 trainerSignature=trainerCase.id+'|'+trainerCase.alg;resetTrainerStage();
}
function resetTrainerStage(){cancelTrainerMotion();trainerMoves=trainerPractice.moves;trainerInitial=trainerPractice.initial;trainerCube=trainerInitial;trainerIndex=0;}
function trainer(){
 if(!trainerPractice||trainerSignature!==trainerCase.id+'|'+trainerCase.alg)setupTrainer();
 main.innerHTML=heading('ПОДГОТОВЬ. ПОВТОРИ. РЕШИ.','Практика по шагам','Возьми собранный кубик. Повторяй подготовку по шагам, после чего переходи к решению.')+`
 <div class="practice-nav"><a class="secondary" href="#recognition">Проверить распознавание →</a></div>${trainerPlanDay?`<a class="trainer-plan-back" href="#plan/${trainerPlanDay}">← К занятию · день ${trainerPlanDay}</a>`:''}<div id="trainer-steps" class="trainer-steps"></div>
 <div class="trainer-layout"><section class="simulator"><div class="simulator-top"><span class="pill pale" id="trainer-name"></span><label class="check"><input id="hide-alg" type="checkbox"> Скрыть решение</label></div>
 <details class="trainer-help"><summary>Как проходить этот этап</summary><div id="stage-intro" class="stage-intro"></div></details><div id="cube-stage"></div> <div class="playback"><button class="secondary square" data-control="reset" aria-label="В начало этапа">↺</button><button class="secondary square" data-control="prev" aria-label="Предыдущий ход">←</button><button class="primary" data-control="play" id="play-btn">▶ Воспроизвести</button><button class="secondary square" data-control="next" aria-label="Следующий ход">→</button><label class="speed-label">Скорость<select id="play-speed" aria-label="Скорость воспроизведения">${[['1000','Медленно'],['550','Обычно'],['250','Быстро']].map(([value,title])=>`<option value="${value}" ${value===trainerSpeed?'selected':''}>${title}</option>`).join('')}</select></label></div><div class="cube-legend">${cubeSwatches()}</div>
 <div id="move-instruction" class="move-instruction" aria-live="polite"></div>

 <div id="step-status" role="status" aria-live="polite"></div><div id="move-list"></div><div id="phase-action"></div></section>
 <aside class="trainer-panel"><h3>Что тренируем?</h3><label class="field-label" for="case-select">Случай</label><select id="case-select">${[...new Set(allCases.map(a=>a.type))].map(t=>`<optgroup label="${t}">${allCases.filter(a=>a.type===t).map(a=>`<option value="${a.id}" ${a.id===trainerCase.id?'selected':''}>${a.name}</option>`).join('')}</optgroup>`).join('')}${trainerCase.id==='custom'||trainerCase.id.startsWith('lesson-')?`<option value="${trainerCase.id}" selected>${esc(trainerCase.name)}</option>`:''}</select>
 <div class="button-row"><button class="secondary" data-control="random">⇄ Случайный</button><button class="secondary" data-control="copy">Копировать ходы</button></div>
 <a class="cube-settings-link" href="#cube-settings"><span>◈</span><span>Цвета моего кубика<small>Настроить шесть граней →</small></span></a>
 <div class="info-note"><strong>Перед первым ходом</strong><p>Нужен собранный кубик. Держи выбранный центр U сверху, F спереди, R справа. Сверь остальные центры с развёрткой. После перехвата x, y или z следуй новому положению модели.</p></div>
 <details><summary>Все ходы подготовки</summary><p>Это обратная последовательность: она создаёт выбранный случай из собранного кубика.</p><code id="setup-alg"></code></details>
 <details><summary>Своя последовательность</summary><label class="field-label" for="custom-alg">Формула решения (до 100 ходов)</label><textarea id="custom-alg" rows="3" placeholder="R U R' U'"></textarea><button class="secondary" data-control="custom">Загрузить</button><p id="custom-error" role="alert"></p></details>
 <p class="small-text">При выборе нового случая подготовка начинается заново. «Случайный» выбирает случай из текущей группы.</p><button class="text-link" data-control="scramble">Свободное перемешивание →</button><button class="text-link restart-guide" data-control="prepare">Начать заново с собранного кубика ↺</button></aside></div>`;
 renderTrainer();
 $('#case-select').addEventListener('change',e=>{trainerCase=allCases.find(a=>a.id===e.target.value)||trainerCase;setupTrainer();renderTrainer();});
 $('#hide-alg').addEventListener('change',e=>{trainerHidden=e.target.checked;renderTrainer();});
 $('#play-speed').addEventListener('change',()=>{trainerSpeed=$('#play-speed').value;if(playHandle){clearTimeout(playHandle);playHandle=null;if(autoPlaying)nextStep();}});
}
function trainerVisualOptions(){return {highlightToken:(!trainerPractice.preparing&&trainerHidden)?null:turnAnimation?.token||trainerMoves[trainerIndex],focusColors:trainerCase.type==='F2L'?(trainerCase.id==='f2l-left'?['DFL','FL']:['DFR','FR']):[]};}
function renderTrainer(){
 const turning=turnAnimation,preparing=trainerPractice.preparing,finished=trainerIndex===trainerMoves.length&&!turning;
 const hidden=!preparing&&trainerHidden;
 $('#trainer-name').textContent=trainerCase.name;
 $('#hide-alg').disabled=preparing;$('#hide-alg').checked=hidden;
 $('#trainer-steps').innerHTML=`<div class="${preparing?'active':'completed'}"><span>${preparing?'1':'✓'}</span><div><strong>Создай положение</strong><small>Из собранного кубика</small></div></div><span class="phase-arrow">→</span><div class="${preparing?'locked':'active'}"><span>2</span><div><strong>Разбери решение</strong><small>${preparing?'После подготовки':'Из полученного положения'}</small></div></div>`;
 $('#stage-intro').innerHTML=preparing?'<strong>Этап 1 · Подготовка</strong><p>Повторяй каждый ход на физическом кубике. «Следующий ход» показывает движение; текст объясняет, как его выполнить.</p>':'<strong>Этап 2 · Решение</strong><p>Сохрани хват после подготовки. Теперь выполняем алгоритм, который вернёт кубик в собранное состояние.</p>';
 $('#cube-stage').innerHTML=`<div class="iso-view"><div class="cube-render">${animatedCubeSVG(trainerCube,turning?.token,turning?.progress||0,colors,trainerVisualOptions())}</div><span class="turn-indicator ${turning?'turning':''}" aria-hidden="true">${turning?esc(turning.token):'Контур: следующий слой · золотой: пара F2L'}</span></div><div class="net-view">${netSVG(trainerCube)}<span>Развёртка · все шесть сторон</span></div>`;
 $('#step-status').textContent=turning?`${preparing?'Подготовка':'Решение'} · поворот ${turning.token} · ход ${Math.max(trainerIndex,turning.toIndex)} из ${trainerMoves.length}`:finished?(preparing?'✓ Положение готово. Сверь свой кубик со схемой.':`${isSolved(trainerCube)?'✓ Кубик собран. ':''}Решение завершено.`):`${preparing?'Подготовка':'Решение'} · выполнено ${trainerIndex} из ${trainerMoves.length} ходов`;
 const next=turning?.token||trainerMoves[trainerIndex];
 if(next&&!hidden){const instruction=moveInstruction(next);$('#move-instruction').innerHTML=`<span class="instruction-move"><b>${esc(next)}</b><span class="instruction-arrow" aria-hidden="true">${next.includes("2")?"↔":next.endsWith("'")?"↺":"↻"}</span></span><div><small>${turning?'Сейчас выполняется':'Следующий шаг '+(trainerIndex+1)}</small><h3>${instruction.title}</h3><p>${instruction.description}</p><p class="instruction-tip">${instruction.tip}</p></div>`;}
 else $('#move-instruction').innerHTML=hidden?'<p>Подсказки решения скрыты. Вспомни алгоритм и повтори его самостоятельно.</p>':`<div><h3>${preparing?'Случай создан':'Алгоритм выполнен'}</h3><p>${preparing?'Проверь все шесть сторон, а не только верх. Когда твой кубик совпадёт с моделью, нажми кнопку ниже.':'Сравни результат на своём кубике. Можно повторить тренировку с самого начала.'}</p></div>`;
 $('#move-list').innerHTML=hidden?'<p class="hint-hidden">Подсказка скрыта. Узнай случай по рисунку кубика.</p>':trainerMoves.map((m,i)=>`<button data-step="${i+1}" class="move-token ${i<trainerIndex?'past':''} ${i===(turning?Math.min(trainerIndex,turning.toIndex):trainerIndex-1)?'current':''}" aria-label="Показать состояние после хода ${i+1}: ${esc(m)}">${esc(m)}</button>`).join('');
 $('#phase-action').innerHTML=finished?(preparing?'<div class="phase-confirm"><p>Повторил все ходы на своём кубике?</p><button class="primary" data-control="solve">Положение совпадает — к решению →</button></div>':'<div class="phase-confirm"><button class="secondary" data-control="prepare">Повторить с подготовки ↺</button></div>'):'';
 $('#setup-alg').textContent=trainerPractice.setup.join(' ');
 $('#play-btn').textContent=autoPlaying?'Ⅱ Пауза':'▶ Воспроизвести';
 $('[data-control="prev"]').disabled=!!turning||trainerIndex===0;
 $('[data-control="next"]').disabled=!!turning||trainerIndex===trainerMoves.length;
}
function startGuidedSolution(){
 if(turnAnimation||trainerIndex!==trainerMoves.length||!trainerPractice.preparing)return;
 trainerPractice.startSolution(trainerCube);resetTrainerStage();renderTrainer();
}

function stopPlayback(){clearTimeout(playHandle);playHandle=null;autoPlaying=false;}
function cancelTrainerMotion(){stopPlayback();cancelAnimationFrame(turnFrame);turnFrame=null;turnAnimation=null;}
function beginTurn(direction){
 if(turnAnimation)return;
 const target=trainerIndex+direction;
 if(target<0||target>trainerMoves.length)return;
 const token=direction>0?trainerMoves[trainerIndex]:inverse(trainerMoves[target]);
 const speed=+$('#play-speed').value;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const animation={token,cube:trainerCube,toIndex:target,progress:0,start:performance.now(),duration:reduced?0:speed*.8*(token.includes('2')?1.25:1)};
 turnAnimation=animation;renderTrainer();
 const frame=now=>{
  if(turnAnimation!==animation||activeRoute!=='trainer')return;
  const time=animation.duration?Math.min(1,(now-animation.start)/animation.duration):1;
  animation.progress=(1-Math.cos(Math.PI*time))/2;
  $('.cube-render').innerHTML=animatedCubeSVG(animation.cube,token,animation.progress,colors,trainerVisualOptions());
  if(time<1){turnFrame=requestAnimationFrame(frame);return;}
  trainerCube=move(animation.cube,token);trainerIndex=target;turnAnimation=null;turnFrame=null;
  if(trainerIndex===trainerMoves.length)autoPlaying=false;
  renderTrainer();
  if(autoPlaying)playHandle=setTimeout(()=>{playHandle=null;nextStep();},+$('#play-speed').value*.2);
 };
 turnFrame=requestAnimationFrame(frame);
}
function nextStep(){beginTurn(1);}
function jumpStep(i){cancelTrainerMotion();trainerIndex=Math.max(0,Math.min(i,trainerMoves.length));trainerCube=apply(trainerInitial,trainerMoves.slice(0,trainerIndex).join(' '));renderTrainer();}
function selectStep(index){if(!turnAnimation&&Math.abs(index-trainerIndex)===1){stopPlayback();beginTurn(index>trainerIndex?1:-1);}else jumpStep(index);}
function togglePlayback(){
 if(autoPlaying){stopPlayback();renderTrainer();return;}
 if(trainerIndex===trainerMoves.length)jumpStep(0);
 autoPlaying=true;
 if(!turnAnimation)nextStep();
 renderTrainer();
}
function goTrain(a){trainerPlanDay=activeRoute==='plan'?(Number(location.hash.split('/')[1])||planSummary().next||112):0;trainerCase=a;trainerHidden=false;setupTrainer();if(location.hash==='#trainer'){trainer();}else location.hash='trainer';}
function timer(){main.innerHTML=heading('СОБИРАЙ. НАБЛЮДАЙ. УЛУЧШАЙ.','Твой ритм сборки','Зажми и отпусти любую обычную клавишу — старт. Нажми любую клавишу — стоп. Можно также использовать кнопку на экране.')+`<section class="timer-card"><div class="scramble-bar"><span class="eyebrow">ПЕРЕМЕШИВАНИЕ</span><button class="text-link" data-timer="new">Новое ↻</button></div><code id="scramble-text">${currentScramble}</code><p class="small-text">20 случайных ходов для домашней практики; не официальный WCA-скрамбл. Начни с собранного кубика.</p><div id="timer-display" class="timer-display" aria-label="Время сборки">0.00</div><button id="timer-button" class="primary" data-timer="toggle">Начать сборку</button><p id="timer-hint">Удерживай любую клавишу. Отпусти — и начнётся отсчёт.</p></section><div class="timer-stats" id="timer-stats"></div><div class="section-heading"><h2>История попыток</h2><button class="text-link" data-timer="export">Экспорт CSV ↓</button></div><div id="time-history"></div>`;renderTimes();}
function renderTimes(){const times=state.times,valid=times.map(effective).filter(Number.isFinite);$('#timer-stats').innerHTML=[['Лучшая',formatTime(valid.length?Math.min(...valid):null)],['Среднее из 5',formatTime(average5(times))],['Попыток',times.length]].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');$('#time-history').innerHTML=!times.length?'<div class="empty">Здесь появится твоя первая сборка. Начинай в своём темпе.</div>':`<div class="history-table"><table><thead><tr><th>№</th><th>Время</th><th>Отметка</th><th>Перемешивание этой попытки</th></tr></thead><tbody>${times.slice(-30).reverse().map((t,i)=>`<tr><td>${times.length-i}</td><td><strong>${formatTime(effective(t))}</strong>${t.penalty?`<small> (${formatTime(t.ms)}${t.penalty==='+2'?' + 2':''})</small>`:''}</td><td><select data-penalty="${times.length-1-i}" aria-label="Штраф попытки ${times.length-i}">${['','+2','DNF'].map(p=>`<option value="${p}" ${p===t.penalty?'selected':''}>${p||'Без штрафа'}</option>`).join('')}</select></td><td><code>${esc(t.scramble||'')}</code></td></tr>`).join('')}</tbody></table></div><p class="small-text">Показаны последние 30 попыток. Хранятся последние 500; все сохранённые доступны в CSV.</p>`;}
function toggleTimer(){clearTimerReady();if(running){const ms=performance.now()-startAt;running=false;cancelAnimationFrame(clockFrame);state.times.push({ms:Math.round(ms),penalty:'',scramble:currentScramble,date:new Date().toISOString()});state.times=state.times.slice(-500);save();$('#timer-display').textContent=formatTime(ms);$('#timer-display').classList.remove('running');$('#timer-button').textContent='Начать сборку';$('#timer-hint').textContent='Сохранено. Новое перемешивание уже готово.';currentScramble=scramble();$('#scramble-text').textContent=currentScramble;$('[data-timer="new"]').disabled=false;renderTimes();}else{startAt=performance.now();running=true;$('#timer-button').textContent='Остановить';$('#timer-display').classList.add('running');$('#timer-hint').textContent='Нажми любую клавишу или кнопку — остановить';$('[data-timer="new"]').disabled=true;const tick=()=>{if(!running)return;$('#timer-display').textContent=formatTime(performance.now()-startAt);clockFrame=requestAnimationFrame(tick);};tick();}}
function progress(){main.innerHTML=heading('ТЫ УЖЕ НА ПУТИ','Каждый маленький шаг считается','Прогресс хранится в этом браузере. Очистка данных сайта удалит отметки и результаты.')+planCard()+`<section class="progress-hero"><div class="progress-ring" style="--progress:${pct()}%"><span>${pct()}%<small>курса пройдено</small></span></div><div><h2>${state.lessons.length? 'Продолжай в своём темпе.':'Первый шаг — самый важный.'}</h2><p>${state.lessons.length} из 13 уроков · ${state.learned.length} из 78 алгоритмов · ${state.times.length} попыток</p><a href="#course" class="primary">Вернуться к урокам →</a></div></section><div class="progress-columns">${['OLL','PLL'].map(t=>{const total=t==='OLL'?57:21,n=state.learned.filter(id=>id.startsWith(t.toLowerCase())).length;return `<section class="progress-card"><span class="eyebrow">${t==='OLL'?'ОРИЕНТАЦИЯ':'ПЕРЕСТАНОВКА'} ПОСЛЕДНЕГО СЛОЯ</span><h2>${t} <span>${n} / ${total}</span></h2><div class="progress-line"><span style="width:${n/total*100}%"></span></div><div class="case-dots">${algorithms.filter(a=>a.type===t).map(a=>`<button data-train="${a.id}" class="${state.learned.includes(a.id)?'learned':''}" title="${a.name}" aria-label="Тренировать ${a.name}">${a.name.replace('OLL ','')}</button>`).join('')}</div></section>`;}).join('')}</div><div class="info-note">Отметки «Выучен» — твоя самооценка. Проверь себя в тренажёре со скрытой подсказкой и повтори алгоритм на физическом кубике.</div>`;}
function sources(){main.innerHTML=heading('ПРОВЕРЕННЫЙ МЕТОД. СВОЯ ПРАКТИКА.','Материалы и источники','Курс и интерфейс на русском. Дополнительные материалы ниже — на английском.')+`<section class="sources-card"><h2>Для углублённого изучения</h2><p>Объяснения уроков написаны для этого курса. Стандартные последовательности ходов OLL и PLL сверены с каталогами J Perm. Схемы рисует собственная модель кубика; чужие изображения и код тренажёров не используются.</p><a href="https://jperm.net/3x3/cfop" target="_blank" rel="noopener">J Perm · учебные видео по всем этапам CFOP ↗</a><a href="https://jperm.net/algs/oll" target="_blank" rel="noopener">J Perm · 57 OLL ↗</a><a href="https://jperm.net/algs/pll" target="_blank" rel="noopener">J Perm · 21 PLL ↗</a><a href="https://www.cubeskills.com/tutorials/f2l" target="_blank" rel="noopener">CubeSkills · подробные видео по F2L ↗</a><a href="https://www.cubeskills.com/uploads/pdf/tutorials/f2l.pdf" target="_blank" rel="noopener">CubeSkills · справочник случаев F2L (PDF) ↗</a><a href="https://github.com/makooyyy/cfop-academy" target="_blank" rel="noopener">Код этого сайта на GitHub ↗</a><h3>Как пользоваться без интернета</h3><p>После первого посещения по HTTPS основные страницы, уроки, схемы и алгоритмы сохраняются для работы офлайн. Внешние видео и справочники требуют интернета. Прогресс хранится только в этом браузере, без аккаунта и синхронизации.</p></section>`;}
function route(){const requested=(location.hash.slice(1)||'home').split('/')[0];activeRoute=['home','course','algorithms','trainer','timer','progress','sources','cube-settings','plan','recognition'].includes(requested)?requested:'home';cancelTrainerMotion();resetTimerKeys();if(running){running=false;cancelAnimationFrame(clockFrame);toast('Таймер остановлен при выходе. Незавершённая попытка не сохранена.');}document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===activeRoute);a.toggleAttribute('aria-current',a.dataset.nav===activeRoute);if(a.dataset.nav===activeRoute)a.setAttribute('aria-current','page');});const titles={home:'Обзор курса',course:'Уроки',algorithms:'Алгоритмы',trainer:'Тренажёр',timer:'Таймер',progress:'Мой прогресс',sources:'Материалы','cube-settings':'Мой кубик',plan:'План по дням',recognition:'Распознавание'};$('#breadcrumb').textContent=titles[activeRoute];document.title=`${titles[activeRoute]} · CFOP Academy`;({home,course,algorithms:library,trainer,timer,progress,sources,recognition:()=>renderRecognition(main,toast),'cube-settings':()=>renderCubeSettings(main),plan:()=>renderStudyPlan(main,Number(location.hash.split('/')[1]),toast)})[activeRoute]();if(activeRoute==='progress')mountProgress(main,toast);main.classList.toggle('trainer-page',activeRoute==='trainer');window.scrollTo(0,0);main.focus({preventScroll:true});if(activeRoute==='plan'&&/^#plan\/\d+/.test(location.hash)){const task=location.hash.match(/\/task\/(\d+)$/);document.querySelector(task?'#plan-task-'+task[1]:location.hash.endsWith('/goal')?'.plan-criterion':'.plan-week-heading')?.scrollIntoView({block:'start'});}}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(b.classList.contains('dialog-close'))$('#lesson-dialog').close();
 if(d.lesson)openLesson(d.lesson);
 if(d.answer!==undefined){const l=lessons.find(x=>x.id===d.for),correct=+d.answer===l.quiz.answer;$('#quiz-feedback').textContent=(correct?'Верно! ':'Попробуй ещё. ')+l.quiz.why;$('#quiz-feedback').className=correct?'correct':'incorrect';b.classList.toggle('answer-correct',correct);}
 if(d.complete){const id=d.complete;state.lessons=state.lessons.includes(id)?state.lessons.filter(x=>x!==id):[...state.lessons,id];save();openLesson(id);if(activeRoute==='course')course();if(activeRoute==='home')home();if(activeRoute==='progress')progress();}
 if(d.demo){const l=lessons.find(x=>x.id===d.demo);$('#lesson-dialog').close();goTrain({id:'lesson-'+l.id,name:l.title,type:l.stage,alg:l.demo});}
 if(d.filter){algFilter=d.filter;library();}
 if(d.learn){state.learned=state.learned.includes(d.learn)?state.learned.filter(x=>x!==d.learn):[...state.learned,d.learn];save();renderAlgs();}
 if(d.train)goTrain(allCases.find(a=>a.id===d.train));
 if(d.step)selectStep(+d.step);
 if(d.control){const c=d.control;if(c==='solve')startGuidedSolution();if(c==='prepare'){setupTrainer();renderTrainer();}if(c==='reset')jumpStep(0);if(c==='prev'){stopPlayback();beginTurn(-1);}if(c==='next'){stopPlayback();beginTurn(1);}if(c==='play')togglePlayback();if(c==='random'){const pool=allCases.filter(a=>a.type===trainerCase.type);trainerCase=pool[Math.floor(Math.random()*pool.length)]||algorithms[Math.floor(Math.random()*algorithms.length)];setupTrainer();trainer();}if(c==='copy'){try{await navigator.clipboard.writeText(trainerMoves.join(' '));toast(trainerPractice.preparing?'Ходы подготовки скопированы':'Ходы решения скопированы');}catch{toast('Выдели последовательность ходов и скопируй её вручную.');}}if(c==='custom'){try{const alg=$('#custom-alg').value,n=tokens(alg).length;if(!n||n>100)throw Error('Введите от 1 до 100 ходов.');trainerCase={id:'custom',name:'Твоя последовательность',type:'Своя',alg};setupTrainer();trainer();}catch(err){$('#custom-error').textContent=err.message;}}if(c==='scramble'){const s=scramble();trainerCase={id:'custom',name:'Свободное перемешивание',type:'Своя',alg:inverse(s)};setupTrainer();trainer();toast('Чтобы решить самостоятельно, скрой подсказку. Показанное решение просто отменяет перемешивание.');}}
 if(d.timer==='toggle'){timerKeys.reset();toggleTimer();}if(d.timer==='new'&&!running){currentScramble=scramble();$('#scramble-text').textContent=currentScramble;}if(d.timer==='export'){const rows=['number,milliseconds,penalty,scramble,date',...state.times.map((t,i)=>`${i+1},${t.ms},${t.penalty},"${t.scramble}",${t.date}`)];const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cfop-times.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
document.addEventListener('change',e=>{if(e.target.dataset.penalty!==undefined){state.times[+e.target.dataset.penalty].penalty=e.target.value;save();renderTimes();}});
function clearTimerReady(){
 $('#timer-display')?.classList.remove('ready');
 $('.timer-card')?.classList.remove('is-ready');
}
function resetTimerKeys(){
 const wasArmed=timerKeys.phase==='armed';timerKeys.reset();clearTimerReady();
 if(wasArmed&&!running&&$('#timer-hint')){
  $('#timer-hint').textContent='Удерживай любую клавишу. Отпусти — и начнётся отсчёт.';
  $('#timer-button').textContent='Начать сборку';
 }
}
document.addEventListener('keydown',event=>{
 if(activeRoute!=='timer'||$('#lesson-dialog').open)return;
 if(!acceptsTimerKey(event)){if(timerKeys.phase==='armed')resetTimerKeys();return;}
 event.preventDefault();
 const result=timerKeys.down(event.code||event.key,running,event.repeat);
 if(result==='stop')toggleTimer();
 if(result==='ready'){
  $('#timer-display').classList.add('ready');$('.timer-card').classList.add('is-ready');
  $('#timer-hint').textContent='Готов! Отпусти клавишу, чтобы начать.';
  $('#timer-button').textContent='Отпусти клавишу';
 }
});
document.addEventListener('keyup',event=>{
 if(activeRoute!=='timer'||$('#lesson-dialog').open){resetTimerKeys();return;}
 const code=event.code||event.key;
 if(!timerKeys.held.has(code))return;
 event.preventDefault();
 if(!acceptsTimerKey(event)){resetTimerKeys();return;}
 if(timerKeys.up(code)==='start'&&!running)toggleTimer();
});
window.addEventListener('blur',()=>{resetTimerKeys();if(autoPlaying){stopPlayback();if(activeRoute==='trainer')renderTrainer();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetTimerKeys();});

window.addEventListener('hashchange',route);route();
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});


