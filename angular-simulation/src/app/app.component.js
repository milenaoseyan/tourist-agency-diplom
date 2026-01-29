import HeaderComponent from './components/header/header.component.js';
import HeroComponent from './components/hero/hero.component.js';
import TourCardComponent from './components/tour-card/tour-card.component.js';
import FooterComponent from './components/footer/footer.component.js';
import FiltersComponent from './components/filters/filters.component.js';
import TourService from './services/tour.service.js';
import CartService from './services/cart.service.js';
import CartComponent from './pages/cart/cart.component.js';
import AuthService from './services/auth.service.js';
import AboutComponent from './pages/about/about.component.js';
import SearchComponent from './pages/search/search.component.js';
import AdminComponent from './pages/admin/admin.component.js';

class AppComponent {
    constructor() {
        this.authService = new AuthService();
        this.tourService = new TourService();
        this.cartService = new CartService();
        this.header = new HeaderComponent(this.cartService, this.authService);
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
    const hash = window.location.hash;
    if (hash.startsWith('#/tour/')) {
        this.currentPage = 'tour-detail';
        this.currentTourId = hash.split('/')[2];
    } else if (hash === '#/cart') {
        this.currentPage = 'cart';
    } else if (hash === '#/auth') {
        this.currentPage = 'auth';
    } else if (hash === '#/profile') {
        this.currentPage = 'profile';
    } else if (hash === '#/tours') {
        this.currentPage = 'tours';
    } else if (hash === '#/about') {
        this.currentPage = 'about';
    } else if (hash.startsWith('#/search')) {
        this.currentPage = 'search';
    } else if (hash === '#/admin') {
        this.currentPage = 'admin';
    } else if (hash === '#/contacts') {
        this.currentPage = 'contacts';
    } else {
        this.currentPage = 'home';
    }

    switch (this.currentPage) {
        case 'tour-detail':
            return this.renderTourDetail();
        case 'cart':
            return this.renderCartPage();
        case 'auth':
            return this.renderAuthPage();
        case 'profile':
            return this.renderProfilePage();
        case 'tours':
            return this.renderToursPage();
        case 'about':
            return this.renderAboutPage();      
        case 'search':
            return this.renderSearchPage();     
        case 'admin':
            return this.renderAdminPage();      
        case 'contacts':
            return this.renderContactsPage();   
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


renderCartPage() {
    const cart = new CartComponent();
    return `
    ${this.header.render()}
    ${cart.render()}
    ${this.footer.render()}
    `;
}


renderAuthPage() {
    // Если пользователь уже авторизован, перенаправляем в профиль
    if (this.authService.isLoggedIn()) {
        window.location.hash = '#/profile';
        return '';
    }

    return `
    ${this.header.render()}
    
    <main class="container auth-page">
        <div class="auth-container">
            <div class="auth-hero">
                <h1>Добро пожаловать в TravelWave</h1>
                <p>Войдите или зарегистрируйтесь, чтобы получить доступ ко всем возможностям</p>
            </div>
            
            <div class="auth-forms">
                <div class="login-section">
                    <h2>Вход</h2>
                    <button class="btn btn-primary" id="showLoginModal">
                        Войти в аккаунт
                    </button>
                </div>
                
                <div class="register-section">
                    <h2>Регистрация</h2>
                    <p>Создайте аккаунт для:</p>
                    <ul>
                        <li>Быстрого оформления заказов</li>
                        <li>Истории бронирований</li>
                        <li>Специальных предложений</li>
                    </ul>
                    <button class="btn btn-accent" id="showRegisterModal">
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    </main>
    
    ${this.footer.render()}
    `;
}


renderProfilePage() {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
        window.location.hash = '#/auth';
        return '';
    }

    return `
    ${this.header.render()}
    
    <main class="container profile-page">
        <div class="profile-header">
            <h1>👤 Личный кабинет</h1>
            <p>Добро пожаловать, ${user.name}!</p>
        </div>
        
        <div class="profile-layout">
            <aside class="profile-sidebar">
                <div class="user-info-card">
                    <div class="user-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <h3>${user.name}</h3>
                    <p>${user.email}</p>
                    <button class="btn btn-small" id="logout">Выйти</button>
                </div>
                
                <nav class="profile-nav">
                    <a href="#/profile" class="nav-item active">📋 Мои заказы</a>
                    <a href="#/profile/settings" class="nav-item">⚙️ Настройки</a>
                    <a href="#/profile/favorites" class="nav-item">❤️ Избранное</a>
                </nav>
            </aside>
            
            <div class="profile-content">
                <h2>Мои заказы</h2>
                <div class="orders-list">
                    <p>Здесь будут отображаться ваши заказы</p>
                </div>
            </div>
        </div>
    </main>
    
    ${this.footer.render()}
    `;
}

// Метод для страницы "О нас"
renderAboutPage() {
    const about = new AboutComponent();
    return `
    ${this.header.render()}
    ${about.render()}
    ${this.footer.render()}
    `;
}

// Метод для страницы поиска
async renderSearchPage() {
    const search = new SearchComponent();
    return `
    ${this.header.render()}
    ${await search.render()}
    ${this.footer.render()}
    `;
}

// Метод для админ-панели
renderAdminPage() {
    const admin = new AdminComponent();
    return `
    ${this.header.render()}
    ${admin.render()}
    ${this.footer.render()}
    `;
}

// Метод для страницы "Контакты"
renderContactsPage() {
    return `
    ${this.header.render()}
    
    <main class="container contacts-page">
        <div class="contacts-hero">
            <h1>📞 Контакты</h1>
            <p>Свяжитесь с нами любым удобным способом</p>
        </div>
        
        <div class="contacts-grid">
            <div class="contact-info">
                <div class="contact-card">
                    <div class="contact-icon">📍</div>
                    <h3>Адрес</h3>
                    <p>г. Москва, ул. Туристическая, д. 1</p>
                    <p>БЦ "Глобус", 5 этаж, офис 502</p>
                </div>
                
                <div class="contact-card">
                    <div class="contact-icon">📞</div>
                    <h3>Телефоны</h3>
                    <p>+7 (495) 123-45-67</p>
                    <p>+7 (800) 555-35-35 (бесплатно по РФ)</p>
                </div>
                
                <div class="contact-card">
                    <div class="contact-icon">✉️</div>
                    <h3>Email</h3>
                    <p>info@travelwave.ru</p>
                    <p>booking@travelwave.ru</p>
                </div>
                
                <div class="contact-card">
                    <div class="contact-icon">⏰</div>
                    <h3>Часы работы</h3>
                    <p>Пн-Пт: 9:00 - 20:00</p>
                    <p>Сб-Вс: 10:00 - 18:00</p>
                </div>
            </div>
            
            <div class="contact-form-container">
                <h2>Форма обратной связи</h2>
                <form class="contact-form">
                    <div class="form-group">
                        <label for="contactName">Ваше имя *</label>
                        <input type="text" id="contactName" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="contactEmail">Email *</label>
                        <input type="email" id="contactEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="contactPhone">Телефон</label>
                        <input type="tel" id="contactPhone">
                    </div>
                    
                    <div class="form-group">
                        <label for="contactSubject">Тема</label>
                        <select id="contactSubject">
                            <option value="booking">Бронирование тура</option>
                            <option value="question">Вопрос по туру</option>
                            <option value="feedback">Отзыв</option>
                            <option value="other">Другое</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="contactMessage">Сообщение *</label>
                        <textarea id="contactMessage" rows="5" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        Отправить сообщение
                    </button>
                </form>
            </div>
        </div>
        
        <div class="map-container">
            <h2>Как нас найти</h2>
            <div class="map-placeholder">
                <div class="map-mock">
                    <p>🚗 Здесь будет карта</p>
                    <p>Москва, ул. Туристическая, д. 1</p>
                </div>
            </div>
        </div>
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

    // Инициализация модальных окон на странице авторизации
    if (this.currentPage === 'auth') {
        document.getElementById('showLoginModal')?.addEventListener('click', () => {
            import('./components/auth-modal/auth-modal.component.js').then(module => {
                module.default.open((user) => {
                    window.location.hash = '#/profile';
                });
            });
        });

        document.getElementById('showRegisterModal')?.addEventListener('click', () => {
            import('./components/auth-modal/auth-modal.component.js').then(module => {
                module.default.open((user) => {
                    window.location.hash = '#/profile';
                });
            });
        });
    }

    // Обработка выхода на странице профиля
    if (this.currentPage === 'profile') {
        document.getElementById('logout')?.addEventListener('click', () => {
            this.authService.logout();
            window.location.hash = '#/';
        });
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