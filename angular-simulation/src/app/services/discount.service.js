class DiscountService {
    constructor() {
        this.coupons = JSON.parse(localStorage.getItem('coupons')) || this.getDefaultCoupons();
        this.promotions = JSON.parse(localStorage.getItem('promotions')) || this.getDefaultPromotions();
        this.userCoupons = JSON.parse(localStorage.getItem('user_coupons')) || {};
    }

    // Получение дефолтных купонов
    getDefaultCoupons() {
        return [
            {
                id: 1,
                code: 'WELCOME20',
                description: 'Скидка 20% на первый заказ',
                discountType: 'percentage', // percentage или fixed
                discountValue: 20,
                minOrderAmount: 5000,
                maxDiscount: 10000,
                validFrom: '2024-01-01',
                validTo: '2024-12-31',
                usageLimit: 1,
                usedCount: 0,
                isActive: true
            },
            {
                id: 2,
                code: 'SUMMER15',
                description: 'Летняя скидка 15%',
                discountType: 'percentage',
                discountValue: 15,
                minOrderAmount: 10000,
                maxDiscount: 15000,
                validFrom: '2024-06-01',
                validTo: '2024-08-31',
                usageLimit: 100,
                usedCount: 42,
                isActive: true
            },
            {
                id: 3,
                code: 'FIXED5000',
                description: 'Скидка 5000₽ на любой тур',
                discountType: 'fixed',
                discountValue: 5000,
                minOrderAmount: 20000,
                maxDiscount: 5000,
                validFrom: '2024-01-01',
                validTo: '2024-12-31',
                usageLimit: 50,
                usedCount: 23,
                isActive: true
            },
            {
                id: 4,
                code: 'LOYALTY10',
                description: 'Скидка 10% для постоянных клиентов',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 0,
                maxDiscount: null,
                validFrom: '2024-01-01',
                validTo: '2024-12-31',
                usageLimit: null, // Без ограничения
                usedCount: 156,
                isActive: true
            }
        ];
    }

    // Получение дефолтных акций
    getDefaultPromotions() {
        return [
            {
                id: 1,
                title: 'Раннее бронирование',
                description: 'Забронируй тур за 3 месяца и получи скидку 25%',
                discount: 25,
                type: 'early_booking',
                conditions: 'Бронирование за 90+ дней до вылета',
                validUntil: '2024-12-31',
                isActive: true,
                image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 2,
                title: 'Семейный отдых',
                description: 'Специальные условия для семей с детьми',
                discount: 15,
                type: 'family',
                conditions: 'При бронировании 2+ взрослых и 1+ ребенка',
                validUntil: '2024-12-31',
                isActive: true,
                image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 3,
                title: 'Горящие туры',
                description: 'Скидки до 40% на туры с вылетом в течение недели',
                discount: 40,
                type: 'last_minute',
                conditions: 'Вылет в течение 7 дней',
                validUntil: '2024-12-31',
                isActive: true,
                image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
            },
            {
                id: 4,
                title: 'День рождения',
                description: 'Специальный подарок имениннику',
                discount: 10,
                type: 'birthday',
                conditions: 'Бронирование в течение месяца до/после дня рождения',
                validUntil: '2024-12-31',
                isActive: true,
                image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w-1350&q=80'
            }
        ];
    }

    // Проверка купона
    validateCoupon(code, orderAmount, userId) {
        const coupon = this.coupons.find(c => c.code === code && c.isActive);
        
        if (!coupon) {
            return {
                valid: false,
                message: 'Купон не найден или не активен'
            };
        }

        // Проверка срока действия
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validTo = new Date(coupon.validTo);
        
        if (now < validFrom || now > validTo) {
            return {
                valid: false,
                message: 'Купон просрочен'
            };
        }

        // Проверка минимальной суммы
        if (orderAmount < coupon.minOrderAmount) {
            return {
                valid: false,
                message: `Минимальная сумма заказа для этого купона: ${coupon.minOrderAmount}₽`
            };
        }

        // Проверка лимита использования
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return {
                valid: false,
                message: 'Лимит использования купона исчерпан'
            };
        }

        // Проверка использования пользователем
        if (userId) {
            const userUsedCoupons = this.userCoupons[userId] || [];
            if (userUsedCoupons.includes(coupon.id)) {
                // Проверка лимита на пользователя
                const userCouponLimit = 1; // По умолчанию 1 использование на пользователя
                const userUsageCount = userUsedCoupons.filter(id => id === coupon.id).length;
                
                if (userUsageCount >= userCouponLimit) {
                    return {
                        valid: false,
                        message: 'Вы уже использовали этот купон'
                    };
                }
            }
        }

        // Расчет скидки
        let discountAmount = 0;
        
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            
            // Проверка максимальной скидки
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        return {
            valid: true,
            coupon: coupon,
            discountAmount: discountAmount,
            message: `Купон применен! Скидка: ${discountAmount}₽`
        };
    }

    // Применение купона
    applyCoupon(code, orderAmount, userId) {
        const validation = this.validateCoupon(code, orderAmount, userId);
        
        if (validation.valid) {
            const coupon = validation.coupon;
            
            // Увеличиваем счетчик использования
            coupon.usedCount++;
            
            // Сохраняем использование пользователем
            if (userId) {
                if (!this.userCoupons[userId]) {
                    this.userCoupons[userId] = [];
                }
                this.userCoupons[userId].push(coupon.id);
            }
            
            // Сохраняем изменения
            this.saveData();
            
            return validation;
        }
        
        return validation;
    }

    // Получение всех активных купонов
    getActiveCoupons() {
        const now = new Date();
        return this.coupons.filter(coupon => {
            if (!coupon.isActive) return false;
            
            const validFrom = new Date(coupon.validFrom);
            const validTo = new Date(coupon.validTo);
            
            return now >= validFrom && now <= validTo;
        });
    }

    // Получение всех активных акций
    getActivePromotions() {
        const now = new Date();
        return this.promotions.filter(promotion => {
            if (!promotion.isActive) return false;
            
            const validUntil = new Date(promotion.validUntil);
            return now <= validUntil;
        });
    }

    // Получение купонов пользователя
    getUserCoupons(userId) {
        const userCouponIds = this.userCoupons[userId] || [];
        return this.coupons.filter(coupon => userCouponIds.includes(coupon.id));
    }

    // Создание нового купона (для админа)
    createCoupon(couponData) {
        const newCoupon = {
            id: Date.now(),
            ...couponData,
            usedCount: 0,
            isActive: true
        };
        
        this.coupons.push(newCoupon);
        this.saveData();
        
        return newCoupon;
    }

    // Создание новой акции (для админа)
    createPromotion(promotionData) {
        const newPromotion = {
            id: Date.now(),
            ...promotionData,
            isActive: true
        };
        
        this.promotions.push(newPromotion);
        this.saveData();
        
        return newPromotion;
    }

    // Получение статистики по купонам
    getCouponStats() {
        const totalCoupons = this.coupons.length;
        const activeCoupons = this.getActiveCoupons().length;
        const totalUses = this.coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
        const totalDiscount = this.calculateTotalDiscount();
        
        return {
            totalCoupons,
            activeCoupons,
            totalUses,
            totalDiscount,
            averageUsage: totalUses / totalCoupons
        };
    }

    // Расчет общего размера скидок
    calculateTotalDiscount() {
        // Упрощенный расчет
        return this.coupons.reduce((sum, coupon) => {
            if (coupon.discountType === 'percentage') {
                return sum + (coupon.maxDiscount || 10000) * coupon.usedCount;
            } else {
                return sum + coupon.discountValue * coupon.usedCount;
            }
        }, 0);
    }

    // Сохранение данных
    saveData() {
        localStorage.setItem('coupons', JSON.stringify(this.coupons));
        localStorage.setItem('promotions', JSON.stringify(this.promotions));
        localStorage.setItem('user_coupons', JSON.stringify(this.userCoupons));
    }
}

export default DiscountService;