import type { BemClass, BemConfig } from '../types.js';

/**
 * Парсит БЭМ-класс и возвращает его структуру
 */
export function parseBemClass(className: string, config: BemConfig): BemClass {
  const { elementSeparator, modifierSeparator } = config;
  
  const result: BemClass = {
    original: className,
    block: '',
    element: undefined,
    modifier: undefined,
    isValid: true,
  };
  
  // Проверка на пустой класс
  if (!className || className.trim() === '') {
    result.isValid = false;
    return result;
  }
  
  // Разделяем модификатор
  const modifierIndex = className.lastIndexOf(modifierSeparator);
  let basePart = className;
  
  if (modifierIndex !== -1) {
    const modifierPart = className.substring(modifierIndex + modifierSeparator.length);
    basePart = className.substring(0, modifierIndex);
    
    // Модификатор может иметь значение (через дефис)
    const valueIndex = modifierPart.indexOf('-');
    if (valueIndex !== -1 && valueIndex !== modifierPart.length - 1) {
      result.modifier = {
        name: modifierPart.substring(0, valueIndex),
        value: modifierPart.substring(valueIndex + 1),
      };
    } else {
      result.modifier = {
        name: modifierPart,
        value: undefined,
      };
    }
  }
  
  // Разделяем блок и элемент
  const elementIndex = basePart.indexOf(elementSeparator);
  
  if (elementIndex !== -1) {
    result.block = basePart.substring(0, elementIndex);
    result.element = basePart.substring(elementIndex + elementSeparator.length);
    
    // Проверка на пустой блок или элемент
    if (!result.block || !result.element) {
      result.isValid = false;
    }
  } else {
    result.block = basePart;
  }
  
  // Проверка на пустой блок
  if (!result.block) {
    result.isValid = false;
  }
  
  // Проверка на допустимые символы (только латиница, цифры, дефис)
  const validPattern = /^[a-z][a-z0-9-]*$/i;
  if (result.block && !validPattern.test(result.block)) {
    result.isValid = false;
  }
  if (result.element && !validPattern.test(result.element)) {
    result.isValid = false;
  }
  if (result.modifier?.name && !validPattern.test(result.modifier.name)) {
    result.isValid = false;
  }
  if (result.modifier?.value && !validPattern.test(result.modifier.value)) {
    result.isValid = false;
  }
  
  return result;
}

/**
 * Проверяет, является ли класс БЭМ-классом
 */
export function isBemClass(className: string, config: BemConfig): boolean {
  const { elementSeparator, modifierSeparator } = config;
  return className.includes(elementSeparator) || className.includes(modifierSeparator);
}

/**
 * Анализирует коллекцию классов и возвращает БЭМ-структуры
 */
export function analyzeClasses(classes: string[], config: BemConfig): BemClass[] {
  return classes.map(cls => parseBemClass(cls, config));
}
