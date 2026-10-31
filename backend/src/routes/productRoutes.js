const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Synchronize products from DummyJSON into MySQL
router.post('/sync', ProductController.syncProducts);

// Search products by query term ?q=phone
router.get('/search', ProductController.searchProducts);

// List all products (with optional ?category= & ?search=)
router.get('/', ProductController.getProducts);

// Get single product by ID
router.get('/:id', ProductController.getProductById);

module.exports = router;
