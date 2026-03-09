/**
 * Типы данных для валидатора БЭМ
 */

export interface BemConfig {
  notation: 'bem' | 'bem-dash' | 'two-dashes';
  elementSeparator: string;
  modifierSeparator: string;
  rules: Record<string, 'error' | 'warning' | 'off'>;
  ignore: string[];
  files: string[];
}

export interface BemClass {
  original: string;
  block: string;
  element?: string;
  modifier?: {
    name: string;
    value?: string;
  };
  isValid: boolean;
}

export interface ValidationError {
  line: number;
  column: number;
  file: string;
  class: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  valid: boolean;
}

export interface HtmlElement {
  tag: string;
  classes: string[];
  line: number;
  column: number;
  parentBlock?: string;
}

export const defaultConfig: BemConfig = {
  notation: 'bem',
  elementSeparator: '__',
  modifierSeparator: '--',
  rules: {
    'element-outside-block': 'error',
    'modifier-without-value': 'warning',
    'mixed-notations': 'error',
    'invalid-class-name': 'error',
  },
  ignore: ['node_modules', 'dist'],
  files: ['**/*.html'],
};
