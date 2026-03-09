#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { BemValidator } from '../validator/validator.js';
import { defaultConfig } from '../types.js';
import { elementOutsideBlockRule, modifierWithoutValueRule, invalidClassNameRule, mixedNotationsRule, } from '../rules/base-rules.js';
const program = new Command();
program
    .name('bem-validator')
    .description('Валидатор БЭМ-разметки')
    .version('1.0.0');
program
    .argument('[files...]', 'HTML файлы для проверки')
    .option('-c, --config <path>', 'Путь к конфигурационному файлу')
    .option('--stdin', 'Читать HTML из stdin')
    .action((files, options) => {
    // Загружаем конфигурацию
    const config = loadConfig(options.config);
    // Создаём валидатор
    const validator = new BemValidator(config);
    validator.registerRule(elementOutsideBlockRule);
    validator.registerRule(modifierWithoutValueRule);
    validator.registerRule(invalidClassNameRule);
    validator.registerRule(mixedNotationsRule);
    if (options.stdin) {
        // Чтение из stdin
        let html = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('readable', () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                html += chunk;
            }
        });
        process.stdin.on('end', () => {
            const result = validator.validate(html, '<stdin>');
            printResult(result);
            process.exit(result.valid ? 0 : 1);
        });
    }
    else if (files.length > 0) {
        // Проверка файлов
        let hasErrors = false;
        for (const filePattern of files) {
            const result = validator.validate(readFileSync(filePattern, 'utf-8'), filePattern);
            printResult(result);
            if (!result.valid) {
                hasErrors = true;
            }
        }
        process.exit(hasErrors ? 1 : 0);
    }
    else {
        program.help();
    }
});
program.parse();
/**
 * Загружает конфигурацию из файла
 */
function loadConfig(configPath) {
    if (configPath) {
        const resolvedPath = resolve(configPath);
        if (existsSync(resolvedPath)) {
            const content = readFileSync(resolvedPath, 'utf-8');
            const userConfig = JSON.parse(content);
            return { ...defaultConfig, ...userConfig };
        }
    }
    // Ищем .bemrc.json в текущей директории
    const defaultConfigPath = join(process.cwd(), '.bemrc.json');
    if (existsSync(defaultConfigPath)) {
        const content = readFileSync(defaultConfigPath, 'utf-8');
        const userConfig = JSON.parse(content);
        return { ...defaultConfig, ...userConfig };
    }
    return defaultConfig;
}
/**
 * Выводит результаты валидации
 */
function printResult(result) {
    const RED = '\x1b[31m';
    const YELLOW = '\x1b[33m';
    const GREEN = '\x1b[32m';
    const RESET = '\x1b[0m';
    const BOLD = '\x1b[1m';
    if (result.errors.length === 0 && result.warnings.length === 0) {
        console.log(`${GREEN}${BOLD}✓ Все проверки пройдены${RESET}`);
        return;
    }
    // Вывод ошибок
    for (const error of result.errors) {
        console.log(`${RED}${BOLD}✗ ${error.file}:${error.line}:${error.column}${RESET}`);
        console.log(`  ${RED}${error.message}${RESET}`);
        console.log(`  Класс: ${error.class}`);
        console.log(`  Правило: ${error.rule}${RESET}`);
    }
    // Вывод предупреждений
    for (const warning of result.warnings) {
        console.log(`${YELLOW}${BOLD}⚠ ${warning.file}:${warning.line}:${warning.column}${RESET}`);
        console.log(`  ${YELLOW}${warning.message}${RESET}`);
        console.log(`  Класс: ${warning.class}`);
        console.log(`  Правило: ${warning.rule}${RESET}`);
    }
    console.log('');
    console.log(`${result.errors.length > 0 ? RED : YELLOW}${BOLD}` +
        `Найдено: ${result.errors.length} ошибок, ${result.warnings.length} предупреждений${RESET}`);
}
