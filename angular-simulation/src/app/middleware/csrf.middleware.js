const crypto = require('crypto');
const AppError = require('../utils/appError');

class CSRFMiddleware {
  constructor() {
    this.secret = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
    this.cookieName = process.env.CSRF_COOKIE_NAME || 'XSRF-TOKEN';
    this.headerName = process.env.CSRF_HEADER_NAME || 'X-XSRF-TOKEN';
  }

  /**
   * Генерация CSRF токена
   * @param {Object} req - Express request
   * @returns {string} CSRF токен
   */
  generateToken(req) {
    const sessionId = req.session?.id || req.ip;
    const timestamp = Date.now();
    
    const token = crypto
      .createHmac('sha256', this.secret)
      .update(`${sessionId}:${timestamp}`)
      .digest('hex');
    
    return `${timestamp}.${token}`;
  }

  /**
   * Валидация CSRF токена
   * @param {string} token - CSRF токен
   * @param {Object} req - Express request
   * @returns {boolean} Валидный ли токен
   */
  validateToken(token, req) {
    try {
      const [timestamp, hash] = token.split('.');
      
      // Проверяем, что токен не старше 1 часа
      if (Date.now() - parseInt(timestamp) > 3600000) {
        return false;
      }
      
      const expectedHash = crypto
        .createHmac('sha256', this.secret)
        .update(`${req.session?.id || req.ip}:${timestamp}`)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(expectedHash)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Middleware для установки CSRF токена
   */
  setToken = (req, res, next) => {
    const token = this.generateToken(req);
    
    res.cookie(this.cookieName, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 час
    });
    
    next();
  };

  /**
   * Middleware для проверки CSRF токена
   */
  protect = (req, res, next) => {
    // Пропускаем безопасные методы
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const token = req.headers[this.headerName.toLowerCase()] || 
                  req.cookies[this.cookieName];

    if (!token) {
      return next(new AppError('CSRF токен не найден', 403));
    }

    if (!this.validateToken(token, req)) {
      return next(new AppError('Недействительный CSRF токен', 403));
    }

    next();
  };

  /**
   * Middleware для проверки происхождения запроса
   */
  checkOrigin = (req, res, next) => {
    const allowedOrigins = [process.env.CLIENT_URL];
    const origin = req.get('origin');
    const referer = req.get('referer');

    // В production проверяем origin/referer
    if (process.env.NODE_ENV === 'production') {
      if (origin && !allowedOrigins.includes(origin)) {
        return next(new AppError('Запрос с недопустимого источника', 403));
      }
      
      if (referer && !allowedOrigins.some(o => referer.startsWith(o))) {
        return next(new AppError('Запрос с недопустимого реферера', 403));
      }
    }

    next();
  };
}

module.exports = new CSRFMiddleware();