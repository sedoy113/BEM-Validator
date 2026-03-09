import type { BemClass, BemConfig } from '../types.js';
/**
 * Парсит БЭМ-класс и возвращает его структуру
 */
export declare function parseBemClass(className: string, config: BemConfig): BemClass;
/**
 * Проверяет, является ли класс БЭМ-классом
 */
export declare function isBemClass(className: string, config: BemConfig): boolean;
/**
 * Анализирует коллекцию классов и возвращает БЭМ-структуры
 */
export declare function analyzeClasses(classes: string[], config: BemConfig): BemClass[];
