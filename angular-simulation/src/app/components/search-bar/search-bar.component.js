import TourService from '../../services/tour.service.js';

class SearchBarComponent {
    constructor() {
        this.tourService = new TourService();
        this.searchResults = [];
        this.isSearchOpen = false;
        this.searchQuery = '';
    }

    render() {
        return `
        <div class="search-container">
            <div class="search-input-wrapper">
                <input type="text" 
                    class="search-input" 
                    placeholder="Поиск туров..."
                    value="${this.searchQuery}"
                    id="globalSearch">
                <button class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
                
                ${this.isSearchOpen && this.searchResults.length > 0 ? this.renderResults() : ''}
            </div>
        </div>
        `;
    }

    renderResults() {
        return `
        <div class="search-results">
            <div class="results-header">
                <h4>Найдено туров: ${this.searchResults.length}</h4>
                <a href="#/search?q=${encodeURIComponent(this.searchQuery)}" class="see-all">
                    Посмотреть все
                </a>
            </div>
            
            <div class="results-list">
                ${this.searchResults.slice(0, 5).map(tour => `
                    <a href="#/tour/${tour.id}" class="search-result-item">
                        <img src="${tour.image}" alt="${tour.title}">
                        <div class="result-info">
                            <h5>${tour.title}</h5>
                            <p>от ${tour.price.toLocaleString('ru-RU')} ₽</p>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
        `;
    }

    afterRender() {
        const searchInput = document.getElementById('globalSearch');
        const searchBtn = document.querySelector('.search-btn');

        // Фокус на поиск при открытии
        if (this.isSearchOpen) {
            searchInput.focus();
        }

        // Поиск при вводе
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim();
            
            if (this.searchQuery.length >= 2) {
                this.performSearch();
                this.isSearchOpen = true;
            } else {
                this.searchResults = [];
                this.isSearchOpen = false;
            }
            
            this.rerender();
        });

        // Кнопка поиска
        searchBtn.addEventListener('click', () => {
            if (this.searchQuery) {
                window.location.hash = `#/search?q=${encodeURIComponent(this.searchQuery)}`;
            } else {
                searchInput.focus();
            }
        });

        // Поиск по Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.searchQuery) {
                window.location.hash = `#/search?q=${encodeURIComponent(this.searchQuery)}`;
            }
        });

        // Закрытие результатов при клике вне
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (!searchContainer.contains(e.target)) {
                this.isSearchOpen = false;
                this.rerender();
            }
        });
    }

    performSearch() {
        this.searchResults = this.tourService.searchTours(this.searchQuery);
    }

    rerender() {
        const container = document.querySelector('.search-container');
        if (container) {
            container.innerHTML = this.render();
            this.afterRender();
        }
    }

    // Статический метод для открытия поиска
    static open() {
        const searchBar = new SearchBarComponent();
        searchBar.isSearchOpen = true;
        
        // Вставляем в хедер
        const headerActions = document.querySelector('.action-buttons');
        if (headerActions) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-bar-container';
            searchContainer.innerHTML = searchBar.render();
            headerActions.insertBefore(searchContainer, headerActions.firstChild);
            
            searchBar.afterRender();
        }
    }
}

export default SearchBarComponent;