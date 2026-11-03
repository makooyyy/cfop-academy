import test from 'node:test';
import assert from 'node:assert/strict';
import {solved,apply,isSolved,netSVG,isoSVG} from '../cube.js';
import {animatedCubeSVG} from '../cube-view.js';
import {algorithms} from '../algorithms.js';
import {examples} from '../lessons.js';
import {GuidedPractice,moveInstruction} from '../trainer-guide.js';
import {colors,DEFAULT_COLORS,setCubePalette,validatePalette,contrastInk,maskColor} from '../cube-palette.js';

for(const a of [...examples,...algorithms])test(`${a.name}: prepare from solved, then solve without changing the cube`,()=>{
 const guide=new GuidedPractice(a.alg);assert.equal(guide.phase,'prepare');assert.ok(isSolved(guide.initial));
 const prepared=apply(guide.initial,guide.moves.join(' '));
 assert.deepEqual(prepared,guide.target);
 guide.startSolution(prepared);assert.equal(guide.phase,'solve');assert.deepEqual(guide.initial,prepared);
 assert.ok(isSolved(apply(guide.initial,guide.moves.join(' '))));
 guide.restartPreparation();assert.equal(guide.phase,'prepare');assert.ok(isSolved(guide.initial));
});
test('solution rejects an incomplete setup and a second phase transition',()=>{
 const guide=new GuidedPractice("R U R' U'");assert.throws(()=>guide.startSolution(solved()),/подготовку/);
 guide.startSolution(guide.target);assert.throws(()=>guide.startSolution(guide.target));
 assert.throws(()=>new GuidedPractice(''));assert.throws(()=>new GuidedPractice('R '.repeat(101)));
});
test('move directions explain the perspective of face, slice and whole-cube turns',()=>{
 assert.match(moveInstruction('R').description,/справа.*90° по часовой/);
 assert.match(moveInstruction("B'").description,/сзади.*против часовой/);
 assert.match(moveInstruction('Rw2').description,/два слоя вместе.*180°/);
 assert.match(moveInstruction("M'").description,/слева.*против часовой.*L/);
 assert.match(moveInstruction('E').description,/снизу.*D/);
 assert.match(moveInstruction('S').description,/спереди.*F/);
 assert.match(moveInstruction('x').description,/весь кубик.*R/);
 assert.match(moveInstruction('z2').description,/спереди.*180°/);
});
test('palette is complete, normalized, distinct, and cannot inject SVG markup',()=>{
 assert.deepEqual(validatePalette({...DEFAULT_COLORS,U:'#A855F7'}),{...DEFAULT_COLORS,U:'#a855f7'});
 assert.throws(()=>validatePalette({U:'#123456'}));
 assert.throws(()=>validatePalette({...DEFAULT_COLORS,U:DEFAULT_COLORS.D}));
 assert.throws(()=>validatePalette({...DEFAULT_COLORS,U:'red" onload="alert(1)'}));
 const before={...colors};assert.throws(()=>setCubePalette({...DEFAULT_COLORS,D:'invalid'}));assert.deepEqual(colors,before);
});
test('custom colors reach static, animated and OLL diagrams without changing algorithms',()=>{
 try{
  setCubePalette({...DEFAULT_COLORS,U:'#a855f7',F:'#123456'});
  assert.ok(isoSVG(solved()).includes('#a855f7'));
  assert.ok(animatedCubeSVG(solved(),'R',.5).includes('#123456'));
  assert.ok(netSVG(solved(),{mask:true}).includes('#a855f7'));
  const guide=new GuidedPractice("R U R' U R U2 R'");guide.startSolution(apply(solved(),guide.setup.join(' ')));
  assert.ok(isSolved(apply(guide.initial,guide.moves.join(' '))));
 }finally{setCubePalette(DEFAULT_COLORS);}
});
test('palette preview stays separate from saved palette and label contrast adapts',()=>{
 const draft={...DEFAULT_COLORS,U:'#aa00aa'};
 assert.ok(animatedCubeSVG(solved(),null,0,draft).includes('#aa00aa'));
 assert.ok(netSVG(solved(),{palette:draft}).includes('#aa00aa'));
 assert.equal(colors.U,DEFAULT_COLORS.U);
 assert.equal(contrastInk('#000000'),'#ffffff');assert.equal(contrastInk('#ffffff'),'#142019');
 assert.notEqual(maskColor('#d7dfdc'),'#d7dfdc');assert.notEqual(maskColor('#34403b'),'#34403b');
});
