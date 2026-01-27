import CartItem from '../models/cart-item.model.js';

class CartService {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    }

    // Корзина
    addToCart(tour, quantity = 1) {
        const existingItem = this.cartItems.find(item => item.tour.id === tour.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.totalPrice = existingItem.tour.price * existingItem.quantity;
        } else {
            this.cartItems.push(new CartItem(tour, quantity));
        }
        
        this.saveCart();
        return this.cartItems;
    }

    removeFromCart(tourId) {
        this.cartItems = this.cartItems.filter(item => item.tour.id !== tourId);
        this.saveCart();
    }

    updateQuantity(tourId, quantity) {
        const item = this.cartItems.find(item => item.tour.id === tourId);
        if (item) {
            item.quantity = quantity;
            item.totalPrice = item.tour.price * quantity;
            this.saveCart();
        }
    }

    getCartItems() {
        return this.cartItems;
    }

    getCartTotal() {
        return this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
    }

    clearCart() {
        this.cartItems = [];
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    // Избранное
    toggleFavorite(tour) {
        const index = this.favorites.findIndex(fav => fav.id === tour.id);
        
        if (index === -1) {
            this.favorites.push(tour);
        } else {
            this.favorites.splice(index, 1);
        }
        
        this.saveFavorites();
        return this.favorites;
    }

    isFavorite(tourId) {
        return this.favorites.some(fav => fav.id === tourId);
    }

    getFavorites() {
        return this.favorites;
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    // Общие методы
    getItemCount() {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }
}

export default CartService;