import TourService from '../../services/tour.service.js';
import store from '../../store/store.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class AdvancedSearchComponent {
  constructor() {
    this.tourService = new TourService();
    this.filters = JSON.parse(localStorage.getItem('search_filters')) || this.getDefaultFilters();
    this.searchResults = [];
    this.isLoading = false;
    this.currentView = 'grid'; // grid или list
    this.sortOptions = [
      { value: 'relevance', label: 'По релевантности' },
      { value: 'price_asc', label: 'Сначала дешевле' },
      { value: 'price_desc', label: 'Сначала дороже' },
      { value: 'rating', label: 'По рейтингу' },
      { value: 'duration_asc', label: 'Короткие туры' },
      { value: 'duration_desc', label: 'Длинные туры' },
      { value: 'popular', label: 'Популярные' }
    ];
  }

  getDefaultFilters() {
    return {
      query: '',
      categories: [],
      priceRange: { min: 0, max: 200000 },
      durationRange: { min: 1, max: 30 },
      rating: 0,
      dateRange: { start: null, end: null },
      features: [],
      sortBy: 'relevance',
      page: 1,
      perPage: 12
    };
  }

  render() {
    return `
      <div class="advanced-search">
        <div class="search-header">
          <div class="search-input-container">
            <input type="text" 
                   class="search-input-large" 
                   id="searchQuery" 
                   placeholder="Куда хотите поехать?"
                   value="${this.filters.query}">
            <button class="search-btn-large" id="performSearch">
              🔍 Найти
            </button>
          </div>
          <div class="search-meta">
            <span class="results-count" id="resultsCount">0 туров</span>
            <div class="view-toggle">
              <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" data-view="grid">
                ▦ Сетка
              </button>
              <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
                ≡ Список
              </button>
            </div>
          </div>
        </div>

        <div class="search-layout">
          <aside class="search-filters-panel">
            <div class="filters-header">
              <h3>🔎 Фильтры</h3>
              <button class="btn btn-text" id="resetFilters">Сбросить</button>
            </div>

            <div class="filter-section">
              <h4>Категории</h4>
              ${this.renderCategoryFilters()}
            </div>

            <div class="filter-section">
              <h4>Цена, ₽</h4>
              ${this.renderPriceFilter()}
            </div>

            <div class="filter-section">
              <h4>Длительность, дней</h4>
              ${this.renderDurationFilter()}
            </div>

            <div class="filter-section">
              <h4>Рейтинг</h4>
              ${this.renderRatingFilter()}
            </div>

            <div class="filter-section">
              <h4>Даты</h4>
              ${this.renderDateFilter()}
            </div>

            <div class="filter-section">
              <h4>Особенности</h4>
              ${this.renderFeatureFilters()}
            </div>

            <div class="filter-section">
              <h4>Сортировка</h4>
              <select class="sort-select" id="sortSelect">
                ${this.sortOptions.map(option => `
                  <option value="${option.value}" ${this.filters.sortBy === option.value ? 'selected' : ''}>
                    ${option.label}
                  </option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-primary apply-filters" id="applyFilters">
              Применить фильтры
            </button>

            <div class="saved-searches">
              <h4>💾 Сохраненные поиски</h4>
              ${this.renderSavedSearches()}
            </div>
          </aside>

          <main class="search-results-container">
            ${this.isLoading ? this.renderLoader() : this.renderResults()}
            
            ${this.searchResults.length > 0 ? this.renderPagination() : ''}
            
            ${this.searchResults.length === 0 && !this.isLoading ? this.renderNoResults() : ''}
          </main>
        </div>
      </div>
    `;
  }

  renderCategoryFilters() {
    const categories = [
      { value: 'beach', label: '🏖️ Пляжный отдых', count: 15 },
      { value: 'city', label: '🏙️ Городской туризм', count: 12 },
      { value: 'mountain', label: '⛰️ Горный отдых', count: 8 },
      { value: 'cultural', label: '🏛️ Культурный туризм', count: 10 },
      { value: 'adventure', label: '🧗 Приключения', count: 6 },
      { value: 'wellness', label: '💆 Wellness', count: 5 }
    ];

    return categories.map(category => `
      <label class="checkbox-filter">
        <input type="checkbox" 
               value="${category.value}"
               ${this.filters.categories.includes(category.value) ? 'checked' : ''}
               class="category-checkbox">
        <span class="checkmark"></span>
        <span class="filter-label">${category.label}</span>
        <span class="filter-count">${category.count}</span>
      </label>
    `).join('');
  }

  renderPriceFilter() {
    return `
      <div class="range-filter">
        <div class="range-inputs">
          <input type="number" 
                 class="range-min" 
                 id="priceMin" 
                 value="${this.filters.priceRange.min}"
                 min="0" 
                 max="500000" 
                 step="1000">
          <span class="range-separator">—</span>
          <input type="number" 
                 class="range-max" 
                 id="priceMax" 
                 value="${this.filters.priceRange.max}"
                 min="0" 
                 max="500000" 
                 step="1000">
        </div>
        <div class="range-slider">
          <input type="range" 
                 class="range-slider-min" 
                 min="0" 
                 max="500000" 
                 step="1000" 
                 value="${this.filters.priceRange.min}">
          <input type="range" 
                 class="range-slider-max" 
                 min="0" 
                 max="500000" 
                 step="1000" 
                 value="${this.filters.priceRange.max}">
        </div>
        <div class="range-values">
          <span>${this.filters.priceRange.min.toLocaleString('ru-RU')} ₽</span>
          <span>${this.filters.priceRange.max.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    `;
  }

  renderDurationFilter() {
    return `
      <div class="range-filter">
        <div class="range-inputs">
          <input type="number" 
                 class="range-min" 
                 id="durationMin" 
                 value="${this.filters.durationRange.min}"
                 min="1" 
                 max="60" 
                 step="1">
          <span class="range-separator">—</span>
          <input type="number" 
                 class="range-max" 
                 id="durationMax" 
                 value="${this.filters.durationRange.max}"
                 min="1" 
                 max="60" 
                 step="1">
        </div>
        <div class="range-slider">
          <input type="range" 
                 class="range-slider-min" 
                 min="1" 
                 max="60" 
                 step="1" 
                 value="${this.filters.durationRange.min}">
          <input type="range" 
                 class="range-slider-max" 
                 min="1" 
                 max="60" 
                 step="1" 
                 value="${this.filters.durationRange.max}">
        </div>
        <div class="range-values">
          <span>${this.filters.durationRange.min} дн.</span>
          <span>${this.filters.durationRange.max} дн.</span>
        </div>
      </div>
    `;
  }

  renderRatingFilter() {
    return `
      <div class="rating-filter">
        ${[5, 4, 3, 2, 1].map(rating => `
          <label class="rating-option">
            <input type="radio" 
                   name="rating" 
                   value="${rating}"
                   ${this.filters.rating === rating ? 'checked' : ''}>
            <span class="stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
            <span class="rating-label">${rating}+</span>
          </label>
        `).join('')}
        <label class="rating-option">
          <input type="radio" name="rating" value="0" ${this.filters.rating === 0 ? 'checked' : ''}>
          <span class="rating-label">Любой рейтинг</span>
        </label>
      </div>
    `;
  }

  renderDateFilter() {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    return `
      <div class="date-filter">
        <div class="date-input">
          <label>С:</label>
          <input type="date" 
                 id="dateStart" 
                 value="${this.filters.dateRange.start || ''}"
                 min="${today}">
        </div>
        <div class="date-input">
          <label>По:</label>
          <input type="date" 
                 id="dateEnd" 
                 value="${this.filters.dateRange.end || ''}"
                 min="${today}">
        </div>
        <div class="date-presets">
          <button class="btn btn-small date-preset" data-preset="weekend">Выходные</button>
          <button class="btn btn-small date-preset" data-preset="nextMonth">Следующий месяц</button>
          <button class="btn btn-small date-preset" data-preset="clear">Очистить</button>
        </div>
      </div>
    `;
  }

  renderFeatureFilters() {
    const features = [
      { value: 'all_inclusive', label: '🍽️ All Inclusive' },
      { value: 'breakfast', label: '🥐 Завтраки' },
      { value: 'flight', label: '✈️ Перелет' },
      { value: 'hotel', label: '🏨 Отель' },
      { value: 'transfer', label: '🚗 Трансфер' },
      { value: 'insurance', label: '🛡️ Страховка' },
      { value: 'guide', label: '🗣️ Гид' },
      { value: 'family', label: '👨‍👩‍👧‍👦 Для семьи' },
      { value: 'romantic', label: '💖 Для пар' },
      { value: 'active', label: '🚴 Активный отдых' }
    ];

    return `
      <div class="features-grid">
        ${features.map(feature => `
          <label class="feature-checkbox">
            <input type="checkbox" 
                   value="${feature.value}"
                   ${this.filters.features.includes(feature.value) ? 'checked' : ''}>
            <span class="feature-label">${feature.label}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  renderSavedSearches() {
    const savedSearches = JSON.parse(localStorage.getItem('saved_searches')) || [];
    
    if (savedSearches.length === 0) {
      return '<p class="no-saved">Нет сохраненных поисков</p>';
    }

    return `
      <div class="saved-searches-list">
        ${savedSearches.slice(0, 5).map((search, index) => `
          <div class="saved-search-item">
            <div class="saved-search-info">
              <div class="saved-search-name">Поиск #${index + 1}</div>
              <div class="saved-search-query">${search.query || 'Без названия'}</div>
            </div>
            <div class="saved-search-actions">
              <button class="btn-icon load-search" data-index="${index}" title="Загрузить">
                📂
              </button>
              <button class="btn-icon delete-search" data-index="${index}" title="Удалить">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-text" id="saveCurrentSearch">💾 Сохранить текущий поиск</button>
    `;
  }

  renderLoader() {
    return `
      <div class="search-loader">
        <div class="loader-spinner"></div>
        <p>Ищем лучшие туры для вас...</p>
      </div>
    `;
  }

  renderResults() {
    if (this.searchResults.length === 0) {
      return '';
    }

    if (this.currentView === 'grid') {
      return this.renderGridResults();
    } else {
      return this.renderListResults();
    }
  }

  renderGridResults() {
    return `
      <div class="search-results-grid">
        ${this.searchResults.map(tour => `
          <div class="search-result-card" data-tour-id="${tour.id}">
            <div class="result-image">
              <img src="${tour.image}" alt="${tour.title}" loading="lazy">
              ${tour.isPopular ? '<span class="popular-badge">🔥 Популярный</span>' : ''}
              ${tour.discount ? `<span class="discount-badge">-${tour.discount}%</span>` : ''}
            </div>
            <div class="result-content">
              <h3 class="result-title">${tour.title}</h3>
              <p class="result-location">📍 ${tour.location}</p>
              <p class="result-description">${tour.description.substring(0, 100)}...</p>
              
              <div class="result-meta">
                <span class="meta-item">
                  ⭐ ${tour.rating}
                </span>
                <span class="meta-item">
                  📅 ${tour.duration} дн.
                </span>
                <span class="meta-item">
                  🏷️ ${this.getCategoryName(tour.category)}
                </span>
              </div>
              
              <div class="result-footer">
                <div class="result-price">
                  <span class="price-old">${tour.oldPrice ? tour.oldPrice.toLocaleString('ru-RU') + ' ₽' : ''}</span>
                  <span class="price-current">${tour.price.toLocaleString('ru-RU')} ₽</span>
                </div>
                <button class="btn btn-primary book-tour" data-tour-id="${tour.id}">
                  Забронировать
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderListResults() {
    return `
      <div class="search-results-list">
        ${this.searchResults.map(tour => `
          <div class="search-result-row" data-tour-id="${tour.id}">
            <div class="row-image">
              <img src="${tour.image}" alt="${tour.title}" loading="lazy">
            </div>
            <div class="row-content">
              <div class="row-header">
                <h3 class="row-title">${tour.title}</h3>
                <span class="row-rating">⭐ ${tour.rating}</span>
              </div>
              <p class="row-location">📍 ${tour.location}</p>
              <p class="row-description">${tour.description}</p>
              
              <div class="row-features">
                ${tour.includes?.map(include => `
                  <span class="feature-tag">${include}</span>
                `).join('')}
              </div>
              
              <div class="row-footer">
                <div class="row-meta">
                  <span class="meta-item">📅 ${tour.duration} дней</span>
                  <span class="meta-item">${this.getCategoryName(tour.category)}</span>
                  ${tour.isPopular ? '<span class="meta-item popular">🔥 Популярный</span>' : ''}
                </div>
                <div class="row-actions">
                  <div class="row-price">
                    <span class="price-old">${tour.oldPrice ? tour.oldPrice.toLocaleString('ru-RU') + ' ₽' : ''}</span>
                    <span class="price-current">${tour.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <button class="btn btn-primary book-tour" data-tour-id="${tour.id}">
                    Забронировать
                  </button>
                  <button class="btn btn-text compare-tour" data-tour-id="${tour.id}">
                    📊 Сравнить
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.searchResults.length / this.filters.perPage);
    if (totalPages <= 1) return '';

    return `
      <div class="search-pagination">
        <button class="pagination-btn ${this.filters.page === 1 ? 'disabled' : ''}" 
                id="prevPage" ${this.filters.page === 1 ? 'disabled' : ''}>
          ← Назад
        </button>
        
        <div class="pagination-pages">
          ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (this.filters.page <= 3) {
              pageNum = i + 1;
            } else if (this.filters.page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = this.filters.page - 2 + i;
            }
            
            return `
              <button class="pagination-page ${this.filters.page === pageNum ? 'active' : ''}" 
                      data-page="${pageNum}">
                ${pageNum}
              </button>
            `;
          }).join('')}
          
          ${totalPages > 5 ? `
            <span class="pagination-dots">...</span>
            <button class="pagination-page" data-page="${totalPages}">
              ${totalPages}
            </button>
          ` : ''}
        </div>
        
        <button class="pagination-btn ${this.filters.page === totalPages ? 'disabled' : ''}" 
                id="nextPage" ${this.filters.page === totalPages ? 'disabled' : ''}>
          Вперед →
        </button>
        
        <div class="pagination-per-page">
          <label>На странице:</label>
          <select id="perPageSelect">
            <option value="12" ${this.filters.perPage === 12 ? 'selected' : ''}>12</option>
            <option value="24" ${this.filters.perPage === 24 ? 'selected' : ''}>24</option>
            <option value="48" ${this.filters.perPage === 48 ? 'selected' : ''}>48</option>
          </select>
        </div>
      </div>
    `;
  }

  renderNoResults() {
    return `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>Туры не найдены</h3>
        <p>Попробуйте изменить критерии поиска:</p>
        <ul class="suggestions">
          <li>Упростите поисковый запрос</li>
          <li>Расширьте диапазон цены</li>
          <li>Выберите другую категорию</li>
          <li>Измените даты поездки</li>
        </ul>
        <button class="btn btn-primary" id="showAllTours">Показать все туры</button>
      </div>
    `;
  }

  afterRender() {
    // Поиск по вводу
    const searchInput = document.getElementById('searchQuery');
    const searchBtn = document.getElementById('performSearch');
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });
    
    searchBtn.addEventListener('click', () => {
      this.performSearch();
    });

    // Фильтры
    document.getElementById('applyFilters')?.addEventListener('click', () => {
      this.updateFiltersFromUI();
      this.performSearch();
    });

    document.getElementById('resetFilters')?.addEventListener('click', () => {
      this.resetFilters();
    });

    // Сортировка
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
      this.filters.sortBy = e.target.value;
      this.performSearch();
    });

    // Переключение вида
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentView = e.target.dataset.view;
        this.rerender();
      });
    });

    // Пагинация
    document.getElementById('prevPage')?.addEventListener('click', () => {
      if (this.filters.page > 1) {
        this.filters.page--;
        this.performSearch();
      }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
      const totalPages = Math.ceil(this.searchResults.length / this.filters.perPage);
      if (this.filters.page < totalPages) {
        this.filters.page++;
        this.performSearch();
      }
    });

    document.querySelectorAll('.pagination-page').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filters.page = parseInt(e.target.dataset.page);
        this.performSearch();
      });
    });

    document.getElementById('perPageSelect')?.addEventListener('change', (e) => {
      this.filters.perPage = parseInt(e.target.value);
      this.filters.page = 1;
      this.performSearch();
    });

    // Сохранение поисков
    document.getElementById('saveCurrentSearch')?.addEventListener('click', () => {
      this.saveCurrentSearch();
    });

    document.querySelectorAll('.load-search').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('button').dataset.index);
        this.loadSavedSearch(index);
      });
    });

    document.querySelectorAll('.delete-search').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('button').dataset.index);
        this.deleteSavedSearch(index);
      });
    });

    // Быстрые действия с турами
    document.querySelectorAll('.book-tour').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tourId = parseInt(e.target.dataset.tourId);
        this.bookTour(tourId);
      });
    });

    document.querySelectorAll('.compare-tour').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tourId = parseInt(e.target.dataset.tourId);
        this.addToComparison(tourId);
      });
    });

    // Показать все туры
    document.getElementById('showAllTours')?.addEventListener('click', () => {
      this.resetFilters();
      this.performSearch();
    });

    // Сохранение фильтров при изменении
    this.setupFilterListeners();

    // Выполняем начальный поиск
    if (!this.filters.query && this.searchResults.length === 0) {
      this.performSearch();
    }
  }

  setupFilterListeners() {
    // Категории
    document.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateFiltersFromUI();
      });
    });

    // Цена
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceSliderMin = document.querySelector('.range-slider-min');
    const priceSliderMax = document.querySelector('.range-slider-max');

    if (priceMin && priceMax && priceSliderMin && priceSliderMax) {
      [priceMin, priceMax, priceSliderMin, priceSliderMax].forEach(input => {
        input.addEventListener('input', () => {
          this.syncPriceInputs();
        });
      });
    }

    // Длительность
    const durationMin = document.getElementById('durationMin');
    const durationMax = document.getElementById('durationMax');
    const durationSliderMin = document.querySelectorAll('.range-slider-min')[1];
    const durationSliderMax = document.querySelectorAll('.range-slider-max')[1];

    if (durationMin && durationMax && durationSliderMin && durationSliderMax) {
      [durationMin, durationMax, durationSliderMin, durationSliderMax].forEach(input => {
        input.addEventListener('input', () => {
          this.syncDurationInputs();
        });
      });
    }

    // Рейтинг
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.filters.rating = parseInt(radio.value) || 0;
      });
    });

    // Даты
    document.querySelectorAll('.date-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.applyDatePreset(e.target.dataset.preset);
      });
    });

    // Особенности
    document.querySelectorAll('.feature-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateFiltersFromUI();
      });
    });
  }

  async performSearch() {
    this.isLoading = true;
    this.rerender();

    try {
      // Имитация задержки поиска
      await new Promise(resolve => setTimeout(resolve, 500));

      // Получаем все туры
      let results = this.tourService.getAllTours();

      // Применяем фильтры
      results = this.applyFilters(results);

      // Применяем сортировку
      results = this.applySorting(results);

      // Пагинация
      const startIndex = (this.filters.page - 1) * this.filters.perPage;
      const endIndex = startIndex + this.filters.perPage;
      this.searchResults = results.slice(startIndex, endIndex);

      // Сохраняем фильтры
      this.saveFilters();

      // Обновляем счетчик результатов
      this.updateResultsCount(results.length);

      // Трекинг поиска
      this.trackSearch();

    } catch (error) {
      console.error('Search error:', error);
      NotificationCenterComponent.error('Ошибка при поиске туров');
    } finally {
      this.isLoading = false;
      this.rerender();
    }
  }

  applyFilters(tours) {
    let filtered = [...tours];

    // Поиск по тексту
    if (this.filters.query) {
      const query = this.filters.query.toLowerCase();
      filtered = filtered.filter(tour =>
        tour.title.toLowerCase().includes(query) ||
        tour.location.toLowerCase().includes(query) ||
        tour.description.toLowerCase().includes(query)
      );
    }

    // Категории
    if (this.filters.categories.length > 0) {
      filtered = filtered.filter(tour =>
        this.filters.categories.includes(tour.category)
      );
    }

    // Цена
    filtered = filtered.filter(tour =>
      tour.price >= this.filters.priceRange.min &&
      tour.price <= this.filters.priceRange.max
    );

    // Длительность
    filtered = filtered.filter(tour =>
      tour.duration >= this.filters.durationRange.min &&
      tour.duration <= this.filters.durationRange.max
    );

    // Рейтинг
    if (this.filters.rating > 0) {
      filtered = filtered.filter(tour =>
        tour.rating >= this.filters.rating
      );
    }

    // Особенности
    if (this.filters.features.length > 0) {
      filtered = filtered.filter(tour => {
        return this.filters.features.every(feature =>
          tour.includes?.includes(feature) || false
        );
      });
    }

    return filtered;
  }

  applySorting(tours) {
    switch (this.filters.sortBy) {
      case 'price_asc':
        return [...tours].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...tours].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...tours].sort((a, b) => b.rating - a.rating);
      case 'duration_asc':
        return [...tours].sort((a, b) => a.duration - b.duration);
      case 'duration_desc':
        return [...tours].sort((a, b) => b.duration - a.duration);
      case 'popular':
        return [...tours].sort((a, b) => (b.views || 0) - (a.views || 0));
      default: // relevance
        return tours;
    }
  }

  updateFiltersFromUI() {
    // Категории
    this.filters.categories = Array.from(
      document.querySelectorAll('.category-checkbox:checked')
    ).map(cb => cb.value);

    // Цена
    const priceMin = parseInt(document.getElementById('priceMin')?.value) || 0;
    const priceMax = parseInt(document.getElementById('priceMax')?.value) || 200000;
    this.filters.priceRange = { min: priceMin, max: priceMax };

    // Длительность
    const durationMin = parseInt(document.getElementById('durationMin')?.value) || 1;
    const durationMax = parseInt(document.getElementById('durationMax')?.value) || 30;
    this.filters.durationRange = { min: durationMin, max: durationMax };

    // Особенности
    this.filters.features = Array.from(
      document.querySelectorAll('.feature-checkbox input:checked')
    ).map(cb => cb.value);

    // Запрос
    this.filters.query = document.getElementById('searchQuery')?.value || '';
  }

  syncPriceInputs() {
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const priceSliderMin = document.querySelector('.range-slider-min');
    const priceSliderMax = document.querySelector('.range-slider-max');

    if (!priceMin || !priceMax || !priceSliderMin || !priceSliderMax) return;

    // Синхронизация слайдеров и инпутов
    priceSliderMin.value = priceMin.value;
    priceSliderMax.value = priceMax.value;

    // Обеспечиваем min < max
    if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
      priceMin.value = priceMax.value;
      priceSliderMin.value = priceMax.value;
    }
  }

  syncDurationInputs() {
    const durationMin = document.getElementById('durationMin');
    const durationMax = document.getElementById('durationMax');
    const durationSliderMin = document.querySelectorAll('.range-slider-min')[1];
    const durationSliderMax = document.querySelectorAll('.range-slider-max')[1];

    if (!durationMin || !durationMax || !durationSliderMin || !durationSliderMax) return;

    durationSliderMin.value = durationMin.value;
    durationSliderMax.value = durationMax.value;

    if (parseInt(durationMin.value) > parseInt(durationMax.value)) {
      durationMin.value = durationMax.value;
      durationSliderMin.value = durationMax.value;
    }
  }

  applyDatePreset(preset) {
    const today = new Date();
    const dateStart = document.getElementById('dateStart');
    const dateEnd = document.getElementById('dateEnd');

    switch (preset) {
      case 'weekend':
        // Следующие выходные
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
        const nextSunday = new Date(nextFriday);
        nextSunday.setDate(nextFriday.getDate() + 2);
        
        dateStart.value = nextFriday.toISOString().split('T')[0];
        dateEnd.value = nextSunday.toISOString().split('T')[0];
        break;

      case 'nextMonth':
        // Следующий месяц
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        dateStart.value = nextMonthStart.toISOString().split('T')[0];
        dateEnd.value = nextMonthEnd.toISOString().split('T')[0];
        break;

      case 'clear':
        dateStart.value = '';
        dateEnd.value = '';
        break;
    }

    this.filters.dateRange = {
      start: dateStart.value || null,
      end: dateEnd.value || null
    };
  }

  saveCurrentSearch() {
    const savedSearches = JSON.parse(localStorage.getItem('saved_searches')) || [];
    
    const searchToSave = {
      ...this.filters,
      savedAt: new Date().toISOString(),
      resultsCount: this.searchResults.length,
      name: `Поиск от ${new Date().toLocaleDateString('ru-RU')}`
    };

    savedSearches.unshift(searchToSave);
    
    // Ограничиваем количество сохраненных поисков
    if (savedSearches.length > 10) {
      savedSearches.pop();
    }

    localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
    NotificationCenterComponent.success('Поиск сохранен');

    this.rerender();
  }

  loadSavedSearch(index) {
    const savedSearches = JSON.parse(localStorage.getItem('saved_searches')) || [];
    if (savedSearches[index]) {
      this.filters = { ...this.getDefaultFilters(), ...savedSearches[index] };
      this.filters.page = 1; // Сбрасываем на первую страницу
      this.rerender();
      this.performSearch();
      NotificationCenterComponent.success('Поиск загружен');
    }
  }

  deleteSavedSearch(index) {
    const savedSearches = JSON.parse(localStorage.getItem('saved_searches')) || [];
    if (savedSearches[index]) {
      savedSearches.splice(index, 1);
      localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
      this.rerender();
      NotificationCenterComponent.success('Поиск удален');
    }
  }

  bookTour(tourId) {
    const tour = this.tourService.getTourById(tourId);
    if (tour) {
      window.location.hash = `#/tour/${tourId}`;
      NotificationCenterComponent.info(`Переходим к бронированию: ${tour.title}`);
    }
  }

  addToComparison(tourId) {
    const comparisonItems = JSON.parse(localStorage.getItem('comparison_items')) || [];
    if (!comparisonItems.includes(tourId)) {
      if (comparisonItems.length >= 4) {
        NotificationCenterComponent.warning('Можно сравнивать не более 4 туров');
        return;
      }
      comparisonItems.push(tourId);
      localStorage.setItem('comparison_items', JSON.stringify(comparisonItems));
      NotificationCenterComponent.success('Тур добавлен к сравнению');
    } else {
      NotificationCenterComponent.info('Тур уже в сравнении');
    }
  }

  resetFilters() {
    this.filters = this.getDefaultFilters();
    this.filters.query = document.getElementById('searchQuery')?.value || '';
    this.rerender();
    this.performSearch();
    NotificationCenterComponent.success('Фильтры сброшены');
  }

  saveFilters() {
    localStorage.setItem('search_filters', JSON.stringify(this.filters));
  }

  updateResultsCount(count) {
    const counter = document.getElementById('resultsCount');
    if (counter) {
      counter.textContent = `${count.toLocaleString('ru-RU')} ${this.getPluralForm(count, ['тур', 'тура', 'туров'])}`;
    }
  }

  getPluralForm(number, forms) {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  getCategoryName(category) {
    const categories = {
      'beach': '🏖️ Пляжный',
      'city': '🏙️ Городской',
      'mountain': '⛰️ Горный',
      'cultural': '🏛️ Культурный',
      'adventure': '🧗 Приключения',
      'wellness': '💆 Wellness'
    };
    return categories[category] || category;
  }

  trackSearch() {
    // Трекинг для аналитики
    const searchData = {
      query: this.filters.query,
      filters: this.filters,
      resultsCount: this.searchResults.length,
      timestamp: new Date().toISOString()
    };

    // Сохраняем в историю поисков
    const searchHistory = JSON.parse(localStorage.getItem('search_history')) || [];
    searchHistory.unshift(searchData);
    
    if (searchHistory.length > 50) {
      searchHistory.pop();
    }
    
    localStorage.setItem('search_history', JSON.stringify(searchHistory));

    // Отправляем в аналитику (если есть)
    if (window.analyticsService) {
      window.analyticsService.track('search', searchData);
    }
  }

  getSearchHistory() {
    return JSON.parse(localStorage.getItem('search_history')) || [];
  }

  clearSearchHistory() {
    localStorage.removeItem('search_history');
    NotificationCenterComponent.success('История поиска очищена');
  }

  rerender() {
    const container = document.querySelector('.advanced-search');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
    }
  }

  // Статический метод для быстрого использования
  static create(containerSelector, initialQuery = '') {
    const search = new AdvancedSearchComponent();
    if (initialQuery) {
      search.filters.query = initialQuery;
    }
    
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = search.render();
      search.afterRender();
    }
    
    return search;
  }
}

export default AdvancedSearchComponent;