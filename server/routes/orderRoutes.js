const express = require('express');
const { body } = require('express-validator');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  getTopSellingItems
} = require('../controllers/orderController');

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  
  body('items.*.menuItem')
    .isMongoId()
    .withMessage('Valid menu item ID is required for each item'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99 for each item'),
  
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ max: 100 })
    .withMessage('Customer name cannot exceed 100 characters'),
  
  body('tableNumber')
    .isInt({ min: 1, max: 99 })
    .withMessage('Table number must be between 1 and 99')
];

const validateOrderStatus = [
  body('status')
    .isIn(['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Preparing, Ready, Delivered, Cancelled')
];

// @route   GET /api/orders
// @desc    Get all orders with pagination and status filter
// @access  Public
router.get('/', getOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Public
router.get('/stats', getOrderStats);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public
router.get('/:id', getOrderById);

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', validateOrder, createOrder);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Public
router.patch('/:id/status', validateOrderStatus, updateOrderStatus);

// Analytics routes
// @route   GET /api/analytics/top-sellers
// @desc    Get top selling menu items
// @access  Public
router.get('/analytics/top-sellers', getTopSellingItems);

module.exports = router;
