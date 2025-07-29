export const bigNumberClasses = [
  { number: 1e3, prefix: 'k' },
  { number: 1e6, prefix: 'M' },
  { number: 1e9, prefix: 'G' },
  { number: 1e12, prefix: 'T' },
  { number: 1e3, prefix: ' тыс' },
  { number: 1e6, prefix: ' млн' },
  { number: 1e9, prefix: ' млрд' },
  { number: 1e12, prefix: ' трлн' },
];

export const smallNumberClasses = [
  { number: 1e-24, prefix: 'y' },
  { number: 1e-21, prefix: 'z' },
  { number: 1e-18, prefix: 'a' },
  { number: 1e-15, prefix: 'f' },
  { number: 1e-12, prefix: 'p' },
  { number: 1e-9, prefix: 'n' },
  { number: 1e-6, prefix: 'μ' },
  { number: 1e-3, prefix: 'm' },
];

export const balloonTemplates = [
  { name: 'Авто', value: null },
  { name: 'Значение', value: '[[value]]' },
  { name: 'Процент', value: '[[percents]]%' },
  { name: 'Категория', value: '[[categories]]' },
  { name: 'Кат.: Знач.', value: '[[categories]]: [[value]]' },
  { name: 'Кат.: Проц.', value: '[[categories]]: [[percents]]%' },
  { name: 'Кат.: Знач. (проц.)', value: '[[categories]]: [[value]] ([[percents]]%)' },
  { name: 'Кат.: Проц. (знач.)', value: '[[categories]]: [[percents]]% ([[value]])' },
  { name: 'Подсказка', value: '[[tooltip]]' },
  { name: 'Подск.: Знач.', value: '[[tooltip]]: [[value]]' },
  { name: 'Подск.: Проц.', value: '[[tooltip]]: [[percents]]%' },
  { name: 'Подск.: Знач. (проц.)', value: '[[tooltip]]: [[value]] ([[percents]]%)' },
  { name: 'Подск.: Проц. (знач.)', value: '[[tooltip]]: [[percents]]% ([[value]])' },
];
