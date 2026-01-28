import CartService from '../../services/cart.service.js';
import AuthService from '../../services/auth.service.js';

class HeaderComponent {
    constructor(cartService, authService) {
        this.cartService = cartService || new CartService();
        this.authService = authService || new AuthService();
    }

    render() {
        const itemCount = this.cartService.getItemCount();
        const isLoggedIn = this.authService.isLoggedIn();
        const user = this.authService.getCurrentUser();

        return `
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <a href="#/" class="logo">
                        <i class="fas fa-plane"></i>
                        <span class="logo-text">TravelWave</span>
                    </a>
                    
                    <nav class="desktop-nav">
                        <a href="#/" class="nav-link" data-active="home">Главная</a>
                        <a href="#/tours" class="nav-link" data-active="tours">Туры</a>
                        <a href="#/about" class="nav-link">О нас</a>
                        <a href="#/contacts" class="nav-link">Контакты</a>
                    </nav>
                    
                    <div class="action-buttons">
                        <div class="cart-container">
                            <a href="#/cart" class="cart-link">
                                <i class="fas fa-shopping-cart"></i>
                                ${itemCount > 0 ? `
                                    <span class="cart-count">${itemCount}</span>
                                ` : ''}
                            </a>
                        </div>
                        
                        ${isLoggedIn ? this.renderUserMenu(user) : this.renderAuthButtons()}
                    </div>
                </div>
            </div>
        </header>
        `;
    }

    renderUserMenu(user) {
        return `
        <div class="user-menu">
            <button class="user-btn">
                <i class="fas fa-user-circle"></i>
                <span>${user.name.split(' ')[0]}</span>
            </button>
            <div class="user-dropdown">
                <a href="#/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Профиль
                </a>
                <a href="#/profile/orders" class="dropdown-item">
                    <i class="fas fa-receipt"></i> Мои заказы
                </a>
                <a href="#/profile/favorites" class="dropdown-item">
                    <i class="fas fa-heart"></i> Избранное
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" id="logout">
                    <i class="fas fa-sign-out-alt"></i> Выйти
                </button>
            </div>
        </div>
        `;
    }

    renderAuthButtons() {
        return `
        <div class="auth-buttons">
            <button class="btn btn-outline" id="loginBtn">
                Войти
            </button>
            <button class="btn btn-primary" id="registerBtn">
                Регистрация
            </button>
        </div>
        `;
    }

    afterRender() {
        // Навигация
        const currentHash = window.location.hash || '#/';
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            }
        });

        // Корзина
        document.querySelector('.cart-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#/cart';
        });

        // Кнопки авторизации
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            import('../auth-modal/auth-modal.component.js').then(module => {
                module.default.open((user) => {
                    // После успешной авторизации обновляем хедер
                    window.location.reload();
                });
            });
        });

        document.getElementById('registerBtn')?.addEventListener('click', () => {
            import('../auth-modal/auth-modal.component.js').then(module => {
                module.default.open((user) => {
                    window.location.reload();
                });
            });
        });

        // Выход
        document.getElementById('logout')?.addEventListener('click', () => {
            this.authService.logout();
            window.location.reload();
        });

        // User dropdown
        const userBtn = document.querySelector('.user-btn');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });

            // Закрытие dropdown при клике вне его
            document.addEventListener('click', (e) => {
                if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
    }
}

export default HeaderComponent;