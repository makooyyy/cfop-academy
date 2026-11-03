import {solved,apply,inverse,tokens} from './cube.js';
const fingerprint=cube=>cube.map(s=>`${s.p}|${s.n}|${s.color}`).sort().join(';');
export class GuidedPractice {
 constructor(algorithm){
  this.solution=tokens(algorithm);
  if(!this.solution.length||this.solution.length>100)throw Error('Введите от 1 до 100 ходов.');
  this.setup=tokens(inverse(algorithm));
  this.target=apply(solved(),this.setup.join(' '));
  this.phase='prepare';
 }
 get preparing(){return this.phase==='prepare';}
 get moves(){return this.preparing?this.setup:this.solution;}
 get initial(){return this.preparing?solved():this.target;}
 startSolution(currentCube){
  if(!this.preparing||fingerprint(currentCube)!==fingerprint(this.target))throw Error('Сначала закончи подготовку и сравни положение кубика со схемой.');
  this.phase='solve';
 }
 restartPreparation(){this.phase='prepare';}
}
export function moveInstruction(token){
 tokens(token);
 let base=token.replace(/[2']/g,'');
 if(base.endsWith('w'))base=base[0].toLowerCase();
 const names={R:'Правая грань',L:'Левая грань',U:'Верхняя грань',D:'Нижняя грань',F:'Передняя грань',B:'Задняя грань'};
 const sides={R:'справа',L:'слева',U:'сверху',D:'снизу',F:'спереди',B:'сзади'};
 const middle={M:['Средний вертикальный слой','L'],E:['Средний горизонтальный слой','D'],S:['Средний слой между передней и задней гранями','F']};
 const rotations={x:'R',y:'U',z:'F'};
 const wide=/^[urfdlb]$/.test(base);
 const ref=rotations[base]||middle[base]?.[1]||base.toUpperCase();
 const direction=token.includes('2')?'на 180° — пол-оборота в любую сторону':token.endsWith("'")?'на 90° против часовой стрелки':'на 90° по часовой стрелке';
 if(rotations[base])return {title:`Перехват ${base}: весь кубик`,description:`Смотри ${sides[ref]}. Поверни весь кубик ${direction}, как грань ${ref}.`,tip:'После перехвата буквы ходов относятся к новым сторонам перед тобой.'};
 if(middle[base])return {title:middle[base][0],description:`Смотри ${sides[ref]}. Поверни только средний слой ${direction}, в направлении грани ${ref}.`,tip:'Две внешние грани остаются на месте. На развёртке центры могут переместиться.'};
 return {title:wide?`${names[ref]} и соседний средний слой`:names[ref],description:`Смотри ${sides[ref]}. Поверни ${wide?'эти два слоя вместе':'эту грань'} ${direction}.`,tip:'Остальной кубик держи неподвижно. Сначала повтори ход на своём кубике, затем переходи дальше.'};
}
