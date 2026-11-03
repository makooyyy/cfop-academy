// One press/release cycle arms and starts; a press during a solve stops it.
// The release of the stopping key must never start another attempt.
export class ReleaseTimerKeys {
 constructor(){this.reset();}
 reset(){this.held=new Set();this.phase='idle';}
 down(code,running,repeat=false){
  if(repeat||this.held.has(code))return null;
  this.held.add(code);
  if(running){this.phase='stopped';return 'stop';}
  if(this.phase==='idle'){this.phase='armed';return 'ready';}
  return null;
 }
 up(code){
  if(!this.held.delete(code))return null;
  if(this.held.size)return null;
  const start=this.phase==='armed';this.phase='idle';
  return start?'start':null;
 }
}

export function acceptsTimerKey(event){
 if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return false;
 if(['Tab','Escape','Shift','Control','Alt','Meta','CapsLock','NumLock','ScrollLock','Fn'].includes(event.key))return false;
 const target=event.target;
 if(target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return false;
 if(target?.closest?.('button,a,summary,[role="button"]')&&!target.closest('#timer-button'))return false;
 return true;
}
