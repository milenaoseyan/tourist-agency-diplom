const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const AppError = require('../utils/appError');

class SecurityMiddleware {
  constructor() {
    this.setupHelmet();
    this.setupRateLimits();
    this.setupSlowDown();
  }

  /**
   * Настройка Helmet с расширенными опциями
   */
  setupHelmet() {
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", process.env.CLIENT_URL],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      },
      noSniff: true,
      ieNoOpen: true,
      xssFilter: true
    });
  }

  /**
   * Настройка rate limiting для разных типов запросов
   */
  setupRateLimits() {
    // Общий лимит для всех запросов
    this.generalLimiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Слишком много запросов. Пожалуйста, повторите позже.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.ip;
      }
    });

    // Строгий лимит для аутентификации
    this.authLimiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 5,
      message: 'Слишком много попыток входа. Аккаунт временно заблокирован.',
      skipSuccessfulRequests: true,
      keyGenerator: (req) => {
        // Используем email как ключ для лимита
        return req.body.email || req.ip;
      }
    });

    // Лимит для создания ресурсов
    this.createLimiter = rateLimit({
      windowMs: 3600000, // 1 час
      max: 30, // 30 запросов в час
      message: 'Превышен лимит создания ресурсов'
    });

    // Лимит для 2FA попыток
    this.twoFALimiter = rateLimit({
      windowMs: 900000, // 15 минут
      max: 10, // 10 попыток
      message: 'Слишком много неверных 2FA кодов'
    });
  }

  /**
   * Настройка замедления запросов
   */
  setupSlowDown() {
    this.speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 минут
      delayAfter: 50, // разрешаем 50 запросов
      delayMs: (hits) => hits * 100 // задержка увеличивается с каждым запросом
    });
  }

  /**
   * Защита от ботов
   */
  botProtection = (req, res, next) => {
    const userAgent = req.get('user-agent');
    
    // Проверяем наличие User-Agent
    if (!userAgent) {
      return next(new AppError('User-Agent не обнаружен', 403));
    }

    // Блокируем известных ботов
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
      'python', 'java', 'perl', 'php', 'ruby', 'go-http-client'
    ];

    const isBot = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isBot && !req.path.includes('/api/public')) {
      return next(new AppError('Доступ запрещен', 403));
    }

    next();
  };

  /**
   * Защита от кликджекинга
   */
  frameguard = helmet.frameguard({ action: 'deny' });

  /**
   * Проверка IP адреса для админ-панели
   */
  adminIPWhitelist = (req, res, next) => {
    if (req.user?.role === 'admin') {
      const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
      const clientIp = req.headers['x-forwarded-for'] || req.ip;
      
      if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
        return next(new AppError('Доступ к админ-панели разрешен только с доверенных IP', 403));
      }
    }
    next();
  };

  /**
   * Логирование подозрительных запросов
   */
  logSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL инъекции
      /((\%3C)|<)[^\n]+((\%3E)|>)/i, // XSS
      /(\%2E\.)/, // Directory traversal
      /(union|select|insert|drop|delete|update|create|alter|truncate)/i // SQL команды
    ];

    const url = req.originalUrl;
    const body = JSON.stringify(req.body);
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(body)
    );

    if (isSuspicious) {
      console.warn(`⚠️ Подозрительный запрос от ${req.ip}: ${req.method} ${url}`);
      
      if (process.env.NODE_ENV === 'production') {
        return next(new AppError('Обнаружена подозрительная активность', 403));
      }
    }

    next();
  };
}

module.exports = new SecurityMiddleware();