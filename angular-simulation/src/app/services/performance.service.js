class PerformanceService {
  constructor() {
    this.metrics = {
      pageLoad: {},
      componentRender: {},
      apiCalls: [],
      userActions: []
    };
    
    this.thresholds = {
      slowPageLoad: 3000, // 3 секунды
      slowRender: 1000,   // 1 секунда
      slowApiCall: 5000   // 5 секунд
    };
    
    this.initMonitoring();
  }

  initMonitoring() {
    // Мониторинг загрузки страницы
    this.trackPageLoad();
    
    // Мониторинг производительности компонентов
    this.trackComponentRendering();
    
    // Мониторинг сетевых запросов
    this.trackNetworkRequests();
    
    // Мониторинг действий пользователя
    this.trackUserActions();
    
    // Мониторинг памяти
    this.trackMemoryUsage();
    
    // Периодический сбор метрик
    this.startPeriodicMonitoring();
  }

  trackPageLoad() {
    if (window.performance) {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      if (perfData) {
        this.metrics.pageLoad = {
          dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcpConnect: perfData.connectEnd - perfData.connectStart,
          sslHandshake: perfData.connectEnd - perfData.secureConnectionStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          contentLoad: perfData.responseEnd - perfData.responseStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          pageLoad: perfData.loadEventEnd - perfData.loadEventStart,
          total: perfData.loadEventEnd - perfData.startTime
        };
        
        this.checkPageLoadPerformance();
      }
    }
  }

  trackComponentRendering() {
    // Декоратор для отслеживания рендеринга компонентов
    this.originalRender = null;
    
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            this.metrics.componentRender[entry.name] = entry.duration;
            this.checkRenderPerformance(entry.name, entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }

  trackNetworkRequests() {
    // Перехват fetch запросов
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.apiCalls.push({
          url: url,
          method: args[1]?.method || 'GET',
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          status: response.status,
          success: response.ok
        });
        
        this.checkApiPerformance(url, duration);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.apiCalls.push({
          url: url,
          method: args[1]?.method || 'GET',
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          status: 0,
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
  }

  trackUserActions() {
    // Отслеживание кликов
    document.addEventListener('click', (e) => {
      const target = e.target;
      const now = performance.now();
      
      // Отслеживаем только значимые действия
      if (target.matches('button, a, [role="button"], input[type="submit"]')) {
        const action = {
          type: 'click',
          target: target.tagName.toLowerCase(),
          className: target.className,
          text: target.textContent?.trim().substring(0, 50),
          timestamp: now,
          path: this.getElementPath(target)
        };
        
        this.metrics.userActions.push(action);
        
        // Ограничиваем размер массива
        if (this.metrics.userActions.length > 1000) {
          this.metrics.userActions.shift();
        }
      }
    });
    
    // Отслеживание навигации
    window.addEventListener('hashchange', () => {
      this.metrics.userActions.push({
        type: 'navigation',
        from: document.referrer,
        to: window.location.href,
        timestamp: performance.now()
      });
    });
  }

  trackMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        const usage = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          timestamp: Date.now()
        };
        
        // Логируем только при высоком использовании
        if (usage.percentage > 70) {
          console.warn('High memory usage:', usage);
          this.sendAlert('high_memory', usage);
        }
      }, 30000); // Каждые 30 секунд
    }
  }

  startPeriodicMonitoring() {
    // Сбор метрик каждые 30 секунд
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
    
    // Отправка метрик на сервер каждые 5 минут
    setInterval(() => {
      this.sendMetricsToServer();
    }, 300000);
  }

  collectSystemMetrics() {
    const metrics = {
      timestamp: Date.now(),
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      connections: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      deviceMemory: navigator.deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      userAgent: navigator.userAgent.substring(0, 100)
    };
    
    // Сохраняем в localStorage для отладки
    const recentMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    recentMetrics.push(metrics);
    
    if (recentMetrics.length > 100) {
      recentMetrics.shift();
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
    
    return metrics;
  }

  checkPageLoadPerformance() {
    const total = this.metrics.pageLoad.total;
    
    if (total > this.thresholds.slowPageLoad) {
      console.warn(`Slow page load: ${total}ms`);
      this.sendAlert('slow_page_load', {
        duration: total,
        metrics: this.metrics.pageLoad
      });
    }
  }

  checkRenderPerformance(componentName, duration) {
    if (duration > this.thresholds.slowRender) {
      console.warn(`Slow component render (${componentName}): ${duration}ms`);
      this.sendAlert('slow_render', {
        component: componentName,
        duration: duration
      });
      
      // Записываем в медленные рендеры
      const slowRenders = JSON.parse(localStorage.getItem('slow_renders') || '[]');
      slowRenders.push({
        component: componentName,
        duration: duration,
        timestamp: Date.now()
      });
      
      if (slowRenders.length > 50) {
        slowRenders.shift();
      }
      
      localStorage.setItem('slow_renders', JSON.stringify(slowRenders));
    }
  }

  checkApiPerformance(url, duration) {
    if (duration > this.thresholds.slowApiCall) {
      console.warn(`Slow API call (${url}): ${duration}ms`);
      this.sendAlert('slow_api_call', {
        url: url,
        duration: duration
      });
    }
  }

  sendAlert(type, data) {
    // В реальном приложении здесь была бы отправка в систему мониторинга
    console.log(`Performance Alert [${type}]:`, data);
    
    // Можно показывать уведомление пользователю для критичных проблем
    if (type === 'high_memory' || type === 'slow_page_load') {
      if (window.NotificationCenterComponent) {
        window.NotificationCenterComponent.warning(
          type === 'high_memory' 
            ? 'Высокое использование памяти. Рекомендуем закрыть неиспользуемые вкладки.'
            : 'Медленная загрузка страницы. Проверьте соединение с интернетом.'
        );
      }
    }
  }

  sendMetricsToServer() {
    const data = {
      pageLoad: this.metrics.pageLoad,
      recentApiCalls: this.metrics.apiCalls.slice(-20),
      userActions: this.metrics.userActions.slice(-50),
      systemMetrics: this.collectSystemMetrics(),
      timestamp: Date.now(),
      url: window.location.href
    };
    
    // В реальном приложении здесь был бы fetch на сервер
    console.log('Sending metrics to server:', data);
    
    // Сохраняем в localStorage для отладки
    const sentMetrics = JSON.parse(localStorage.getItem('sent_metrics') || '[]');
    sentMetrics.push(data);
    
    if (sentMetrics.length > 10) {
      sentMetrics.shift();
    }
    
    localStorage.setItem('sent_metrics', JSON.stringify(sentMetrics));
    
    // Очищаем старые данные
    this.clearOldMetrics();
  }

  clearOldMetrics() {
    // Оставляем только последние 100 записей для каждого типа метрик
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-100);
    }
    
    if (this.metrics.userActions.length > 100) {
      this.metrics.userActions = this.metrics.userActions.slice(-100);
    }
  }

  getElementPath(element) {
    const path = [];
    while (element) {
      let selector = element.tagName.toLowerCase();
      
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = element;
        let siblingIndex = 1;
        
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          siblingIndex++;
        }
        
        selector += `:nth-child(${siblingIndex})`;
      }
      
      path.unshift(selector);
      element = element.parentElement;
    }
    
    return path.join(' > ');
  }

  // Методы для получения статистики
  getPerformanceReport() {
    return {
      summary: this.getSummary(),
      pageLoad: this.metrics.pageLoad,
      slowRenders: this.getSlowRenders(),
      apiPerformance: this.getApiPerformance(),
      userBehavior: this.getUserBehavior(),
      recommendations: this.getRecommendations()
    };
  }

  getSummary() {
    const totalApiCalls = this.metrics.apiCalls.length;
    const failedApiCalls = this.metrics.apiCalls.filter(call => !call.success).length;
    const avgApiDuration = totalApiCalls > 0 
      ? this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / totalApiCalls 
      : 0;
    
    return {
      pageLoadTime: this.metrics.pageLoad.total || 0,
      totalApiCalls,
      failedApiCalls,
      successRate: totalApiCalls > 0 ? ((totalApiCalls - failedApiCalls) / totalApiCalls * 100).toFixed(1) + '%' : 'N/A',
      avgApiDuration: avgApiDuration.toFixed(2) + 'ms',
      userActions: this.metrics.userActions.length,
      memoryUsage: performance.memory ? 
        `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'
    };
  }

  getSlowRenders() {
    const slowRenders = JSON.parse(localStorage.getItem('slow_renders') || '[]');
    
    // Группируем по компонентам
    const grouped = slowRenders.reduce((acc, render) => {
      if (!acc[render.component]) {
        acc[render.component] = {
          count: 0,
          totalDuration: 0,
          maxDuration: 0,
          lastOccurred: 0
        };
      }
      
      acc[render.component].count++;
      acc[render.component].totalDuration += render.duration;
      acc[render.component].maxDuration = Math.max(acc[render.component].maxDuration, render.duration);
      acc[render.component].lastOccurred = Math.max(acc[render.component].lastOccurred, render.timestamp);
      
      return acc;
    }, {});
    
    // Преобразуем в массив с средней длительностью
    return Object.entries(grouped).map(([component, data]) => ({
      component,
      count: data.count,
      avgDuration: (data.totalDuration / data.count).toFixed(2) + 'ms',
      maxDuration: data.maxDuration.toFixed(2) + 'ms',
      lastOccurred: new Date(data.lastOccurred).toLocaleString('ru-RU')
    }));
  }

  getApiPerformance() {
    const apiCalls = this.metrics.apiCalls.slice(-50); // Последние 50 вызовов
    
    const byEndpoint = apiCalls.reduce((acc, call) => {
      const endpoint = new URL(call.url).pathname;
      
      if (!acc[endpoint]) {
        acc[endpoint] = {
          count: 0,
          totalDuration: 0,
          success: 0,
          errors: 0
        };
      }
      
      acc[endpoint].count++;
      acc[endpoint].totalDuration += call.duration;
      
      if (call.success) {
        acc[endpoint].success++;
      } else {
        acc[endpoint].errors++;
      }
      
      return acc;
    }, {});
    
    return Object.entries(byEndpoint).map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgDuration: (data.totalDuration / data.count).toFixed(2) + 'ms',
      successRate: `${((data.success / data.count) * 100).toFixed(1)}%`,
      errorRate: `${((data.errors / data.count) * 100).toFixed(1)}%`
    }));
  }

  getUserBehavior() {
    const actions = this.metrics.userActions.slice(-100);
    
    const byType = actions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {});
    
    const byHour = actions.reduce((acc, action) => {
      const hour = new Date(action.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalActions: actions.length,
      byType,
      byHour,
      mostActiveHour: Object.entries(byHour).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0],
      recentActions: actions.slice(-10).map(a => ({
        type: a.type,
        target: a.target,
        time: new Date(a.timestamp).toLocaleTimeString('ru-RU')
      }))
    };
  }

  getRecommendations() {
    const recommendations = [];
    
    // Проверка загрузки страницы
    if (this.metrics.pageLoad.total > this.thresholds.slowPageLoad) {
      recommendations.push({
        type: 'critical',
        title: 'Медленная загрузка страницы',
        description: `Время загрузки: ${this.metrics.pageLoad.total.toFixed(0)}ms`,
        suggestions: [
          'Оптимизируйте изображения',
          'Включите кэширование',
          'Используйте CDN для статических файлов'
        ]
      });
    }
    
    // Проверка использования памяти
    if (performance.memory) {
      const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      
      if (memoryUsage > 70) {
        recommendations.push({
          type: 'warning',
          title: 'Высокое использование памяти',
          description: `Используется ${memoryUsage.toFixed(1)}% от лимита`,
          suggestions: [
            'Удалите неиспользуемые слушатели событий',
            'Используйте виртуализацию для длинных списков',
            'Очищайте таймеры и интервалы'
          ]
        });
      }
    }
    
    // Проверка API вызовов
    const slowApiCalls = this.metrics.apiCalls.filter(call => call.duration > this.thresholds.slowApiCall);
    
    if (slowApiCalls.length > 0) {
      const avgApiDuration = slowApiCalls.reduce((sum, call) => sum + call.duration, 0) / slowApiCalls.length;
      
      recommendations.push({
        type: 'info',
        title: 'Медленные API вызовы',
        description: `${slowApiCalls.length} медленных запросов (среднее: ${avgApiDuration.toFixed(0)}ms)`,
        suggestions: [
          'Кэшируйте результаты запросов',
          'Используйте пагинацию',
          'Оптимизируйте запросы к базе данных'
        ]
      });
    }
    
    return recommendations;
  }

  // Методы для оптимизации
  optimizeImages() {
    // Ленивая загрузка изображений
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      
      observer.observe(img);
    });
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Очистка ресурсов
  cleanup() {
    // В реальном приложении здесь была бы очистка всех слушателей и таймеров
    console.log('Performance service cleanup');
  }

  // Экспорт данных для отладки
  exportData() {
    const data = {
      metrics: this.metrics,
      thresholds: this.thresholds,
      report: this.getPerformanceReport(),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Статический метод для быстрой инициализации
  static init() {
    if (!window.performanceService) {
      window.performanceService = new PerformanceService();
      
      // Экспортируем утилиты в глобальную область видимости
      window.debounce = window.performanceService.debounce.bind(window.performanceService);
      window.throttle = window.performanceService.throttle.bind(window.performanceService);
      
      // Автоматическая оптимизация изображений
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.performanceService.optimizeImages(), 1000);
      });
    }
    
    return window.performanceService;
  }
}

export default PerformanceService;