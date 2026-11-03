export const DEFAULT_COLORS=Object.freeze({U:'#f3d153',D:'#f4f5ef',F:'#40b99a',B:'#4789df',R:'#eb705f',L:'#efa451'});
export const FACE_LABELS=Object.freeze({U:'Верхняя',D:'Нижняя',F:'Передняя',B:'Задняя',R:'Правая',L:'Левая'});
export const STANDARD_NAMES=Object.freeze({U:'Жёлтый',D:'Белый',F:'Зелёный',B:'Синий',R:'Красный',L:'Оранжевый'});
export const PALETTE_KEY='cfop-academy-colors-v1';
export const colors={...DEFAULT_COLORS};
export function validatePalette(value){
 if(!value||typeof value!=='object')throw Error('Выбери цвета всех шести граней.');
 const result={};
 for(const face of Object.keys(DEFAULT_COLORS)){
  if(typeof value[face]!=='string'||!/^#[0-9a-f]{6}$/i.test(value[face]))throw Error(`Цвет ${face}: введи HEX-код из шести символов, например #A855F7.`);
  result[face]=value[face].toLowerCase();
 }
 if(new Set(Object.values(result)).size!==6)throw Error('Выбери шесть разных цветов, чтобы различать грани кубика.');
 return result;
}
export function setCubePalette(value){Object.assign(colors,validatePalette(value));}
export function isCustomPalette(){return Object.keys(DEFAULT_COLORS).some(face=>colors[face]!==DEFAULT_COLORS[face]);}
function luminance(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
export function contrastInk(hex){return luminance(hex)>.179?'#142019':'#ffffff';}
export function maskColor(hex){return luminance(hex)>.35?'#34403b':'#d7dfdc';}
