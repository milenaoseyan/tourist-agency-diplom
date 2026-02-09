/**
 * @fileoverview Система типов TypeScript-like для JavaScript
 * @module core/types
 */

/**
 * Декоратор для проверки типов во время выполнения
 * @param {Object} typeSchema - Схема типов
 * @returns {Function} Декоратор
 */
function TypeCheck(typeSchema) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      // Проверка аргументов
      if (typeSchema.params) {
        args.forEach((arg, index) => {
          const expectedType = typeSchema.params[index];
          if (expectedType && !checkType(arg, expectedType)) {
            throw new TypeError(
              `Аргумент ${index} функции ${propertyKey}: ` +
              `ожидается ${expectedType}, получен ${typeof arg}`
            );
          }
        });
      }
      
      const result = originalMethod.apply(this, args);
      
      // Проверка возвращаемого значения
      if (typeSchema.returns && !checkType(result, typeSchema.returns)) {
        throw new TypeError(
          `Возвращаемое значение функции ${propertyKey}: ` +
          `ожидается ${typeSchema.returns}, получен ${typeof result}`
        );
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Проверка типа значения
 * @param {any} value - Проверяемое значение
 * @param {string} type - Ожидаемый тип
 * @returns {boolean} Соответствует ли тип
 */
function checkType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'function':
      return typeof value === 'function';
    case 'null':
      return value === null;
    case 'undefined':
      return value === undefined;
    case 'any':
      return true;
    default:
      if (type.startsWith('Array<') && type.endsWith('>')) {
        const itemType = type.slice(6, -1);
        return Array.isArray(value) && value.every(item => checkType(item, itemType));
      }
      return false;
  }
}

/**
 * Интерфейс для компонентов
 * @interface IComponent
 */
class IComponent {
  /**
   * Рендеринг компонента
   * @abstract
   * @returns {string} HTML строка
   */
  render() {
    throw new Error('Метод render должен быть реализован');
  }

  /**
   * Инициализация после рендеринга
   * @abstract
   * @returns {void}
   */
  afterRender() {
    throw new Error('Метод afterRender должен быть реализован');
  }
}

/**
 * Интерфейс для сервисов
 * @interface IService
 */
class IService {
  /**
   * Инициализация сервиса
   * @abstract
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error('Метод init должен быть реализован');
  }

  /**
   * Очистка ресурсов
   * @abstract
   * @returns {void}
   */
  cleanup() {
    throw new Error('Метод cleanup должен быть реализован');
  }
}

/**
 * Декоратор для синглтона
 * @returns {Function} Декоратор класса
 */
function Singleton() {
  return function(target) {
    let instance = null;
    
    return new Proxy(target, {
      construct: function(newTarget, args) {
        if (!instance) {
          instance = new newTarget(...args);
        }
        return instance;
      }
    });
  };
}

/**
 * Декоратор для автобиндинга контекста
 * @returns {Function} Декоратор метода
 */
function AutoBind() {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Декоратор для дебаунса
 * @param {number} delay - Задержка в миллисекундах
 * @returns {Function} Декоратор метода
 */
function Debounce(delay = 300) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    let timeoutId = null;
    
    descriptor.value = function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };
    
    return descriptor;
  };
}

/**
 * Декоратор для троттлинга
 * @param {number} limit - Лимит времени в миллисекундах
 * @returns {Function} Декоратор метода
 */
function Throttle(limit = 300) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    let inThrottle = false;
    
    descriptor.value = function(...args) {
      if (!inThrottle) {
        originalMethod.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
    
    return descriptor;
  };
}

/**
 * Типизированный EventEmitter
 * @template T
 */
class TypedEventEmitter {
  constructor() {
    /** @type {Object.<string, Function[]>} */
    this.events = {};
  }

  /**
   * Подписка на событие
   * @param {string} event - Название события
   * @param {Function} listener - Функция-обработчик
   * @returns {Function} Функция для отписки
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    
    return () => this.off(event, listener);
  }

  /**
   * Отписка от события
   * @param {string} event - Название события
   * @param {Function} listener - Функция-обработчик
   * @returns {void}
   */
  off(event, listener) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  /**
   * Одноразовая подписка
   * @param {string} event - Название события
   * @param {Function} listener - Функция-обработчик
   * @returns {void}
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
  }

  /**
   * Эмит события
   * @param {string} event - Название события
   * @param {...any} args - Аргументы
   * @returns {void}
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Ошибка в обработчике события ${event}:`, error);
      }
    });
  }
}

/**
 * Типизированный Store (аналог Redux)
 * @template StateType
 * @template ActionType
 */
class TypedStore {
  /**
   * @param {StateType} initialState - Начальное состояние
   * @param {Function} reducer - Редьюсер
   */
  constructor(initialState, reducer) {
    /** @type {StateType} */
    this.state = initialState;
    /** @type {Function} */
    this.reducer = reducer;
    /** @type {Function[]} */
    this.listeners = [];
    /** @type {ActionType[]} */
    this.actionHistory = [];
  }

