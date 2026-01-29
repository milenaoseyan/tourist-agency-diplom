import TourService from '../../services/tour.service.js';
import ReviewService from '../../services/review.service.js';
import OrderService from '../../services/order.service.js';
import AuthService from '../../services/auth.service.js';

class AdminComponent {
    constructor() {
        this.tourService = new TourService();
        this.reviewService = new ReviewService();
        this.orderService = new OrderService();
        this.authService = new AuthService();
        this.currentTab = 'dashboard';
        this.editingTour = null;
    }

    render() {
        // Проверка прав администратора
        const user = this.authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            return this.renderAccessDenied();
        }

        return `
        <div class="admin-page">
            <div class="admin-header">
                <h1>👑 Панель администратора</h1>
                <p>Управление туристическим агентством</p>
            </div>
            
            <div class="admin-layout">
                <aside class="admin-sidebar">
                    <div class="admin-user">
                        <div class="admin-avatar">A</div>
                        <div>
                            <h3>${user.name}</h3>
                            <p class="admin-role">Администратор</p>
                        </div>
                    </div>
                    
                    <nav class="admin-nav">
                        <button class="admin-nav-btn ${this.currentTab === 'dashboard' ? 'active' : ''}" 
                                data-tab="dashboard">
                            📊 Дашборд
                        </button>
                        <button class="admin-nav-btn ${this.currentTab === 'tours' ? 'active' : ''}" 
                                data-tab="tours">
                            🏝️ Туры
                        </button>
                        <button class="admin-nav-btn ${this.currentTab === 'orders' ? 'active' : ''}" 
                                data-tab="orders">
                            📦 Заказы
                        </button>
                        <button class="admin-nav-btn ${this.currentTab === 'reviews' ? 'active' : ''}" 
                                data-tab="reviews">
                            ⭐ Отзывы
                        </button>
                        <button class="admin-nav-btn ${this.currentTab === 'users' ? 'active' : ''}" 
                                data-tab="users">
                            👥 Пользователи
                        </button>
                    </nav>
                    
                    <div class="admin-stats">
                        <div class="stat-card mini">
                            <div class="stat-icon">🏝️</div>
                            <div>
                                <h4>${this.tourService.getAllTours().length}</h4>
                                <p>Туров</p>
                            </div>
                        </div>
                        <div class="stat-card mini">
                            <div class="stat-icon">📦</div>
                            <div>
                                <h4>${this.orderService.getOrders().length}</h4>
                                <p>Заказов</p>
                            </div>
                        </div>
                    </div>
                </aside>
                
                <main class="admin-content">
                    ${this.renderCurrentTab()}
                </main>
            </div>
        </div>
        `;
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'dashboard':
                return this.renderDashboard();
            case 'tours':
                return this.renderTours();
            case 'orders':
                return this.renderOrders();
            case 'reviews':
                return this.renderReviews();
            case 'users':
                return this.renderUsers();
            default:
                return this.renderDashboard();
        }
    }

    renderDashboard() {
        const tourStats = this.getTourStats();
        const orderStats = this.orderService.getStats();
        const reviewStats = this.reviewService.getStats();
        
        return `
        <div class="dashboard">
            <h2>Общая статистика</h2>
            
            <div class="stats-grid">
                <div class="stat-card large">
                    <div class="stat-icon">💰</div>
                    <div>
                        <h3>${orderStats.totalRevenue.toLocaleString('ru-RU')} ₽</h3>
                        <p>Общая выручка</p>
                    </div>
                </div>
                
                <div class="stat-card large">
                    <div class="stat-icon">📊</div>
                    <div>
                        <h3>${orderStats.totalOrders}</h3>
                        <p>Всего заказов</p>
                    </div>
                </div>
                
                <div class="stat-card large">
                    <div class="stat-icon">⭐</div>
                    <div>
                        <h3>${reviewStats.averageRating}</h3>
                        <p>Средний рейтинг</p>
                    </div>
                </div>
                
                <div class="stat-card large">
                    <div class="stat-icon">👥</div>
                    <div>
                        <h3>${this.getUsersCount()}</h3>
                        <p>Пользователей</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="recent-orders">
                    <h3>Последние заказы</h3>
                    ${this.renderRecentOrders()}
                </div>
                
                <div class="tour-categories">
                    <h3>Туры по категориям</h3>
                    ${this.renderTourCategories()}
                </div>
            </div>
        </div>
        `;
    }

    renderTours() {
        const tours = this.tourService.getAllTours();
        
        return `
        <div class="tours-management">
            <div class="management-header">
                <h2>Управление турами</h2>
                <button class="btn btn-primary" id="addTourBtn">
                    + Добавить тур
                </button>
            </div>
            
            <div class="tours-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Рейтинг</th>
                            <th>Категория</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tours.map(tour => `
                            <tr>
                                <td>${tour.id}</td>
                                <td>
                                    <div class="tour-info-cell">
                                        <img src="${tour.image}" alt="${tour.title}">
                                        <div>
                                            <strong>${tour.title}</strong>
                                            <small>${tour.location}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>${tour.price.toLocaleString('ru-RU')} ₽</td>
                                <td>
                                    <div class="rating-cell">
                                        ⭐ ${tour.rating}
                                    </div>
                                </td>
                                <td>
                                    <span class="category-tag">${this.tourService.getCategoryName(tour.category)}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${tour.isPopular ? 'active' : 'inactive'}">
                                        ${tour.isPopular ? 'Популярный' : 'Обычный'}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon edit" data-id="${tour.id}" title="Редактировать">
                                            ✏️
                                        </button>
                                        <button class="btn-icon delete" data-id="${tour.id}" title="Удалить">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    renderOrders() {
        const orders = this.orderService.getOrders();
        
        return `
        <div class="orders-management">
            <h2>Управление заказами</h2>
            
            <div class="orders-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Клиент</th>
                            <th>Туры</th>
                            <th>Сумма</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.id.substring(0, 8)}...</td>
                                <td>
                                    <div>
                                        <strong>${order.customerInfo.name}</strong>
                                        <small>${order.customerInfo.email}</small>
                                    </div>
                                </td>
                                <td>
                                    <div class="order-items">
                                        ${order.items.slice(0, 2).map(item => `
                                            <span class="item-tag">${item.tour.title}</span>
                                        `).join('')}
                                        ${order.items.length > 2 ? `
                                            <span class="more-items">+${order.items.length - 2}</span>
                                        ` : ''}
                                    </div>
                                </td>
                                <td>${order.total.toLocaleString('ru-RU')} ₽</td>
                                <td>
                                    <select class="status-select" data-order-id="${order.id}">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>
                                            Ожидает
                                        </option>
                                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>
                                            Подтвержден
                                        </option>
                                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>
                                            Завершен
                                        </option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>
                                            Отменен
                                        </option>
                                    </select>
                                </td>
                                <td>${new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <button class="btn-icon view" data-order-id="${order.id}" title="Просмотр">
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    renderReviews() {
        const reviews = this.reviewService.getAllReviews();
        
        return `
        <div class="reviews-management">
            <h2>Модерация отзывов</h2>
            
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-card ${review.approved ? 'approved' : 'pending'}">
                        <div class="review-header">
                            <div class="reviewer">
                                <img src="${review.userAvatar}" alt="${review.userName}">
                                <div>
                                    <h4>${review.userName}</h4>
                                    <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                                </div>
                            </div>
                            <div class="review-meta">
                                <span class="tour-name">Тур #${review.tourId}</span>
                                <span class="review-date">${review.date}</span>
                            </div>
                        </div>
                        
                        <p class="review-text">${review.comment}</p>
                        
                        <div class="review-actions">
                            ${!review.approved ? `
                                <button class="btn btn-small btn-success approve-btn" data-id="${review.id}">
                                    Одобрить
                                </button>
                            ` : ''}
                            <button class="btn btn-small btn-danger delete-btn" data-id="${review.id}">
                                Удалить
                            </button>
                            <span class="review-status">
                                ${review.approved ? '✅ Одобрен' : '⏳ На модерации'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    renderUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        return `
        <div class="users-management">
            <h2>Управление пользователями</h2>
            
            <div class="users-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Роль</th>
                            <th>Дата регистрации</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar-small">${user.name.charAt(0)}</div>
                                        <span>${user.name}</span>
                                    </div>
                                </td>
                                <td>${user.email}</td>
                                <td>${user.phone || '—'}</td>
                                <td>
                                    <select class="role-select" data-user-id="${user.id}">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>
                                            Пользователь
                                        </option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>
                                            Администратор
                                        </option>
                                    </select>
                                </td>
                                <td>${new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                                <td>
                                    <button class="btn-icon delete-user" data-user-id="${user.id}" title="Удалить">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    renderAccessDenied() {
        return `
        <div class="access-denied">
            <div class="container">
                <div class="denied-content">
                    <div class="denied-icon">🚫</div>
                    <h2>Доступ запрещен</h2>
                    <p>У вас нет прав для доступа к панели администратора</p>
                    <a href="#/" class="btn btn-primary">
                        Вернуться на главную
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    // Вспомогательные методы
    getTourStats() {
        const tours = this.tourService.getAllTours();
        const categories = {};
        
        tours.forEach(tour => {
            categories[tour.category] = (categories[tour.category] || 0) + 1;
        });
        
        return {
            totalTours: tours.length,
            categories: categories
        };
    }

    getUsersCount() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.length;
    }

    renderRecentOrders() {
        const orders = this.orderService.getOrders().slice(0, 5);
        
        if (orders.length === 0) {
            return '<p>Нет заказов</p>';
        }
        
        return `
        <table class="mini-table">
            <thead>
                <tr>
                    <th>Номер</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.id.substring(0, 8)}...</td>
                        <td>${order.total.toLocaleString('ru-RU')} ₽</td>
                        <td>
                            <span class="status-dot ${order.status}"></span>
                            ${order.status}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        `;
    }

    renderTourCategories() {
        const stats = this.getTourStats();
        
        return `
        <div class="categories-chart">
            ${Object.entries(stats.categories).map(([category, count]) => `
                <div class="category-bar">
                    <span class="category-name">${this.tourService.getCategoryName(category)}</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${(count / stats.totalTours) * 100}%"></div>
                    </div>
                    <span class="category-count">${count}</span>
                </div>
            `).join('')}
        </div>
        `;
    }

    afterRender() {
        // Переключение вкладок
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.rerender();
            });
        });

        // Управление турами
        if (this.currentTab === 'tours') {
            this.setupToursManagement();
        }

        // Управление заказами
        if (this.currentTab === 'orders') {
            this.setupOrdersManagement();
        }

        // Управление отзывами
        if (this.currentTab === 'reviews') {
            this.setupReviewsManagement();
        }

        // Управление пользователями
        if (this.currentTab === 'users') {
            this.setupUsersManagement();
        }
    }

    setupToursManagement() {
        // Добавить тур
        document.getElementById('addTourBtn')?.addEventListener('click', () => {
            this.showTourForm();
        });

        // Редактировать тур
        document.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tourId = e.target.closest('button').dataset.id;
                this.editTour(tourId);
            });
        });

        // Удалить тур
        document.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tourId = e.target.closest('button').dataset.id;
                this.deleteTour(tourId);
            });
        });
    }

    setupOrdersManagement() {
        // Изменение статуса заказа
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = e.target.dataset.orderId;
                const newStatus = e.target.value;
                this.updateOrderStatus(orderId, newStatus);
            });
        });

        // Просмотр заказа
        document.querySelectorAll('.btn-icon.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('button').dataset.orderId;
                this.viewOrderDetails(orderId);
            });
        });
    }

    setupReviewsManagement() {
        // Одобрить отзыв
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const reviewId = parseInt(e.target.dataset.id);
                await this.reviewService.approveReview(reviewId);
                this.showNotification('Отзыв одобрен', 'success');
                this.rerender();
            });
        });

        // Удалить отзыв
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const reviewId = parseInt(e.target.dataset.id);
                if (confirm('Удалить этот отзыв?')) {
                    await this.reviewService.deleteReview(reviewId);
                    this.showNotification('Отзыв удален', 'success');
                    this.rerender();
                }
            });
        });
    }

    setupUsersManagement() {
        // Изменить роль пользователя
        document.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const userId = parseInt(e.target.dataset.userId);
                const newRole = e.target.value;
                this.updateUserRole(userId, newRole);
            });
        });

        // Удалить пользователя
        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.userId);
                this.deleteUser(userId);
            });
        });
    }

    // Методы для работы с данными
    showTourForm(tour = null) {
        this.editingTour = tour;
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal-overlay';
        modal.innerHTML = this.renderTourForm(tour);
        document.body.appendChild(modal);
        
        this.setupTourForm(modal);
    }

    renderTourForm(tour = null) {
        const isEditing = !!tour;
        
        return `
        <div class="admin-modal">
            <div class="modal-header">
                <h3>${isEditing ? 'Редактировать тур' : 'Добавить новый тур'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            
            <form id="tourForm" class="modal-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="tourTitle">Название тура *</label>
                        <input type="text" id="tourTitle" value="${tour?.title || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="tourLocation">Локация *</label>
                        <input type="text" id="tourLocation" value="${tour?.location || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="tourPrice">Цена (₽) *</label>
                        <input type="number" id="tourPrice" value="${tour?.price || ''}" required min="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="tourDuration">Длительность (дней) *</label>
                        <input type="number" id="tourDuration" value="${tour?.duration || ''}" required min="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="tourCategory">Категория *</label>
                        <select id="tourCategory" required>
                            <option value="">Выберите категорию</option>
                            <option value="beach" ${tour?.category === 'beach' ? 'selected' : ''}>Пляжный отдых</option>
                            <option value="city" ${tour?.category === 'city' ? 'selected' : ''}>Городской туризм</option>
                            <option value="mountain" ${tour?.category === 'mountain' ? 'selected' : ''}>Горный отдых</option>
                            <option value="cultural" ${tour?.category === 'cultural' ? 'selected' : ''}>Культурный туризм</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="tourRating">Рейтинг</label>
                        <input type="number" id="tourRating" value="${tour?.rating || 5}" min="1" max="5" step="0.1">
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="tourDescription">Описание *</label>
                        <textarea id="tourDescription" rows="4" required>${tour?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="tourImage">URL изображения *</label>
                        <input type="url" id="tourImage" value="${tour?.image || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox">
                            <input type="checkbox" id="isPopular" ${tour?.isPopular ? 'checked' : ''}>
                            <span>Популярный тур</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="tourIncludes">Включено (через запятую)</label>
                        <input type="text" id="tourIncludes" 
                               value="${tour?.includes?.join(', ') || 'breakfast, hotel, flight'}">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-form">
                        Отмена
                    </button>
                    <button type="submit" class="btn btn-primary">
                        ${isEditing ? 'Сохранить изменения' : 'Создать тур'}
                    </button>
                </div>
            </form>
        </div>
        `;
    }

    setupTourForm(modal) {
        // Закрытие
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-form').addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Отправка формы
        const form = modal.querySelector('#tourForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTour(form);
            modal.remove();
        });
    }

    async saveTour(form) {
        const formData = {
            title: form.querySelector('#tourTitle').value,
            location: form.querySelector('#tourLocation').value,
            price: parseFloat(form.querySelector('#tourPrice').value),
            duration: parseInt(form.querySelector('#tourDuration').value),
            category: form.querySelector('#tourCategory').value,
            rating: parseFloat(form.querySelector('#tourRating').value),
            description: form.querySelector('#tourDescription').value,
            image: form.querySelector('#tourImage').value,
            isPopular: form.querySelector('#isPopular').checked,
            includes: form.querySelector('#tourIncludes').value.split(',').map(item => item.trim())
        };

        try {
            if (this.editingTour) {
                // Редактирование существующего тура
                await this.updateTourInStorage(this.editingTour.id, formData);
                this.showNotification('Тур успешно обновлен', 'success');
            } else {
                // Добавление нового тура
                await this.addTourToStorage(formData);
                this.showNotification('Тур успешно добавлен', 'success');
            }
            
            this.rerender();
            
        } catch (error) {
            this.showNotification('Ошибка при сохранении тура', 'error');
        }
    }

    async addTourToStorage(tourData) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        const newTour = {
            id: Date.now(),
            ...tourData,
            createdAt: new Date().toISOString()
        };
        tours.push(newTour);
        localStorage.setItem('tours', JSON.stringify(tours));
        return newTour;
    }

    async updateTourInStorage(tourId, tourData) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        const tourIndex = tours.findIndex(t => t.id === tourId);
        
        if (tourIndex !== -1) {
            tours[tourIndex] = {
                ...tours[tourIndex],
                ...tourData,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('tours', JSON.stringify(tours));
        }
    }

    editTour(tourId) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        const tour = tours.find(t => t.id === parseInt(tourId));
        if (tour) {
            this.showTourForm(tour);
        }
    }

    async deleteTour(tourId) {
        if (confirm('Удалить этот тур? Это действие нельзя отменить.')) {
            const tours = JSON.parse(localStorage.getItem('tours')) || [];
            const updatedTours = tours.filter(t => t.id !== parseInt(tourId));
            localStorage.setItem('tours', JSON.stringify(updatedTours));
            
            this.showNotification('Тур удален', 'success');
            this.rerender();
        }
    }

    updateOrderStatus(orderId, status) {
        this.orderService.updateOrderStatus(orderId, status);
        this.showNotification('Статус заказа обновлен', 'success');
    }

    viewOrderDetails(orderId) {
        const order = this.orderService.getOrderById(orderId);
        
        const modal = document.createElement('div');
        modal.className = 'admin-modal-overlay';
        modal.innerHTML = `
            <div class="admin-modal large">
                <div class="modal-header">
                    <h3>Заказ #${order.id}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="order-details-modal">
                    <div class="customer-info">
                        <h4>Информация о клиенте</h4>
                        <p><strong>Имя:</strong> ${order.customerInfo.name}</p>
                        <p><strong>Email:</strong> ${order.customerInfo.email}</p>
                        <p><strong>Телефон:</strong> ${order.customerInfo.phone}</p>
                        <p><strong>Адрес:</strong> ${order.customerInfo.address || '—'}</p>
                    </div>
                    
                    <div class="order-items-details">
                        <h4>Состав заказа</h4>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.tour.image}" alt="${item.tour.title}">
                                <div>
                                    <h5>${item.tour.title}</h5>
                                    <p>${item.quantity} × ${item.tour.price.toLocaleString('ru-RU')} ₽ = 
                                       ${item.totalPrice.toLocaleString('ru-RU')} ₽</p>
                                </div>
                            </div>
                        `).join('')}
                        
                        <div class="order-total">
                            <strong>Итого:</strong>
                            <span>${order.total.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                    
                    <div class="order-meta">
                        <p><strong>Дата создания:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                        <p><strong>Статус:</strong> ${order.status}</p>
                        <p><strong>Способ оплаты:</strong> ${order.paymentMethod}</p>
                        <p><strong>Статус оплаты:</strong> ${order.paymentStatus}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    updateUserRole(userId, role) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].role = role;
            localStorage.setItem('users', JSON.stringify(users));
            this.showNotification('Роль пользователя обновлена', 'success');
        }
    }

    deleteUser(userId) {
        if (confirm('Удалить этого пользователя? Все его заказы и отзывы останутся в системе.')) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            this.showNotification('Пользователь удален', 'success');
            this.rerender();
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    rerender() {
        const container = document.querySelector('.admin-content');
        if (container) {
            container.innerHTML = this.renderCurrentTab();
            this.afterRender();
        }
    }
}

export default AdminComponent;