import store from '../../store/store.js';
import TourService from '../../services/tour.service.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class TourComparisonComponent {
  constructor() {
    this.tourService = new TourService();
    this.comparisonItems = JSON.parse(localStorage.getItem('comparison_items')) || [];
    this.maxComparisonItems = 4;
  }

  render() {
    const tours = this.getToursForComparison();
    
    if (tours.length === 0) {
      return `
        <div class="comparison-empty">
          <div class="empty-icon">📊</div>
          <h3>Сравнение туров</h3>
          <p>Добавьте туры для сравнения, чтобы выбрать лучший вариант</p>
          <a href="#/tours" class="btn btn-primary">Выбрать туры</a>
        </div>
      `;
    }

    return `
      <div class="tour-comparison">
        <div class="comparison-header">
          <h2>📊 Сравнение туров</h2>
          <div class="comparison-actions">
            <span class="comparison-count">${tours.length} из ${this.maxComparisonItems}</span>
            ${tours.length > 1 ? `
              <button class="btn btn-text" id="clearComparison">Очистить всё</button>
              <button class="btn btn-primary" id="exportComparison">Экспорт</button>
            ` : ''}
          </div>
        </div>

        <div class="comparison-table-container">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="comparison-category">Категория</th>
                ${tours.map(tour => `
                  <th class="comparison-tour-header">
                    <button class="remove-from-comparison" data-tour-id="${tour.id}">
                      &times;
                    </button>
                    <img src="${tour.image}" alt="${tour.title}">
                    <h4>${tour.title}</h4>
                    <p class="tour-location">📍 ${tour.location}</p>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.renderComparisonRows(tours)}
            </tbody>
          </table>
        </div>

        ${tours.length >= 2 ? this.renderComparisonSummary(tours) : ''}
      </div>
    `;
  }

  renderComparisonRows(tours) {
    const rows = [
      {
        category: 'Цена',
        getValue: tour => `${tour.price.toLocaleString('ru-RU')} ₽`
      },
      {
        category: 'Рейтинг',
        getValue: tour => `
          <div class="rating-display">
            ${'★'.repeat(Math.floor(tour.rating))}${'☆'.repeat(5 - Math.floor(tour.rating))}
            <span class="rating-value">${tour.rating.toFixed(1)}</span>
          </div>
        `
      },
      {
        category: 'Длительность',
        getValue: tour => `${tour.duration} дней`
      },
      {
        category: 'Категория',
        getValue: tour => this.getCategoryName(tour.category)
      },
      {
        category: 'Что включено',
        getValue: tour => tour.includes?.join(', ') || 'Не указано'
      },
      {
        category: 'Популярность',
        getValue: tour => tour.isPopular ? '🔥 Популярный' : 'Обычный'
      },
      {
        category: 'Рекомендация',
        getValue: tour => {
          if (tour.rating >= 4.5) return '👍 Высоко рекомендуется';
          if (tour.rating >= 4.0) return '👌 Рекомендуется';
          return '🤔 На рассмотрении';
        }
      }
    ];

    return rows.map(row => `
      <tr>
        <td class="comparison-category">${row.category}</td>
        ${tours.map(tour => `
          <td class="comparison-value">${row.getValue(tour)}</td>
        `).join('')}
      </tr>
    `).join('');
  }

  renderComparisonSummary(tours) {
    // Находим лучшие значения
    const minPrice = Math.min(...tours.map(t => t.price));
    const maxRating = Math.max(...tours.map(t => t.rating));
    const bestDuration = tours.reduce((best, tour) => {
      if (!best) return tour;
      // Считаем оптимальность (цена/день)
      const bestValue = best.price / best.duration;
      const currentValue = tour.price / tour.duration;
      return currentValue < bestValue ? tour : best;
    });

    return `
      <div class="comparison-summary">
        <h3>📈 Итоги сравнения</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-icon">💰</div>
            <div>
              <h4>Лучшая цена</h4>
              <p>${minPrice.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">⭐</div>
            <div>
              <h4>Лучший рейтинг</h4>
              <p>${maxRating.toFixed(1)}/5</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">📅</div>
            <div>
              <h4>Оптимальная длительность</h4>
              <p>${bestDuration.duration} дней</p>
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-icon">🎯</div>
            <div>
              <h4>Рекомендуем</h4>
              <p>${bestDuration.title}</p>
            </div>
          </div>
        </div>
        <div class="summary-actions">
          <button class="btn btn-primary" id="bookBestTour">
            Забронировать рекомендуемый тур
          </button>
        </div>
      </div>
    `;
  }

  afterRender() {
    // Удаление тура из сравнения
    document.querySelectorAll('.remove-from-comparison').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tourId = parseInt(e.target.dataset.tourId);
        this.removeFromComparison(tourId);
      });
    });

    // Очистка всего сравнения
    document.getElementById('clearComparison')?.addEventListener('click', () => {
      if (confirm('Очистить все туры из сравнения?')) {
        this.clearComparison();
      }
    });

    // Экспорт сравнения
    document.getElementById('exportComparison')?.addEventListener('click', () => {
      this.exportComparison();
    });

    // Бронирование лучшего тура
    document.getElementById('bookBestTour')?.addEventListener('click', () => {
      this.bookBestTour();
    });

    // Добавление кнопок сравнения на карточки туров
    this.addComparisonButtons();
  }

  addComparisonButtons() {
    document.querySelectorAll('.tour-card').forEach(card => {
      const tourId = card.dataset.id;
      if (!tourId) return;
      
      const isInComparison = this.comparisonItems.includes(parseInt(tourId));
      
      const compareBtn = document.createElement('button');
      compareBtn.className = `compare-btn ${isInComparison ? 'active' : ''}`;
      compareBtn.dataset.tourId = tourId;
      compareBtn.innerHTML = isInComparison ? '📊 В сравнении' : '📊 Сравнить';
      compareBtn.title = 'Добавить к сравнению';
      
      compareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleComparison(parseInt(tourId));
      });
      
      card.querySelector('.tour-actions')?.appendChild(compareBtn);
    });
  }

  toggleComparison(tourId) {
    const index = this.comparisonItems.indexOf(tourId);
    
    if (index > -1) {
      // Удаляем из сравнения
      this.comparisonItems.splice(index, 1);
      NotificationCenterComponent.success('Тур удалён из сравнения');
    } else {
      // Добавляем в сравнение
      if (this.comparisonItems.length >= this.maxComparisonItems) {
        NotificationCenterComponent.warning(`Можно сравнивать не более ${this.maxComparisonItems} туров`);
        return;
      }
      this.comparisonItems.push(tourId);
      NotificationCenterComponent.success('Тур добавлен к сравнению');
    }
    
    this.saveComparison();
    this.rerender();
  }

  removeFromComparison(tourId) {
    this.toggleComparison(tourId);
  }

  clearComparison() {
    this.comparisonItems = [];
    this.saveComparison();
    NotificationCenterComponent.success('Все туры удалены из сравнения');
    this.rerender();
  }

  exportComparison() {
    const tours = this.getToursForComparison();
    const exportData = {
      date: new Date().toISOString(),
      tours: tours.map(tour => ({
        title: tour.title,
        location: tour.location,
        price: tour.price,
        rating: tour.rating,
        duration: tour.duration,
        category: tour.category
      })),
      summary: {
        bestPrice: Math.min(...tours.map(t => t.price)),
        bestRating: Math.max(...tours.map(t => t.rating))
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    NotificationCenterComponent.success('Сравнение экспортировано');
  }

  bookBestTour() {
    const tours = this.getToursForComparison();
    if (tours.length === 0) return;

    // Находим тур с лучшим соотношением цена/качество
    const bestTour = tours.reduce((best, tour) => {
      if (!best) return tour;
      const bestValue = (best.rating * 1000) / best.price;
      const currentValue = (tour.rating * 1000) / tour.price;
      return currentValue > bestValue ? tour : best;
    });

    window.location.hash = `#/tour/${bestTour.id}`;
    NotificationCenterComponent.info(`Переходим к лучшему туру: ${bestTour.title}`);
  }

  getToursForComparison() {
    const allTours = this.tourService.getAllTours();
    return allTours.filter(tour => this.comparisonItems.includes(tour.id));
  }

  getCategoryName(category) {
    const categories = {
      'beach': '🏖️ Пляжный',
      'city': '🏙️ Городской',
      'mountain': '⛰️ Горный',
      'cultural': '🏛️ Культурный'
    };
    return categories[category] || category;
  }

  saveComparison() {
    localStorage.setItem('comparison_items', JSON.stringify(this.comparisonItems));
  }

  rerender() {
    const container = document.querySelector('.tour-comparison, .comparison-empty');
    if (container) {
      container.outerHTML = this.render();
      this.afterRender();
    }
  }
}

export default TourComparisonComponent;