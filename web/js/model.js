/**
 * Model - слой данных и бизнес-логики
 * Отвечает за взаимодействие с API и обработку данных
 */

export class BemValidatorModel {
  /**
   * Валидирует HTML-код через API
   * @param {string} html - HTML для проверки
   * @param {string} fileName - Имя файла
   * @returns {Promise<ValidationResult>}
   */
  async validate(html, fileName = '<input>') {
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, fileName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Ошибка валидации: ${error.message}`);
    }
  }

  /**
   * Получает конфигурацию валидатора
   * @returns {Promise<Object>}
   */
  async getConfig() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка получения конфигурации:', error);
      return null;
    }
  }

  /**
   * Читает файл как текст
   * @param {File} file - Файл для чтения
   * @returns {Promise<string>}
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    });
  }

  /**
   * Проверяет, является ли строка HTML
   * @param {string} text - Текст для проверки
   * @returns {boolean}
   */
  isHtml(text) {
    return /<[a-z][\s\S]*>/i.test(text.trim());
  }
}

/**
 * @typedef {Object} ValidationResult
 * @property {Array<ValidationError>} errors
 * @property {Array<ValidationError>} warnings
 * @property {boolean} valid
 */

/**
 * @typedef {Object} ValidationError
 * @property {number} line
 * @property {number} column
 * @property {string} file
 * @property {string} class
 * @property {string} rule
 * @property {string} message
 * @property {'error'|'warning'} severity
 */
