const express = require("express");
const {protect} = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');
const {createOrder, getOrders, myOrders, updateOrderStatus} = require("../controllers/ordercontroller");
//const { myOrders } = require("../controllers/ordercontroller");

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/myOrders').get(protect, myOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);


module.exports = router;