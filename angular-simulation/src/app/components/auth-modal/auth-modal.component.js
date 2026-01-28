import AuthService from '../../services/auth.service.js';
import { Validators, validateForm } from '../../utils/validators.js';

class AuthModalComponent {
    constructor(onSuccess) {
        this.authService = new AuthService();
        this.onSuccess = onSuccess;
        this.isLoginMode = true;
        this.errors = {};
    }

    render() {
        return `
        <div class="auth-modal-overlay">
            <div class="auth-modal">
                <button class="close-modal">&times;</button>
                
                <div class="auth-tabs">
                    <button class="auth-tab ${this.isLoginMode ? 'active' : ''}" data-tab="login">
                        Вход
                    </button>
                    <button class="auth-tab ${!this.isLoginMode ? 'active' : ''}" data-tab="register">
                        Регистрация
                    </button>
                </div>
                
                <div class="auth-content">
                    ${this.isLoginMode ? this.renderLoginForm() : this.renderRegisterForm()}
                </div>
                
                <div class="auth-footer">
                    <p>
                        ${this.isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                        <button class="switch-mode">
                            ${this.isLoginMode ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
        `;
    }

    renderLoginForm() {
        return `
        <form id="loginForm" class="auth-form">
            <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" placeholder="ваш@email.com" required>
                ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
            </div>
            
            <div class="form-group">
                <label for="loginPassword">Пароль</label>
                <input type="password" id="loginPassword" placeholder="••••••" required>
                ${this.errors.password ? `<div class="error-message">${this.errors.password}</div>` : ''}
            </div>
            
            <div class="form-options">
                <label class="checkbox">
                    <input type="checkbox" id="rememberMe">
                    <span>Запомнить меня</span>
                </label>
                <a href="#" class="forgot-password">Забыли пароль?</a>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
                Войти
            </button>
            
            <div class="social-login">
                <p>Или войти через:</p>
                <div class="social-buttons">
                    <button type="button" class="social-btn google">
                        <i class="fab fa-google"></i> Google
                    </button>
                    <button type="button" class="social-btn facebook">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                </div>
            </div>
        </form>
        `;
    }

    renderRegisterForm() {
        return `
        <form id="registerForm" class="auth-form">
            <div class="form-group">
                <label for="registerName">Имя</label>
                <input type="text" id="registerName" placeholder="Ваше имя" required>
                ${this.errors.name ? `<div class="error-message">${this.errors.name}</div>` : ''}
            </div>
            
            <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" placeholder="ваш@email.com" required>
                ${this.errors.email ? `<div class="error-message">${this.errors.email}</div>` : ''}
            </div>
            
            <div class="form-group">
                <label for="registerPassword">Пароль</label>
                <input type="password" id="registerPassword" placeholder="••••••" required>
                ${this.errors.password ? `<div class="error-message">${this.errors.password}</div>` : ''}
                <small class="hint">Не менее 6 символов</small>
            </div>
            
            <div class="form-group">
                <label for="registerConfirmPassword">Подтвердите пароль</label>
                <input type="password" id="registerConfirmPassword" placeholder="••••••" required>
                ${this.errors.confirmPassword ? `<div class="error-message">${this.errors.confirmPassword}</div>` : ''}
            </div>
            
            <div class="form-group">
                <label for="registerPhone">Телефон</label>
                <input type="tel" id="registerPhone" placeholder="+7 (999) 999-99-99" required>
                ${this.errors.phone ? `<div class="error-message">${this.errors.phone}</div>` : ''}
            </div>
            
            <div class="form-options">
                <label class="checkbox">
                    <input type="checkbox" id="agreeTerms" required>
                    <span>Я согласен с <a href="#">условиями использования</a> и <a href="#">политикой конфиденциальности</a></span>
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
                Зарегистрироваться
            </button>
        </form>
        `;
    }

    afterRender() {
        // Закрытие модального окна
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.close();
        });

        // Клик по оверлею
        document.querySelector('.auth-modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-modal-overlay')) {
                this.close();
            }
        });

        // Переключение между вкладками
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.isLoginMode = e.target.dataset.tab === 'login';
                this.errors = {};
                this.rerender();
            });
        });

        // Переключение режима
        document.querySelector('.switch-mode').addEventListener('click', () => {
            this.isLoginMode = !this.isLoginMode;
            this.errors = {};
            this.rerender();
        });

        // Обработка форм
        if (this.isLoginMode) {
            this.setupLoginForm();
        } else {
            this.setupRegisterForm();
        }
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };

            // Валидация
            const validationRules = {
                email: [Validators.required, Validators.email],
                password: [Validators.required]
            };

            const { isValid, errors } = validateForm(formData, validationRules);
            
            if (!isValid) {
                this.errors = errors;
                this.rerender();
                return;
            }

            try {
                // Показываем загрузку
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Вход...';
                submitBtn.disabled = true;

                // Авторизация
                const user = await this.authService.login(formData.email, formData.password);
                
                // Успешный вход
                this.close();
                if (this.onSuccess) {
                    this.onSuccess(user);
                }
                
                // Показываем уведомление
                this.showNotification('Вы успешно вошли в систему!', 'success');
                
            } catch (error) {
                this.errors.general = error.message;
                this.rerender();
            }
        });
    }

    setupRegisterForm() {
        const form = document.getElementById('registerForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                confirmPassword: document.getElementById('registerConfirmPassword').value,
                phone: document.getElementById('registerPhone').value
            };

            // Валидация
            const validationRules = {
                name: [Validators.required, Validators.name],
                email: [Validators.required, Validators.email],
                password: [Validators.required, Validators.password],
                confirmPassword: [
                    Validators.required,
                    (value) => value === formData.password ? null : 'Пароли не совпадают'
                ],
                phone: [Validators.required, Validators.phone]
            };

            const { isValid, errors } = validateForm(formData, validationRules);
            
            if (!isValid) {
                this.errors = errors;
                this.rerender();
                return;
            }

            // Проверка согласия с условиями
            if (!document.getElementById('agreeTerms').checked) {
                this.errors.general = 'Необходимо согласиться с условиями';
                this.rerender();
                return;
            }

            try {
                // Показываем загрузку
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Регистрация...';
                submitBtn.disabled = true;

                // Регистрация
                const { password, confirmPassword, ...userData } = formData;
                const user = await this.authService.register({
                    ...userData,
                    password: password
                });
                
                // Успешная регистрация
                this.close();
                if (this.onSuccess) {
                    this.onSuccess(user);
                }
                
                // Показываем уведомление
                this.showNotification('Регистрация успешно завершена!', 'success');
                
            } catch (error) {
                this.errors.general = error.message;
                this.rerender();
            }
        });
    }

    close() {
        const modal = document.querySelector('.auth-modal-overlay');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    }

    rerender() {
        const modal = document.querySelector('.auth-modal-overlay');
        if (modal) {
            modal.innerHTML = this.render();
            this.afterRender();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Закрытие
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Метод для открытия модального окна
    static open(onSuccess) {
        const modal = new AuthModalComponent(onSuccess);
        document.body.insertAdjacentHTML('beforeend', modal.render());
        modal.afterRender();
        
        // Анимация появления
        setTimeout(() => {
            const modalEl = document.querySelector('.auth-modal-overlay');
            if (modalEl) modalEl.style.opacity = '1';
        }, 10);
    }
}

export default AuthModalComponent;