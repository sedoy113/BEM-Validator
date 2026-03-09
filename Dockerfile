# Продакшен Dockerfile для BEM Validator
FROM node:20-alpine

# Рабочая директория
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем только продакшен зависимости
RUN npm ci --only=production

# Копируем скомпилированный код
COPY dist/ ./dist/

# Открываем порт
EXPOSE 3000

# Запускаем сервер
ENV NODE_ENV=production
CMD ["node", "dist/server/index.js"]
