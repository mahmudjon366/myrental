// Simple Uzbek Latin -> Cyrillic transliteration
// Note: This is a pragmatic converter covering common cases.

const apos = "['’ʻ`ˈʿʼ]"; // possible apostrophes used for o'g'

const patterns = [
  // digraphs with apostrophes
  { re: new RegExp(`G${apos}`, 'g'), to: 'Ғ' },
  { re: new RegExp(`g${apos}`, 'g'), to: 'ғ' },
  { re: new RegExp(`O${apos}`, 'g'), to: 'Ў' },
  { re: new RegExp(`o${apos}`, 'g'), to: 'ў' },
  // sh, ch, ng, yo, yu, ya (order matters)
  { re: /Sh/g, to: 'Ш' },
  { re: /SH/g, to: 'Ш' },
  { re: /sh/g, to: 'ш' },
  { re: /Ch/g, to: 'Ч' },
  { re: /CH/g, to: 'Ч' },
  { re: /ch/g, to: 'ч' },
  { re: /Ng/g, to: 'Нг' },
  { re: /NG/g, to: 'НГ' },
  { re: /ng/g, to: 'нг' },
  { re: /Yo/g, to: 'Ё' },
  { re: /YO/g, to: 'Ё' },
  { re: /yo/g, to: 'ё' },
  { re: /Yu/g, to: 'Ю' },
  { re: /YU/g, to: 'Ю' },
  { re: /yu/g, to: 'ю' },
  { re: /Ya/g, to: 'Я' },
  { re: /YA/g, to: 'Я' },
  { re: /ya/g, to: 'я' },
];

const singles = [
  ['A','А'], ['a','а'],
  ['B','Б'], ['b','б'],
  ['D','Д'], ['d','д'],
  ['E','Е'], ['e','е'],
  ['F','Ф'], ['f','ф'],
  ['G','Г'], ['g','г'],
  ['H','Ҳ'], ['h','ҳ'],
  ['I','И'], ['i','и'],
  ['J','Ж'], ['j','ж'],
  ['K','К'], ['k','к'],
  ['L','Л'], ['l','л'],
  ['M','М'], ['m','м'],
  ['N','Н'], ['n','н'],
  ['O','О'], ['o','о'],
  ['P','П'], ['p','п'],
  ['Q','Қ'], ['q','қ'],
  ['R','Р'], ['r','р'],
  ['S','С'], ['s','с'],
  ['T','Т'], ['t','т'],
  ['U','У'], ['u','у'],
  ['V','В'], ['v','в'],
  ['X','Х'], ['x','х'],
  ['Y','Й'], ['y','й'],
  ['Z','З'], ['z','з'],
  // O‘/G‘ already handled with patterns above; also Õ/Ğ variants are uncommon
];

export function latinToCyrillic(input) {
  if (!input) return '';
  let s = input;
  // digraphs and apostrophes
  for (const p of patterns) s = s.replace(p.re, p.to);
  // singles
  for (let i = 0; i < singles.length; i += 2) {
    const [latU, cyrU] = singles[i];
    const [latL, cyrL] = singles[i + 1];
    s = s.replaceAll(latU, cyrU).replaceAll(latL, cyrL);
  }
  return s;
}

export function translit(text, script) {
  return script === 'cyrillic' ? latinToCyrillic(text) : text;
}


