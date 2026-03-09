/**
 * Presenter - связующее звено между Model и View
 * Обрабатывает действия пользователя и обновляет представление
 */

import { BemValidatorModel } from './model.js';
import { BemValidatorView } from './view.js';

export class BemValidatorPresenter {
  /** @type {BemValidatorModel} */
  #model;
  /** @type {BemValidatorView} */
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  /**
   * Инициализирует презентер, устанавливает обработчики событий
   */
  init() {
    // Обработчик валидации
    this.#view.onValidate(() => this.#handleValidate());

    // Обработчик очистки
    this.#view.onClear(() => this.#handleClear());

    // Обработчик загрузки примера
    this.#view.onLoadExample(() => this.#handleLoadExample());

    // Обработчик кнопки загрузки файла
    this.#view.onUpload(() => this.#view.openFilePicker());

    // Обработчик загрузки файла
    this.#view.onFileChange((e) => this.#handleFileChange(e));

    // Обработчик Ctrl+Enter
    this.#view.onCtrlEnter(() => this.#handleValidate());

    // Обработчик кнопки "Наверх"
    this.#view.onToTop(() => this.#handleToTop());

    // Обработчик обновления номеров строк
    this.#view.onInputUpdate(() => this.#view.updateLineNumbers());

    // Инициализируем номера строк
    this.#view.updateLineNumbers();

    // Загружаем конфигурацию при старте
    this.#loadConfig();
  }

  /**
   * Прокручивает страницу наверх
   * @private
   */
  #handleToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Загружает конфигурацию (для будущего расширения)
   * @private
   */
  async #loadConfig() {
    const config = await this.#model.getConfig();
    if (config) {
      console.log('BEM Validator загружен. Конфигурация:', config.notation);
    }
  }

  /**
   * Обрабатывает валидацию HTML
   * @private
   */
  async #handleValidate() {
    const html = this.#view.getInputHtml();

    if (!html) {
      this.#view.renderError(new Error('Введите HTML код для проверки'));
      return;
    }

    this.#view.showLoading();

    try {
      const result = await this.#model.validate(html);
      this.#view.renderResults(result);
    } catch (error) {
      this.#view.renderError(error);
    }
  }

  /**
   * Обрабатывает очистку
   * @private
   */
  #handleClear() {
    this.#view.clear();
  }

  /**
   * Обрабатывает загрузку примера
   * @private
   */
  #handleLoadExample() {
    const example = `<!-- Правильный БЭМ -->
<div class="header">
  <div class="header__logo">Logo</div>
  <nav class="header__nav">
    <a class="header__link header__link--active" href="#">Link</a>
  </nav>
</div>

<!-- Ошибка: элемент вне блока -->
<div class="button__text">Text</div>

<!-- Ошибка: модификатор без значения -->
<div class="button button--disabled">Button</div>`;

    this.#view.setInputHtml(example);
    this.#view.updateLineNumbers();
  }

  /**
   * Обрабатывает загрузку файла
   * @private
   * @param {Event} event
   */
  async #handleFileChange(event) {
    const file = this.#view.getSelectedFile();
    if (!file) return;

    try {
      const content = await this.#model.readFile(file);

      if (!this.#model.isHtml(content)) {
        this.#view.renderError(new Error('Файл не содержит HTML-разметки'));
        this.#view.resetFileInput();
        return;
      }

      this.#view.setInputHtml(content);
      this.#view.updateLineNumbers();
      this.#view.resetFileInput();

      // Автоматически запускаем валидацию
      await this.#handleValidate();
    } catch (error) {
      this.#view.renderError(error);
    }
  }
}
