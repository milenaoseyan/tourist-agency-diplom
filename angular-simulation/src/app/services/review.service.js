import ApiService from './api.service.js';

class ReviewService {
    constructor() {
        this.api = new ApiService();
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || this.getMockReviews();
    }

    // Получение отзывов для тура
    async getReviewsForTour(tourId) {
        await this.api.simulateDelay();
        return this.reviews.filter(review => review.tourId === tourId);
    }

    // Добавление отзыва
    async addReview(reviewData) {
        await this.api.simulateDelay();
        
        const newReview = {
            id: Date.now(),
            ...reviewData,
            createdAt: new Date().toISOString(),
            approved: false
        };
        
        this.reviews.push(newReview);
        this.saveReviews();
        
        // Обновляем рейтинг тура
        this.updateTourRating(reviewData.tourId);
        
        return newReview;
    }

    // Получение всех отзывов (для админа)
    async getAllReviews() {
        await this.api.simulateDelay();
        return this.reviews;
    }

    // Одобрение отзыва
    async approveReview(reviewId) {
        await this.api.simulateDelay();
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.approved = true;
            this.saveReviews();
        }
        return review;
    }

    // Удаление отзыва
    async deleteReview(reviewId) {
        await this.api.simulateDelay();
        this.reviews = this.reviews.filter(r => r.id !== reviewId);
        this.saveReviews();
        return true;
    }

    // Обновление рейтинга тура
    updateTourRating(tourId) {
        const tourReviews = this.reviews.filter(r => 
            r.tourId === tourId && r.approved
        );
        
        if (tourReviews.length > 0) {
            const averageRating = tourReviews.reduce((sum, review) => 
                sum + review.rating, 0
            ) / tourReviews.length;
            
            // Здесь можно обновить рейтинг в сервисе туров
            this.updateTourInStorage(tourId, averageRating);
        }
    }

    updateTourInStorage(tourId, rating) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        const tourIndex = tours.findIndex(t => t.id === tourId);
        
        if (tourIndex !== -1) {
            tours[tourIndex].rating = parseFloat(rating.toFixed(1));
            localStorage.setItem('tours', JSON.stringify(tours));
        }
    }

    // Сохранение отзывов
    saveReviews() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }

    // Моковые отзывы для демонстрации
    getMockReviews() {
        return [
            {
                id: 1,
                tourId: 1,
                userId: 101,
                userName: "Анна Петрова",
                userAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
                rating: 5,
                comment: "Отличный тур! Все было организовано на высшем уровне. Особенно понравились экскурсии.",
                date: "2024-01-15",
                approved: true
            },
            {
                id: 2,
                tourId: 1,
                userId: 102,
                userName: "Иван Сидоров",
                userAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
                rating: 4,
                comment: "Хороший отель, вкусные завтраки. Не хватило свободного времени для самостоятельных прогулок.",
                date: "2024-01-20",
                approved: true
            },
            {
                id: 3,
                tourId: 2,
                userId: 103,
                userName: "Мария Иванова",
                userAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
                rating: 5,
                comment: "Париж - это мечта! Тур превзошел все ожидания. Обязательно вернемся!",
                date: "2024-01-10",
                approved: true
            },
            {
                id: 4,
                tourId: 3,
                userId: 104,
                userName: "Сергей Кузнецов",
                userAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
                rating: 4,
                comment: "Пляжи супер, море чистое. Питание в отеле можно было бы лучше.",
                date: "2024-01-05",
                approved: true
            }
        ];
    }

    // Статистика отзывов
    getStats() {
        const totalReviews = this.reviews.length;
        const approvedReviews = this.reviews.filter(r => r.approved).length;
        const averageRating = this.reviews.length > 0 
            ? this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length
            : 0;
        
        return {
            totalReviews,
            approvedReviews,
            averageRating: parseFloat(averageRating.toFixed(1)),
            pendingReviews: totalReviews - approvedReviews
        };
    }
}

export default ReviewService;