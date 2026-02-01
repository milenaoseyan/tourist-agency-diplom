class ScrollToTopComponent {
    constructor() {
        this.isVisible = false;
        this.scrollThreshold = 300;
    }

    render() {
        return `
        <button class="scroll-to-top ${this.isVisible ? 'visible' : ''}" 
                id="scrollToTop"
                aria-label="Наверх">
            ↑
        </button>
        `;
    }

    afterRender() {
        const button = document.getElementById('scrollToTop');
        
        // Прокрутка к началу
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Отслеживание скролла
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Инициализация
        this.handleScroll();
    }

    handleScroll() {
        this.isVisible = window.scrollY > this.scrollThreshold;
        this.rerender();
    }

    rerender() {
        const button = document.querySelector('.scroll-to-top');
        if (button) {
            button.className = `scroll-to-top ${this.isVisible ? 'visible' : ''}`;
        }
    }
}

export default ScrollToTopComponent;