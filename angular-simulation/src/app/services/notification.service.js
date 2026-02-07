import store from '../store/store.js';

class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('user_notifications')) || [];
    this.reminders = JSON.parse(localStorage.getItem('user_reminders')) || [];
    this.permission = localStorage.getItem('notification_permission') || 'default';
    
    this.checkPermission();
    this.setupAutoReminders();
  }

  async checkPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      localStorage.setItem('notification_permission', permission);
      return permission;
    }
    return 'unsupported';
  }

  async sendNotification(title, options = {}) {
    const defaultOptions = {
      body: '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'travelwave',
      requireInteraction: false,
      ...options
    };

    // Сохраняем в историю
    const notification = {
      id: Date.now(),
      title,
      ...defaultOptions,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();

    // Отправляем браузерное уведомление
    if (this.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
          registration.showNotification(title, defaultOptions);
        } else if ('Notification' in window) {
          new Notification(title, defaultOptions);
        }
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }

    // Также показываем в UI
    store.dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: notification.id,
        type: options.type || 'info',
        title,
        message: defaultOptions.body,
        autoClose: !defaultOptions.requireInteraction
      }
    });

    return notification;
  }

  // Специализированные уведомления
  async sendTourReminder(tour, daysBefore = 1) {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBefore);

    const reminder = {
      id: Date.now(),
      type: 'tour_reminder',
      tourId: tour.id,
      tourTitle: tour.title,
      daysBefore,
      scheduledFor: reminderDate.toISOString(),
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.saveReminders();

    // Планируем отправку
    this.scheduleReminder(reminder);

    return reminder;
  }

  async sendPaymentReminder(order, hoursBefore = 24) {
    const reminderDate = new Date();
    reminderDate.setHours(reminderDate.getHours() + hoursBefore);

    const reminder = {
      id: Date.now(),
      type: 'payment_reminder',
      orderId: order.id,
      amount: order.total,
      hoursBefore,
      scheduledFor: reminderDate.toISOString(),
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.saveReminders();

    this.scheduleReminder(reminder);
    return reminder;
  }

  async sendWeatherAlert(location, condition) {
    return this.sendNotification(
      `🌤️ Погода в ${location}`,
      {
        body: `Текущие условия: ${condition}. Хорошего путешествия!`,
        icon: '/icons/weather.png',
        tag: 'weather',
        requireInteraction: false
      }
    );
  }

  async sendPriceDropAlert(tour, oldPrice, newPrice) {
    const discount = Math.round((1 - newPrice / oldPrice) * 100);
    
    return this.sendNotification(
      '💰 Снижение цены!',
      {
        body: `Тур "${tour.title}" подешевел на ${discount}%. Новая цена: ${newPrice.toLocaleString('ru-RU')} ₽`,
        icon: '/icons/discount.png',
        tag: 'price_drop',
        requireInteraction: true,
        data: {
          tourId: tour.id,
          action: 'view_tour'
        }
      }
    );
  }

  // Планирование напоминаний
  scheduleReminder(reminder) {
    const now = new Date();
    const scheduledTime = new Date(reminder.scheduledFor);
    const timeUntilReminder = scheduledTime.getTime() - now.getTime();

    if (timeUntilReminder <= 0) {
      this.sendReminderNow(reminder);
      return;
    }

    setTimeout(() => {
      this.sendReminderNow(reminder);
    }, timeUntilReminder);
  }

  async sendReminderNow(reminder) {
    if (reminder.sent) return;

    let title, body;

    switch (reminder.type) {
      case 'tour_reminder':
        title = '🎫 Напоминание о туре';
        body = `Завтра начинается ваш тур "${reminder.tourTitle}"`;
        break;
      
      case 'payment_reminder':
        title = '💰 Напоминание об оплате';
        body = `Заказ #${reminder.orderId} на сумму ${reminder.amount.toLocaleString('ru-RU')} ₽ нужно оплатить в течение ${reminder.hoursBefore} часов`;
        break;
      
      default:
        return;
    }

    await this.sendNotification(title, {
      body,
      tag: `reminder_${reminder.type}`,
      requireInteraction: true,
      data: {
        reminderId: reminder.id,
        type: reminder.type
      }
    });

    // Помечаем как отправленное
    reminder.sent = true;
    reminder.sentAt = new Date().toISOString();
    this.saveReminders();
  }

  // Автонапоминания
  setupAutoReminders() {
    // Проверяем неотправленные напоминания при загрузке
    this.checkPendingReminders();
    
    // Ежедневная проверка в 9 утра
    this.setupDailyCheck();
  }

  async checkPendingReminders() {
    const now = new Date();
    const pendingReminders = this.reminders.filter(r => !r.sent && new Date(r.scheduledFor) <= now);

    for (const reminder of pendingReminders) {
      await this.sendReminderNow(reminder);
    }
  }

  setupDailyCheck() {
    // Запускаем проверку каждый день в 9:00
    const now = new Date();
    const nextCheck = new Date();
    nextCheck.setHours(9, 0, 0, 0);
    
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    const timeUntilCheck = nextCheck.getTime() - now.getTime();

    setTimeout(() => {
      this.checkPendingReminders();
      // Повторяем каждые 24 часа
      setInterval(() => this.checkPendingReminders(), 24 * 60 * 60 * 1000);
    }, timeUntilCheck);
  }

  // Управление уведомлениями
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotifications(filter = 'all') {
    switch (filter) {
      case 'unread':
        return this.notifications.filter(n => !n.read);
      case 'read':
        return this.notifications.filter(n => n.read);
      case 'important':
        return this.notifications.filter(n => n.tag?.includes('important') || n.requireInteraction);
      default:
        return this.notifications;
    }
  }

  // Статистика
  getNotificationStats() {
    const total = this.notifications.length;
    const unread = this.getUnreadCount();
    const today = new Date().toDateString();
    const todayCount = this.notifications.filter(n => 
      new Date(n.timestamp).toDateString() === today
    ).length;

    const byType = {};
    this.notifications.forEach(n => {
      const type = n.tag || 'general';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total,
      unread,
      todayCount,
      byType,
      reminderCount: this.reminders.length,
      activeReminders: this.reminders.filter(r => !r.sent).length
    };
  }

  // Настройки
  updateSettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('notification_settings')) || {};
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
    return newSettings;
  }

  getSettings() {
    return JSON.parse(localStorage.getItem('notification_settings')) || {
      email: true,
      push: true,
      reminders: true,
      priceAlerts: true,
      weatherAlerts: true,
      quietHours: { start: '22:00', end: '08:00', enabled: true }
    };
  }

  isQuietHours() {
    const settings = this.getSettings();
    if (!settings.quietHours?.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // Сохранение данных
  saveNotifications() {
    localStorage.setItem('user_notifications', JSON.stringify(this.notifications));
  }

  saveReminders() {
    localStorage.setItem('user_reminders', JSON.stringify(this.reminders));
  }

  // Экспорт данных
  exportData() {
    return {
      notifications: this.notifications,
      reminders: this.reminders,
      exportedAt: new Date().toISOString(),
      stats: this.getNotificationStats()
    };
  }
}

export default NotificationService;