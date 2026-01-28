import CartService from '../../services/cart.service.js';
import OrderService from '../../services/order.service.js';
import AuthService from '../../services/auth.service.js';

class CartComponent {
    constructor() {
        this.cartService = new CartService();
        this.orderService = new OrderService();
        this.authService = new AuthService();
        this.orderFormData = {
            name: '',
            email: '',
            phone: '',
            address: '',
            paymentMethod: 'card'
        };
        this.errors = {};
    }

    render() {
        const cartItems = this.cartService.getCartItems();
        const cartTotal = this.cartService.getCartTotal();
        const itemCount = this.cartService.getItemCount();
        const isCartEmpty = cartItems.length === 0;

        if (isCartEmpty) {
            return this.renderEmptyCart();
        }

        return `
        <div class="cart-page">
            <div class="container">
                <div class="cart-header">
                    <h1>🛒 Корзина</h1>
                    <p>${itemCount} ${this.pluralize(itemCount, 'товар', 'товара', 'товаров')} на сумму ${cartTotal.toLocaleString('ru-RU')} ₽</p>
                </div>
                
                <div class="cart-layout">
                    <div class="cart-items">
                        ${cartItems.map(item => this.renderCartItem(item)).join('')}
                        
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>Итого:</span>
                                <span class="total-price">${cartTotal.toLocaleString('ru-RU')} ₽</span>
                            </div>
                        </div>
                        
                        <div class="cart-actions">
                            <button class="btn btn-secondary" id="continueShopping">
                                ← Продолжить покупки
                            </button>
                            <button class="btn btn-danger" id="clearCart">
                                🗑️ Очистить корзину
                            </button>
                        </div>
                    </div>
                    
                    <div class="order-form">
                        <h2>Оформление заказа</h2>
                        
                        ${this.authService.isLoggedIn() ? this.renderLoggedInForm() : this.renderGuestForm()}
                        
                        <div class="payment-methods">
                            <h3>Способ оплаты</h3>
                            <div class="payment-options">
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="card" 
                                           ${this.orderFormData.paymentMethod === 'card' ? 'checked' : ''}>
                                    <span>💳 Банковская карта</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="cash">
                                    <span>💰 Наличные при получении</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="paymentMethod" value="online">
                                    <span>🌐 Онлайн оплата</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="order-total">
                            <h3>Итого к оплате:</h3>
                            <div class="total-amount">
                                ${cartTotal.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                        
                        <button class="btn btn-accent btn-block" id="placeOrder">
                            🚀 Оформить заказ
                        </button>
                        
                        <p class="order-note">
                            Нажимая кнопку, вы соглашаетесь с <a href="#">условиями бронирования</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderCartItem(item) {
        return `
        <div class="cart-item" data-id="${item.tour.id}">
            <div class="item-image">
                <img src="${item.tour.image}" alt="${item.tour.title}">
            </div>
            
            <div class="item-details">
                <h3>${item.tour.title}</h3>
                <p class="item-location">📍 ${item.tour.location}</p>
                <p class="item-duration">📅 ${item.tour.duration} дней</p>
            </div>
            
            <div class="item-quantity">
                <button class="quantity-btn minus" data-action="decrease">-</button>
                <input type="number" value="${item.quantity}" min="1" max="10" class="quantity-input">
                <button class="quantity-btn plus" data-action="increase">+</button>
            </div>
            
            <div class="item-price">
                <span class="price">${item.totalPrice.toLocaleString('ru-RU')} ₽</span>
                <span class="price-per-item">${item.tour.price.toLocaleString('ru-RU')} ₽ / чел</span>
            </div>
            
            <div class="item-actions">
                <button class="remove-item" title="Удалить">
                    &times;
                </button>
            </div>
        </div>
        `;
    }

    renderLoggedInForm() {
        const user = this.authService.getCurrentUser();
        this.orderFormData.name = user.name || '';
        this.orderFormData.email = user.email || '';
        this.orderFormData.phone = user.phone || '';

        return `
        <div class="user-info">
            <p>Вы вошли как <strong>${user.name}</strong> (${user.email})</p>
            <button class="btn btn-small" id="logout">Выйти</button>
        </div>
        
        <div class="form-group">
            <label for="orderName">Имя *</label>
            <input type="text" id="orderName" value="${this.orderFormData.name}" required>
            ${this.errors.name ? `<div class="error-message">${this.errors.name}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderEmail">Email *</label>
            <input type="email" id="orderEmail" value="${this.orderFormData.email}" required>
            ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderPhone">Телефон *</label>
            <input type="tel" id="orderPhone" value="${this.orderFormData.phone}" required>
            ${this.errors.phone ? `<div class="error-message">${this.errors.phone}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderAddress">Адрес</label>
            <textarea id="orderAddress" rows="2" placeholder="Улица, дом, квартира"></textarea>
        </div>
        `;
    }

    renderGuestForm() {
        return `
        <div class="guest-info">
            <p>Оформление заказа без регистрации</p>
            <button class="btn btn-small" id="showAuthModal">Войти или зарегистрироваться</button>
        </div>
        
        <div class="form-group">
            <label for="orderName">Имя *</label>
            <input type="text" id="orderName" value="${this.orderFormData.name}" required>
            ${this.errors.name ? `<div class="error-message">${this.errors.name}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderEmail">Email *</label>
            <input type="email" id="orderEmail" value="${this.orderFormData.email}" required>
            ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderPhone">Телефон *</label>
            <input type="tel" id="orderPhone" value="${this.orderFormData.phone}" required>
            ${this.errors.phone ? `<div class="error-message">${this.errors.phone}</div>` : ''}
        </div>
        
        <div class="form-group">
            <label for="orderAddress">Адрес</label>
            <textarea id="orderAddress" rows="2" placeholder="Улица, дом, квартира"></textarea>
        </div>
        `;
    }

    renderEmptyCart() {
        return `
        <div class="empty-cart">
            <div class="container">
                <div class="empty-cart-content">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Ваша корзина пуста</h2>
                    <p>Добавьте туры, чтобы оформить заказ</p>
                    <a href="#/tours" class="btn btn-primary">
                        Перейти к каталогу туров
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        if (this.cartService.getCartItems().length === 0) {
            return;
        }

        // Управление количеством
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const tourId = parseInt(cartItem.dataset.id);
                const input = cartItem.querySelector('.quantity-input');
                let quantity = parseInt(input.value);
                
                if (e.target.dataset.action === 'increase' && quantity < 10) {
                    quantity++;
                } else if (e.target.dataset.action === 'decrease' && quantity > 1) {
                    quantity--;
                }
                
                this.cartService.updateQuantity(tourId, quantity);
                this.rerender();
            });
        });

        // Удаление товара
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const tourId = parseInt(cartItem.dataset.id);
                this.cartService.removeFromCart(tourId);
                this.rerender();
            });
        });

        // Очистка корзины
        document.getElementById('clearCart')?.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить корзину?')) {
                this.cartService.clearCart();
                this.rerender();
            }
        });

        // Продолжить покупки
        document.getElementById('continueShopping')?.addEventListener('click', () => {
            window.location.hash = '#/tours';
        });

        // Оформление заказа
        document.getElementById('placeOrder')?.addEventListener('click', async () => {
            await this.handlePlaceOrder();
        });

        // Выход
        document.getElementById('logout')?.addEventListener('click', () => {
            this.authService.logout();
            this.rerender();
        });

        // Показать модальное окно авторизации
        document.getElementById('showAuthModal')?.addEventListener('click', () => {
            import('../components/auth-modal/auth-modal.component.js').then(module => {
                module.default.open((user) => {
                    this.rerender();
                });
            });
        });

        // Сохранение данных формы
        this.setupFormListeners();
    }

    async handlePlaceOrder() {
        // Сбор данных формы
        const formData = {
            name: document.getElementById('orderName')?.value || '',
            email: document.getElementById('orderEmail')?.value || '',
            phone: document.getElementById('orderPhone')?.value || '',
            address: document.getElementById('orderAddress')?.value || '',
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card'
        };

        // Простая валидация
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Введите имя';
        if (!formData.email.trim()) errors.email = 'Введите email';
        if (!formData.phone.trim()) errors.phone = 'Введите телефон';

        if (Object.keys(errors).length > 0) {
            this.errors = errors;
            this.rerender();
            return;
        }

        try {
            const orderBtn = document.getElementById('placeOrder');
            orderBtn.textContent = 'Оформление...';
            orderBtn.disabled = true;

            // Создание заказа
            const order = await this.orderService.createOrder(formData);
            
            // Показываем подтверждение
            this.showOrderConfirmation(order);
            
        } catch (error) {
            alert(`Ошибка при оформлении заказа: ${error.message}`);
            this.rerender();
        }
    }

    showOrderConfirmation(order) {
        const confirmation = document.createElement('div');
        confirmation.className = 'order-confirmation-overlay';
        confirmation.innerHTML = `
            <div class="order-confirmation">
                <div class="confirmation-header">
                    <h2>🎉 Заказ оформлен!</h2>
                    <button class="close-confirmation">&times;</button>
                </div>
                
                <div class="confirmation-content">
                    <div class="confirmation-icon">✅</div>
                    
                    <p>Ваш заказ <strong>№${order.id}</strong> успешно оформлен.</p>
                    
                    <div class="order-details">
                        <p><strong>Сумма:</strong> ${order.total.toLocaleString('ru-RU')} ₽</p>
                        <p><strong>Статус:</strong> <span class="status-pending">Ожидает подтверждения</span></p>
                        <p><strong>Способ оплаты:</strong> ${this.getPaymentMethodName(order.paymentMethod)}</p>
                    </div>
                    
                    <p>Информация о заказе отправлена на email: <strong>${order.customerInfo.email}</strong></p>
                    
                    <div class="confirmation-actions">
                        <button class="btn btn-primary" id="goToOrders">
                            Мои заказы
                        </button>
                        <button class="btn btn-secondary" id="continueShopping">
                            Вернуться к покупкам
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Закрытие
        confirmation.querySelector('.close-confirmation').addEventListener('click', () => {
            confirmation.remove();
            window.location.hash = '#/';
        });
        
        document.getElementById('goToOrders').addEventListener('click', () => {
            confirmation.remove();
            window.location.hash = '#/profile';
        });
        
        document.getElementById('continueShopping').addEventListener('click', () => {
            confirmation.remove();
            window.location.hash = '#/tours';
        });
        
        // Клик по оверлею
        confirmation.addEventListener('click', (e) => {
            if (e.target === confirmation) {
                confirmation.remove();
                window.location.hash = '#/';
            }
        });
    }

    getPaymentMethodName(method) {
        const methods = {
            'card': 'Банковская карта',
            'cash': 'Наличные',
            'online': 'Онлайн оплата'
        };
        return methods[method] || method;
    }

    setupFormListeners() {
        // Сохранение данных формы при изменении
        ['orderName', 'orderEmail', 'orderPhone', 'orderAddress'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.orderFormData[id.replace('order', '').toLowerCase()] = e.target.value;
                });
            }
        });
    }

    pluralize(number, one, two, five) {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    rerender() {
        // Этот метод будет вызван из AppComponent при изменении состояния
        // Для простоты перезагрузим страницу
        window.location.reload();
    }
}

export default CartComponent;