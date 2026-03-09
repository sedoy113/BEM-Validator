import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BemValidatorView } from '../../web/js/view.js';

describe('BemValidatorView', () => {
  let view;
  let container;

  beforeEach(() => {
    // Создаём тестовую DOM-структуру
    container = document.createElement('div');
    container.innerHTML = `
      <div class="editor">
        <div id="lineNumbers" class="editor__line-numbers">1</div>
        <textarea id="htmlInput" class="editor__textarea"></textarea>
      </div>
      <div id="results" class="results"></div>
      <div id="status" class="status" style="display: none;">
        <span id="errorCount" class="status__count">0</span>
        <span id="warningCount" class="status__count">0</span>
      </div>
      <input type="file" id="fileInput" class="file-input">
      <button id="btnValidate" class="btn btn--primary">Проверить</button>
      <button id="btnClear" class="btn btn--secondary">Очистить</button>
      <button id="btnExample" class="btn btn--secondary">Пример</button>
      <button id="btnUpload" class="btn btn--secondary">Загрузить файл</button>
    `;
    document.body.appendChild(container);

    view = new BemValidatorView();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('getInputHtml / setInputHtml', () => {
    it('должен получать HTML из поля ввода', () => {
      view.setInputHtml('<div class="test">Content</div>');
      expect(view.getInputHtml()).toBe('<div class="test">Content</div>');
    });

    it('должен устанавливать HTML в поле ввода', () => {
      view.setInputHtml('<button>Click</button>');
      expect(view.getInputHtml()).toBe('<button>Click</button>');
    });

    it('должен обрезать пробелы при получении', () => {
      view.setInputHtml('  <div>Test</div>  ');
      expect(view.getInputHtml()).toBe('<div>Test</div>');
    });
  });

  describe('clear', () => {
    it('должен очищать поле ввода и результаты', () => {
      view.setInputHtml('<div>Test</div>');
      document.getElementById('results').innerHTML = '<div class="result-item">Result</div>';
      document.getElementById('status').style.display = 'flex';

      view.clear();

      expect(view.getInputHtml()).toBe('');
      expect(document.getElementById('results').innerHTML).toContain('empty-state');
      expect(document.getElementById('status').style.display).toBe('none');
    });

    it('должен сбрасывать номера строк', () => {
      view.setInputHtml('<div>Line 1\nLine 2\nLine 3</div>');
      view.updateLineNumbers();

      view.clear();

      expect(document.getElementById('lineNumbers').textContent).toBe('1');
    });
  });

  describe('line numbers', () => {
    it('должен обновлять номера строк', () => {
      view.setInputHtml('<div>Line 1\nLine 2\nLine 3</div>');
      view.updateLineNumbers();

      expect(document.getElementById('lineNumbers').textContent.trim()).toBe('1\n2\n3');
    });

    it('должен сбрасывать номера строк к 1', () => {
      view.setInputHtml('<div>Line 1\nLine 2\nLine 3</div>');
      view.updateLineNumbers();

      view.resetLineNumbers();

      expect(document.getElementById('lineNumbers').textContent).toBe('1');
    });

    it('должен устанавливать обработчик onInputUpdate', () => {
      const handler = vi.fn();
      view.onInputUpdate(handler);

      const textarea = document.getElementById('htmlInput');
      textarea.value = '<div>Test</div>';
      textarea.dispatchEvent(new Event('input'));

      expect(handler).toHaveBeenCalled();
    });

    it('должен изменять высоту textarea при вводе', () => {
      const handler = vi.fn();
      view.onInputUpdate(handler);

      const textarea = document.getElementById('htmlInput');
      textarea.value = '<div>Line 1\nLine 2\nLine 3\nLine 4</div>';
      textarea.style.height = 'auto';
      textarea.dispatchEvent(new Event('input'));

      expect(textarea.style.height).not.toBe('auto');
    });
  });

  describe('renderResults', () => {
    it('должен отображать успех при отсутствии ошибок', () => {
      view.renderResults({ errors: [], warnings: [], valid: true });

      const results = document.getElementById('results');
      expect(results.innerHTML).toContain('Все проверки пройдены');
      expect(results.innerHTML).toContain('✅');
    });

    it('должен отображать ошибки', () => {
      const result = {
        errors: [{
          line: 1,
          column: 5,
          file: 'test.html',
          class: 'button__text',
          rule: 'element-outside-block',
          message: 'Элемент должен быть внутри блока',
          severity: 'error',
        }],
        warnings: [],
        valid: false,
      };

      view.renderResults(result);

      const results = document.getElementById('results');
      expect(results.innerHTML).toContain('Ошибка в строке 1:5');
      expect(results.innerHTML).toContain('button__text');
      expect(results.innerHTML).toContain('result-error');
    });

    it('должен отображать предупреждения', () => {
      const result = {
        errors: [],
        warnings: [{
          line: 2,
          column: 10,
          file: 'test.html',
          class: 'button--disabled',
          rule: 'modifier-without-value',
          message: 'Модификатор должен иметь значение',
          severity: 'warning',
        }],
        valid: true,
      };

      view.renderResults(result);

      const results = document.getElementById('results');
      expect(results.innerHTML).toContain('Предупреждение в строке 2:10');
      expect(results.innerHTML).toContain('result-warning');
    });

    it('должен обновлять счётчики ошибок и предупреждений', () => {
      const result = {
        errors: [{ line: 1, column: 1, file: '', class: '', rule: '', message: '', severity: 'error' }],
        warnings: [
          { line: 2, column: 1, file: '', class: '', rule: '', message: '', severity: 'warning' },
          { line: 3, column: 1, file: '', class: '', rule: '', message: '', severity: 'warning' },
        ],
        valid: false,
      };

      view.renderResults(result);

      expect(document.getElementById('errorCount').textContent).toBe('1');
      expect(document.getElementById('warningCount').textContent).toBe('2');
      expect(document.getElementById('status').style.display).toBe('flex');
    });
  });

  describe('renderError', () => {
    it('должен отображать ошибку', () => {
      const error = new Error('Test error message');

      view.renderError(error);

      const results = document.getElementById('results');
      expect(results.innerHTML).toContain('Test error message');
      expect(results.innerHTML).toContain('result-error');
    });
  });

  describe('showLoading', () => {
    it('должен показывать индикатор загрузки', () => {
      view.showLoading();

      const results = document.getElementById('results');
      expect(results.innerHTML).toContain('Проверка');
      expect(document.getElementById('status').style.display).toBe('none');
    });
  });

  describe('event handlers', () => {
    it('должен устанавливать обработчик onValidate', () => {
      const handler = vi.fn();
      view.onValidate(handler);

      document.getElementById('btnValidate').click();

      expect(handler).toHaveBeenCalled();
    });

    it('должен устанавливать обработчик onClear', () => {
      const handler = vi.fn();
      view.onClear(handler);

      document.getElementById('btnClear').click();

      expect(handler).toHaveBeenCalled();
    });

    it('должен устанавливать обработчик onLoadExample', () => {
      const handler = vi.fn();
      view.onLoadExample(handler);

      document.getElementById('btnExample').click();

      expect(handler).toHaveBeenCalled();
    });

    it('должен устанавливать обработчик onUpload', () => {
      const handler = vi.fn();
      view.onUpload(handler);

      document.getElementById('btnUpload').click();

      expect(handler).toHaveBeenCalled();
    });

    it('должен открывать file picker при вызове openFilePicker', () => {
      const fileInput = document.getElementById('fileInput');
      const clickSpy = vi.spyOn(fileInput, 'click');

      view.openFilePicker();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('должен устанавливать обработчик onFileChange', () => {
      const handler = vi.fn();
      view.onFileChange(handler);

      const fileInput = document.getElementById('fileInput');
      fileInput.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalled();
    });

    it('должен устанавливать обработчик onCtrlEnter', () => {
      const handler = vi.fn();
      view.onCtrlEnter(handler);

      const textarea = document.getElementById('htmlInput');
      textarea.value = '<div>Test</div>';
      textarea.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'Enter' }));

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('file handling', () => {
    it('должен возвращать выбранный файл', () => {
      const file = new File(['<div>Test</div>'], 'test.html', { type: 'text/html' });
      const fileInput = document.getElementById('fileInput');

      // Мокаем files
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
      });

      expect(view.getSelectedFile()).toBe(file);
    });

    it('должен возвращать null если файл не выбран', () => {
      const fileInput = document.getElementById('fileInput');

      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: true,
      });

      expect(view.getSelectedFile()).toBeNull();
    });

    it('должен сбрасывать выбор файла', () => {
      const file = new File(['test'], 'test.html', { type: 'text/html' });
      const fileInput = document.getElementById('fileInput');

      // happy-dom не позволяет изменять files напрямую
      // Проверяем, что метод вызывается без ошибок
      expect(() => view.resetFileInput()).not.toThrow();
    });
  });
});
