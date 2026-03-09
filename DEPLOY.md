# 📦 Деплой BEM Validator

## Быстрый старт

### 1. Сборка проекта
```bash
npm run build:prod
```

### 2. Запуск
```bash
npm run start
```

Откройте http://localhost:3000

---

## Деплой на сервер

### Требования
- Node.js >= 18.0.0
- npm >= 9.0.0

### Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd bem-validator

# Установить зависимости
npm install --production

# Собрать проект
npm run build:prod

# Запустить сервер
npm run start
```

### Запуск через PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start dist/server/index.js --name bem-validator

# Сохранить список процессов
pm2 save

# Настроить автозапуск
pm2 startup

# Просмотр логов
pm2 logs bem-validator

# Перезапуск
pm2 restart bem-validator

# Остановка
pm2 stop bem-validator
```

### Настройка nginx

Создайте конфиг `/etc/nginx/sites-available/bem-validator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Активация:
```bash
sudo ln -s /etc/nginx/sites-available/bem-validator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Docker

### Сборка образа
```bash
docker build -t bem-validator .
```

### Запуск контейнера
```bash
docker run -d -p 3000:3000 --name bem-validator bem-validator
```

### Docker Compose

Создайте `docker-compose.yml`:
```yaml
version: '3.8'

services:
  bem-validator:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Запуск:
```bash
docker-compose up -d
```

Остановка:
```bash
docker-compose down
```

---

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | 3000 | Порт сервера |
| `NODE_ENV` | production | Окружение |

Пример использования:
```bash
PORT=8080 NODE_ENV=production npm run start
```

---

## Создание продакшен-архива

```bash
# Создать tar.gz архив
./scripts/package.sh

# Архив будет создан в корне проекта
# bem-validator-1.0.0.tar.gz
```

### Развертывание из архива

```bash
# Распаковать
tar -xzf bem-validator-1.0.0.tar.gz

# Установить зависимости
npm install --production

# Запустить
npm run start
```

---

## Структура продакшен-версии

```
bem-validator/
├── dist/                    # Скомпилированный код
│   ├── cli/                 # CLI-интерфейс
│   ├── parser/              # Парсеры
│   ├── rules/               # Правила
│   ├── server/              # Express сервер
│   ├── validator/           # Валидатор
│   ├── types.js             # Типы
│   └── web/                 # Веб-интерфейс
│       ├── index.html
│       └── js/
│           ├── model.js
│           ├── view.js
│           └── presenter.js
├── node_modules/            # Зависимости
├── package.json
├── package-lock.json
└── .bemrc.json              # Конфигурация (опционально)
```

---

## Проверка работы

```bash
# Проверка сервера
curl http://localhost:3000

# Проверка API валидации
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"html": "<div class=\"button\">Test</div>"}'

# Проверка API конфигурации
curl http://localhost:3000/api/config
```

---

## Логи

### PM2
```bash
pm2 logs bem-validator
pm2 logs bem-validator --lines 100
```

### Docker
```bash
docker logs bem-validator
docker logs -f bem-validator
```

### Systemd (если настроено)
```bash
journalctl -u bem-validator
journalctl -f -u bem-validator
```

### Прямой вывод
```bash
npm run start > app.log 2>&1
```

---

## Обновление

```bash
# Остановить приложение
pm2 stop bem-validator  # или docker-compose down

# Загрузить новую версию
git pull

# Установить зависимости
npm install --production

# Собрать
npm run build:prod

# Запустить
pm2 restart bem-validator  # или docker-compose up -d
```

---

## Безопасность

### Рекомендации

1. **Не запускайте от root**
```bash
sudo useradd -r -s /bin/false bem-validator
sudo chown -R bem-validator:bem-validator /opt/bem-validator
sudo -u bem-validator npm run start
```

2. **Используйте firewall**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. **Настройте HTTPS**
```bash
# Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Порт уже занят
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 <PID>

# Или использовать другой порт
PORT=8080 npm run start
```

### Ошибка сборки
```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules
rm -rf node_modules package-lock.json

# Переустановить
npm install
npm run build:prod
```

### Контейнер не запускается
```bash
# Проверить логи
docker logs bem-validator

# Пересобрать образ
docker-compose build --no-cache

# Запустить заново
docker-compose up -d
```
