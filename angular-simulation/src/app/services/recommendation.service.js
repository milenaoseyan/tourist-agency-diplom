import TourService from './tour.service.js';
import AuthService from './auth.service.js';

class RecommendationService {
    constructor() {
        this.tourService = new TourService();
        this.authService = new AuthService();
        this.userPreferences = JSON.parse(localStorage.getItem('user_preferences')) || {};
    }

    // Получение рекомендаций на основе истории просмотров
    getRecommendations(limit = 6) {
        const user = this.authService.getCurrentUser();
        const allTours = this.tourService.getAllTours();
        
        if (!user) {
            // Для неавторизованных пользователей - популярные туры
            return this.getPopularRecommendations(limit);
        }
        
        // Для авторизованных - персонализированные рекомендации
        return this.getPersonalizedRecommendations(user.id, limit);
    }

    // Популярные рекомендации
    getPopularRecommendations(limit) {
        const tours = this.tourService.getAllTours();
        return tours
            .filter(tour => tour.isPopular)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    // Персонализированные рекомендации
    getPersonalizedRecommendations(userId, limit) {
        const userPreferences = this.getUserPreferences(userId);
        const viewedTours = userPreferences.viewedTours || [];
        const bookedTours = userPreferences.bookedTours || [];
        const favoriteCategories = userPreferences.favoriteCategories || [];
        
        const allTours = this.tourService.getAllTours();
        
        // Исключаем уже просмотренные и забронированные туры
        const availableTours = allTours.filter(tour => 
            !viewedTours.includes(tour.id) && !bookedTours.includes(tour.id)
        );
        
        // Сортируем по релевантности
        const scoredTours = availableTours.map(tour => ({
            tour,
            score: this.calculateRelevanceScore(tour, userPreferences)
        }));
        
        // Сортируем по убыванию релевантности
        scoredTours.sort((a, b) => b.score - a.score);
        
        return scoredTours.slice(0, limit).map(item => item.tour);
    }

    // Расчет релевантности
    calculateRelevanceScore(tour, userPreferences) {
        let score = 0;
        
        // Предпочтения по категориям
        if (userPreferences.favoriteCategories.includes(tour.category)) {
            score += 3;
        }
        
        // Популярность тура
        if (tour.isPopular) {
            score += 2;
        }
        
        // Высокий рейтинг
        if (tour.rating >= 4.5) {
            score += 2;
        }
        
        // Ценовой диапазон пользователя
        const userPriceRange = userPreferences.priceRange || { min: 0, max: 200000 };
        if (tour.price >= userPriceRange.min && tour.price <= userPriceRange.max) {
            score += 1;
        }
        
        // Предпочтения по продолжительности
        const userDurationPreference = userPreferences.preferredDuration;
        if (userDurationPreference) {
            const durationDiff = Math.abs(tour.duration - userDurationPreference);
            if (durationDiff <= 2) {
                score += 1;
            }
        }
        
        return score;
    }

    // Обновление предпочтений пользователя
    updateUserPreferences(userId, action, data) {
        if (!this.userPreferences[userId]) {
            this.userPreferences[userId] = {
                viewedTours: [],
                bookedTours: [],
                favoriteCategories: [],
                priceRange: { min: 0, max: 200000 },
                preferredDuration: null
            };
        }
        
        switch (action) {
            case 'view':
                if (!this.userPreferences[userId].viewedTours.includes(data.tourId)) {
                    this.userPreferences[userId].viewedTours.push(data.tourId);
                    
                    // Обновление любимых категорий
                    const tour = this.tourService.getTourById(data.tourId);
                    if (tour && !this.userPreferences[userId].favoriteCategories.includes(tour.category)) {
                        this.userPreferences[userId].favoriteCategories.push(tour.category);
                    }
                }
                break;
                
            case 'book':
                if (!this.userPreferences[userId].bookedTours.includes(data.tourId)) {
                    this.userPreferences[userId].bookedTours.push(data.tourId);
                }
                break;
                
            case 'set_price_range':
                this.userPreferences[userId].priceRange = data;
                break;
                
            case 'set_duration':
                this.userPreferences[userId].preferredDuration = data;
                break;
        }
        
        this.savePreferences();
    }

    // Получение предпочтений пользователя
    getUserPreferences(userId) {
        return this.userPreferences[userId] || {
            viewedTours: [],
            bookedTours: [],
            favoriteCategories: [],
            priceRange: { min: 0, max: 200000 },
            preferredDuration: null
        };
    }

    // Сохранение предпочтений
    savePreferences() {
        localStorage.setItem('user_preferences', JSON.stringify(this.userPreferences));
    }

    // Получение похожих туров
    getSimilarTours(tourId, limit = 3) {
        const currentTour = this.tourService.getTourById(tourId);
        if (!currentTour) return [];
        
        const allTours = this.tourService.getAllTours();
        
        const similarTours = allTours
            .filter(tour => tour.id !== tourId && tour.category === currentTour.category)
            .sort((a, b) => {
                // Сортируем по схожести цены и рейтинга
                const priceDiffA = Math.abs(a.price - currentTour.price);
                const priceDiffB = Math.abs(b.price - currentTour.price);
                
                if (priceDiffA !== priceDiffB) {
                    return priceDiffA - priceDiffB;
                }
                
                return b.rating - a.rating;
            })
            .slice(0, limit);
        
        return similarTours;
    }

    // Топ категорий пользователя
    getUserTopCategories(userId, limit = 3) {
        const preferences = this.getUserPreferences(userId);
        const categoryCount = {};
        
        preferences.viewedTours.forEach(tourId => {
            const tour = this.tourService.getTourById(tourId);
            if (tour) {
                categoryCount[tour.category] = (categoryCount[tour.category] || 0) + 1;
            }
        });
        
        preferences.bookedTours.forEach(tourId => {
            const tour = this.tourService.getTourById(tourId);
            if (tour) {
                categoryCount[tour.category] = (categoryCount[tour.category] || 0) + 3; // Бронирование дает больший вес
            }
        });
        
        // Сортируем категории по убыванию предпочтений
        const sortedCategories = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([category]) => category);
        
        return sortedCategories;
    }

    // Получение статистики рекомендаций
    getRecommendationStats(userId) {
        const preferences = this.getUserPreferences(userId);
        
        return {
            totalViews: preferences.viewedTours.length,
            totalBookings: preferences.bookedTours.length,
            favoriteCategories: this.getUserTopCategories(userId),
            priceRange: preferences.priceRange,
            accuracy: this.calculateRecommendationAccuracy(userId)
        };
    }

    // Расчет точности рекомендаций (простая имитация)
    calculateRecommendationAccuracy(userId) {
        const preferences = this.getUserPreferences(userId);
        const bookedFromRecommended = preferences.bookedTours.length;
        const totalBooked = preferences.bookedTours.length;
        
        if (totalBooked === 0) return 0;
        
        // Простой расчет (можно усложнить)
        return Math.min(100, (bookedFromRecommended / totalBooked) * 100);
    }
}

export default RecommendationService;