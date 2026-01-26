import HeaderComponent from './components/header/header.component.js';
import HeroComponent from './components/hero/hero.component.js';
import TourCardComponent from './components/tour-card/tour-card.component.js';
import FooterComponent from './components/footer/footer.component.js';
import TourService from './services/tour.service.js';

class AppComponent {
    constructor() {
        this.tourService = new TourService();
        this.header = new HeaderComponent();
        this.hero = new HeroComponent();
        this.footer = new FooterComponent();
    }

    render() {
        const tours = this.tourService.getAllTours();
        const tourCards = tours.map(tour => {
            const card = new TourCardComponent(tour);
            return card.render();
        }).join('');

        return `
        ${this.header.render()}
        ${this.hero.render()}
        
        <main class="container">
            <section class="popular-tours">
                <h2>Популярные направления</h2>
                <div class="tours-grid" id="toursGrid">
                    ${tourCards}
                </div>
            </section>
        </main>
        
        ${this.footer.render()}
        `;
    }

    afterRender() {
        this.header.afterRender();
        this.hero.afterRender();
        this.footer.afterRender();
        
        // Инициализируем обработчики для карточек туров
        const tours = this.tourService.getAllTours();
        tours.forEach(tour => {
            const card = new TourCardComponent(tour);
            card.afterRender();
        });
    }
}

export default AppComponent;