const { getPool, isDbConnected, getMemoryStore } = require('../config/db');

class OrderModel {
  /**
   * Create a new order with items
   * @param {Object} orderData 
   * @returns {Promise<Object>}
   */
  static async create(orderData) {
    const {
      orderNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
      itemsCount,
      items
    } = orderData;

    if (isDbConnected()) {
      const pool = getPool();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        const insertOrderSql = `
          INSERT INTO orders 
          (order_number, customer_name, customer_phone, delivery_address, subtotal, delivery_charge, total_amount, items_count, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
        `;

        const [orderResult] = await connection.query(insertOrderSql, [
          orderNumber,
          customerName,
          customerPhone,
          deliveryAddress,
          subtotal,
          deliveryCharge,
          totalAmount,
          itemsCount
        ]);

        const orderId = orderResult.insertId;

        if (Array.isArray(items) && items.length > 0) {
          const insertItemSql = `
            INSERT INTO order_items (order_id, product_id, title, price, quantity, image)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          for (const item of items) {
            await connection.query(insertItemSql, [
              orderId,
              item.id,
              item.title,
              item.price,
              item.quantity || 1,
              item.image || ''
            ]);
          }
        }

        await connection.commit();

        return {
          id: orderId,
          orderNumber,
          customerName,
          totalAmount,
          status: 'Confirmed'
        };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback in-memory
    const memOrder = {
      id: getMemoryStore().orders.length + 1,
      orderNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
      itemsCount,
      status: 'Confirmed',
      items: items || [],
      created_at: new Date().toISOString()
    };
    getMemoryStore().orders.push(memOrder);
    return memOrder;
  }

  /**
   * Get all orders
   * @returns {Promise<Array>}
   */
  static async getAll() {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
      return rows;
    }
    return getMemoryStore().orders;
  }

  /**
   * Get order by order number
   * @param {string} orderNumber 
   * @returns {Promise<Object|null>}
   */
  static async getByOrderNumber(orderNumber) {
    if (isDbConnected()) {
      const pool = getPool();
      const [orders] = await pool.query('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [orderNumber]);
      if (orders.length === 0) return null;

      const order = orders[0];
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
      return order;
    }

    return getMemoryStore().orders.find(o => o.orderNumber === orderNumber) || null;
  }
}

module.exports = OrderModel;
