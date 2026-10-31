const axios = require('axios');
const ProductModel = require('../models/productModel');

const DUMMYJSON_URL = process.env.DUMMYJSON_API_URL || 'https://dummyjson.com/products';

/**
 * Controller for handling product-related requests
 */
class ProductController {
  /**
   * GET /api/products
   * Fetch all products with optional filters (?category=beauty&search=phone)
   */
  static async getProducts(req, res, next) {
    try {
      const { category, search } = req.query;
      const products = await ProductModel.getAll({ category, search });
      const categories = await ProductModel.getCategories();

      return res.status(200).json({
        success: true,
        count: products.length,
        categories: ['all', ...categories],
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/search?q=phone
   * Search products by title, description or category
   */
  static async searchProducts(req, res, next) {
    try {
      const query = (req.query.q || '').trim();

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required for searching products.'
        });
      }

      const products = await ProductModel.search(query);

      return res.status(200).json({
        success: true,
        query,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Fetch a single product by its ID
   */
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided.'
        });
      }

      const product = await ProductModel.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products/sync
   * Fetch products from DummyJSON public API and synchronize them into MySQL
   */
  static async syncProducts(req, res, next) {
    try {
      console.log(`[Product Sync] Fetching products from ${DUMMYJSON_URL}...`);
      const response = await axios.get(`${DUMMYJSON_URL}?limit=50`);
      
      const remoteProducts = response.data?.products || [];

      if (!Array.isArray(remoteProducts) || remoteProducts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No products were returned from the public DummyJSON API.'
        });
      }

      // Transform dummyjson items to ShopEasy format with INR conversion
      // 1 USD approx 83 INR
      const formattedProducts = remoteProducts.map(p => {
        const inrPrice = Math.round(Number(p.price || 0) * 83);
        const imageUrl = p.thumbnail || (p.images && p.images[0]) || 'https://via.placeholder.com/300';
        return {
          id: p.id,
          title: p.title,
          description: p.description || '',
          price: inrPrice,
          image: imageUrl,
          category: p.category || 'general',
          rating: Number(p.rating || 4.5)
        };
      });

      const count = await ProductModel.upsertMany(formattedProducts);

      return res.status(200).json({
        success: true,
        message: `Successfully synchronized ${count} products into MySQL database.`,
        count,
        sample: formattedProducts.slice(0, 3)
      });
    } catch (error) {
      console.error('[Product Sync Error]', error.message);
      return res.status(500).json({
        success: false,
        message: `Failed to synchronize products: ${error.message}`
      });
    }
  }
}

module.exports = ProductController;
