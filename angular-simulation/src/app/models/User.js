const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, укажите ваше имя'],
    trim: true,
    maxlength: [50, 'Имя не может быть длиннее 50 символов'],
    minlength: [2, 'Имя должно содержать минимум 2 символа']
  },
  
  email: {
    type: String,
    required: [true, 'Пожалуйста, укажите ваш email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Пожалуйста, укажите корректный email']
  },
  
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Пожалуйста, укажите корректный номер телефона'
    }
  },
  
  password: {
    type: String,
    required: [true, 'Пожалуйста, укажите пароль'],
    minlength: [8, 'Пароль должен содержать минимум 8 символов'],
    select: false
  },
  
  passwordConfirm: {
    type: String,
    required: [true, 'Пожалуйста, подтвердите пароль'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Пароли не совпадают'
    }
  },
  
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user'
  },
  
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  
  favorites: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Tour'
  }],
  
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальное поле для отзывов пользователя
userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id'
});

// Middleware для хэширования пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Обновление времени изменения пароля
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Метод для проверки пароля
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Метод для проверки изменения пароля после выдачи токена
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Метод для создания токена сброса пароля
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 минут
  
  return resetToken;
};

// Метод для создания токена верификации email
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

// Query middleware для скрытия неактивных пользователей
userSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;


// Добавляем новые поля в схему пользователя

const userSchema = new mongoose.Schema({
  // ... существующие поля ...
  
  // 2FA и безопасность
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false // Не возвращаем в обычных запросах
  },
  
  twoFactorBackupCodes: [{
    code: {
      type: String,
      select: false
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  
  // OAuth связи
  oauthProviders: [{
    provider: {
      type: String,
      enum: ['google', 'github', 'vk', 'facebook', 'yandex']
    },
    providerId: String,
    profileUrl: String,
    email: String,
    name: String,
    avatar: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date
  }],
  
  // Безопасность
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  lockUntil: {
    type: Date,
    select: false
  },
  
  lastLogin: {
    type: Date,
    select: false
  },
  
  lastLoginIp: {
    type: String,
    select: false
  },
  
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    location: String,
    success: Boolean,
    provider: String
  }],
  
  // Устройства пользователя
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    userAgent: String,
    lastUsed: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  
  // Настройки безопасности
  securitySettings: {
    require2FA: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 3600000 // 1 час
    },
    trustedDevicesEnabled: {
      type: Boolean,
      default: true
    },
    loginNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Шифрованные данные
  encryptedData: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.twoFactorSecret;
      delete ret.twoFactorBackupCodes;
      delete ret.encryptedData;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Виртуальное поле: заблокирован ли пользователь
userSchema.virtual('isLocked').get(function() {
  return this.lockUntil && this.lockUntil > Date.now();
});

// Виртуальное поле: оставшееся время блокировки
userSchema.virtual('lockRemainingTime').get(function() {
  if (!this.lockUntil || this.lockUntil <= Date.now()) return 0;
  return Math.ceil((this.lockUntil - Date.now()) / 1000);
});

// Метод для инкремента неудачных попыток
userSchema.methods.incLoginAttempts = async function() {
  // Сброс попыток, если блокировка истекла
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = process.env.MAX_LOGIN_ATTEMPTS || 5;
  const blockTime = process.env.LOGIN_BLOCK_TIME || 900000;
  
  // Блокируем, если превышен лимит
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + blockTime };
  }
  
  return this.updateOne(updates);
};

// Метод для сброса неудачных попыток
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Метод для добавления в историю входов
userSchema.methods.addLoginHistory = function(entry) {
  this.loginHistory = this.loginHistory || [];
  this.loginHistory.unshift({
    ...entry,
    timestamp: new Date()
  });
  
  // Ограничиваем историю последними 50 входами
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(0, 50);
  }
  
  return this.save({ validateBeforeSave: false });
};

// Метод для добавления доверенного устройства
userSchema.methods.addTrustedDevice = function(deviceData) {
  this.trustedDevices = this.trustedDevices || [];
  
  const device = {
    ...deviceData,
    deviceId: require('crypto').randomBytes(16).toString('hex'),
    lastUsed: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
  };
  
  this.trustedDevices.push(device);
  
  // Ограничиваем количество устройств
  if (this.trustedDevices.length > 10) {
    this.trustedDevices = this.trustedDevices.slice(-10);
  }
  
  return this.save({ validateBeforeSave: false });
};

// Метод для проверки доверенного устройства
userSchema.methods.isTrustedDevice = function(deviceId) {
  if (!this.trustedDevices || !this.trustedDevices.length) return false;
  
  const device = this.trustedDevices.find(d => d.deviceId === deviceId);
  if (!device) return false;
  
  // Проверяем, не истек ли срок
  return device.expiresAt && device.expiresAt > new Date();
};