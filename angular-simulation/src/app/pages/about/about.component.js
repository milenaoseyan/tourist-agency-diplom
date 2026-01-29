class AboutComponent {
    render() {
        return `
        <div class="about-page">
            <div class="about-hero">
                <div class="container">
                    <h1>О компании TravelWave</h1>
                    <p>Ваш надежный партнер в мире путешествий с 2010 года</p>
                </div>
            </div>
            
            <div class="container">
                <section class="about-story">
                    <div class="story-content">
                        <h2>Наша история</h2>
                        <p>TravelWave была основана в 2010 году группой энтузиастов, которые верили, что путешествия должны быть доступными, безопасными и незабываемыми для каждого.</p>
                        <p>За более чем 13 лет работы мы помогли осуществить мечты о путешествиях для более чем 10,000 клиентов, организовали свыше 5,000 туров в 50 стран мира.</p>
                    </div>
                    <div class="story-image">
                        <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" 
                            alt="Наша команда">
                    </div>
                </section>
                
                <section class="about-values">
                    <h2>Наши ценности</h2>
                    <div class="values-grid">
                        <div class="value-card">
                            <div class="value-icon">🤝</div>
                            <h3>Доверие</h3>
                            <p>Честность и прозрачность в каждом взаимодействии с клиентами</p>
                        </div>
                        <div class="value-card">
                            <div class="value-icon">✨</div>
                            <h3>Качество</h3>
                            <p>Только проверенные отели, авиакомпании и партнеры</p>
                        </div>
                        <div class="value-card">
                            <div class="value-icon">❤️</div>
                            <h3>Забота</h3>
                            <p>Индивидуальный подход к каждому клиенту</p>
                        </div>
                        <div class="value-card">
                            <div class="value-icon">🌍</div>
                            <h3>Ответственность</h3>
                            <p>Поддерживаем экологический и социальный туризм</p>
                        </div>
                    </div>
                </section>
                
                <section class="about-team">
                    <h2>Наша команда</h2>
                    <div class="team-grid">
                        <div class="team-member">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Александр Петров">
                            <h3>Александр Петров</h3>
                            <p>Основатель и CEO</p>
                        </div>
                        <div class="team-member">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Елена Смирнова">
                            <h3>Елена Смирнова</h3>
                            <p>Директор по туризму</p>
                        </div>
                        <div class="team-member">
                            <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="Дмитрий Иванов">
                            <h3>Дмитрий Иванов</h3>
                            <p>Менеджер по работе с клиентами</p>
                        </div>
                        <div class="team-member">
                            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Ольга Кузнецова">
                            <h3>Ольга Кузнецова</h3>
                            <p>Специалист по бронированиям</p>
                        </div>
                    </div>
                </section>
                
                <section class="about-stats">
                    <h2>TravelWave в цифрах</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">13+</div>
                            <p>Лет на рынке</p>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">50+</div>
                            <p>Стран</p>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">10K+</div>
                            <p>Довольных клиентов</p>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">24/7</div>
                            <p>Поддержка</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        `;
    }

    afterRender() {
        // Анимация чисел в статистике
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = this.parseNumber(stat.textContent);
            let current = 0;
            const increment = target / 50;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    stat.textContent = this.formatNumber(Math.floor(current), stat.textContent);
                    setTimeout(updateCounter, 30);
                } else {
                    stat.textContent = this.formatNumber(target, stat.textContent);
                }
            };
            
            updateCounter();
        });
    }

    parseNumber(text) {
        if (text.includes('+')) return parseInt(text) + 1;
        if (text.includes('K')) return parseFloat(text) * 1000;
        return parseInt(text);
    }

    formatNumber(number, original) {
        if (original.includes('+')) return number + '+';
        if (original.includes('K')) return (number / 1000).toFixed(0) + 'K+';
        if (original === '24/7') return '24/7';
        return number.toLocaleString('ru-RU');
    }
}

export default AboutComponent;