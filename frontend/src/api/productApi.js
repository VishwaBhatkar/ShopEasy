import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Unable to connect to server. Please ensure the backend is running.';
    if (error.response?.data?.message) {
      friendlyMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      friendlyMessage = `Cannot reach backend at ${API_BASE_URL}. Ensure the Node.js server is started on port 5000.`;
    } else if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'Request timed out. Please try again.';
    }
    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export const ProductApi = {
  /**
   * Fetch all products or filter by category
   */
  async getProducts(category, search) {
    const params = {};
    if (category && category.toLowerCase() !== 'all') {
      params.category = category;
    }
    if (search) {
      params.search = search;
    }
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Search products by keyword
   */
  async searchProducts(query) {
    const response = await apiClient.get('/products/search', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Fetch single product details
   */
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Trigger backend synchronization with DummyJSON
   */
  async syncProducts() {
    const response = await apiClient.post('/products/sync');
    return response.data;
  },

  /**
   * Place an order (demonstration endpoint)
   */
  async createOrder(orderPayload) {
    const response = await apiClient.post('/orders', orderPayload);
    return response.data;
  }
};

export default ProductApi;
