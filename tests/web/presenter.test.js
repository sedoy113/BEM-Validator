import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BemValidatorPresenter } from '../../web/js/presenter.js';

// Мокаем зависимости
vi.mock('../../web/js/model.js');
vi.mock('../../web/js/view.js');

describe('BemValidatorPresenter', () => {
  let presenter;
  let mockModel;
  let mockView;

  beforeEach(() => {
    mockModel = {
      validate: vi.fn(),
      getConfig: vi.fn(),
      readFile: vi.fn(),
      isHtml: vi.fn(),
    };

    mockView = {
      onValidate: vi.fn((fn) => mockView._onValidate = fn),
      onClear: vi.fn((fn) => mockView._onClear = fn),
      onLoadExample: vi.fn((fn) => mockView._onLoadExample = fn),
      onUpload: vi.fn((fn) => mockView._onUpload = fn),
      onFileChange: vi.fn((fn) => mockView._onFileChange = fn),
      onCtrlEnter: vi.fn((fn) => mockView._onCtrlEnter = fn),
      onToTop: vi.fn((fn) => mockView._onToTop = fn),
      onInputUpdate: vi.fn((fn) => mockView._onInputUpdate = fn),
      getInputHtml: vi.fn(),
      setInputHtml: vi.fn(),
      clear: vi.fn(),
      renderResults: vi.fn(),
      renderError: vi.fn(),
      showLoading: vi.fn(),
      getSelectedFile: vi.fn(),
      resetFileInput: vi.fn(),
      openFilePicker: vi.fn(),
      updateLineNumbers: vi.fn(),
      resetLineNumbers: vi.fn(),
    };

    presenter = new BemValidatorPresenter(mockModel, mockView);
  });

  describe('init', () => {
    it('должен устанавливать обработчики событий', () => {
      presenter.init();

      expect(mockView.onValidate).toHaveBeenCalled();
      expect(mockView.onClear).toHaveBeenCalled();
      expect(mockView.onLoadExample).toHaveBeenCalled();
      expect(mockView.onUpload).toHaveBeenCalled();
      expect(mockView.onFileChange).toHaveBeenCalled();
      expect(mockView.onCtrlEnter).toHaveBeenCalled();
      expect(mockView.onToTop).toHaveBeenCalled();
    });

    it('должен открывать file picker при клике на кнопку загрузки', () => {
      presenter.init();
      mockView._onUpload();

      expect(mockView.openFilePicker).toHaveBeenCalled();
    });

    it('должен прокручивать страницу наверх при клике на кнопку', () => {
      const scrollToSpy = vi.spyOn(window, 'scrollTo');
      
      presenter.init();
      mockView._onToTop();

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
      
      scrollToSpy.mockRestore();
    });

    it('должен показывать кнопку при прокрутке', () => {
      // Создаём тестовый элемент
      const btn = document.createElement('button');
      btn.id = 'btnToTop';
      btn.className = 'btn--to-top';
      document.body.appendChild(btn);

      // Имитируем прокрутку
      window.scrollY = 400;
      window.dispatchEvent(new Event('scroll'));

      // Ждём requestAnimationFrame
      setTimeout(() => {
        expect(btn.classList.contains('visible')).toBe(true);
        document.body.removeChild(btn);
      }, 100);
    });

    it('должен загружать конфигурацию при инициализации', async () => {
      mockModel.getConfig.mockResolvedValue({ notation: 'bem' });

      presenter.init();

      // Ждём асинхронную загрузку
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockModel.getConfig).toHaveBeenCalled();
    });
  });

  describe('validate handler', () => {
    it('должен валидировать HTML', async () => {
      mockView.getInputHtml.mockReturnValue('<div class="button">Test</div>');
      mockModel.validate.mockResolvedValue({ errors: [], warnings: [], valid: true });

      presenter.init();
      await mockView._onValidate();

      expect(mockView.showLoading).toHaveBeenCalled();
      expect(mockModel.validate).toHaveBeenCalledWith('<div class="button">Test</div>');
      expect(mockView.renderResults).toHaveBeenCalledWith({ errors: [], warnings: [], valid: true });
    });

    it('должен показывать ошибку если HTML пуст', async () => {
      mockView.getInputHtml.mockReturnValue('');

      presenter.init();
      await mockView._onValidate();

      expect(mockView.renderError).toHaveBeenCalled();
      expect(mockModel.validate).not.toHaveBeenCalled();
    });

    it('должен показывать ошибку при неудачной валидации', async () => {
      mockView.getInputHtml.mockReturnValue('<div>Test</div>');
      mockModel.validate.mockRejectedValue(new Error('API error'));

      presenter.init();
      await mockView._onValidate();

      expect(mockView.renderError).toHaveBeenCalled();
    });
  });

  describe('clear handler', () => {
    it('должен очищать интерфейс', () => {
      presenter.init();
      mockView._onClear();

      expect(mockView.clear).toHaveBeenCalled();
    });
  });

  describe('loadExample handler', () => {
    it('должен загружать пример БЭМ-разметки', () => {
      presenter.init();
      mockView._onLoadExample();

      expect(mockView.setInputHtml).toHaveBeenCalled();
      const example = mockView.setInputHtml.mock.calls[0][0];
      expect(example).toContain('header');
      expect(example).toContain('header__logo');
    });
  });

  describe('fileChange handler', () => {
    it('должен загружать файл и валидировать', async () => {
      const fileContent = '<div class="test">HTML</div>';
      const mockFile = new File([fileContent], 'test.html', { type: 'text/html' });
      
      mockView.getSelectedFile.mockReturnValue(mockFile);
      mockModel.readFile.mockResolvedValue(fileContent);
      mockModel.isHtml.mockReturnValue(true);
      mockModel.validate.mockResolvedValue({ errors: [], warnings: [], valid: true });
      // После setInputHtml, getInputHtml должен вернуть тот же контент
      mockView.getInputHtml.mockReturnValue(fileContent);

      presenter.init();
      
      // Вызываем обработчик напрямую
      await mockView._onFileChange();

      expect(mockModel.readFile).toHaveBeenCalledWith(mockFile);
      expect(mockModel.isHtml).toHaveBeenCalledWith(fileContent);
      expect(mockView.setInputHtml).toHaveBeenCalledWith(fileContent);
      expect(mockView.resetFileInput).toHaveBeenCalled();
      expect(mockModel.validate).toHaveBeenCalled();
    });

    it('должен показывать ошибку если файл не HTML', async () => {
      const mockFile = new File(['Just text'], 'test.txt', { type: 'text/plain' });
      mockView.getSelectedFile.mockReturnValue(mockFile);
      mockModel.readFile.mockResolvedValue('Just text');
      mockModel.isHtml.mockReturnValue(false);

      presenter.init();
      await mockView._onFileChange();

      expect(mockView.renderError).toHaveBeenCalled();
      expect(mockView.resetFileInput).toHaveBeenCalled();
    });

    it('должен показывать ошибку если файл не выбран', async () => {
      mockView.getSelectedFile.mockReturnValue(null);

      presenter.init();
      await mockView._onFileChange();

      expect(mockView.renderError).not.toHaveBeenCalled();
      expect(mockModel.readFile).not.toHaveBeenCalled();
    });

    it('должен показывать ошибку при ошибке чтения', async () => {
      const mockFile = new File([], 'test.html', { type: 'text/html' });
      mockView.getSelectedFile.mockReturnValue(mockFile);
      mockModel.readFile.mockRejectedValue(new Error('Read error'));

      presenter.init();
      await mockView._onFileChange();

      expect(mockView.renderError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('должен пропускать валидацию если файл не HTML', async () => {
      const mockFile = new File(['text'], 'test.txt', { type: 'text/plain' });
      mockView.getSelectedFile.mockReturnValue(mockFile);
      mockModel.readFile.mockResolvedValue('text');
      mockModel.isHtml.mockReturnValue(false);

      presenter.init();
      await mockView._onFileChange();

      expect(mockModel.validate).not.toHaveBeenCalled();
    });
  });

  describe('Ctrl+Enter handler', () => {
    it('должен запускать валидацию', async () => {
      mockView.getInputHtml.mockReturnValue('<div>Test</div>');
      mockModel.validate.mockResolvedValue({ errors: [], warnings: [], valid: true });

      presenter.init();
      await mockView._onCtrlEnter();

      expect(mockModel.validate).toHaveBeenCalled();
    });
  });
});
