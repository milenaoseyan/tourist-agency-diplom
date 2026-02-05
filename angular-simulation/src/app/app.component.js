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
import MobileMenuComponent from './components/mobile-menu/mobile-menu.component.js';
import PromotionsComponent from './pages/promotions/promotions.component.js';
import RecommendationsComponent from './components/recommendations/recommendations.component.js';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import store from './store/store.js';
import NotificationCenterComponent from './components/notification-center/notification-center.component.js';
import FavoritesComponent from './components/favorites/favorites.component.js';
import TourComparisonComponent from './components/tour-comparison/tour-comparison.component.js';
import TripPlannerComponent from './components/trip-planner/trip-planner.component.js';
import WeatherWidgetComponent from './components/weather-widget/weather-widget.component.js';
import UserAnalyticsService from './services/user-analytics.service.js';

@NgModule({
declarations: [
    AppComponent,
    LanguageSwitcherComponent,
    ChatSupportComponent,
    AdvancedFiltersComponent,
    FaqComponent,
    ClickOutsideDirective
],
imports: [
    BrowserModule,
    FormsModule
],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { }


class AppComponent {
    constructor() {
        store.init();
        this.authService = new AuthService();
        this.tourService = new TourService();
        this.cartService = new CartService();
            this.header = new HeaderComponent();
    this.footer = new FooterComponent();
    this.hero = new HeroComponent();
    this.mobileMenu = new MobileMenuComponent();
    this.notificationCenter = new NotificationCenterComponent();
    
    this.currentPage = 'home';
    this.currentTourId = null;
        this.unsubscribe = store.subscribe((state) => {
    this.handleStateChange(state);
    });
        this.header = new HeaderComponent(this.cartService, this.authService);
        this.hero = new HeroComponent();
        this.footer = new FooterComponent();
        this.mobileMenu = new MobileMenuComponent();
        this.currentPage = 'home';
        this.currentTourId = null;
        this.filters = {
            category: null,
            priceRange: { min: 0, max: 200000 },
            sortBy: 'popular'
        };
    }

handleStateChange(state) {
    // Обновляем количество в корзине в хедере
    const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cartCount;
    });
    
    // Обновляем состояние избранного
    document.querySelectorAll('.favorite-btn').forEach(btn => {
    const tourId = parseInt(btn.dataset.tourId);
    const isFavorite = state.favorites.includes(tourId);
    btn.classList.toggle('active', isFavorite);
    btn.innerHTML = isFavorite ? '❤️' : '🤍';
    });
}

render() {
const hash = window.location.hash;

if (hash === '#/comparison') {
    this.currentPage = 'comparison';
} else if (hash === '#/trip-planner') {
    this.currentPage = 'trip-planner';
} else if (hash === '#/my-stats') {
    this.currentPage = 'my-stats';
}
        if (hash === '#/favorites') {
    this.currentPage = 'favorites';
    }
    if (hash === '#/promotions') {
    this.currentPage = 'promotions';
    }
    if (hash.startsWith('#/tour/')) {
        this.currentPage = 'tour-detail';
        this.currentTourId = hash.split('/')[2];
            return `
    ${this.notificationCenter.render()}
    ${this.renderCurrentPage()}
    `;
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
        case 'promotions':
            return this.renderPromotionsPage();
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

async renderComparisonPage() {
  const comparison = new TourComparisonComponent();
  return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    <main class="container">
      ${await comparison.render()}
    </main>
    ${this.footer.render()}
  `;
}

async renderTripPlannerPage() {
  const tripPlanner = new TripPlannerComponent();
  return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    <main class="container">
      ${await tripPlanner.render()}
    </main>
    ${this.footer.render()}
  `;
}

async renderMyStatsPage() {
  const user = this.authService.getCurrentUser();
  let statsHTML = '';
  
  if (user) {
    const insights = UserAnalyticsService.getUserInsights(user.id);
    statsHTML = this.renderUserStats(insights);
  } else {
    statsHTML = `
      <div class="stats-empty">
        <div class="empty-icon">📊</div>
        <h3>Статистика доступна только авторизованным пользователям</h3>
        <a href="#/auth" class="btn btn-primary">Войти</a>
      </div>
    `;
  }
  
  return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    <main class="container">
      <div class="user-stats-page">
        <div class="stats-header">
          <h1>📊 Моя статистика</h1>
          <p>Анализ вашей активности и предпочтений</p>
        </div>
        ${statsHTML}
      </div>
    </main>
    ${this.footer.render()}
  `;
}

renderUserStats(insights) {
  return `
    <div class="user-stats">
      <div class="stats-overview">
        <div class="overview-card">
          <div class="overview-icon">👁️</div>
          <div>
            <h3>${insights.stats.toursViewed.length}</h3>
            <p>Туров просмотрено</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">🎫</div>
          <div>
            <h3>${insights.stats.toursBooked.length}</h3>
            <p>Туров забронировано</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">💰</div>
          <div>
            <h3>${insights.stats.totalSpent.toLocaleString('ru-RU')} ₽</h3>
            <p>Потрачено</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">🎯</div>
          <div>
            <h3>${insights.recommendations.conversionRate}%</h3>
            <p>Конверсия</p>
          </div>
        </div>
      </div>
      
      <div class="stats-insights">
        <h3>📈 Инсайты</h3>
        <div class="insights-grid">
          ${insights.insights.map(insight => `
            <div class="insight-card ${insight.type}">
              <div class="insight-icon">${insight.icon}</div>
              <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="stats-actions">
        <button class="btn btn-primary" id="exportStats">
          📥 Экспортировать мои данные
        </button>
        <button class="btn btn-secondary" id="clearStats">
          🗑️ Очистить историю
        </button>
      </div>
    </div>
  `;
}

    renderHomePage() {
        const popularTours = this.tourService.getPopularTours();
        const tourCards = popularTours.map(tour => {
            const card = new TourCardComponent(tour, this.cartService);
            return card.render();
        }).join('');

        return `
        ${this.header.render()}
        ${this.mobileMenu.render()}
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
            
                <div id="recommendations-container"></div>

                <section class="promotions-preview">
                <div class="section-header">
                    <h2>🎁 Актуальные акции</h2>
                    <a href="#/promotions" class="view-all">Все акции →</a>
                </div>
            ${this.renderPromotionsPreview()}
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
        ${this.mobileMenu.render()}
        
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
        ${this.mobileMenu.render()}
        
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
    ${this.mobileMenu.render()}
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
    ${this.mobileMenu.render()}
    
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
    ${this.mobileMenu.render()}
    
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
    ${this.mobileMenu.render()}
    ${about.render()}
    ${this.footer.render()}
    `;
}

// Метод для страницы поиска
async renderSearchPage() {
    const search = new SearchComponent();
    return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    ${await search.render()}
    ${this.footer.render()}
    `;
}

// Метод для рендеринга страницы акций
async renderPromotionsPage() {
    const promotions = new PromotionsComponent();
    return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    ${await promotions.render()}
    ${this.footer.render()}
    `;
}

// Метод для админ-панели
renderAdminPage() {
    const admin = new AdminComponent();
    return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    ${admin.render()}
    ${this.footer.render()}
    `;
}

// Метод для страницы "Контакты"
renderContactsPage() {
    return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    
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

renderPromotionsPreview() {
    const discountService = new DiscountService();
    const promotions = discountService.getActivePromotions().slice(0, 2);
    
    if (promotions.length === 0) {
        return '';
    }
    
    return `
    <div class="promotions-preview-grid">
        ${promotions.map(promo => `
            <div class="promotion-preview-card">
                <div class="promo-preview-image">
                    <img src="${promo.image}" alt="${promo.title}" loading="lazy">
                    <div class="promo-preview-badge">-${promo.discount}%</div>
                </div>
                <div class="promo-preview-content">
                    <h3>${promo.title}</h3>
                    <p>${promo.description}</p>
                    <a href="#/promotions" class="btn btn-small">Подробнее</a>
                </div>
            </div>
        `).join('')}
    </div>
    `;
}

async renderFavoritesPage() {
    const favorites = new FavoritesComponent();
    return `
    ${this.header.render()}
    ${this.mobileMenu.render()}
    <main class="container">
        ${await favorites.render()}
    </main>
    ${this.footer.render()}
    `;
}

async afterRender() {
    UserAnalyticsService.trackPageView(this.currentPage);
    
    store.init();
    this.notificationCenter.afterRender();
    this.header.afterRender();
    this.hero.afterRender();
    this.footer.afterRender();
    this.mobileMenu.afterRender();
    this.addFavoriteButtons();
    this.trackPerformance();

    if (this.currentPage === 'tour-detail' && this.currentTourId) {
    this.initTourWeatherWidget();
    }
    // Обработка кликов по категориям на главной
    if (this.currentPage === 'home') {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                window.location.hash = `#/tours`;
            });
        });
            await this.initRecommendations();
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

initTourWeatherWidget() {
const tour = this.tourService.getTourById(this.currentTourId);
if (tour && tour.location) {
    const location = tour.location.split(',')[0]; // Берем первый город
    WeatherWidgetComponent.create(location, '.weather-widget-container');
}
}

addFavoriteButtons() {
    document.querySelectorAll('.tour-card').forEach(card => {
    const tourId = card.dataset.id;
    if (!tourId) return;
    
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.dataset.tourId = tourId;
    favoriteBtn.innerHTML = store.isFavorite(parseInt(tourId)) ? '❤️' : '🤍';
    favoriteBtn.title = 'Добавить в избранное';
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.dispatch({
        type: 'TOGGLE_FAVORITE',
        payload: parseInt(tourId)
        });
    });
    
    card.querySelector('.tour-image')?.appendChild(favoriteBtn);
    });
}

trackPerformance() {
    // Измерение времени загрузки
    const perfData = {
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart,
    firstPaint: null,
    firstContentfulPaint: null
    };

    // Отслеживание Core Web Vitals
    if ('PerformanceObserver' in window) {
      // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
            perfData.firstContentfulPaint = entry.startTime;
        }
        });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        perfData.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
            clsValue += entry.value;
        }
        }
        perfData.cumulativeLayoutShift = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Логирование производительности
    console.log('Performance metrics:', perfData);
    
    // Отправка в аналитику (если есть)
    if (window.analyticsService) {
    window.analyticsService.track('performance', perfData);
    }
}

destroy() {
    if (this.unsubscribe) {
    this.unsubscribe();
    }
    this.notificationCenter.destroy();
}

async initRecommendations() {
    const recommendations = new RecommendationsComponent();
    const container = document.getElementById('recommendations-container');
    
    if (container) {
        container.innerHTML = await recommendations.render();
        recommendations.afterRender();
    }
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