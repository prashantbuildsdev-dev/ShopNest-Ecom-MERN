const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require('../model/Payment');

const hasRazorpayCredentials = () => {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};


const createOrder = async (req, res) =>{
    try{
        if (!hasRazorpayCredentials()) {
            return res.status(503).json({
                message: "Payment service is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
            });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: "A valid payment amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        };

        const order = await instance.orders.create(options);
        await Payment.create({
            user: req.user._id,
            razorpayOrderId: order.id,
            amount
        });
        res.status(200).json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
    } catch (error){
        console.error("Unable to create Razorpay order:", error.message);
        res.status(502).json({message: "Payment provider could not create an order. Check your Razorpay test keys."});
    }
};

const verifyPayment = async (req, res) =>{
    try{
        if (!hasRazorpayCredentials()) {
            return res.status(503).json({
                message: "Payment service is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Payment verification details are required" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if(generatedSignature === razorpay_signature){
            const payment = await Payment.findOne({
                razorpayOrderId: razorpay_order_id,
                user: req.user._id
            });

            if (!payment) {
                return res.status(400).json({ message: 'Payment order is invalid for this account' });
            }

            if (payment.verified && payment.razorpayPaymentId !== razorpay_payment_id) {
                return res.status(409).json({ message: 'Payment order has already been used' });
            }

            payment.verified = true;
            payment.razorpayPaymentId = razorpay_payment_id;
            await payment.save();
            res.status(200).json({message: "Payment verified successfully"});
        } else{
            res.status(400).json({message: "Payment verification failed"});
        }
    } catch(error){
        console.error("Unable to verify Razorpay payment:", error.message);
        res.status(500).json({message: "Payment verification could not be completed"});
    }
};


module.exports = {createOrder, verifyPayment};
