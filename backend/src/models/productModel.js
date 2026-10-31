const { getPool, isDbConnected, getMemoryStore } = require('../config/db');

class ProductModel {
  /**
   * Retrieve all products with optional category filter
   * @param {Object} options
   * @param {string} [options.category]
   * @param {string} [options.search]
   * @returns {Promise<Array>}
   */
  static async getAll({ category, search } = {}) {
    if (isDbConnected()) {
      const pool = getPool();
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];

      if (category && category.toLowerCase() !== 'all') {
        query += ' AND LOWER(category) = LOWER(?)';
        params.push(category);
      }

      if (search) {
        query += ' AND (LOWER(title) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY id ASC';
      const [rows] = await pool.query(query, params);
      return rows;
    }

    // Fallback in-memory
    let products = [...getMemoryStore().products];
    if (category && category.toLowerCase() !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return products;
  }

  /**
   * Find product by ID
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  static async getById(id) {
    const numericId = Number(id);
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [numericId]);
      return rows.length > 0 ? rows[0] : null;
    }

    return getMemoryStore().products.find(p => p.id === numericId) || null;
  }

  /**
   * Search products by keyword
   * @param {string} keyword 
   * @returns {Promise<Array>}
   */
  static async search(keyword) {
    if (!keyword) return [];
    
    if (isDbConnected()) {
      const pool = getPool();
      const query = `
        SELECT * FROM products 
        WHERE LOWER(title) LIKE LOWER(?) 
           OR LOWER(description) LIKE LOWER(?) 
           OR LOWER(category) LIKE LOWER(?)
        ORDER BY id ASC
      `;
      const term = `%${keyword}%`;
      const [rows] = await pool.query(query, [term, term, term]);
      return rows;
    }

    const q = keyword.toLowerCase();
    return getMemoryStore().products.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  /**
   * Count products in database
   * @returns {Promise<number>}
   */
  static async count() {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
      return rows[0].count;
    }
    return getMemoryStore().products.length;
  }

  /**
   * Synchronize or upsert a list of products
   * @param {Array<Object>} productsList 
   * @returns {Promise<number>}
   */
  static async upsertMany(productsList) {
    if (!Array.isArray(productsList) || productsList.length === 0) {
      return 0;
    }

    if (isDbConnected()) {
      const pool = getPool();
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        for (const item of productsList) {
          const query = `
            INSERT INTO products (id, title, description, price, image, category, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              description = VALUES(description),
              price = VALUES(price),
              image = VALUES(image),
              category = VALUES(category),
              rating = VALUES(rating);
          `;
          await connection.query(query, [
            item.id,
            item.title,
            item.description || '',
            item.price,
            item.image,
            item.category || 'general',
            item.rating || 4.5
          ]);
        }

        await connection.commit();
        return productsList.length;
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    // Fallback store
    const store = getMemoryStore();
    for (const item of productsList) {
      const idx = store.products.findIndex(p => p.id === item.id);
      if (idx >= 0) {
        store.products[idx] = { ...store.products[idx], ...item };
      } else {
        store.products.push(item);
      }
    }
    return productsList.length;
  }

  /**
   * Get distinct categories
   * @returns {Promise<Array<string>>}
   */
  static async getCategories() {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
      return rows.map(r => r.category);
    }
    const cats = new Set(getMemoryStore().products.map(p => p.category));
    return Array.from(cats).sort();
  }
}

module.exports = ProductModel;
