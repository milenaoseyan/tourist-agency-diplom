import Router from './services/router.js';
import NotificationCenterComponent from './components/notification-center/notification-center.component.js';
import Day10Component from './components/day10/day10.component.js';

class App {
  constructor() {
    this.router = new Router();
    this.currentDay = localStorage.getItem('practice_day') || '10';
    this.init();
  }

  async init() {
    console.log('🚀 TravelWave App Initializing...');
    
    // Инициализация маршрутизации
    this.setupRouting();
    
    // Инициализация уведомлений
    this.setupNotifications();
    
    // Загрузка начальной страницы
    this.loadInitialPage();
    
    // Регистрация Service Worker для PWA
    this.registerServiceWorker();
    
    console.log('✅ App initialized successfully');
  }

  setupRouting() {
    // Маршруты для 10-го дня
    this.router.addRoute('#/day10', () => {
      this.renderDay10();
    });
    
    // Маршрут по умолчанию
    this.router.addRoute('', () => {
      this.router.navigate('#/day10');
    });
    
    this.router.addRoute('#/', () => {
      this.router.navigate('#/day10');
    });
  }

  setupNotifications() {
    // Инициализация центра уведомлений
    NotificationCenterComponent.init('.notification-center');
    
    // Приветственное уведомление
    setTimeout(() => {
      NotificationCenterComponent.success(
        '🎉 День 10: Интеграции и финальная полировка! ' +
        'Завершаем наш 10-дневный марафон по JavaScript!'
      );
    }, 1000);
  }

  renderDay10() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      Day10Component.init('#mainContent');
    }
  }

  loadInitialPage() {
    const hash = window.location.hash || '#/day10';
    this.router.navigate(hash);
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ ServiceWorker registered:', registration);
        
        // Проверка обновлений
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                NotificationCenterComponent.info(
                  'Доступно обновление приложения. Закройте и откройте приложение заново.'
                );
              }
            }
          });
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  // Публичные методы для глобального доступа
  navigate(path) {
    this.router.navigate(path);
  }

  showNotification(message, type = 'info') {
    switch (type) {
      case 'success':
        NotificationCenterComponent.success(message);
        break;
      case 'error':
        NotificationCenterComponent.error(message);
        break;
      case 'warning':
        NotificationCenterComponent.warning(message);
        break;
      default:
        NotificationCenterComponent.info(message);
    }
  }

  getCurrentDay() {
    return this.currentDay;
  }

  // Экспорт данных приложения
  exportAppData() {
    const data = {
      app: 'TravelWave',
      version: '1.0.0',
      day: this.currentDay,
      routes: this.router.getRoutes(),
      localStorageSize: JSON.stringify(localStorage).length,
      userAgent: navigator.userAgent,
      exportTime: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export default App;