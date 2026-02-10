/**
 * @fileoverview Компонент для 12-го дня практики
 * @module components/day12
 */

import ApiService from '../../services/api.service.js';
import AuthComponent from '../auth/auth.component.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

/**
 * Компонент для демонстрации работы с бэкендом
 * @class Day12Component
 */
class Day12Component {
  constructor() {
    this.title = 'День 12: Подключение реального бэкенда';
    this.description = 'Node.js/Express сервер с MongoDB и REST API';
    
    this.apiService = ApiService;
    this.isAuthenticated = AuthComponent.isAuthenticated();
    this.currentUser = AuthComponent.getCurrentUser();
    this.apiStats = {
      requests: 0,
      successes: 0,
      failures: 0
    };
  }

  /**
   * Рендеринг компонента
   * @returns {string} HTML строка
   */
  render() {
    return `
      <div class="day12-container">
        <header class="day12-header">
          <h1>${this.title}</h1>
          <p class="subtitle">${this.description}</p>
          <div class="progress-indicator">
            <span class="progress-text">12/15 дней завершено</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 80%"></div>
            </div>
          </div>
        </header>

        <div class="backend-status" id="backendStatus">
          <div class="status-loading">
            <div class="loader"></div>
            <span>Проверка подключения к серверу...</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card" id="authFeature">
            <h2>🔐 Аутентификация</h2>
            <div class="feature-content" id="authContainer"></div>
          </div>

          <div class="feature-card" id="toursFeature">
            <h2>🗺️ API Туров</h2>
            <div class="feature-content" id="toursContainer"></div>
          </div>

          <div class="feature-card" id="bookingsFeature">
            <h2>📅 Бронирования</h2>
            <div class="feature-content" id="bookingsContainer"></div>
          </div>

          <div class="feature-card" id="profileFeature">
            <h2>👤 Профиль</h2>
            <div class="feature-content" id="profileContainer"></div>
          </div>

          <div class="feature-card" id="apiFeature">
            <h2>🔧 API Тестирование</h2>
            <div class="feature-content" id="apiContainer"></div>
          </div>

          <div class="feature-card" id="databaseFeature">
            <h2>🗄️ База данных</h2>
            <div class="feature-content" id="databaseContainer"></div>
          </div>
        </div>

        <div class="day12-actions">
          <button class="btn btn-primary" id="testAllEndpoints">
            🧪 Протестировать все endpoint'ы
          </button>
          <button class="btn btn-secondary" id="loadSampleData">
            📊 Загрузить тестовые данные
          </button>
          ${this.isAuthenticated ? `
            <button class="btn btn-success" id="loadMyData">
              👤 Загрузить мои данные
            </button>
          ` : ''}
        </div>

        <div class="api-monitor" id="apiMonitor"></div>

        <div class="documentation-section">
          <h3>📚 Документация API</h3>
          <div class="endpoints-list" id="endpointsList"></div>
        </div>
      </div>
    `;
  }

  /**
   * Инициализация после рендеринга
   * @returns {void}
   */
  afterRender() {
    this.checkBackendStatus();
    this.initAuthSection();
    this.initToursSection();
    this.initBookingsSection();
    this.initProfileSection();
    this.initApiSection();
    this.initDatabaseSection();
    this.initDocumentation();

    // Кнопки действий
    document.getElementById('testAllEndpoints')?.addEventListener('click', () => {
      this.testAllEndpoints();
    });

    document.getElementById('loadSampleData')?.addEventListener('click', () => {
      this.loadSampleData();
    });

    document.getElementById('loadMyData')?.addEventListener('click', () => {
      this.loadUserData();
    });
  }

