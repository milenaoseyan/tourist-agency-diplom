import TourService from '../../services/tour.service.js';

class SearchComponent {
    constructor() {
        this.tourService = new TourService();
        this.searchQuery = this.getSearchQueryFromURL();
        this.searchResults = [];
        this.filters = {
            category: null,
            priceRange: { min: 0, max: 200000 },
            sortBy: 'relevance'
        };
    }

    async render() {
        await this.performSearch();
        
        return `
        <div class="search-page">
            <div class="container">
                <div class="search-header">
                    <h1>🔍 Результаты поиска</h1>
                    <div class="search-query">
                        <p>По запросу: <strong>"${this.searchQuery}"</strong></p>
                        <p>Найдено: <strong>${this.searchResults.length} туров</strong></p>
                    </div>
                </div>
                
                <div class="search-layout">
                    <aside class="search-filters">
                        <div class="filter-section">
                            <h3>Уточнить поиск</h3>
                            
                            <div class="filter-group">
                                <h4>Категория</h4>
                                <select class="filter-select" id="categoryFilter">
                                    <option value="">Все категории</option>
                                    <option value="beach" ${this.filters.category === 'beach' ? 'selected' : ''}>
                                        Пляжный отдых
                                    </option>
                                    <option value="city" ${this.filters.category === 'city' ? 'selected' : ''}>
                                        Городской туризм
                                    </option>
                                    <option value="mountain" ${this.filters.category === 'mountain' ? 'selected' : ''}>
                                        Горный отдых
                                    </option>
                                    <option value="cultural" ${this.filters.category === 'cultural' ? 'selected' : ''}>
                                        Культурный туризм
                                    </option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <h4>Цена, ₽</h4>
                                <div class="price-inputs">
                                    <input type="number" id="minPrice" value="${this.filters.priceRange.min}" 
                                           placeholder="От">
                                    <span>-</span>
                                    <input type="number" id="maxPrice" value="${this.filters.priceRange.max}" 
                                           placeholder="До">
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <h4>Сортировка</h4>
                                <select class="filter-select" id="sortFilter">
                                    <option value="relevance" ${this.filters.sortBy === 'relevance' ? 'selected' : ''}>
                                        По релевантности
                                    </option>
                                    <option value="price_asc" ${this.filters.sortBy === 'price_asc' ? 'selected' : ''}>
                                        Сначала дешевле
                                    </option>
                                    <option value="price_desc" ${this.filters.sortBy === 'price_desc' ? 'selected' : ''}>
                                        Сначала дороже
                                    </option>
                                    <option value="rating" ${this.filters.sortBy === 'rating' ? 'selected' : ''}>
                                        По рейтингу
                                    </option>
                                </select>
                            </div>
                            
                            <button class="btn btn-primary" id="applyFilters">
                                Применить фильтры
                            </button>
                        </div>
                    </aside>
                    
                    <main class="search-results">
                        ${this.searchResults.length === 0 ? this.renderNoResults() : this.renderResults()}
                    </main>
                </div>
            </div>
        </div>
        `;
    }

    renderResults() {
        return `
        <div class="results-grid">
            ${this.searchResults.map(tour => `
                <div class="search-result-card">
                    <a href="#/tour/${tour.id}" class="result-link">
                        <img src="${tour.image}" alt="${tour.title}" class="result-image">
                        <div class="result-content">
                            <h3>${tour.title}</h3>
                            <p class="result-location">📍 ${tour.location}</p>
                            <p class="result-description">${tour.description.substring(0, 100)}...</p>
                            <div class="result-meta">
                                <span class="result-rating">⭐ ${tour.rating}</span>
                                <span class="result-duration">📅 ${tour.duration} дней</span>
                            </div>
                            <div class="result-price">
                                от ${tour.price.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                    </a>
                </div>
            `).join('')}
        </div>
        `;
    }

    renderNoResults() {
        return `
        <div class="no-results-found">
            <div class="no-results-icon">🔍</div>
            <h2>По вашему запросу ничего не найдено</h2>
            <p>Попробуйте:</p>
            <ul>
                <li>Изменить поисковый запрос</li>
                <li>Проверить правильность написания</li>
                <li>Использовать более общие ключевые слова</li>
                <li>Обратиться к нашему менеджеру за помощью</li>
            </ul>
            <div class="no-results-actions">
                <a href="#/tours" class="btn btn-primary">
                    Посмотреть все туры
                </a>
                <button class="btn btn-secondary" id="clearSearch">
                    Новый поиск
                </button>
            </div>
        </div>
        `;
    }

    async afterRender() {
        // Фильтры
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', async () => {
                await this.applyFilters();
            });
        }

        // Очистка поиска
        const clearSearchBtn = document.getElementById('clearSearch');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                window.location.hash = '#/tours';
            });
        }
    }

    getSearchQueryFromURL() {
        const hash = window.location.hash;
        const match = hash.match(/#\/search\?q=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    async performSearch() {
        if (!this.searchQuery) {
            this.searchResults = this.tourService.getAllTours();
        } else {
            this.searchResults = this.tourService.searchTours(this.searchQuery);
        }
        
        this.applyCurrentFilters();
    }

    applyCurrentFilters() {
        // Фильтрация по категории
        if (this.filters.category) {
            this.searchResults = this.searchResults.filter(
                tour => tour.category === this.filters.category
            );
        }

        // Фильтрация по цене
        this.searchResults = this.searchResults.filter(tour => 
            tour.price >= this.filters.priceRange.min && 
            tour.price <= this.filters.priceRange.max
        );

        // Сортировка
        switch (this.filters.sortBy) {
            case 'price_asc':
                this.searchResults.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                this.searchResults.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.searchResults.sort((a, b) => b.rating - a.rating);
                break;
            case 'relevance':
            default:
                // Поиск уже отсортирован по релевантности
                break;
        }
    }

    async applyFilters() {
        this.filters = {
            category: document.getElementById('categoryFilter').value || null,
            priceRange: {
                min: parseInt(document.getElementById('minPrice').value) || 0,
                max: parseInt(document.getElementById('maxPrice').value) || 200000
            },
            sortBy: document.getElementById('sortFilter').value
        };

        await this.performSearch();
        await this.rerender();
    }

    async rerender() {
        const container = document.querySelector('.search-results');
        if (container) {
            container.innerHTML = this.searchResults.length === 0 
                ? this.renderNoResults() 
                : this.renderResults();
            this.afterRender();
        }
    }
}

export default SearchComponent;