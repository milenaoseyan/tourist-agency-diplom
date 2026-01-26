class HeroComponent {
    render() {
        return `
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">Откройте мир с TravelWave</h1>
                    <p class="hero-subtitle">Лучшие направления по самым выгодным ценам. Мечты становятся реальностью.</p>
                    
                    <div class="search-box">
                        <div class="search-input">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchInput" placeholder="Куда хотите поехать? (например, Бали, Турция, Париж...)">
                        </div>
                        <button class="btn btn-accent" id="searchBtn">Найти тур</button>
                    </div>
                    
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-number" data-target="500">0</span>
                            <span class="stat-label">Направлений</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" data-target="10000">0</span>
                            <span class="stat-label">Клиентов</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">24/7</span>
                            <span class="stat-label">Поддержка</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
    }

    afterRender() {
        // Анимация чисел
        const counters = document.querySelectorAll('.stat-number[data-target]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            let current = 0;
            const increment = target / 50;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    setTimeout(updateCounter, 30);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });

        // Поиск
        document.getElementById('searchBtn').addEventListener('click', this.handleSearch);
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    handleSearch() {
        const input = document.getElementById('searchInput');
        if (input.value.trim()) {
            alert(`Ищем туры в: ${input.value}`);
        } else {
            alert('Введите направление для поиска');
        }
    }
}

export default HeroComponent;