  /**
   * Проверка статуса бэкенда
   * @returns {Promise<void>}
   */
  async checkBackendStatus() {
    const statusContainer = document.getElementById('backendStatus');
    if (!statusContainer) return;

    try {
      const isConnected = await this.apiService.checkConnection();
      
      if (isConnected) {
        statusContainer.innerHTML = `
          <div class="status-success">
            <span class="status-icon">✅</span>
            <div class="status-info">
              <div class="status-title">Бэкенд подключен</div>
              <div class="status-subtitle">Сервер доступен и работает</div>
            </div>
          </div>
        `;
      } else {
        statusContainer.innerHTML = `
          <div class="status-error">
            <span class="status-icon">❌</span>
            <div class="status-info">
              <div class="status-title">Бэкенд недоступен</div>
              <div class="status-subtitle">Проверьте запущен ли сервер</div>
            </div>
            <button class="btn btn-small" id="retryConnection">
              Повторить
            </button>
          </div>
        `;

        document.getElementById('retryConnection')?.addEventListener('click', () => {
          this.checkBackendStatus();
        });
      }
    } catch (error) {
      statusContainer.innerHTML = `
        <div class="status-error">
          <span class="status-icon">⚠️</span>
          <div class="status-info">
            <div class="status-title">Ошибка подключения</div>
            <div class="status-subtitle">${error.message}</div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Инициализация секции аутентификации
   * @returns {void}
   */
  initAuthSection() {
    const container = document.getElementById('authContainer');
    if (!container) return;

    if (this.isAuthenticated) {
      container.innerHTML = `
        <div class="auth-status">
          <div class="user-info">
            <div class="user-avatar">${this.currentUser?.name?.charAt(0) || '👤'}</div>
            <div class="user-details">
              <div class="user-name">${this.currentUser?.name || 'Пользователь'}</div>
              <div class="user-email">${this.currentUser?.email || ''}</div>
            </div>
          </div>
          <div class="auth-actions">
            <button class="btn btn-small" id="refreshToken">
              🔄 Обновить токен
            </button>
            <button class="btn btn-small btn-danger" id="logout">
              🚪 Выйти
            </button>
          </div>
        </div>
      `;

      document.getElementById('refreshToken')?.addEventListener('click', async () => {
        await this.refreshAuthToken();
      });

      document.getElementById('logout')?.addEventListener('click', async () => {
        await AuthComponent.logout();
        this.rerender();
      });
    } else {
      container.innerHTML = `
        <div class="auth-prompt">
          <p>Для доступа к функциям требуется вход в систему</p>
          <button class="btn btn-primary" id="showLogin">
            🔐 Войти или зарегистрироваться
          </button>
        </div>
      `;

      document.getElementById('showLogin')?.addEventListener('click', () => {
        window.location.hash = '#/auth';
      });
    }
  }

  /**
   * Инициализация секции туров
   * @returns {void}
   */
  initToursSection() {
    const container = document.getElementById('toursContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="tours-demo">
        <h4>Доступные endpoint'ы:</h4>
        <ul class="endpoints">
          <li><code>GET /api/v1/tours</code> - Все туры</li>
          <li><code>GET /api/v1/tours/top-5-tours</code> - Топ-5 туров</li>
          <li><code>GET /api/v1/tours/:id</code> - Конкретный тур</li>
          <li><code>POST /api/v1/tours/:id/favorite</code> - В избранное</li>
        </ul>
        <div class="demo-actions">
          <button class="btn btn-small" id="loadTours">
            📋 Загрузить туры
          </button>
          ${this.isAuthenticated ? `
            <button class="btn btn-small" id="loadFavorites">
              ⭐ Избранное
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('loadTours')?.addEventListener('click', () => {
      this.loadToursDemo();
    });

    document.getElementById('loadFavorites')?.addEventListener('click', () => {
      this.loadFavoriteTours();
    });
  }

  /**
   * Инициализация секции бронирований
   * @returns {void}
   */
  initBookingsSection() {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="bookings-demo">
        <h4>Бронирования:</h4>
        ${this.isAuthenticated ? `
          <p>Забронированные туры будут отображаться здесь</p>
          <button class="btn btn-small" id="loadBookings">
            📅 Мои бронирования
          </button>
          <button class="btn btn-small" id="createBooking">
            ➕ Создать тестовое бронирование
          </button>
        ` : `
          <p>Требуется вход для работы с бронированиями</p>
        `}
      </div>
    `;

    document.getElementById('loadBookings')?.addEventListener('click', () => {
      this.loadUserBookings();
    });

    document.getElementById('createBooking')?.addEventListener('click', () => {
      this.createTestBooking();
    });
  }

  /**
   * Инициализация секции профиля
   * @returns {void}
   */
  initProfileSection() {
    const container = document.getElementById('profileContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="profile-demo">
        <h4>Профиль пользователя:</h4>
        ${this.isAuthenticated ? `
          <div class="profile-info">
            <div class="info-item">
              <span class="label">Имя:</span>
              <span class="value" id="profileName">${this.currentUser?.name || ''}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value" id="profileEmail">${this.currentUser?.email || ''}</span>
            </div>
            <div class="info-item">
              <span class="label">Роль:</span>
              <span class="value" id="profileRole">${this.currentUser?.role || 'user'}</span>
            </div>
          </div>
          <button class="btn btn-small" id="updateProfile">
            ✏️ Обновить профиль
          </button>
        ` : `
          <p>Профиль будет доступен после входа</p>
        `}
      </div>
    `;

    document.getElementById('updateProfile')?.addEventListener('click', () => {
      this.updateProfileDemo();
    });
  }

  /**
   * Инициализация секции API
   * @returns {void}
   */
  initApiSection() {
    const container = document.getElementById('apiContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="api-testing">
        <h4>Тестирование API:</h4>
        <div class="test-buttons">
          <button class="btn btn-small" data-test="health">
            🩺 Health Check
          </button>
          <button class="btn btn-small" data-test="tours">
            🗺️ Получить туры
          </button>
          <button class="btn btn-small" data-test="stats">
            📊 Статистика
          </button>
          <button class="btn btn-small" data-test="auth">
            🔐 Проверка аутентификации
          </button>
        </div>
        <div class="test-results" id="testResults"></div>
      </div>
    `;

    document.querySelectorAll('[data-test]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const testType = e.target.dataset.test;
        this.runApiTest(testType);
      });
    });
  }

  /**
   * Инициализация секции базы данных
   * @returns {void}
   */
  initDatabaseSection() {
    const container = document.getElementById('databaseContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="database-info">
        <h4>База данных MongoDB:</h4>
        <ul class="db-features">
          <li>✅ Масштабируемая NoSQL база</li>
          <li>✅ Геопространственные запросы</li>
          <li>✅ Агрегационные пайплайны</li>
          <li>✅ Индексы для производительности</li>
          <li>✅ Валидация схемы</li>
          <li>✅ Репликация и шардирование</li>
        </ul>
        <div class="db-stats">
          <div class="stat">
            <div class="stat-value" id="toursCount">0</div>
            <div class="stat-label">Туров</div>
          </div>
          <div class="stat">
            <div class="stat-value" id="usersCount">0</div>
            <div class="stat-label">Пользователей</div>
          </div>
          <div class="stat">
            <div class="stat-value" id="bookingsCount">0</div>
            <div class="stat-label">Бронирований</div>
          </div>
        </div>
      </div>
    `;

    this.loadDatabaseStats();
  }

  /**
   * Загрузка статистики базы данных
   * @returns {Promise<void>}
   */
  async loadDatabaseStats() {
    try {
      // Моковые данные для демо
      document.getElementById('toursCount').textContent = '24';
      document.getElementById('usersCount').textContent = this.isAuthenticated ? '1' : '0';
      document.getElementById('bookingsCount').textContent = '15';
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  }

  /**
   * Инициализация документации
   * @returns {void}
   */
  initDocumentation() {
    const container = document.getElementById('endpointsList');
    if (!container) return;

    const endpoints = [
      {
        method: 'GET',
        path: '/api/v1/tours',
        description: 'Получить все туры с фильтрацией',
        auth: false
      },
      {
        method: 'GET',
        path: '/api/v1/tours/:id',
        description: 'Получить конкретный тур',
        auth: false
      },
      {
        method: 'POST',
        path: '/api/v1/tours/:id/favorite',
        description: 'Добавить тур в избранное',
        auth: true
      },
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        description: 'Регистрация пользователя',
        auth: false
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Вход пользователя',
        auth: false
      },
      {
        method: 'GET',
        path: '/api/v1/users/me',
        description: 'Получить профиль текущего пользователя',
        auth: true
      },
      {
        method: 'POST',
        path: '/api/v1/bookings',
        description: 'Создать бронирование',
        auth: true
      }
    ];

    container.innerHTML = endpoints.map(endpoint => `
      <div class="endpoint-item">
        <div class="endpoint-method ${endpoint.method.toLowerCase()}">
          ${endpoint.method}
        </div>
        <div class="endpoint-path">${endpoint.path}</div>
        <div class="endpoint-description">${endpoint.description}</div>
        <div class="endpoint-auth">
          ${endpoint.auth ? '🔐 Требуется авторизация' : '🌐 Публичный доступ'}
        </div>
      </div>
    `).join('');
  }

  /**
   * Запуск API теста
   * @param {string} testType - Тип теста
   * @returns {Promise<void>}
   */
  async runApiTest(testType) {
    const resultsContainer = document.getElementById('testResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="test-loading">Выполнение теста...</div>';
    this.apiStats.requests++;

    try {
      let result;
      let success = true;

      switch (testType) {
        case 'health':
          result = await this.apiService.get('/health');
          break;
          
        case 'tours':
          result = await this.apiService.get('/tours', { limit: 3 });
          break;
          
        case 'stats':
          result = await this.apiService.get('/tours/stats');
          break;
          
        case 'auth':
          if (!this.isAuthenticated) {
            throw new Error('Требуется авторизация');
          }
          result = await this.apiService.get('/users/me');
          break;
      }

      this.apiStats.successes++;
      
      resultsContainer.innerHTML = `
        <div class="test-success">
          <div class="test-header">
            <span class="test-status">✅ Успешно</span>
            <span class="test-time">${new Date().toLocaleTimeString()}</span>
          </div>
          <pre class="test-data"><code>${JSON.stringify(result, null, 2)}</code></pre>
        </div>
      `;
      
    } catch (error) {
      this.apiStats.failures++;
      success = false;
      
      resultsContainer.innerHTML = `
        <div class="test-error">
          <div class="test-header">
            <span class="test-status">❌ Ошибка</span>
            <span class="test-time">${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="test-message">${error.message}</div>
          ${error.data ? `
            <pre class="test-data"><code>${JSON.stringify(error.data, null, 2)}</code></pre>
          ` : ''}
        </div>
      `;
    }

    this.updateApiMonitor();
  }

  /**
   * Обновление монитора API
   * @returns {void}
   */
  updateApiMonitor() {
    const monitor = document.getElementById('apiMonitor');
    if (!monitor) return;

    const successRate = this.apiStats.requests > 0 
      ? Math.round((this.apiStats.successes / this.apiStats.requests) * 100)
      : 0;

    monitor.innerHTML = `
      <div class="monitor-header">
        <h4>📈 Монитор API запросов</h4>
        <span class="success-rate">Успешность: ${successRate}%</span>
      </div>
      <div class="monitor-stats">
        <div class="stat">
          <div class="stat-value">${this.apiStats.requests}</div>
          <div class="stat-label">Всего запросов</div>
        </div>
        <div class="stat">
          <div class="stat-value success">${this.apiStats.successes}</div>
          <div class="stat-label">Успешных</div>
        </div>
        <div class="stat">
          <div class="stat-value error">${this.apiStats.failures}</div>
          <div class="stat-label">Ошибок</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Date.now()}</div>
          <div class="stat-label">Последний запрос</div>
        </div>
      </div>
    `;
  }

  /**
   * Тестирование всех endpoint'ов
   * @returns {Promise<void>}
   */
  async testAllEndpoints() {
    NotificationCenterComponent.info('Запуск полного тестирования API...');
    
    const tests = ['health', 'tours', 'stats'];
    if (this.isAuthenticated) {
      tests.push('auth');
    }
    
    for (const test of tests) {
      await this.runApiTest(test);
      await new Promise(resolve => setTimeout(resolve, 500)); // Задержка между тестами
    }
    
    NotificationCenterComponent.success('Тестирование завершено!');
  }

  /**
   * Загрузка тестовых данных
   * @returns {Promise<void>}
   */
  async loadSampleData() {
    try {
      NotificationCenterComponent.info('Загрузка тестовых данных...');
      
      // Моковые данные для демо
      const sampleTours = [
        {
          id: 1,
          title: 'Отдых в Сочи',
          location: 'Сочи, Россия',
          price: 45000,
          rating: 4.8,
          duration: 7,
          category: 'beach'
        },
        {
          id: 2,
          title: 'Экскурсия по Санкт-Петербургу',
          location: 'Санкт-Петербург, Россия',
          price: 28000,
          rating: 4.9,
          duration: 5,
          category: 'city'
        },
        {
          id: 3,
          title: 'Поход в горы Алтая',
          location: 'Алтай, Россия',
          price: 35000,
          rating: 4.7,
          duration: 10,
          category: 'mountain'
        }
      ];
      
      this.displayTours(sampleTours);
      NotificationCenterComponent.success('Тестовые данные загружены!');
      
    } catch (error) {
      console.error('Ошибка загрузки тестовых данных:', error);
      NotificationCenterComponent.error('Ошибка загрузки данных');
    }
  }

  /**
   * Загрузка данных пользователя
   * @returns {Promise<void>}
   */
  async loadUserData() {
    if (!this.isAuthenticated) {
      NotificationCenterComponent.warning('Требуется авторизация');
      return;
    }
    
    try {
      NotificationCenterComponent.info('Загрузка данных пользователя...');
      
      // Загружаем профиль, избранное и бронирования
      const [profile, favorites, bookings] = await Promise.all([
        this.apiService.getProfile(),
        this.apiService.getFavoriteTours(),
        this.apiService.getUserBookings()
      ]);
      
      // Обновляем текущего пользователя
      this.currentUser = profile.data.user;
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      
      // Показываем результаты
      this.displayUserData(profile, favorites, bookings);
      
      NotificationCenterComponent.success('Данные пользователя загружены!');
      
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      NotificationCenterComponent.error('Ошибка загрузки данных');
    }
  }

  /**
   * Загрузка демо туров
   * @returns {Promise<void>}
   */
  async loadToursDemo() {
    try {
      NotificationCenterComponent.info('Загрузка туров...');
      
      const response = await this.apiService.getTours({ limit: 5 });
      this.displayTours(response.data.tours);
      
      NotificationCenterComponent.success('Туры загружены!');
      
    } catch (error) {
      console.error('Ошибка загрузки туров:', error);
      NotificationCenterComponent.error('Ошибка загрузки туров');
    }
  }

  /**
   * Загрузка избранных туров
   * @returns {Promise<void>}
   */
  async loadFavoriteTours() {
    if (!this.isAuthenticated) {
      NotificationCenterComponent.warning('Требуется авторизация');
      return;
    }
    
    try {
      NotificationCenterComponent.info('Загрузка избранных туров...');
      
      const response = await this.apiService.getFavoriteTours();
      this.displayTours(response.data.tours, 'Избранные туры');
      
      NotificationCenterComponent.success('Избранные туры загружены!');
      
    } catch (error) {
      console.error('Ошибка загрузки избранных туров:', error);
      NotificationCenterComponent.error('Ошибка загрузки избранного');
    }
  }

  /**
   * Загрузка бронирований пользователя
   * @returns {Promise<void>}
   */
  async loadUserBookings() {
    if (!this.isAuthenticated) {
      NotificationCenterComponent.warning('Требуется авторизация');
      return;
    }
    
    try {
      NotificationCenterComponent.info('Загрузка бронирований...');
      
      const response = await this.apiService.getUserBookings();
      this.displayBookings(response.data.bookings);
      
      NotificationCenterComponent.success('Бронирования загружены!');
      
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      NotificationCenterComponent.error('Ошибка загрузки бронирований');
    }
  }

  /**
   * Создание тестового бронирования
   * @returns {Promise<void>}
   */
  async createTestBooking() {
    if (!this.isAuthenticated) {
      NotificationCenterComponent.warning('Требуется авторизация');
      return;
    }
    
    try {
      NotificationCenterComponent.info('Создание тестового бронирования...');
      
      // Создаем тестовое бронирование
      const bookingData = {
        tour: '65a1b2c3d4e5f67890123456', // Моковый ID тура
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Через 30 дней
        participants: 2,
        specialRequests: 'Тестовое бронирование из демо'
      };
      
      const response = await this.apiService.createBooking(bookingData);
      
      NotificationCenterComponent.success('Тестовое бронирование создано!');
      console.log('Бронирование создано:', response);
      
    } catch (error) {
      console.error('Ошибка создания бронирования:', error);
      NotificationCenterComponent.error('Ошибка создания бронирования');
    }
  }

  /**
   * Обновление профиля (демо)
   * @returns {Promise<void>}
   */
  async updateProfileDemo() {
    if (!this.isAuthenticated) {
      NotificationCenterComponent.warning('Требуется авторизация');
      return;
    }
    
    try {
      NotificationCenterComponent.info('Обновление профиля...');
      
      const newName = prompt('Введите новое имя:', this.currentUser?.name);
      if (!newName) return;
      
      const response = await this.apiService.updateProfile({ name: newName });
      
      // Обновляем локальные данные
      this.currentUser = response.data.user;
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
      
      // Обновляем отображение
      document.getElementById('profileName').textContent = newName;
      
      NotificationCenterComponent.success('Профиль обновлен!');
      
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      NotificationCenterComponent.error('Ошибка обновления профиля');
    }
  }

  /**
   * Обновление auth токена
   * @returns {Promise<void>}
   */
  async refreshAuthToken() {
    try {
      NotificationCenterComponent.info('Обновление токена...');
      
      // В реальном приложении здесь был бы вызов API
      // Для демо просто обновляем время
      const newToken = 'refreshed_token_' + Date.now();
      this.apiService.setAuthToken(newToken, newToken + '_refresh');
      
      NotificationCenterComponent.success('Токен обновлен!');
      
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      NotificationCenterComponent.error('Ошибка обновления токена');
    }
  }

  /**
   * Отображение туров
   * @param {Array} tours - Список туров
   * @param {string} title - Заголовок
   * @returns {void}
   */
  displayTours(tours, title = 'Загруженные туры') {
    const container = document.getElementById('toursContainer');
    if (!container) return;
    
    const toursHtml = tours.map(tour => `
      <div class="tour-item">
        <div class="tour-header">
          <h5>${tour.title}</h5>
          <span class="tour-price">${tour.price?.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="tour-details">
          <span class="detail">📍 ${tour.location}</span>
          <span class="detail">⭐ ${tour.rating || tour.ratingsAverage || 4.5}</span>
          <span class="detail">📅 ${tour.duration} дн.</span>
          <span class="detail">🏷️ ${tour.category}</span>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="tours-list">
        <h4>${title}</h4>
        <div class="tours-grid">
          ${toursHtml}
        </div>
        <button class="btn btn-text" onclick="this.closest('.tours-list').remove()">
          ✕ Скрыть
        </button>
      </div>
    `;
  }

  /**
   * Отображение бронирований
   * @param {Array} bookings - Список бронирований
   * @returns {void}
   */
  displayBookings(bookings) {
    const container = document.getElementById('bookingsContainer');
    if (!container) return;
    
    const bookingsHtml = (bookings || []).map(booking => `
      <div class="booking-item">
        <div class="booking-header">
          <h5>${booking.tour?.title || 'Тур'}</h5>
          <span class="booking-status ${booking.status}">${booking.status}</span>
        </div>
        <div class="booking-details">
          <span class="detail">📅 ${new Date(booking.startDate).toLocaleDateString('ru-RU')}</span>
          <span class="detail">👥 ${booking.participants} чел.</span>
          <span class="detail">💰 ${booking.totalPrice?.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="bookings-list">
        <h4>Мои бронирования</h4>
        ${bookingsHtml || '<p>Нет бронирований</p>'}
        <button class="btn btn-text" onclick="this.closest('.bookings-list').remove()">
          ✕ Скрыть
        </button>
      </div>
    `;
  }

  /**
   * Отображение данных пользователя
   * @param {Object} profile - Профиль
   * @param {Object} favorites - Избранное
   * @param {Object} bookings - Бронирования
   * @returns {void}
   */
  displayUserData(profile, favorites, bookings) {
    // Обновляем несколько секций
    this.displayTours(favorites.data?.tours || [], 'Избранные туры');
    this.displayBookings(bookings.data?.bookings || []);
    
    // Обновляем профиль
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer && profile.data?.user) {
      const user = profile.data.user;
      profileContainer.querySelector('#profileName').textContent = user.name;
      profileContainer.querySelector('#profileEmail').textContent = user.email;
      profileContainer.querySelector('#profileRole').textContent = user.role;
    }
  }

  /**
   * Перерисовка компонента
   * @returns {void}
   */
  rerender() {
    const container = document.querySelector('.day12-container');
    if (container) {
      // Обновляем состояние
      this.isAuthenticated = AuthComponent.isAuthenticated();
      this.currentUser = AuthComponent.getCurrentUser();
      
      container.innerHTML = this.render();
      this.afterRender();
    }
  }

  /**
   * Статический метод для инициализации
   * @param {string} containerSelector - Селектор контейнера
   * @returns {Day12Component} Экземпляр компонента
   */
  static init(containerSelector) {
    const day12 = new Day12Component();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = day12.render();
      day12.afterRender();
    }
    
    return day12;
  }
}

export default Day12Component;