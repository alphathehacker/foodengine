const express = require('express');
const { body } = require('express-validator');
const {
  getMenuItems,
  searchMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require('../controllers/menuController');

const router = express.Router();

// Validation middleware
const validateMenuItem = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .isIn(['Appetizer', 'Main Course', 'Dessert', 'Beverage'])
    .withMessage('Category must be one of: Appetizer, Main Course, Dessert, Beverage'),
  
  body('price')
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be between 0 and 9999.99'),
  
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array')
    .custom((ingredients) => {
      if (ingredients.length === 0) return false;
      return ingredients.every(ingredient => 
        typeof ingredient === 'string' && ingredient.trim().length > 0
      );
    })
    .withMessage('Ingredients array must contain non-empty strings'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),
  
  body('imageUrl')
    .optional()
    .custom((value) => {
      // Allow empty strings
      if (!value || value.trim() === '') return true;
      
      // Check if it's a valid URL or relative path
      try {
        // Try to create a URL object
        new URL(value);
        return true;
      } catch {
        // If not a valid URL, check if it's a relative path
        if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
          return true;
        }
        // Allow common image URL patterns that might not pass URL validation
        if (value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          return true;
        }
        return false;
      }
    })
    .withMessage('Image URL must be a valid URL or relative path')
];

const validateMenuItemUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['Appetizer', 'Main Course', 'Dessert', 'Beverage'])
    .withMessage('Category must be one of: Appetizer, Main Course, Dessert, Beverage'),
  
  body('price')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be between 0 and 9999.99'),
  
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array')
    .custom((ingredients) => {
      if (ingredients.length === 0) return false;
      return ingredients.every(ingredient => 
        typeof ingredient === 'string' && ingredient.trim().length > 0
      );
    })
    .withMessage('Ingredients array must contain non-empty strings'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),
  
  body('imageUrl')
    .optional()
    .custom((value) => {
      // Allow empty strings
      if (!value || value.trim() === '') return true;
      
      // Check if it's a valid URL or relative path
      try {
        // Try to create a URL object
        new URL(value);
        return true;
      } catch {
        // If not a valid URL, check if it's a relative path
        if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
          return true;
        }
        // Allow common image URL patterns that might not pass URL validation
        if (value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          return true;
        }
        return false;
      }
    })
    .withMessage('Image URL must be a valid URL or relative path')
];

// @route   GET /api/menu
// @desc    Get all menu items with filters
// @access  Public
router.get('/', getMenuItems);

// @route   GET /api/menu/search
// @desc    Search menu items using text search
// @access  Public
router.get('/search', searchMenuItems);

// @route   GET /api/menu/:id
// @desc    Get single menu item by ID
// @access  Public
router.get('/:id', getMenuItemById);

// @route   POST /api/menu
// @desc    Create new menu item
// @access  Public
router.post('/', validateMenuItem, createMenuItem);

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Public
router.put('/:id', validateMenuItemUpdate, updateMenuItem);

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Public
router.delete('/:id', deleteMenuItem);

// @route   PATCH /api/menu/:id/availability
// @desc    Toggle menu item availability
// @access  Public
router.patch('/:id/availability', toggleAvailability);

module.exports = router;
