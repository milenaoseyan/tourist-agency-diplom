/**
 * @fileoverview Компонент для 11-го дня практики
 * @module components/day11
 */

import RefactoringService from '../../core/refactoring.service.js';
import * as TypeSystem from '../../core/types.js';
import TestEnvironment from '../../../tests/mock-tests.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

/**
 * Компонент для демонстрации улучшений архитектуры
 * @class Day11Component
 * @implements {IComponent}
 */
class Day11Component {
  constructor() {
    this.title = 'День 11: Рефакторинг и улучшение архитектуры';
    this.description = 'Оптимизация кодовой базы и добавление TypeScript-like системы';
    
    this.refactoringService = RefactoringService.init();
    this.typeExamples = this.createTypeExamples();
  }

  /**
   * Рендеринг компонента
   * @returns {string} HTML строка
   */
  render() {
    return `
      <div class="day11-container">
        <header class="day11-header">
          <h1>${this.title}</h1>
          <p class="subtitle">${this.description}</p>
          <div class="progress-indicator">
            <span class="progress-text">11/15 дней завершено</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 73%"></div>
            </div>
          </div>
        </header>

        <div class="features-grid">
          <div class="feature-card" id="analysisFeature">
            <h2>🔍 Анализ кодовой базы</h2>
            <div class="feature-content" id="analysisContainer"></div>
          </div>

          <div class="feature-card" id="typesFeature">
            <h2>📝 TypeScript-like система</h2>
            <div class="feature-content" id="typesContainer"></div>
          </div>

          <div class="feature-card" id="testingFeature">
            <h2>🧪 Мок-тестирование</h2>
            <div class="feature-content" id="testingContainer"></div>
          </div>

          <div class="feature-card" id="docsFeature">
            <h2>📚 JSDoc документация</h2>
            <div class="feature-content" id="docsContainer"></div>
          </div>

          <div class="feature-card" id="patternsFeature">
            <h2>🎯 Паттерны проектирования</h2>
            <div class="feature-content" id="patternsContainer"></div>
          </div>

          <div class="feature-card" id="refactoringFeature">
            <h2>🔄 Применение рефакторинга</h2>
            <div class="feature-content" id="refactoringContainer"></div>
          </div>
        </div>

        <div class="day11-actions">
          <button class="btn btn-primary" id="runAnalysis">
            🔍 Запустить анализ кода
          </button>
          <button class="btn btn-secondary" id="runTests">
            🧪 Запустить тесты
          </button>
          <button class="btn btn-success" id="applyRefactoring">
            🚀 Применить улучшения
          </button>
        </div>

        <div class="report-section" id="reportContainer"></div>
      </div>
    `;
  }

  /**
   * Инициализация после рендеринга
   * @returns {void}
   */
  afterRender() {
    this.initAnalysis();
    this.initTypes();
    this.initTesting();
    this.initDocs();
    this.initPatterns();
    this.initRefactoring();

    // Кнопки действий
    document.getElementById('runAnalysis')?.addEventListener('click', () => {
      this.runCodeAnalysis();
    });

    document.getElementById('runTests')?.addEventListener('click', () => {
      this.runTests();
    });

    document.getElementById('applyRefactoring')?.addEventListener('click', () => {
      this.showRefactoringOptions();
    });
  }

