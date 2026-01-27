import Tour from '../models/tour.model.js';

class TourService {
    constructor() {
        this.tours = this.generateTours();
    }

    generateTours() {
        return [
            new Tour(
                1,
                'Бали, Индонезия',
                'Райский остров с потрясающими пляжами, водопадами и уникальной культурой. Идеально для медового месяца и семейного отдыха.',
                89990,
                10,
                'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Бали',
                'beach',
                4.8,
                ['breakfast', 'flight', 'hotel', 'transfer'],
                true
            ),
            new Tour(
                2,
                'Париж, Франция',
                'Романтическое путешествие в столицу моды и искусства. Посетите Эйфелеву башню, Лувр и пройдитесь по набережной Сены.',
                125000,
                7,
                'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Париж',
                'city',
                4.7,
                ['breakfast', 'hotel', 'excursions'],
                true
            ),
            new Tour(
                3,
                'Пхукет, Таиланд',
                'Тропический рай с кристально чистой водой, белоснежными пляжами и потрясающими закатами.',
                65000,
                12,
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Пхукет',
                'beach',
                4.5,
                ['breakfast', 'flight', 'hotel'],
                true
            ),
            new Tour(
                4,
                'Дубай, ОАЭ',
                'Современный мегаполис в пустыне с небоскребами, роскошными торговыми центрами и эксклюзивными пляжами.',
                110000,
                8,
                'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Дубай',
                'city',
                4.6,
                ['breakfast', 'hotel', 'transfer'],
                false
            ),
            new Tour(
                5,
                'Альпы, Швейцария',
                'Горнолыжный курорт с потрясающими видами, чистым воздухом и отличными трассами для всех уровней.',
                145000,
                9,
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Швейцария',
                'mountain',
                4.9,
                ['breakfast', 'hotel', 'ski-pass'],
                false
            ),
            new Tour(
                6,
                'Киото, Япония',
                'Погрузитесь в традиционную японскую культуру, посетите древние храмы и сады сакуры.',
                135000,
                10,
                'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
                'Киото',
                'cultural',
                4.8,
                ['breakfast', 'hotel', 'excursions'],
                false
            )
        ];
    }

    getAllTours() {
        return this.tours;
    }

    getTourById(id) {
        return this.tours.find(tour => tour.id === parseInt(id));
    }

    getPopularTours() {
        return this.tours.filter(tour => tour.isPopular);
    }

    getToursByCategory(category) {
        if (!category) return this.tours;
        return this.tours.filter(tour => tour.category === category);
    }

    searchTours(query) {
        const searchTerm = query.toLowerCase();
        return this.tours.filter(tour => 
            tour.title.toLowerCase().includes(searchTerm) ||
            tour.location.toLowerCase().includes(searchTerm) ||
            tour.description.toLowerCase().includes(searchTerm)
        );
    }

    getCategories() {
        const categories = [...new Set(this.tours.map(tour => tour.category))];
        return categories.map(category => ({
            id: category,
            name: this.getCategoryName(category)
        }));
    }

    getCategoryName(category) {
        const names = {
            'beach': 'Пляжный отдых',
            'city': 'Городской туризм',
            'mountain': 'Горный отдых',
            'cultural': 'Культурный туризм'
        };
        return names[category] || category;
    }
}

export default TourService;