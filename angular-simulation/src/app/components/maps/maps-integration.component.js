import store from '../../store/store.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class MapsIntegrationComponent {
  constructor() {
    this.mapProviders = {
      yandex: {
        name: 'Яндекс.Карты',
        icon: '🇷🇺',
        getUrl: (location, type = 'route') => {
          const baseUrl = 'https://yandex.ru/maps/';
          const params = new URLSearchParams({
            text: location,
            z: '12',
            l: type === 'sat' ? 'sat' : 'map'
          });
          return `${baseUrl}?${params.toString()}`;
        },
        getEmbedUrl: (location) => {
          return `https://yandex.ru/map-widget/v1/?ll=37.620070%2C55.753630&z=12&l=map&pt=37.620070%2C55.753630&size=600%2C400`;
        }
      },
      google: {
        name: 'Google Maps',
        icon: '🌍',
        getUrl: (location, type = 'directions') => {
          const baseUrl = 'https://www.google.com/maps/';
          if (type === 'directions') {
            return `${baseUrl}dir/?api=1&destination=${encodeURIComponent(location)}`;
          }
          return `${baseUrl}search/?api=1&query=${encodeURIComponent(location)}`;
        },
        getEmbedUrl: (location) => {
          return `https://www.google.com/maps/embed/v1/place?key=MOCK_KEY&q=${encodeURIComponent(location)}`;
        }
      },
      osm: {
        name: 'OpenStreetMap',
        icon: '🗺️',
        getUrl: (location) => {
          return `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;
        },
        getEmbedUrl: (location) => {
          return `https://www.openstreetmap.org/export/embed.html?bbox=37.5%2C55.7%2C37.8%2C55.8&layer=mapnik&marker=55.753630%2C37.620070`;
        }
      }
    };
    
    this.preferredProvider = localStorage.getItem('preferred_map_provider') || 'yandex';
    this.savedLocations = JSON.parse(localStorage.getItem('saved_locations')) || [];
  }

  render(location, options = {}) {
    const {
      showEmbed = true,
      showLinks = true,
      showControls = true,
      height = '400px',
      width = '100%'
    } = options;

    const provider = this.mapProviders[this.preferredProvider];

    return `
      <div class="maps-integration">
        ${showControls ? this.renderControls(location) : ''}
        
        ${showEmbed ? `
          <div class="map-container">
            <div class="map-placeholder" id="mapPlaceholder" style="height: ${height}; width: ${width}">
              <div class="map-mock">
                <div class="map-mock-content">
                  <div class="map-mock-header">${provider.icon} ${provider.name}</div>
                  <div class="map-mock-body">
                    <p>📍 ${location}</p>
                    <p>Для просмотра карты перейдите по ссылке ниже</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="map-actions">
              <button class="btn btn-small" id="saveLocation" data-location="${location}">
                💾 Сохранить локацию
              </button>
              <button class="btn btn-small" id="getDirections">
                🚗 Проложить маршрут
              </button>
            </div>
          </div>
        ` : ''}
        
        ${showLinks ? this.renderMapLinks(location) : ''}
        
        ${this.savedLocations.length > 0 && location ? this.renderNearbyLocations(location) : ''}
      </div>
    `;
  }

  renderControls(location) {
    return `
      <div class="map-controls">
        <div class="map-provider-selector">
          <span>Карта:</span>
          <div class="provider-buttons">
            ${Object.entries(this.mapProviders).map(([key, provider]) => `
              <button class="provider-btn ${this.preferredProvider === key ? 'active' : ''}" 
                      data-provider="${key}"
                      title="${provider.name}">
                ${provider.icon}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="map-actions">
          <button class="btn btn-small" id="shareLocation" data-location="${location}">
            📤 Поделиться
          </button>
          <button class="btn btn-small" id="printMap">
            🖨️ Распечатать
          </button>
        </div>
      </div>
    `;
  }

  renderMapLinks(location) {
    return `
      <div class="map-links">
        <h4>Открыть в картах:</h4>
        <div class="links-grid">
          ${Object.values(this.mapProviders).map(provider => `
            <a href="${provider.getUrl(location)}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="map-link">
              <span class="link-icon">${provider.icon}</span>
              <span class="link-text">${provider.name}</span>
              <span class="link-arrow">→</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderNearbyLocations(currentLocation) {
    // Фильтруем сохраненные локации (кроме текущей)
    const nearby = this.savedLocations
      .filter(loc => loc.name !== currentLocation)
      .slice(0, 5);

    if (nearby.length === 0) return '';

    return `
      <div class="nearby-locations">
        <h4>📍 Близкие локации:</h4>
        <div class="nearby-list">
          ${nearby.map(location => `
            <div class="nearby-item">
              <span class="nearby-name">${location.name}</span>
              <span class="nearby-distance">~${Math.floor(Math.random() * 50) + 1} км</span>
              <button class="btn-icon view-nearby" data-location="${location.name}">
                👁️
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  afterRender() {
    // Выбор провайдера карт
    document.querySelectorAll('.provider-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const provider = e.target.closest('button').dataset.provider;
        this.setPreferredProvider(provider);
        this.rerender();
      });
    });

    // Сохранение локации
    document.getElementById('saveLocation')?.addEventListener('click', (e) => {
      const location = e.target.dataset.location;
      this.saveLocation(location);
    });

    // Проложить маршрут
    document.getElementById('getDirections')?.addEventListener('click', () => {
      this.showDirectionsModal();
    });

    // Поделиться локацией
    document.getElementById('shareLocation')?.addEventListener('click', (e) => {
      const location = e.target.dataset.location;
      this.shareLocation(location);
    });

    // Распечатать карту
    document.getElementById('printMap')?.addEventListener('click', () => {
      this.printMap();
    });

    // Просмотр близких локаций
    document.querySelectorAll('.view-nearby').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const location = e.target.closest('button').dataset.location;
        this.showLocationOnMap(location);
      });
    });
  }

  setPreferredProvider(provider) {
    this.preferredProvider = provider;
    localStorage.setItem('preferred_map_provider', provider);
    NotificationCenterComponent.success(`Карты: ${this.mapProviders[provider].name}`);
  }

  saveLocation(location) {
    if (!location) return;

    // Проверяем, не сохранена ли уже эта локация
    const existing = this.savedLocations.find(loc => loc.name === location);
    
    if (existing) {
      NotificationCenterComponent.info('Локация уже сохранена');
      return;
    }

    const newLocation = {
      id: Date.now(),
      name: location,
      savedAt: new Date().toISOString(),
      category: 'tour',
      coordinates: {
        lat: 55.753630 + (Math.random() - 0.5) * 0.1,
        lng: 37.620070 + (Math.random() - 0.5) * 0.1
      }
    };

    this.savedLocations.push(newLocation);
    localStorage.setItem('saved_locations', JSON.stringify(this.savedLocations));
    
    NotificationCenterComponent.success(`Локация "${location}" сохранена`);
    this.rerender();
  }

  showDirectionsModal() {
    const modal = document.createElement('div');
    modal.className = 'directions-modal-overlay';
    modal.innerHTML = `
      <div class="directions-modal">
        <div class="modal-header">
          <h3>🚗 Проложить маршрут</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="route-form">
            <div class="form-group">
              <label for="startPoint">Откуда:</label>
              <input type="text" id="startPoint" placeholder="Ваше местоположение" value="Москва">
            </div>
            <div class="form-group">
              <label for="endPoint">Куда:</label>
              <input type="text" id="endPoint" placeholder="Место назначения" readonly>
            </div>
            <div class="form-group">
              <label for="transportType">Транспорт:</label>
              <select id="transportType">
                <option value="car">🚗 Автомобиль</option>
                <option value="transit">🚌 Общественный транспорт</option>
                <option value="walking">🚶 Пешком</option>
                <option value="bicycle">🚲 Велосипед</option>
              </select>
            </div>
          </div>
          <div class="route-preview">
            <div class="route-info">
              <div class="info-item">
                <span class="label">Расстояние:</span>
                <span class="value">~${Math.floor(Math.random() * 200) + 50} км</span>
              </div>
              <div class="info-item">
                <span class="label">Время:</span>
                <span class="value">~${Math.floor(Math.random() * 3) + 1} ч ${Math.floor(Math.random() * 60)} мин</span>
              </div>
              <div class="info-item">
                <span class="label">Способ:</span>
                <span class="value" id="transportDisplay">Автомобиль</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">Отмена</button>
          <button class="btn btn-primary" id="openInMaps">Открыть в картах</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Обновляем поле назначения
    const tourLocation = document.querySelector('.tour-location')?.textContent || 
                        document.querySelector('[data-location]')?.dataset.location;
    if (tourLocation) {
      modal.querySelector('#endPoint').value = tourLocation.replace('📍 ', '');
    }

    // Обновляем отображение транспорта
    const transportSelect = modal.querySelector('#transportType');
    const transportDisplay = modal.querySelector('#transportDisplay');
    
    transportSelect.addEventListener('change', (e) => {
      const options = {
        car: '🚗 Автомобиль',
        transit: '🚌 Общественный транспорт',
        walking: '🚶 Пешком',
        bicycle: '🚲 Велосипед'
      };
      transportDisplay.textContent = options[e.target.value];
    });

    // Закрытие модалки
    const closeModal = () => modal.remove();
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Открыть в картах
    modal.querySelector('#openInMaps').addEventListener('click', () => {
      const start = modal.querySelector('#startPoint').value;
      const end = modal.querySelector('#endPoint').value;
      const transport = modal.querySelector('#transportType').value;
      
      this.openRouteInMaps(start, end, transport);
      closeModal();
    });

    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  openRouteInMaps(start, end, transport) {
    const provider = this.mapProviders[this.preferredProvider];
    const type = transport === 'walking' ? 'pedestrian' : 
                 transport === 'bicycle' ? 'bicycle' : 'auto';
    
    const url = provider.getUrl(`${start} → ${end}`, 'directions');
    window.open(url, '_blank');
    
    NotificationCenterComponent.success(`Маршрут открыт в ${provider.name}`);
  }

  shareLocation(location) {
    const shareText = `Посмотрите локацию: ${location}. Открыть в картах: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: location,
        text: `Локация: ${location}`,
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard(shareText);
      });
    } else {
      this.copyToClipboard(shareText);
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      NotificationCenterComponent.success('Ссылка скопирована в буфер обмена');
    } catch (error) {
      console.error('Copy failed:', error);
      NotificationCenterComponent.error('Не удалось скопировать');
    }
  }

  printMap() {
    const printContent = document.querySelector('.map-container').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Карта - TravelWave</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .map-mock { border: 2px solid #ccc; padding: 20px; border-radius: 10px; }
          .map-mock-header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .print-date { color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>TravelWave - Карта локации</h1>
        <div class="print-date">Распечатано: ${new Date().toLocaleString('ru-RU')}</div>
        ${printContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  showLocationOnMap(location) {
    // В реальном приложении здесь бы открывалась карта с локацией
    NotificationCenterComponent.info(`Показываем ${location} на карте`);
    
    // Обновляем текущую локацию в компоненте
    const currentComponent = document.querySelector('.maps-integration');
    if (currentComponent) {
      // Можно обновить компонент с новой локацией
      this.rerender(location);
    }
  }

  getSavedLocations() {
    return this.savedLocations;
  }

  clearSavedLocations() {
    if (confirm('Очистить все сохраненные локации?')) {
      this.savedLocations = [];
      localStorage.removeItem('saved_locations');
      NotificationCenterComponent.success('Все локации удалены');
      this.rerender();
    }
  }

  rerender() {
    const container = document.querySelector('.maps-integration');
    if (container) {
      const location = container.querySelector('[data-location]')?.dataset.location || 
                      container.closest('[data-location]')?.dataset.location;
      if (location) {
        container.innerHTML = this.render(location, { showEmbed: true, showLinks: true });
        this.afterRender();
      }
    }
  }

  // Статический метод для быстрого использования
  static show(location, containerSelector, options = {}) {
    const maps = new MapsIntegrationComponent();
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = maps.render(location, options);
      maps.afterRender();
    }
    return maps;
  }
}

export default MapsIntegrationComponent;