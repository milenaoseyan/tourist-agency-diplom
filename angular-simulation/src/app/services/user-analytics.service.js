import store from '../store/store.js';

class UserAnalyticsService {
  constructor() {
    this.userStats = JSON.parse(localStorage.getItem('user_stats')) || {};
    this.sessionStart = Date.now();
    this.initSession();
  }

  initSession() {
    const sessionId = Date.now();
    this.currentSession = {
      id: sessionId,
      startTime: this.sessionStart,
      pageViews: [],
      actions: [],
      tourViews: [],
      searchQueries: []
    };

    // Отслеживание событий
    this.trackEvent('session_start', {
      sessionId,
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`
    });

    // Отслеживание времени на странице
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  trackEvent(eventName, data = {}) {
    const userId = store.getState().user?.id || 'anonymous';
    const event = {
      id: Date.now(),
      event: eventName,
      userId,
      data,
      timestamp: new Date().toISOString(),
      page: window.location.hash,
      sessionId: this.currentSession.id
    };

    // Добавляем в текущую сессию
    this.currentSession.actions.push(event);

    // Сохраняем в общую статистику пользователя
    if (!this.userStats[userId]) {
      this.userStats[userId] = {
        totalSessions: 0,
        totalEvents: 0,
        favoriteCategories: [],
        totalSpent: 0,
        toursViewed: [],
        toursBooked: [],
        searchHistory: []
      };
    }

    this.userStats[userId].totalEvents++;
    
    // Обработка специфических событий
    switch (eventName) {
      case 'tour_view':
        this.handleTourView(data);
        break;
      case 'tour_book':
        this.handleTourBook(data);
        break;
      case 'search':
        this.handleSearch(data);
        break;
      case 'add_to_cart':
        this.handleAddToCart(data);
        break;
    }

    this.saveStats();
    return event;
  }

  handleTourView(data) {
    const userId = store.getState().user?.id;
    if (!userId) return;

    // Добавляем просмотр тура
    if (!this.userStats[userId].toursViewed.includes(data.tourId)) {
      this.userStats[userId].toursViewed.push(data.tourId);
    }

    // Обновляем избранные категории
    if (data.category && !this.userStats[userId].favoriteCategories.includes(data.category)) {
      this.userStats[userId].favoriteCategories.push(data.category);
    }

    // Добавляем в историю сессии
    if (!this.currentSession.tourViews.find(t => t.tourId === data.tourId)) {
      this.currentSession.tourViews.push({
        tourId: data.tourId,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleTourBook(data) {
    const userId = store.getState().user?.id;
    if (!userId) return;

    if (!this.userStats[userId].toursBooked.includes(data.tourId)) {
      this.userStats[userId].toursBooked.push(data.tourId);
    }

    this.userStats[userId].totalSpent += (data.amount || 0);
  }

  handleSearch(data) {
    const userId = store.getState().user?.id;
    if (!userId) return;

    this.userStats[userId].searchHistory.push({
      query: data.query,
      results: data.resultsCount,
      timestamp: new Date().toISOString()
    });

    // Ограничиваем историю поиска
    if (this.userStats[userId].searchHistory.length > 50) {
      this.userStats[userId].searchHistory = this.userStats[userId].searchHistory.slice(-50);
    }

    this.currentSession.searchQueries.push(data.query);
  }

  handleAddToCart(data) {
    // Трекинг добавления в корзину
    const cartData = {
      tourId: data.tourId,
      price: data.price,
      quantity: data.quantity,
      timestamp: new Date().toISOString()
    };

    if (!this.currentSession.cartAdds) {
      this.currentSession.cartAdds = [];
    }
    this.currentSession.cartAdds.push(cartData);
  }

  trackPageView(pageName) {
    const pageView = {
      page: pageName,
      timestamp: new Date().toISOString(),
      timeOnPreviousPage: this.calculateTimeOnPreviousPage()
    };

    this.currentSession.pageViews.push(pageView);
    this.trackEvent('page_view', { page: pageName });

    // Обновляем время последней страницы
    this.lastPageViewTime = Date.now();
  }

  calculateTimeOnPreviousPage() {
    if (!this.lastPageViewTime) return 0;
    return Date.now() - this.lastPageViewTime;
  }

  trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStart;
    
    this.trackEvent('session_end', {
      sessionId: this.currentSession.id,
      duration: sessionDuration,
      pageViews: this.currentSession.pageViews.length,
      actions: this.currentSession.actions.length,
      tourViews: this.currentSession.tourViews.length
    });

    const userId = store.getState().user?.id;
    if (userId && this.userStats[userId]) {
      this.userStats[userId].totalSessions++;
    }
  }

  getUserStats(userId) {
    return this.userStats[userId] || this.getDefaultStats();
  }

  getDefaultStats() {
    return {
      totalSessions: 0,
      totalEvents: 0,
      favoriteCategories: [],
      totalSpent: 0,
      toursViewed: [],
      toursBooked: [],
      searchHistory: []
    };
  }

  getUserRecommendations(userId) {
    const stats = this.getUserStats(userId);
    
    if (stats.toursViewed.length === 0) {
      return {
        basedOn: 'popular',
        message: 'Популярные туры',
        tours: []
      };
    }

    // Анализ предпочтений
    const categoryPreferences = {};
    stats.toursViewed.forEach(tourId => {
      // Здесь должна быть логика получения категории тура
      // Пока используем моковые данные
      const categories = ['beach', 'city', 'mountain', 'cultural'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      categoryPreferences[randomCategory] = (categoryPreferences[randomCategory] || 0) + 1;
    });

    const favoriteCategory = Object.entries(categoryPreferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return {
      basedOn: 'preferences',
      favoriteCategory,
      viewedCount: stats.toursViewed.length,
      bookedCount: stats.toursBooked.length,
      conversionRate: stats.toursViewed.length > 0 
        ? (stats.toursBooked.length / stats.toursViewed.length * 100).toFixed(1) 
        : '0.0'
    };
  }

  getUserActivityTimeline(userId, days = 30) {
    const stats = this.getUserStats(userId);
    const timeline = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Здесь должна быть логика подсчета активности по дням
      // Пока возвращаем моковые данные
      timeline.push({
        date: dateStr,
        views: Math.floor(Math.random() * 5),
        searches: Math.floor(Math.random() * 3),
        bookings: Math.random() > 0.8 ? 1 : 0
      });
    }

    return timeline;
  }

  getPopularDestinations(userId) {
    const stats = this.getUserStats(userId);
    
    // Моковые данные популярных направлений
    return [
      { destination: 'Турция', views: 45, bookings: 12 },
      { destination: 'Египет', views: 38, bookings: 8 },
      { destination: 'Таиланд', views: 32, bookings: 6 },
      { destination: 'Испания', views: 28, bookings: 5 },
      { destination: 'Греция', views: 25, bookings: 4 }
    ].slice(0, stats.toursViewed.length > 0 ? 5 : 3);
  }

  getUserInsights(userId) {
    const stats = this.getUserStats(userId);
    const recommendations = this.getUserRecommendations(userId);
    const timeline = this.getUserActivityTimeline(userId, 7);
    const destinations = this.getPopularDestinations(userId);

    const insights = [];

    // Инсайт 1: Активность
    if (stats.toursViewed.length > 10) {
      insights.push({
        type: 'activity',
        title: 'Активный исследователь',
        message: `Вы просмотрели ${stats.toursViewed.length} туров`,
        icon: '🔍'
      });
    }

    // Инсайт 2: Конверсия
    if (stats.toursBooked.length > 0) {
      const conversionRate = (stats.toursBooked.length / stats.toursViewed.length * 100).toFixed(1);
      insights.push({
        type: 'conversion',
        title: 'Решительный путешественник',
        message: `Конверсия просмотров в бронирования: ${conversionRate}%`,
        icon: '🎯'
      });
    }

    // Инсайт 3: Предпочтения
    if (recommendations.favoriteCategory) {
      const categoryNames = {
        beach: 'пляжного',
        city: 'городского',
        mountain: 'горного',
        cultural: 'культурного'
      };
      
      insights.push({
        type: 'preferences',
        title: 'Любитель ' + (categoryNames[recommendations.favoriteCategory] || 'путешествий'),
        message: 'Вам нравится ' + (categoryNames[recommendations.favoriteCategory] || 'это направление'),
        icon: '❤️'
      });
    }

    // Инсайт 4: Траты
    if (stats.totalSpent > 0) {
      insights.push({
        type: 'spending',
        title: 'Инвестиции в впечатления',
        message: `Потрачено на путешествия: ${stats.totalSpent.toLocaleString('ru-RU')} ₽`,
        icon: '💰'
      });
    }

    // Если инсайтов мало, добавляем общие
    if (insights.length < 2) {
      insights.push({
        type: 'welcome',
        title: 'Начинающий путешественник',
        message: 'Исследуйте новые направления и находите свои любимые места',
        icon: '🌍'
      });
      
      insights.push({
        type: 'tip',
        title: 'Совет',
        message: 'Добавляйте туры в избранное, чтобы вернуться к ним позже',
        icon: '💡'
      });
    }

    return {
      stats,
      recommendations,
      timeline: timeline.slice(-7), // Последние 7 дней
      destinations,
      insights
    };
  }

  exportUserData(userId) {
    const userData = {
      exportedAt: new Date().toISOString(),
      userStats: this.getUserStats(userId),
      recommendations: this.getUserRecommendations(userId),
      insights: this.getUserInsights(userId)
    };

    return JSON.stringify(userData, null, 2);
  }

  saveStats() {
    localStorage.setItem('user_stats', JSON.stringify(this.userStats));
  }

  clearUserData(userId) {
    if (this.userStats[userId]) {
      delete this.userStats[userId];
      this.saveStats();
      return true;
    }
    return false;
  }

  // Статические методы для быстрого использования
  static track(eventName, data) {
    const service = new UserAnalyticsService();
    return service.trackEvent(eventName, data);
  }

  static trackPageView(pageName) {
    const service = new UserAnalyticsService();
    return service.trackPageView(pageName);
  }

  static getUserInsights(userId) {
    const service = new UserAnalyticsService();
    return service.getUserInsights(userId);
  }
}

export default UserAnalyticsService;