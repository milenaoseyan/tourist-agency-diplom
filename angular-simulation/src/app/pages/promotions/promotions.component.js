import DiscountService from '../../services/discount.service.js';
import AuthService from '../../services/auth.service.js';

class PromotionsComponent {
    constructor() {
        this.discountService = new DiscountService();
        this.authService = new AuthService();
        this.activeTab = 'promotions'; // promotions или coupons
    }

    async render() {
        const promotions = this.discountService.getActivePromotions();
        const coupons = this.discountService.getActiveCoupons();
        const user = this.authService.getCurrentUser();
        const userCoupons = user ? this.discountService.getUserCoupons(user.id) : [];

        return `
        <div class="promotions-page">
            <div class="promotions-hero">
                <div class="container">
                    <h1>🎁 Акции и скидки</h1>
                    <p>Самые выгодные предложения для вашего отдыха</p>
                </div>
            </div>
            
            <div class="container">
                <div class="promotions-tabs">
                    <button class="promo-tab ${this.activeTab === 'promotions' ? 'active' : ''}" 
                            data-tab="promotions">
                        Акции
                        <span class="tab-badge">${promotions.length}</span>
                    </button>
                    <button class="promo-tab ${this.activeTab === 'coupons' ? 'active' : ''}" 
                            data-tab="coupons">
                        Купоны
                        <span class="tab-badge">${coupons.length}</span>
                    </button>
                    ${user ? `
                        <button class="promo-tab ${this.activeTab === 'my-coupons' ? 'active' : ''}" 
                                data-tab="my-coupons">
                            Мои купоны
                            <span class="tab-badge">${userCoupons.length}</span>
                        </button>
                    ` : ''}
                </div>
                
                <div class="promotions-content">
                    ${this.activeTab === 'promotions' ? this.renderPromotions(promotions) : ''}
                    ${this.activeTab === 'coupons' ? this.renderCoupons(coupons) : ''}
                    ${this.activeTab === 'my-coupons' ? this.renderMyCoupons(userCoupons) : ''}
                </div>
                
                <div class="promotions-info">
                    <div class="info-card">
                        <h3>💡 Как использовать купоны?</h3>
                        <ol>
                            <li>Выберите подходящий купон из списка</li>
                            <li>Скопируйте промокод</li>
                            <li>Введите промокод при оформлении заказа</li>
                            <li>Скидка автоматически применится к итоговой сумме</li>
                        </ol>
                    </div>
                    
                    <div class="info-card">
                        <h3>📝 Условия акций</h3>
                        <ul>
                            <li>Акции не суммируются между собой</li>
                            <li>Скидка по акции применяется автоматически</li>
                            <li>Каждая акция имеет свои условия</li>
                            <li>Для получения акции условия должны быть выполнены полностью</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderPromotions(promotions) {
        if (promotions.length === 0) {
            return `
            <div class="no-promotions">
                <div class="no-promo-icon">🎁</div>
                <h3>Акций пока нет</h3>
                <p>Следите за обновлениями, скоро появятся новые выгодные предложения!</p>
            </div>
            `;
        }

        return `
        <div class="promotions-grid">
            ${promotions.map(promo => `
                <div class="promotion-card">
                    <div class="promotion-image">
                        <img src="${promo.image}" alt="${promo.title}" loading="lazy">
                        <div class="promotion-badge">
                            -${promo.discount}%
                        </div>
                    </div>
                    
                    <div class="promotion-content">
                        <h3>${promo.title}</h3>
                        <p>${promo.description}</p>
                        
                        <div class="promotion-details">
                            <div class="detail-item">
                                <span class="detail-label">Условия:</span>
                                <span class="detail-value">${promo.conditions}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Действует до:</span>
                                <span class="detail-value">${new Date(promo.validUntil).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        
                        <div class="promotion-actions">
                            <a href="#/tours" class="btn btn-primary">
                                Выбрать тур
                            </a>
                            <button class="btn btn-text share-promotion" data-id="${promo.id}">
                                📤 Поделиться
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    }

    renderCoupons(coupons) {
        if (coupons.length === 0) {
            return `
            <div class="no-coupons">
                <div class="no-coupon-icon">🎫</div>
                <h3>Доступных купонов нет</h3>
                <p>Новые купоны появятся скоро!</p>
            </div>
            `;
        }

        return `
        <div class="coupons-grid">
            ${coupons.map(coupon => `
                <div class="coupon-card ${coupon.usedCount >= (coupon.usageLimit || Infinity) ? 'expired' : ''}">
                    <div class="coupon-header">
                        <div class="coupon-discount">
                            ${coupon.discountType === 'percentage' ? 
                                `-${coupon.discountValue}%` : 
                                `-${coupon.discountValue}₽`
                            }
                        </div>
                        <div class="coupon-code">
                            <code>${coupon.code}</code>
                            <button class="copy-coupon" data-code="${coupon.code}">
                                📋
                            </button>
                        </div>
                    </div>
                    
                    <div class="coupon-body">
                        <h4>${coupon.description}</h4>
                        
                        <div class="coupon-conditions">
                            <div class="condition">
                                <span class="condition-label">Мин. сумма:</span>
                                <span class="condition-value">${coupon.minOrderAmount}₽</span>
                            </div>
                            
                            ${coupon.maxDiscount ? `
                                <div class="condition">
                                    <span class="condition-label">Макс. скидка:</span>
                                    <span class="condition-value">${coupon.maxDiscount}₽</span>
                                </div>
                            ` : ''}
                            
                            <div class="condition">
                                <span class="condition-label">Действует до:</span>
                                <span class="condition-value">${new Date(coupon.validTo).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        
                        <div class="coupon-usage">
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${(coupon.usedCount / (coupon.usageLimit || 100)) * 100}%"></div>
                            </div>
                            <div class="usage-text">
                                Использовано: ${coupon.usedCount} из ${coupon.usageLimit || '∞'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="coupon-footer">
                        <a href="#/tours" class="btn btn-small btn-primary">
                            Использовать
                        </a>
                        <button class="btn btn-small btn-text save-coupon" data-id="${coupon.id}">
                            💾 Сохранить
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        `;
    }

    renderMyCoupons(userCoupons) {
        if (userCoupons.length === 0) {
            return `
            <div class="no-my-coupons">
                <div class="no-coupon-icon">🎫</div>
                <h3>У вас нет сохраненных купонов</h3>
                <p>Сохраняйте купоны, чтобы использовать их при бронировании</p>
                <button class="btn btn-primary" id="goToCoupons">
                    Посмотреть все купоны
                </button>
            </div>
            `;
        }

        return `
        <div class="my-coupons">
            <div class="my-coupons-header">
                <h3>Мои сохраненные купоны</h3>
                <p>Вы можете использовать эти купоны при оформлении заказа</p>
            </div>
            
            <div class="my-coupons-grid">
                ${userCoupons.map(coupon => `
                    <div class="my-coupon-card">
                        <div class="my-coupon-code">
                            <strong>${coupon.code}</strong>
                            <span class="coupon-discount-badge">
                                ${coupon.discountType === 'percentage' ? 
                                    `-${coupon.discountValue}%` : 
                                    `-${coupon.discountValue}₽`
                                }
                            </span>
                        </div>
                        
                        <p class="my-coupon-description">${coupon.description}</p>
                        
                        <div class="my-coupon-info">
                            <div class="info-row">
                                <span>Минимальная сумма:</span>
                                <strong>${coupon.minOrderAmount}₽</strong>
                            </div>
                            <div class="info-row">
                                <span>Действует до:</span>
                                <strong>${new Date(coupon.validTo).toLocaleDateString('ru-RU')}</strong>
                            </div>
                        </div>
                        
                        <div class="my-coupon-actions">
                            <button class="btn btn-small copy-coupon" data-code="${coupon.code}">
                                📋 Копировать код
                            </button>
                            <a href="#/tours" class="btn btn-small btn-primary">
                                Использовать
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    afterRender() {
        // Переключение вкладок
        document.querySelectorAll('.promo-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.activeTab = e.target.dataset.tab;
                this.rerender();
            });
        });

        // Копирование купонов
        document.querySelectorAll('.copy-coupon').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const code = e.target.closest('button').dataset.code;
                await this.copyCouponCode(code);
            });
        });

        // Сохранение купонов
        document.querySelectorAll('.save-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = parseInt(e.target.closest('button').dataset.id);
                this.saveCouponToUser(couponId);
            });
        });

        // Поделиться акцией
        document.querySelectorAll('.share-promotion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const promoId = parseInt(e.target.closest('button').dataset.id);
                this.sharePromotion(promoId);
            });
        });

        // Переход к купонам
        document.getElementById('goToCoupons')?.addEventListener('click', () => {
            this.activeTab = 'coupons';
            this.rerender();
        });
    }

    async copyCouponCode(code) {
        try {
            await navigator.clipboard.writeText(code);
            this.showNotification(`Купон ${code} скопирован!`, 'success');
        } catch (error) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showNotification(`Купон ${code} скопирован!`, 'success');
        }
    }

    saveCouponToUser(couponId) {
        const user = this.authService.getCurrentUser();
        
        if (!user) {
            this.showNotification('Войдите в аккаунт, чтобы сохранять купоны', 'warning');
            return;
        }

        const coupon = this.discountService.coupons.find(c => c.id === couponId);
        if (!coupon) {
            this.showNotification('Купон не найден', 'error');
            return;
        }

        // Проверка, не сохранен ли уже купон
        const userCoupons = this.discountService.userCoupons[user.id] || [];
        if (userCoupons.includes(couponId)) {
            this.showNotification('Этот купон уже сохранен', 'info');
            return;
        }

        // Сохраняем купон
        if (!this.discountService.userCoupons[user.id]) {
            this.discountService.userCoupons[user.id] = [];
        }
        this.discountService.userCoupons[user.id].push(couponId);
        this.discountService.saveData();

        this.showNotification('Купон сохранен в вашей коллекции!', 'success');
        
        // Обновляем отображение если на вкладке "Мои купоны"
        if (this.activeTab === 'my-coupons') {
            this.rerender();
        }
    }

    sharePromotion(promoId) {
        const promotion = this.discountService.promotions.find(p => p.id === promoId);
        if (!promotion) return;

        const shareText = `Акция от TravelWave: ${promotion.title} - ${promotion.description}. Подробнее: ${window.location.origin}/#/promotions`;
        
        if (navigator.share) {
            navigator.share({
                title: promotion.title,
                text: promotion.description,
                url: `${window.location.origin}/#/promotions`
            }).catch(error => {
                console.log('Ошибка при использовании Web Share API:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Ссылка на акцию скопирована!', 'success');
        } catch (error) {
            this.showNotification('Не удалось скопировать ссылку', 'error');
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
        }, 3000);
    }

    async rerender() {
        const container = document.querySelector('.promotions-content');
        if (container) {
            container.innerHTML = await (async () => {
                const promotions = this.discountService.getActivePromotions();
                const coupons = this.discountService.getActiveCoupons();
                const user = this.authService.getCurrentUser();
                const userCoupons = user ? this.discountService.getUserCoupons(user.id) : [];

                switch (this.activeTab) {
                    case 'promotions':
                        return this.renderPromotions(promotions);
                    case 'coupons':
                        return this.renderCoupons(coupons);
                    case 'my-coupons':
                        return this.renderMyCoupons(userCoupons);
                    default:
                        return '';
                }
            })();
            this.afterRender();
        }
    }
}

export default PromotionsComponent;