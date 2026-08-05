const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Product = require('./model/product');
const User = require('./model/User');
const Order = require('./model/Order');

dotenv.config({ path: path.join(__dirname, '.env') });

// These are intentionally public placeholder images, so no Cloudinary upload is needed.
const products = [
    {
        name: 'Classic Cotton T-Shirt',
        description: 'Soft 100% cotton crew-neck T-shirt for everyday comfort.',
        price: 699,
        category: 'Fashion',
        imageUrl: 'https://placehold.co/600x600/1f2937/ffffff?text=Classic+T-Shirt',
        stock: 40,
        rating: 4.4,
        numReviews: 28
    },
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'Over-ear headphones with rich sound, built-in microphone, and 30-hour battery life.',
        price: 2499,
        category: 'Electronics',
        imageUrl: 'https://placehold.co/600x600/111827/ffffff?text=Bluetooth+Headphones',
        stock: 18,
        rating: 4.6,
        numReviews: 52
    },
    {
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated 750 ml bottle that keeps drinks cold or hot for hours.',
        price: 899,
        category: 'Home & Kitchen',
        imageUrl: 'https://placehold.co/600x600/0f766e/ffffff?text=Water+Bottle',
        stock: 55,
        rating: 4.3,
        numReviews: 19
    },
    {
        name: 'Minimalist Wrist Watch',
        description: 'Elegant analogue watch with a durable leather strap and clean dial.',
        price: 3299,
        category: 'Accessories',
        imageUrl: 'https://placehold.co/600x600/7c2d12/ffffff?text=Wrist+Watch',
        stock: 12,
        rating: 4.7,
        numReviews: 35
    },
    {
        name: 'Ergonomic Office Chair',
        description: 'Adjustable mesh office chair with lumbar support for comfortable work days.',
        price: 8499,
        category: 'Furniture',
        imageUrl: 'https://placehold.co/600x600/334155/ffffff?text=Office+Chair',
        stock: 8,
        rating: 4.5,
        numReviews: 16
    },
    {
        name: 'Smart LED Desk Lamp',
        description: 'Touch-controlled LED desk lamp with adjustable brightness and colour temperature.',
        price: 1799,
        category: 'Electronics',
        imageUrl: 'https://placehold.co/600x600/4338ca/ffffff?text=LED+Desk+Lamp',
        stock: 25,
        rating: 4.2,
        numReviews: 21
    },
    {
        name: 'Canvas Travel Backpack',
        description: 'Spacious water-resistant backpack with a padded laptop compartment.',
        price: 2199,
        category: 'Fashion',
        imageUrl: 'https://placehold.co/600x600/92400e/ffffff?text=Travel+Backpack',
        stock: 30,
        rating: 4.5,
        numReviews: 42
    },
    {
        name: 'Ceramic Coffee Mug Set',
        description: 'Set of four modern ceramic mugs, perfect for tea and coffee.',
        price: 1199,
        category: 'Home & Kitchen',
        imageUrl: 'https://placehold.co/600x600/9f1239/ffffff?text=Coffee+Mug+Set',
        stock: 35,
        rating: 4.1,
        numReviews: 13
    }
];

const seedUsers = [
    {
        name: 'ShopNest Admin',
        email: 'admin@shopnest.test',
        password: 'Admin@123',
        role: 'admin',
        verified: true
    },
    {
        name: 'Demo Customer',
        email: 'user@shopnest.test',
        password: 'User@123',
        role: 'user',
        verified: true
    }
];

async function seedDatabase() {
    try {
        await connectDB();

        const savedProducts = await Promise.all(products.map((product) =>
            Product.findOneAndUpdate(
                { name: product.name },
                { $set: product },
                { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
            )
        ));

        const savedUsers = await Promise.all(seedUsers.map(async ({ password, ...user }) => {
            const hashedPassword = await bcrypt.hash(password, 10);

            return User.findOneAndUpdate(
                { email: user.email },
                { $set: { ...user, password: hashedPassword } },
                { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
            );
        }));

        const demoUser = savedUsers.find((user) => user.email === 'user@shopnest.test');
        await Order.findOneAndUpdate(
            { paymentId: 'seed-payment-1001' },
            {
                $set: {
                    user: demoUser._id,
                    items: [
                        { ProductId: savedProducts[0]._id, quantity: 2, price: String(savedProducts[0].price) },
                        { ProductId: savedProducts[1]._id, quantity: 1, price: String(savedProducts[1].price) }
                    ],
                    totalAmount: (savedProducts[0].price * 2) + savedProducts[1].price,
                    address: {
                        fullName: demoUser.name,
                        street: '123 Demo Street',
                        city: 'Mumbai',
                        postalCode: '400001',
                        country: 'India'
                    },
                    paymentId: 'seed-payment-1001',
                    status: 'delivered'
                }
            },
            { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
        );

        console.log(`Seed complete: ${products.length} products, ${seedUsers.length} users, and 1 order inserted or updated.`);
        console.log('Admin login: admin@shopnest.test / Admin@123');
        console.log('User login: user@shopnest.test / User@123');
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

seedDatabase();
