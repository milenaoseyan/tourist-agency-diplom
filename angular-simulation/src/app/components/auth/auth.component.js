/**
 * @fileoverview Компонент аутентификации
 * @module components/auth
 */

import apiService from '../../services/api.service.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';
import { DataValidator } from '../../core/types.js';

/**
 * Компонент аутентификации
 * @class AuthComponent
 */
class AuthComponent {
  constructor() {
    this.mode = 'login'; // 'login', 'register', 'forgot', 'reset'
    this.validationSchema = {
      login: {
        email: { type: 'string', required: true, pattern: /\S+@\S+\.\S+/ },
        password: { type: 'string', required: true, minlength: 8 }
      },
      register: {
        name: { type: 'string', required: true, minlength: 2 },
        email: { type: 'string', required: true, pattern: /\S+@\S+\.\S+/ },
        password: { type: 'string', required: true, minlength: 8 },
        passwordConfirm: { type: 'string', required: true }
      }
    };
  }

  /**
   * Рендеринг компонента
   * @returns {string} HTML строка
   */
  render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <h2>${this.getTitle()}</h2>
            <p class="auth-subtitle">${this.getSubtitle()}</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab ${this.mode === 'login' ? 'active' : ''}" data-mode="login">
              Вход
            </button>
            <button class="auth-tab ${this.mode === 'register' ? 'active' : ''}" data-mode="register">
              Регистрация
            </button>
          </div>

          <form class="auth-form" id="authForm">
            ${this.renderFormFields()}
            
