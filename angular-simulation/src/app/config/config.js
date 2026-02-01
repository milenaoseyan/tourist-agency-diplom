// Конфигурация приложения
export const Config = {
    // Основные настройки
    app: {
        name: 'TravelWave',
        version: '1.0.0',
        author: 'Дипломный проект',
        year: 2024
    },

    // API настройки
    api: {
        baseUrl: 'https://api.travelwave.com/v1',
        timeout: 10000,
        retryAttempts: 3
    },

    // Настройки localStorage
    storage: {
        prefix: 'travelwave_',
        version: '1.0'
    },

    // Настройки туров
    tours: {
        itemsPerPage: 12,
        defaultSort: 'popular',
        priceRange: {
            min: 0,
            max: 200000,
            step: 1000
        }
    },

    // Настройки корзины
    cart: {
        maxQuantity: 10,
        taxRate: 0.2, // 20% налог
        shippingCost: 0
    },

    // Настройки анимаций
    animations: {
        enabled: true,
        duration: {
            fast: 200,
            normal: 300,
            slow: 500
        }
    },

    // Настройки адаптивности
    breakpoints: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    },

    // Настройки цветов
    colors: {
        primary: '#3f51b5',
        secondary: '#2196F3',
        accent: '#ff4081',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#f44336',
        info: '#00BCD4'
    },

    // Социальные сети
    social: {
        facebook: 'https://facebook.com/travelwave',
        instagram: 'https://instagram.com/travelwave',
        telegram: 'https://t.me/travelwave',
        vk: 'https://vk.com/travelwave'
    },

    // Контакты
    contacts: {
        phone: '+7 (495) 123-45-67',
        email: 'info@travelwave.ru',
        address: 'Москва, ул. Туристическая, д. 1',
        workingHours: 'Пн-Пт: 9:00-20:00, Сб-Вс: 10:00-18:00'
    },

    // Методы получения конфигурации
    getStorageKey(key) {
        return `${this.storage.prefix}${key}_v${this.storage.version}`;
    },

    getColor(colorName) {
        return this.colors[colorName] || this.colors.primary;
    },

    getBreakpoint(breakpointName) {
        return this.breakpoints[breakpointName] || 0;
    },

    isMobile() {
        return window.innerWidth < this.breakpoints.md;
    },

    isTablet() {
        return window.innerWidth >= this.breakpoints.md && 
            window.innerWidth < this.breakpoints.lg;
    },

    isDesktop() {
        return window.innerWidth >= this.breakpoints.lg;
    }
};

// Экспорт по умолчанию
export default Config;