#!/bin/bash

# Скрипт для создания продакшен-архива
# Использование: ./scripts/package.sh

set -e

echo "🔨 Сборка продакшен-версии..."
npm run build:prod

echo "📦 Создание архива..."

# Имя архива с версией
VERSION=$(node -p "require('./package.json').version")
ARCHIVE_NAME="bem-validator-${VERSION}.tar.gz"

# Создаём временную папку
TEMP_DIR=$(mktemp -d)
cp -r dist package.json package-lock.json "$TEMP_DIR/"

# Создаём архив
tar -czf "$ARCHIVE_NAME" -C "$TEMP_DIR" .

# Очищаем временную папку
rm -rf "$TEMP_DIR"

echo "✅ Архив готов: $ARCHIVE_NAME"
echo ""
echo "Для развертывания:"
echo "  1. Распаковать: tar -xzf $ARCHIVE_NAME"
echo "  2. Установить зависимости: npm install --production"
echo "  3. Запустить: npm run start"
