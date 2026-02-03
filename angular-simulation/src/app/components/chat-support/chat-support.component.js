import I18nService from '../../services/i18n.service.js';

class ChatSupportComponent {
    constructor() {
        this.i18n = new I18nService();
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = JSON.parse(localStorage.getItem('chat_messages')) || this.getInitialMessages();
        this.typing = false;
        this.operatorTyping = false;
    }

    getInitialMessages() {
        return [
            {
                id: 1,
                sender: 'operator',
                name: 'Анна',
                text: this.i18n.t('msg.welcome') + ' ' + this.i18n.t('app.name') + '! Чем могу помочь?',
                time: new Date(Date.now() - 3600000).toISOString(),
                avatar: '👩‍💼'
            },
            {
                id: 2,
                sender: 'operator',
                name: 'Анна',
                text: 'Задайте любой вопрос о турах, бронировании или акциях.',
                time: new Date(Date.now() - 3500000).toISOString(),
                avatar: '👩‍💼'
            }
        ];
    }

    render() {
        return `
        <div class="chat-support ${this.isOpen ? 'open' : ''} ${this.isMinimized ? 'minimized' : ''}">
            <!-- Заголовок чата -->
            <div class="chat-header" id="chatToggle">
                <div class="chat-operator">
                    <span class="operator-avatar">👩‍💼</span>
                    <div class="operator-info">
                        <h4>${this.i18n.t('app.name')} Support</h4>
                        <div class="operator-status">
                            <span class="status-dot online"></span>
                            <span class="status-text">${this.operatorTyping ? 'Печатает...' : 'Онлайн'}</span>
                        </div>
                    </div>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn minimize" title="${this.i18n.t('btn.close')}">
                        ${this.isMinimized ? '🗖' : '🗕'}
                    </button>
                    <button class="chat-action-btn close" title="${this.i18n.t('btn.close')}">
                        ✕
                    </button>
                </div>
            </div>
            
            <!-- Тело чата -->
            <div class="chat-body" id="chatBody">
                <div class="chat-messages">
                    ${this.messages.map(msg => this.renderMessage(msg)).join('')}
                    
                    ${this.typing ? this.renderTypingIndicator() : ''}
                </div>
            </div>
            
            <!-- Панель ввода -->
            <div class="chat-footer">
                <div class="chat-input-container">
                    <input type="text" 
                           class="chat-input" 
                           id="chatInput"
                           placeholder="${this.i18n.t('form.message')}..."
                           maxlength="500">
                    <button class="chat-send-btn" id="chatSend">
                        📤
                    </button>
                </div>
                <div class="chat-quick-questions">
                    <button class="quick-question" data-question="${this.i18n.t('tours.popular')}?">
                        ${this.i18n.t('tours.popular')}?
                    </button>
                    <button class="quick-question" data-question="${this.i18n.t('cart.checkout')}?">
                        ${this.i18n.t('cart.checkout')}?
                    </button>
                    <button class="quick-question" data-question="${this.i18n.t('nav.promotions')}?">
                        ${this.i18n.t('nav.promotions')}?
                    </button>
                </div>
            </div>
            
            <!-- Кнопка открытия чата (плавающая) -->
            <button class="chat-floating-btn" id="chatFloatingBtn">
                💬
                ${this.hasUnreadMessages() ? '<span class="chat-badge">!</span>' : ''}
            </button>
        </div>
        `;
    }

