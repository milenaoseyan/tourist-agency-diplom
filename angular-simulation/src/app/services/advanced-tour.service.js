import ApiService from './api.service.js';

class AdvancedTourService {
  constructor() {
    this.api = new ApiService();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }

  async getAllTours(forceRefresh = false) {
    const cacheKey = 'all_tours';
    
    // Проверка кэша
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    // Показываем индикатор загрузки
    NotificationCenterComponent.loading('Загрузка туров...');

    try {
      // Имитация запроса к API
      await this.api.simulateDelay(800);
      
      const tours = JSON.parse(localStorage.getItem('tours')) || this.getMockTours();
      
      // Сохраняем в кэш
      this.saveToCache(cacheKey, tours);
      
      // Обновляем хранилище
      store.dispatch({
        type: 'SET_TOURS',
        payload: tours
      });
      
      NotificationCenterComponent.remove('loading');
      return tours;
    } catch (error) {
      NotificationCenterComponent.error('Ошибка загрузки туров');
      console.error('Error loading tours:', error);
      
      // Пробуем вернуть из кэша даже если он устарел
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
      
      return [];
    }
  }

  async getTourById(id, forceRefresh = false) {
    const cacheKey = `tour_${id}`;
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      await this.api.simulateDelay(300);
      const tours = await this.getAllTours();
      const tour = tours.find(t => t.id === parseInt(id));
      
      if (tour) {
        this.saveToCache(cacheKey, tour);
        return tour;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting tour:', error);
      return null;
    }
  }

  async searchTours(query, filters = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    NotificationCenterComponent.loading('Поиск туров...');

    try {
      await this.api.simulateDelay(500);
      const tours = await this.getAllTours();
      
      let results = tours;
      
      // Поиск по тексту
      if (query && query.trim().length > 0) {
        const searchTerm = query.toLowerCase();
        results = results.filter(tour =>
          tour.title.toLowerCase().includes(searchTerm) ||
          tour.location.toLowerCase().includes(searchTerm) ||
          tour.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Фильтрация
      if (filters.category) {
        results = results.filter(tour => tour.category === filters.category);
      }
      
      if (filters.priceRange) {
        results = results.filter(tour =>
          tour.price >= filters.priceRange.min &&
          tour.price <= filters.priceRange.max
        );
      }
      
      if (filters.duration) {
        results = results.filter(tour =>
          tour.duration >= filters.duration.min &&
          tour.duration <= filters.duration.max
        );
      }
      
      if (filters.rating) {
        results = results.filter(tour => tour.rating >= filters.rating);
      }
      
      // Сортировка
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            results.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            results.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            results.sort((a, b) => b.rating - a.rating);
            break;
          case 'popular':
            results.sort((a, b) => b.views - a.views);
            break;
        }
      }
      
      // Сохраняем в кэш
      this.saveToCache(cacheKey, results);
      
      NotificationCenterComponent.remove('loading');
      return results;
    } catch (error) {
      NotificationCenterComponent.error('Ошибка поиска');
      console.error('Error searching tours:', error);
      return [];
    }
  }

  async updateTourViewCount(tourId) {
    try {
      const tours = await this.getAllTours();
      const tourIndex = tours.findIndex(t => t.id === tourId);
      
      if (tourIndex !== -1) {
        tours[tourIndex].views = (tours[tourIndex].views || 0) + 1;
        localStorage.setItem('tours', JSON.stringify(tours));
        
        // Инвалидируем кэш
        this.invalidateCache('all_tours');
        this.invalidateCache(`tour_${tourId}`);
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  }

  // Методы кэширования
  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  invalidateCache(key) {
    this.cache.delete(key);
  }

  clearCache() {
    this.cache.clear();
  }

  // Дефолтные данные
  getMockTours() {
    // Возвращаем существующие моковые данные
    return [
      // ... существующие туры
    ];
  }
}

export default AdvancedTourService;