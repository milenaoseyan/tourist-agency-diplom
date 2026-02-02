class AnalyticsService {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('analytics_events')) || [];
        this.maxEvents = 1000; // Максимальное количество хранимых событий
    }

    // Отслеживание события
    track(eventName, eventData = {}) {
        const event = {
            id: Date.now(),
            name: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            page: window.location.hash,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language
        };

        this.events.push(event);
        
        // Ограничиваем количество событий
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }
        
        this.saveEvents();
        
        console.log(`[Analytics] ${eventName}:`, eventData);
        
        return event;
    }

    // Отслеживание просмотра страницы
    trackPageView(pageName) {
        return this.track('page_view', {
            page: pageName,
            referrer: document.referrer
        });
    }

    // Отслеживание просмотра тура
    trackTourView(tourId, tourTitle) {
        return this.track('tour_view', {
            tourId: tourId,
            tourTitle: tourTitle
        });
    }

    // Отслеживание добавления в корзину
    trackAddToCart(tourId, tourTitle, price, quantity = 1) {
        return this.track('add_to_cart', {
            tourId: tourId,
            tourTitle: tourTitle,
            price: price,
            quantity: quantity,
            total: price * quantity
        });
    }

    // Отслеживание покупки
    trackPurchase(orderId, amount, items = [], coupon = null) {
        return this.track('purchase', {
            orderId: orderId,
            amount: amount,
            items: items,
            coupon: coupon,
            currency: 'RUB'
        });
    }

    // Отслеживание поиска
    trackSearch(query, resultsCount) {
        return this.track('search', {
            query: query,
            resultsCount: resultsCount,
            timestamp: new Date().toISOString()
        });
    }

    // Отслеживание клика
    trackClick(element, text, location) {
        return this.track('click', {
            element: element,
            text: text,
            location: location
        });
    }

    // Отслеживание ошибки
    trackError(error, context = {}) {
        return this.track('error', {
            error: error.toString(),
            context: context,
            stack: error.stack
        });
    }

    // Получение статистики
    getStats(timeRange = 'all') {
        let filteredEvents = this.events;
        
        if (timeRange !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (timeRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }
            
            filteredEvents = this.events.filter(event => 
                new Date(event.timestamp) >= startDate
            );
        }

        const stats = {
            totalEvents: filteredEvents.length,
            eventsByType: {},
            pageViews: 0,
            uniquePages: new Set(),
            conversionRate: 0,
            popularPages: {},
            popularTours: {},
            searchQueries: {},
            errors: 0
        };

        let cartAdds = 0;
        let purchases = 0;

        filteredEvents.forEach(event => {
            // События по типам
            stats.eventsByType[event.name] = (stats.eventsByType[event.name] || 0) + 1;

            // Просмотры страниц
            if (event.name === 'page_view') {
                stats.pageViews++;
                stats.uniquePages.add(event.data.page);
                stats.popularPages[event.data.page] = (stats.popularPages[event.data.page] || 0) + 1;
            }

            // Просмотры туров
            if (event.name === 'tour_view') {
                const tourId = event.data.tourId;
                stats.popularTours[tourId] = {
                    title: event.data.tourTitle,
                    views: (stats.popularTours[tourId]?.views || 0) + 1
                };
            }

            // Добавления в корзину
            if (event.name === 'add_to_cart') {
                cartAdds++;
                const tourId = event.data.tourId;
                if (stats.popularTours[tourId]) {
                    stats.popularTours[tourId].cartAdds = (stats.popularTours[tourId].cartAdds || 0) + 1;
                }
            }

            // Покупки
            if (event.name === 'purchase') {
                purchases++;
            }

            // Поисковые запросы
            if (event.name === 'search') {
                const query = event.data.query;
                stats.searchQueries[query] = (stats.searchQueries[query] || 0) + 1;
            }

            // Ошибки
            if (event.name === 'error') {
                stats.errors++;
            }
        });

        // Расчет конверсии
        if (cartAdds > 0) {
            stats.conversionRate = (purchases / cartAdds) * 100;
        }

        // Сортировка популярных страниц
        stats.popularPages = Object.entries(stats.popularPages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, val]) => {
                obj[key] = val;
                return obj;
            }, {});

        // Сортировка популярных туров
        stats.popularTours = Object.values(stats.popularTours)
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Сортировка поисковых запросов
        stats.searchQueries = Object.entries(stats.searchQueries)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, val]) => {
                obj[key] = val;
                return obj;
            }, {});

        stats.uniquePagesCount = stats.uniquePages.size;

        return stats;
    }

    // Получение пользовательской аналитики
    getUserAnalytics() {
        const events = this.events;
        const sessions = this.groupEventsIntoSessions(events);
        
        return {
            totalSessions: sessions.length,
            averageSessionDuration: this.calculateAverageSessionDuration(sessions),
            bounceRate: this.calculateBounceRate(sessions),
            returningVisitors: this.calculateReturningVisitors(sessions),
            deviceBreakdown: this.getDeviceBreakdown(events),
            trafficSources: this.getTrafficSources(events)
        };
    }

    // Группировка событий в сессии
    groupEventsIntoSessions(events, sessionTimeout = 30 * 60 * 1000) { // 30 минут
        if (events.length === 0) return [];
        
        const sessions = [];
        let currentSession = [events[0]];
        
        for (let i = 1; i < events.length; i++) {
            const prevTime = new Date(events[i-1].timestamp).getTime();
            const currentTime = new Date(events[i].timestamp).getTime();
            
            if (currentTime - prevTime > sessionTimeout) {
                sessions.push(currentSession);
                currentSession = [events[i]];
            } else {
                currentSession.push(events[i]);
            }
        }
        
        if (currentSession.length > 0) {
            sessions.push(currentSession);
        }
        
        return sessions;
    }

    // Расчет средней длительности сессии
    calculateAverageSessionDuration(sessions) {
        if (sessions.length === 0) return 0;
        
        const totalDuration = sessions.reduce((total, session) => {
            if (session.length < 2) return total;
            
            const firstEvent = new Date(session[0].timestamp);
            const lastEvent = new Date(session[session.length - 1].timestamp);
            return total + (lastEvent - firstEvent);
        }, 0);
        
        return Math.round(totalDuration / sessions.length / 1000); // в секундах
    }

    // Расчет bounce rate (одно событие в сессии)
    calculateBounceRate(sessions) {
        if (sessions.length === 0) return 0;
        
        const bounceSessions = sessions.filter(session => session.length === 1);
        return (bounceSessions.length / sessions.length) * 100;
    }

    // Расчет возвращающихся пользователей
    calculateReturningVisitors(sessions) {
        // Упрощенная логика
        return Math.min(30, sessions.length); // Пример
    }

    // Разбивка по устройствам
    getDeviceBreakdown(events) {
        const breakdown = {
            mobile: 0,
            desktop: 0,
            tablet: 0
        };
        
        events.forEach(event => {
            const ua = event.userAgent.toLowerCase();
            
            if (ua.includes('mobile')) {
                breakdown.mobile++;
            } else if (ua.includes('tablet') || ua.includes('ipad')) {
                breakdown.tablet++;
            } else {
                breakdown.desktop++;
            }
        });
        
        return breakdown;
    }

    // Источники трафика
    getTrafficSources(events) {
        const sources = {
            direct: 0,
            organic: 0,
            referral: 0,
            social: 0
        };
        
        events.forEach(event => {
            if (event.name === 'page_view') {
                const referrer = event.data.referrer;
                
                if (!referrer || referrer === '') {
                    sources.direct++;
                } else if (referrer.includes('google') || referrer.includes('yandex')) {
                    sources.organic++;
                } else if (referrer.includes('vk.com') || referrer.includes('facebook.com')) {
                    sources.social++;
                } else {
                    sources.referral++;
                }
            }
        });
        
        return sources;
    }

    // Экспорт данных
    exportData(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.events, null, 2);
            case 'csv':
                return this.convertToCSV();
            default:
                return this.events;
        }
    }

    convertToCSV() {
        if (this.events.length === 0) return '';
        
        const headers = ['timestamp', 'event', 'page', 'data'];
        const rows = this.events.map(event => [
            event.timestamp,
            event.name,
            event.page,
            JSON.stringify(event.data)
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    // Очистка старых данных
    cleanupOldData(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const initialCount = this.events.length;
        this.events = this.events.filter(event => 
            new Date(event.timestamp) > cutoffDate
        );
        
        const removedCount = initialCount - this.events.length;
        this.saveEvents();
        
        return {
            removed: removedCount,
            remaining: this.events.length
        };
    }

    // Сохранение событий
    saveEvents() {
        localStorage.setItem('analytics_events', JSON.stringify(this.events));
    }

    // Инициализация автоматического отслеживания
    initAutoTracking() {
        // Отслеживание загрузки страницы
        window.addEventListener('load', () => {
            this.trackPageView(window.location.hash || '/');
        });

        // Отслеживание изменений hash (SPA навигация)
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                this.trackPageView(window.location.hash);
            }, 100);
        });

        // Отслеживание кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.trackClick('link', link.textContent || link.href, window.location.hash);
            }
        });

        // Отслеживание ошибок
        window.addEventListener('error', (e) => {
            this.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Отслеживание ухода со страницы
        window.addEventListener('beforeunload', () => {
            this.track('page_exit', {
                timeOnPage: this.calculateTimeOnPage()
            });
        });
    }

    calculateTimeOnPage() {
        // Простая реализация
        const pageEnterTime = performance.now();
        return Math.round(performance.now() - pageEnterTime);
    }
}

export default AnalyticsService;