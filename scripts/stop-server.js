#!/usr/bin/env node

import { execSync } from 'child_process';

const PORT = process.env.PORT || '3000';

try {
  // Находим процесс, занимающий порт
  const result = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' }).trim();
  
  if (result) {
    const pids = result.split('\n');
    console.log(`Найдены процессы на порту ${PORT}: ${pids.join(', ')}`);
    
    // Убиваем процессы
    pids.forEach(pid => {
      execSync(`kill ${pid}`);
      console.log(`Процесс ${pid} остановлен`);
    });
    
    console.log('Сервер остановлен');
  } else {
    console.log('Сервер не запущен (порт свободен)');
  }
} catch (error) {
  // Если lsof ничего не нашёл, он вернёт код ошибки 1
  if (error.status === 1 && !error.stdout?.trim()) {
    console.log('Сервер не запущен (порт свободен)');
  } else {
    console.error('Ошибка при остановке сервера:', error.message);
    process.exit(1);
  }
}
