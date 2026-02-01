class NotificationComponent {
    constructor() {
        this.notifications = [];
        this.container = null;
    }

    render() {
        return `<div class="notifications-container"></div>`;
    }

    afterRender() {
        this.container = document.querySelector('.notifications-container');
    }

    show(message, type = 'info', duration = 5000) {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            duration
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    renderNotification(notification) {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        }

        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.id = notification.id;
        element.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(notification.type)}</span>
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close">&times;</button>
            </div>
            ${notification.duration > 0 ? `
                <div class="notification-timer">
                    <div class="timer-bar" style="animation-duration: ${notification.duration}ms"></div>
                </div>
            ` : ''}
        `;

        this.container.appendChild(element);

        // Анимация появления
        setTimeout(() => {
            element.classList.add('show');
        }, 10);

        // Закрытие по клику
        element.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(notification.id);
        });

        return element;
    }

    remove(id) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    getIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || '💬';
    }

    // Статические методы для быстрого использования
    static success(message, duration = 3000) {
        const notification = new NotificationComponent();
        return notification.show(message, 'success', duration);
    }

    static error(message, duration = 5000) {
        const notification = new NotificationComponent();
        return notification.show(message, 'error', duration);
    }

    static info(message, duration = 3000) {
        const notification = new NotificationComponent();
        return notification.show(message, 'info', duration);
    }

    static warning(message, duration = 4000) {
        const notification = new NotificationComponent();
        return notification.show(message, 'warning', duration);
    }
}

export default NotificationComponent;