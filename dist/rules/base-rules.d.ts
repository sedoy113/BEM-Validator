import type { BemClass, HtmlElement, ValidationError, BemConfig } from '../types.js';
export interface Rule {
    name: string;
    check: (elements: HtmlElement[], bemClasses: BemClass[], config: BemConfig, fileName: string) => ValidationError[];
}
/**
 * Правило: Элемент не может существовать без родительского блока
 * Проверяем, что у элемента есть блок (на том же элементе или в родителе)
 */
export declare const elementOutsideBlockRule: Rule;
/**
 * Правило: Модификатор должен иметь значение
 */
export declare const modifierWithoutValueRule: Rule;
/**
 * Правило: Некорректное имя класса
 */
export declare const invalidClassNameRule: Rule;
/**
 * Правило: Смешение разных нотаций
 *
 * Проверяет реальное смешение нотаций БЭМ:
 * - Классическая: .block__element--modifier (два подчёркивания, два дефиса)
 * - Альтернативная: .block_element_modifier (одно подчёркивание)
 *
 * НЕ считает смешением:
 * - Дефисы в имени блока (news-list, page-content)
 * - Модификаторы с -- (block--modifier)
 */
export declare const mixedNotationsRule: Rule;
