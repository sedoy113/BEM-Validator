/**
 * BEM Validator - Точка входа
 * Инициализация приложения
 */

import { BemValidatorPresenter } from './presenter.js';
import { BemValidatorModel } from './model.js';
import { BemValidatorView } from './view.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  const model = new BemValidatorModel();
  const view = new BemValidatorView();
  const presenter = new BemValidatorPresenter(model, view);

  presenter.init();
});
