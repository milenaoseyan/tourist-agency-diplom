import I18nService from '../../services/i18n.service.js';

class LanguageSwitcherComponent {
    constructor() {
        this.i18n = new I18nService();
        this.isOpen = false;
    }

    render() {
        const currentLang = this.i18n.getCurrentLanguage();
        const languages = this.i18n.getAvailableLanguages();
        const currentLanguage = languages.find(lang => lang.code === currentLang);

        return `
        <div class="language-switcher">
            <button class="language-current" id="languageToggle">
                <span class="language-flag">${currentLanguage.flag}</span>
                <span class="language-name">${currentLanguage.name}</span>
                <span class="language-arrow">▼</span>
            </button>
            
            <div class="language-dropdown ${this.isOpen ? 'open' : ''}">
                ${languages.map(lang => `
                    <button class="language-option ${lang.code === currentLang ? 'active' : ''}" 
                            data-lang="${lang.code}">
                        <span class="language-flag">${lang.flag}</span>
                        <span class="language-name">${lang.name}</span>
                        ${lang.code === currentLang ? '<span class="language-check">✓</span>' : ''}
                    </button>
                `).join('')}
            </div>
        </div>
        `;
    }

    afterRender() {
        const toggleBtn = document.getElementById('languageToggle');
        const dropdown = document.querySelector('.language-dropdown');

        // Открытие/закрытие выпадающего списка
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Выбор языка
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.target.closest('button').dataset.lang;
                this.changeLanguage(lang);
            });
        });

        // Закрытие при клике вне компонента
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Предотвращение закрытия при клике внутри
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Обработка изменения языка
        window.addEventListener('languagechange', () => {
            this.rerender();
        });
    }

    toggleDropdown() {
        this.isOpen = !this.isOpen;
        this.rerender();
    }

    openDropdown() {
        this.isOpen = true;
        this.rerender();
    }

    closeDropdown() {
        this.isOpen = false;
        this.rerender();
    }

    changeLanguage(lang) {
        const success = this.i18n.setLanguage(lang);
        if (success) {
            this.closeDropdown();
            
            // Показываем уведомление
            this.showNotification(
                this.i18n.t('msg.success'),
                this.i18n.t('nav.home') // Для демонстрации использования перевода
            );
            
            // Перезагружаем страницу для применения перевода
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    showNotification(message, detail = '') {
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🌐</span>
                <div>
                    <strong>${message}</strong>
                    ${detail ? `<p>${detail}</p>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    rerender() {
        const container = document.querySelector('.language-switcher');
        if (container) {
            container.innerHTML = this.render();
            this.afterRender();
        }
    }
}

export default LanguageSwitcherComponent;