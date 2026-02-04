import store from '../../store/store.js';
import TourService from '../../services/tour.service.js';
import TourCardComponent from '../tour-card/tour-card.component.js';
import CartService from '../../services/cart.service.js';

class FavoritesComponent {
  constructor() {
    this.tourService = new TourService();
    this.cartService = new CartService();
    this.unsubscribe = null;
    this.state = {
      favorites: [],
      tours: []
    };
  }

  async render() {
    await this.updateState();
    
    if (this.state.favorites.length === 0) {
      return `
        <div class="favorites-empty">
          <div class="empty-icon">❤️</div>
          <h3>В избранном пока ничего нет</h3>
          <p>Добавляйте туры в избранное, чтобы вернуться к ним позже</p>
          <a href="#/tours" class="btn btn-primary">Найти туры</a>
        </div>
      `;
    }

    const favoriteTours = this.state.tours.filter(tour => 
      this.state.favorites.includes(tour.id)
    );

    return `
      <div class="favorites-section">
        <div class="favorites-header">
          <h2>❤️ Избранное</h2>
          <div class="favorites-stats">
            <span class="favorites-count">${favoriteTours.length} туров</span>
            ${favoriteTours.length > 0 ? `
              <button class="btn btn-text" id="clearFavorites">
                Очистить всё
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="favorites-grid">
          ${favoriteTours.map(tour => {
            const card = new TourCardComponent(tour, this.cartService);
            return card.render();
          }).join('')}
        </div>
        
        ${favoriteTours.length > 4 ? `
          <div class="favorites-actions">
            <button class="btn btn-primary" id="compareFavorites">
              Сравнить выбранные (${this.getSelectedCount()})
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  async afterRender() {
    await this.updateState();
    
    // Подписка на изменения
    this.unsubscribe = store.subscribe(async (state) => {
      this.state.favorites = state.favorites;
      await this.updateState();
      this.rerender();
    });

    // Очистка избранного
    document.getElementById('clearFavorites')?.addEventListener('click', () => {
      if (confirm('Очистить все избранные туры?')) {
        this.clearAllFavorites();
      }
    });

    // Сравнение туров
    document.getElementById('compareFavorites')?.addEventListener('click', () => {
      this.compareSelected();
    });

    // Обработка кликов по сердечкам
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tourId = parseInt(btn.dataset.tourId);
        this.toggleFavorite(tourId);
      });
    });
  }

  async updateState() {
    const state = store.getState();
    this.state.favorites = state.favorites;
    this.state.tours = this.tourService.getAllTours();
  }

  toggleFavorite(tourId) {
    const isAdded = store.dispatch({
      type: 'TOGGLE_FAVORITE',
      payload: tourId
    });
    
    const message = isAdded 
      ? 'Тур добавлен в избранное' 
      : 'Тур удалён из избранного';
    
    NotificationCenterComponent.success(message);
  }

  clearAllFavorites() {
    const state = store.getState();
    state.favorites.forEach(tourId => {
      store.dispatch({
        type: 'TOGGLE_FAVORITE',
        payload: tourId
      });
    });
    
    NotificationCenterComponent.success('Все туры удалены из избранного');
  }

  getSelectedCount() {
    // Здесь можно добавить логику выбора для сравнения
    return 0;
  }

  compareSelected() {
    NotificationCenterComponent.info('Функция сравнения туров в разработке');
  }

  async rerender() {
    const container = document.querySelector('.favorites-section, .favorites-empty');
    if (container) {
      container.outerHTML = await this.render();
      await this.afterRender();
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default FavoritesComponent;