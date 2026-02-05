import store from '../../store/store.js';
import TourService from '../../services/tour.service.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class TripPlannerComponent {
  constructor() {
    this.tourService = new TourService();
    this.trips = JSON.parse(localStorage.getItem('user_trips')) || [];
    this.currentTrip = null;
  }

  render() {
    return `
      <div class="trip-planner">
        <div class="planner-header">
          <h2>🗺️ Планировщик поездок</h2>
          <button class="btn btn-primary" id="createNewTrip">
            + Создать новую поездку
          </button>
        </div>

        ${this.trips.length > 0 ? this.renderTripsList() : this.renderEmptyState()}
        
        ${this.currentTrip ? this.renderCurrentTrip() : ''}
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="planner-empty">
        <div class="empty-icon">🗺️</div>
        <h3>Начните планировать свою поездку</h3>
        <p>Создайте план путешествия, добавьте туры и отслеживайте бюджет</p>
        <button class="btn btn-primary" id="startPlanning">
          Начать планирование
        </button>
      </div>
    `;
  }

  renderTripsList() {
    return `
      <div class="trips-list">
        <h3>Мои поездки</h3>
        <div class="trips-grid">
          ${this.trips.map(trip => `
            <div class="trip-card ${this.currentTrip?.id === trip.id ? 'active' : ''}" data-trip-id="${trip.id}">
              <div class="trip-header">
                <h4>${trip.name}</h4>
                <span class="trip-date">${new Date(trip.startDate).toLocaleDateString('ru-RU')}</span>
              </div>
              <div class="trip-details">
                <div class="trip-detail">
                  <span class="detail-label">📍</span>
                  <span>${trip.destination}</span>
                </div>
                <div class="trip-detail">
                  <span class="detail-label">📅</span>
                  <span>${trip.duration} дней</span>
                </div>
                <div class="trip-detail">
                  <span class="detail-label">💰</span>
                  <span>${trip.budget.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              <div class="trip-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${this.calculateTripProgress(trip)}%"></div>
                </div>
                <span class="progress-text">${this.calculateTripProgress(trip)}% готово</span>
              </div>
              <div class="trip-actions">
                <button class="btn-icon edit-trip" data-trip-id="${trip.id}" title="Редактировать">
                  ✏️
                </button>
                <button class="btn-icon delete-trip" data-trip-id="${trip.id}" title="Удалить">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCurrentTrip() {
    if (!this.currentTrip) return '';
    
    return `
      <div class="current-trip">
        <div class="trip-view-header">
          <h3>${this.currentTrip.name}</h3>
          <div class="trip-actions">
            <button class="btn btn-text" id="closeTripView">✕</button>
          </div>
        </div>
        
        <div class="trip-overview">
          <div class="overview-card">
            <div class="overview-icon">📍</div>
            <div>
              <h4>Направление</h4>
              <p>${this.currentTrip.destination}</p>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon">📅</div>
            <div>
              <h4>Даты</h4>
              <p>${new Date(this.currentTrip.startDate).toLocaleDateString('ru-RU')} - 
                 ${new Date(this.currentTrip.endDate).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon">💰</div>
            <div>
              <h4>Бюджет</h4>
              <p>${this.currentTrip.budget.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          <div class="overview-card">
            <div class="overview-icon">👥</div>
            <div>
              <h4>Участники</h4>
              <p>${this.currentTrip.participants} чел.</p>
            </div>
          </div>
        </div>
        
        <div class="trip-sections">
          <div class="trip-section">
            <h4>Выбранные туры</h4>
            ${this.renderSelectedTours()}
            <button class="btn btn-small" id="addTourToTrip">+ Добавить тур</button>
          </div>
          
          <div class="trip-section">
            <h4>Бюджет</h4>
            ${this.renderBudgetBreakdown()}
          </div>
          
          <div class="trip-section">
            <h4>Чек-лист</h4>
            ${this.renderChecklist()}
          </div>
        </div>
        
        <div class="trip-export">
          <button class="btn btn-primary" id="exportTripPlan">Экспортировать план</button>
          <button class="btn btn-secondary" id="shareTrip">Поделиться</button>
        </div>
      </div>
    `;
  }

  renderSelectedTours() {
    if (!this.currentTrip?.selectedTours?.length) {
      return '<p class="no-tours">Туры не добавлены</p>';
    }
    
    return `
      <div class="selected-tours">
        ${this.currentTrip.selectedTours.map(tourId => {
          const tour = this.tourService.getTourById(tourId);
          if (!tour) return '';
          
          return `
            <div class="selected-tour">
              <img src="${tour.image}" alt="${tour.title}">
              <div class="tour-info">
                <h5>${tour.title}</h5>
                <p>${tour.price.toLocaleString('ru-RU')} ₽</p>
              </div>
              <button class="btn-icon remove-tour" data-tour-id="${tourId}">
                &times;
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderBudgetBreakdown() {
    const totalSpent = this.calculateTotalSpent();
    const remaining = this.currentTrip.budget - totalSpent;
    const percentage = (totalSpent / this.currentTrip.budget) * 100;
    
    return `
      <div class="budget-breakdown">
        <div class="budget-meter">
          <div class="meter-bar">
            <div class="meter-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="meter-labels">
            <span>Потрачено: ${totalSpent.toLocaleString('ru-RU')} ₽</span>
            <span>Осталось: ${remaining.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
        
        <div class="budget-details">
          <div class="budget-item">
            <span class="item-label">Туры:</span>
            <span class="item-value">${this.calculateToursCost().toLocaleString('ru-RU')} ₽</span>
          </div>
          <div class="budget-item">
            <span class="item-label">Проживание:</span>
            <span class="item-value">${this.currentTrip.expenses?.accommodation || 0} ₽</span>
          </div>
          <div class="budget-item">
            <span class="item-label">Питание:</span>
            <span class="item-value">${this.currentTrip.expenses?.food || 0} ₽</span>
          </div>
          <div class="budget-item">
            <span class="item-label">Транспорт:</span>
            <span class="item-value">${this.currentTrip.expenses?.transport || 0} ₽</span>
          </div>
          <div class="budget-item total">
            <span class="item-label">Итого:</span>
            <span class="item-value">${totalSpent.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>
    `;
  }

  renderChecklist() {
    const checklist = this.currentTrip.checklist || [
      { id: 1, text: 'Забронировать билеты', completed: false },
      { id: 2, text: 'Оформить страховку', completed: false },
      { id: 3, text: 'Забронировать отель', completed: false },
      { id: 4, text: 'Получить визу', completed: false },
      { id: 5, text: 'Обменять валюту', completed: false }
    ];
    
    return `
      <div class="checklist">
        ${checklist.map(item => `
          <div class="checklist-item">
            <label class="checkbox">
              <input type="checkbox" ${item.completed ? 'checked' : ''} data-item-id="${item.id}">
              <span class="checkmark"></span>
              <span class="checklist-text ${item.completed ? 'completed' : ''}">
                ${item.text}
              </span>
            </label>
          </div>
        `).join('')}
        <div class="add-checklist-item">
          <input type="text" placeholder="Добавить пункт..." id="newChecklistItem">
          <button class="btn btn-small" id="addChecklistItem">+</button>
        </div>
      </div>
    `;
  }

  afterRender() {
    // Создание новой поездки
    document.getElementById('createNewTrip')?.addEventListener('click', () => {
      this.showTripCreationModal();
    });

    document.getElementById('startPlanning')?.addEventListener('click', () => {
      this.showTripCreationModal();
    });

    // Выбор поездки
    document.querySelectorAll('.trip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-icon')) return;
        const tripId = card.dataset.tripId;
        this.selectTrip(parseInt(tripId));
      });
    });

    // Редактирование поездки
    document.querySelectorAll('.edit-trip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tripId = parseInt(e.target.closest('button').dataset.tripId);
        this.editTrip(tripId);
      });
    });

    // Удаление поездки
    document.querySelectorAll('.delete-trip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tripId = parseInt(e.target.closest('button').dataset.tripId);
        this.deleteTrip(tripId);
      });
    });

    // Закрытие просмотра поездки
    document.getElementById('closeTripView')?.addEventListener('click', () => {
      this.currentTrip = null;
      this.rerender();
    });

    // Добавление тура в поездку
    document.getElementById('addTourToTrip')?.addEventListener('click', () => {
      this.showAddTourModal();
    });

    // Удаление тура из поездки
    document.querySelectorAll('.remove-tour').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tourId = parseInt(e.target.closest('button').dataset.tourId);
        this.removeTourFromTrip(tourId);
      });
    });

    // Чек-лист
    document.querySelectorAll('.checklist input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const itemId = parseInt(e.target.dataset.itemId);
        this.toggleChecklistItem(itemId);
      });
    });

    document.getElementById('addChecklistItem')?.addEventListener('click', () => {
      this.addChecklistItem();
    });

    document.getElementById('newChecklistItem')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addChecklistItem();
      }
    });

    // Экспорт
    document.getElementById('exportTripPlan')?.addEventListener('click', () => {
      this.exportTripPlan();
    });

    document.getElementById('shareTrip')?.addEventListener('click', () => {
      this.shareTrip();
    });
  }

  showTripCreationModal() {
    const modal = document.createElement('div');
    modal.className = 'trip-modal-overlay';
    modal.innerHTML = `
      <div class="trip-modal">
        <div class="modal-header">
          <h3>Создать новую поездку</h3>
          <button class="close-modal">&times;</button>
        </div>
        <form id="tripForm" class="modal-form">
          <div class="form-group">
            <label for="tripName">Название поездки *</label>
            <input type="text" id="tripName" required placeholder="Например: Отпуск в Турции">
          </div>
          <div class="form-group">
            <label for="tripDestination">Направление *</label>
            <input type="text" id="tripDestination" required placeholder="Куда едем?">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Дата начала *</label>
              <input type="date" id="startDate" required>
            </div>
            <div class="form-group">
              <label for="endDate">Дата окончания *</label>
              <input type="date" id="endDate" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="tripBudget">Бюджет (₽) *</label>
              <input type="number" id="tripBudget" required min="0" value="50000">
            </div>
            <div class="form-group">
              <label for="tripParticipants">Участники</label>
              <input type="number" id="tripParticipants" min="1" value="2">
            </div>
          </div>
          <div class="form-group">
            <label for="tripNotes">Заметки</label>
            <textarea id="tripNotes" rows="3" placeholder="Особые пожелания, цели поездки..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary close-modal">Отмена</button>
            <button type="submit" class="btn btn-primary">Создать поездку</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Установка дат по умолчанию
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    modal.querySelector('#startDate').value = today.toISOString().split('T')[0];
    modal.querySelector('#endDate').value = nextWeek.toISOString().split('T')[0];

    // Закрытие модалки
    const closeModal = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Отправка формы
    modal.querySelector('#tripForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createTrip(modal);
      closeModal();
    });

    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  createTrip(modal) {
    const form = modal.querySelector('#tripForm');
    const startDate = new Date(form.querySelector('#startDate').value);
    const endDate = new Date(form.querySelector('#endDate').value);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const newTrip = {
      id: Date.now(),
      name: form.querySelector('#tripName').value,
      destination: form.querySelector('#tripDestination').value,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: duration,
      budget: parseInt(form.querySelector('#tripBudget').value),
      participants: parseInt(form.querySelector('#tripParticipants').value) || 1,
      notes: form.querySelector('#tripNotes').value,
      selectedTours: [],
      expenses: {
        accommodation: 0,
        food: 0,
        transport: 0,
        entertainment: 0
      },
      checklist: [
        { id: 1, text: 'Забронировать билеты', completed: false },
        { id: 2, text: 'Оформить страховку', completed: false },
        { id: 3, text: 'Забронировать отель', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.trips.push(newTrip);
    this.saveTrips();
    this.currentTrip = newTrip;
    this.rerender();

    NotificationCenterComponent.success(`Поездка "${newTrip.name}" создана!`);
  }

  selectTrip(tripId) {
    this.currentTrip = this.trips.find(t => t.id === tripId);
    this.rerender();
  }

  editTrip(tripId) {
    // Реализация редактирования
    NotificationCenterComponent.info('Редактирование поездки');
  }

  deleteTrip(tripId) {
    if (confirm('Удалить эту поездку?')) {
      this.trips = this.trips.filter(t => t.id !== tripId);
      if (this.currentTrip?.id === tripId) {
        this.currentTrip = null;
      }
      this.saveTrips();
      this.rerender();
      NotificationCenterComponent.success('Поездка удалена');
    }
  }

  showAddTourModal() {
    // Модалка для добавления туров
    NotificationCenterComponent.info('Выберите тур для добавления');
  }

  removeTourFromTrip(tourId) {
    if (!this.currentTrip) return;
    
    this.currentTrip.selectedTours = this.currentTrip.selectedTours.filter(id => id !== tourId);
    this.currentTrip.updatedAt = new Date().toISOString();
    this.saveTrips();
    this.rerender();
    
    NotificationCenterComponent.success('Тур удалён из поездки');
  }

  toggleChecklistItem(itemId) {
    if (!this.currentTrip) return;
    
    const item = this.currentTrip.checklist.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      this.currentTrip.updatedAt = new Date().toISOString();
      this.saveTrips();
      this.rerender();
    }
  }

  addChecklistItem() {
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    
    if (!text || !this.currentTrip) return;
    
    if (!this.currentTrip.checklist) {
      this.currentTrip.checklist = [];
    }
    
    this.currentTrip.checklist.push({
      id: Date.now(),
      text: text,
      completed: false
    });
    
    this.currentTrip.updatedAt = new Date().toISOString();
    this.saveTrips();
    
    input.value = '';
    this.rerender();
  }

  exportTripPlan() {
    if (!this.currentTrip) return;
    
    const exportData = {
      trip: this.currentTrip,
      exportedAt: new Date().toISOString(),
      totalCost: this.calculateTotalSpent()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip_plan_${this.currentTrip.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    NotificationCenterComponent.success('План поездки экспортирован');
  }

  shareTrip() {
    if (!this.currentTrip) return;
    
    const shareText = `Мой план поездки: ${this.currentTrip.name}. Посмотрите детали: ${window.location.origin}/#/trip/${this.currentTrip.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: this.currentTrip.name,
        text: `План поездки: ${this.currentTrip.destination}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      NotificationCenterComponent.success('Ссылка скопирована в буфер обмена');
    }
  }

  calculateTripProgress(trip) {
    let progress = 0;
    
    // Прогресс по чек-листу
    if (trip.checklist?.length) {
      const completed = trip.checklist.filter(item => item.completed).length;
      progress += (completed / trip.checklist.length) * 30;
    }
    
    // Прогресс по бюджету
    if (trip.budget > 0) {
      const spent = this.calculateTotalSpentForTrip(trip);
      progress += Math.min((spent / trip.budget) * 40, 40);
    }
    
    // Прогресс по бронированиям
    if (trip.selectedTours?.length) {
      progress += Math.min(trip.selectedTours.length * 10, 30);
    }
    
    return Math.min(Math.round(progress), 100);
  }

  calculateTotalSpent() {
    if (!this.currentTrip) return 0;
    return this.calculateTotalSpentForTrip(this.currentTrip);
  }

  calculateTotalSpentForTrip(trip) {
    let total = 0;
    
    // Стоимость туров
    total += this.calculateToursCostForTrip(trip);
    
    // Дополнительные расходы
    if (trip.expenses) {
      total += (trip.expenses.accommodation || 0);
      total += (trip.expenses.food || 0);
      total += (trip.expenses.transport || 0);
      total += (trip.expenses.entertainment || 0);
    }
    
    return total;
  }

  calculateToursCost() {
    if (!this.currentTrip) return 0;
    return this.calculateToursCostForTrip(this.currentTrip);
  }

  calculateToursCostForTrip(trip) {
    if (!trip.selectedTours?.length) return 0;
    
    return trip.selectedTours.reduce((total, tourId) => {
      const tour = this.tourService.getTourById(tourId);
      return total + (tour?.price || 0);
    }, 0);
  }

  saveTrips() {
    localStorage.setItem('user_trips', JSON.stringify(this.trips));
  }

  rerender() {
    const container = document.querySelector('.trip-planner');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
    }
  }
}

export default TripPlannerComponent;