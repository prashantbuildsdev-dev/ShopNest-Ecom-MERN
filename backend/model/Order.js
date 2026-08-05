const mongoose = require('mongoose');
const Product = require('./product');

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    items:[
        {
            ProductId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required:true, min: 1},
            price: {type: Number, required: true, min: 0}
        }
    ],
    totalAmount: {type: Number, required: true},
    address:{
        fullName: {type: String, required: true},
        street: {type: String, required: true},
        city: {type: String, required: true},
        postalCode: {type: String, required: true},
        country: {type: String, required:true}
    },
    paymentId: {type: String},
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    status: {type: String, enum:['pending', 'shipped', 'delivered'], default: 'pending'}
}, {timestamps: true});

module.exports = mongoose.model('order', orderSchema);
