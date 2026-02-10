class ApiService {
    constructor() {
        this.baseUrl = 'https://api.travelwave.com/v1';
        this.simulateNetwork = true;
    }

    // Общий метод для запросов
    async request(endpoint, method = 'GET', data = null) {
        // Имитация сетевой задержки
        if (this.simulateNetwork) {
            await this.simulateDelay();
            
            // Имитация случайных ошибок (10% chance)
            if (Math.random() < 0.1) {
                throw new Error('Сетевая ошибка. Пожалуйста, попробуйте снова.');
            }
        }
        
        // Получение данных из localStorage в зависимости от endpoint
        return this.handleMockRequest(endpoint, method, data);
    }

    // Обработка мок-запросов
    handleMockRequest(endpoint, method, data) {
        switch (endpoint) {
            case '/tours':
                return this.handleToursRequest(method, data);
            case '/auth/login':
                return this.handleLoginRequest(data);
            case '/auth/register':
                return this.handleRegisterRequest(data);
            case '/orders':
                return this.handleOrdersRequest(method, data);
            case '/reviews':
                return this.handleReviewsRequest(method, data);
            default:
                throw new Error(`Endpoint ${endpoint} not found`);
        }
    }

    // Обработка запросов туров
    handleToursRequest(method, data) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: tours,
                    total: tours.length
                };
            case 'POST':
                const newTour = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                tours.push(newTour);
                localStorage.setItem('tours', JSON.stringify(tours));
                return {
                    success: true,
                    data: newTour,
                    message: 'Тур успешно создан'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Обработка входа
    handleLoginRequest(data) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.email === data.email && u.password === data.password
        );
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                data: {
                    user: userWithoutPassword,
                    token: this.generateMockToken()
                }
            };
        }
        
        return {
            success: false,
            error: 'Неверный email или пароль'
        };
    }

    // Обработка регистрации
    handleRegisterRequest(data) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Проверка на существующего пользователя
        if (users.some(u => u.email === data.email)) {
            return {
                success: false,
                error: 'Пользователь с таким email уже существует'
            };
        }
        
        const newUser = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        const { password, ...userWithoutPassword } = newUser;
        
        return {
            success: true,
            data: {
                user: userWithoutPassword,
                token: this.generateMockToken()
            }
        };
    }

    // Обработка заказов
    handleOrdersRequest(method, data) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: orders,
                    total: orders.length
                };
            case 'POST':
                const newOrder = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    ...data,
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                };
                orders.push(newOrder);
                localStorage.setItem('orders', JSON.stringify(orders));
                return {
                    success: true,
                    data: newOrder,
                    message: 'Заказ успешно создан'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Обработка отзывов
    handleReviewsRequest(method, data) {
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: reviews,
                    total: reviews.length
                };
            case 'POST':
                const newReview = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString(),
                    approved: false
                };
                reviews.push(newReview);
                localStorage.setItem('reviews', JSON.stringify(reviews));
                return {
                    success: true,
                    data: newReview,
                    message: 'Отзыв успешно добавлен'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Генерация мок-токена
    generateMockToken() {
        return 'mock-jwt-token-' + Date.now() + '-' + Math.random().toString(36).substr(2);
    }

    // Имитация задержки сети
    simulateDelay(min = 200, max = 800) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Установка симуляции сети
    setNetworkSimulation(enabled) {
        this.simulateNetwork = enabled;
    }
}

export default ApiService;

/**
 * @fileoverview Сервис для работы с API бэкенда
 * @module services/api
 */

import NotificationCenterComponent from '../components/notification-center/notification-center.component.js';

/**
 * Класс для работы с API
 * @class ApiService
 */
