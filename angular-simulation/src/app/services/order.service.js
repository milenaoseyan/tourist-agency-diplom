import CartService from './cart.service.js';

class OrderService {
    constructor() {
        this.cartService = new CartService();
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Создание заказа
    async createOrder(orderData) {
        await this.simulateApiCall();
        
        const cartItems = this.cartService.getCartItems();
        
        if (cartItems.length === 0) {
            throw new Error('Корзина пуста');
        }
        
        const order = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            items: cartItems,
            total: this.cartService.getCartTotal(),
            customerInfo: {
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone,
                address: orderData.address
            },
            status: 'pending', // pending, confirmed, completed, cancelled
            paymentStatus: 'unpaid', // unpaid, paid, refunded
            paymentMethod: orderData.paymentMethod || 'card',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.orders.push(order);
        this.saveOrders();
        
        // Очищаем корзину после создания заказа
        this.cartService.clearCart();
        
        return order;
    }

    // Получение всех заказов пользователя
    getOrders() {
        return this.orders;
    }

    // Получение заказа по ID
    getOrderById(orderId) {
        return this.orders.find(order => order.id === orderId);
    }

    // Обновление статуса заказа
    updateOrderStatus(orderId, status) {
        const order = this.getOrderById(orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
        }
        return order;
    }

    // Получение статистики
    getStats() {
        const totalOrders = this.orders.length;
        const completedOrders = this.orders.filter(o => o.status === 'completed').length;
        const totalRevenue = this.orders
            .filter(o => o.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
        
        return {
            totalOrders,
            completedOrders,
            totalRevenue,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        };
    }

    // Сохранение заказов
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Имитация API
    simulateApiCall(delay = 300) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

export default OrderService;