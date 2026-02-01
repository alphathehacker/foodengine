import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add authentication token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          error.message = data.message || 'Bad Request - Invalid data provided';
          break;
        case 401:
          error.message = data.message || 'Unauthorized - Please login again';
          // Handle logout if needed
          // localStorage.removeItem('token');
          break;
        case 403:
          error.message = data.message || 'Forbidden - You don\'t have permission';
          break;
        case 404:
          error.message = data.message || 'Not Found - Resource not found';
          break;
        case 500:
          error.message = data.message || 'Server Error - Please try again later';
          break;
        default:
          error.message = data.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'Network Error - Please check your internet connection';
    } else {
      // Something else happened
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// Menu API methods
export const menuAPI = {
  // Get all menu items with optional filters
  getMenuItems: (params = {}) => api.get('/menu', { params }),
  
  // Search menu items
  searchMenuItems: (query, params = {}) => api.get('/menu/search', { params: { q: query, ...params } }),
  
  // Get single menu item
  getMenuItemById: (id) => api.get(`/menu/${id}`),
  
  // Create new menu item
  createMenuItem: (data) => api.post('/menu', data),
  
  // Update menu item
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  
  // Delete menu item
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  
  // Toggle availability
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`),
};

// Order API methods
export const orderAPI = {
  // Get all orders with optional filters
  getOrders: (params = {}) => api.get('/orders', { params }),
  
  // Get order statistics
  getOrderStats: () => api.get('/orders/stats'),
  
  // Get single order
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  // Create new order
  createOrder: (data) => api.post('/orders', data),
  
  // Update order status
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  
  // Get top selling items
  getTopSellingItems: (limit = 5) => api.get('/orders/analytics/top-sellers', { params: { limit } }),
};

// Utility function to handle API errors consistently
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  console.error('API Error:', error);
  return message;
};

// Export the default axios instance for custom requests
export default api;
