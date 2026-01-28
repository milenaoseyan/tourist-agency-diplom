// Валидаторы форм
export const Validators = {
    // Валидация email
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return 'Email обязателен';
        if (!emailRegex.test(value)) return 'Введите корректный email';
        return null;
    },

    // Валидация пароля
    password: (value) => {
        if (!value) return 'Пароль обязателен';
        if (value.length < 6) return 'Пароль должен быть не менее 6 символов';
        return null;
    },

    // Валидация имени
    name: (value) => {
        if (!value) return 'Имя обязательно';
        if (value.length < 2) return 'Имя должно быть не менее 2 символов';
        return null;
    },

    // Валидация телефона
    phone: (value) => {
        const phoneRegex = /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        if (!value) return 'Телефон обязателен';
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return 'Введите корректный номер телефона';
        }
        return null;
    },

    // Валидация обязательного поля
    required: (value) => {
        if (!value || value.trim() === '') return 'Это поле обязательно';
        return null;
    },

    // Валидация числа
    number: (value, min = null, max = null) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Введите число';
        if (min !== null && num < min) return `Значение должно быть не менее ${min}`;
        if (max !== null && num > max) return `Значение должно быть не более ${max}`;
        return null;
    },

    // Валидация даты
    date: (value, minDate = null) => {
        if (!value) return 'Дата обязательна';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Введите корректную дату';
        if (minDate && date < new Date(minDate)) {
            return `Дата должна быть не ранее ${new Date(minDate).toLocaleDateString()}`;
        }
        return null;
    }
};

// Помощник для валидации формы
export const validateForm = (formData, validationRules) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
        const value = formData[field];
        const rules = validationRules[field];
        
        if (Array.isArray(rules)) {
            for (const rule of rules) {
                const error = rule(value);
                if (error) {
                    errors[field] = error;
                    isValid = false;
                    break;
                }
            }
        } else if (typeof rules === 'function') {
            const error = rules(value);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        }
    });

    return { isValid, errors };
};

// Форматирование ошибок
export const formatErrors = (errors) => {
    return Object.values(errors).join(', ');
};