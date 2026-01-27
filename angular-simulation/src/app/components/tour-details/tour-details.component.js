import CartService from '../../services/cart.service.js';

class TourDetailsComponent {
    constructor(tourId) {
        this.tourId = tourId;
        this.cartService = new CartService();
    }

    render(tour) {
        if (!tour) {
            return `<div class="tour-not-found">Тур не найден</div>`;
        }

        return `
        <div class="tour-details">
            <div class="tour-header">
                <button onclick="window.history.back()" class="back-btn">
                    ← Назад к турам
                </button>
                <h1>${tour.title}</h1>
                <div class="tour-meta">
                    <span class="tour-location">📍 ${tour.location}</span>
                    <span class="tour-rating">⭐ ${tour.rating}/5</span>
                    <span class="tour-duration">📅 ${tour.duration} дней</span>
                </div>
            </div>
            
            <div class="tour-content">
                <div class="tour-image-container">
                    <img src="${tour.image}" alt="${tour.title}" class="tour-main-image">
                    <button class="favorite-btn ${this.cartService.isFavorite(tour.id) ? 'active' : ''}" 
                            data-tour-id="${tour.id}">
                        ❤️
                    </button>
                </div>
                
                <div class="tour-info">
                    <div class="tour-description">
                        <h2>Описание тура</h2>
                        <p>${tour.description}</p>
                        
                        <div class="tour-includes">
                            <h3>Включено в тур:</h3>
                            <ul>
                                ${tour.includes.map(item => `
                                    <li>${this.getIncludeIcon(item)} ${this.getIncludeName(item)}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tour-booking">
                        <div class="price-card">
                            <div class="price-info">
                                <span class="price-label">Цена за человека:</span>
                                <span class="price-value">${tour.price.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            
                            <div class="booking-options">
                                <div class="quantity-selector">
                                    <label>Количество человек:</label>
                                    <div class="quantity-controls">
                                        <button class="quantity-btn minus" data-action="decrease">-</button>
                                        <input type="number" id="quantity" value="1" min="1" max="10">
                                        <button class="quantity-btn plus" data-action="increase">+</button>
                                    </div>
                                </div>
                                
                                <div class="date-selector">
                                    <label>Дата вылета:</label>
                                    <input type="date" id="tourDate" min="${this.getTomorrowDate()}">
                                </div>
                            </div>
                            
                            <div class="total-price">
                                <span>Итого:</span>
                                <span id="totalPrice">${tour.price.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            
                            <div class="booking-actions">
                                <button class="btn btn-primary add-to-cart-btn" data-tour-id="${tour.id}">
                                    🛒 Добавить в корзину
                                </button>
                                <button class="btn btn-accent book-now-btn" data-tour-id="${tour.id}">
                                    🚀 Забронировать сейчас
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tour-recommendations">
                <h2>Похожие туры</h2>
                <div class="similar-tours" id="similarTours">
                    <!-- Здесь будут похожие туры -->
                </div>
            </div>
        </div>
        `;
    }

    afterRender(tour, tourService) {
        if (!tour) return;

        // Избранное
        const favoriteBtn = document.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', () => {
            this.cartService.toggleFavorite(tour);
            favoriteBtn.classList.toggle('active');
        });

        // Управление количеством
        const quantityInput = document.getElementById('quantity');
        const totalPriceEl = document.getElementById('totalPrice');
        
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                let quantity = parseInt(quantityInput.value);
                
                if (btn.dataset.action === 'increase' && quantity < 10) {
                    quantity++;
                } else if (btn.dataset.action === 'decrease' && quantity > 1) {
                    quantity--;
                }
                
                quantityInput.value = quantity;
                totalPriceEl.textContent = (tour.price * quantity).toLocaleString('ru-RU') + ' ₽';
            });
        });

        quantityInput.addEventListener('change', () => {
            let quantity = parseInt(quantityInput.value);
            if (quantity < 1) quantity = 1;
            if (quantity > 10) quantity = 10;
            quantityInput.value = quantity;
            totalPriceEl.textContent = (tour.price * quantity).toLocaleString('ru-RU') + ' ₽';
        });

        // Добавить в корзину
        document.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            this.cartService.addToCart(tour, quantity);
            alert(`Тур "${tour.title}" добавлен в корзину!`);
        });

        // Забронировать сейчас
        document.querySelector('.book-now-btn').addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            const date = document.getElementById('tourDate').value;
            
            if (!date) {
                alert('Пожалуйста, выберите дату вылета');
                return;
            }
            
            this.cartService.addToCart(tour, quantity);
            alert(`Тур "${tour.title}" забронирован на ${date}! Перенаправляем к оплате...`);
            // Здесь можно перенаправить на страницу оплаты
        });

        // Показать похожие туры
        this.showSimilarTours(tour, tourService);
    }

    showSimilarTours(tour, tourService) {
        const similarTours = tourService.getToursByCategory(tour.category)
            .filter(t => t.id !== tour.id)
            .slice(0, 3);
        
        const similarToursHtml = similarTours.map(t => `
            <div class="similar-tour">
                <img src="${t.image}" alt="${t.title}">
                <h4>${t.title}</h4>
                <p>от ${t.price.toLocaleString('ru-RU')} ₽</p>
                <a href="#/tour/${t.id}" class="btn btn-small">Подробнее</a>
            </div>
        `).join('');
        
        document.getElementById('similarTours').innerHTML = similarToursHtml;
    }

    getIncludeIcon(include) {
        const icons = {
            'breakfast': '🍳',
            'flight': '✈️',
            'hotel': '🏨',
            'transfer': '🚗',
            'excursions': '🏛️',
            'ski-pass': '🎿'
        };
        return icons[include] || '✓';
    }

    getIncludeName(include) {
        const names = {
            'breakfast': 'Завтраки',
            'flight': 'Авиаперелет',
            'hotel': 'Проживание в отеле',
            'transfer': 'Трансфер',
            'excursions': 'Экскурсии',
            'ski-pass': 'Ски-пасс'
        };
        return names[include] || include;
    }

    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
}

export default TourDetailsComponent;