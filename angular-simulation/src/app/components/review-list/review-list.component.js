import ReviewService from '../../services/review.service.js';
import AuthService from '../../services/auth.service.js';

class ReviewListComponent {
    constructor(tourId) {
        this.tourId = tourId;
        this.reviewService = new ReviewService();
        this.authService = new AuthService();
        this.reviews = [];
        this.isLoading = true;
    }

    async render() {
        this.reviews = await this.reviewService.getReviewsForTour(this.tourId);
        this.isLoading = false;

        return `
        <div class="reviews-section">
            <div class="reviews-header">
                <h3>📝 Отзывы</h3>
                <div class="reviews-stats">
                    <span class="rating-badge">
                        ⭐ ${this.getAverageRating()}
                    </span>
                    <span class="reviews-count">
                        ${this.reviews.length} отзывов
                    </span>
                </div>
            </div>
            
            ${this.isLoading ? this.renderLoader() : this.renderReviews()}
            
            ${this.renderAddReviewForm()}
        </div>
        `;
    }

    renderLoader() {
        return `
        <div class="reviews-loader">
            <div class="spinner"></div>
            <p>Загрузка отзывов...</p>
        </div>
        `;
    }

    renderReviews() {
        if (this.reviews.length === 0) {
            return `
            <div class="no-reviews">
                <p>Пока нет отзывов. Будьте первым!</p>
            </div>
            `;
        }

        const approvedReviews = this.reviews.filter(r => r.approved);
        
        if (approvedReviews.length === 0) {
            return `
            <div class="no-reviews">
                <p>Отзывы на модерации</p>
            </div>
            `;
        }

        return `
        <div class="reviews-list">
            ${approvedReviews.slice(0, 5).map(review => this.renderReviewItem(review)).join('')}
            
            ${approvedReviews.length > 5 ? `
                <button class="btn btn-text show-more-reviews">
                    Показать все отзывы (${approvedReviews.length})
                </button>
            ` : ''}
        </div>
        `;
    }

    renderReviewItem(review) {
        return `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="${review.userAvatar}" alt="${review.userName}" class="reviewer-avatar">
                    <div>
                        <h4>${review.userName}</h4>
                        <div class="review-rating">
                            ${this.renderStars(review.rating)}
                            <span class="review-date">${this.formatDate(review.date)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="review-content">
                <p>${review.comment}</p>
            </div>
        </div>
        `;
    }

    renderAddReviewForm() {
        const isLoggedIn = this.authService.isLoggedIn();
        
        if (!isLoggedIn) {
            return `
            <div class="review-login-prompt">
                <p>Войдите, чтобы оставить отзыв</p>
                <button class="btn btn-small" id="loginToReview">
                    Войти
                </button>
            </div>
            `;
        }

        const user = this.authService.getCurrentUser();
        
        return `
        <div class="add-review-form">
            <h4>Оставить отзыв</h4>
            <form id="reviewForm">
                <div class="rating-input">
                    <label>Ваша оценка:</label>
                    <div class="star-rating">
                        ${[1,2,3,4,5].map(star => `
                            <button type="button" class="star-btn" data-rating="${star}">
                                ${star <= 4 ? '★' : '☆'}
                            </button>
                        `).join('')}
                        <input type="hidden" id="reviewRating" value="5">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="reviewComment">Ваш отзыв:</label>
                    <textarea id="reviewComment" rows="4" 
                              placeholder="Поделитесь впечатлениями о туре..." 
                              required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        Отправить отзыв
                    </button>
                </div>
            </form>
        </div>
        `;
    }

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return `<span class="stars">${stars}</span>`;
    }

    async afterRender() {
        // Кнопка "Показать все отзывы"
        const showMoreBtn = document.querySelector('.show-more-reviews');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.showAllReviews();
            });
        }

        // Кнопка входа для оставления отзыва
        const loginBtn = document.getElementById('loginToReview');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                import('../auth-modal/auth-modal.component.js').then(module => {
                    module.default.open(() => {
                        this.rerender();
                    });
                });
            });
        }

        // Форма отзыва
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            // Рейтинг звездами
            document.querySelectorAll('.star-btn').forEach(star => {
                star.addEventListener('click', (e) => {
                    const rating = parseInt(e.target.dataset.rating);
                    this.setRating(rating);
                });
            });

            // Отправка формы
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitReview();
            });
        }
    }

    setRating(rating) {
        document.getElementById('reviewRating').value = rating;
        
        // Обновляем отображение звезд
        document.querySelectorAll('.star-btn').forEach((star, index) => {
            star.textContent = index < rating ? '★' : '☆';
            star.classList.toggle('active', index < rating);
        });
    }

    async submitReview() {
        const user = this.authService.getCurrentUser();
        const rating = parseInt(document.getElementById('reviewRating').value);
        const comment = document.getElementById('reviewComment').value;

        if (!comment.trim()) {
            alert('Пожалуйста, напишите отзыв');
            return;
        }

        try {
            const reviewData = {
                tourId: this.tourId,
                userId: user.id,
                userName: user.name,
                userAvatar: `https://randomuser.me/api/portraits/${user.gender || 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
                rating: rating,
                comment: comment,
                date: new Date().toISOString().split('T')[0]
            };

            await this.reviewService.addReview(reviewData);
            
            // Очищаем форму
            document.getElementById('reviewComment').value = '';
            this.setRating(5);
            
            // Обновляем список отзывов
            this.reviews = await this.reviewService.getReviewsForTour(this.tourId);
            this.rerender();
            
            this.showNotification('Спасибо за ваш отзыв! Он появится после модерации.', 'success');
            
        } catch (error) {
            this.showNotification('Ошибка при отправке отзыва', 'error');
        }
    }

    showAllReviews() {
        // Можно открыть модальное окно со всеми отзывами
        const allReviews = this.reviews.filter(r => r.approved);
        
        const modal = document.createElement('div');
        modal.className = 'all-reviews-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Все отзывы</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${allReviews.map(review => this.renderReviewItem(review)).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getAverageRating() {
        const approvedReviews = this.reviews.filter(r => r.approved);
        if (approvedReviews.length === 0) return '0.0';
        
        const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        return avg.toFixed(1);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    async rerender() {
        const container = document.querySelector('.reviews-section');
        if (container) {
            container.innerHTML = await this.render();
            this.afterRender();
        }
    }
}

export default ReviewListComponent;