    renderMessage(message) {
        const time = new Date(message.time).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
        <div class="chat-message ${message.sender === 'operator' ? 'operator' : 'user'}">
            <div class="message-avatar">
                ${message.avatar || (message.sender === 'operator' ? '👩‍💼' : '👤')}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${message.name}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${message.text}</div>
            </div>
        </div>
        `;
    }

    renderTypingIndicator() {
        return `
        <div class="typing-indicator">
            <div class="typing-avatar">👩‍💼</div>
            <div class="typing-content">
                <div class="typing-dots">
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
        document.getElementById('chatToggle')?.addEventListener('click', () => {
            if (this.isOpen) {
                this.isMinimized = !this.isMinimized;
            } else {
                this.isOpen = true;
                this.isMinimized = false;
            }
            this.rerender();
            this.scrollToBottom();
        });

        // Закрытие чата
        document.querySelector('.chat-action-btn.close')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isOpen = false;
            this.rerender();
        });

        // Минимизация
        document.querySelector('.chat-action-btn.minimize')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isMinimized = !this.isMinimized;
            this.rerender();
        });

        // Плавающая кнопка
        document.getElementById('chatFloatingBtn')?.addEventListener('click', () => {
            this.isOpen = true;
            this.isMinimized = false;
            this.rerender();
            this.scrollToBottom();
        });

        // Отправка сообщения
        const sendBtn = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');

        sendBtn?.addEventListener('click', () => {
            this.sendMessage();
        });

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Быстрые вопросы
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.dataset.question;
                chatInput.value = question;
                this.sendMessage();
            });
        });

        // Автоматическая прокрутка при открытии
        if (this.isOpen && !this.isMinimized) {
            this.scrollToBottom();
        }

        // Симуляция набора текста оператором
        this.simulateOperatorTyping();
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const text = chatInput.value.trim();
        
        if (!text) return;
        
        // Добавление сообщения пользователя
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            name: this.i18n.t('form.name'),
            text: text,
            time: new Date().toISOString(),
            avatar: '👤'
        };
        
        this.messages.push(userMessage);
        chatInput.value = '';
        
        // Показать индикатор набора текста
        this.typing = true;
        this.rerender();
        this.scrollToBottom();
        
        // Симулировать ответ оператора
        setTimeout(() => {
            this.typing = false;
            this.addOperatorResponse(text);
        }, 1000 + Math.random() * 2000);
        
        // Сохранение сообщений
        this.saveMessages();
    }

    addOperatorResponse(userText) {
        const responses = this.getResponses();
        let responseText = '';
        
        // Поиск подходящего ответа
        const lowerText = userText.toLowerCase();
        
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerText.includes(keyword)) {
                responseText = response;
                break;
            }
        }
        
        // Дефолтный ответ
        if (!responseText) {
            responseText = responses.default;
        }
        
        // Добавление ответа оператора
        const operatorMessage = {
            id: Date.now() + 1,
            sender: 'operator',
            name: 'Анна',
            text: responseText,
            time: new Date().toISOString(),
            avatar: '👩‍💼'
        };
        
        this.messages.push(operatorMessage);
        this.rerender();
        this.scrollToBottom();
        this.saveMessages();
    }

    getResponses() {
        const lang = this.i18n.getCurrentLanguage();
        
        if (lang === 'en') {
            return {
                'tour': 'We have a wide selection of tours. You can view them in the "Tours" section. Is there a specific destination you are interested in?',
                'price': 'Prices vary depending on the tour, season and conditions. You can see current prices on the tour pages. Do you want me to help you find the best deal?',
                'book': 'To book a tour, select it and click "Book" or add it to your cart. Do you need help with booking?',
                'cart': 'Your cart is on the cart page. There you can review your selection and proceed to checkout.',
                'discount': 'Current promotions are available in the "Promotions" section. There are discounts up to 40%!',
                'contact': 'Our contacts: phone +7 (495) 123-45-67, email info@travelwave.ru. We are available 24/7!',
                'hello': 'Hello! How can I help you today?',
                'thanks': 'You\'re welcome! If you have any more questions, feel free to ask.',
                'default': 'Thank you for your question! Our specialist will contact you shortly. In the meantime, you can browse our tours in the catalog.'
            };
        }
        
        return {
            'тур': 'У нас большой выбор туров. Вы можете посмотреть их в разделе "Туры". Вас интересует конкретное направление?',
            'цена': 'Цены зависят от тура, сезона и условий. Актуальные цены вы можете увидеть на страницах туров. Хотите помочь найти лучшее предложение?',
            'забронировать': 'Для бронирования тура выберите его и нажмите "Забронировать" или добавьте в корзину. Нужна помощь с оформлением?',
            'корзина': 'Ваша корзина находится на странице корзины. Там вы можете просмотреть свой выбор и перейти к оформлению.',
            'скидк': 'Текущие акции доступны в разделе "Акции". Есть скидки до 40%!',
            'контакт': 'Наши контакты: телефон +7 (495) 123-45-67, email info@travelwave.ru. Мы доступны 24/7!',
            'привет': 'Здравствуйте! Чем могу помочь вам сегодня?',
            'спасибо': 'Пожалуйста! Если есть еще вопросы, обращайтесь.',
            'default': 'Спасибо за ваш вопрос! Наш специалист свяжется с вами в ближайшее время. А пока можете посмотреть туры в нашем каталоге.'
        };
    }

    simulateOperatorTyping() {
        // Случайная симуляция набора текста оператором
        setInterval(() => {
            if (this.isOpen && !this.isMinimized && Math.random() < 0.1) {
                this.operatorTyping = true;
                this.rerender();
                
                setTimeout(() => {
                    this.operatorTyping = false;
                    this.rerender();
                }, 2000);
            }
        }, 10000);
    }

    scrollToBottom() {
        setTimeout(() => {
            const chatBody = document.getElementById('chatBody');
            if (chatBody) {
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }, 100);
    }

    hasUnreadMessages() {
        // Простая логика для демонстрации
        const lastMessage = this.messages[this.messages.length - 1];
        if (!lastMessage) return false;
        
        const messageTime = new Date(lastMessage.time);
        const now = new Date();
        const diffMinutes = (now - messageTime) / (1000 * 60);
        
        return lastMessage.sender === 'operator' && diffMinutes < 5;
    }

    saveMessages() {
        // Сохраняем только последние 50 сообщений
        const messagesToSave = this.messages.slice(-50);
        localStorage.setItem('chat_messages', JSON.stringify(messagesToSave));
    }

    rerender() {
        const container = document.querySelector('.chat-support');
        if (container) {
            container.outerHTML = this.render();
            this.afterRender();
        } else {
            // Первый рендер
            document.body.insertAdjacentHTML('beforeend', this.render());
            this.afterRender();
        }
    }
}

export default ChatSupportComponent;