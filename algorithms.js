// Standard CFOP move sequences. Reference: https://jperm.net/algs/oll and /algs/pll
export const algorithms = [
  {
    "id": "oll-1",
    "type": "OLL",
    "name": "OLL 1",
    "group": "Точка",
    "alg": "R U2 R' R' F R F' U2 R' F R F'",
    "basic": false
  },
  {
    "id": "oll-2",
    "type": "OLL",
    "name": "OLL 2",
    "group": "Точка",
    "alg": "r U r' U2 r U2 R' U2 R U' r'",
    "basic": false
  },
  {
    "id": "oll-3",
    "type": "OLL",
    "name": "OLL 3",
    "group": "Точка",
    "alg": "r' R2 U R' U r U2 r' U M'",
    "basic": false
  },
  {
    "id": "oll-4",
    "type": "OLL",
    "name": "OLL 4",
    "group": "Точка",
    "alg": "M U' r U2 r' U' R U' R' M'",
    "basic": false
  },
  {
    "id": "oll-5",
    "type": "OLL",
    "name": "OLL 5",
    "group": "Квадрат",
    "alg": "l' U2 L U L' U l",
    "basic": false
  },
  {
    "id": "oll-6",
    "type": "OLL",
    "name": "OLL 6",
    "group": "Квадрат",
    "alg": "r U2 R' U' R U' r'",
    "basic": false
  },
  {
    "id": "oll-7",
    "type": "OLL",
    "name": "OLL 7",
    "group": "Малая молния",
    "alg": "r U R' U R U2 r'",
    "basic": false
  },
  {
    "id": "oll-8",
    "type": "OLL",
    "name": "OLL 8",
    "group": "Малая молния",
    "alg": "l' U' L U' L' U2 l",
    "basic": false
  },
  {
    "id": "oll-9",
    "type": "OLL",
    "name": "OLL 9",
    "group": "Рыбка",
    "alg": "R U R' U' R' F R2 U R' U' F'",
    "basic": false
  },
  {
    "id": "oll-10",
    "type": "OLL",
    "name": "OLL 10",
    "group": "Рыбка",
    "alg": "R U R' U R' F R F' R U2 R'",
    "basic": false
  },
  {
    "id": "oll-11",
    "type": "OLL",
    "name": "OLL 11",
    "group": "Малая молния",
    "alg": "r U R' U R' F R F' R U2 r'",
    "basic": false
  },
  {
    "id": "oll-12",
    "type": "OLL",
    "name": "OLL 12",
    "group": "Малая молния",
    "alg": "M' R' U' R U' R' U2 R U' R r'",
    "basic": false
  },
  {
    "id": "oll-13",
    "type": "OLL",
    "name": "OLL 13",
    "group": "Ход коня",
    "alg": "F U R U' R2 F' R U R U' R'",
    "basic": false
  },
  {
    "id": "oll-14",
    "type": "OLL",
    "name": "OLL 14",
    "group": "Ход коня",
    "alg": "R' F R U R' F' R F U' F'",
    "basic": false
  },
  {
    "id": "oll-15",
    "type": "OLL",
    "name": "OLL 15",
    "group": "Ход коня",
    "alg": "l' U' l L' U' L U l' U l",
    "basic": false
  },
  {
    "id": "oll-16",
    "type": "OLL",
    "name": "OLL 16",
    "group": "Ход коня",
    "alg": "r U r' R U R' U' r U' r'",
    "basic": false
  },
  {
    "id": "oll-17",
    "type": "OLL",
    "name": "OLL 17",
    "group": "Точка",
    "alg": "F R' F' R2 r' U R U' R' U' M'",
    "basic": false
  },
  {
    "id": "oll-18",
    "type": "OLL",
    "name": "OLL 18",
    "group": "Точка",
    "alg": "r U R' U R U2 r' r' U' R U' R' U2 r",
    "basic": false
  },
  {
    "id": "oll-19",
    "type": "OLL",
    "name": "OLL 19",
    "group": "Точка",
    "alg": "r' R U R U R' U' M' R' F R F'",
    "basic": false
  },
  {
    "id": "oll-20",
    "type": "OLL",
    "name": "OLL 20",
    "group": "Точка",
    "alg": "r U R' U' M2 U R U' R' U' M'",
    "basic": false
  },
  {
    "id": "oll-21",
    "type": "OLL",
    "name": "OLL 21",
    "group": "Крест",
    "alg": "R U2 R' U' R U R' U' R U' R'",
    "basic": true
  },
  {
    "id": "oll-22",
    "type": "OLL",
    "name": "OLL 22",
    "group": "Крест",
    "alg": "R U2 R2 U' R2 U' R2 U2 R",
    "basic": true
  },
  {
    "id": "oll-23",
    "type": "OLL",
    "name": "OLL 23",
    "group": "Крест",
    "alg": "R2 D' R U2 R' D R U2 R",
    "basic": true
  },
  {
    "id": "oll-24",
    "type": "OLL",
    "name": "OLL 24",
    "group": "Крест",
    "alg": "r U R' U' r' F R F'",
    "basic": true
  },
  {
    "id": "oll-25",
    "type": "OLL",
    "name": "OLL 25",
    "group": "Крест",
    "alg": "F' r U R' U' r' F R",
    "basic": true
  },
  {
    "id": "oll-26",
    "type": "OLL",
    "name": "OLL 26",
    "group": "Крест",
    "alg": "R U2 R' U' R U' R'",
    "basic": true
  },
  {
    "id": "oll-27",
    "type": "OLL",
    "name": "OLL 27",
    "group": "Крест",
    "alg": "R U R' U R U2 R'",
    "basic": true
  },
  {
    "id": "oll-28",
    "type": "OLL",
    "name": "OLL 28",
    "group": "Углы ориентированы",
    "alg": "r U R' U' r' R U R U' R'",
    "basic": false
  },
  {
    "id": "oll-29",
    "type": "OLL",
    "name": "OLL 29",
    "group": "Сложная форма",
    "alg": "R U R' U' R U' R' F' U' F R U R'",
    "basic": false
  },
  {
    "id": "oll-30",
    "type": "OLL",
    "name": "OLL 30",
    "group": "Сложная форма",
    "alg": "F R' F R2 U' R' U' R U R' F2",
    "basic": false
  },
  {
    "id": "oll-31",
    "type": "OLL",
    "name": "OLL 31",
    "group": "Буква P",
    "alg": "R' U' F U R U' R' F' R",
    "basic": false
  },
  {
    "id": "oll-32",
    "type": "OLL",
    "name": "OLL 32",
    "group": "Буква P",
    "alg": "L U F' U' L' U L F L'",
    "basic": false
  },
  {
    "id": "oll-33",
    "type": "OLL",
    "name": "OLL 33",
    "group": "Буква T",
    "alg": "R U R' U' R' F R F'",
    "basic": false
  },
  {
    "id": "oll-34",
    "type": "OLL",
    "name": "OLL 34",
    "group": "Буква C",
    "alg": "R U R2 U' R' F R U R U' F'",
    "basic": false
  },
  {
    "id": "oll-35",
    "type": "OLL",
    "name": "OLL 35",
    "group": "Рыбка",
    "alg": "R U2 R' R' F R F' R U2 R'",
    "basic": false
  },
  {
    "id": "oll-36",
    "type": "OLL",
    "name": "OLL 36",
    "group": "Буква W",
    "alg": "L' U' L U' L' U L U L F' L' F",
    "basic": false
  },
  {
    "id": "oll-37",
    "type": "OLL",
    "name": "OLL 37",
    "group": "Рыбка",
    "alg": "F R' F' R U R U' R'",
    "basic": false
  },
  {
    "id": "oll-38",
    "type": "OLL",
    "name": "OLL 38",
    "group": "Буква W",
    "alg": "R U R' U R U' R' U' R' F R F'",
    "basic": false
  },
  {
    "id": "oll-39",
    "type": "OLL",
    "name": "OLL 39",
    "group": "Большая молния",
    "alg": "L F' L' U' L U F U' L'",
    "basic": false
  },
  {
    "id": "oll-40",
    "type": "OLL",
    "name": "OLL 40",
    "group": "Большая молния",
    "alg": "R' F R U R' U' F' U R",
    "basic": false
  },
  {
    "id": "oll-41",
    "type": "OLL",
    "name": "OLL 41",
    "group": "Сложная форма",
    "alg": "R U R' U R U2 R' F R U R' U' F'",
    "basic": false
  },
  {
    "id": "oll-42",
    "type": "OLL",
    "name": "OLL 42",
    "group": "Сложная форма",
    "alg": "R' U' R U' R' U2 R F R U R' U' F'",
    "basic": false
  },
  {
    "id": "oll-43",
    "type": "OLL",
    "name": "OLL 43",
    "group": "Буква P",
    "alg": "F' U' L' U L F",
    "basic": false
  },
  {
    "id": "oll-44",
    "type": "OLL",
    "name": "OLL 44",
    "group": "Буква P",
    "alg": "F U R U' R' F'",
    "basic": false
  },
  {
    "id": "oll-45",
    "type": "OLL",
    "name": "OLL 45",
    "group": "Буква T",
    "alg": "F R U R' U' F'",
    "basic": false
  },
  {
    "id": "oll-46",
    "type": "OLL",
    "name": "OLL 46",
    "group": "Буква C",
    "alg": "R' U' R' F R F' U R",
    "basic": false
  },
  {
    "id": "oll-47",
    "type": "OLL",
    "name": "OLL 47",
    "group": "Малая L",
    "alg": "R' U' R' F R F' R' F R F' U R",
    "basic": false
  },
  {
    "id": "oll-48",
    "type": "OLL",
    "name": "OLL 48",
    "group": "Малая L",
    "alg": "F R U R' U' R U R' U' F'",
    "basic": false
  },
  {
    "id": "oll-49",
    "type": "OLL",
    "name": "OLL 49",
    "group": "Малая L",
    "alg": "r U' r2 U r2 U r2 U' r",
    "basic": false
  },
  {
    "id": "oll-50",
    "type": "OLL",
    "name": "OLL 50",
    "group": "Малая L",
    "alg": "r' U r2 U' r2 U' r2 U r'",
    "basic": false
  },
  {
    "id": "oll-51",
    "type": "OLL",
    "name": "OLL 51",
    "group": "Линия",
    "alg": "F U R U' R' U R U' R' F'",
    "basic": false
  },
  {
    "id": "oll-52",
    "type": "OLL",
    "name": "OLL 52",
    "group": "Линия",
    "alg": "R U R' U R U' B U' B' R'",
    "basic": false
  },
  {
    "id": "oll-53",
    "type": "OLL",
    "name": "OLL 53",
    "group": "Малая L",
    "alg": "l' U2 L U L' U' L U L' U l",
    "basic": false
  },
  {
    "id": "oll-54",
    "type": "OLL",
    "name": "OLL 54",
    "group": "Малая L",
    "alg": "r U2 R' U' R U R' U' R U' r'",
    "basic": false
  },
  {
    "id": "oll-55",
    "type": "OLL",
    "name": "OLL 55",
    "group": "Линия",
    "alg": "R' F R U R U' R2 F' R2 U' R' U R U R'",
    "basic": false
  },
  {
    "id": "oll-56",
    "type": "OLL",
    "name": "OLL 56",
    "group": "Линия",
    "alg": "r' U' r U' R' U R U' R' U R r' U r",
    "basic": false
  },
  {
    "id": "oll-57",
    "type": "OLL",
    "name": "OLL 57",
    "group": "Углы ориентированы",
    "alg": "R U R' U' M' U R U' r'",
    "basic": false
  },
  {
    "id": "pll-H",
    "type": "PLL",
    "name": "H",
    "group": "Только рёбра",
    "alg": "M2 U M2 U2 M2 U M2",
    "basic": true
  },
  {
    "id": "pll-Z",
    "type": "PLL",
    "name": "Z",
    "group": "Только рёбра",
    "alg": "M' U M2 U M2 U M' U2 M2",
    "basic": true
  },
  {
    "id": "pll-Ua",
    "type": "PLL",
    "name": "Ua",
    "group": "Только рёбра",
    "alg": "M2 U M U2 M' U M2",
    "basic": true
  },
  {
    "id": "pll-Ub",
    "type": "PLL",
    "name": "Ub",
    "group": "Только рёбра",
    "alg": "M2 U' M U2 M' U' M2",
    "basic": true
  },
  {
    "id": "pll-Aa",
    "type": "PLL",
    "name": "Aa",
    "group": "Соседние углы",
    "alg": "x L2 D2 L' U' L D2 L' U L' x'",
    "basic": false
  },
  {
    "id": "pll-Ab",
    "type": "PLL",
    "name": "Ab",
    "group": "Соседние углы",
    "alg": "x' L2 D2 L U L' D2 L U' L x",
    "basic": false
  },
  {
    "id": "pll-E",
    "type": "PLL",
    "name": "E",
    "group": "Диагональные углы",
    "alg": "x' L' U L D' L' U' L D L' U' L D' L' U L D x",
    "basic": false
  },
  {
    "id": "pll-F",
    "type": "PLL",
    "name": "F",
    "group": "Соседние углы",
    "alg": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    "basic": false
  },
  {
    "id": "pll-Ja",
    "type": "PLL",
    "name": "Ja",
    "group": "Соседние углы",
    "alg": "x R2 F R F' R U2 r' U r U2 x'",
    "basic": false
  },
  {
    "id": "pll-Jb",
    "type": "PLL",
    "name": "Jb",
    "group": "Соседние углы",
    "alg": "R U R' F' R U R' U' R' F R2 U' R'",
    "basic": false
  },
  {
    "id": "pll-Ra",
    "type": "PLL",
    "name": "Ra",
    "group": "Соседние углы",
    "alg": "R U' R' U' R U R D R' U' R D' R' U2 R'",
    "basic": false
  },
  {
    "id": "pll-Rb",
    "type": "PLL",
    "name": "Rb",
    "group": "Соседние углы",
    "alg": "R2 F R U R U' R' F' R U2 R' U2 R",
    "basic": false
  },
  {
    "id": "pll-T",
    "type": "PLL",
    "name": "T",
    "group": "Соседние углы",
    "alg": "R U R' U' R' F R2 U' R' U' R U R' F'",
    "basic": true
  },
  {
    "id": "pll-Y",
    "type": "PLL",
    "name": "Y",
    "group": "Диагональные углы",
    "alg": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    "basic": true
  },
  {
    "id": "pll-V",
    "type": "PLL",
    "name": "V",
    "group": "Диагональные углы",
    "alg": "R' U R' U' y R' F' R2 U' R' U R' F R F",
    "basic": false
  },
  {
    "id": "pll-Na",
    "type": "PLL",
    "name": "Na",
    "group": "Диагональные углы",
    "alg": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "basic": false
  },
  {
    "id": "pll-Nb",
    "type": "PLL",
    "name": "Nb",
    "group": "Диагональные углы",
    "alg": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    "basic": false
  },
  {
    "id": "pll-Ga",
    "type": "PLL",
    "name": "Ga",
    "group": "Соседние углы",
    "alg": "R2 U R' U R' U' R U' R2 U' D R' U R D'",
    "basic": false
  },
  {
    "id": "pll-Gb",
    "type": "PLL",
    "name": "Gb",
    "group": "Соседние углы",
    "alg": "R' U' R U D' R2 U R' U R U' R U' R2 D",
    "basic": false
  },
  {
    "id": "pll-Gc",
    "type": "PLL",
    "name": "Gc",
    "group": "Соседние углы",
    "alg": "R2 U' R U' R U R' U R2 U D' R U' R' D",
    "basic": false
  },
  {
    "id": "pll-Gd",
    "type": "PLL",
    "name": "Gd",
    "group": "Соседние углы",
    "alg": "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    "basic": false
  }
];
