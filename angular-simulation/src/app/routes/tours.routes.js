const express = require('express');
const tourController = require('../controllers/tour.controller');
const authController = require('../controllers/auth.controller');
const reviewRouter = require('./reviews.routes');

const router = express.Router();

// Перенаправление маршрутов отзывов
router.use('/:tourId/reviews', reviewRouter);

// Публичные маршруты
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.createTour
  );

router
  .route('/top-5-tours')
  .get(tourController.getTopTours, tourController.getAllTours);

router
  .route('/stats')
  .get(tourController.getTourStats);

router
  .route('/within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

// Маршруты с аутентификацией
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

// Маршруты избранного
router
  .route('/:id/favorite')
  .post(
    authController.protect,
    tourController.addToFavorites
  )
  .delete(
    authController.protect,
    tourController.removeFromFavorites
  );

router
  .route('/me/favorites')
  .get(
    authController.protect,
    tourController.getFavoriteTours
  );

module.exports = router;