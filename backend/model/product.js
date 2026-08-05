const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageURL: { type: String },
    secureUrl: { type: String },
    cloudinaryPublicId: { type: String },
    stock: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, {
    timestamps: true
});

productSchema.pre('validate', function syncProductImageFields() {
    const imageUrl = this.imageUrl || this.imageURL || this.image || this.secureUrl;

    if (imageUrl) {
        this.image = imageUrl;
        this.imageUrl = imageUrl;
        this.imageURL = imageUrl;
        this.secureUrl = imageUrl;
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