  /**
   * Диспатч экшена
   * @param {ActionType} action - Экшен
   * @returns {void}
   */
  @TypeCheck({ params: ['object'], returns: 'void' })
  dispatch(action) {
    this.actionHistory.push(action);
    const prevState = this.state;
    this.state = this.reducer(this.state, action);
    
    // Оповещаем слушателей если состояние изменилось
    if (this.state !== prevState) {
      this.listeners.forEach(listener => listener(this.state, action));
    }
  }

  /**
   * Подписка на изменения
   * @param {Function} listener - Функция-слушатель
   * @returns {Function} Функция для отписки
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Получение текущего состояния
   * @returns {StateType} Текущее состояние
   */
  getState() {
    return this.state;
  }

  /**
   * Получение истории экшенов
   * @returns {ActionType[]} История экшенов
   */
  getActionHistory() {
    return [...this.actionHistory];
  }
}

/**
 * Типизированный HTTP клиент
 */
class TypedHttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * GET запрос
   * @template T
   * @param {string} url - URL
   * @param {Object} [options] - Опции запроса
   * @returns {Promise<T>} Результат запроса
   */
  @TypeCheck({ params: ['string', 'object'], returns: 'Promise' })
  async get(url, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * POST запрос
   * @template T
   * @param {string} url - URL
   * @param {any} data - Данные
   * @param {Object} [options] - Опции запроса
   * @returns {Promise<T>} Результат запроса
   */
  @TypeCheck({ params: ['string', 'any', 'object'], returns: 'Promise' })
  async post(url, data, options = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * PUT запрос
   * @template T
   * @param {string} url - URL
   * @param {any} data - Данные
   * @param {Object} [options] - Опции запроса
   * @returns {Promise<T>} Результат запроса
   */
  async put(url, data, options = {}) {
    return this._request('PUT', url, data, options);
  }

  /**
   * DELETE запрос
   * @template T
   * @param {string} url - URL
   * @param {Object} [options] - Опции запроса
   * @returns {Promise<T>} Результат запроса
   */
  async delete(url, options = {}) {
    return this._request('DELETE', url, null, options);
  }

  /**
   * Общий метод для запросов
   * @private
   * @param {string} method - HTTP метод
   * @param {string} url - URL
   * @param {any} data - Данные
   * @param {Object} options - Опции запроса
   * @returns {Promise<any>} Результат запроса
   */
  async _request(method, url, data = null, options = {}) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseURL}${url}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
}

/**
 * Валидатор данных
 */
class DataValidator {
  /**
   * Валидация по схеме
   * @param {any} data - Данные для валидации
   * @param {Object} schema - Схема валидации
   * @returns {Object} Результат валидации
   */
  static validate(data, schema) {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push({ field: key, error: 'Обязательное поле' });
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push({ 
            field: key, 
            error: `Ожидается тип ${rules.type}, получен ${typeof value}` 
          });
        }
        
        if (rules.min !== undefined && value < rules.min) {
          errors.push({ 
            field: key, 
            error: `Минимальное значение: ${rules.min}` 
          });
        }
        
        if (rules.max !== undefined && value > rules.max) {
          errors.push({ 
            field: key, 
            error: `Максимальное значение: ${rules.max}` 
          });
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({ 
            field: key, 
            error: 'Не соответствует шаблону' 
          });
        }
        
        if (rules.custom && !rules.custom(value)) {
          errors.push({ 
            field: key, 
            error: 'Не проходит кастомную валидацию' 
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? data : null
    };
  }
}

// Экспорт всех утилит
export {
  TypeCheck,
  IComponent,
  IService,
  Singleton,
  AutoBind,
  Debounce,
  Throttle,
  TypedEventEmitter,
  TypedStore,
  TypedHttpClient,
  DataValidator
};