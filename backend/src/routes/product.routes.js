const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { sellerOnly } = require('../middleware/seller.middleware');

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/:productId/reviews', reviewController.getProductReviews);

router.post('/', protect, sellerOnly, productController.createProduct);
router.put('/:id', protect, sellerOnly, productController.updateProduct);
router.delete('/:id', protect, sellerOnly, productController.deleteProduct);

module.exports = router;
