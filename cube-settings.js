import {colors,DEFAULT_COLORS,FACE_LABELS,STANDARD_NAMES,PALETTE_KEY,validatePalette,setCubePalette} from './cube-palette.js';
import {solved,netSVG} from './cube.js';
import {animatedCubeSVG} from './cube-view.js';

export function renderCubeSettings(main){
 let draft={...colors};
 const order=['U','D','F','B','R','L'];
 main.innerHTML=`<div class="page-heading"><div><div class="eyebrow">ТВОЙ КУБИК. ТВОИ ЦВЕТА.</div><h1>Сделай кубик своим</h1><p>Задай цвет каждого центра. Все схемы, уроки и анимации будут использовать твою палитру.</p></div></div>
 <div class="palette-layout"><section class="palette-editor"><h2>Шесть сторон — шесть цветов</h2><p>Возьми кубик в удобном положении: выбери, какая сторона будет сверху (U) и спереди (F). Остальные четыре стороны определяются этим хватом. Сверь их цвета с центрами своего кубика.</p>
 <form id="palette-form" novalidate><div class="palette-fields">${order.map(face=>`<div class="palette-row"><label class="palette-picker-label" for="palette-${face}"><span class="face-badge">${face}</span><span><strong>${FACE_LABELS[face]}</strong><small>В уроках: ${STANDARD_NAMES[face].toLowerCase()}</small></span></label><input type="color" id="palette-${face}" data-color-face="${face}" value="${draft[face]}" aria-label="Выбрать цвет ${face}"><label class="sr-only" for="hex-${face}">HEX цвета ${face}</label><input class="hex-field" id="hex-${face}" data-hex-face="${face}" type="text" value="${draft[face].toUpperCase()}" maxlength="7" spellcheck="false" autocomplete="off" inputmode="text" aria-describedby="palette-feedback"></div>`).join('')}</div><p id="palette-feedback" role="status" aria-live="polite">Выбери оттенок или введи HEX-код. Затем сохрани палитру.</p><div class="palette-actions"><button type="submit" class="primary">Сохранить цвета</button><button type="button" id="palette-reset" class="secondary">Стандартные цвета</button></div></form>
 <a class="text-link palette-back" href="#trainer">Перейти в тренажёр →</a></section>
 <aside class="palette-preview-card"><div class="eyebrow">ПРЕДПРОСМОТР</div><div id="palette-preview"></div><p>U — сверху, D — снизу.<br>F — спереди, B — сзади.<br>R — справа, L — слева.</p><div class="info-note">Названия цветов в тексте уроков относятся к стандартной схеме. Например, «жёлтый» означает выбранный тобой цвет U. В уроках появится памятка с твоими цветами.</div></aside></div>`;
 const feedback=main.querySelector('#palette-feedback');
 const preview=()=>{main.querySelector('#palette-preview').innerHTML=`${animatedCubeSVG(solved(),null,0,draft)}${netSVG(solved(),{palette:draft,label:'Предпросмотр выбранных цветов всех шести сторон'})}`;};
 const pending=()=>{feedback.textContent='Предпросмотр обновлён. Нажми «Сохранить цвета», чтобы применить палитру.';feedback.className='';};
 main.querySelectorAll('[data-color-face]').forEach(input=>input.addEventListener('input',()=>{const face=input.dataset.colorFace;draft[face]=input.value.toLowerCase();main.querySelector(`#hex-${face}`).value=input.value.toUpperCase();preview();pending();}));
 main.querySelectorAll('[data-hex-face]').forEach(input=>input.addEventListener('input',()=>{
  const value=input.value.trim(),face=input.dataset.hexFace;
  if(!/^#[0-9a-f]{6}$/i.test(value)){feedback.textContent=`Цвет ${face}: введи код вида #A855F7.`;feedback.className='incorrect';return;}
  draft[face]=value.toLowerCase();main.querySelector(`#palette-${face}`).value=draft[face];preview();pending();
 }));
 main.querySelector('#palette-reset').addEventListener('click',()=>{draft={...DEFAULT_COLORS};for(const face of order){main.querySelector(`#palette-${face}`).value=draft[face];main.querySelector(`#hex-${face}`).value=draft[face].toUpperCase();}preview();pending();});
 main.querySelector('#palette-form').addEventListener('submit',event=>{
  event.preventDefault();
  try{
   const values=Object.fromEntries(order.map(face=>[face,main.querySelector(`#hex-${face}`).value.trim()]));
   draft=validatePalette(values);setCubePalette(draft);preview();
   try{localStorage.setItem(PALETTE_KEY,JSON.stringify(draft));feedback.textContent='✓ Цвета сохранены. Теперь весь сайт использует твою палитру.';feedback.className='correct';}
   catch{feedback.textContent='Цвета применены в этой вкладке, но браузер не разрешил сохранить их после закрытия.';feedback.className='incorrect';}
  }catch(error){feedback.textContent=error.message;feedback.className='incorrect';}
 });
 preview();
}