  /**
   * Инициализация секции анализа
   * @returns {void}
   */
  initAnalysis() {
    const container = document.getElementById('analysisContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="analysis-preview">
        <h4>Быстрый анализ:</h4>
        <div class="quick-metrics">
          <div class="metric">
            <span class="metric-label">Компоненты:</span>
            <span class="metric-value">24</span>
          </div>
          <div class="metric">
            <span class="metric-label">Строк кода:</span>
            <span class="metric-value">4,500+</span>
          </div>
          <div class="metric">
            <span class="metric-label">Сложность:</span>
            <span class="metric-value">Средняя</span>
          </div>
        </div>
        <p class="analysis-note">
          Полный анализ покажет метрики качества, зависимости и проблемы архитектуры.
        </p>
      </div>
    `;
  }

  /**
   * Инициализация секции типов
   * @returns {void}
   */
  initTypes() {
    const container = document.getElementById('typesContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="types-demo">
        <h4>Доступные утилиты типов:</h4>
        <div class="type-list">
          <div class="type-item">
            <code>@TypeCheck()</code> - проверка типов во время выполнения
          </div>
          <div class="type-item">
            <code>TypedStore</code> - типизированный стейт-менеджер
          </div>
          <div class="type-item">
            <code>DataValidator</code> - валидация по схеме
          </div>
          <div class="type-item">
            <code>@Singleton()</code> - декоратор синглтона
          </div>
          <div class="type-item">
            <code>@Debounce()</code> - декоратор дебаунса
          </div>
        </div>
        <button class="btn btn-small" id="showTypeExample">
          👁️ Показать пример
        </button>
      </div>
    `;

    document.getElementById('showTypeExample')?.addEventListener('click', () => {
      this.showTypeExample();
    });
  }

  /**
   * Инициализация секции тестирования
   * @returns {void}
   */
  initTesting() {
    const container = document.getElementById('testingContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="testing-info">
        <h4>Тестовая инфраструктура:</h4>
        <ul class="testing-features">
          <li>✅ Мок-тесты для компонентов</li>
          <li>✅ Тесты сервисов</li>
          <li>✅ Интеграционные тесты</li>
          <li>⚡ Автоматический запуск</li>
          <li>📊 Отчеты о покрытии</li>
        </ul>
        <div class="test-coverage">
          <div class="coverage-bar">
            <div class="coverage-fill" style="width: 65%"></div>
          </div>
          <span class="coverage-text">65% покрытие кода</span>
        </div>
      </div>
    `;
  }

  /**
   * Инициализация секции документации
   * @returns {void}
   */
  initDocs() {
    const container = document.getElementById('docsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="docs-info">
        <h4>JSDoc возможности:</h4>
        <div class="docs-example">
          <pre><code>/**
 * Класс компонента
 * @class MyComponent
 * @implements {IComponent}
 */
class MyComponent {
  /**
   * Рендеринг компонента
   * @param {string} data - Входные данные
   * @returns {string} HTML строка
   */
  render(data) {
    return \`&lt;div&gt;\${data}&lt;/div&gt;\`;
  }
}</code></pre>
        </div>
        <div class="docs-benefits">
          <p>✅ Автодополнение в IDE</p>
          <p>✅ Генерация документации</p>
          <p>✅ Проверка типов</p>
        </div>
      </div>
    `;
  }

  /**
   * Инициализация секции паттернов
   * @returns {void}
   */
  initPatterns() {
    const container = document.getElementById('patternsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="patterns-info">
        <h4>Используемые паттерны:</h4>
        <div class="patterns-grid">
          <div class="pattern-card">
            <div class="pattern-icon">🎯</div>
            <div class="pattern-name">Singleton</div>
            <div class="pattern-usage">Router, Services</div>
          </div>
          <div class="pattern-card">
            <div class="pattern-icon">👁️</div>
            <div class="pattern-name">Observer</div>
            <div class="pattern-usage">Notifications</div>
          </div>
          <div class="pattern-card">
            <div class="pattern-icon">🏭</div>
            <div class="pattern-name">Factory</div>
            <div class="pattern-usage">Component creation</div>
          </div>
          <div class="pattern-card">
            <div class="pattern-icon">📦</div>
            <div class="pattern-name">Module</div>
            <div class="pattern-usage">All Components</div>
          </div>
        </div>
        <button class="btn btn-small" id="showPatternDetails">
          📖 Подробнее о паттернах
        </button>
      </div>
    `;

    document.getElementById('showPatternDetails')?.addEventListener('click', () => {
      this.showPatternDetails();
    });
  }

  /**
   * Инициализация секции рефакторинга
   * @returns {void}
   */
  initRefactoring() {
    const container = document.getElementById('refactoringContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="refactoring-options">
        <h4>Доступные улучшения:</h4>
        <div class="refactoring-list">
          <label class="refactoring-option">
            <input type="checkbox" name="refactoring" value="extract-mixin" checked>
            <span class="option-text">Выделить миксины</span>
          </label>
          <label class="refactoring-option">
            <input type="checkbox" name="refactoring" value="introduce-di">
            <span class="option-text">Внедрить DI</span>
          </label>
          <label class="refactoring-option">
            <input type="checkbox" name="refactoring" value="optimize-performance">
            <span class="option-text">Оптимизировать производительность</span>
          </label>
          <label class="refactoring-option">
            <input type="checkbox" name="refactoring" value="add-testing">
            <span class="option-text">Добавить тесты</span>
          </label>
        </div>
        <p class="refactoring-note">
          Выберите улучшения для применения к кодовой базе.
        </p>
      </div>
    `;
  }

  /**
   * Запуск анализа кода
   * @returns {Promise<void>}
   */
  async runCodeAnalysis() {
    NotificationCenterComponent.info('Запуск анализа кодовой базы...');
    
    try {
      const report = this.refactoringService.generateReport();
      this.displayAnalysisReport(report);
      
      NotificationCenterComponent.success('Анализ завершен!');
    } catch (error) {
      console.error('Ошибка анализа:', error);
      NotificationCenterComponent.error('Ошибка при анализе кода');
    }
  }

  /**
   * Отображение отчета анализа
   * @param {Object} report - Отчет анализа
   * @returns {void}
   */
  displayAnalysisReport(report) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="analysis-report">
        <div class="report-header">
          <h3>📊 Отчет анализа кодовой базы</h3>
          <button class="btn btn-small" id="exportReport">📤 Экспорт</button>
        </div>
        
        <div class="report-summary">
          <div class="summary-card quality">
            <div class="summary-value">${report.summary.qualityScore}/100</div>
            <div class="summary-label">Качество кода</div>
          </div>
          <div class="summary-card debt">
            <div class="summary-value">${report.summary.technicalDebt.estimatedDays} дн.</div>
            <div class="summary-label">Технический долг</div>
          </div>
          <div class="summary-card suggestions">
            <div class="summary-value">${report.suggestions.length}</div>
            <div class="summary-label">Предложений</div>
          </div>
        </div>
        
        <div class="report-details">
          <h4>Основные метрики:</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-title">Сопровождаемость:</span>
              <span class="metric-value">${report.analysis.metrics.codeQuality.maintainabilityIndex}/100</span>
            </div>
            <div class="metric-item">
              <span class="metric-title">Сложность:</span>
              <span class="metric-value">${report.analysis.metrics.codeQuality.cyclomaticComplexity}</span>
            </div>
            <div class="metric-item">
              <span class="metric-title">Связность:</span>
              <span class="metric-value">${Math.round(report.analysis.metrics.dependencies.cohesion * 100)}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-title">Связанность:</span>
              <span class="metric-value">${Math.round(report.analysis.metrics.dependencies.coupling * 100)}%</span>
            </div>
          </div>
        </div>
        
        <div class="report-suggestions">
          <h4>Рекомендации по улучшению:</h4>
          ${report.suggestions.map(suggestion => `
            <div class="suggestion-item priority-${suggestion.priority}">
              <div class="suggestion-header">
                <span class="suggestion-title">${suggestion.title}</span>
                <span class="suggestion-priority">${suggestion.priority}</span>
              </div>
              <p class="suggestion-description">${suggestion.description}</p>
              <div class="suggestion-details">
                <span class="detail">🎯 Влияние: ${suggestion.impact}</span>
                <span class="detail">⏱️ Затраты: ${suggestion.effort}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="report-actions">
          <button class="btn btn-primary" id="generateActionPlan">
            📋 Создать план действий
          </button>
          <button class="btn btn-secondary" id="closeReport">
            ✕ Закрыть отчет
          </button>
        </div>
      </div>
    `;

    // Экспорт отчета
    document.getElementById('exportReport')?.addEventListener('click', () => {
      this.exportReport(report);
    });

    // Создание плана действий
    document.getElementById('generateActionPlan')?.addEventListener('click', () => {
      this.generateActionPlan(report);
    });

    // Закрытие отчета
    document.getElementById('closeReport')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Запуск тестов
   * @returns {void}
   */
  runTests() {
    NotificationCenterComponent.info('Запуск тестов...');
    
    const results = TestEnvironment.runAllTests();
    this.displayTestResults(results);
    
    if (results.failed === 0) {
      NotificationCenterComponent.success(`✅ Все тесты пройдены (${results.passed})`);
    } else {
      NotificationCenterComponent.warning(`⚠️ Упало тестов: ${results.failed}`);
    }
  }

  /**
   * Отображение результатов тестов
   * @param {Object} results - Результаты тестирования
   * @returns {void}
   */
  displayTestResults(results) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="test-results">
        <div class="results-header">
          <h3>🧪 Результаты тестирования</h3>
          <div class="results-summary">
            <span class="passed">✅ ${results.passed}</span>
            <span class="failed">❌ ${results.failed}</span>
          </div>
        </div>
        
        <div class="results-details">
          ${results.tests.map(test => `
            <div class="test-result ${test.status}">
              <div class="test-name">${test.name}</div>
              <div class="test-status">${test.status === 'passed' ? '✅' : '❌'}</div>
              <div class="test-message">${test.message}</div>
              ${test.error ? `<div class="test-error">${test.error.message}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="results-actions">
          <button class="btn btn-primary" id="rerunTests">
            🔄 Перезапустить тесты
          </button>
          <button class="btn btn-secondary" id="exportTestResults">
            📤 Экспорт результатов
          </button>
        </div>
      </div>
    `;

    // Перезапуск тестов
    document.getElementById('rerunTests')?.addEventListener('click', () => {
      this.runTests();
    });

    // Экспорт результатов
    document.getElementById('exportTestResults')?.addEventListener('click', () => {
      this.exportTestResults(results);
    });
  }

  /**
   * Показ примера системы типов
   * @returns {void}
   */
  showTypeExample() {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="type-example">
        <h3>📝 Пример TypeScript-like системы</h3>
        
        <div class="example-tabs">
          <button class="tab-btn active" data-tab="typecheck">TypeCheck</button>
          <button class="tab-btn" data-tab="validator">Validator</button>
          <button class="tab-btn" data-tab="decorators">Decorators</button>
        </div>
        
        <div class="example-content">
          <pre id="typecheckTab" class="tab-content active"><code>// Декоратор проверки типов
@TypeCheck({
  params: ['string', 'number'],
  returns: 'string'
})
formatPrice(currency, amount) {
  return \`\${currency} \${amount.toFixed(2)}\`;
}

// Автоматическая проверка при вызове
formatPrice('USD', 100); // ✅ Работает
formatPrice(100, 'USD'); // ❌ TypeError</code></pre>
          
          <pre id="validatorTab" class="tab-content"><code>// Схема валидации
const userSchema = {
  name: { type: 'string', required: true },
  age: { type: 'number', min: 18, max: 100 },
  email: { type: 'string', pattern: /@/ }
};

// Валидация данных
const result = DataValidator.validate({
  name: 'John',
  age: 25,
  email: 'john@example.com'
}, userSchema);

console.log(result.isValid); // ✅ true</code></pre>
          
          <pre id="decoratorsTab" class="tab-content"><code>// Декораторы для улучшения кода
@Singleton()
class DatabaseService {
  @Debounce(300)
  search(query) {
    // Поиск с дебаунсом
  }
  
  @Throttle(1000)
  sendAnalytics(data) {
    // Отправка с троттлингом
  }
}

// Автоматическое создание синглтона
const db1 = new DatabaseService();
const db2 = new DatabaseService();
console.log(db1 === db2); // ✅ true</code></pre>
        </div>
        
        <button class="btn btn-secondary" id="closeExample">
          ✕ Закрыть пример
        </button>
      </div>
    `;

    // Переключение табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        
        // Обновляем активные табы
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        document.getElementById(`${tabId}Tab`).classList.add('active');
      });
    });

    // Закрытие примера
    document.getElementById('closeExample')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Показ деталей паттернов
   * @returns {void}
   */
  showPatternDetails() {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="patterns-details">
        <h3>🎯 Паттерны проектирования в проекте</h3>
        
        <div class="pattern-detail">
          <h4>Singleton (Одиночка)</h4>
          <p><strong>Использование:</strong> Router, NotificationService, PerformanceService</p>
          <p><strong>Преимущества:</strong> Единый источник данных, глобальный доступ</p>
          <pre><code>@Singleton()
class MyService {
  // Только один экземпляр
}</code></pre>
        </div>
        
        <div class="pattern-detail">
          <h4>Observer (Наблюдатель)</h4>
          <p><strong>Использование:</strong> NotificationCenterComponent, Event система</p>
          <p><strong>Преимущества:</strong> Слабая связанность, легкая расширяемость</p>
          <pre><code>class EventEmitter {
  on(event, listener) { /* подписка */ }
  emit(event, data) { /* уведомление */ }
}</code></pre>
        </div>
        
        <div class="pattern-detail">
          <h4>Module (Модуль)</h4>
          <p><strong>Использование:</strong> Все компоненты и сервисы</p>
          <p><strong>Преимущества:</strong> Инкапсуляция, переиспользование</p>
          <pre><code>// Каждый компонент - модуль
export default class MyComponent {
  // Приватные методы и свойства
}</code></pre>
        </div>
        
        <div class="patterns-benefits">
          <h4>Преимущества использования паттернов:</h4>
          <ul>
            <li>✅ Улучшенная поддерживаемость кода</li>
            <li>✅ Повторное использование решений</li>
            <li>✅ Упрощение коммуникации в команде</li>
            <li>✅ Снижение количества ошибок</li>
          </ul>
        </div>
        
        <button class="btn btn-secondary" id="closePatterns">
          ✕ Закрыть
        </button>
      </div>
    `;

    document.getElementById('closePatterns')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Показ опций рефакторинга
   * @returns {void}
   */
  showRefactoringOptions() {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    const selectedOptions = Array.from(
      document.querySelectorAll('input[name="refactoring"]:checked')
    ).map(input => input.value);

    if (selectedOptions.length === 0) {
      NotificationCenterComponent.warning('Выберите хотя бы одно улучшение');
      return;
    }

    container.innerHTML = `
      <div class="refactoring-confirmation">
        <h3>🚀 Подтверждение улучшений</h3>
        
        <div class="selected-options">
          <h4>Будут применены:</h4>
          <ul>
            ${selectedOptions.map(option => `
              <li>${this.getRefactoringName(option)}</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="refactoring-impact">
          <h4>Ожидаемый эффект:</h4>
          <div class="impact-metrics">
            <div class="impact-metric">
              <span class="metric-label">Улучшение качества:</span>
              <span class="metric-value">+15-20%</span>
            </div>
            <div class="impact-metric">
              <span class="metric-label">Снижение сложности:</span>
              <span class="metric-value">-10-15%</span>
            </div>
            <div class="impact-metric">
              <span class="metric-label">Время внедрения:</span>
              <span class="metric-value">${selectedOptions.length * 1.5} дней</span>
            </div>
          </div>
        </div>
        
        <div class="confirmation-actions">
          <button class="btn btn-success" id="confirmRefactoring">
            ✅ Подтвердить и применить
          </button>
          <button class="btn btn-secondary" id="cancelRefactoring">
            ✕ Отменить
          </button>
        </div>
      </div>
    `;

    // Подтверждение рефакторинга
    document.getElementById('confirmRefactoring')?.addEventListener('click', async () => {
      await this.applyRefactoring(selectedOptions);
    });

    // Отмена рефакторинга
    document.getElementById('cancelRefactoring')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Получение названия рефакторинга по ключу
   * @param {string} key - Ключ рефакторинга
   * @returns {string} Название
   */
  getRefactoringName(key) {
    const names = {
      'extract-mixin': 'Выделение миксинов',
      'introduce-di': 'Внедрение Dependency Injection',
      'optimize-performance': 'Оптимизация производительности',
      'add-testing': 'Добавление тестов'
    };
    
    return names[key] || key;
  }

  /**
   * Применение рефакторинга
   * @param {Array<string>} options - Выбранные опции
   * @returns {Promise<void>}
   */
  async applyRefactoring(options) {
    NotificationCenterComponent.info('Применение улучшений...');
    
    try {
      const results = [];
      
      for (const option of options) {
        const result = await this.refactoringService.applyRefactoring(option);
        results.push(result);
        
        NotificationCenterComponent.success(`✅ ${this.getRefactoringName(option)} применен`);
      }
      
      this.showRefactoringResults(results);
      
    } catch (error) {
      console.error('Ошибка рефакторинга:', error);
      NotificationCenterComponent.error('Ошибка при применении улучшений');
    }
  }

  /**
   * Показ результатов рефакторинга
   * @param {Array<Object>} results - Результаты рефакторинга
   * @returns {void}
   */
  showRefactoringResults(results) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="refactoring-results">
        <h3>🎉 Улучшения успешно применены!</h3>
        
        <div class="results-list">
          ${results.map(result => `
            <div class="result-item success">
              <div class="result-icon">✅</div>
              <div class="result-content">
                <div class="result-title">${result.message}</div>
                ${result.changes ? `
                  <div class="result-changes">
                    <strong>Изменения:</strong>
                    <ul>
                      ${result.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="post-refactoring">
          <h4>Следующие шаги:</h4>
          <ol>
            <li>Протестировать изменения в dev среде</li>
            <li>Обновить документацию</li>
            <li>Провести code review</li>
            <li>Задеплоить на production</li>
          </ol>
        </div>
        
        <button class="btn btn-primary" id="closeResults">
          ✕ Закрыть
        </button>
      </div>
    `;

    document.getElementById('closeResults')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Создание плана действий
   * @param {Object} report - Отчет анализа
   * @returns {void}
   */
  generateActionPlan(report) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    const actionPlan = this.refactoringService.createActionPlan(report.suggestions);

    container.innerHTML += `
      <div class="action-plan">
        <h4>📋 План действий по улучшению:</h4>
        
        <div class="timeline">
          ${actionPlan.map((action, index) => `
            <div class="timeline-item">
              <div class="timeline-marker">${index + 1}</div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">${action.title}</span>
                  <span class="timeline-timeline">${action.timeline}</span>
                </div>
                <p class="timeline-description">${action.description}</p>
                <div class="timeline-details">
                  <span class="detail priority-${action.priority}">Приоритет: ${action.priority}</span>
                  <span class="detail">Затраты: ${action.effort}</span>
                  ${action.prerequisites ? `
                    <div class="prerequisites">
                      <strong>Необходимо:</strong> ${action.prerequisites.join(', ')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="plan-summary">
          <h5>Итоги плана:</h5>
          <p>Общее время реализации: ${actionPlan.length * 1.5} дней</p>
          <p>Ожидаемое улучшение качества: +25-30%</p>
          <p>Ключевые направления: архитектура, тестирование, производительность</p>
        </div>
        
        <button class="btn btn-primary" id="exportActionPlan">
          📤 Экспорт плана
        </button>
      </div>
    `;

    document.getElementById('exportActionPlan')?.addEventListener('click', () => {
      this.exportActionPlan(actionPlan);
    });
  }

  /**
   * Экспорт отчета
   * @param {Object} report - Отчет
   * @returns {void}
   */
  exportReport(report) {
    const dataStr = JSON.stringify(report, null, 2);
    this.downloadFile(dataStr, 'code-analysis-report.json', 'application/json');
    NotificationCenterComponent.success('Отчет экспортирован!');
  }

  /**
   * Экспорт результатов тестов
   * @param {Object} results - Результаты тестов
   * @returns {void}
   */
  exportTestResults(results) {
    const dataStr = JSON.stringify(results, null, 2);
    this.downloadFile(dataStr, 'test-results.json', 'application/json');
    NotificationCenterComponent.success('Результаты тестов экспортированы!');
  }

  /**
   * Экспорт плана действий
   * @param {Array} actionPlan - План действий
   * @returns {void}
   */
  exportActionPlan(actionPlan) {
    const dataStr = JSON.stringify(actionPlan, null, 2);
    this.downloadFile(dataStr, 'action-plan.json', 'application/json');
    NotificationCenterComponent.success('План действий экспортирован!');
  }

  /**
   * Создание примеров системы типов
   * @returns {Array} Примеры
   */
  createTypeExamples() {
    return [
      {
        name: 'TypeCheck декоратор',
        code: `@TypeCheck({
  params: ['string', 'number'],
  returns: 'string'
})
formatPrice(currency, amount) {
  return \`\${currency} \${amount.toFixed(2)}\`;
}`
      },
      {
        name: 'TypedStore',
        code: `const store = new TypedStore(
  { count: 0 },
  (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      default:
        return state;
    }
  }
);`
      }
    ];
  }

  /**
   * Скачивание файла
   * @param {string} content - Содержимое файла
   * @param {string} filename - Имя файла
   * @param {string} type - MIME тип
   * @returns {void}
   */
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Статический метод для инициализации
   * @param {string} containerSelector - Селектор контейнера
   * @returns {Day11Component} Экземпляр компонента
   */
  static init(containerSelector) {
    const day11 = new Day11Component();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = day11.render();
      day11.afterRender();
    }
    
    return day11;
  }
}

export default Day11Component;