/**
 * View - слой отображения
 * Отвечает за работу с DOM и визуализацию данных
 */

export class BemValidatorView {
  /** @type {HTMLElement} */
  #htmlInput;
  /** @type {HTMLElement} */
  #results;
  /** @type {HTMLElement} */
  #status;
  /** @type {HTMLElement} */
  #errorCount;
  /** @type {HTMLElement} */
  #warningCount;
  /** @type {HTMLElement} */
  #fileInput;

  constructor() {
    this.#htmlInput = document.getElementById('htmlInput');
    this.#results = document.getElementById('results');
    this.#status = document.getElementById('status');
    this.#errorCount = document.getElementById('errorCount');
    this.#warningCount = document.getElementById('warningCount');
    this.#fileInput = document.getElementById('fileInput');
  }

  /**
   * Получает HTML из поля ввода
   * @returns {string}
   */
  getInputHtml() {
    return this.#htmlInput.value.trim();
  }

  /**
   * Устанавливает HTML в поле ввода
   * @param {string} html
   */
  setInputHtml(html) {
    this.#htmlInput.value = html;
  }

  /**
   * Очищает поле ввода и результаты
   */
  clear() {
    this.#htmlInput.value = '';
    this.#fileInput.value = '';
    this.#results.innerHTML = this.#renderEmptyState();
    this.#status.style.display = 'none';
    this.resetLineNumbers();
  }

  /**
   * Отображает результаты валидации
   * @param {ValidationResult} result
   */
  renderResults(result) {
    const { errors, warnings } = result;

    // Обновляем счётчики
    this.#errorCount.textContent = errors.length;
    this.#warningCount.textContent = warnings.length;
    this.#status.style.display = 'flex';

    // Показываем результаты
    if (errors.length === 0 && warnings.length === 0) {
      this.#results.innerHTML = this.#renderSuccess();
      return;
    }

    this.#results.innerHTML = [
      ...errors.map(e => this.#renderError(e)),
      ...warnings.map(w => this.#renderWarning(w)),
    ].join('');
  }

  /**
   * Отображает ошибку
   * @param {Error} error
   */
  renderError(error) {
    this.#results.innerHTML = this.#renderError({
      line: 1,
      column: 1,
      file: 'Ошибка',
      class: '',
      rule: 'error',
      message: error.message,
      severity: 'error',
    });
  }

  /**
   * Показывает индикатор загрузки
   */
  showLoading() {
    this.#results.innerHTML = `
      <div class="empty-state">
        <p>⏳ Проверка...</p>
      </div>
    `;
    this.#status.style.display = 'none';
  }

  /**
   * Рендерит пустое состояние
   * @private
   */
  #renderEmptyState() {
    return `
      <div class="empty-state">
        <svg class="empty-state__icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path>
        </svg>
        <p class="empty-state__text">Введите HTML код и нажмите «Проверить»</p>
      </div>
    `;
  }

  /**
   * Рендерит успешный результат
   * @private
   */
  #renderSuccess() {
    return `
      <div class="result-item result-success">
        <h3>✅ Все проверки пройдены!</h3>
        <p>Ваш HTML код соответствует методологии БЭМ</p>
      </div>
    `;
  }

  /**
   * Рендерит ошибку
   * @private
   * @param {ValidationError} error
   */
  #renderError(error) {
    return `
      <div class="result-item result-error">
        <h3>✗ Ошибка в строке ${error.line}:${error.column}</h3>
        <p>${error.message}</p>
        <p>Класс: <code>${error.class || '—'}</code></p>
        <p>Правило: <code>${error.rule}</code></p>
      </div>
    `;
  }

  /**
   * Рендерит предупреждение
   * @private
   * @param {ValidationError} warning
   */
  #renderWarning(warning) {
    return `
      <div class="result-item result-warning">
        <h3>⚠ Предупреждение в строке ${warning.line}:${warning.column}</h3>
        <p>${warning.message}</p>
        <p>Класс: <code>${warning.class || '—'}</code></p>
        <p>Правило: <code>${warning.rule}</code></p>
      </div>
    `;
  }

  /**
   * Устанавливает обработчик нажатия кнопки проверки
   * @param {Function} handler
   */
  onValidate(handler) {
    document.getElementById('btnValidate')?.addEventListener('click', handler);
  }

  /**
   * Устанавливает обработчик очистки
   * @param {Function} handler
   */
  onClear(handler) {
    document.getElementById('btnClear')?.addEventListener('click', handler);
  }

  /**
   * Устанавливает обработчик загрузки примера
   * @param {Function} handler
   */
  onLoadExample(handler) {
    document.getElementById('btnExample')?.addEventListener('click', handler);
  }

  /**
   * Устанавливает обработчик кнопки загрузки файла
   * @param {Function} handler
   */
  onUpload(handler) {
    document.getElementById('btnUpload')?.addEventListener('click', handler);
  }

  /**
   * Открывает диалог выбора файла
   */
  openFilePicker() {
    this.#fileInput.click();
  }

  /**
   * Устанавливает обработчик загрузки файла
   * @param {Function} handler
   */
  onFileChange(handler) {
    this.#fileInput.addEventListener('change', handler);
  }

  /**
   * Устанавливает обработчик Ctrl+Enter
   * @param {Function} handler
   */
  onCtrlEnter(handler) {
    this.#htmlInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handler();
      }
    });
  }

  /**
   * Устанавливает обработчик кнопки "Наверх"
   * @param {Function} handler
   */
  onToTop(handler) {
    const btn = document.getElementById('btnToTop');
    if (btn) {
      btn.addEventListener('click', handler);
      
      // Показываем/скрываем кнопку при прокрутке
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 300) {
              btn.classList.add('visible');
            } else {
              btn.classList.remove('visible');
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /**
   * Устанавливает обработчики для обновления номеров строк
   */
  onInputUpdate(handler) {
    // Обновление при вводе текста
    this.#htmlInput.addEventListener('input', () => {
      handler();
      this.#autoResize();
    });
  }

  /**
   * Автоматически изменяет высоту textarea
   * @private
   */
  #autoResize() {
    this.#htmlInput.style.height = 'auto';
    this.#htmlInput.style.height = this.#htmlInput.scrollHeight + 'px';
  }

  /**
   * Обновляет номера строк
   */
  updateLineNumbers() {
    const lineNumbersEl = document.getElementById('lineNumbers');
    if (!lineNumbersEl) return;

    const textarea = this.#htmlInput;
    const lines = textarea.value.split('\n').length;

    // Генерируем номера строк
    let lineNumbers = '';
    for (let i = 1; i <= lines; i++) {
      lineNumbers += i + '\n';
    }
    lineNumbersEl.textContent = lineNumbers;

    // Авто-изменение высоты
    this.#autoResize();
  }

  /**
   * Сбрасывает номера строк к 1
   */
  resetLineNumbers() {
    const lineNumbersEl = document.getElementById('lineNumbers');
    if (lineNumbersEl) {
      lineNumbersEl.textContent = '1';
    }
    // Сбрасываем высоту textarea
    this.#htmlInput.style.height = 'auto';
  }

  /**
   * Получает файл из input
   * @returns {File|null}
   */
  getSelectedFile() {
    return this.#fileInput.files?.[0] || null;
  }

  /**
   * Сбрасывает выбор файла
   */
  resetFileInput() {
    this.#fileInput.value = '';
  }
}
