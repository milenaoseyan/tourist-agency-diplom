import store from '../../store/store.js';
import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class SupportChatComponent {
  constructor() {
    this.isOpen = false;
    this.isMinimized = false;
    this.messages = JSON.parse(localStorage.getItem('support_chat')) || this.getInitialMessages();
    this.agents = [
      { id: 1, name: 'Анна', status: 'online', avatar: '👩‍💼', department: 'Общие вопросы' },
      { id: 2, name: 'Михаил', status: 'online', avatar: '👨‍💼', department: 'Бронирование' },
      { id: 3, name: 'Ольга', status: 'away', avatar: '👩‍🔧', department: 'Техподдержка' },
      { id: 4, name: 'Иван', status: 'offline', avatar: '👨‍✈️', department: 'Туры' }
    ];
    this.currentAgent = this.agents[0];
    this.typing = false;
    this.unreadCount = 0;
  }

  getInitialMessages() {
    return [
      {
        id: 1,
        type: 'system',
        content: 'Добро пожаловать в чат поддержки TravelWave! Соединяем с оператором...',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        type: 'agent',
        content: 'Здравствуйте! Меня зовут Анна. Чем могу помочь?',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        agentId: 1
      },
      {
        id: 3,
        type: 'user',
        content: 'Здравствуйте! Хочу уточнить условия бронирования тура в Турцию',
        timestamp: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: 4,
        type: 'agent',
        content: 'Конечно! Расскажите, какой тур вас интересует?',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        agentId: 1
      }
    ];
  }

  render() {
    if (!this.isOpen) {
      return this.renderChatButton();
    }

    return `
      <div class="support-chat ${this.isMinimized ? 'minimized' : ''}">
        <div class="chat-header">
          <div class="agent-info">
            <div class="agent-avatar">${this.currentAgent.avatar}</div>
            <div class="agent-details">
              <div class="agent-name">${this.currentAgent.name}</div>
              <div class="agent-status">
                <span class="status-dot ${this.currentAgent.status}"></span>
                ${this.getStatusText(this.currentAgent.status)}
              </div>
            </div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn minimize-chat" title="Свернуть">
              ${this.isMinimized ? '🗖' : '🗕'}
            </button>
            <button class="chat-action-btn switch-agent" title="Сменить оператора">
              🔄
            </button>
            <button class="chat-action-btn close-chat" title="Закрыть">
              ✕
            </button>
          </div>
        </div>

        ${this.isMinimized ? '' : `
          <div class="chat-body">
            <div class="messages-container" id="messagesContainer">
              ${this.renderMessages()}
              ${this.typing ? this.renderTypingIndicator() : ''}
            </div>
          </div>

          <div class="chat-footer">
            <div class="quick-questions">
              <span>Частые вопросы:</span>
              <div class="quick-buttons">
                <button class="quick-btn" data-question="Как отменить бронирование?">
                  Отмена брони
                </button>
                <button class="quick-btn" data-question="Нужна ли виза?">
                  Визы
                </button>
                <button class="quick-btn" data-question="Как изменить даты?">
                  Изменение дат
                </button>
              </div>
            </div>
            
            <div class="message-input-container">
              <input type="text" 
                     class="message-input" 
                     id="messageInput" 
                     placeholder="Напишите сообщение..."
                     maxlength="500">
              <div class="input-actions">
                <button class="input-action-btn attach-btn" title="Прикрепить файл">
                  📎
                </button>
                <button class="input-action-btn emoji-btn" title="Эмодзи">
                  😊
                </button>
                <button class="btn btn-primary send-btn" id="sendMessage" disabled>
                  Отправить
                </button>
              </div>
            </div>

            <div class="chat-options">
              <label class="option-checkbox">
                <input type="checkbox" id="saveChat" checked>
                <span>Сохранить историю чата</span>
              </label>
              <button class="btn-text export-chat" id="exportChat">
                💾 Экспорт чата
              </button>
            </div>
          </div>
        `}

        ${this.unreadCount > 0 && this.isMinimized ? `
          <div class="unread-badge">${this.unreadCount}</div>
        ` : ''}
      </div>
    `;
  }

  renderChatButton() {
    return `
      <button class="support-chat-button" id="openChat">
        <span class="chat-icon">💬</span>
        <span class="chat-label">Поддержка</span>
        ${this.unreadCount > 0 ? `
          <span class="chat-badge">${this.unreadCount}</span>
        ` : ''}
      </button>
    `;
  }

  renderMessages() {
    return this.messages.map(msg => `
      <div class="message ${msg.type}" data-message-id="${msg.id}">
        ${msg.type === 'agent' ? `
          <div class="message-avatar">${this.agents.find(a => a.id === msg.agentId)?.avatar || '👤'}</div>
        ` : ''}
        
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">
              ${msg.type === 'user' ? 'Вы' : 
                msg.type === 'agent' ? this.agents.find(a => a.id === msg.agentId)?.name || 'Оператор' :
                'Система'}
            </span>
            <span class="message-time">
              ${this.formatTime(msg.timestamp)}
            </span>
          </div>
          <div class="message-text">${this.formatMessageContent(msg.content)}</div>
          
          ${msg.type === 'agent' && msg.quickReplies ? `
            <div class="quick-replies">
              ${msg.quickReplies.map(reply => `
                <button class="quick-reply-btn" data-reply="${reply}">
                  ${reply}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderTypingIndicator() {
    return `
      <div class="message agent typing">
        <div class="message-avatar">${this.currentAgent.avatar}</div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">${this.currentAgent.name}</span>
            <span class="message-status">печатает...</span>
          </div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    // Открытие/закрытие чата
    document.getElementById('openChat')?.addEventListener('click', () => {
      this.toggleChat();
    });

    document.querySelector('.close-chat')?.addEventListener('click', () => {
      this.closeChat();
    });

    // Сворачивание/разворачивание
    document.querySelector('.minimize-chat')?.addEventListener('click', () => {
      this.toggleMinimize();
    });

    // Смена оператора
    document.querySelector('.switch-agent')?.addEventListener('click', () => {
      this.switchAgent();
    });

    // Отправка сообщения
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');

    if (messageInput && sendButton) {
      messageInput.addEventListener('input', (e) => {
        sendButton.disabled = !e.target.value.trim();
      });

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && messageInput.value.trim()) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
    }

    // Быстрые вопросы
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const question = e.target.dataset.question;
        this.sendQuickQuestion(question);
      });
    });

    // Быстрые ответы
    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reply = e.target.dataset.reply;
        this.sendMessage(reply);
      });
    });

    // Экспорт чата
    document.getElementById('exportChat')?.addEventListener('click', () => {
      this.exportChat();
    });

    // Прикрепление файлов
    document.querySelector('.attach-btn')?.addEventListener('click', () => {
      this.showAttachmentOptions();
    });

    // Прокрутка к последнему сообщению
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
    }
    this.rerender();
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.rerender();
  }

  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
    this.rerender();
  }

  switchAgent() {
    const availableAgents = this.agents.filter(a => a.status === 'online' && a.id !== this.currentAgent.id);
    
    if (availableAgents.length > 0) {
      this.currentAgent = availableAgents[0];
      this.addSystemMessage(`Соединение с оператором ${this.currentAgent.name}`);
      NotificationCenterComponent.info(`Оператор изменен: ${this.currentAgent.name}`);
    } else {
      NotificationCenterComponent.warning('Нет доступных операторов');
    }
    
    this.rerender();
  }

  async sendMessage(content = null) {
    const messageInput = document.getElementById('messageInput');
    const messageContent = content || messageInput?.value.trim();
    
    if (!messageContent) return;

    // Сообщение пользователя
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    this.messages.push(userMessage);
    this.saveChat();

    if (!content) {
      messageInput.value = '';
      document.getElementById('sendMessage').disabled = true;
    }

    // Показываем индикатор набора
    this.typing = true;
    this.rerender();
    this.scrollToBottom();

    // Имитация ответа оператора
    setTimeout(async () => {
      this.typing = false;
      
      const response = await this.generateResponse(messageContent);
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: response.content,
        timestamp: new Date().toISOString(),
        agentId: this.currentAgent.id,
        quickReplies: response.quickReplies
      };

      this.messages.push(agentMessage);
      this.saveChat();
      this.rerender();
      this.scrollToBottom();

      // Уведомление, если чат свернут
      if (this.isMinimized) {
        this.unreadCount++;
        this.rerender();
        NotificationCenterComponent.info(`Новое сообщение от ${this.currentAgent.name}`);
      }
    }, 1000 + Math.random() * 2000);
  }

  async generateResponse(userMessage) {
    // Мок-ответы на основе ключевых слов
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      'бронирование': {
        content: 'Для бронирования тура выберите интересующий вас тур на сайте и нажмите "Забронировать". Вы можете оплатить онлайн или забронировать с последующей оплатой в офисе.',
        quickReplies: ['Как оплатить?', 'Нужен ли залог?', 'Можно ли изменить даты?']
      },
      'оплат': {
        content: 'Мы принимаем оплату картами Visa/Mastercard, через СБП, наличными в офисе или безналичным расчетом для юридических лиц.',
        quickReplies: ['Есть ли рассрочка?', 'Сколько стоит залог?', 'Возврат средств']
      },
      'виз': {
        content: 'Информация о визах зависит от страны назначения. Для большинства стран СНГ виза не требуется. Для стран Шенгена и других стран нужна виза. Мы можем помочь с оформлением.',
        quickReplies: ['Стоимость визы', 'Сроки оформления', 'Какие документы?']
      },
      'отмен': {
        content: 'Вы можете отменить бронирование бесплатно за 30 дней до начала тура. При отмене позже могут применяться штрафные санкции согласно условиям договора.',
        quickReplies: ['Как отменить онлайн?', 'Штрафы за отмену', 'Вернут ли деньги?']
      },
      'default': {
        content: 'Поняла ваш вопрос. Чтобы дать точный ответ, мне нужна дополнительная информация. Можете уточнить детали или позвонить по телефону поддержки: 8-800-555-35-35.',
        quickReplies: ['Позвонить оператору', 'Написать на email', 'Часы работы поддержки']
      }
    };

    // Поиск подходящего ответа
    let response = responses.default;
    
    for (const [keyword, resp] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        response = resp;
        break;
      }
    }

    return response;
  }

  sendQuickQuestion(question) {
    this.sendMessage(question);
  }

  addSystemMessage(content) {
    const systemMessage = {
      id: Date.now(),
      type: 'system',
      content: content,
      timestamp: new Date().toISOString()
    };

    this.messages.push(systemMessage);
    this.saveChat();
    this.rerender();
    this.scrollToBottom();
  }

  showAttachmentOptions() {
    // В реальном приложении здесь был бы выбор файла
    NotificationCenterComponent.info('В демо-версии прикрепление файлов недоступно');
  }

  exportChat() {
    const chatData = {
      messages: this.messages,
      agent: this.currentAgent,
      exportedAt: new Date().toISOString(),
      totalMessages: this.messages.length
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    NotificationCenterComponent.success('Чат экспортирован в JSON');
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  }

  formatMessageContent(content) {
    // Простой форматирование ссылок и т.д.
    return content
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})/g, 
        '<a href="tel:$1">$1</a>');
  }

  getStatusText(status) {
    const statusMap = {
      'online': 'В сети',
      'away': 'Отошел',
      'offline': 'Не в сети',
      'busy': 'Занят'
    };
    return statusMap[status] || status;
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('messagesContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  saveChat() {
    localStorage.setItem('support_chat', JSON.stringify(this.messages));
  }

  clearChat() {
    if (confirm('Очистить всю историю чата?')) {
      this.messages = this.getInitialMessages();
      this.saveChat();
      this.rerender();
      NotificationCenterComponent.success('История чата очищена');
    }
  }

  getChatStats() {
    const userMessages = this.messages.filter(m => m.type === 'user').length;
    const agentMessages = this.messages.filter(m => m.type === 'agent').length;
    const firstMessage = this.messages[0]?.timestamp;
    const lastMessage = this.messages[this.messages.length - 1]?.timestamp;

    return {
      totalMessages: this.messages.length,
      userMessages,
      agentMessages,
      firstMessage,
      lastMessage,
      duration: firstMessage && lastMessage ? 
        Math.round((new Date(lastMessage) - new Date(firstMessage)) / 60000) + ' мин' : 'N/A'
    };
  }

  rerender() {
    const container = document.querySelector('.support-chat-container');
    if (container) {
      container.innerHTML = this.render();
      this.afterRender();
    }
  }

  // Статический метод для инициализации
  static init(containerSelector) {
    const chat = new SupportChatComponent();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = chat.render();
      chat.afterRender();
    }

    // Добавляем стили
    if (!document.querySelector('#support-chat-styles')) {
      const styles = document.createElement('style');
      styles.id = 'support-chat-styles';
      styles.textContent = `
        .support-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
        
        .support-chat-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transition: transform 0.3s;
        }
        
        .support-chat-button:hover {
          transform: translateY(-2px);
        }
        
        .support-chat {
          width: 350px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-body {
          flex: 1;
          max-height: 400px;
          overflow-y: auto;
          padding: 15px;
          background: #f8f9fa;
        }
        
        .message {
          display: flex;
          margin-bottom: 15px;
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(styles);
    }

    return chat;
  }
}

export default SupportChatComponent;