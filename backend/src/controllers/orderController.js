const OrderModel = require('../models/orderModel');

class OrderController {
  /**
   * POST /api/orders
   * Place a new demonstration order
   */
  static async createOrder(req, res, next) {
    try {
      const {
        customerName = 'Guest Customer',
        customerPhone = '+91 98765 43210',
        deliveryAddress = '42 MG Road, Bengaluru, Karnataka 560001',
        subtotal,
        deliveryCharge = 0,
        totalAmount,
        items = []
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart cannot be empty when placing an order.'
        });
      }

      if (subtotal === undefined || totalAmount === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Subtotal and Total Amount are required.'
        });
      }

      // Generate clean unique order reference
      const timestamp = Date.now().toString().slice(-6);
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `SE-ORD-${timestamp}-${randomCode}`;

      const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      const createdOrder = await OrderModel.create({
        orderNumber,
        customerName,
        customerPhone,
        deliveryAddress,
        subtotal: Number(subtotal),
        deliveryCharge: Number(deliveryCharge),
        totalAmount: Number(totalAmount),
        itemsCount,
        items
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        data: createdOrder
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   * Fetch orders history
   */
  static async getOrders(req, res, next) {
    try {
      const orders = await OrderModel.getAll();
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:orderNumber
   */
  static async getOrderByNumber(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const order = await OrderModel.getByOrderNumber(orderNumber);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order #${orderNumber} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