            ${this.mode === 'login' ? `
              <div class="form-options">
                <label class="checkbox-option">
                  <input type="checkbox" id="rememberMe">
                  <span>Запомнить меня</span>
                </label>
                <button type="button" class="btn-text" id="forgotPassword">
                  Забыли пароль?
                </button>
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary auth-submit">
              ${this.getSubmitText()}
            </button>

            ${this.mode === 'login' ? `
              <div class="auth-divider">
                <span>или войдите через</span>
              </div>
              
              <div class="social-auth">
                <button type="button" class="btn-social google" id="googleAuth">
                  <span class="social-icon">G</span>
                  <span class="social-text">Google</span>
                </button>
                <button type="button" class="btn-social github" id="githubAuth">
                  <span class="social-icon">Git</span>
                  <span class="social-text">GitHub</span>
                </button>
              </div>
            ` : ''}
          </form>

          <div class="auth-footer">
            ${this.mode === 'login' 
              ? 'Нет аккаунта? <button class="btn-text" id="switchToRegister">Зарегистрироваться</button>'
              : 'Уже есть аккаунт? <button class="btn-text" id="switchToLogin">Войти</button>'
            }
          </div>
        </div>

        <div class="auth-features">
          <h3>Преимущества регистрации</h3>
          <ul class="features-list">
            <li>💾 Сохранение избранных туров</li>
            <li>📋 История бронирований</li>
            <li>🎯 Персональные рекомендации</li>
            <li>🔔 Уведомления о скидках</li>
            <li>⭐ Возможность оставлять отзывы</li>
            <li>⚡ Быстрое оформление заказов</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Получение заголовка формы
   * @returns {string} Заголовок
   */
  getTitle() {
    const titles = {
      login: 'Вход в аккаунт',
      register: 'Создание аккаунта',
      forgot: 'Восстановление пароля',
      reset: 'Сброс пароля'
    };
    return titles[this.mode] || titles.login;
  }

  /**
   * Получение подзаголовка формы
   * @returns {string} Подзаголовок
   */
  getSubtitle() {
    const subtitles = {
      login: 'Войдите, чтобы получить доступ ко всем функциям',
      register: 'Создайте аккаунт для бронирования туров',
      forgot: 'Введите email для восстановления пароля',
      reset: 'Введите новый пароль'
    };
    return subtitles[this.mode] || subtitles.login;
  }

  /**
   * Получение текста кнопки отправки
   * @returns {string} Текст кнопки
   */
  getSubmitText() {
    const texts = {
      login: 'Войти',
      register: 'Зарегистрироваться',
      forgot: 'Отправить ссылку',
      reset: 'Сбросить пароль'
    };
    return texts[this.mode] || texts.login;
  }

  /**
   * Рендеринг полей формы
   * @returns {string} HTML полей формы
   */
  renderFormFields() {
    const fields = {
      login: `
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required>
          <button type="button" class="show-password" data-target="password">👁️</button>
        </div>
      `,
      
      register: `
        <div class="form-group">
          <label for="name">Имя</label>
          <input type="text" id="name" name="name" placeholder="Ваше имя" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label for="phone">Телефон (необязательно)</label>
          <input type="tel" id="phone" name="phone" placeholder="+7 (999) 999-99-99">
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" name="password" placeholder="Минимум 8 символов" required>
          <button type="button" class="show-password" data-target="password">👁️</button>
        </div>
        <div class="form-group">
          <label for="passwordConfirm">Подтверждение пароля</label>
          <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder="Повторите пароль" required>
          <button type="button" class="show-password" data-target="passwordConfirm">👁️</button>
        </div>
        <div class="form-group">
          <label class="checkbox-option">
            <input type="checkbox" id="terms" required>
            <span>Я согласен с <a href="#/terms" class="link">условиями использования</a> и <a href="#/privacy" class="link">политикой конфиденциальности</a></span>
          </label>
        </div>
      `,
      
      forgot: `
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="your@email.com" required>
        </div>
      `,
      
      reset: `
        <div class="form-group">
          <label for="password">Новый пароль</label>
          <input type="password" id="password" name="password" placeholder="Минимум 8 символов" required>
        </div>
        <div class="form-group">
          <label for="passwordConfirm">Подтверждение пароля</label>
          <input type="password" id="passwordConfirm" name="passwordConfirm" placeholder="Повторите пароль" required>
        </div>
      `
    };
    
    return fields[this.mode] || fields.login;
  }

  /**
   * Инициализация после рендеринга
   * @returns {void}
   */
  afterRender() {
    // Переключение режимов
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.mode = e.target.dataset.mode;
        this.rerender();
      });
    });

    // Переключение между логином и регистрацией
    document.getElementById('switchToRegister')?.addEventListener('click', () => {
      this.mode = 'register';
      this.rerender();
    });

    document.getElementById('switchToLogin')?.addEventListener('click', () => {
      this.mode = 'login';
      this.rerender();
    });

    // Забыли пароль
    document.getElementById('forgotPassword')?.addEventListener('click', () => {
      this.mode = 'forgot';
      this.rerender();
    });

    // Показать/скрыть пароль
    document.querySelectorAll('.show-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
      });
    });

    // Отправка формы
    const form = document.getElementById('authForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Социальная авторизация
    document.getElementById('googleAuth')?.addEventListener('click', () => {
      this.socialAuth('google');
    });

    document.getElementById('githubAuth')?.addEventListener('click', () => {
      this.socialAuth('github');
    });
  }

  /**
   * Обработка отправки формы
   * @returns {Promise<void>}
   */
  async handleSubmit() {
    const formData = this.getFormData();
    
    // Валидация данных
    const validationResult = this.validateFormData(formData);
    if (!validationResult.isValid) {
      validationResult.errors.forEach(error => {
        NotificationCenterComponent.error(error.error);
      });
      return;
    }

    try {
      NotificationCenterComponent.info('Обработка запроса...');

      let response;
      
      switch (this.mode) {
        case 'login':
          response = await apiService.login({
            email: formData.email,
            password: formData.password
          });
          NotificationCenterComponent.success('Вход выполнен успешно!');
          setTimeout(() => window.location.hash = '#/profile', 1000);
          break;

        case 'register':
          response = await apiService.register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm
          });
          NotificationCenterComponent.success('Регистрация успешна! Добро пожаловать!');
          setTimeout(() => window.location.hash = '#/profile', 1000);
          break;

        case 'forgot':
          response = await apiService.post('/auth/forgot-password', {
            email: formData.email
          });
          NotificationCenterComponent.success('Ссылка для сброса пароля отправлена на email');
          this.mode = 'login';
          this.rerender();
          break;

        case 'reset':
          const token = new URLSearchParams(window.location.search).get('token');
          if (!token) {
            NotificationCenterComponent.error('Неверная ссылка для сброса пароля');
            return;
          }
          
          response = await apiService.patch('/auth/reset-password/' + token, {
            password: formData.password,
            passwordConfirm: formData.passwordConfirm
          });
          
          NotificationCenterComponent.success('Пароль успешно изменен!');
          this.mode = 'login';
          this.rerender();
          break;
      }

      // Сохранение пользователя в localStorage
      if (response.user) {
        localStorage.setItem('current_user', JSON.stringify(response.user));
      }

    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      NotificationCenterComponent.error(error.message || 'Ошибка при выполнении запроса');
    }
  }

  /**
   * Получение данных формы
   * @returns {Object} Данные формы
   */
  getFormData() {
    const form = document.getElementById('authForm');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });

    return data;
  }

  /**
   * Валидация данных формы
   * @param {Object} data - Данные для валидации
   * @returns {Object} Результат валидации
   */
  validateFormData(data) {
    const schema = this.validationSchema[this.mode];
    
    if (!schema) {
      return { isValid: true, errors: [] };
    }

    // Кастомная валидация для паролей
    const customValidators = {
      passwordConfirm: (value, allData) => value === allData.password
    };

    const extendedSchema = { ...schema };
    if (extendedSchema.passwordConfirm) {
      extendedSchema.passwordConfirm.custom = (value) => value === data.password;
    }

    return DataValidator.validate(data, extendedSchema);
  }

  /**
   * Социальная авторизация
   * @param {string} provider - Провайдер (google, github)
   * @returns {Promise<void>}
   */
  async socialAuth(provider) {
    try {
      NotificationCenterComponent.info(`Перенаправление на ${provider}...`);
      
      // В реальном приложении здесь бы было перенаправление на OAuth провайдера
      // Для демо используем мок-авторизацию
      const mockUser = {
        name: 'Social User',
        email: `social@${provider}.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
      };
      
