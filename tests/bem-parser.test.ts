import { describe, it, expect } from 'vitest';
import { parseBemClass, isBemClass, analyzeClasses } from '../src/parser/bem-parser.js';
import { defaultConfig } from '../src/types.js';

describe('parseBemClass', () => {
  it('должен парсить простой блок', () => {
    const result = parseBemClass('button', defaultConfig);
    
    expect(result.block).toBe('button');
    expect(result.element).toBeUndefined();
    expect(result.modifier).toBeUndefined();
    expect(result.isValid).toBe(true);
  });
  
  it('должен парсить блок с элементом', () => {
    const result = parseBemClass('header__logo', defaultConfig);
    
    expect(result.block).toBe('header');
    expect(result.element).toBe('logo');
    expect(result.modifier).toBeUndefined();
    expect(result.isValid).toBe(true);
  });
  
  it('должен парсить блок с модификатором', () => {
    const result = parseBemClass('button--disabled', defaultConfig);
    
    expect(result.block).toBe('button');
    expect(result.element).toBeUndefined();
    expect(result.modifier).toEqual({ name: 'disabled', value: undefined });
    expect(result.isValid).toBe(true);
  });
  
  it('должен парсить блок с элементом и модификатором', () => {
    const result = parseBemClass('header__link--active', defaultConfig);
    
    expect(result.block).toBe('header');
    expect(result.element).toBe('link');
    expect(result.modifier).toEqual({ name: 'active', value: undefined });
    expect(result.isValid).toBe(true);
  });
  
  it('должен парсить модификатор со значением', () => {
    const result = parseBemClass('button--size-large', defaultConfig);
    
    expect(result.block).toBe('button');
    expect(result.element).toBeUndefined();
    expect(result.modifier).toEqual({ name: 'size', value: 'large' });
    expect(result.isValid).toBe(true);
  });
  
  it('должен отмечать некорректные классы', () => {
    const result = parseBemClass('__element', defaultConfig);
    
    expect(result.isValid).toBe(false);
  });
  
  it('должен отмечать пустые классы', () => {
    const result = parseBemClass('', defaultConfig);
    
    expect(result.isValid).toBe(false);
  });
});

describe('isBemClass', () => {
  it('должен определять БЭМ-классы', () => {
    expect(isBemClass('block__element', defaultConfig)).toBe(true);
    expect(isBemClass('block--modifier', defaultConfig)).toBe(true);
    expect(isBemClass('block', defaultConfig)).toBe(false);
    expect(isBemClass('non-bem', defaultConfig)).toBe(false);
  });
});

describe('analyzeClasses', () => {
  it('должен анализировать коллекцию классов', () => {
    const classes = ['header', 'header__logo', 'button--disabled'];
    const result = analyzeClasses(classes, defaultConfig);
    
    expect(result).toHaveLength(3);
    expect(result[0].block).toBe('header');
    expect(result[1].element).toBe('logo');
    expect(result[2].modifier).toBeDefined();
  });
});
