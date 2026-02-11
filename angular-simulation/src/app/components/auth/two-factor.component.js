/**
 * @fileoverview Компонент двухфакторной аутентификации
 * @module components/auth/two-factor
 */

import apiService from '../../services/api.service.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class TwoFactorComponent {
  constructor() {
    this.mode = 'setup'; // setup, verify, manage
    this.qrCode = null;
    this.secret = null;
    this.backupCodes = [];
  }

  async render() {
    if (this.mode === 'setup') {
      await this.loadSetupData();
    }

    return `
      <div class="two-factor-container">
        <div class="two-factor-header">
          <h3>🔐 Двухфакторная аутентификация</h3>
          <p class="description">
            Двухфакторная аутентификация добавляет дополнительный уровень защиты вашего аккаунта.
            После включения 2FA при каждом входе потребуется ввод кода из приложения-аутентификатора.
          </p>
        </div>

        <div class="two-factor-content">
          ${this.renderContent()}
        </div>

        <div class="two-factor-footer">
          <button class="btn btn-secondary" id="backToSecurity">
            ← Назад к безопасности
          </button>
        </div>
      </div>
    `;
  }

  renderContent() {
    switch (this.mode) {
      case 'setup':
        return this.renderSetup();
      case 'verify':
        return this.renderVerify();
      case 'manage':
        return this.renderManage();
      default:
        return '';
    }
  }

  renderSetup() {
    return `
      <div class="setup-step">
        <div class="step">1</div>
        <div class="step-content">
          <h4>Установите приложение аутентификатора</h4>
          <p>Скачайте Google Authenticator, Microsoft Authenticator или Authy:</p>
          <div class="app-links">
            <a href="#" class="app-link">📱 App Store</a>
            <a href="#" class="app-link">📱 Google Play</a>
          </div>
        </div>
      </div>

      <div class="setup-step">
        <div class="step">2</div>
        <div class="step-content">
          <h4>Отсканируйте QR код</h4>
          <p>Откройте приложение и отсканируйте этот QR код:</p>
          
          <div class="qr-container">
            ${this.qrCode ? `
              <img src="${this.qrCode}" alt="2FA QR Code" class="qr-code">
            ` : `
              <div class="qr-placeholder">
                <div class="loader"></div>
                <p>Генерация QR кода...</p>
              </div>
            `}
          </div>
          
          <div class="manual-setup">
            <p>Не удается отсканировать QR код?</p>
            <div class="secret-key">
              <code>${this.secret || '••••••••'}</code>
              <button class="btn-icon copy-secret" title="Копировать секрет">
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="setup-step">
        <div class="step">3</div>
        <div class="step-content">
          <h4>Подтвердите код</h4>
          <p>Введите 6-значный код из приложения:</p>
          
          <div class="verification-input">
            <input type="text" 
                   id="verificationCode" 
                   maxlength="6" 
                   pattern="\\d*" 
                   placeholder="000000"
                   autocomplete="off">
          </div>
          
          <button class="btn btn-primary" id="verifyCode" ${!this.qrCode ? 'disabled' : ''}>
            Подтвердить и включить 2FA
          </button>
        </div>
      </div>

      ${this.backupCodes.length > 0 ? `
        <div class="backup-codes-section">
          <h4>⚠️ Сохраните резервные коды!</h4>
          <p>Эти коды можно использовать для входа, если вы потеряете доступ к приложению аутентификатора.</p>
          
          <div class="backup-codes-grid">
            ${this.backupCodes.map(code => `
              <div class="backup-code">${code}</div>
            `).join('')}
          </div>
          
          <div class="backup-actions">
            <button class="btn btn-secondary" id="downloadCodes">
              📥 Скачать коды
            </button>
            <button class="btn btn-secondary" id="copyCodes">
              📋 Копировать все
            </button>
          </div>
          
          <p class="warning">
            <strong>Важно!</strong> Коды отображаются только один раз. Сохраните их в надежном месте.
          </p>
        </div>
      ` : ''}
    `;
  }

  renderVerify() {
    return `
      <div class="verify-content">
        <div class="verify-icon">🔐</div>
        <h4>Введите код из приложения</h4>
        <p>Откройте Google Authenticator и введите текущий код для подтверждения входа</p>
        
        <div class="verification-input large">
          <input type="text" 
                 id="verificationCode" 
                 maxlength="6" 
                 pattern="\\d*" 
                 placeholder="000000"
                 autocomplete="off"
                 autofocus>
        </div>
        
        <div class="verify-actions">
          <button class="btn btn-primary" id="submitCode">
            Подтвердить
          </button>
          <button class="btn btn-text" id="useBackupCode">
            Использовать резервный код
          </button>
        </div>
        
        <div class="trust-device">
          <label class="checkbox-option">
            <input type="checkbox" id="trustDevice">
            <span>Доверять этому устройству на 30 дней</span>
          </label>
        </div>
      </div>
    `;
  }

  renderManage() {
    return `
      <div class="manage-content">
        <div class="status-card ${this.isEnabled ? 'enabled' : 'disabled'}">
          <div class="status-icon">
            ${this.isEnabled ? '✅' : '❌'}
          </div>
          <div class="status-info">
            <div class="status-title">
              2FA ${this.isEnabled ? 'включена' : 'отключена'}
            </div>
            <div class="status-description">
              ${this.isEnabled 
                ? 'Ваш аккаунт защищен двухфакторной аутентификацией'
                : 'Включите 2FA для дополнительной защиты аккаунта'
              }
            </div>
          </div>
        </div>
        
        <div class="manage-actions">
          ${this.isEnabled ? `
            <button class="btn btn-outline" id="regenerateCodes">
              🔄 Сгенерировать новые резервные коды
            </button>
            <button class="btn btn-danger" id="disable2FA">
              🚫 Отключить 2FA
            </button>
          ` : `
            <button class="btn btn-primary" id="enable2FA">
              🔐 Включить 2FA
            </button>
          `}
        </div>
        
        ${this.isEnabled ? `
          <div class="backup-codes-status">
            <h5>Резервные коды</h5>
            <p>Осталось ${this.remainingCodes} неиспользованных кодов</p>
            <button class="btn btn-link" id="viewCodes">
              Показать коды
            </button>
          </div>
          
          <div class="trusted-devices">
            <h5>Доверенные устройства</h5>
            <div class="devices-list" id="devicesList"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  async afterRender() {
    switch (this.mode) {
      case 'setup':
        this.initSetupHandlers();
        break;
      case 'verify':
        this.initVerifyHandlers();
        break;
      case 'manage':
        this.initManageHandlers();
        break;
    }

    document.getElementById('backToSecurity')?.addEventListener('click', () => {
      window.location.hash = '#/profile/security';
    });
  }

  async loadSetupData() {
    try {
      const response = await apiService.post('/auth/2fa/enable');
      this.qrCode = response.data.qrCode;
      this.secret = response.data.secret;
      this.backupCodes = response.data.backupCodes;
    } catch (error) {
      console.error('Ошибка загрузки данных 2FA:', error);
      NotificationCenterComponent.error('Не удалось настроить 2FA');
    }
  }

  async loadStatus() {
    try {
      const response = await apiService.get('/auth/2fa/status');
      this.isEnabled = response.data.enabled;
      this.remainingCodes = response.data.backupCodesCount;
    } catch (error) {
      console.error('Ошибка загрузки статуса 2FA:', error);
    }
  }

  initSetupHandlers() {
    // Копирование секрета
    document.querySelector('.copy-secret')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.secret);
      NotificationCenterComponent.success('Секретный ключ скопирован');
    });

    // Подтверждение кода
    document.getElementById('verifyCode')?.addEventListener('click', async () => {
      const code = document.getElementById('verificationCode').value;
      
      if (!code || code.length !== 6) {
        NotificationCenterComponent.warning('Введите 6-значный код');
        return;
      }

      try {
        await apiService.post('/auth/2fa/verify', { token: code });
        NotificationCenterComponent.success('2FA успешно включена!');
        
        // Переходим в режим управления
        this.mode = 'manage';
        await this.loadStatus();
        this.rerender();
        
      } catch (error) {
        NotificationCenterComponent.error('Неверный код. Попробуйте снова');
      }
    });

    // Скачать резервные коды
    document.getElementById('downloadCodes')?.addEventListener('click', () => {
      const content = this.backupCodes.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `travelwave-backup-codes-${Date.now()}.txt`;
      a.click();
      
      URL.revokeObjectURL(url);
      NotificationCenterComponent.success('Резервные коды сохранены');
    });

    // Копировать все коды
    document.getElementById('copyCodes')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.backupCodes.join('\n'));
      NotificationCenterComponent.success('Все коды скопированы');
    });
  }

  initVerifyHandlers() {
    const codeInput = document.getElementById('verificationCode');
    
    codeInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    codeInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.length === 6) {
        this.submitVerification();
      }
    });

    document.getElementById('submitCode')?.addEventListener('click', () => {
      this.submitVerification();
    });

    document.getElementById('useBackupCode')?.addEventListener('click', () => {
      this.showBackupCodeInput();
    });
  }

  async submitVerification() {
    const code = document.getElementById('verificationCode').value;
    const trustDevice = document.getElementById('trustDevice')?.checked || false;

    if (!code || code.length !== 6) {
      NotificationCenterComponent.warning('Введите 6-значный код');
      return;
    }

    try {
      const response = await apiService.post('/auth/verify-2fa', {
        token: code,
        trustDevice
      });

      // Сохраняем токен устройства если есть
      if (response.data.deviceId) {
        localStorage.setItem('trusted_device_id', response.data.deviceId);
      }

      NotificationCenterComponent.success('Вход выполнен успешно!');
      
      // Перенаправляем на главную
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1000);
      
    } catch (error) {
      NotificationCenterComponent.error('Неверный код. Попробуйте снова');
    }
  }

  showBackupCodeInput() {
    const container = document.querySelector('.verify-content');
    if (!container) return;

    container.innerHTML = `
      <div class="verify-content">
        <div class="verify-icon">🔑</div>
        <h4>Введите резервный код</h4>
        <p>Используйте один из резервных кодов, которые вы сохранили при включении 2FA</p>
        
        <div class="verification-input large">
          <input type="text" 
                 id="backupCode" 
                 maxlength="8" 
                 pattern="\\d*" 
                 placeholder="00000000"
                 autocomplete="off">
        </div>
        
        <div class="verify-actions">
          <button class="btn btn-primary" id="submitBackupCode">
            Подтвердить
          </button>
          <button class="btn btn-text" id="backToCode">
            ← Вернуться к коду
          </button>
        </div>
      </div>
    `;

    document.getElementById('submitBackupCode')?.addEventListener('click', async () => {
      const code = document.getElementById('backupCode').value;
      
      if (!code || code.length !== 8) {
        NotificationCenterComponent.warning('Введите 8-значный резервный код');
        return;
      }

      try {
        await apiService.post('/auth/verify-2fa', { token: code });
        NotificationCenterComponent.success('Вход выполнен с резервным кодом!');
        window.location.hash = '#/';
      } catch (error) {
        NotificationCenterComponent.error('Неверный резервный код');
      }
    });

    document.getElementById('backToCode')?.addEventListener('click', () => {
      this.mode = 'verify';
      this.rerender();
    });
  }

  async initManageHandlers() {
    document.getElementById('enable2FA')?.addEventListener('click', () => {
      this.mode = 'setup';
      this.rerender();
    });

    document.getElementById('disable2FA')?.addEventListener('click', async () => {
      const confirmed = confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию? Это снизит безопасность вашего аккаунта.');
      
      if (confirmed) {
        try {
          await apiService.post('/auth/2fa/disable');
          NotificationCenterComponent.success('2FA отключена');
          this.isEnabled = false;
          this.rerender();
        } catch (error) {
          NotificationCenterComponent.error('Ошибка при отключении 2FA');
        }
      }
    });

    document.getElementById('regenerateCodes')?.addEventListener('click', async () => {
      const confirmed = confirm('Генерация новых резервных кодов сделает предыдущие коды недействительными. Продолжить?');
      
      if (confirmed) {
        try {
          const response = await apiService.post('/auth/2fa/backup-codes');
          this.backupCodes = response.data.backupCodes;
          this.showNewBackupCodes();
        } catch (error) {
          NotificationCenterComponent.error('Ошибка при генерации кодов');
        }
      }
    });

    await this.loadTrustedDevices();
  }

  async loadTrustedDevices() {
    try {
      const response = await apiService.get('/auth/security/devices');
      const devices = response.data.devices;
      
      const devicesList = document.getElementById('devicesList');
      if (!devicesList) return;

      if (devices.length === 0) {
        devicesList.innerHTML = '<p class="no-devices">Нет доверенных устройств</p>';
        return;
      }

      devicesList.innerHTML = devices.map(device => `
        <div class="device-item">
          <div class="device-icon">
            ${this.getDeviceIcon(device.userAgent)}
          </div>
          <div class="device-info">
            <div class="device-name">${device.deviceName || 'Неизвестное устройство'}</div>
            <div class="device-meta">
              Последнее использование: ${new Date(device.lastUsed).toLocaleDateString('ru-RU')}
            </div>
            <div class="device-expires">
              Действует до: ${new Date(device.expiresAt).toLocaleDateString('ru-RU')}
            </div>
          </div>
          <button class="btn-icon remove-device" data-device-id="${device.deviceId}">
            🗑️
          </button>
        </div>
      `).join('');

      // Добавляем обработчики удаления
      document.querySelectorAll('.remove-device').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const deviceId = e.target.dataset.deviceId;
          await this.removeTrustedDevice(deviceId);
        });
      });

    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
    }
  }

  async removeTrustedDevice(deviceId) {
    try {
      await apiService.delete(`/auth/security/devices/${deviceId}`);
      NotificationCenterComponent.success('Устройство удалено');
      await this.loadTrustedDevices();
    } catch (error) {
      NotificationCenterComponent.error('Ошибка при удалении устройства');
    }
  }

  showNewBackupCodes() {
    const container = document.querySelector('.manage-content');
    
    const modal = document.createElement('div');
    modal.className = 'backup-codes-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h4>🔐 Новые резервные коды</h4>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p class="warning">Сохраните эти коды в надежном месте! Они больше не будут показаны.</p>
          
          <div class="backup-codes-grid">
            ${this.backupCodes.map(code => `
              <div class="backup-code">${code}</div>
            `).join('')}
          </div>
          
          <div class="backup-actions">
            <button class="btn btn-secondary" id="downloadNewCodes">
              📥 Скачать
            </button>
            <button class="btn btn-secondary" id="copyNewCodes">
              📋 Копировать
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#downloadNewCodes')?.addEventListener('click', () => {
      const content = this.backupCodes.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `travelwave-backup-codes-${Date.now()}.txt`;
      a.click();
      
      URL.revokeObjectURL(url);
    });

    modal.querySelector('#copyNewCodes')?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.backupCodes.join('\n'));
      NotificationCenterComponent.success('Коды скопированы');
    });
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

  rerender() {
    const container = document.querySelector('.two-factor-container');
    if (container) {
      this.render().then(html => {
        container.innerHTML = html;
        this.afterRender();
      });
    }
  }

  static async init(containerSelector, mode = 'manage') {
    const twoFactor = new TwoFactorComponent();
    twoFactor.mode = mode;
    
    if (mode === 'manage') {
      await twoFactor.loadStatus();
    }
    
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = await twoFactor.render();
      twoFactor.afterRender();
    }
    
    return twoFactor;
  }
}

export default TwoFactorComponent;