      // Моковый токен
      const mockToken = 'social_mock_token_' + Date.now();
      apiService.setAuthToken(mockToken, mockToken + '_refresh');
      
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      
      NotificationCenterComponent.success(`Вход через ${provider} выполнен!`);
      setTimeout(() => window.location.hash = '#/profile', 1000);
      
    } catch (error) {
      console.error('Ошибка социальной авторизации:', error);
      NotificationCenterComponent.error('Ошибка при входе через социальную сеть');
    }
  }

  /**
   * Проверка авторизации пользователя
   * @returns {boolean} Авторизован ли пользователь
   */
  static isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Получение текущего пользователя
   * @returns {Object|null} Данные пользователя
   */
  static getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Выход пользователя
   * @returns {Promise<void>}
   */
  static async logout() {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      localStorage.removeItem('current_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      NotificationCenterComponent.success('Выход выполнен');
      window.location.hash = '#/login';
    }
  }

  /**
   * Перерисовка компонента
   * @returns {void}
   */
  rerender() {
    const container = document.querySelector('.auth-container');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
    }
  }

  /**
   * Статический метод для инициализации
   * @param {string} containerSelector - Селектор контейнера
   * @returns {AuthComponent} Экземпляр компонента
   */
  static init(containerSelector) {
    const auth = new AuthComponent();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      // Проверяем, есть ли токен сброса пароля в URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('token')) {
        auth.mode = 'reset';
      }
      
      container.innerHTML = auth.render();
      auth.afterRender();
    }
    
    return auth;
  }
}

export default AuthComponent;