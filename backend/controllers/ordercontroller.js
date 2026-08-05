const Order = require('../model/Order');
const Product = require('../model/product');
const Payment = require('../model/Payment');
const sendEmail = require('../utils/sendEmail');

//create a new order

const createOrder = async (req, res) =>{
    try{
        const {items, totalAmount, address, paymentId} = req.body;
        const paymentMethod = String(req.body.paymentMethod || 'razorpay').toLowerCase();
        const validItems = Array.isArray(items) && items.length > 0 && items.every((item) =>
            item.ProductId && Number.isFinite(Number(item.quantity)) && Number(item.quantity) >= 1 &&
            Number.isFinite(Number(item.price)) && Number(item.price) >= 0
        );
        const validAddress = address && ['fullName', 'street', 'city', 'postalCode', 'country']
            .every((field) => typeof address[field] === 'string' && address[field].trim());

        if (!['razorpay', 'cod'].includes(paymentMethod) || !validItems || !Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0 || !validAddress || (paymentMethod === 'razorpay' && !paymentId)) {
            return res.status(400).json({message: 'Invalid order data'});
        }
        else{
            const products = await Product.find({ _id: { $in: items.map((item) => item.ProductId) } });
            const productsById = new Map(products.map((product) => [String(product._id), product]));
            const normalizedItems = items.map((item) => {
                const product = productsById.get(String(item.ProductId));
                const quantity = Number(item.quantity);

                if (!product || product.stock < quantity) {
                    return null;
                }

                return { ProductId: product._id, quantity, price: product.price };
            });

            if (normalizedItems.includes(null)) {
                return res.status(400).json({ message: 'One or more products are unavailable in the requested quantity' });
            }

            const calculatedTotal = normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (Math.round(calculatedTotal * 100) !== Math.round(Number(totalAmount) * 100)) {
                return res.status(400).json({ message: 'Order total does not match current product prices' });
            }

            if (paymentMethod === 'razorpay') {
                const payment = await Payment.findOne({ razorpayPaymentId: paymentId, user: req.user._id, verified: true });
                if (!payment || Math.round(payment.amount * 100) !== Math.round(calculatedTotal * 100)) {
                    return res.status(400).json({ message: 'A verified payment for this order total is required' });
                }

                const existingOrder = await Order.findOne({ paymentId });
                if (existingOrder) {
                    return res.status(409).json({ message: 'This payment has already been used for an order' });
                }
            }

            const order = new Order({
                user: req.user._id,
                items: normalizedItems,
                totalAmount: calculatedTotal,
                address,
                paymentId: paymentMethod === 'razorpay' ? paymentId : undefined,
                paymentMethod
            });
            await order.save();
            await Promise.all(normalizedItems.map((item) => Product.updateOne(
                { _id: item.ProductId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            )));
            const message = `Dear ${req.user.name},\n\nThank you for your order! Your order has been successfully created with tha following details:\n\nOrder ID: ${order._id}\nTotal Amount: $${totalAmount}\nShipping Address: ${address}\n\nWe will notify you once your order your order is shipped.\n\nBest regards,\nShopNest Team`;

            try {
                await sendEmail(req.user.email, 'Order Create', message);
            } catch (emailError) {
                // The order is already saved; an email outage must not report a false failed order.
                console.error('Order confirmation email failed:', emailError.message);
            }
            res.status(201).json({message: 'Order created successfully', order});
        }
    } catch(error){
        console.error('Error creating order:', error);
        res.status(500).json({message: 'Error creating order'});
    }
};

const myOrders = async (req, res) =>{
    try{
        const orders = await Order.find({ user: req.user._id }).populate('items.ProductId', 'name price');
        res.json(orders);
    } catch(error){
        res.status(500).json({message: 'Error fetching orders', error});
    }
};

const getOrders = async (req, res) =>{
    try{
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch(error){
        res.status(500).json({message: 'Error fetching orders', error});
    }
};

const updateOrderStatus = async (req, res) =>{
    try{
        const status = String(req.body.status || '').toLowerCase();
        if (!['pending', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({message: 'Invalid order status'});
        }
        const order = await Order.findById(req.params.id);
        if(order){
            order.status = status;
            await order.save();
            res.json({message: 'Order status update', order});
        }
        else{
            res.status(404).json({message: 'Order not found'});
        }
    } catch(error){
        res.status(500).json({message: 'Error updating order status', error});
    }
};

module.exports = {
    createOrder,
    myOrders,
    getOrders,
    updateOrderStatus

};
