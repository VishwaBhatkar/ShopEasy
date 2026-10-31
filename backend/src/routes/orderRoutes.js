const express = require('express');
const OrderController = require('../controllers/orderController');

const router = express.Router();

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getOrders);
router.get('/:orderNumber', OrderController.getOrderByNumber);

module.exports = router;
