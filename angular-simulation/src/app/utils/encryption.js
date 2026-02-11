const crypto = require('crypto');

class Encryption {
  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
    this.secretKey = Buffer.from(process.env.ENCRYPTION_KEY || 
      crypto.randomBytes(32).toString('hex'), 'hex');
  }

  /**
   * Шифрование данных
   * @param {string|Object} data - Данные для шифрования
   * @param {string} purpose - Назначение (разные ключи для разных данных)
   * @returns {string} Зашифрованная строка
   */
  encrypt(data, purpose = 'default') {
    try {
      // Генерируем уникальный ключ для каждого типа данных
      const key = crypto.createHmac('sha256', this.secretKey)
        .update(purpose)
        .digest();

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      
      const encrypted = Buffer.concat([
        cipher.update(jsonStr, 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      // Формат: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      console.error('Ошибка шифрования:', error);
      throw new Error('Не удалось зашифровать данные');
    }
  }

  /**
   * Дешифрование данных
   * @param {string} encryptedData - Зашифрованные данные
   * @param {string} purpose - Назначение
   * @returns {string|Object} Расшифрованные данные
   */
  decrypt(encryptedData, purpose = 'default') {
    try {
      const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');

      const key = crypto.createHmac('sha256', this.secretKey)
        .update(purpose)
        .digest();

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      const result = decrypted.toString('utf8');
      
      // Пробуем распарсить JSON
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    } catch (error) {
      console.error('Ошибка дешифрования:', error);
      throw new Error('Не удалось расшифровать данные');
    }
  }

  /**
   * Хэширование данных (необратимое)
   * @param {string} data - Данные для хэширования
   * @returns {string} Хэш
   */
  hash(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .update(this.secretKey)
      .digest('hex');
  }

  /**
   * Генерация безопасного случайного токена
   * @param {number} length - Длина токена в байтах
   * @returns {string} Токен
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Маскирование данных (для логов)
   * @param {string} data - Данные
   * @param {number} visibleChars - Количество видимых символов
   * @returns {string} Маскированная строка
   */
  mask(data, visibleChars = 4) {
    if (!data) return '';
    
    const str = String(data);
    if (str.length <= visibleChars) {
      return '*'.repeat(str.length);
    }
    
    return str.slice(0, visibleChars) + '*'.repeat(str.length - visibleChars);
  }
}

module.exports = new Encryption();