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