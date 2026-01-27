import HeaderComponent from './components/header/header.component.js';
import HeroComponent from './components/hero/hero.component.js';
import TourCardComponent from './components/tour-card/tour-card.component.js';
import FooterComponent from './components/footer/footer.component.js';
import FiltersComponent from './components/filters/filters.component.js';
import TourService from './services/tour.service.js';
import CartService from './services/cart.service.js';

class AppComponent {
    constructor() {
        this.tourService = new TourService();
        this.cartService = new CartService();
        this.header = new HeaderComponent(this.cartService);
        this.hero = new HeroComponent();
        this.footer = new FooterComponent();
        this.currentPage = 'home';
        this.currentTourId = null;
        this.filters = {
            category: null,
            priceRange: { min: 0, max: 200000 },
            sortBy: 'popular'
        };
    }

    render() {
        // Определяем текущую страницу по hash
        const hash = window.location.hash;
        if (hash.startsWith('#/tour/')) {
            this.currentPage = 'tour-detail';
            this.currentTourId = hash.split('/')[2];
        } else if (hash === '#/tours') {
            this.currentPage = 'tours';
        } else {
            this.currentPage = 'home';
        }

        switch (this.currentPage) {
            case 'tour-detail':
                return this.renderTourDetail();
            case 'tours':
                return this.renderToursPage();
            default:
                return this.renderHomePage();
        }
    }

    renderHomePage() {
        const popularTours = this.tourService.getPopularTours();
        const tourCards = popularTours.map(tour => {
            const card = new TourCardComponent(tour, this.cartService);
            return card.render();
        }).join('');

        return `
        ${this.header.render()}
        ${this.hero.render()}
        
        <main class="container">
            <section class="popular-tours">
                <div class="section-header">
                    <h2>🔥 Популярные туры</h2>
                    <a href="#/tours" class="view-all">Смотреть все →</a>
                </div>
                <div class="tours-grid">
                    ${tourCards}
                </div>
            </section>
            
            <section class="categories">
                <h2>🎯 Категории туров</h2>
                <div class="categories-grid">
                    ${this.tourService.getCategories().map(category => `
                        <div class="category-card" data-category="${category.id}">
                            <div class="category-icon">
                                ${this.getCategoryIcon(category.id)}
                            </div>
                            <h3>${category.name}</h3>
                            <p>${this.tourService.getToursByCategory(category.id).length} туров</p>
                        </div>
                    `).join('')}
                </div>
            </section>
            
            <section class="features">
                <h2>✨ Почему выбирают нас?</h2>
                <div class="features-grid">
                    <div class="feature">
                        <div class="feature-icon">🏆</div>
                        <h3>Лучшие цены</h3>
                        <p>Гарантия лучшей цены или возврат разницы</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🛡️</div>
                        <h3>Безопасность</h3>
                        <p>Все туры застрахованы</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">👨‍👩‍👧‍👦</div>
                        <h3>Поддержка 24/7</h3>
                        <p>Помощь в любое время</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">✈️</div>
                        <h3>Прямые рейсы</h3>
                        <p>Работаем с ведущими авиакомпаниями</p>
                    </div>
                </div>
            </section>
        </main>
        
        ${this.footer.render()}
        `;
    }

    renderToursPage() {
        const filteredTours = this.getFilteredTours();
        const tourCards = filteredTours.map(tour => {
            const card = new TourCardComponent(tour, this.cartService);
            return card.render();
        }).join('');

        const filters = new FiltersComponent((filters) => {
            this.filters = filters;
            this.rerender();
        });

        return `
        ${this.header.render()}
        
        <main class="container tours-page">
            <div class="tours-header">
                <h1>Все туры</h1>
                <p>Найдено ${filteredTours.length} туров</p>
            </div>
            
            <div class="tours-layout">
                <aside class="sidebar">
                    ${filters.render()}
                </aside>
                
                <section class="tours-content">
                    <div class="tours-grid">
                        ${tourCards}
                    </div>
                    
                    ${filteredTours.length === 0 ? `
                        <div class="no-results">
                            <h3>😔 Туры не найдены</h3>
                            <p>Попробуйте изменить параметры фильтрации</p>
                        </div>
                    ` : ''}
                </section>
            </div>
        </main>
        
        ${this.footer.render()}
        `;
    }

    renderTourDetail() {
        const tour = this.tourService.getTourById(this.currentTourId);
        const details = new TourDetailsComponent(this.currentTourId);
        
        return `
        ${this.header.render()}
        
        <main class="container">
            ${details.render(tour)}
        </main>
        
        ${this.footer.render()}
        `;
    }

    afterRender() {
        this.header.afterRender();
        this.hero.afterRender();
        this.footer.afterRender();

        // Обработка кликов по категориям на главной
        if (this.currentPage === 'home') {
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    const category = card.dataset.category;
                    window.location.hash = `#/tours`;
                    // Можно добавить автоматическую установку фильтра
                });
            });
        }

        // Инициализация фильтров на странице туров
        if (this.currentPage === 'tours') {
            const filters = new FiltersComponent();
            filters.afterRender();
        }

        // Инициализация деталей тура
        if (this.currentPage === 'tour-detail') {
            const tour = this.tourService.getTourById(this.currentTourId);
            const details = new TourDetailsComponent(this.currentTourId);
            details.afterRender(tour, this.tourService);
        }

        // Навигация по hash
        window.addEventListener('hashchange', () => {
            this.rerender();
        });
    }

    getFilteredTours() {
        let tours = this.tourService.getAllTours();

        // Фильтрация по категории
        if (this.filters.category) {
            tours = tours.filter(tour => tour.category === this.filters.category);
        }

        // Фильтрация по цене
        tours = tours.filter(tour => 
            tour.price >= this.filters.priceRange.min && 
            tour.price <= this.filters.priceRange.max
        );

        // Сортировка
        switch (this.filters.sortBy) {
            case 'price_asc':
                tours.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                tours.sort((a, b) => b.price - a.price);
                break;
            case 'duration':
                tours.sort((a, b) => b.duration - a.duration);
                break;
            default: // popular
                tours.sort((a, b) => b.rating - a.rating);
        }

        return tours;
    }

    getCategoryIcon(category) {
        const icons = {
            'beach': '🏖️',
            'city': '🏙️',
            'mountain': '⛰️',
            'cultural': '🏯'
        };
        return icons[category] || '📍';
    }

    rerender() {
        document.getElementById('app').innerHTML = this.render();
        setTimeout(() => this.afterRender(), 50);
    }
}

export default AppComponent;