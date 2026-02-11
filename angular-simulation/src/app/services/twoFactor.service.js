const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { encrypt, decrypt } = require('../utils/encryption');

class TwoFactorService {
  /**
   * Генерация секрета для 2FA
   * @param {string} email - Email пользователя
   * @returns {Object} Секрет и QR код
   */
  async generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TOTP_ISSUER}:${email}`,
      length: 20,
      issuer: process.env.TOTP_ISSUER
    });

    // Генерируем QR код
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Шифруем секрет перед сохранением
    const encryptedSecret = encrypt(secret.base32, 'totp');

    return {
      secret: encryptedSecret,
      base32: secret.base32, // Возвращаем незашифрованный для отображения пользователю
      qrCode,
      otpauth_url: secret.otpauth_url
    };
  }

  /**
   * Верификация TOTP токена
   * @param {string} token - Токен от пользователя
   * @param {string} encryptedSecret - Зашифрованный секрет
   * @returns {boolean} Валидный ли токен
   */
  verifyToken(token, encryptedSecret) {
    try {
      const secret = decrypt(encryptedSecret, 'totp');
      
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Допускаем 1 шаг вперед/назад (30 секунд)
      });
    } catch (error) {
      console.error('Ошибка верификации 2FA:', error);
      return false;
    }
  }

  /**
   * Генерация резервных кодов
   * @param {number} count - Количество кодов
   * @returns {Array} Массив резервных кодов
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      // Генерируем 8-значный код
      const code = crypto.randomInt(10000000, 99999999).toString();
      
      // Хэшируем код перед сохранением
      const hashedCode = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
      
      codes.push({
        code: hashedCode,
        plainCode: code, // Возвращаем пользователю только один раз
        used: false,
        createdAt: new Date()
      });
    }
    
    return codes;
  }

  /**
   * Проверка резервного кода
   * @param {string} code - Код от пользователя
   * @param {Array} backupCodes - Сохраненные резервные коды
   * @returns {Object} Результат проверки
   */
  verifyBackupCode(code, backupCodes) {
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    
    const foundCode = backupCodes.find(c => 
      c.code === hashedCode && !c.used
    );
    
    if (foundCode) {
      // Помечаем код как использованный
      foundCode.used = true;
      foundCode.usedAt = new Date();
      
      return {
        valid: true,
        code: foundCode
      };
    }
    
    return {
      valid: false
    };
  }

  /**
   * Проверка, нужно ли требовать 2FA
   * @param {Object} user - Пользователь
   * @param {Object} context - Контекст запроса
   * @returns {boolean} Требуется ли 2FA
   */
  requiresTwoFactor(user, context = {}) {
    // Если 2FA включена и не отключена принудительно
    if (user.twoFactorEnabled) {
      // Проверяем, не является ли устройство доверенным
      if (user.securitySettings?.trustedDevicesEnabled && context.deviceId) {
        const isTrusted = user.isTrustedDevice(context.deviceId);
        if (isTrusted) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Генерация URI для Google Authenticator
   * @param {string} secret - Секрет
   * @param {string} email - Email пользователя
   * @returns {string} URI
   */
  generateOtpAuthUri(secret, email) {
    return speakeasy.otpauthURL({
      secret: secret,
      label: email,
      issuer: process.env.TOTP_ISSUER,
      encoding: 'base32'
    });
  }

  /**
   * Проверка, установлено ли приложение аутентификатора
   * @returns {Promise<boolean>} Результат проверки
   */
  async checkAuthenticatorSupport() {
    // В реальном приложении можно проверять через User-Agent
    // или предлагать установить приложение
    return true;
  }
}

module.exports = new TwoFactorService();