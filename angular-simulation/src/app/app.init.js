import { addGlobalAnimations } from './utils/animations.js';
import Config from './config/config.js';
import NotificationComponent from './components/notification/notification.component.js';
import ScrollToTopComponent from './components/scroll-to-top/scroll-to-top.component.js';

// Инициализация приложения
class AppInitializer {
    constructor() {
        this.components = [];
    }

    // Инициализация всех компонентов
    async initialize() {
        try {
            // Добавляем глобальные анимации
            addGlobalAnimations();

            // Инициализируем компоненты
            await this.initializeComponents();

            // Настройка глобальных обработчиков
            this.setupGlobalHandlers();

            // Запускаем ленивую загрузку изображений
            this.setupLazyLoading();

            // Показываем приветственное сообщение
            this.showWelcomeMessage();

            console.log('🚀 Приложение TravelWave успешно инициализировано!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);
            this.showError('Ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
        }
    }

    async initializeComponents() {
        // Инициализация компонента уведомлений
        const notification = new NotificationComponent();
        this.components.push(notification);
        
        // Инициализация кнопки "Наверх"
        const scrollToTop = new ScrollToTopComponent();
        this.components.push(scrollToTop);
        
        // Рендер компонентов
        this.components.forEach(component => {
            if (component.render) {
                document.body.insertAdjacentHTML('beforeend', component.render());
                if (component.afterRender) {
                    setTimeout(() => component.afterRender(), 100);
                }
            }
        });
    }

    setupGlobalHandlers() {
        // Обработка ошибок
        window.addEventListener('error', (event) => {
            console.error('Глобальная ошибка:', event.error);
            this.showError('Произошла ошибка в приложении');
        });

        // Обработка необработанных промисов
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Необработанный промис:', event.reason);
            this.showError('Произошла ошибка при выполнении операции');
        });

        // Отслеживание онлайн/офлайн статуса
        window.addEventListener('online', () => {
            this.showNotification('Соединение восстановлено', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Нет подключения к интернету', 'warning');
        });

        // Сохранение позиции скролла
        window.addEventListener('beforeunload', () => {
            this.saveScrollPosition();
        });

        // Восстановление позиции скролла
        window.addEventListener('load', () => {
            this.restoreScrollPosition();
        });
    }

    setupLazyLoading() {
        // Ленивая загрузка изображений
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback для старых браузеров
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
            });
        }
    }

    showWelcomeMessage() {
        // Показываем приветствие только при первом посещении
        const hasVisited = localStorage.getItem('has_visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                this.showNotification(
                    '👋 Добро пожаловать в TravelWave! Начните свое путешествие прямо сейчас!',
                    'info',
                    5000
                );
                localStorage.setItem('has_visited', 'true');
            }, 1000);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (this.components[0] && this.components[0].show) {
            this.components[0].show(message, type, duration);
        } else {
            // Fallback
            alert(message);
        }
    }

    showError(message) {
        this.showNotification(message, 'error', 5000);
    }

    saveScrollPosition() {
        sessionStorage.setItem('scrollPosition', window.scrollY);
    }

    restoreScrollPosition() {
        const savedPosition = sessionStorage.getItem('scrollPosition');
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
    }

    // Статический метод для быстрой инициализации
    static async init() {
        const app = new AppInitializer();
        await app.initialize();
        return app;
    }
}

// Экспорт
export default AppInitializer;