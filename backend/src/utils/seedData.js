const axios = require('axios');
const ProductModel = require('../models/productModel');
const UserModel = require('../models/userModel');
const { hashPassword } = require('./authUtils');

const DUMMYJSON_URL = process.env.DUMMYJSON_API_URL || 'https://dummyjson.com/products';

/**
 * Automatically populates the database on first run if products table is empty
 */
async function autoSeedIfEmpty() {
  try {
    const count = await ProductModel.count();
    if (count === 0) {
      console.log('[AutoSeed] Database is empty. Synchronizing initial products from DummyJSON...');
      const response = await axios.get(`${DUMMYJSON_URL}?limit=40`);
      const remoteProducts = response.data?.products || [];

      if (remoteProducts.length > 0) {
        const formatted = remoteProducts.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          price: Math.round(Number(p.price || 0) * 83), // Convert to INR
          image: p.thumbnail || (p.images && p.images[0]) || 'https://via.placeholder.com/300',
          category: p.category || 'general',
          rating: Number(p.rating || 4.5)
        }));

        await ProductModel.upsertMany(formatted);
        console.log(`[AutoSeed] Successfully populated ${formatted.length} products.`);
      }
    } else {
      console.log(`[AutoSeed] Database already has ${count} products. Ready!`);
    }
  } catch (error) {
    console.warn(`[AutoSeed Warning] Could not auto-sync products: ${error.message}`);
  }

  // Seed demo user account
  try {
    const demoUser = await UserModel.findByEmail('demo@shopeasy.com');
    if (!demoUser) {
      await UserModel.create({
        name: 'Rahul Sharma',
        email: 'demo@shopeasy.com',
        password_hash: hashPassword('password123'),
        phone: '+91 98765 43210',
        address: 'Flat 402, Green Glen Heights, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103'
      });
      console.log('[AutoSeed] Demo user created: demo@shopeasy.com (Password: password123)');
    }
  } catch (err) {
    console.warn(`[AutoSeed Warning] Could not seed demo user: ${err.message}`);
  }
}

module.exports = { autoSeedIfEmpty };
