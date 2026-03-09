import type { BemConfig, ValidationResult } from '../types.js';
import type { Rule } from '../rules/base-rules.js';
/**
 * Валидатор БЭМ-разметки
 */
export declare class BemValidator {
    private config;
    private rules;
    constructor(config: BemConfig);
    /**
     * Регистрирует правило валидации
     */
    registerRule(rule: Rule): void;
    /**
     * Валидирует HTML-код
     */
    validate(html: string, fileName?: string): ValidationResult;
}
