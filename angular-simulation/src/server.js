/**
 * @fileoverview Главный файл сервера TravelWave Backend
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/error.middleware');
const AppError = require('./src/utils/appError');

// Импорт роутов
const authRoutes = require('./src/routes/auth.routes');
const tourRoutes = require('./src/routes/tours.routes');
const bookingRoutes = require('./src/routes/bookings.routes');
const userRoutes = require('./src/routes/users.routes');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Подключение к базе данных
connectDB();

// Глобальные middleware
app.use(helmet()); // Безопасность заголовков
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
})); // CORS

// Лимит запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // лимит каждого IP
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});
app.use('/api', limiter);

// Парсинг тела запроса
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Защита от NoSQL инъекций
app.use(mongoSanitize());

// Защита от XSS атак
app.use(xss());

// Защита от parameter pollution
app.use(hpp({
  whitelist: ['price', 'rating', 'duration', 'difficulty']
}));

// Логирование в development
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`🚀 Сервер запущен в режиме: ${NODE_ENV}`);
}

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API роуты
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 TravelWave API работает исправно',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// Обслуживание фронтенда (для production)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка несуществующих роутов
app.all('*', (req, res, next) => {
  next(new AppError(`Не могу найти ${req.originalUrl} на этом сервере!`, 404));
});

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║      🚀 TravelWave Backend           ║
  ║      Порт: ${PORT}                  ║
  ║      Режим: ${NODE_ENV}             ║
  ║      Время: ${new Date().toLocaleString()} ║
  ╚═══════════════════════════════════════╝
  `);
});

// Обработка необработанных отклонений promise
process.on('unhandledRejection', (err) => {
  console.error('❌ НЕОБРАБОТАННОЕ ОТКЛОНЕНИЕ! Выключаем сервер...');
  console.error(err.name, err.message);
  
  server.close(() => {
    process.exit(1);
  });
});

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  console.error('❌ НЕОБРАБОТАННОЕ ИСКЛЮЧЕНИЕ! Выключаем сервер...');
  console.error(err.name, err.message);
  
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;