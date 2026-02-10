const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelwave', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log(`✅ MongoDB подключена: ${conn.connection.host}`);
    
    // Создание индексов для производительности
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const collections = await mongoose.connection.db.collections();
    
    // Создание индексов для туров
    const tourSchema = mongoose.models.Tour?.schema;
    if (tourSchema) {
      tourSchema.index({ price: 1, rating: -1 });
      tourSchema.index({ location: '2dsphere' });
      tourSchema.index({ startLocation: '2dsphere' });
      tourSchema.index({ slug: 1 }, { unique: true });
    }
    
    // Создание индексов для пользователей
    const userSchema = mongoose.models.User?.schema;
    if (userSchema) {
      userSchema.index({ email: 1 }, { unique: true });
      userSchema.index({ resetPasswordToken: 1 });
    }
    
    console.log('✅ Индексы MongoDB созданы');
  } catch (error) {
    console.warn('⚠️ Не удалось создать индексы:', error.message);
  }
};

module.exports = connectDB;