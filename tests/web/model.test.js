import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BemValidatorModel } from '../../web/js/model.js';

// Мокаем fetch
global.fetch = vi.fn();

describe('BemValidatorModel', () => {
  let model;

  beforeEach(() => {
    model = new BemValidatorModel();
    vi.clearAllMocks();
  });

  describe('validate', () => {
    it('должен успешно валидировать HTML', async () => {
      const mockResult = { errors: [], warnings: [], valid: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await model.validate('<div class="button">Test</div>');

      expect(result).toEqual(mockResult);
      expect(fetch).toHaveBeenCalledWith('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: '<div class="button">Test</div>', fileName: '<input>' }),
      });
    });

    it('должен использовать имя файла', async () => {
      const mockResult = { errors: [], warnings: [], valid: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      await model.validate('<div>Test</div>', 'test.html');

      expect(fetch).toHaveBeenCalledWith('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: '<div>Test</div>', fileName: 'test.html' }),
      });
    });

    it('должен выбрасывать ошибку при неудачном запросе', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(model.validate('<div>Test</div>'))
        .rejects
        .toThrow('Ошибка валидации: HTTP error: 500');
    });

    it('должен выбрасывать ошибку при ошибке сети', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(model.validate('<div>Test</div>'))
        .rejects
        .toThrow('Ошибка валидации: Network error');
    });
  });

  describe('getConfig', () => {
    it('должен получать конфигурацию', async () => {
      const mockConfig = { notation: 'bem', elementSeparator: '__' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const result = await model.getConfig();

      expect(result).toEqual(mockConfig);
      expect(fetch).toHaveBeenCalledWith('/api/config');
    });

    it('должен возвращать null при ошибке', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await model.getConfig();

      expect(result).toBeNull();
    });
  });

  describe('readFile', () => {
    it('должен возвращать Promise при чтении файла', async () => {
      const fileContent = '<div class="test">HTML</div>';
      const mockFile = new Blob([fileContent], { type: 'text/html' });

      // Проверяем, что метод возвращает Promise
      const result = model.readFile(mockFile);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('isHtml', () => {
    it('должен определять HTML', () => {
      expect(model.isHtml('<div>Test</div>')).toBe(true);
      expect(model.isHtml('<span class="test">Text</span>')).toBe(true);
      expect(model.isHtml('  <p>Paragraph</p>  ')).toBe(true);
    });

    it('должен определять не-HTML', () => {
      expect(model.isHtml('Just text')).toBe(false);
      expect(model.isHtml('')).toBe(false);
      expect(model.isHtml('   ')).toBe(false);
      expect(model.isHtml('div class="test"')).toBe(false);
    });
  });
});
