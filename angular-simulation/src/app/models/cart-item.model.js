class CartItem {
    constructor(tour, quantity = 1, selectedDate = null) {
        this.tour = tour;
        this.quantity = quantity;
        this.selectedDate = selectedDate || new Date();
        this.totalPrice = tour.price * quantity;
    }
}

export default CartItem;