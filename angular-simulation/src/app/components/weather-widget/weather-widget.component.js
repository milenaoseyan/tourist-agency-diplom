class WeatherWidgetComponent {
  constructor(location = 'Москва') {
    this.location = location;
    this.weatherData = null;
    this.isLoading = true;
    this.unit = 'C'; // C или F
  }

  async render() {
    await this.fetchWeatherData();
    
    if (!this.weatherData) {
      return `
        <div class="weather-widget error">
          <div class="weather-icon">🌤️</div>
          <div class="weather-info">
            <h4>${this.location}</h4>
            <p>Не удалось загрузить погоду</p>
          </div>
        </div>
      `;
    }

    const temp = this.unit === 'C' ? this.weatherData.temp_c : this.weatherData.temp_f;
    const unitSymbol = this.unit === 'C' ? '°C' : '°F';

    return `
      <div class="weather-widget">
        <div class="weather-header">
          <h4>🌤️ Погода в ${this.location}</h4>
          <button class="weather-unit-toggle" data-unit="${this.unit === 'C' ? 'F' : 'C'}">
            ${this.unit === 'C' ? '°F' : '°C'}
          </button>
        </div>
        
        <div class="weather-main">
          <div class="weather-icon-large">${this.getWeatherIcon(this.weatherData.condition)}</div>
          <div class="weather-temp">${Math.round(temp)}${unitSymbol}</div>
          <div class="weather-condition">${this.weatherData.condition}</div>
        </div>
        
        <div class="weather-details">
          <div class="weather-detail">
            <span class="detail-icon">💧</span>
            <span class="detail-label">Влажность:</span>
            <span class="detail-value">${this.weatherData.humidity}%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-icon">💨</span>
            <span class="detail-label">Ветер:</span>
            <span class="detail-value">${this.weatherData.wind_kph} км/ч</span>
          </div>
          <div class="weather-detail">
            <span class="detail-icon">👁️</span>
            <span class="detail-label">Видимость:</span>
            <span class="detail-value">${this.weatherData.vis_km} км</span>
          </div>
        </div>
        
        ${this.weatherData.forecast ? this.renderForecast() : ''}
        
        <div class="weather-footer">
          <span class="weather-updated">Обновлено: ${new Date(this.weatherData.last_updated).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          <button class="weather-refresh">🔄</button>
        </div>
      </div>
    `;
  }

  renderForecast() {
    if (!this.weatherData.forecast || !this.weatherData.forecast.forecastday) return '';
    
    return `
      <div class="weather-forecast">
        <h5>Прогноз на 3 дня</h5>
        <div class="forecast-days">
          ${this.weatherData.forecast.forecastday.slice(0, 3).map(day => `
            <div class="forecast-day">
              <div class="forecast-date">${new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
              <div class="forecast-icon">${this.getWeatherIcon(day.day.condition.text)}</div>
              <div class="forecast-temp">
                <span class="temp-max">${this.unit === 'C' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}°</span>
                <span class="temp-min">${this.unit === 'C' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)}°</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async fetchWeatherData() {
    this.isLoading = true;
    
    try {
      // Используем моковые данные, так как у нас нет реального API
      // В реальном приложении здесь был бы fetch к weather API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Моковые данные погоды для разных городов
      const mockWeather = {
        'Москва': {
          location: { name: 'Москва', country: 'Россия' },
          current: {
            temp_c: 15,
            temp_f: 59,
            condition: { text: 'Облачно' },
            humidity: 65,
            wind_kph: 12,
            vis_km: 10,
            last_updated: new Date().toISOString()
          },
          forecast: {
            forecastday: [
              {
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 16,
                  mintemp_c: 10,
                  maxtemp_f: 61,
                  mintemp_f: 50,
                  condition: { text: 'Солнечно' }
                }
              },
              {
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 14,
                  mintemp_c: 8,
                  maxtemp_f: 57,
                  mintemp_f: 46,
                  condition: { text: 'Дождь' }
                }
              },
              {
                date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 17,
                  mintemp_c: 11,
                  maxtemp_f: 63,
                  mintemp_f: 52,
                  condition: { text: 'Переменная облачность' }
                }
              }
            ]
          }
        },
        'Сочи': {
          location: { name: 'Сочи', country: 'Россия' },
          current: {
            temp_c: 22,
            temp_f: 72,
            condition: { text: 'Солнечно' },
            humidity: 55,
            wind_kph: 8,
            vis_km: 15,
            last_updated: new Date().toISOString()
          },
          forecast: {
            forecastday: [
              {
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 24,
                  mintemp_c: 18,
                  maxtemp_f: 75,
                  mintemp_f: 64,
                  condition: { text: 'Солнечно' }
                }
              },
              {
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 23,
                  mintemp_c: 17,
                  maxtemp_f: 73,
                  mintemp_f: 63,
                  condition: { text: 'Ясно' }
                }
              },
              {
                date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                day: {
                  maxtemp_c: 25,
                  mintemp_c: 19,
                  maxtemp_f: 77,
                  mintemp_f: 66,
                  condition: { text: 'Солнечно' }
                }
              }
            ]
          }
        },
        'Санкт-Петербург': {
          location: { name: 'Санкт-Петербург', country: 'Россия' },
          current: {
            temp_c: 12,
            temp_f: 54,
            condition: { text: 'Дождь' },
            humidity: 80,
            wind_kph: 15,
            vis_km: 5,
            last_updated: new Date().toISOString()
          }
        }
      };

      const data = mockWeather[this.location] || mockWeather['Москва'];
      
      this.weatherData = {
        location: data.location.name,
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        condition: data.current.condition.text,
        humidity: data.current.humidity,
        wind_kph: data.current.wind_kph,
        vis_km: data.current.vis_km,
        last_updated: data.current.last_updated,
        forecast: data.forecast
      };
      
    } catch (error) {
      console.error('Error fetching weather:', error);
      this.weatherData = null;
    } finally {
      this.isLoading = false;
    }
  }

  getWeatherIcon(condition) {
    const conditions = {
      'Солнечно': '☀️',
      'Ясно': '☀️',
      'Облачно': '☁️',
      'Переменная облачность': '⛅',
      'Дождь': '🌧️',
      'Ливень': '⛈️',
      'Гроза': '⛈️',
      'Снег': '❄️',
      'Туман': '🌫️',
      'Ветрено': '💨'
    };
    
    return conditions[condition] || '🌤️';
  }

  afterRender() {
    // Переключение единиц измерения
    document.querySelector('.weather-unit-toggle')?.addEventListener('click', (e) => {
      this.unit = e.target.dataset.unit;
      this.rerender();
    });

    // Обновление погоды
    document.querySelector('.weather-refresh')?.addEventListener('click', async () => {
      await this.fetchWeatherData();
      this.rerender();
    });
  }

  async rerender() {
    const container = document.querySelector('.weather-widget, .weather-widget.error');
    if (container) {
      container.outerHTML = await this.render();
      await this.afterRender();
    }
  }

  // Статический метод для быстрого создания виджета
  static async create(location, containerSelector) {
    const widget = new WeatherWidgetComponent(location);
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = await widget.render();
      await widget.afterRender();
    }
    return widget;
  }
}

export default WeatherWidgetComponent;