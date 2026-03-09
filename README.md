# 🔍 BEM Validator

Валидатор HTML-разметки на соответствие методологии БЭМ (Блок-Элемент-Модификатор).

## ✨ Возможности

- ✅ **Проверка синтаксиса БЭМ** — валидация классов (блок, элемент, модификатор)
- ✅ **Поиск ошибок вложенности** — элементы должны быть внутри своих блоков
- ✅ **Детектирование смешения нотаций** — контроль единого стиля записи
- ✅ **CLI и веб-интерфейс** — проверяйте файлы или вставляйте код в браузере
- ✅ **Загрузка файлов** — загрузите HTML-файл для проверки
- ✅ **Гибкая настройка** — включайте/отключайте правила через конфиг
- ✅ **Безопасность** — Content Security Policy (CSP) для защиты от XSS

## 🚀 Быстрый старт

### Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки (сборка + сервер)
npm run server

# Или вручную:
npm run build:prod   # Сборка
npm run start        # Запуск сервера

# Откройте http://localhost:3000
```

### CLI — проверка из командной строки

```bash
# Проверка одного файла
node dist/cli/index.js path/to/file.html

# Проверка нескольких файлов
node dist/cli/index.js src/**/*.html

# Чтение из stdin
echo '<div class="button">Text</div>' | node dist/cli/index.js --stdin
```

## 📋 Правила валидации

| Правило                  | Описание                                      | Тип     |
| ------------------------ | --------------------------------------------- | ------- |
| `element-outside-block`  | Элемент должен находиться внутри своего блока | error   |
| `modifier-without-value` | Модификатор должен иметь значение             | warning |
| `mixed-notations`        | Запрещено смешение нотаций `__` и `_`         | error   |
| `invalid-class-name`     | Некорректное имя БЭМ-класса                   | error   |

**Примечание:** Правило `mixed-notations` НЕ считает смешением:

- Дефисы в имени блока (`news-list`, `page-content`)
- Модификаторы с `--` (`button--disabled`)

## ⚙️ Конфигурация

Создайте файл `.bemrc.json` в корне проекта:

```json
{
	"notation": "bem",
	"elementSeparator": "__",
	"modifierSeparator": "--",
	"rules": {
		"element-outside-block": "error",
		"modifier-without-value": "warning",
		"mixed-notations": "error",
		"invalid-class-name": "error"
	},
	"ignore": ["node_modules", "dist"],
	"files": ["**/*.html"]
}
```

### Примеры

#### ✅ Правильный БЭМ

```html
<header class="header">
	<div class="container">
		<div class="header__content">
			<button class="header__menu">
				<span class="header__menu-line"></span>
			</button>
			<a class="header__logo-link" href="#">
				<img class="header__logo" src="logo.svg" alt="Logo" />
			</a>
		</div>
	</div>
</header>
```

#### ❌ Ошибки

```html
<!-- Элемент вне блока -->
<div class="button__text">Text</div>

<!-- Модификатор без значения -->
<div class="button button--disabled">Button</div>
```

## 🐳 Docker

### Сборка и запуск

```bash
# Сборка образа
docker build -t bem-validator .

# Запуск контейнера
docker run -d -p 3000:3000 --name bem-validator bem-validator
```

### Docker Compose

```yaml
version: "3.8"

services:
  bem-validator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## 📦 Деплой на сервер

Смотрите подробную инструкцию в [DEPLOY.md](./DEPLOY.md).

### Кратко

```bash
# Сборка продакшен-версии
npm run build:prod

# Установка на сервере
npm install --production

# Запуск
npm run start
```

### Через PM2

```bash
npm install -g pm2
pm2 start dist/server/index.js --name bem-validator
pm2 save
pm2 startup
```

## 🧪 Тесты

```bash
# Запуск тестов
npm test

# С отчётом о покрытии
npm run test:coverage
```

## 🏗️ Архитектура

### Backend (TypeScript)

```
src/
├── parser/          # Парсер HTML и БЭМ-классов
├── validator/       # Ядро валидатора
├── rules/           # Правила проверок
├── server/          # Express сервер + API
└── cli/             # CLI-интерфейс
```

### Frontend (JavaScript MVP)

```
web/
├── index.html       # Разметка
└── js/
    ├── model.js     # Данные, API-запросы
    ├── view.js      # DOM, отображение
    └── presenter.js # Логика, обработчики событий
```

## 🛠️ Стек технологий

| Компонент    | Технология                  |
| ------------ | --------------------------- |
| Backend      | TypeScript, Express.js      |
| Frontend     | Vanilla JS, MVP архитектура |
| Парсинг HTML | htmlparser2                 |
| CLI          | Commander                   |
| Тесты        | Vitest                      |
| Контейнеры   | Docker                      |

## 📊 API

### POST `/api/validate`

Валидация HTML-кода.

**Запрос:**

```json
{
	"html": "<div class=\"button\">Test</div>",
	"fileName": "test.html"
}
```

**Ответ:**

```json
{
	"errors": [],
	"warnings": [],
	"valid": true
}
```

### GET `/api/config`

Получение текущей конфигурации.

## 📝 Скрипты npm

| Команда              | Описание                              |
| -------------------- | ------------------------------------- |
| `npm run server`     | Сборка и запуск сервера               |
| `npm run build`      | Сборка TypeScript                     |
| `npm run build:prod` | Сборка + копирование веб-файлов       |
| `npm run start`      | Запуск сервера                        |
| `npm run test`       | Запуск тестов                         |
| `npm run test:coverage` | Тесты с отчётом о покрытии        |
| `npm run lint`       | Проверка типов TypeScript             |
