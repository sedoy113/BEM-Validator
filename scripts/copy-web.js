#!/usr/bin/env node

/**
 * Скрипт для копирования веб-файлов в dist
 * Используется при сборке продакшен-версии
 */

import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const webDir = join(rootDir, 'web');
const distWebDir = join(rootDir, 'dist', 'web');

// Удаляем старую папку web в dist
if (existsSync(distWebDir)) {
  rmSync(distWebDir, { recursive: true, force: true });
}

// Создаём папку
mkdirSync(distWebDir, { recursive: true });

// Копируем файлы
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  
  const entries = new URL('file://' + src).pathname;
  const files = new URL('file://' + dest).pathname;
  
  // Копируем index.html
  copyFileSync(join(src, 'index.html'), join(dest, 'index.html'));
  console.log('✓ Скопирован index.html');

  // Копируем favicon.ico
  const faviconSrc = join(src, 'favicon.ico');
  const faviconDest = join(dest, 'favicon.ico');
  if (existsSync(faviconSrc)) {
    copyFileSync(faviconSrc, faviconDest);
    console.log('✓ Скопирован favicon.ico');
  }
  
  // Копируем папку js
  const jsSrc = join(src, 'js');
  const jsDest = join(dest, 'js');
  mkdirSync(jsDest, { recursive: true });
  
  const jsFiles = ['model.js', 'view.js', 'presenter.js', 'app.js'];
  for (const file of jsFiles) {
    const srcFile = join(jsSrc, file);
    const destFile = join(jsDest, file);
    if (existsSync(srcFile)) {
      copyFileSync(srcFile, destFile);
      console.log(`✓ Скопирован js/${file}`);
    }
  }
  
  // Копируем папку css
  const cssSrc = join(src, 'css');
  const cssDest = join(dest, 'css');
  mkdirSync(cssDest, { recursive: true });
  
  const cssFiles = ['style.css'];
  for (const file of cssFiles) {
    const srcFile = join(cssSrc, file);
    const destFile = join(cssDest, file);
    if (existsSync(srcFile)) {
      copyFileSync(srcFile, destFile);
      console.log(`✓ Скопирован css/${file}`);
    }
  }
}

try {
  copyDir(webDir, distWebDir);
  console.log('\n✅ Веб-файлы скопированы в dist/web/');
} catch (error) {
  console.error('❌ Ошибка копирования:', error.message);
  process.exit(1);
}
