import { describe, it, expect } from 'vitest';
import { parseHtml, extractClasses } from '../src/parser/html-parser.js';

describe('parseHtml', () => {
  it('должен парсить простые элементы с классами', () => {
    const html = '<div class="button">Text</div>';
    const result = parseHtml(html, 'test.html');
    
    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('div');
    expect(result[0].classes).toContain('button');
  });
  
  it('должен парсить несколько классов', () => {
    const html = '<div class="button button--large primary">Text</div>';
    const result = parseHtml(html, 'test.html');
    
    expect(result[0].classes).toEqual(['button', 'button--large', 'primary']);
  });
  
  it('должен парсить вложенные элементы', () => {
    const html = `
      <div class="header">
        <div class="header__logo">Logo</div>
      </div>
    `;
    const result = parseHtml(html, 'test.html');
    
    expect(result).toHaveLength(2);
    expect(result[0].classes).toContain('header');
    expect(result[1].classes).toContain('header__logo');
  });
  
  it('должен определять позицию элементов', () => {
    const html = `<div class="test">Test</div>`;
    const result = parseHtml(html, 'test.html');
    
    expect(result[0].line).toBe(1);
    expect(result[0].column).toBe(1);
  });
});

describe('extractClasses', () => {
  it('должен извлекать все уникальные классы', () => {
    const html = `
      <div class="button button--large">Btn</div>
      <div class="button">Btn2</div>
    `;
    const result = extractClasses(html);
    
    expect(result).toEqual(expect.arrayContaining(['button', 'button--large']));
    expect(result.length).toBe(2);
  });
});
