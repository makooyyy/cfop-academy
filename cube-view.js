import {colors,describeMove,inTurnLayer} from './cube.js';

const view=[1,25/28,1];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const project=([x,y,z])=>[180+(x-z)*43,174+(x+z)*22.4-y*50.176];
const normalList=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function rotateContinuous(vector,axis,angle){
 const result=[...vector],a=(axis+1)%3,b=(axis+2)%3,c=Math.cos(angle),s=Math.sin(angle);
 result[a]=vector[a]*c-vector[b]*s;result[b]=vector[a]*s+vector[b]*c;
 return result;
}

// Full cubie geometry makes the dark inner faces visible while a layer is turning.
// Every frame is derived from the exact integer cube state; no floating-point drift accumulates.
export function cubeFaces(cube,token=null,progress=0){
 const spec=token?describeMove(token):null;
 const angle=spec?spec.dir*spec.turns*Math.PI/2*Math.min(1,Math.max(0,progress)):0;
 const stickers=new Map(cube.map(s=>[`${s.p}|${s.n}`,s.color]));
 const faces=[];
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
  if(!x&&!y&&!z)continue;
  const position=[x,y,z],turn=spec&&inTurnLayer(position,spec);
  const transform=v=>turn?rotateContinuous(v,spec.axis,angle):v;
  for(const normal of normalList){
   const n=transform(normal),light=dot(n,view);
   if(light<=0.00001)continue;
   const axis=normal.findIndex(v=>v),axes=[0,1,2].filter(i=>i!==axis);
   const makePoints=(half,depth)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{
    const point=[...position];point[axis]+=normal[axis]*depth;
    point[axes[0]]+=a*half;point[axes[1]]+=b*half;return transform(point);
   });
   const center=transform(position.map((v,i)=>v+normal[i]*.487));
   faces.push({points:makePoints(.482,.485),normal:n,depth:dot(center,view),color:null,shade:Math.max(0,.13*(1-light/1.65))});
   const color=stickers.get(`${position}|${normal}`);
   if(color)faces.push({points:makePoints(.405,.494),normal:n,depth:dot(center,view)+.012,color,shade:Math.max(0,.2*(1-light/1.65))});
  }
 }
 return faces.sort((a,b)=>a.depth-b.depth);
}

export function animatedCubeSVG(cube,token=null,progress=0,palette=colors){
 const faces=cubeFaces(cube,token,progress);
 const polygons=faces.map(face=>{
  const points=face.points.map(p=>project(p).map(n=>n.toFixed(2)).join(',')).join(' ');
  if(!face.color)return `<polygon points="${points}" fill="#152320" stroke="#23352e" stroke-width=".7" stroke-linejoin="round"/>`;
  return `<polygon points="${points}" fill="${palette[face.color]}" stroke="${palette[face.color]}" stroke-width="2.4" stroke-linejoin="round"/><polygon points="${points}" fill="#102019" opacity="${face.shade.toFixed(3)}" pointer-events="none"/>`;
 }).join('');
 return `<svg class="animated-cube" viewBox="0 0 360 360" role="img" aria-label="${token?'Плавный поворот '+escape(token):'Кубик Рубика'}"><ellipse class="cube-ground" cx="180" cy="327" rx="97" ry="12" fill="#152820" opacity=".12"/>${polygons}</svg>`;
}
