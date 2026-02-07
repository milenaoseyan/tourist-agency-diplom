import MapsIntegrationComponent from '../maps/maps-integration.component.js';
import NotificationService from '../../services/notification.service.js';
import AdvancedSearchComponent from '../advanced-search/advanced-search.component.js';
import SupportChatComponent from '../support-chat/support-chat.component.js';
import PerformanceService from '../../services/performance.service.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class Day10Component {
  constructor() {
    this.title = 'День 10: Интеграции и финальная полировка';
    this.description = 'Добавляем интеграции с внешними сервисами и улучшаем производительность';
    
    this.notificationService = new NotificationService();
    this.performanceService = PerformanceService.init();
  }

  render() {
    return `
      <div class="day10-container">
        <header class="day10-header">
          <h1>${this.title}</h1>
          <p class="subtitle">${this.description}</p>
          <div class="completion-badge">🎉 10-й день завершен!</div>
        </header>

        <div class="features-grid">
          <div class="feature-card" id="mapsFeature">
            <h2>🗺️ Интеграция с картами</h2>
            <div class="feature-content" id="mapsContainer"></div>
          </div>

          <div class="feature-card" id="notificationsFeature">
            <h2>🔔 Система уведомлений</h2>
            <div class="feature-content" id="notificationsContainer"></div>
          </div>

          <div class="feature-card" id="searchFeature">
            <h2>🔍 Расширенный поиск</h2>
            <div class="feature-content" id="searchContainer"></div>
          </div>

          <div class="feature-card" id="chatFeature">
            <h2>💬 Чат поддержки</h2>
            <div class="feature-content" id="chatContainer"></div>
          </div>

          <div class="feature-card" id="performanceFeature">
            <h2>⚡ Оптимизация производительности</h2>
            <div class="feature-content" id="performanceContainer"></div>
          </div>

          <div class="feature-card" id="summaryFeature">
            <h2>📊 Итоги 10-дневной практики</h2>
            <div class="feature-content" id="summaryContainer"></div>
          </div>
        </div>

        <div class="day10-actions">
          <button class="btn btn-primary" id="testAllFeatures">
            🧪 Протестировать все функции
          </button>
          <button class="btn btn-secondary" id="exportProject">
            📦 Экспорт проекта
          </button>
          <button class="btn btn-success" id="celebrate">
            🎉 Завершить практику!
          </button>
        </div>

        <div class="support-chat-container"></div>
      </div>
    `;
  }

  afterRender() {
    // Инициализация компонентов
    this.initMaps();
    this.initNotifications();
    this.initSearch();
    this.initChat();
    this.initPerformance();
    this.initSummary();

    // Кнопки действий
    document.getElementById('testAllFeatures')?.addEventListener('click', () => {
      this.testAllFeatures();
    });

    document.getElementById('exportProject')?.addEventListener('click', () => {
      this.exportProject();
    });

    document.getElementById('celebrate')?.addEventListener('click', () => {
      this.celebrateCompletion();
    });
  }

  initMaps() {
    const container = document.getElementById('mapsContainer');
    if (container) {
      MapsIntegrationComponent.show(
        'Москва, Красная площадь',
        '#mapsContainer',
        { showEmbed: true, showLinks: true, height: '300px' }
      );
    }
  }

  initNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (container) {
      const stats = this.notificationService.getNotificationStats();
      
      container.innerHTML = `
        <div class="notifications-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Всего уведомлений</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.unread}</div>
            <div class="stat-label">Непрочитанных</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.todayCount}</div>
            <div class="stat-label">Сегодня</div>
          </div>
        </div>
        
        <div class="notification-actions">
          <button class="btn btn-small" id="sendTestNotification">
            📨 Тестовое уведомление
          </button>
          <button class="btn btn-small" id="createReminder">
            ⏰ Создать напоминание
          </button>
          <button class="btn btn-small" id="clearNotifications">
            🗑️ Очистить все
          </button>
        </div>
        
        <div class="notification-settings">
          <h4>Настройки:</h4>
          <label class="setting-toggle">
            <input type="checkbox" id="pushEnabled" checked>
            <span>Push-уведомления</span>
          </label>
          <label class="setting-toggle">
            <input type="checkbox" id="emailEnabled" checked>
            <span>Email-уведомления</span>
          </label>
          <label class="setting-toggle">
            <input type="checkbox" id="priceAlertsEnabled" checked>
            <span>Уведомления о ценах</span>
          </label>
        </div>
      `;

      document.getElementById('sendTestNotification')?.addEventListener('click', async () => {
        await this.notificationService.sendNotification(
          '🎉 Тестовое уведомление',
          {
            body: 'Поздравляем! Вы завершили 10-дневную практику по JavaScript!',
            requireInteraction: true
          }
        );
      });

      document.getElementById('createReminder')?.addEventListener('click', () => {
        const tour = {
          id: Date.now(),
          title: 'Итоговый проект: TravelWave'
        };
        
        this.notificationService.sendTourReminder(tour, 1);
        NotificationCenterComponent.success('Напоминание создано!');
      });

      document.getElementById('clearNotifications')?.addEventListener('click', () => {
        this.notificationService.clearAllNotifications();
        NotificationCenterComponent.success('Все уведомления очищены');
        this.initNotifications(); // Перерисовываем
      });
    }
  }

  initSearch() {
    AdvancedSearchComponent.create('#searchContainer', 'Москва');
  }

  initChat() {
    SupportChatComponent.init('.support-chat-container');
  }

  initPerformance() {
    const container = document.getElementById('performanceContainer');
    if (container) {
      const report = this.performanceService.getPerformanceReport();
      
      container.innerHTML = `
        <div class="performance-summary">
          <h4>📈 Производительность:</h4>
          <div class="performance-stats">
            <div class="perf-stat">
              <span class="perf-label">Загрузка страницы:</span>
              <span class="perf-value ${report.summary.pageLoadTime > 3000 ? 'warning' : 'good'}">
                ${report.summary.pageLoadTime.toFixed(0)}ms
              </span>
            </div>
            <div class="perf-stat">
              <span class="perf-label">API успешность:</span>
              <span class="perf-value ${report.summary.successRate < '90%' ? 'warning' : 'good'}">
                ${report.summary.successRate}
              </span>
            </div>
            <div class="perf-stat">
              <span class="perf-label">Использование памяти:</span>
              <span class="perf-value">${report.summary.memoryUsage}</span>
            </div>
          </div>
        </div>
        
        <div class="performance-actions">
          <button class="btn btn-small" id="runPerformanceTest">
            🏃 Запустить тест
          </button>
          <button class="btn btn-small" id="showReport">
            📊 Показать отчет
          </button>
          <button class="btn btn-small" id="optimizeNow">
            ⚡ Оптимизировать
          </button>
        </div>
        
        ${report.recommendations.length > 0 ? `
          <div class="performance-recommendations">
            <h4>💡 Рекомендации:</h4>
            ${report.recommendations.map(rec => `
              <div class="recommendation ${rec.type}">
                <strong>${rec.title}:</strong> ${rec.description}
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;

      document.getElementById('runPerformanceTest')?.addEventListener('click', () => {
        this.runPerformanceTest();
      });

      document.getElementById('showReport')?.addEventListener('click', () => {
        this.showPerformanceReport();
      });

      document.getElementById('optimizeNow')?.addEventListener('click', () => {
        this.optimizePerformance();
      });
    }
  }

  initSummary() {
    const container = document.getElementById('summaryContainer');
    if (container) {
      const projectStats = this.getProjectStats();
      
      container.innerHTML = `
        <div class="summary-stats">
          <div class="summary-stat">
            <div class="summary-icon">📁</div>
            <div class="summary-info">
              <div class="summary-value">${projectStats.components}</div>
              <div class="summary-label">Компонентов</div>
            </div>
          </div>
          
          <div class="summary-stat">
            <div class="summary-icon">📝</div>
            <div class="summary-info">
              <div class="summary-value">${projectStats.lines}</div>
              <div class="summary-label">Строк кода</div>
            </div>
          </div>
          
          <div class="summary-stat">
            <div class="summary-icon">🎯</div>
            <div class="summary-info">
              <div class="summary-value">${projectStats.features}</div>
              <div class="summary-label">Функций</div>
            </div>
          </div>
          
          <div class="summary-stat">
            <div class="summary-icon">⏱️</div>
            <div class="summary-info">
              <div class="summary-value">10</div>
              <div class="summary-label">Дней практики</div>
            </div>
          </div>
        </div>
        
        <div class="achievements">
          <h4>🏆 Достижения:</h4>
          <ul class="achievements-list">
            <li>✅ Создан полноценный SPA без фреймворков</li>
            <li>✅ Реализована архитектура компонентов</li>
            <li>✅ Добавлен глобальный стейт-менеджер</li>
            <li>✅ Интеграция с внешними API</li>
            <li>✅ Система уведомлений</li>
            <li>✅ Оптимизация производительности</li>
          </ul>
        </div>
        
        <div class="next-steps">
          <h4>🚀 Следующие шаги:</h4>
          <ol class="steps-list">
            <li>Добавить тестирование (Jest)</li>
            <li>Настроить CI/CD pipeline</li>
            <li>Добавить TypeScript</li>
            <li>Перенести на React/Vue/Angular</li>
            <li>Добавить бэкенд на Node.js</li>
            <li>Развернуть на продакшн</li>
          </ol>
        </div>
      `;
    }
  }

  async testAllFeatures() {
    NotificationCenterComponent.info('Запуск комплексного тестирования...');
    
    // Тест карт
    MapsIntegrationComponent.show('Санкт-Петербург, Эрмитаж', '#mapsContainer');
    
    // Тест уведомлений
    await this.notificationService.sendNotification(
      '🧪 Комплексный тест',
      {
        body: 'Тестирование всех функций проекта TravelWave',
        requireInteraction: false
      }
    );
    
    // Тест производительности
    const report = this.performanceService.getPerformanceReport();
    console.log('Performance report:', report);
    
    // Тест чата
    const chatContainer = document.querySelector('.support-chat-container');
    if (chatContainer) {
      chatContainer.innerHTML = '';
      SupportChatComponent.init('.support-chat-container');
    }
    
    NotificationCenterComponent.success('Комплексное тестирование завершено!');
  }

  exportProject() {
    const projectData = {
      name: 'TravelWave - Туристическое приложение',
      version: '1.0.0',
      completedAt: new Date().toISOString(),
      days: 10,
      components: this.getProjectStats(),
      features: [
        'SPA Architecture',
        'Component System',
        'State Management',
        'Routing',
        'Maps Integration',
        'Notifications System',
        'Advanced Search',
        'Support Chat',
        'Performance Optimization',
        'LocalStorage Persistence'
      ],
      technologies: [
        'Vanilla JavaScript',
        'CSS3',
        'HTML5',
        'Web Components Pattern',
        'Service Workers',
        'LocalStorage API'
      ]
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'travelwave-project-export.json');
    linkElement.click();
    
    NotificationCenterComponent.success('Проект экспортирован!');
  }

  celebrateCompletion() {
    // Поздравительное уведомление
    this.notificationService.sendNotification(
      '🎉 Поздравляем!',
      {
        body: 'Вы успешно завершили 10-дневную практику по JavaScript!',
        requireInteraction: true,
        icon: '/icons/celebration.png'
      }
    );
    
    // Конфетти эффект
    this.showConfetti();
    
    // Поздравительное сообщение
    NotificationCenterComponent.success(
      'Поздравляем с завершением 10-дневной практики! 🎉 Вы создали полноценное SPA-приложение с нуля!'
    );
    
    // Сохраняем достижение
    localStorage.setItem('practice_completed', new Date().toISOString());
    localStorage.setItem('practice_day', '10');
  }

  showConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(confettiContainer);
    
    // Создаем конфетти
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: ${this.getRandomColor()};
        top: -20px;
        left: ${Math.random() * 100}%;
        border-radius: 2px;
        animation: fall ${Math.random() * 3 + 2}s linear forwards;
      `;
      
      confettiContainer.appendChild(confetti);
    }
    
    // Удаляем через 5 секунд
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
    
    // Добавляем стили анимации
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(${Math.random() * 720}deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  getRandomColor() {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getProjectStats() {
    // В реальном приложении здесь бы подсчитывались реальные метрики
    return {
      components: 24,
      lines: 4500,
      files: 38,
      features: 42,
      days: 10
    };
  }

  runPerformanceTest() {
    NotificationCenterComponent.info('Запуск теста производительности...');
    
    // Имитация тяжелой операции
    const startTime = performance.now();
    
    // Выполняем "тяжелые" вычисления
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.random();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const container = document.getElementById('performanceContainer');
    if (container) {
      const perfStat = container.querySelector('.perf-stat:first-child .perf-value');
      if (perfStat) {
        perfStat.textContent = `${duration.toFixed(0)}ms`;
        perfStat.className = `perf-value ${duration > 100 ? 'warning' : 'good'}`;
      }
    }
    
    NotificationCenterComponent.success(`Тест завершен за ${duration.toFixed(0)}ms`);
  }

  showPerformanceReport() {
    const report = this.performanceService.getPerformanceReport();
    const reportStr = JSON.stringify(report, null, 2);
    
    const modal = document.createElement('div');
    modal.className = 'performance-report-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📊 Полный отчет о производительности</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <pre><code>${reportStr}</code></pre>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">Закрыть</button>
          <button class="btn btn-primary" id="exportReport">Экспорт отчета</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модалки
    const closeModal = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
    
    // Экспорт отчета
    modal.querySelector('#exportReport').addEventListener('click', () => {
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `performance-report-${Date.now()}.json`);
      linkElement.click();
    });
    
    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  optimizePerformance() {
    // Применяем оптимизации
    this.performanceService.optimizeImages();
    
    // Очищаем кэш
    this.clearCache();
    
    // Перезапускаем мониторинг
    this.performanceService.init();
    
    NotificationCenterComponent.success('Оптимизации применены!');
    
    // Перерисовываем блок производительности
    setTimeout(() => {
      this.initPerformance();
    }, 500);
  }

  clearCache() {
    // Очистка данных в localStorage (кроме важных)
    const importantKeys = [
      'user_profile',
      'user_notifications',
      'practice_completed',
      'practice_day'
    ];
    
    Object.keys(localStorage).forEach(key => {
      if (!importantKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Очистка сессионного хранилища
    sessionStorage.clear();
  }

  // Статический метод для инициализации
  static init(containerSelector) {
    const day10 = new Day10Component();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = day10.render();
      day10.afterRender();
    }
    
    return day10;
  }
}

export default Day10Component;