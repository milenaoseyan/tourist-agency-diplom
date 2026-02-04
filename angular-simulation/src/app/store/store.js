class Store {
constructor() {
    this.state = {
    tours: [],
    cart: [],
    user: null,
    filters: {},
    loading: false,
    notifications: []
    };
    this.subscribers = [];
    this.initialized = false;
}

  // Инициализация хранилища
async init() {
    if (this.initialized) return;
    
    this.state = {
    tours: JSON.parse(localStorage.getItem('tours')) || [],
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('currentUser')) || null,
    filters: JSON.parse(localStorage.getItem('filters')) || {},
    loading: false,
    notifications: [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || []
    };
    
    this.initialized = true;
    this.notify();
}

  // Получение состояния
getState() {
    return { ...this.state };
}

  // Изменение состояния
setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveToStorage();
    this.notify();
}

  // Диспатч действий
dispatch(action) {
    switch (action.type) {
    case 'ADD_TO_CART':
        this.handleAddToCart(action.payload);
        break;
    case 'REMOVE_FROM_CART':
        this.handleRemoveFromCart(action.payload);
        break;
    case 'SET_USER':
        this.handleSetUser(action.payload);
        break;
    case 'SET_FILTERS':
        this.handleSetFilters(action.payload);
        break;
    case 'TOGGLE_FAVORITE':
        this.handleToggleFavorite(action.payload);
        break;
    case 'ADD_NOTIFICATION':
        this.handleAddNotification(action.payload);
        break;
    case 'SET_LOADING':
        this.setState({ loading: action.payload });
        break;
    default:
        console.warn('Unknown action type:', action.type);
    }
}

  // Обработчики действий
handleAddToCart(item) {
    const cart = [...this.state.cart];
    const existingItem = cart.find(i => i.tourId === item.tourId);
    
    if (existingItem) {
    existingItem.quantity += item.quantity;
    } else {
    cart.push(item);
    }
    
    this.setState({ cart });
}

handleRemoveFromCart(tourId) {
    const cart = this.state.cart.filter(item => item.tourId !== tourId);
    this.setState({ cart });
}

handleSetUser(user) {
    this.setState({ user });
}

handleSetFilters(filters) {
    this.setState({ filters });
}

handleToggleFavorite(tourId) {
    const favorites = [...this.state.favorites];
    const index = favorites.indexOf(tourId);
    
    if (index > -1) {
    favorites.splice(index, 1);
    } else {
    favorites.push(tourId);
    }
    
    this.setState({ favorites });
    return !(index > -1); // Возвращает true если добавили, false если удалили
}

handleAddNotification(notification) {
    const notifications = [...this.state.notifications, notification];
    this.setState({ notifications });
    
    // Автоматическое удаление через 5 секунд
    if (notification.autoClose !== false) {
    setTimeout(() => {
        this.handleRemoveNotification(notification.id);
    }, 5000);
    }
}

handleRemoveNotification(id) {
    const notifications = this.state.notifications.filter(n => n.id !== id);
    this.setState({ notifications });
}

  // Подписка на изменения
subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
}

notify() {
    this.subscribers.forEach(callback => callback(this.state));
}

  // Сохранение в localStorage
saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.state.cart));
    localStorage.setItem('filters', JSON.stringify(this.state.filters));
    localStorage.setItem('favorites', JSON.stringify(this.state.favorites));
    
    if (this.state.user) {
    localStorage.setItem('currentUser', JSON.stringify(this.state.user));
    }
}

  // Селекторы (для получения производных данных)
getCartTotal() {
    return this.state.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
}

getCartItemCount() {
    return this.state.cart.reduce((count, item) => count + item.quantity, 0);
}

getFavoriteTours() {
    return this.state.tours.filter(tour => 
    this.state.favorites.includes(tour.id)
    );
}

isFavorite(tourId) {
    return this.state.favorites.includes(tourId);
}
}

// Экспорт синглтона
const store = new Store();
export default store;