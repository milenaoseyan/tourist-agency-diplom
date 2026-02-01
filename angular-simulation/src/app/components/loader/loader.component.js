class LoaderComponent {
    constructor(type = 'default', text = 'Загрузка...') {
        this.type = type;
        this.text = text;
    }

    render() {
        switch (this.type) {
            case 'spinner':
                return this.renderSpinner();
            case 'dots':
                return this.renderDots();
            case 'skeleton':
                return this.renderSkeleton();
            case 'fullscreen':
                return this.renderFullscreen();
            default:
                return this.renderDefault();
        }
    }

    renderDefault() {
        return `
        <div class="loader">
            <div class="spinner"></div>
            ${this.text ? `<p>${this.text}</p>` : ''}
        </div>
        `;
    }

    renderSpinner() {
        return `
        <div class="loader spinner-loader">
            <div class="spinner-circle"></div>
            ${this.text ? `<p>${this.text}</p>` : ''}
        </div>
        `;
    }

    renderDots() {
        return `
        <div class="loader dots-loader">
            <div class="dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            ${this.text ? `<p>${this.text}</p>` : ''}
        </div>
        `;
    }

    renderSkeleton() {
        return `
        <div class="skeleton-loader">
            <div class="skeleton-header"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-image"></div>
        </div>
        `;
    }

    renderFullscreen() {
        return `
        <div class="fullscreen-loader">
            <div class="loader-content">
                <div class="plane-icon">✈️</div>
                <div class="spinner"></div>
                <h3>TravelWave</h3>
                <p>${this.text}</p>
            </div>
        </div>
        `;
    }
}

export default LoaderComponent;