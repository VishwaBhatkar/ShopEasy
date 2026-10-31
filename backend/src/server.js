const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDB } = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/seedData');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Root route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'ShopEasy REST API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      products: '/api/products',
      productSearch: '/api/products/search?q=phone',
      productDetails: '/api/products/:id',
      productSync: 'POST /api/products/sync',
      orders: '/api/orders',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      authProfile: 'GET /api/auth/profile',
      authLogout: 'POST /api/auth/logout'
    }
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Server Startup
async function startServer() {
  try {
    // 1. Initialize database connection & tables
    await initDB();

    // 2. Auto-seed products if database has no records yet
    await autoSeedIfEmpty();

    // 3. Start listening for incoming connections
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`🚀 ShopEasy Backend Server is running!`);
      console.log(`📍 Local URL: http://localhost:${PORT}`);
      console.log(`📦 Products Endpoint: http://localhost:${PORT}/api/products`);
      console.log(`===============================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start if executed directly
if (require.main === module) {
  startServer();
}

module.exports = app;
