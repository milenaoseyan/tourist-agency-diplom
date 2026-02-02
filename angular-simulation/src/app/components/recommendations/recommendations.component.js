import RecommendationService from '../../services/recommendation.service.js';
import TourCardComponent from '../tour-card/tour-card.component.js';
import CartService from '../../services/cart.service.js';

class RecommendationsComponent {
    constructor() {
        this.recommendationService = new RecommendationService();
        this.cartService = new CartService();
        this.recommendations = [];
        this.isLoading = true;
        this.recommendationType = 'personalized'; // или 'popular'
    }

    async render() {
        this.isLoading = true;
        
        try {
            this.recommendations = await this.recommendationService.getRecommendations(6);
        } catch (error) {
            console.error('Ошибка при загрузке рекомендаций:', error);
            this.recommendations = [];
        }
        
        this.isLoading = false;

        return `
        <div class="recommendations-section">
            <div class="recommendations-header">
                <h2>🎯 Рекомендуем вам</h2>
                <div class="recommendation-tabs">
                    <button class="tab-btn ${this.recommendationType === 'personalized' ? 'active' : ''}" 
                            data-type="personalized">
                        Персональные
                    </button>
                    <button class="tab-btn ${this.recommendationType === 'popular' ? 'active' : ''}" 
                            data-type="popular">
                        Популярные
                    </button>
                </div>
            </div>
            
            ${this.isLoading ? this.renderLoader() : this.renderRecommendations()}
            
            <div class="recommendation-stats">
                <p>Рекомендации подобраны специально для вас на основе ваших предпочтений</p>
            </div>
        </div>
        `;
    }

    renderLoader() {
        return `
        <div class="recommendations-loader">
            <div class="skeleton-loader">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
            <div class="skeleton-cards">
                ${Array(3).fill().map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    renderRecommendations() {
        if (this.recommendations.length === 0) {
            return `
            <div class="no-recommendations">
                <div class="no-rec-icon">🎯</div>
                <h3>Пока нет рекомендаций</h3>
                <p>Просмотрите несколько туров, чтобы мы могли подобрать для вас лучшие предложения</p>
                <a href="#/tours" class="btn btn-primary">Смотреть все туры</a>
            </div>
            `;
        }

        const tourCards = this.recommendations.slice(0, 3).map(tour => {
            const card = new TourCardComponent(tour, this.cartService);
            return card.render();
        }).join('');

        return `
        <div class="recommendations-grid">
            ${tourCards}
        </div>
        
        ${this.recommendations.length > 3 ? `
            <div class="recommendations-more">
                <button class="btn btn-text" id="showMoreRecommendations">
                    Показать еще ${this.recommendations.length - 3} рекомендаций
                </button>
            </div>
        ` : ''}
        `;
    }

    async afterRender() {
        // Переключение типов рекомендаций
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                this.recommendationType = e.target.dataset.type;
                await this.rerender();
            });
        });

        // Показать больше рекомендаций
        const showMoreBtn = document.getElementById('showMoreRecommendations');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                this.showAllRecommendations();
            });
        }

        // Отслеживание кликов по рекомендациям
        document.querySelectorAll('.tour-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tourId = card.dataset.id;
                if (tourId) {
                    this.trackRecommendationClick(tourId);
                }
            });
        });
    }

    async rerender() {
        const container = document.querySelector('.recommendations-section');
        if (container) {
            container.innerHTML = await this.render();
            this.afterRender();
        }
    }

    showAllRecommendations() {
        const modal = document.createElement('div');
        modal.className = 'recommendations-modal-overlay';
        modal.innerHTML = `
            <div class="recommendations-modal">
                <div class="modal-header">
                    <h2>Все рекомендации</h2>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="all-recommendations-grid">
                        ${this.recommendations.map(tour => {
                            const card = new TourCardComponent(tour, this.cartService);
                            return card.render();
                        }).join('')}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal-btn">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие модального окна
        const closeModal = () => {
            modal.classList.add('fading-out');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        };
        
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Инициализация карточек
        setTimeout(() => {
            this.recommendations.forEach(tour => {
                const card = new TourCardComponent(tour, this.cartService);
                // Можно добавить дополнительную логику
            });
        }, 100);
    }

    trackRecommendationClick(tourId) {
        const user = this.recommendationService.authService.getCurrentUser();
        if (user) {
            this.recommendationService.updateUserPreferences(user.id, 'view', { tourId });
        }
    }
}

export default RecommendationsComponent;