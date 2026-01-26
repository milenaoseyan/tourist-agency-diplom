import Tour from '../models/tour.model.js';

class TourService {
    constructor() {
        this.tours = [
            new Tour(
                1,
                'Бали, Индонезия',
                'Райский остров с потрясающими пляжами и культурой',
                89990,
                10,
                'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Бали'
            ),
            new Tour(
                2,
                'Париж, Франция',
                'Романтическое путешествие в столицу моды и искусства',
                125000,
                7,
                'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Париж'
            ),
            new Tour(
                3,
                'Пхукет, Таиланд',
                'Тропический рай с кристально чистой водой',
                65000,
                12,
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Пхукет'
            ),
            new Tour(
                4,
                'Дубай, ОАЭ',
                'Современный мегаполис в пустыне',
                110000,
                8,
                'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Дубай'
            )
        ];
    }

    getAllTours() {
        return this.tours;
    }

    getTourById(id) {
        return this.tours.find(tour => tour.id === id);
    }
}

export default TourService;