(() => {
 const key='cfop-academy-theme',query=window.matchMedia('(prefers-color-scheme: dark)');
 let preference=null;
 try { const saved=localStorage.getItem(key); if(saved==='dark'||saved==='light')preference=saved; } catch {}
 function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  const dark=theme==='dark',button=document.getElementById('theme-toggle');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0d111b':'#f4f6fa');
  if(button){
   const label=dark?'Включить светлую тему':'Включить тёмную тему';
   button.setAttribute('aria-label',label);button.title=label;
   button.firstElementChild.textContent=dark?'☀':'☾';
   button.querySelector('.theme-label').textContent=dark?'Светлая тема':'Тёмная тема';
  }
 }
 applyTheme(preference||(query.matches?'dark':'light'));
 query.addEventListener('change',event=>{if(!preference)applyTheme(event.matches?'dark':'light');});
 document.addEventListener('DOMContentLoaded',()=>{
  applyTheme(document.documentElement.dataset.theme);
  document.getElementById('theme-toggle').addEventListener('click',()=>{
   preference=document.documentElement.dataset.theme==='dark'?'light':'dark';
   applyTheme(preference);
   try{localStorage.setItem(key,preference);}catch{}
  });
 });
})();
