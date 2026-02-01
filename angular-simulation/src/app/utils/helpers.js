// Вспомогательные функции
export const Helpers = {
    // Форматирование цены
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    },

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    // Форматирование времени
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Обрезка текста
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Генерация случайного цвета
    getRandomColor() {
        const colors = [
            '#3f51b5', '#2196F3', '#00BCD4', '#009688',
            '#4CAF50', '#8BC34A', '#FFC107', '#FF9800',
            '#FF5722', '#E91E63', '#9C27B0', '#673AB7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Проверка мобильного устройства
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Проверка планшета
    isTablet() {
        return /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
    },

    // Проверка десктопа
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    },

    // Получение типа устройства
    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    },

    // Копирование в буфер обмена
    copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    },

    // Сохранение в localStorage с обработкой ошибок
    safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            return false;
        }
    },

    // Чтение из localStorage с обработкой ошибок
    safeGetItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Ошибка чтения из localStorage:', error);
            return defaultValue;
        }
    },

    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Валидация email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Валидация телефона
    isValidPhone(phone) {
        const re = /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    // Дебаунс функция
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
    },

    // Троттлинг функция
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Получение параметров из URL
    getUrlParams() {
        const params = {};
        window.location.hash.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
            params[key] = decodeURIComponent(value);
        });
        return params;
    },

    // Установка параметров в URL
    setUrlParams(params) {
        const hash = window.location.hash.split('?')[0];
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        window.location.hash = `${hash}?${queryString}`;
    }
};

// Экспорт по умолчанию
export default Helpers;