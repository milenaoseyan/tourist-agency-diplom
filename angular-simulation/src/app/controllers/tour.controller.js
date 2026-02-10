const Tour = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Получить все туры с фильтрацией, сортировкой и пагинацией
 */
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const tours = await features.query;
  
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

/**
 * Получить один тур по ID
 */
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  
  if (!tour) {
    return next(new AppError('Тур с таким ID не найден', 404));
  }
  
  // Увеличиваем счетчик просмотров
  tour.views += 1;
  await tour.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

/**
 * Создать новый тур (только для админов)
 */
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

/**
 * Обновить тур по ID (только для админов)
 */
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!tour) {
    return next(new AppError('Тур с таким ID не найден', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

/**
 * Удалить тур по ID (только для админов)
 */
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  
  if (!tour) {
    return next(new AppError('Тур с таким ID не найден', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Получить статистику по турам
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$category',
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

/**
 * Получить топ-5 самых дешевых туров
 */
exports.getTopTours = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'title,price,ratingsAverage,summary,difficulty';
  
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const tours = await features.query;
  
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

/**
 * Поиск туров по геолокации
 */
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
  if (!lat || !lng) {
    return next(new AppError('Пожалуйста, укажите координаты в формате lat,lng', 400));
  }
  
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });
  
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

/**
 * Получить расстояния до туров от указанной точки
 */
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
  if (!lat || !lng) {
    return next(new AppError('Пожалуйста, укажите координаты в формате lat,lng', 400));
  }
  
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        title: 1,
        location: 1,
        price: 1
      }
    }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      distances
    }
  });
});

/**
 * Добавить тур в избранное
 */
exports.addToFavorites = catchAsync(async (req, res, next) => {
  const user = req.user;
  const tourId = req.params.id;
  
  if (user.favorites.includes(tourId)) {
    return next(new AppError('Тур уже в избранном', 400));
  }
  
  user.favorites.push(tourId);
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    message: 'Тур добавлен в избранное',
    data: {
      favorites: user.favorites
    }
  });
});

/**
 * Удалить тур из избранного
 */
exports.removeFromFavorites = catchAsync(async (req, res, next) => {
  const user = req.user;
  const tourId = req.params.id;
  
  if (!user.favorites.includes(tourId)) {
    return next(new AppError('Тур не найден в избранном', 400));
  }
  
  user.favorites = user.favorites.filter(id => id.toString() !== tourId);
  await user.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    message: 'Тур удален из избранного',
    data: {
      favorites: user.favorites
    }
  });
});

/**
 * Получить избранные туры пользователя
 */
exports.getFavoriteTours = catchAsync(async (req, res, next) => {
  const user = await req.user.populate('favorites');
  
  res.status(200).json({
    status: 'success',
    results: user.favorites.length,
    data: {
      tours: user.favorites
    }
  });
});