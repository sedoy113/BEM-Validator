import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { BemValidator } from '../validator/validator.js';
import { defaultConfig, type BemConfig } from '../types.js';
import {
  elementOutsideBlockRule,
  modifierWithoutValueRule,
  invalidClassNameRule,
  mixedNotationsRule,
} from '../rules/base-rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Путь к веб-директории: dist/server -> dist/web
const webPath = join(__dirname, '../web');

// Загружаем конфигурацию
function loadConfig(): BemConfig {
  const configPath = join(__dirname, '../../.bemrc.json');
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(content);
    return { ...defaultConfig, ...userConfig };
  }
  return defaultConfig;
}

const config = loadConfig();

app.use(express.json());
app.use(express.static(webPath));

// Создаём валидатор с конфигурацией
const validator = new BemValidator(config);
validator.registerRule(elementOutsideBlockRule);
validator.registerRule(modifierWithoutValueRule);
validator.registerRule(invalidClassNameRule);
validator.registerRule(mixedNotationsRule);

// API для валидации
app.post('/api/validate', (req, res) => {
  const { html, fileName = '<input>' } = req.body;
  
  if (!html) {
    res.status(400).json({ error: 'HTML не предоставлен' });
    return;
  }
  
  const result = validator.validate(html, fileName);
  res.json(result);
});

// API для получения конфигурации
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Редирект с корня на index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.listen(PORT, () => {
  console.log(`🚀 BEM Validator запущен на http://localhost:${PORT}`);
});
