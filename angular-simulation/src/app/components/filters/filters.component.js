class FiltersComponent {
    constructor(onFilterChange) {
        this.onFilterChange = onFilterChange;
        this.selectedCategory = 'all';
        this.priceRange = { min: 0, max: 200000 };
        this.sortBy = 'popular';
    }

    render() {
        return `
        <div class="filters-panel">
            <div class="filter-section">
                <h3>Фильтры</h3>
                
                <div class="filter-group">
                    <h4>Категория</h4>
                    <div class="category-filters">
                        <button class="category-btn ${this.selectedCategory === 'all' ? 'active' : ''}" 
                                data-category="all">
                            Все туры
                        </button>
                        <button class="category-btn ${this.selectedCategory === 'beach' ? 'active' : ''}" 
                                data-category="beach">
                            🏖️ Пляжный отдых
                        </button>
                        <button class="category-btn ${this.selectedCategory === 'city' ? 'active' : ''}" 
                                data-category="city">
                            🏙️ Городской туризм
                        </button>
                        <button class="category-btn ${this.selectedCategory === 'mountain' ? 'active' : ''}" 
                                data-category="mountain">
                            ⛰️ Горный отдых
                        </button>
                        <button class="category-btn ${this.selectedCategory === 'cultural' ? 'active' : ''}" 
                                data-category="cultural">
                            🏯 Культурный туризм
                        </button>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h4>Цена</h4>
                    <div class="price-filter">
                        <div class="price-inputs">
                            <input type="number" id="minPrice" value="${this.priceRange.min}" 
                                   min="0" max="200000" placeholder="Мин">
                            <span>-</span>
                            <input type="number" id="maxPrice" value="${this.priceRange.max}" 
                                   min="0" max="200000" placeholder="Макс">
                        </div>
                        <div class="price-slider">
                            <input type="range" id="priceSlider" min="0" max="200000" 
                                   value="${this.priceRange.max}" class="slider">
                        </div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h4>Сортировка</h4>
                    <select id="sortSelect" class="sort-select">
                        <option value="popular" ${this.sortBy === 'popular' ? 'selected' : ''}>
                            По популярности
                        </option>
                        <option value="price_asc" ${this.sortBy === 'price_asc' ? 'selected' : ''}>
                            По цене (возрастание)
                        </option>
                        <option value="price_desc" ${this.sortBy === 'price_desc' ? 'selected' : ''}>
                            По цене (убывание)
                        </option>
                        <option value="duration" ${this.sortBy === 'duration' ? 'selected' : ''}>
                            По продолжительности
                        </option>
                    </select>
                </div>
                
                <button id="applyFilters" class="btn btn-primary">Применить фильтры</button>
                <button id="resetFilters" class="btn btn-secondary">Сбросить</button>
            </div>
        </div>
        `;
    }

    afterRender() {
        // Обработчики категорий
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedCategory = e.target.dataset.category;
            });
        });

        // Слайдер цены
        const priceSlider = document.getElementById('priceSlider');
        const maxPriceInput = document.getElementById('maxPrice');
        
        priceSlider.addEventListener('input', (e) => {
            this.priceRange.max = parseInt(e.target.value);
            maxPriceInput.value = this.priceRange.max;
        });

        maxPriceInput.addEventListener('change', (e) => {
            this.priceRange.max = parseInt(e.target.value) || 200000;
            priceSlider.value = this.priceRange.max;
        });

        // Сортировка
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
        });

        // Применить фильтры
        document.getElementById('applyFilters').addEventListener('click', () => {
            const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
            const maxPrice = parseInt(document.getElementById('maxPrice').value) || 200000;
            
            this.priceRange = { min: minPrice, max: maxPrice };
            
            if (this.onFilterChange) {
                this.onFilterChange({
                    category: this.selectedCategory === 'all' ? null : this.selectedCategory,
                    priceRange: this.priceRange,
                    sortBy: this.sortBy
                });
            }
        });

        // Сбросить фильтры
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.selectedCategory = 'all';
            this.priceRange = { min: 0, max: 200000 };
            this.sortBy = 'popular';
            
            // Сброс UI
            document.querySelectorAll('.category-btn').forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 0) btn.classList.add('active');
            });
            
            document.getElementById('minPrice').value = 0;
            document.getElementById('maxPrice').value = 200000;
            priceSlider.value = 200000;
            document.getElementById('sortSelect').value = 'popular';
            
            if (this.onFilterChange) {
                this.onFilterChange({
                    category: null,
                    priceRange: this.priceRange,
                    sortBy: this.sortBy
                });
            }
        });
    }

    getFilters() {
        return {
            category: this.selectedCategory === 'all' ? null : this.selectedCategory,
            priceRange: this.priceRange,
            sortBy: this.sortBy
        };
    }
}

export default FiltersComponent;