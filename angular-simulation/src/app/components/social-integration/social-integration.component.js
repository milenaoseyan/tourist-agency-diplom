import Config from '../../config/config.js';

class SocialIntegrationComponent {
    constructor() {
        this.config = Config;
    }

    render() {
        return `
        <div class="social-integration">
            <div class="social-share">
                <h4>Поделиться:</h4>
                <div class="share-buttons">
                    <button class="share-btn vk" data-network="vk">
                        <i class="fab fa-vk"></i>
                    </button>
                    <button class="share-btn telegram" data-network="telegram">
                        <i class="fab fa-telegram"></i>
                    </button>
                    <button class="share-btn whatsapp" data-network="whatsapp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-btn facebook" data-network="facebook">
                        <i class="fab fa-facebook"></i>
                    </button>
                    <button class="share-btn twitter" data-network="twitter">
                        <i class="fab fa-twitter"></i>
                    </button>
                </div>
            </div>
            
            <div class="social-follow">
                <h4>Мы в соцсетях:</h4>
                <div class="follow-buttons">
                    <a href="${this.config.social.vk}" target="_blank" class="follow-btn vk">
                        <i class="fab fa-vk"></i> ВКонтакте
                    </a>
                    <a href="${this.config.social.telegram}" target="_blank" class="follow-btn telegram">
                        <i class="fab fa-telegram"></i> Telegram
                    </a>
                    <a href="${this.config.social.instagram}" target="_blank" class="follow-btn instagram">
                        <i class="fab fa-instagram"></i> Instagram
                    </a>
                    <a href="${this.config.social.facebook}" target="_blank" class="follow-btn facebook">
                        <i class="fab fa-facebook"></i> Facebook
                    </a>
                </div>
            </div>
            
            <div class="social-reviews">
                <h4>Отзывы в соцсетях:</h4>
                <div class="review-links">
                    <a href="${this.config.social.vk}/reviews" target="_blank" class="review-link">
                        📝 Отзывы ВКонтакте
                    </a>
                    <a href="https://yandex.ru/maps/org/travelwave" target="_blank" class="review-link">
                        📍 Яндекс.Карты
                    </a>
                    <a href="https://google.com/maps" target="_blank" class="review-link">
                        📍 Google Отзывы
                    </a>
                </div>
            </div>
        </div>
        `;
    }

    afterRender() {
        // Шеринг в соцсети
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const network = e.target.closest('button').dataset.network;
                this.shareContent(network);
            });
        });

        // Отслеживание кликов по соцсетям
        document.querySelectorAll('.follow-btn, .review-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackSocialClick(e.target.href);
            });
        });
    }

    shareContent(network) {
        const currentUrl = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const description = encodeURIComponent('Лучшие туры от TravelWave!');
        
        let shareUrl = '';
        
        switch (network) {
            case 'vk':
                shareUrl = `https://vk.com/share.php?url=${currentUrl}&title=${title}&description=${description}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${currentUrl}&text=${title}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${title}%20${currentUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`;
                break;
        }
        
        if (shareUrl) {
            this.openShareWindow(shareUrl);
        }
    }

    openShareWindow(url) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(url, 'share', `
            width=${width},
            height=${height},
            left=${left},
            top=${top},
            menubar=no,
            toolbar=no,
            scrollbars=yes,
            resizable=yes
        `);
    }

    trackSocialClick(url) {
        // В реальном приложении здесь была бы аналитика
        console.log('Соц. сеть кликнута:', url);
        
        // Сохранение в localStorage для аналитики
        const socialClicks = JSON.parse(localStorage.getItem('social_clicks')) || [];
        socialClicks.push({
            url: url,
            timestamp: new Date().toISOString(),
            page: window.location.hash
        });
        localStorage.setItem('social_clicks', JSON.stringify(socialClicks));
    }

    // Получение статистики по соцсетям
    getSocialStats() {
        const socialClicks = JSON.parse(localStorage.getItem('social_clicks')) || [];
        
        const stats = {
            totalClicks: socialClicks.length,
            byNetwork: {},
            byPage: {},
            last7Days: 0
        };
        
        // Фильтрация за последние 7 дней
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        socialClicks.forEach(click => {
            // По сети
            const network = this.extractNetworkFromUrl(click.url);
            stats.byNetwork[network] = (stats.byNetwork[network] || 0) + 1;
            
            // По странице
            stats.byPage[click.page] = (stats.byPage[click.page] || 0) + 1;
            
            // За последние 7 дней
            const clickDate = new Date(click.timestamp);
            if (clickDate > weekAgo) {
                stats.last7Days++;
            }
        });
        
        return stats;
    }

    extractNetworkFromUrl(url) {
        if (url.includes('vk.com')) return 'vk';
        if (url.includes('t.me')) return 'telegram';
        if (url.includes('instagram.com')) return 'instagram';
        if (url.includes('facebook.com')) return 'facebook';
        return 'other';
    }
}

export default SocialIntegrationComponent;