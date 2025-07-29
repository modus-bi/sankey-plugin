'use strict';

const fs = require('fs');

const filePath = './build/custom_chart_0.js';
const indexRange = [0,40];
const charLimit = 1000;

async function multiplyPlugin() {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const partToModify = content.slice(0, charLimit);
    for(let i = indexRange[0]; i <= indexRange[1]; i += 1) {
      const modifiedPart = partToModify.replace(new RegExp('CustomChart0', 'g'), `CustomChart${i}`);
      const contentModified = modifiedPart + content.slice(charLimit);
      fs.writeFileSync(`./build/custom_chart_${i}.js`, contentModified, 'utf8');
    }
  } catch (err) {
    console.error(`Ошибка при обработке файла ${filePath}:`, err);
    throw err;
  }
}

function multiplyCode() {
  let output = '';
  let code = `    'CustomChart1',`;
  for (let i = indexRange[0]; i <= indexRange[1]; i++) {
    output += code.replace(/1/g, `${i}`) + '\n';
  }
  console.log(output);
}

async function main() {
  //await multiplyPlugin();
  multiplyCode();
}

main();

