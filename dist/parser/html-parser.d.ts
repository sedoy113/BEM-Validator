import type { HtmlElement } from '../types.js';
/**
 * Парсит HTML и извлекает элементы с классами
 */
export declare function parseHtml(html: string, fileName?: string): HtmlElement[];
/**
 * Извлекает все классы из HTML
 */
export declare function extractClasses(html: string): string[];
