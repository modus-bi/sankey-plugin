'use strict';

const fs = require('fs');
const tar = require('tar');
const path = require('path');

const pluginFilePath = './build/custom_chart_0.js';
const manifestFilePath = './build/manifest.json';
const tempFolder = './temp';

function createTempFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  } catch (err) {
    console.error(`Ошибка при создании временной папки: ${folderPath}`, err);
    throw err;
  }
}

function deleteFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmdirSync(folderPath, { recursive: true }); // Используем rmdirSync с recursive
    }
  } catch (err) {
    console.error(`Ошибка при удалении временной папки: ${folderPath}`, err);
    throw err;
  }
}

function copyFileToFolder(srcPath, destFolder, destFileName = null) {
  try {
    // Если передано новое имя, используем его, иначе сохраняем оригинальное
    const destPath = path.join(destFolder, destFileName || path.basename(srcPath));
    fs.copyFileSync(srcPath, destPath);
    return destPath;
  } catch (err) {
    console.error(`Ошибка при копировании файла: ${srcPath} -> ${destFolder}`, err);
    throw err;
  }
}

function replaceInFile(filePath, search, replace, charLimit) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const partToModify = content.slice(0, charLimit);
    const modifiedPart = partToModify.replace(new RegExp(search, 'g'), replace);
    content = modifiedPart + content.slice(charLimit);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    console.error(`Ошибка при обработке файла ${filePath}:`, err);
    throw err;
  }
}

function createTarGzWithoutPaths(archiveName, files, workingDirectory) {
  try {
    return tar.c(
      {
        gzip: true,
        file: archiveName,
        cwd: workingDirectory,
      },
      files.map(file => path.basename(file))
    );
  } catch (err) {
    console.error(`Ошибка при создании архива ${archiveName}:`, err);
    throw err;
  }
}

async function main() {
  try {
    // Создаём временную директорию
    createTempFolder(tempFolder);

    // Копируем исходный плагин в папку temp и переименовываем его в plugin.js
    const tempPluginPath = copyFileToFolder(pluginFilePath, tempFolder, 'plugin.js');

    // Копируем манифест в папку temp
    const tempManifestPath = copyFileToFolder(manifestFilePath, tempFolder);

    // Модифицируем плагин внутри временной папки
    replaceInFile(tempPluginPath, 'CustomChart0', 'CustomChartNNN', 1000);

    // Читаем манифест, чтобы получить имя архива
    const manifestContent = fs.readFileSync(tempManifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    const archiveName = `${manifest.name}.tar.gz`;

    // Создаём архив из временной папки
    await createTarGzWithoutPaths(archiveName, [tempPluginPath, tempManifestPath], tempFolder);

    // Удаляем временную папку после завершения обработки
    deleteFolder(tempFolder);

    console.log('Готово!');
  } catch (err) {
    console.error('Ошибка выполнения скрипта:', err);
  }
}

main();
