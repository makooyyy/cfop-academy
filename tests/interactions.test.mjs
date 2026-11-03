import test from 'node:test';
import assert from 'node:assert/strict';
import {solved,apply,move} from '../cube.js';
import {cubeFaces,rotateContinuous,animatedCubeSVG} from '../cube-view.js';
import {ReleaseTimerKeys,acceptsTimerKey} from '../timer-keys.js';

const rounded=v=>v.map(n=>Math.round(n*1e6)/1e6);
const geometry=faces=>faces.map(f=>JSON.stringify([f.color,rounded(f.normal),f.points.map(p=>rounded(p).join(',')).sort()])).sort();
for(const token of ['R',"R'",'R2','U',"U'",'D','F','B','L','M',"M'",'M2','E','S','r',"l'",'u2','d','f','b','Rw','x',"x'",'y','z2']){
 test(`${token}: animation starts and ends at exact cube geometry`,()=>{
  const cube=apply(solved(),"R U F' L2 D B r U2");
  assert.deepEqual(geometry(cubeFaces(cube,token,0)),geometry(cubeFaces(cube)));
  assert.deepEqual(geometry(cubeFaces(cube,token,1)),geometry(cubeFaces(move(cube,token))));
  const middle=cubeFaces(cube,token,.5);
  assert.notDeepEqual(geometry(middle),geometry(cubeFaces(cube)));
  assert.ok(middle.every(f=>f.points.every(p=>p.every(Number.isFinite))));
 });
}
test('quarter turn interpolation preserves distance and renders bounded coordinates',()=>{
 const v=[1,2,3],r=rotateContinuous(v,1,Math.PI/4);
 assert.ok(Math.abs(v.reduce((a,b)=>a+b*b,0)-r.reduce((a,b)=>a+b*b,0))<1e-9);
 const svg=animatedCubeSVG(solved(),'R',.5);assert.ok(svg.includes('Плавный поворот R'));assert.ok(!/NaN|Infinity/.test(svg));
});
for(const code of ['Space','KeyA','Enter','Digit7','ArrowLeft'])test(`${code}: starts only on release; stopping release does not restart`,()=>{
 const keys=new ReleaseTimerKeys();
 assert.equal(keys.down(code,false),'ready');
 assert.equal(keys.down(code,false,true),null);
 assert.equal(keys.phase,'armed');
 assert.equal(keys.up(code),'start');
 assert.equal(keys.down(code,true),'stop');
 assert.equal(keys.down(code,false,true),null);
 assert.equal(keys.up(code),null);
 assert.equal(keys.phase,'idle');
 assert.equal(keys.down(code,false),'ready');
 assert.equal(keys.up(code),'start');
});
test('multiple held keys produce one start after the last release',()=>{
 const keys=new ReleaseTimerKeys();keys.down('Space',false);keys.down('KeyA',false);
 assert.equal(keys.up('Space'),null);assert.equal(keys.up('KeyA'),'start');assert.equal(keys.up('KeyA'),null);
});
test('multiple stop keys are drained without a phantom restart',()=>{
 const keys=new ReleaseTimerKeys();assert.equal(keys.down('KeyA',true),'stop');
 assert.equal(keys.down('Space',false),null);assert.equal(keys.up('KeyA'),null);assert.equal(keys.up('Space'),null);
});
test('blur or navigation cancels a held start key',()=>{
 const keys=new ReleaseTimerKeys();keys.down('Space',false);keys.reset();assert.equal(keys.up('Space'),null);
 assert.equal(keys.down('KeyB',false),'ready');assert.equal(keys.up('KeyB'),'start');
});
test('keyboard shortcuts and editing are kept outside the timer',()=>{
 const plain={key:'a',target:{closest:()=>null}};
 assert.equal(acceptsTimerKey(plain),true);
 for(const field of ['ctrlKey','altKey','metaKey','isComposing'])assert.equal(acceptsTimerKey({...plain,[field]:true}),false);
 for(const key of ['Tab','Escape','Shift'])assert.equal(acceptsTimerKey({...plain,key}),false);
 assert.equal(acceptsTimerKey({...plain,target:{closest:selector=>selector.startsWith('input')?{}:null}}),false);
 assert.equal(acceptsTimerKey({...plain,target:{closest:selector=>selector==='button,a,summary,[role="button"]'?{}:null}}),false);
 assert.equal(acceptsTimerKey({...plain,key:' ',target:{closest:selector=>selector==='button,a,summary,[role="button"]'||selector==='#timer-button'?{}:null}}),true);
});
