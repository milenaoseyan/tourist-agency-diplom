class TourCardComponent {
    constructor(tour) {
        this.tour = tour;
    }

    render() {
        return `
        <div class="tour-card" data-id="${this.tour.id}">
            <img src="${this.tour.image}" alt="${this.tour.title}" class="tour-image">
            <div class="tour-content">
                <h3>${this.tour.title}</h3>
                <p class="tour-description">${this.tour.description}</p>
                <div class="tour-info">
                    <span class="tour-price">от ${this.tour.price.toLocaleString('ru-RU')} ₽</span>
                    <span class="tour-duration">${this.tour.duration} дней</span>
                </div>
                <button class="btn btn-primary tour-details-btn" data-id="${this.tour.id}">
                    Подробнее
                </button>
            </div>
        </div>
        `;
    }

    afterRender() {
        const button = document.querySelector(`.tour-details-btn[data-id="${this.tour.id}"]`);
        button.addEventListener('click', () => {
            alert(`Вы выбрали тур: ${this.tour.title}\nЦена: ${this.tour.price} ₽`);
        });
    }
}

export default TourCardComponent;