class ApiService {
  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:5000/api/v1';
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  /**
   * Установка токена авторизации
   * @param {string} token - JWT токен
   * @param {string} refreshToken - Refresh токен
   */
  setAuthToken(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Очистка токенов авторизации
   */
  clearAuthToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Общий метод для запросов к API
   * @param {string} endpoint - Конечная точка API
   * @param {Object} options - Опции запроса
   * @returns {Promise<any>} Результат запроса
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // Обработка 401 ошибки (просроченный токен)
      if (response.status === 401 && this.refreshToken) {
        try {
          const newToken = await this.refreshAuthToken();
          if (newToken) {
            defaultOptions.headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, defaultOptions);
            return await this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          console.error('Ошибка обновления токена:', refreshError);
          this.clearAuthToken();
          window.location.hash = '#/login';
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
      }

      return await this.handleResponse(response);
      
    } catch (error) {
      console.error(`API ошибка (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Обработка ответа от API
   * @param {Response} response - Ответ от fetch
   * @returns {Promise<any>} Данные ответа
   */
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Обновление токена авторизации
   * @returns {Promise<string|null>} Новый токен
   */
  async refreshAuthToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить токен');
      }

      const data = await response.json();
      this.setAuthToken(data.token, data.refreshToken);
      return data.token;
      
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      this.clearAuthToken();
      return null;
    }
  }

  /**
   * GET запрос
   * @param {string} endpoint - Конечная точка API
   * @param {Object} params - Параметры запроса
   * @returns {Promise<any>} Результат запроса
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  /**
   * POST запрос
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для отправки
   * @returns {Promise<any>} Результат запроса
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT запрос
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для обновления
   * @returns {Promise<any>} Результат запроса
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH запрос
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для частичного обновления
   * @returns {Promise<any>} Результат запроса
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE запрос
   * @param {string} endpoint - Конечная точка API
   * @returns {Promise<any>} Результат запроса
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Загрузка файла
   * @param {string} endpoint - Конечная точка API
   * @param {FormData} formData - Данные формы с файлом
   * @returns {Promise<any>} Результат запроса
   */
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
  }

  // === Аутентификация ===
  
  /**
   * Регистрация пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<any>} Результат регистрации
   */
  async register(userData) {
    const data = await this.post('/auth/register', userData);
    if (data.token) {
      this.setAuthToken(data.token, data.refreshToken);
    }
    return data;
  }

  /**
   * Вход пользователя
   * @param {Object} credentials - Данные для входа
   * @returns {Promise<any>} Результат входа
   */
  async login(credentials) {
    const data = await this.post('/auth/login', credentials);
    if (data.token) {
      this.setAuthToken(data.token, data.refreshToken);
    }
    return data;
  }

  /**
   * Выход пользователя
   * @returns {Promise<any>} Результат выхода
   */
  async logout() {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearAuthToken();
    }
  }

  /**
   * Получение профиля текущего пользователя
   * @returns {Promise<any>} Профиль пользователя
   */
  async getProfile() {
    return this.get('/users/me');
  }

  /**
   * Обновление профиля пользователя
   * @param {Object} userData - Новые данные пользователя
   * @returns {Promise<any>} Обновленный профиль
   */
  async updateProfile(userData) {
    return this.patch('/users/update-me', userData);
  }

  // === Туры ===
  
  /**
   * Получение всех туров с фильтрацией
   * @param {Object} filters - Фильтры для поиска
   * @returns {Promise<any>} Список туров
   */
  async getTours(filters = {}) {
    return this.get('/tours', filters);
  }

  /**
   * Получение одного тура по ID
   * @param {string} id - ID тура
   * @returns {Promise<any>} Данные тура
   */
  async getTour(id) {
    return this.get(`/tours/${id}`);
  }

  /**
   * Получение топ-5 туров
   * @returns {Promise<any>} Список популярных туров
   */
  async getTopTours() {
    return this.get('/tours/top-5-tours');
  }

  /**
   * Добавление тура в избранное
   * @param {string} tourId - ID тура
   * @returns {Promise<any>} Результат операции
   */
  async addToFavorites(tourId) {
    return this.post(`/tours/${tourId}/favorite`);
  }

  /**
   * Удаление тура из избранного
   * @param {string} tourId - ID тура
   * @returns {Promise<any>} Результат операции
   */
  async removeFromFavorites(tourId) {
    return this.delete(`/tours/${tourId}/favorite`);
  }

  /**
   * Получение избранных туров
   * @returns {Promise<any>} Список избранных туров
   */
  async getFavoriteTours() {
    return this.get('/tours/me/favorites');
  }

  // === Бронирования ===
  
  /**
   * Создание бронирования
   * @param {Object} bookingData - Данные бронирования
   * @returns {Promise<any>} Результат бронирования
   */
  async createBooking(bookingData) {
    return this.post('/bookings', bookingData);
  }

  /**
   * Получение бронирований пользователя
   * @returns {Promise<any>} Список бронирований
   */
  async getUserBookings() {
    return this.get('/bookings/my-bookings');
  }

  /**
   * Отмена бронирования
   * @param {string} bookingId - ID бронирования
   * @returns {Promise<any>} Результат отмены
   */
  async cancelBooking(bookingId) {
    return this.patch(`/bookings/${bookingId}/cancel`);
  }

  // === Отзывы ===
  
  /**
   * Создание отзыва
   * @param {string} tourId - ID тура
   * @param {Object} reviewData - Данные отзыва
   * @returns {Promise<any>} Созданный отзыв
   */
  async createReview(tourId, reviewData) {
    return this.post(`/tours/${tourId}/reviews`, reviewData);
  }

  /**
   * Получение отзывов пользователя
   * @returns {Promise<any>} Список отзывов
   */
  async getUserReviews() {
    return this.get('/reviews/my-reviews');
  }

  /**
   * Статистика API
   * @returns {Object} Статистика использования
   */
  getStats() {
    // Можно добавить сбор статистики запросов
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
  }

  /**
   * Проверка соединения с сервером
   * @returns {Promise<boolean>} Доступен ли сервер
   */
  async checkConnection() {
    try {
      await fetch(`${this.baseURL}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('Сервер недоступен:', error);
      return false;
    }
  }
}

// Создание синглтона
const apiService = new ApiService();

// Глобальный обработчик ошибок API
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.status === 401) {
    apiService.clearAuthToken();
    NotificationCenterComponent.error('Сессия истекла. Пожалуйста, войдите снова.');
    window.location.hash = '#/login';
  } else if (event.reason?.status === 500) {
    NotificationCenterComponent.error('Ошибка сервера. Пожалуйста, попробуйте позже.');
  }
});

export default apiService;