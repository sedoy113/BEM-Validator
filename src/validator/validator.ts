import type { HtmlElement, BemClass, ValidationError, BemConfig, ValidationResult } from '../types.js';
import { parseHtml } from '../parser/html-parser.js';
import { parseBemClass } from '../parser/bem-parser.js';
import type { Rule } from '../rules/base-rules.js';

/**
 * Валидатор БЭМ-разметки
 */
export class BemValidator {
  private rules: Rule[] = [];
  
  constructor(private config: BemConfig) {}
  
  /**
   * Регистрирует правило валидации
   */
  registerRule(rule: Rule): void {
    this.rules.push(rule);
  }
  
  /**
   * Валидирует HTML-код
   */
  validate(html: string, fileName: string = 'unknown'): ValidationResult {
    // Парсим HTML и извлекаем элементы
    const elements = parseHtml(html);
    
    // Извлекаем все классы
    const allClasses = new Set<string>();
    for (const element of elements) {
      for (const cls of element.classes) {
        allClasses.add(cls);
      }
    }
    
    // Парсим БЭМ-классы
    const bemClasses: BemClass[] = [];
    for (const cls of allClasses) {
      bemClasses.push(parseBemClass(cls, this.config));
    }
    
    // Применяем правила
    const allErrors: ValidationError[] = [];
    
    for (const rule of this.rules) {
      // Проверяем, включено ли правило
      const ruleSeverity = this.config.rules[rule.name];
      if (ruleSeverity === 'off') {
        continue;
      }
      
      const errors = rule.check(elements, bemClasses, this.config, fileName);
      
      // Фильтруем по severity
      for (const error of errors) {
        if (ruleSeverity === 'error' && error.severity === 'error') {
          allErrors.push(error);
        } else if (ruleSeverity === 'warning') {
          allErrors.push({ ...error, severity: 'warning' });
        }
      }
    }
    
    // Разделяем ошибки и предупреждения
    const errors = allErrors.filter(e => e.severity === 'error');
    const warnings = allErrors.filter(e => e.severity === 'warning');
    
    return {
      errors,
      warnings,
      valid: errors.length === 0,
    };
  }
}
