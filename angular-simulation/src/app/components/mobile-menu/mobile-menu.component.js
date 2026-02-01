import AuthService from '../../services/auth.service.js';
import CartService from '../../services/cart.service.js';

class MobileMenuComponent {
    constructor() {
        this.authService = new AuthService();
        this.cartService = new CartService();
        this.isOpen = false;
    }

    render() {
        const isLoggedIn = this.authService.isLoggedIn();
        const user = this.authService.getCurrentUser();
        const itemCount = this.cartService.getItemCount();

        return `
        <div class="mobile-menu">
            <button class="menu-toggle" id="mobileMenuToggle">
                ${this.isOpen ? '✕' : '☰'}
            </button>
            
            <div class="mobile-menu-overlay ${this.isOpen ? 'open' : ''}">
                <div class="mobile-menu-content">
                    <div class="mobile-menu-header">
                        <a href="#/" class="mobile-logo">
                            <span class="logo-icon">✈️</span>
                            <span class="logo-text">TravelWave</span>
                        </a>
                        <button class="close-menu">&times;</button>
                    </div>
                    
                    <div class="mobile-user-info">
                        ${isLoggedIn ? `
                            <div class="mobile-user">
                                <div class="user-avatar-small">${user.name.charAt(0)}</div>
                                <div>
                                    <strong>${user.name}</strong>
                                    <small>${user.email}</small>
                                </div>
                            </div>
                        ` : `
                            <div class="mobile-auth-buttons">
                                <button class="btn btn-small" id="mobileLoginBtn">Войти</button>
                                <button class="btn btn-small btn-primary" id="mobileRegisterBtn">Регистрация</button>
                            </div>
                        `}
                    </div>
                    
                    <nav class="mobile-nav">
                        <a href="#/" class="mobile-nav-item ${window.location.hash === '#/' ? 'active' : ''}">
                            <span class="nav-icon">🏠</span>
                            <span>Главная</span>
                        </a>
                        
                        <a href="#/tours" class="mobile-nav-item ${window.location.hash === '#/tours' ? 'active' : ''}">
                            <span class="nav-icon">🏝️</span>
                            <span>Все туры</span>
                        </a>
                        
                        <a href="#/about" class="mobile-nav-item ${window.location.hash === '#/about' ? 'active' : ''}">
                            <span class="nav-icon">ℹ️</span>
                            <span>О нас</span>
                        </a>
                        
                        <a href="#/contacts" class="mobile-nav-item ${window.location.hash === '#/contacts' ? 'active' : ''}">
                            <span class="nav-icon">📞</span>
                            <span>Контакты</span>
                        </a>
                        
                        <a href="#/cart" class="mobile-nav-item ${window.location.hash === '#/cart' ? 'active' : ''}">
                            <span class="nav-icon">🛒</span>
                            <span>Корзина</span>
                            ${itemCount > 0 ? `<span class="cart-badge">${itemCount}</span>` : ''}
                        </a>
                        
                        ${isLoggedIn ? `
                            <a href="#/profile" class="mobile-nav-item ${window.location.hash === '#/profile' ? 'active' : ''}">
                                <span class="nav-icon">👤</span>
                                <span>Профиль</span>
                            </a>
                            
                            ${user.role === 'admin' ? `
                                <a href="#/admin" class="mobile-nav-item ${window.location.hash === '#/admin' ? 'active' : ''}">
                                    <span class="nav-icon">👑</span>
                                    <span>Админ-панель</span>
                                </a>
                            ` : ''}
                            
                            <button class="mobile-nav-item logout-btn">
                                <span class="nav-icon">🚪</span>
                                <span>Выйти</span>
                            </button>
                        ` : ''}
                    </nav>
                    
                    <div class="mobile-menu-footer">
                        <div class="mobile-search">
                            <input type="text" placeholder="Поиск туров..." class="mobile-search-input">
                            <button class="mobile-search-btn">🔍</button>
                        </div>
                        
                        <div class="mobile-social">
                            <a href="#" class="social-link">📘</a>
                            <a href="#" class="social-link">📷</a>
                            <a href="#" class="social-link">📹</a>
                            <a href="#" class="social-link">💬</a>
                        </div>
                        
                        <p class="mobile-copyright">
                            © 2024 TravelWave. Все права защищены.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        // Открытие/закрытие меню
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const closeBtn = document.querySelector('.close-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        toggleBtn.addEventListener('click', () => {
            this.toggleMenu();
        });

        closeBtn.addEventListener('click', () => {
            this.closeMenu();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeMenu();
            }
        });

        // Навигация
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            if (!item.classList.contains('logout-btn')) {
                item.addEventListener('click', () => {
                    this.closeMenu();
                });
            }
        });

        // Авторизация
        document.getElementById('mobileLoginBtn')?.addEventListener('click', () => {
            this.closeMenu();
            import('../auth-modal/auth-modal.component.js').then(module => {
                module.default.open();
            });
        });

        document.getElementById('mobileRegisterBtn')?.addEventListener('click', () => {
            this.closeMenu();
            import('../auth-modal/auth-modal.component.js').then(module => {
                module.default.open();
            });
        });

        // Выход
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            this.authService.logout();
            this.closeMenu();
            window.location.reload();
        });

        // Поиск
        const searchBtn = document.querySelector('.mobile-search-btn');
        const searchInput = document.querySelector('.mobile-search-input');

        searchBtn.addEventListener('click', () => {
            if (searchInput.value.trim()) {
                window.location.hash = `#/search?q=${encodeURIComponent(searchInput.value)}`;
                this.closeMenu();
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.hash = `#/search?q=${encodeURIComponent(searchInput.value)}`;
                this.closeMenu();
            }
        });

        // Закрытие при изменении хеша
        window.addEventListener('hashchange', () => {
            this.closeMenu();
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.rerender();
        
        // Блокировка скролла
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }

    openMenu() {
        this.isOpen = true;
        this.rerender();
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.isOpen = false;
        this.rerender();
        document.body.style.overflow = '';
    }

    rerender() {
        const container = document.querySelector('.mobile-menu');
        if (container) {
            container.innerHTML = this.render();
            this.afterRender();
        }
    }
}

export default MobileMenuComponent;