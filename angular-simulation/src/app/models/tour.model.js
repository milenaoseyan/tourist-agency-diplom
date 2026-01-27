class Tour {
    constructor(id, title, description, price, duration, image, location, 
                category, rating, includes = [], isPopular = false) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.duration = duration;
        this.image = image;
        this.location = location;
        this.category = category; // 'beach', 'mountain', 'city', 'cultural'
        this.rating = rating; // от 1 до 5
        this.includes = includes; // ['breakfast', 'flight', 'hotel']
        this.isPopular = isPopular;
    }
}

export default Tour;