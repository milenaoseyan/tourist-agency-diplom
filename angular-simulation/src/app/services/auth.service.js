class AuthService {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.isAuthenticated = !!this.currentUser;
    }

    // Регистрация
    async register(userData) {
        // Имитация API запроса
        await this.simulateApiCall();
        
        // Проверка на существующего пользователя
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Автоматический вход после регистрации
        return this.login(userData.email, userData.password);
    }

    // Вход
    async login(email, password) {
        await this.simulateApiCall();
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Неверный email или пароль');
        }
        
        // Убираем пароль из сохраненных данных
        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword;
        this.isAuthenticated = true;
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return this.currentUser;
    }

    // Выход
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка авторизации
    isLoggedIn() {
        return this.isAuthenticated;
    }

    // Обновление профиля
    async updateProfile(userData) {
        await this.simulateApiCall();
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            throw new Error('Пользователь не найден');
        }
        
        // Обновляем данные
        users[userIndex] = {
            ...users[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
        };
        
        // Обновляем текущего пользователя
        const { password: _, ...updatedUser } = users[userIndex];
        this.currentUser = updatedUser;
        
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        return this.currentUser;
    }

    // Имитация задержки API
    simulateApiCall(delay = 500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Проверка email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Проверка пароля
    isValidPassword(password) {
        return password.length >= 6;
    }
}

export default AuthService;