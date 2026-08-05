const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

//all products
router.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);
//specific product
router.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);


module.exports = router;
