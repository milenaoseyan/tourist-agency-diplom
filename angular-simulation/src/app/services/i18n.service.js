class I18nService {
    constructor() {
        this.currentLang = localStorage.getItem('language') || this.getBrowserLanguage();
        this.translations = {
            'ru': this.getRussianTranslations(),
            'en': this.getEnglishTranslations()
        };
    }

    // Получение языка браузера
    getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('ru') ? 'ru' : 'en';
    }

    // Русские переводы
    getRussianTranslations() {
        return {
            // Общие
            'app.name': 'TravelWave',
            'app.tagline': 'Ваш надежный партнер в мире путешествий',
            
            // Навигация
            'nav.home': 'Главная',
            'nav.tours': 'Туры',
            'nav.about': 'О нас',
            'nav.contacts': 'Контакты',
            'nav.cart': 'Корзина',
            'nav.profile': 'Профиль',
            'nav.admin': 'Админ-панель',
            'nav.promotions': 'Акции',
            'nav.faq': 'FAQ',
            
            // Кнопки
            'btn.search': 'Поиск',
            'btn.login': 'Войти',
            'btn.register': 'Регистрация',
            'btn.logout': 'Выйти',
            'btn.book': 'Забронировать',
            'btn.add_to_cart': 'В корзину',
            'btn.view_details': 'Подробнее',
            'btn.apply': 'Применить',
            'btn.reset': 'Сбросить',
            'btn.save': 'Сохранить',
            'btn.cancel': 'Отмена',
            'btn.send': 'Отправить',
            'btn.close': 'Закрыть',
            
            // Формы
            'form.email': 'Email',
            'form.password': 'Пароль',
            'form.name': 'Имя',
            'form.phone': 'Телефон',
            'form.address': 'Адрес',
            'form.message': 'Сообщение',
            'form.required': 'Обязательное поле',
            'form.invalid_email': 'Неверный email',
            
            // Hero секция
            'hero.title': 'Откройте мир с TravelWave',
            'hero.subtitle': 'Лучшие направления по самым выгодным ценам. Мечты становятся реальностью.',
            'hero.search_placeholder': 'Куда хотите поехать?',
            
            // Фильтры
            'filters.title': 'Фильтры',
            'filters.category': 'Категория',
            'filters.price': 'Цена',
            'filters.sort': 'Сортировка',
            'filters.all': 'Все',
            'filters.beach': 'Пляжный отдых',
            'filters.city': 'Городской туризм',
            'filters.mountain': 'Горный отдых',
            'filters.cultural': 'Культурный туризм',
            'filters.popular': 'По популярности',
            'filters.price_low': 'Сначала дешевле',
            'filters.price_high': 'Сначала дороже',
            'filters.duration': 'По продолжительности',
            
            // Туры
            'tours.title': 'Туры',
            'tours.popular': 'Популярные туры',
            'tours.recommended': 'Рекомендуем вам',
            'tours.similar': 'Похожие туры',
            'tours.days': 'дней',
            'tours.from': 'от',
            'tours.rating': 'Рейтинг',
            'tours.location': 'Локация',
            'tours.duration': 'Продолжительность',
            'tours.includes': 'Включено',
            'tours.description': 'Описание',
            
            // Корзина
            'cart.title': 'Корзина',
            'cart.empty': 'Корзина пуста',
            'cart.total': 'Итого',
            'cart.checkout': 'Оформить заказ',
            'cart.continue': 'Продолжить покупки',
            'cart.clear': 'Очистить корзину',
            
            // Профиль
            'profile.title': 'Личный кабинет',
            'profile.orders': 'Мои заказы',
            'profile.settings': 'Настройки',
            'profile.favorites': 'Избранное',
            'profile.reviews': 'Мои отзывы',
            
            // Админ-панель
            'admin.dashboard': 'Дашборд',
            'admin.tours': 'Туры',
            'admin.orders': 'Заказы',
            'admin.reviews': 'Отзывы',
            'admin.users': 'Пользователи',
            'admin.stats': 'Статистика',
            
            // Сообщения
            'msg.success': 'Успешно!',
            'msg.error': 'Ошибка!',
            'msg.loading': 'Загрузка...',
            'msg.no_results': 'Ничего не найдено',
            'msg.welcome': 'Добро пожаловать!',
            'msg.goodbye': 'До свидания!',
            'msg.thanks': 'Спасибо!',
            
            // Ошибки
            'error.network': 'Ошибка сети',
            'error.server': 'Ошибка сервера',
            'error.not_found': 'Не найдено',
            'error.unauthorized': 'Не авторизован',
            'error.forbidden': 'Доступ запрещен',
            
            // Время
            'time.today': 'Сегодня',
            'time.yesterday': 'Вчера',
            'time.tomorrow': 'Завтра',
            'time.now': 'Сейчас',
            
            // Месяцы
            'month.january': 'Январь',
            'month.february': 'Февраль',
            'month.march': 'Март',
            'month.april': 'Апрель',
            'month.may': 'Май',
            'month.june': 'Июнь',
            'month.july': 'Июль',
            'month.august': 'Август',
            'month.september': 'Сентябрь',
            'month.october': 'Октябрь',
            'month.november': 'Ноябрь',
            'month.december': 'Декабрь'
        };
    }

    // Английские переводы
    getEnglishTranslations() {
        return {
            // Common
            'app.name': 'TravelWave',
            'app.tagline': 'Your reliable partner in the world of travel',
            
            // Navigation
            'nav.home': 'Home',
            'nav.tours': 'Tours',
            'nav.about': 'About',
            'nav.contacts': 'Contacts',
            'nav.cart': 'Cart',
            'nav.profile': 'Profile',
            'nav.admin': 'Admin Panel',
            'nav.promotions': 'Promotions',
            'nav.faq': 'FAQ',
            
            // Buttons
            'btn.search': 'Search',
            'btn.login': 'Login',
            'btn.register': 'Register',
            'btn.logout': 'Logout',
            'btn.book': 'Book',
            'btn.add_to_cart': 'Add to Cart',
            'btn.view_details': 'View Details',
            'btn.apply': 'Apply',
            'btn.reset': 'Reset',
            'btn.save': 'Save',
            'btn.cancel': 'Cancel',
            'btn.send': 'Send',
            'btn.close': 'Close',
            
            // Forms
            'form.email': 'Email',
            'form.password': 'Password',
            'form.name': 'Name',
            'form.phone': 'Phone',
            'form.address': 'Address',
            'form.message': 'Message',
            'form.required': 'Required field',
            'form.invalid_email': 'Invalid email',
            
            // Hero section
            'hero.title': 'Discover the World with TravelWave',
            'hero.subtitle': 'Best destinations at the most affordable prices. Dreams become reality.',
            'hero.search_placeholder': 'Where do you want to go?',
            
            // Filters
            'filters.title': 'Filters',
            'filters.category': 'Category',
            'filters.price': 'Price',
            'filters.sort': 'Sort by',
            'filters.all': 'All',
            'filters.beach': 'Beach Vacation',
            'filters.city': 'City Tourism',
            'filters.mountain': 'Mountain Vacation',
            'filters.cultural': 'Cultural Tourism',
            'filters.popular': 'Popular',
            'filters.price_low': 'Price: Low to High',
            'filters.price_high': 'Price: High to Low',
            'filters.duration': 'Duration',
            
            // Tours
            'tours.title': 'Tours',
            'tours.popular': 'Popular Tours',
            'tours.recommended': 'Recommended for You',
            'tours.similar': 'Similar Tours',
            'tours.days': 'days',
            'tours.from': 'from',
            'tours.rating': 'Rating',
            'tours.location': 'Location',
            'tours.duration': 'Duration',
            'tours.includes': 'Includes',
            'tours.description': 'Description',
            
            // Cart
            'cart.title': 'Shopping Cart',
            'cart.empty': 'Your cart is empty',
            'cart.total': 'Total',
            'cart.checkout': 'Checkout',
            'cart.continue': 'Continue Shopping',
            'cart.clear': 'Clear Cart',
            
            // Profile
            'profile.title': 'My Account',
            'profile.orders': 'My Orders',
            'profile.settings': 'Settings',
            'profile.favorites': 'Favorites',
            'profile.reviews': 'My Reviews',
            
            // Admin Panel
            'admin.dashboard': 'Dashboard',
            'admin.tours': 'Tours',
            'admin.orders': 'Orders',
            'admin.reviews': 'Reviews',
            'admin.users': 'Users',
            'admin.stats': 'Statistics',
            
            // Messages
            'msg.success': 'Success!',
            'msg.error': 'Error!',
            'msg.loading': 'Loading...',
            'msg.no_results': 'No results found',
            'msg.welcome': 'Welcome!',
            'msg.goodbye': 'Goodbye!',
            'msg.thanks': 'Thank you!',
            
            // Errors
            'error.network': 'Network Error',
            'error.server': 'Server Error',
            'error.not_found': 'Not Found',
            'error.unauthorized': 'Unauthorized',
            'error.forbidden': 'Forbidden',
            
            // Time
            'time.today': 'Today',
            'time.yesterday': 'Yesterday',
            'time.tomorrow': 'Tomorrow',
            'time.now': 'Now',
            
            // Months
            'month.january': 'January',
            'month.february': 'February',
            'month.march': 'March',
            'month.april': 'April',
            'month.may': 'May',
            'month.june': 'June',
            'month.july': 'July',
            'month.august': 'August',
            'month.september': 'September',
            'month.october': 'October',
            'month.november': 'November',
            'month.december': 'December'
        };
    }

    // Получение перевода
    translate(key, params = {}) {
        let translation = this.translations[this.currentLang][key] || key;
        
        // Замена параметров
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }

    // Сокращенный метод
    t(key, params = {}) {
        return this.translate(key, params);
    }

    // Изменение языка
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.dispatchLanguageChangeEvent();
            return true;
        }
        return false;
    }

    // Получение текущего языка
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Получение списка доступных языков
    getAvailableLanguages() {
        return Object.keys(this.translations).map(lang => ({
            code: lang,
            name: lang === 'ru' ? 'Русский' : 'English',
            flag: lang === 'ru' ? '🇷🇺' : '🇺🇸'
        }));
    }

    // Событие изменения языка
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languagechange', {
            detail: { language: this.currentLang }
        });
        window.dispatchEvent(event);
    }

    // Форматирование даты с учетом языка
    formatDate(date, format = 'medium') {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return d.toLocaleDateString(this.currentLang === 'ru' ? 'ru-RU' : 'en-US', options);
    }

    // Форматирование цены с учетом языка
    formatPrice(price) {
        const formatter = new Intl.NumberFormat(this.currentLang === 'ru' ? 'ru-RU' : 'en-US', {
            style: 'currency',
            currency: this.currentLang === 'ru' ? 'RUB' : 'USD',
            minimumFractionDigits: 0
        });
        
        // Конвертация для демонстрации (1 USD = 90 RUB)
        const convertedPrice = this.currentLang === 'ru' ? price : Math.round(price / 90);
        
        return formatter.format(convertedPrice);
    }

    // Форматирование числа
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLang === 'ru' ? 'ru-RU' : 'en-US').format(number);
    }
}

export default I18nService;