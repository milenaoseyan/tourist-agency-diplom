import store from '../../store/store.js';

class NotificationCenterComponent {
  constructor() {
    this.notifications = [];
    this.unsubscribe = null;
  }

  render() {
    return `
      <div class="notification-center">
        <div class="notifications-list">
          ${this.notifications.map(notification => `
            <div class="notification-item ${notification.type}" data-id="${notification.id}">
              <div class="notification-icon">
                ${this.getIcon(notification.type)}
              </div>
              <div class="notification-content">
                <div class="notification-title">${notification.title || ''}</div>
                <div class="notification-message">${notification.message}</div>
              </div>
              <button class="notification-close" data-id="${notification.id}">
                &times;
              </button>
              ${notification.progress ? `
                <div class="notification-progress">
                  <div class="progress-bar" style="width: ${notification.progress}%"></div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  afterRender() {
    // Подписка на изменения хранилища
    this.unsubscribe = store.subscribe((state) => {
      this.notifications = state.notifications;
      this.rerender();
    });

    // Обработка кликов по закрытию
    document.querySelectorAll('.notification-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        store.dispatch({
          type: 'REMOVE_NOTIFICATION',
          payload: id
        });
      });
    });

    // Автозакрытие при клике
    document.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification-close')) return;
        
        const id = item.dataset.id;
        setTimeout(() => {
          store.dispatch({
            type: 'REMOVE_NOTIFICATION',
            payload: id
          });
        }, 300);
      });
    });
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳'
    };
    return icons[type] || '💬';
  }

  rerender() {
    const container = document.querySelector('.notification-center');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  // Статические методы для быстрого использования
  static success(message, options = {}) {
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        message,
        ...options
      }
    });
  }

  static error(message, options = {}) {
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'error',
        message,
        ...options
      }
    });
  }

  static info(message, options = {}) {
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'info',
        message,
        ...options
      }
    });
  }

  static warning(message, options = {}) {
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'warning',
        message,
        ...options
      }
    });
  }

  static loading(message, progress = null, options = {}) {
    const id = Date.now();
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id,
        type: 'loading',
        message,
        progress,
        autoClose: false,
        ...options
      }
    });
    return id; // Для обновления прогресса
  }

  static updateProgress(id, progress, message = null) {
    const state = store.getState();
    const notification = state.notifications.find(n => n.id === id);
    
    if (notification) {
      store.dispatch({
        type: 'UPDATE_NOTIFICATION',
        payload: {
          id,
          progress,
          message: message || notification.message
        }
      });
    }
  }

  static remove(id) {
    store.dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  }
}

export default NotificationCenterComponent;