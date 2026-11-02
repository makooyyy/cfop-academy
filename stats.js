export function effective(time){return time.penalty==='DNF'?Infinity:time.ms+(time.penalty==='+2'?2000:0);}
export function average5(times){if(times.length<5)return null;const values=times.slice(-5).map(effective).sort((a,b)=>a-b);return values.slice(1,4).reduce((a,b)=>a+b,0)/3;}
export function formatTime(ms){if(ms===null||ms===undefined)return '—';if(!Number.isFinite(ms))return 'DNF';const sec=ms/1000;return sec>=60?`${Math.floor(sec/60)}:${(sec%60).toFixed(2).padStart(5,'0')}`:sec.toFixed(2);}
