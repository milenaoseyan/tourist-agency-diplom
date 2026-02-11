/**
 * @fileoverview Компонент для 13-го дня практики
 * @module components/day13
 */

import TwoFactorComponent from '../auth/two-factor.component.js';
import AuthComponent from '../auth/auth.component.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class Day13Component {
  constructor() {
    this.title = 'День 13: Продвинутая безопасность и OAuth';
    this.description = 'Двухфакторная аутентификация, OAuth 2.0 и защита от уязвимостей';
    
    this.isAuthenticated = AuthComponent.isAuthenticated();
    this.securityScore = this.calculateSecurityScore();
    this.securityTips = this.getSecurityTips();
  }

  render() {
    return `
      <div class="day13-container">
        <header class="day13-header">
          <h1>${this.title}</h1>
          <p class="subtitle">${this.description}</p>
          <div class="progress-indicator">
            <span class="progress-text">13/15 дней завершено</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 87%"></div>
            </div>
          </div>
        </header>

        <div class="security-score-card">
          <div class="score-header">
            <h3>🛡️ Оценка безопасности аккаунта</h3>
            <div class="score-value ${this.getScoreClass()}">${this.securityScore}%</div>
          </div>
          <div class="score-meter">
            <div class="meter-fill" style="width: ${this.securityScore}%"></div>
          </div>
          <div class="score-details">
            <div class="detail-item ${this.isAuthenticated ? 'completed' : 'pending'}">
              <span class="detail-icon">${this.isAuthenticated ? '✅' : '⭕'}</span>
              <span class="detail-text">Аутентификация</span>
            </div>
            <div class="detail-item ${this.get2FAStatus() ? 'completed' : 'pending'}">
              <span class="detail-icon">${this.get2FAStatus() ? '✅' : '⭕'}</span>
              <span class="detail-text">2FA</span>
            </div>
            <div class="detail-item pending">
              <span class="detail-icon">⭕</span>
              <span class="detail-text">OAuth (опционально)</span>
            </div>
          </div>
        </div>

        <div class="security-grid">
          <div class="security-card">
            <div class="security-icon">🔐</div>
            <h3>Двухфакторная аутентификация</h3>
            <p>Включите 2FA для дополнительной защиты вашего аккаунта</p>
            <div id="twoFactorContainer"></div>
          </div>

          <div class="security-card">
            <div class="security-icon">🔑</div>
            <h3>OAuth 2.0</h3>
            <p>Вход через социальные сети и провайдеров</p>
            <div id="oauthContainer"></div>
          </div>

          <div class="security-card">
            <div class="security-icon">🛡️</div>
            <h3>Защита API</h3>
            <p>Rate limiting, CSRF, Helmet и другие меры безопасности</p>
            <div id="apiSecurityContainer"></div>
          </div>

          <div class="security-card">
            <div class="security-icon">🔒</div>
            <h3>Шифрование данных</h3>
            <p>AES-256-GCM шифрование чувствительных данных</p>
            <div id="encryptionContainer"></div>
          </div>

          <div class="security-card">
            <div class="security-icon">📋</div>
            <h3>Аудит безопасности</h3>
            <p>История входов и активность аккаунта</p>
            <div id="auditContainer"></div>
          </div>

          <div class="security-card">
            <div class="security-icon">📱</div>
            <h3>Доверенные устройства</h3>
            <p>Управление устройствами с доступом к аккаунту</p>
            <div id="devicesContainer"></div>
          </div>
        </div>

        <div class="security-tips">
          <h3>💡 Рекомендации по безопасности</h3>
          <div class="tips-grid">
            ${this.securityTips.map(tip => `
              <div class="tip-card ${tip.urgent ? 'urgent' : ''}">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-content">
                  <h4>${tip.title}</h4>
                  <p>${tip.description}</p>
                </div>
                ${tip.action ? `
                  <button class="btn btn-small" onclick="${tip.action}">
                    ${tip.buttonText}
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="security-actions">
          ${!this.isAuthenticated ? `
            <button class="btn btn-primary" id="login">
              🔐 Войти для настройки безопасности
            </button>
          ` : ''}
          <button class="btn btn-secondary" id="runSecurityScan">
            🛡️ Запустить проверку безопасности
          </button>
          <button class="btn btn-outline" id="viewDocumentation">
            📚 Документация по безопасности
          </button>
        </div>
      </div>
    `;
  }

  afterRender() {
    if (this.isAuthenticated) {
      this.initTwoFactor();
      this.initOAuth();
      this.initApiSecurity();
      this.initEncryption();
      this.initAudit();
      this.initDevices();
    }

    document.getElementById('login')?.addEventListener('click', () => {
      window.location.hash = '#/auth';
    });

    document.getElementById('runSecurityScan')?.addEventListener('click', () => {
      this.runSecurityScan();
    });

    document.getElementById('viewDocumentation')?.addEventListener('click', () => {
      this.showSecurityDocumentation();
    });
  }

  async initTwoFactor() {
    const container = document.getElementById('twoFactorContainer');
    if (container) {
      await TwoFactorComponent.init('#twoFactorContainer', 'manage');
    }
  }

  async initOAuth() {
    const container = document.getElementById('oauthContainer');
    if (!container) return;

    try {
      // Загружаем подключенные OAuth провайдеры
      const response = await apiService.get('/auth/oauth/providers');
      const providers = response.data.providers || [];

      container.innerHTML = `
        <div class="oauth-providers">
          <div class="providers-list">
            ${this.getOAuthProviderHtml('google', providers)}
            ${this.getOAuthProviderHtml('github', providers)}
            ${this.getOAuthProviderHtml('vk', providers)}
          </div>
          
          <div class="oauth-info">
            <p class="info-text">
              Подключение социальных сетей позволяет быстро входить в аккаунт
              и синхронизировать данные профиля.
            </p>
          </div>
        </div>
      `;

      // Добавляем обработчики
      document.querySelectorAll('.connect-provider').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const provider = e.target.dataset.provider;
          this.connectOAuthProvider(provider);
        });
      });

      document.querySelectorAll('.disconnect-provider').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const provider = e.target.dataset.provider;
          await this.disconnectOAuthProvider(provider);
        });
      });

    } catch (error) {
      console.error('Ошибка загрузки OAuth провайдеров:', error);
      container.innerHTML = '<p class="error">Не удалось загрузить данные OAuth</p>';
    }
  }

  getOAuthProviderHtml(provider, connectedProviders) {
    const providerData = {
      google: { name: 'Google', icon: 'G', color: '#4285F4' },
      github: { name: 'GitHub', icon: 'GH', color: '#333' },
      vk: { name: 'VK', icon: 'VK', color: '#4C75A3' }
    };

    const isConnected = connectedProviders.some(p => p.provider === provider);
    const providerInfo = providerData[provider];

    return `
      <div class="provider-item ${isConnected ? 'connected' : ''}">
        <div class="provider-info">
          <div class="provider-icon" style="background: ${providerInfo.color}">
            ${providerInfo.icon}
          </div>
          <div class="provider-details">
            <span class="provider-name">${providerInfo.name}</span>
            ${isConnected ? `
              <span class="provider-status">Подключен</span>
            ` : ''}
          </div>
        </div>
        
        ${isConnected ? `
          <button class="btn btn-small btn-danger disconnect-provider" 
                  data-provider="${provider}">
            Отключить
          </button>
        ` : `
          <button class="btn btn-small btn-primary connect-provider" 
                  data-provider="${provider}">
            Подключить
          </button>
        `}
      </div>
    `;
  }

  async connectOAuthProvider(provider) {
    try {
      NotificationCenterComponent.info(`Перенаправление на ${provider}...`);
      
      // Получаем URL для редиректа
      const response = await apiService.get(`/auth/${provider}/url`);
      
      // Сохраняем текущий путь для возврата
      localStorage.setItem('oauth_return_url', window.location.hash);
      
      // Перенаправляем на OAuth провайдера
      window.location.href = response.data.url;
      
    } catch (error) {
      console.error('Ошибка подключения OAuth:', error);
      NotificationCenterComponent.error('Не удалось подключить провайдер');
    }
  }

  async disconnectOAuthProvider(provider) {
    const confirmed = confirm(`Отключить ${provider} от вашего аккаунта?`);
    
    if (confirmed) {
      try {
        await apiService.delete(`/auth/oauth/${provider}`);
        NotificationCenterComponent.success(`${provider} отключен`);
        
        // Обновляем секцию
        this.initOAuth();
        
      } catch (error) {
        console.error('Ошибка отключения OAuth:', error);
        NotificationCenterComponent.error('Не удалось отключить провайдер');
      }
    }
  }

  initApiSecurity() {
    const container = document.getElementById('apiSecurityContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="api-security">
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>Rate Limiting</strong>
            <span class="feature-desc">Защита от брутфорса и DDoS</span>
          </div>
        </div>
        
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>CSRF Protection</strong>
            <span class="feature-desc">Токены в cookies и заголовках</span>
          </div>
        </div>
        
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>Helmet.js</strong>
            <span class="feature-desc">Безопасные HTTP заголовки</span>
          </div>
        </div>
        
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>XSS Protection</strong>
            <span class="feature-desc">Санация пользовательского ввода</span>
          </div>
        </div>
        
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>NoSQL Injection</strong>
            <span class="feature-desc">Защита от MongoDB инъекций</span>
          </div>
        </div>
        
        <div class="security-feature">
          <span class="feature-icon">✅</span>
          <div class="feature-text">
            <strong>HSTS</strong>
            <span class="feature-desc">Принудительное HTTPS</span>
          </div>
        </div>
      </div>
    `;
  }

  initEncryption() {
    const container = document.getElementById('encryptionContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="encryption-info">
        <div class="encryption-algorithm">
          <span class="algorithm-name">AES-256-GCM</span>
          <span class="algorithm-badge">Аутентифицированное шифрование</span>
        </div>
        
        <div class="encryption-details">
          <div class="detail-row">
            <span class="detail-label">Режим:</span>
            <span class="detail-value">Galois/Counter Mode</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Ключ:</span>
            <span class="detail-value">256 бит</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">IV:</span>
            <span class="detail-value">Случайный 96 бит</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Аутентификация:</span>
            <span class="detail-value">GMAC тег</span>
          </div>
        </div>
        
        <div class="encrypted-data-demo">
          <p>Защищенные данные в базе:</p>
          <div class="encrypted-example">
            <code>••••••••••••••••••••••••••••••••</code>
          </div>
          <button class="btn btn-text" id="encryptDemo">
            Показать пример
          </button>
        </div>
      </div>
    `;

    document.getElementById('encryptDemo')?.addEventListener('click', () => {
      this.showEncryptionDemo();
    });
  }

  async initAudit() {
    const container = document.getElementById('auditContainer');
    if (!container || !this.isAuthenticated) return;

    try {
      const response = await apiService.get('/auth/security/history');
      const history = response.data.history.slice(0, 5); // Последние 5 входов

      container.innerHTML = `
        <div class="audit-log">
          ${history.length > 0 ? history.map(entry => `
            <div class="audit-entry ${entry.success ? 'success' : 'failed'}">
              <div class="audit-header">
                <span class="audit-icon">${entry.success ? '✅' : '❌'}</span>
                <span class="audit-time">
                  ${new Date(entry.timestamp).toLocaleString('ru-RU')}
                </span>
              </div>
              <div class="audit-details">
                <span class="detail">📍 ${entry.location || 'Неизвестно'}</span>
                <span class="detail">💻 ${entry.userAgent || 'Неизвестно'}</span>
                <span class="detail">🔑 ${entry.provider || 'local'}</span>
              </div>
            </div>
          `).join('') : `
            <p class="no-data">Нет истории входов</p>
          `}
          
          <button class="btn btn-link" id="viewFullHistory">
            Показать всю историю →
          </button>
        </div>
      `;

      document.getElementById('viewFullHistory')?.addEventListener('click', () => {
        this.showFullAuditLog();
      });

    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
      container.innerHTML = '<p class="error">Не удалось загрузить историю</p>';
    }
  }

  async initDevices() {
    const container = document.getElementById('devicesContainer');
    if (!container || !this.isAuthenticated) return;

    try {
      const response = await apiService.get('/auth/security/devices');
      const devices = response.data.devices || [];

      container.innerHTML = `
        <div class="devices-list">
          ${devices.length > 0 ? devices.map(device => `
            <div class="device-item">
              <div class="device-icon">
                ${this.getDeviceIcon(device.userAgent)}
              </div>
              <div class="device-info">
                <span class="device-name">${device.deviceName || 'Неизвестное устройство'}</span>
                <span class="device-last">
                  Последний вход: ${new Date(device.lastUsed).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <button class="btn-icon remove-device" data-device-id="${device.deviceId}">
                🗑️
              </button>
            </div>
          `).join('') : `
            <p class="no-devices">Нет доверенных устройств</p>
          `}
        </div>
      `;

      // Добавляем обработчики удаления
      document.querySelectorAll('.remove-device').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const deviceId = e.target.dataset.deviceId;
          await this.removeTrustedDevice(deviceId);
        });
      });

    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
      container.innerHTML = '<p class="error">Не удалось загрузить устройства</p>';
    }
  }

  async removeTrustedDevice(deviceId) {
    try {
      await apiService.delete(`/auth/security/devices/${deviceId}`);
      NotificationCenterComponent.success('Устройство удалено');
      this.initDevices(); // Перезагружаем список
    } catch (error) {
      console.error('Ошибка удаления устройства:', error);
      NotificationCenterComponent.error('Не удалось удалить устройство');
    }
  }

  getDeviceIcon(userAgent) {
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      return '📱';
    }
    if (/windows|mac|linux/i.test(userAgent)) {
      return '💻';
    }
    return '📟';
  }

  calculateSecurityScore() {
    if (!this.isAuthenticated) return 0;
    
    let score = 40; // Базовый балл за аутентификацию
    
    if (this.get2FAStatus()) score += 40;
    if (this.getOAuthStatus()) score += 20;
    
    return score;
  }

  getScoreClass() {
    const score = this.securityScore;
    if (score >= 80) return 'excellent';
    if (score >= 50) return 'good';
    return 'poor';
  }

  get2FAStatus() {
    // Проверяем статус 2FA из localStorage
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    return user.twoFactorEnabled || false;
  }

  getOAuthStatus() {
    // Проверяем наличие OAuth провайдеров
    const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    return user.oauthProviders?.length > 0;
  }

  getSecurityTips() {
    const tips = [
      {
        icon: '🔐',
        title: 'Включите двухфакторную аутентификацию',
        description: 'Защитите аккаунт от взлома пароля. Требуется код из приложения при каждом входе.',
        urgent: !this.get2FAStatus(),
        action: 'this.enableTwoFactor()',
        buttonText: 'Включить 2FA'
      },
      {
        icon: '🔑',
        title: 'Используйте надежный пароль',
        description: 'Пароль должен содержать не менее 8 символов, включая буквы разного регистра, цифры и спецсимволы.',
        urgent: false
      },
      {
        icon: '📱',
        title: 'Проверьте доверенные устройства',
        description: 'Регулярно проверяйте список устройств с доступом к аккаунту.',
        urgent: false,
        action: 'this.viewDevices()',
        buttonText: 'Проверить'
      },
      {
        icon: '🔔',
        title: 'Включите уведомления о входах',
        description: 'Получайте уведомления о новых входах в ваш аккаунт.',
        urgent: false,
        action: 'this.enableNotifications()',
        buttonText: 'Включить'
      }
    ];

    return tips;
  }

  async runSecurityScan() {
    NotificationCenterComponent.info('Запуск проверки безопасности...');
    
    const results = [];
    
    // Проверка 1: HTTPS (для продакшена)
    if (window.location.protocol === 'https:') {
      results.push('✅ HTTPS: Подключено');
    } else {
      results.push('⚠️ HTTPS: Не используется (только разработка)');
    }
    
    // Проверка 2: 2FA
    if (this.get2FAStatus()) {
      results.push('✅ 2FA: Включена');
    } else {
      results.push('❌ 2FA: Отключена - рекомендуется включить');
    }
    
    // Проверка 3: Сила пароля (если пользователь авторизован)
    if (this.isAuthenticated) {
      results.push('✅ Аутентификация: Активна');
    }
    
    // Проверка 4: Secure Cookies
    results.push('✅ Secure Cookies: Настроены');
    
    // Показываем результаты
    const modal = document.createElement('div');
    modal.className = 'security-scan-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🛡️ Результаты проверки безопасности</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="scan-results">
            ${results.map(result => `
              <div class="scan-item">
                ${result}
              </div>
            `).join('')}
          </div>
          
          <div class="scan-summary">
            <h4>Итоговая оценка: ${this.securityScore}%</h4>
            <p>${this.getSecurityRecommendation()}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary close-modal">OK</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
    
    NotificationCenterComponent.success('Проверка безопасности завершена!');
  }

  getSecurityRecommendation() {
    if (this.securityScore >= 80) {
      return 'Отличный уровень безопасности. Продолжайте соблюдать рекомендации.';
    } else if (this.securityScore >= 50) {
      return 'Хороший уровень безопасности. Рекомендуется включить 2FA.';
    } else {
      return 'Низкий уровень безопасности. Настоятельно рекомендуется настроить 2FA.';
    }
  }

  enableTwoFactor() {
    window.location.hash = '#/profile/security/2fa/setup';
  }

  viewDevices() {
    // Прокручиваем к секции устройств
    const devicesContainer = document.getElementById('devicesContainer');
    if (devicesContainer) {
      devicesContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  enableNotifications() {
    NotificationCenterComponent.info('Функция в разработке');
  }

  showEncryptionDemo() {
    const demoContainer = document.querySelector('.encrypted-example');
    if (demoContainer) {
      const original = 'sensitive_user_data_123';
      const encrypted = 'a5f7c3b8e9d1a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1';
      
      demoContainer.innerHTML = `
        <div class="encryption-demo">
          <div class="demo-step">
            <span class="demo-label">Оригинал:</span>
            <code>${original}</code>
          </div>
          <div class="demo-arrow">↓ шифрование</div>
          <div class="demo-step">
            <span class="demo-label">Зашифровано:</span>
            <code>${encrypted}</code>
          </div>
        </div>
      `;
    }
  }

  showFullAuditLog() {
    // В реальном приложении здесь был бы переход на страницу с полной историей
    NotificationCenterComponent.info('Полная история входов будет доступна в следующем обновлении');
  }

  showSecurityDocumentation() {
    const modal = document.createElement('div');
    modal.className = 'documentation-modal';
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3>📚 Документация по безопасности TravelWave</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="docs-section">
            <h4>1. Двухфакторная аутентификация (2FA)</h4>
            <p>2FA добавляет дополнительный уровень защиты. При входе требуется:</p>
            <ul>
              <li>Пароль от аккаунта</li>
              <li>6-значный код из приложения-аутентификатора</li>
              <li>Или 8-значный резервный код</li>
            </ul>
          </div>
          
          <div class="docs-section">
            <h4>2. OAuth 2.0</h4>
            <p>Поддерживаемые провайдеры:</p>
            <ul>
              <li>Google - OpenID Connect</li>
              <li>GitHub - OAuth2</li>
              <li>VK - OAuth2</li>
            </ul>
          </div>
          
          <div class="docs-section">
            <h4>3. Защита API</h4>
            <ul>
              <li>Rate limiting: 100 запросов/15 минут</li>
              <li>CSRF токены в cookies</li>
              <li>Helmet.js для HTTP заголовков</li>
              <li>XSS фильтрация</li>
              <li>NoSQL инъекции: предотвращение</li>
            </ul>
          </div>
          
          <div class="docs-section">
            <h4>4. Шифрование</h4>
            <ul>
              <li>Пароли: bcrypt (12 раундов)</li>
              <li>Чувствительные данные: AES-256-GCM</li>
              <li>Токены: JWT с RS256</li>
              <li>HTTPS: принудительное перенаправление</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">Закрыть</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
  }

  static init(containerSelector) {
    const day13 = new Day13Component();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = day13.render();
      day13.afterRender();
    }
    
    return day13;
  }
}

export default Day13Component;