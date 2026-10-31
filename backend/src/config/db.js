const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isConnected = false;

// Fallback in-memory store in case MySQL server is temporarily stopped
const memoryStore = {
  products: [],
  orders: [],
  users: []
};

/**
 * Initializes MySQL Database and Tables
 */
const initDB = async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shopeasy_db';

  try {
    // 1. First connect without selecting database to ensure it exists
    const adminConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 4000
    });

    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await adminConnection.end();

    // 2. Create the connection pool with the database selected
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000
    });

    // 3. Create products table if not exists
    const createProductsTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        image VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'general',
        rating DECIMAL(3, 2) NOT NULL DEFAULT 4.50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_title (title)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createProductsTableQuery);

    // 4. Create orders table if not exists
    const createOrdersTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        customer_name VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10, 2) NOT NULL,
        items_count INT NOT NULL DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createOrdersTableQuery);

    // 5. Create order_items table if not exists
    const createOrderItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        image VARCHAR(500),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createOrderItemsTableQuery);

    // 6. Create users table if not exists
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT '',
        address TEXT,
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(createUsersTableQuery);

    isConnected = true;
    console.log(`[Database] Connected successfully to MySQL database "${database}".`);
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] Unable to connect to MySQL (${error.message}).`);
    console.warn('[Database Notice] ShopEasy will automatically utilize cached/in-memory store until MySQL is connected.');
  }
};

const getPool = () => pool;
const isDbConnected = () => isConnected;
const getMemoryStore = () => memoryStore;

module.exports = {
  initDB,
  getPool,
  isDbConnected,
  getMemoryStore
};
