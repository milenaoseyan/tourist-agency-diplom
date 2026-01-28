class ApiService {
    constructor() {
        this.baseUrl = 'https://api.travelwave.com/v1';
        this.simulateNetwork = true;
    }

    // Общий метод для запросов
    async request(endpoint, method = 'GET', data = null) {
        // Имитация сетевой задержки
        if (this.simulateNetwork) {
            await this.simulateDelay();
            
            // Имитация случайных ошибок (10% chance)
            if (Math.random() < 0.1) {
                throw new Error('Сетевая ошибка. Пожалуйста, попробуйте снова.');
            }
        }
        
        // Получение данных из localStorage в зависимости от endpoint
        return this.handleMockRequest(endpoint, method, data);
    }

    // Обработка мок-запросов
    handleMockRequest(endpoint, method, data) {
        switch (endpoint) {
            case '/tours':
                return this.handleToursRequest(method, data);
            case '/auth/login':
                return this.handleLoginRequest(data);
            case '/auth/register':
                return this.handleRegisterRequest(data);
            case '/orders':
                return this.handleOrdersRequest(method, data);
            case '/reviews':
                return this.handleReviewsRequest(method, data);
            default:
                throw new Error(`Endpoint ${endpoint} not found`);
        }
    }

    // Обработка запросов туров
    handleToursRequest(method, data) {
        const tours = JSON.parse(localStorage.getItem('tours')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: tours,
                    total: tours.length
                };
            case 'POST':
                const newTour = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString()
                };
                tours.push(newTour);
                localStorage.setItem('tours', JSON.stringify(tours));
                return {
                    success: true,
                    data: newTour,
                    message: 'Тур успешно создан'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Обработка входа
    handleLoginRequest(data) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.email === data.email && u.password === data.password
        );
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return {
                success: true,
                data: {
                    user: userWithoutPassword,
                    token: this.generateMockToken()
                }
            };
        }
        
        return {
            success: false,
            error: 'Неверный email или пароль'
        };
    }

    // Обработка регистрации
    handleRegisterRequest(data) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Проверка на существующего пользователя
        if (users.some(u => u.email === data.email)) {
            return {
                success: false,
                error: 'Пользователь с таким email уже существует'
            };
        }
        
        const newUser = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString(),
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        const { password, ...userWithoutPassword } = newUser;
        
        return {
            success: true,
            data: {
                user: userWithoutPassword,
                token: this.generateMockToken()
            }
        };
    }

    // Обработка заказов
    handleOrdersRequest(method, data) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: orders,
                    total: orders.length
                };
            case 'POST':
                const newOrder = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    ...data,
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                };
                orders.push(newOrder);
                localStorage.setItem('orders', JSON.stringify(orders));
                return {
                    success: true,
                    data: newOrder,
                    message: 'Заказ успешно создан'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Обработка отзывов
    handleReviewsRequest(method, data) {
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        
        switch (method) {
            case 'GET':
                return {
                    success: true,
                    data: reviews,
                    total: reviews.length
                };
            case 'POST':
                const newReview = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date().toISOString(),
                    approved: false
                };
                reviews.push(newReview);
                localStorage.setItem('reviews', JSON.stringify(reviews));
                return {
                    success: true,
                    data: newReview,
                    message: 'Отзыв успешно добавлен'
                };
            default:
                return {
                    success: false,
                    error: 'Method not allowed'
                };
        }
    }

    // Генерация мок-токена
    generateMockToken() {
        return 'mock-jwt-token-' + Date.now() + '-' + Math.random().toString(36).substr(2);
    }

    // Имитация задержки сети
    simulateDelay(min = 200, max = 800) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Установка симуляции сети
    setNetworkSimulation(enabled) {
        this.simulateNetwork = enabled;
    }
}

export default ApiService;