const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Тур должен иметь название'],
    unique: true,
    trim: true,
    maxlength: [100, 'Название не может быть длиннее 100 символов'],
    minlength: [10, 'Название должно содержать минимум 10 символов']
  },
  
  slug: String,
  
  description: {
    type: String,
    required: [true, 'Тур должен иметь описание'],
    trim: true,
    maxlength: [2000, 'Описание не может быть длиннее 2000 символов']
  },
  
  summary: {
    type: String,
    trim: true,
    maxlength: [300, 'Краткое описание не может быть длиннее 300 символов']
  },
  
  location: {
    type: String,
    required: [true, 'Тур должен иметь локацию']
  },
  
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
  }],
  
  duration: {
    type: Number,
    required: [true, 'Тур должен иметь длительность']
  },
  
  maxGroupSize: {
    type: Number,
    required: [true, 'Тур должен иметь максимальный размер группы']
  },
  
  difficulty: {
    type: String,
    required: [true, 'Тур должен иметь уровень сложности'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Сложность должна быть: easy, medium или difficult'
    }
  },
  
  price: {
    type: Number,
    required: [true, 'Тур должен иметь цену']
  },
  
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price;
      },
      message: 'Скидка ({VALUE}) должна быть ниже обычной цены'
    }
  },
  
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Рейтинг должен быть от 1.0'],
    max: [5, 'Рейтинг должен быть до 5.0'],
    set: val => Math.round(val * 10) / 10
  },
  
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  
  images: [String],
  imageCover: {
    type: String,
    required: [true, 'Тур должен иметь обложку']
  },
  
  startDates: [Date],
  
  category: {
    type: String,
    required: [true, 'Тур должен иметь категорию'],
    enum: {
      values: ['beach', 'city', 'mountain', 'cultural', 'adventure', 'wellness'],
      message: 'Категория должна быть: beach, city, mountain, cultural, adventure или wellness'
    }
  },
  
  includes: [String],
  excludes: [String],
  
  itinerary: [{
    day: {
      type: Number,
      required: [true, 'День должен иметь номер']
    },
    title: {
      type: String,
      required: [true, 'День должен иметь заголовок']
    },
    description: {
      type: String,
      required: [true, 'День должен иметь описание']
    },
    accommodation: String,
    meals: [String],
    activities: [String]
  }],
  
  guides: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  bookingsCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальное поле для отзывов
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Виртуальное поле для длительности в неделях
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Middleware для создания slug перед сохранением
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Query middleware для скрытия неактивных туров
tourSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Query middleware для populate гидов
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// Агрегация для расчета рейтинга
tourSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { _id: tourId }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'tour',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        ratingsQuantity: { $size: '$reviews' },
        ratingsAverage: { $avg: '$reviews.rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].ratingsQuantity,
      ratingsAverage: stats[0].ratingsAverage || 4.5
    });
  }
};

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;