# Бэкенд Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка приложения (если есть транспиляция)
# RUN npm run build

# --- Второй этап: production ---
FROM node:18-alpine

WORKDIR /app

# Создание пользователя без root прав
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Копирование зависимостей из builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Переключение на непривилегированного пользователя
USER nodejs

# Экспонирование порта
EXPOSE 5000

# Запуск приложения
CMD ["node", "server.js"]